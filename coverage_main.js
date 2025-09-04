const coverageGlobals = {
  addingMarker: false,
  pendingName: null,
  defaultMarkerMetadata: {
    description: "",
    createdAt: null,
    sectorAzimuthWidth: 90,
    sectorAzimuthHeading: 90,
    sectorElevationHeight: 30,
    sectorElevationAngle: 20,
    sectorHeight: 5,
    radius: [{ value: 5, color: [0, 0, 255], transparency: 0.5, label: "5 km" }],
  },
  newMarkerMetadata: {},
  steeringMarker: null,
  coveragePolygons: [],
};

const coveragePolygonType = {
  title: "",
  color: null,
  transparency: null,
  polygon: null,
};


function initMap() {
  // Initialize MapManager
  const mapManager = new MapManager('map', { lat: 40.7128, lng: -74.006 }, 12);
  window.myMapManager = mapManager; // Global variable

  const myModal = new ModalManager();
  window.myModal = myModal; // Global variable

  // Button in your sidebar
  const addMarkerButton = document.getElementById('addMarkerButton');
  addMarkerButton.addEventListener('click', () => {

    const name = prompt("Enter a name for the new marker:");
    if (name && name.trim() !== "") {
      coverageGlobals.pendingMarkerName = name.trim();
      coverageGlobals.addingMarker = true;
    }

    // Make any new makers use the default metadata
    coverageGlobals.newMarkerMetadata = structuredClone(coverageGlobals.defaultMarkerMetadata);


    addMarkerButton.disabled = true; // optional: disable while waiting for click
    addMarkerButton.textContent = 'Click on map to place marker';
  });

  myMapManager.setMapClickListener((latLng) => {
    if (!coverageGlobals.addingMarker) return;

    // Create the marker at the clicked location
    const marker = myMapManager.addMarker({
      title: coverageGlobals.pendingMarkerName || 'New Marker',
      position: latLng,
      draggable: true,
      onDragEnd: (newPos, markerRef) => {
        updateMarkerInfo(markerRef, newPos);
      },
      onClick: (markerRef) => {
        console.log('Marker clicked:', markerRef.getTitle());
        displayMarkerProperties(markerRef); // Show properties in sidebar
      },
    });



    marker.coverageMetadata = structuredClone(coverageGlobals.newMarkerMetadata);
    marker.coverageMetadata.createdAt = new Date().toISOString();
    displayMarkerProperties(marker)


    // Disable adding mode immediately after placing the marker
    coverageGlobals.addingMarker = false;
    addMarkerButton.disabled = false;
    addMarkerButton.textContent = 'Add Marker';
    updateUI();


    /*const contentDiv = document.getElementById('dynamicContent');
    const markerDiv = document.createElement('div');
    markerDiv.className = 'marker-info';
    markerDiv.id = 'marker-' + marker.getLabel();
    contentDiv.appendChild(markerDiv);
    */
    updateMarkerInfo(marker, latLng);


  });



  // Open modal when generating report
  document.getElementById("generateReportBtn").addEventListener("click", () => {
    const modalContentDiv = myModal.getContentDiv();
    modalContentDiv.innerHTML = ""; // Clear previous content
    modalContentDiv.innerHTML = "<h2>Scenario Analysis</h2>";
    modalContentDiv.innerHTML += generateMarkerReport();
    modalContentDiv.innerHTML += generateOverlapReport();
    myModal.showModal();

  });

  document.getElementById("coveragePolygonsBtn").addEventListener("click", () => {
    const modalContentDiv = myModal.getContentDiv();
    modalContentDiv.innerHTML = ""; // Clear previous content

    // Container that will hold map + sidebar
    const container = document.createElement("div");
    container.id = "modal-container";
    modalContentDiv.appendChild(container);

    // Map div
    const mapDiv = document.createElement("div");
    mapDiv.id = "modal-map";
    container.appendChild(mapDiv);

    // Sidebar div
    const sidebarDiv = document.createElement("div");
    sidebarDiv.id = "modal-sidebar";
    sidebarDiv.innerHTML = "<h2>Coverage Polygons</h2>";
    container.appendChild(sidebarDiv);

    const modalMapManager = new MapManager(mapDiv.id, { lat: 40.7128, lng: -74.006 }, 12);



    polygonMenu(coverageGlobals.coveragePolygons, myMapManager.getMarkers(), sidebarDiv);

    // console.log(modalMapManager.map);
    // google.maps.event.trigger(modalMapManager.map, "resize");
    // modalMapManager.map.setCenter({ lat: -33.8688, lng: 151.2093 }); // Recenter the map after resizing

    myModal.showModal();

    // Allow browser to paint modal, then trigger resize
    setTimeout(() => {
      google.maps.event.trigger(modalMapManager.map, "resize");
      /*
      const existingMarkers = myMapManager.getMarkers();
      if(existingMarkers.length > 0)
      {
        modalMapManager.setZoomOnMarkerBounds(myMapManager.getMarkers());
      }
        */

      modalMapManager.map.setCenter(myMapManager.map.getCenter());
      modalMapManager.map.setZoom(myMapManager.map.getZoom());

    }, 200);

  });




  // Add an event listener to the save button
  // This function lives in the coveragehelper.js file
  document.getElementById("saveCoverageBtn").addEventListener("click", () => {
    saveCoverageSettingsJSON(myMapManager.getMarkers() || []); // assumes markers are in global `markers` array
  });

}

function updateUI() {
  refreshMarkerList();
}


// --- UI update ---
function refreshMarkerList() {
  console.log('Refreshing marker list');
  const list = document.getElementById("markerList");
  if (!list) return;

  list.innerHTML = ""; // clear existing

  myMapManager.getMarkers().forEach((mObj, idx) => {
    const item = document.createElement("div");
    item.className = "marker-entry";

    // Marker title
    const label = document.createElement("span");
    label.textContent = mObj.getTitle();
    label.style.marginRight = "8px";

    // Delete button
    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.addEventListener("click", () => {
      // Remove polygons
      if (mObj.segmentPoygons) {
        mObj.segmentPoygons.forEach(p => p.setMap(null));
      }

      // Remove from globals
      myMapManager.deleteMarker(idx);
      refreshMarkerList();
    });

    // Copy button
    const copyBtn = document.createElement("button");
    copyBtn.textContent = "Copy";
    copyBtn.style.marginLeft = "4px";
    copyBtn.addEventListener("click", () => {
      const name = prompt("Enter a name for the new marker:");
      if (name && name.trim() !== "") {
        coverageGlobals.pendingMarkerName = name.trim();
        coverageGlobals.addingMarker = true;
        coverageGlobals.newMarkerMetadata = structuredClone(mObj.coverageMetadata);
        console.log("Copied metadata:", coverageGlobals.newMarkerMetadata);

      }


    });

    // Edit button
    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.style.marginLeft = "4px";
    editBtn.addEventListener("click", () => {

      displayMarkerProperties(mObj)


    });

    item.appendChild(label);
    item.appendChild(delBtn);
    item.appendChild(copyBtn);
    item.appendChild(editBtn);
    list.appendChild(item);
  });
}

// Function to update marker info in sidebar
function updateMarkerInfo(marker, newPos) {
  marker.setPosition(newPos);
  drawCoverageWedgesForMarker(marker);
  showHeadingHelper(marker);


}



// Main function
function displayMarkerProperties(marker) {

  showHeadingHelper(marker);

  console.log("displayMarkerProperties called", marker.getTitle());

  const titleDiv = document.getElementById('propertiesTitle');
  titleDiv.innerHTML = `<h3>Item Properties For: ${marker.getTitle()}<h3>`;

  const propertiesDiv = document.getElementById('propertiesContent');
  const metadata = marker.coverageMetadata;

  let html = "";

  const pos = marker.getPosition();
  const lat = pos.lat();
  const lng = pos.lng();

  html += `
        <label>
            Title:
            <input id="markerTitleInput" type="text" value="${marker.title || ""}">
        </label>
        <br>
        <label>
            Latitude:
            <input id="markerLatInput" type="number" step="any" value="${lat.toFixed(5)}">
        </label>
        <br>
        <label>
            Longitude:
            <input id="markerLngInput" type="number" step="any" value="${lng.toFixed(5)}">
        </label>
        `;


  // Build description
  html += `
    <label>Description:</label>
    <textarea id="descInput" rows="3">${metadata.description || ''}</textarea>
  `;

  // Numeric fields with friendly labels
  const numericFields = [
    { key: 'sectorAzimuthWidth', label: 'Azimuth Width (°)' },
    { key: 'sectorAzimuthHeading', label: 'Azimuth Heading (°)' },
    { key: 'sectorElevationHeight', label: 'Elevation Height (°)' },
    { key: 'sectorElevationAngle', label: 'Elevation Angle (°)' },
    { key: 'sectorHeight', label: 'Height AGL (m)' }
  ];

  numericFields.forEach(field => {
    html += `
      <div class="numeric-field">
        <label>${field.label}</label>
        <input type="number" id="${field.key}Input" value="${metadata[field.key] || 0}" min="0" max="360">
      </div>
    `;
  });

  html += `<br><label>Radius Segments (km):</label><br>`;

  // Initialize radius array
  metadata.radius = metadata.radius || [];

  metadata.radius.forEach((r, idx) => {
    const colorHex = rgbToHex(r.color[0], r.color[1], r.color[2]);
    const transparencyPercent = Math.round((r.transparency || 0) * 100);

    html += `
      <div class="radius-group" id="radiusDiv${idx}">
        <label><strong>Radius ${idx + 1}</strong></label>
        <label>Label:</label>
        <input type="text" id="radiusLabel${idx}" value="${r.label || ''}">

        <label>Value (km):</label>
        <input type="number" id="radiusValue${idx}" value="${r.value}" min="0">
        
        <label>Color:</label>
        <input type="color" id="radiusColor${idx}" value="${colorHex}">
        
        <label>Transparency:</label>
        <input type="range" id="radiusT${idx}" min="0" max="100" value="${transparencyPercent}">
        <span id="radiusTLabel${idx}">${transparencyPercent}%</span><br>
        
        <button onclick="deleteRadius(${idx})">Delete Radius</button>
      </div>
    `;
  });

  if (metadata.radius.length < 5) {
    html += `<button id="addRadiusButton">Add Radius</button>`;
  }

  html += `<br><br><button id="updateMarkerButton">Update Marker</button> `;
  html += `<button id="updateCancelButton">Cancel</button>`;


  propertiesDiv.innerHTML = html;

  // Setup transparency sliders
  metadata.radius.forEach((r, idx) => {
    const slider = document.getElementById(`radiusT${idx}`);
    const label = document.getElementById(`radiusTLabel${idx}`);
    slider.addEventListener('input', () => {
      label.textContent = slider.value + "%";
    });
  });

  // Add radius button
  const addRadiusBtn = document.getElementById('addRadiusButton');
  if (addRadiusBtn) {
    addRadiusBtn.addEventListener('click', () => {
      if (metadata.radius.length < 5) {
        const lastValue = metadata.radius.length
          ? metadata.radius[metadata.radius.length - 1].value
          : 0;
        const newValue = lastValue + 1;

        metadata.radius.push({
          value: newValue,
          label: `Radius ${metadata.radius.length + 1}`,
          color: [getRandomColor(), getRandomColor(), getRandomColor()],
          transparency: coverageGlobals.defaultMarkerMetadata.radius[0].transparency,
        });

        displayMarkerProperties(marker);
      }
    });
  }

  // Delete radius
  window.deleteRadius = function (idx) {
    metadata.radius.splice(idx, 1);
    displayMarkerProperties(marker);
  };

  // Update marker metadata
  document.getElementById('updateCancelButton').addEventListener('click', () => {
    titleDiv.innerHTML = `<h3>Item Properties</h3>`;
    propertiesDiv.innerHTML = "No Marker Selected";
  });

  // Update marker metadata
  document.getElementById('updateMarkerButton').addEventListener('click', () => {

    const newTitle = document.getElementById("markerTitleInput").value;
    const newLat = parseFloat(document.getElementById("markerLatInput").value);
    const newLng = parseFloat(document.getElementById("markerLngInput").value);

    // Update marker properties
    marker.setTitle(newTitle);
    marker.setPosition({ lat: newLat, lng: newLng });

    metadata.description = document.getElementById('descInput').value;
    numericFields.forEach(field => {
      metadata[field.key] = parseFloat(document.getElementById(field.key + 'Input').value) || 0;
    });

    metadata.radius.forEach((r, idx) => {
      r.value = parseFloat(document.getElementById(`radiusValue${idx}`).value) || 0;
      r.label = document.getElementById(`radiusLabel${idx}`).value || '';
      r.color = hexToRgb(document.getElementById(`radiusColor${idx}`).value);
      r.transparency = parseInt(document.getElementById(`radiusT${idx}`).value) / 100;
    });


    titleDiv.innerHTML = `<h3>Item Properties</h3>`;
    propertiesDiv.innerHTML = "No Marker Selected";

    // Clear out the old marker if it exists
    if (coverageGlobals.steeringMarker) {
      coverageGlobals.steeringMarker.setMap(null);
    }

    updateUI();
    drawCoverageWedgesForMarker(marker);
  });
}

// When I click on a marker, add a marker to the map 2 km behind it
// Behind being defined by 180* from the heading
// That marker will update the heading of the orginal marker on drag end
// by calculating the heading from the new marker to the original marker
// and setting the original marker heading to that value
function showHeadingHelper(parentMarker) {

  // Clear out the old marker if it exists
  if (coverageGlobals.steeringMarker) {
    coverageGlobals.steeringMarker.setMap(null);
  }

  console.log("showHeadingHelper called for marker:", parentMarker.getTitle());

  const sourceMarkerPos = parentMarker.getPosition();
  const heading = parentMarker.coverageMetadata.sectorAzimuthHeading || 0;
  const behindHeading = (heading + 180) % 360;
  const newMarkerDist = 4; // km - I tried betewen 3 and 5 km, but this works best

  // new marker position
  const headingMarkerPos = azElR_to_LLA(sourceMarkerPos.lat(), sourceMarkerPos.lng(), 0, behindHeading, 0, newMarkerDist);

  console.log("Heading marker position:", headingMarkerPos);

  const azimuthIcon = {
    url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="18" fill="#333" stroke="#fff" stroke-width="2"/>
      <polygon points="20,5 24,20 20,35 16,20" fill="#FF4136"/>
      <circle cx="20" cy="20" r="4" fill="#fff"/>
    </svg>
  `),
    scaledSize: new google.maps.Size(30, 30),
    anchor: new google.maps.Point(20, 20),
  };

  const steeringMarker = myMapManager.createMarker({
    title: "Drag to change heading",
    icon: azimuthIcon,
    label: " ",
    position: { lat: headingMarkerPos.lat, lng: headingMarkerPos.lon },
    draggable: true,
    onDragEnd: (newHeadingMarkerPos, markerRef) => {
      console.log("New heading marker position:", newHeadingMarkerPos);
      const newLatLonDistResult = calculateLatLonDistance(newHeadingMarkerPos.lat, newHeadingMarkerPos.lng, sourceMarkerPos.lat(), sourceMarkerPos.lng());
      parentMarker.coverageMetadata.sectorAzimuthHeading = Math.round(newLatLonDistResult.heading);
      drawCoverageWedgesForMarker(parentMarker);
      displayMarkerProperties(parentMarker);
    },
  });

  coverageGlobals.steeringMarker = steeringMarker;
}

function loadCoverageSettings(markers) {
  // const markers = loadCoverageSettingsJSON();

  console.log("Loaded markers from JSON:", markers);


  if (markers && markers.length > 0) {
    markers.forEach(m => {
      console.log("Loaded marker:", m);
      const marker = myMapManager.addMarker({
        title: m.title || 'Loaded Marker',
        position: m.position || { lat: 0, lng: 0 },
        draggable: true,
        onDragEnd: (newPos, markerRef) => {
          updateMarkerInfo(markerRef, newPos);
        },
        onClick: (markerRef) => {
          console.log('Marker clicked:', markerRef.getTitle());
          displayMarkerProperties(markerRef); // Show properties in sidebar
        },
      });
      marker.coverageMetadata = structuredClone(m.coverageMetadata) || structuredClone(coverageGlobals.defaultMarkerMetadata);


      /*const markerDiv = document.createElement('div');
      markerDiv.className = 'marker-info';
      markerDiv.id = 'marker-' + marker.getLabel();
      const contentDiv = document.getElementById('dynamicContent');
      contentDiv.appendChild(markerDiv);
      */
      updateMarkerInfo(marker, m.position);
    });
  }

  updateUI();
  myMapManager.setZoomOnMarkerBounds();
}

function generateKML() {
  const markers = myMapManager.getMarkers();
  if (!markers || markers.length === 0) {
    alert("No markers to generate KML.");
    return;
  }


  let kmlString = "";

  kmlString += `<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<kml xmlns=\"http://www.opengis.net/kml/2.2\">\n<Document>\n`;


  markers.forEach(marker => {
    console.log("Generating KML for marker:", marker.getTitle());
    // console print the length of the kml string
    console.log("Current KML length:", kmlString.length);

    kmlString += `<Folder><name>${marker.getTitle()}</name>\n`;

    const params = {
      lat: marker.getPosition().lat(),
      lon: marker.getPosition().lng(),
      alt: marker.coverageMetadata.sectorHeight || 0,
      azCtr: marker.coverageMetadata.sectorAzimuthHeading || 0,
      azBw: marker.coverageMetadata.sectorAzimuthWidth || 90,
      elCtr: marker.coverageMetadata.sectorElevationAngle || 0,
      elBw: marker.coverageMetadata.sectorElevationHeight || 30,
      rMin: 0, // Parsing from each radius segment
      rMax: 0, // Parsing from each radius segment
      // azSteps: 3, // Math.max(4, parseInt(document.getElementById('azSteps').value)),
      // elSteps: 1, // Default to 1 for elevation steps
      name: "placeholder", // will be replaced below
      color: null, // will be replaced below
    };

    const radiusData = marker.coverageMetadata.radius || [];

    /*
    console.log("Marker radius segments:", marker.coverageMetadata.radius);


    if (!Array.isArray(marker.radius)) {
      marker.radius = [marker.radius];
    }

    console.log("Marker radius segments:", marker.radius);
*/

    radiusData.forEach((r, idx) => {
      console.log("Processing radius segment:", idx, r);
      params.rMin = idx === 0 ? 0 : radiusData[idx - 1].value;
      params.rMax = r.value;
      params.color = rgbaToKmlColor(r.color, r.transparency);

      // console.log("Wedge color:", params.color);

      // params.name = `${marker.getTitle()} - ${r.label}`;
      params.name = `${r.label}`;

      /*const pointsPerKm = 2; // Adjust for more/less detail
      const outerArcLengthKm = r.rMax * params.azBw * Math.PI / 180;
      const numAzPoints = Math.max(2, Math.ceil(outerArcLengthKm * pointsPerKm));
      params.azSteps = numAzPoints;*/

      kmlString += buildWedgeKML(params);
    });

    kmlString += `</Folder>\n`;


  });

  kmlString += `</Document></kml>`;


  const now = new Date();
  const pad = num => num.toString().padStart(2, "0");
  const filename =
    `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-` +
    `${pad(now.getHours())}${pad(now.getMinutes())}_coverage.kml`;

  // Trigger download
  const blob = new Blob([kmlString], { type: 'application/vnd.google-earth.kml+xml' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function generateMarkerReport() {
  const markers = myMapManager.getMarkers();
  let html = "";
  html += generateDistanceReportHTML(markers);
  html += generateAreaReport(markers);
  return html;
}

function generateOverlapReport() {
  const overlapResults = computeCoveragePolygonOverlap(myMapManager.getMarkers());
  const html = generateOverlapReportHTML(overlapResults);

  return html;

}


function generateOverlapReportHTML(overlapResults) {
  let html = "<h3>Overlap (sq km)</h3>\n";
  html += "<table border='1' cellpadding='5'><tr>";

  titles = ["Object 1", "Sector 1", "Object 2", "Sector 2", "Overlap of Full", "Overlap of Partial"];
  titles.forEach(title => {
    html += `<th>${title}</th>`;
  });
  html += "</tr>\n";

  overlapResults.forEach((currentResult) => {
    if (currentResult.overlap > 0 || currentResult.fullOverlap > 0) {
      html += "<tr>"
      html += `<td>${currentResult.markerOneName}</td>`;
      html += `<td>${currentResult.segmentOneName}</td>`;
      html += `<td>${currentResult.markerTwoName}</td>`;
      html += `<td>${currentResult.segmentTwoName}</td>`;
      html += `<td>${roundDecimal(currentResult.fullOverlap / 1e6, 1)}</td>`;
      html += `<td>${roundDecimal(currentResult.overlap / 1e6, 1)}</td>`;
      html += "</tr>\n";


    }

  });

  html += "</table>";
  return html;

}


// Function that iterates over each of the marker and radius and calculates the area of each wedge
function generateAreaReport(markers) {
  let html = "<h3>Area</h3>\n";
  html += "<table border='1' cellpadding='5'><tr>";

  titles = ["Marker", "Radius Title", "Sector Width (deg)", "Radius Range (km)", "Full Area (sq km)", "Sector Area (sq km)"];
  titles.forEach(title => {
    html += `<th>${title}</th>`;
  });
  html += "</tr>";


  markers.forEach(marker => {
    const metadata = marker.coverageMetadata;
    metadata.radius.forEach((r, idx) => {
      const azBw = metadata.sectorAzimuthWidth || 90;
      let rMin = idx === 0 ? 0 : metadata.radius[idx - 1].value;
      const rMax = r.value;



      // Area of sector formula: (θ/360) * π * (R^2 - r^2)
      const area = (azBw / 360) * Math.PI * (rMax * rMax - rMin * rMin);

      rMin = 0;
      const fullArea = (azBw / 360) * Math.PI * (rMax * rMax - rMin * rMin);

      const results = [];
      results.push(marker.getTitle());
      results.push(r.label || `Radius ${idx + 1}`);
      results.push(azBw);
      results.push(rMax.toFixed(1));
      results.push(fullArea.toFixed(1));
      results.push(area.toFixed(1));

      html += "<tr>";
      results.forEach(res => {
        html += `<td>${res}</td>`;
      });
      html += "</tr>";
    });
  });
  html += "</table>";
  return html;
}

// Generate the distance matrix
function generateDistanceReportHTML(markers) {



  let html = "<h3>Distance Matrix (km)</h3>\n";
  html += "<table border='1' cellpadding='5'><tr><th></th>";
  markers.forEach(m => {
    html += `<th>${m.title}</th>`;
  });
  html += "</tr>";

  markers.forEach((m1, i) => {
    html += `<tr><th>${m1.title}</th>`;
    markers.forEach((m2, j) => {
      if (i === j || i < j) {
        html += "<td>-</td>"; // diagonal
      } else {


        const d = calculateLatLonDistance(
          m1.getPosition().lat(), m1.getPosition().lng(),
          m2.getPosition().lat(), m2.getPosition().lng(),
        );

        console.log(`Distance from ${m1.title} to ${m2.title}:`, d);
        html += `<td>${d.km.toFixed(1)}</td>`;
      }
    });
    html += "</tr>";
  });
  html += "</table>";


  return html;

  // distanceReportElement.innerHTML = html;
  // document.getElementById("distanceReport").style.display = "block";
  // document.getElementById("closeReportBtn").style.display = "inline-block";
}

// Close the report
function closeDistanceReport() {
  document.getElementById("distanceReport").style.display = "none";
  document.getElementById("closeReportBtn").style.display = "none";
}