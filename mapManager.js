class MapManager {
  constructor(mapId, initialCenter, initialZoom) {
    this.map = new google.maps.Map(document.getElementById(mapId), {
      center: initialCenter || { lat: 40.7128, lng: -74.006 },
      zoom: initialZoom || 12,
      mapTypeId: google.maps.MapTypeId.TERRAIN, // Set the default map type to terrain
    });

    this.markers = [];
    this.mapClickListener = null;

    // Set up click listener for the map
    google.maps.event.addListener(this.map, "click", (event) => {
      if (this.mapClickListener) {
        this.mapClickListener(event.latLng.toJSON());
      }
    });
  }

  setMapCenter(lat, lon) {
    this.map.setCenter({ lat: lat, lng: lon });
  }

  setZoomOnMarkerBounds() {
    const bounds = new google.maps.LatLngBounds();
    this.markers.forEach((marker) => {
      bounds.extend(marker.position);
    });

    this.map.fitBounds(bounds);
  }

  setZoom(newZoom) {
    this.map.setZoom(newZoom);
  }

  // Call this function to force a re-rendering of the map
  mapResize() {
    google.maps.event.trigger(map, "resize");
  }

  addMarker(position, title, label = "", rgbColor = null) {
    if (!label) {
      label = (this.markers.length + 1).toString();
    }

    // Place the standard marker
    if (!rgbColor) {
      const marker = new google.maps.Marker({
        map: this.map,
        position: position,
        title: title,
        label: label,
      });

      this.markers.push(marker);
      return marker;
    } else {
      const marker = new google.maps.Marker({
        map: this.map,
        position: position,
        title: title,
        label: label,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: `rgb(${rgbColor[0]}, ${rgbColor[1]}, ${rgbColor[2]})`,
          fillOpacity: 1,
          strokeWeight: 0,
          scale: 8, // Adjust the size of the marker
        },
        draggable: false, // You can set this to false if you don't want the marker to be draggable
      });

      this.markers.push(marker);
      return marker;
    }
  }

  updateMarker(index, position, title) {
    const marker = this.markers[index];
    marker.setMap(null);

    if (marker) {
      marker.setPosition(position);
      marker.setTitle(title);
      marker.setMap(this);
    }

    return marker;
  }

  deleteMarker(index) {
    const marker = this.markers[index];

    if (marker) {
      marker.setMap(null); // Remove marker from the map
      this.markers.splice(index, 1); // Remove from the array
    }

    return marker;
  }

  deleteAllMarkers() {
    for (let i = 0; i < this.markers.length; i++) {
      this.markers[i].setMap(null);
    }
    this.markers = [];
  }

  setMapClickListener(callback) {
    this.mapClickListener = callback;
  }
}

var globalCallbackName = "";

// This function reads the current URL and then calls one of two javascript files to get the test or production API keys
function initMapKey(callbackName) {
  var currentSiteUrl = window.location.href;
  console.log("Current Site URL:", currentSiteUrl);

  var myScript = document.createElement("script");

  if (currentSiteUrl.includes("https://mvirdone1.github.io")) {
    // Production
    console.log("Production Key");
    myScript.src = "mapKey.js";
  } else {
    // Test
    console.log("Test Key");
    myScript.src = "mapKey.test.js";
  }

  // Set the defer attribute

  myScript.defer = true;
  myScript.async = true;

  document.body.appendChild(myScript);

  globalCallbackName = callbackName;
}

function getGMapCallbackName() {
  return globalCallbackName;
}
