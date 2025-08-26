

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
  newMarkerMetadata: {}
};


function initMap() {
  // Initialize MapManager
  const mapManager = new MapManager('map', { lat: 40.7128, lng: -74.006 }, 12);
  window.myMapManager = mapManager; // Global variable


  const contentDiv = document.getElementById('dynamicContent');
  const clearButton = document.getElementById('clearMarkers');

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


    const markerDiv = document.createElement('div');
    markerDiv.className = 'marker-info';
    markerDiv.id = 'marker-' + marker.getLabel();
    contentDiv.appendChild(markerDiv);
    updateMarkerInfo(marker, latLng);
  });

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
        if (mObj.polygons) {
          mObj.polygons.forEach(p => p.setMap(null));
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


  // Function to display information about a marker in the sidebar in the propertiesContent div
  function displayMarkerPropertiesOld(marker) {
    const propertiesDiv = document.getElementById('propertiesContent');
    propertiesDiv.innerHTML = "<pre>" + JSON.stringify(marker.position) + "</pre>";
  }

  // Function to update marker info in sidebar
  function updateMarkerInfo(marker, newPos) {
    drawCoverageWedgesForMarker(marker);

    const markerDiv = document.getElementById('marker-' + marker.getLabel());
    if (markerDiv) {
      markerDiv.textContent = `Marker ${marker.getTitle()}: ${newPos.lat.toFixed(3)}, ${newPos.lng.toFixed(3)}`;
    }
  }

  // Clear markers button
  clearButton.addEventListener('click', () => {
    myMapManager.deleteAllMarkers();
    contentDiv.innerHTML = '<p>Markers cleared.</p>';
  });
}

// Helper functions
function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b)
    .toString(16)
    .slice(1)
    .toUpperCase();
}

function hexToRgb(hex) {
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b];
}

function getRandomMidColor() {
  return Math.floor(Math.random() * 255); // 100–200
}

// Main function
function displayMarkerProperties(marker) {

  console.log("displayMarkerProperties called", marker.getTitle());

  const titleDiv = document.getElementById('propertiesTitle');
  titleDiv.innerHTML = `<h3>Item Properties For: ${marker.getTitle()}<h3>`;

  const propertiesDiv = document.getElementById('propertiesContent');
  const metadata = marker.coverageMetadata;

  // Build description
  let html = `
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
        
        <button onclick="deleteRadius(${idx})">Delete</button>
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
          color: [getRandomMidColor(), getRandomMidColor(), getRandomMidColor()],
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

    drawCoverageWedgesForMarker(marker);
  });
}

// Take the list of radius segments in a given marker, and add the coverage wedges to the map
function drawCoverageWedgesForMarker(marker) {
  // Remove existing polygons
  if (marker.coveragePolygons) {
    marker.coveragePolygons.forEach(p => p.setMap(null));
  }
  marker.coveragePolygons = [];

  const metadata = marker.coverageMetadata;
  if (!metadata || !metadata.radius || metadata.radius.length === 0) return;

  var innerRadius = 0; // meters


  // iterate over each of the radius in the marker metadata array
  marker.coverageMetadata.radius.forEach((radiusObj, idx) => {
    const polygon = addCoverageWedge(marker, innerRadius, radiusObj);
    if (polygon) {
      marker.coveragePolygons.push(polygon);
      polygon.setMap(myMapManager.map);
    }

    innerRadius = radiusObj.value;
  });


}

function addCoverageWedge(marker, innerRadiusKm, radiusObj) {
  if (!marker || !radiusObj) {
    console.warn("Marker or radiusObj missing");
    return;
  }

  console.log(radiusObj);

  const center = marker.getPosition(); // google.maps.LatLng

  // Convert radius color from [r,g,b] to hex
  const fillColor = rgbToHex(...radiusObj.color);

  // Transparency in your object (0 = opaque, 1 = fully transparent)
  // Convert to fillOpacity: fillOpacity = 1 - transparency
  const fillOpacity = 1 - (radiusObj.transparency || 0);

  // Use your existing wedge helper function
  const outerRadius = radiusObj.value; // km
  const sectorCenter = marker.coverageMetadata.sectorAzimuthHeading;
  const sectorWidth = marker.coverageMetadata.sectorAzimuthWidth;

  const path = getWedgePolygonPath(center, innerRadiusKm, outerRadius, sectorCenter, sectorWidth);

  if (!path || !path.length) {
    console.warn("Computed wedge path is empty!");
    return;
  }

  console.log(`Adding wedge polygon: inner=${innerRadiusKm}km, outer=${outerRadius}km, center=${sectorCenter}, width=${sectorWidth}`);
  console.log("Path points:", path.length);

  const polygon = new google.maps.Polygon({
    paths: path,
    strokeColor: fillColor,
    strokeOpacity: fillOpacity + 0.15, // slightly more opaque border
    strokeWeight: 2,
    fillColor: fillColor,
    fillOpacity: fillOpacity,
    map: marker.getMap(),
  });

  // Associate polygon with the marker
  marker.polygons = marker.polygons || [];
  marker.polygons.push(polygon);

  return polygon;
}


function getWedgePolygonPath(center, innerRadiusKm, outerRadiusKm, azimuthCenter, azimuthWidth, pointsPerKm = 1) {
  const path = [];

  // Convert to radians
  const centerRad = (azimuthCenter * Math.PI) / 180;
  const halfWidthRad = ((azimuthWidth / 2) * Math.PI) / 180;

  // Determine number of points along outer arc
  const outerArcLengthKm = outerRadiusKm * azimuthWidth * Math.PI / 180;
  const numPoints = Math.max(2, Math.ceil(outerArcLengthKm * pointsPerKm));

  // Outer arc
  for (let i = 0; i <= numPoints; i++) {
    const angle = centerRad - halfWidthRad + (i / numPoints) * (2 * halfWidthRad);
    const pos = google.maps.geometry.spherical.computeOffset(center, outerRadiusKm * 1000, (angle * 180) / Math.PI);
    path.push(pos);
  }

  // Inner arc (reverse order)
  for (let i = numPoints; i >= 0; i--) {
    const angle = centerRad - halfWidthRad + (i / numPoints) * (2 * halfWidthRad);
    const pos = google.maps.geometry.spherical.computeOffset(center, innerRadiusKm * 1000, (angle * 180) / Math.PI);
    path.push(pos);
  }

  return path;
}



