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


    const contentDiv = document.getElementById('dynamicContent');
    const markerDiv = document.createElement('div');
    markerDiv.className = 'marker-info';
    markerDiv.id = 'marker-' + marker.getLabel();
    contentDiv.appendChild(markerDiv);
    updateMarkerInfo(marker, latLng);
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

// Function to update marker info in sidebar
function updateMarkerInfo(marker, newPos) {
  drawCoverageWedgesForMarker(marker);

  const markerDiv = document.getElementById('marker-' + marker.getLabel());
  if (markerDiv) {
    markerDiv.textContent = `Marker ${marker.getTitle()}: ${newPos.lat.toFixed(3)}, ${newPos.lng.toFixed(3)}`;
  }
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
      const markerDiv = document.createElement('div');
      markerDiv.className = 'marker-info';
      markerDiv.id = 'marker-' + marker.getLabel();
      const contentDiv = document.getElementById('dynamicContent');
      contentDiv.appendChild(markerDiv);
      updateMarkerInfo(marker, m.position);
    });
  }
}

function generateKML() {
  const markers = myMapManager.getMarkers();
  if (!markers || markers.length === 0) {
    alert("No markers to generate KML.");
    return;
  }

  markers.forEach(marker => {

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
      azSteps: Math.max(4, parseInt(document.getElementById('azSteps').value)),
      elSteps: 1, // Default to 1 for elevation steps
      name: "placeholder", // will be replaced below
      color: (document.getElementById('styleColor').value || '7dff8000').trim()
    };

    marker.radius.forEach((r, idx) => {
      params.rMin = idx === 0 ? 0 : marker.radius[idx - 1].value;
      params.rMax = r.value;
      params.name = `${marker.getTitle()} - ${r.label}`;

      const kml = generateKMLForSector(params);
    });




  });
}