

const coverageGlobals = {
  addingMarker: false,
  pendingName: null,
  defaultMetadata: {
    description: "",
    createdAt: null,
    sectorAzimuthWidth: 90,
    sectorAzimuthHeading: 90,
    sectorElevationHeight: 30,
    sectorElevationAngle: 20,
    sectorHeight: 5,
    radius: [{ value: 5, color: [0, 0, 255], transparency: 0.5, label: "5 km" }], 
  }
};


function initMap() {
  // Initialize MapManager
  const mapManager = new MapManager('map', { lat: 40.7128, lng: -74.006 }, 12);

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

  mapManager.setMapClickListener((latLng) => {
    if (!coverageGlobals.addingMarker) return;

    // Create the marker at the clicked location
    const marker = mapManager.addMarker({
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


    marker.coverageMetadata = coverageGlobals.defaultMetadata;
    marker.coverageMetadata.createdAt = new Date().toISOString();
    displayMarkerProperties(marker)


    // Disable adding mode immediately after placing the marker
    coverageGlobals.addingMarker = false;
    addMarkerButton.disabled = false;
    addMarkerButton.textContent = 'Add Marker';

    const markerDiv = document.createElement('div');
    markerDiv.className = 'marker-info';
    markerDiv.id = 'marker-' + marker.getLabel();
    markerDiv.textContent = `Marker ${marker.getTitle()}: ${latLng.lat.toFixed(5)}, ${latLng.lng.toFixed(5)}`;
    contentDiv.appendChild(markerDiv);
  });

  /*
  // Map click listener: add draggable marker and update sidebar
  mapManager.setMapClickListener((latLng) => {
    const marker = mapManager.addMarker({
      position: latLng,
      title: '',
      draggable: true,
      onDragEnd: (newPos, markerRef) => {
        updateMarkerInfo(markerRef, newPos);
      },
      onClick: (markerRef) => {
        console.log('Marker clicked:', markerRef.getTitle());
      }
    });

    // Add marker info to sidebar
    const markerDiv = document.createElement('div');
    markerDiv.className = 'marker-info';
    markerDiv.id = 'marker-' + marker.getLabel();
    markerDiv.textContent = `Marker ${marker.getLabel()}: ${latLng.lat.toFixed(5)}, ${latLng.lng.toFixed(5)}`;
    contentDiv.appendChild(markerDiv);
  });
  */

  // Function to display information about a marker in the sidebar in the propertiesContent div
  function displayMarkerPropertiesOld(marker) {
    const propertiesDiv = document.getElementById('propertiesContent');
    propertiesDiv.innerHTML = "<pre>" + JSON.stringify(marker.position) + "</pre>";
  }

  // Function to update marker info in sidebar
  function updateMarkerInfo(marker, newPos) {
    const markerDiv = document.getElementById('marker-' + marker.getLabel());
    if (markerDiv) {
      markerDiv.textContent = `Marker ${marker.getLabel()}: ${newPos.lat.toFixed(5)}, ${newPos.lng.toFixed(5)}`;
    }
  }

  // Clear markers button
  clearButton.addEventListener('click', () => {
    mapManager.deleteAllMarkers();
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

  html += `<br><br><button id="updateMarkerButton">Update Marker</button>`;

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
  window.deleteRadius = function(idx) {
    metadata.radius.splice(idx, 1);
    displayMarkerProperties(marker);
  };

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

    alert('Marker metadata updated!');
    // Optional: redraw circles
  });
}

