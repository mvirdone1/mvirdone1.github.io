function getGoogleMapsApiKey() {
  console.log("Production Key");
  return "AIzaSyD4IR1iXOziMLx9qmMSAVZrzDdLWslS_BY";
}

// When this file loads,
// construct the Google Maps API URL with the API key
var mapsApiUrl =
  "https://maps.googleapis.com/maps/api/js?key=" +
  getGoogleMapsApiKey() +
  "&callback=" +
  getGMapCallbackName();

// getGMapCallbackName is sourced from mapManager.js

// Dynamically create a script element and set its source to the Google Maps API URL

var myScript = document.createElement("script");
myScript.src = mapsApiUrl;
// Set the defer attribute
myScript.defer = true;

// Append the script element to the document body
document.body.appendChild(myScript);
