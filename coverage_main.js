

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

    // Make the new marker the default metadata template
    coverageGlobals.newMarkerMetadata = coverageGlobals.defaultMarkerMetadata;

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
        // Remove marker
        mObj.marker.setMap(null);
        // Remove from globals
        coverageGlobals.markers.splice(idx, 1);
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
          coverageGlobals.newMarkerMetadata = mObj.coverageMetadata
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


/*
// --- UI update ---
function refreshMarkerList() {
  const list = document.getElementById("markerList");
  if (!list) return;

  list.innerHTML = ""; // clear existing

  myMapManager.getMarkers().forEach((mObj, idx) => {
    const item = document.createElement("div");
    item.className = "marker-entry";

    // Marker title
    const label = document.createElement("span");
    label.textContent = mObj.marker.getTitle();
    label.style.marginRight = "8px";

    // Delete button
    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.addEventListener("click", () => {
      // Remove polygons
      if (mObj.polygons) {
        mObj.polygons.forEach(p => p.setMap(null));
      }
      // Remove marker
      mObj.marker.setMap(null);
      // Remove from globals
      coverageGlobals.markers.splice(idx, 1);
      refreshMarkerList();
    });

    // Copy button
    const copyBtn = document.createElement("button");
    copyBtn.textContent = "Copy";
    copyBtn.style.marginLeft = "4px";
    copyBtn.addEventListener("click", () => {
      const name = prompt("Enter a name for the copied marker:");
      if (name && name.trim() !== "") {
        enterAddMarkerMode(name.trim(), mObj);
      }
    });

    item.appendChild(label);
    item.appendChild(delBtn);
    item.appendChild(copyBtn);
    list.appendChild(item);
  });
}
  */


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
          transparency: 0
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

  const innerRadius = 0; // meters
  const outerRadius = metadata.radius[metadata.radius.length - 1].value * 1000; // km to m
  const centerAzimuth = metadata.sectorAzimuthHeading || 0; // degrees
  const width = metadata.sectorAzimuthWidth || 90; // degrees

  // iterate over each of the radius in the marker metadata array
  marker.coverageMetadata.radius.forEach((r, idx) => {
    const polygon = addCoverageWedge(marker, innerRadius, outerRadius, centerAzimuth, width);
    if (polygon) {
      marker.coveragePolygons.push(polygon);
      polygon.setMap(myMapManager.map);
    }
  });


}


function addCoverageWedge(marker, innerRadius, outerRadius, centerAzimuth, width) {
  const center = marker.getPosition();

  // Compute azimuth bounds
  const startAzimuth = centerAzimuth - width / 2;
  const endAzimuth = centerAzimuth + width / 2;

  const path = [];

  // Helper to convert polar to LatLng
  function computeOffset(center, distance, heading) {
    return google.maps.geometry.spherical.computeOffset(center, distance, heading);
  }

  // Arc resolution: 1 point per ~50m of arc length
  function numPoints(radius, spanDeg) {
    const arcLength = (Math.PI * radius * spanDeg) / 180; // meters
    return Math.max(3, Math.floor(arcLength / 50));
  }

  const outerPoints = numPoints(outerRadius, width);
  const innerPoints = numPoints(innerRadius, width);

  // Outer arc (start -> end)
  for (let i = 0; i <= outerPoints; i++) {
    const az = startAzimuth + (i / outerPoints) * width;
    path.push(computeOffset(center, outerRadius, az));
  }

  // Inner arc (end -> start, reversed)
  for (let i = innerPoints; i >= 0; i--) {
    const az = startAzimuth + (i / innerPoints) * width;
    path.push(computeOffset(center, innerRadius, az));
  }

  // Create polygon
  const polygon = new google.maps.Polygon({
    paths: path,
    strokeColor: "#FF0000",
    strokeOpacity: 0.8,
    strokeWeight: 1,
    fillColor: "#FF0000",
    fillOpacity: 0.35,
    map: marker.getMap()
  });

  // Associate polygon with the marker
  if (!marker.coveragePolygons) {
    marker.coveragePolygons = [];
  }
  marker.coveragePolygons.push(polygon);

  return polygon;
}


