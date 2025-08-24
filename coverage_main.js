function initMap() {
    // Initialize MapManager
    const mapManager = new MapManager('map', { lat: 40.7128, lng: -74.006 }, 12);
  
    const contentDiv = document.getElementById('dynamicContent');
    const clearButton = document.getElementById('clearMarkers');
  
    // Map click listener: add marker and update sidebar
    mapManager.setMapClickListener((latLng) => {
      const marker = mapManager.addMarkerLegacy(latLng, 'New Marker');
  
      const markerDiv = document.createElement('div');
      markerDiv.textContent = `Marker at: ${latLng.lat.toFixed(5)}, ${latLng.lng.toFixed(5)}`;
      contentDiv.appendChild(markerDiv);
    });
  
    // Clear markers button
    clearButton.addEventListener('click', () => {
      mapManager.deleteAllMarkers();
      contentDiv.innerHTML = '<p>Markers cleared.</p>';
    });
  }


  
  // Initialize Google Maps API key using your mechanism
  // initMapKey('initMap');
  
  // Connect callback
  // window[getGMapCallbackName()] = initMap;
  