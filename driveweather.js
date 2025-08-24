class DriveWeather {
  constructor(mapId, initialCenter, initialZoom) {}
}

let locationList = [];
let displayForecastTruePlotsFalse = true;

function appendLatLon(lat, lon) {
  locationList.push([lat, lon]);
}

// Update the marker list titles in the map manager markers
function updateMarkerTitles() {
    // Re-label all the markers since we deleted one
    myMapManager.getMarkers().forEach((marker, idx) => {
      marker.setLabel((idx + 1).toString());  
    }) 
}

function updateDriveList() {
  console.log("Updating Drive List");
  $("#dynamic-div").empty();

  var linkURL = "https://mvirdone1.github.io/driveweather.html?drive=";

  // myMapManager.deleteAllMarkers();

  // Get all markers from the map manager and then iterate over them
  // iterate over all markers and their index
  myMapManager.getMarkers().forEach((marker, idx) => {
    // print troubleshooting info
    console.log(marker);

    const numDecimals = 2;
    const lat = roundDecimal(marker.getPosition().lat(), numDecimals);
    const lon = roundDecimal(marker.getPosition().lng(), numDecimals);

    getWeatherOverview(lat, lon, idx);
    linkURL = linkURL + lat + "," + lon + ";";

  })   


  $("#drive-link").attr("href", linkURL);

  updateWeatherImages();
}

function deleteLocation(deleteIdx) {

  myMapManager.deleteMarker(deleteIdx);
  updateMarkerTitles();
  updateDriveList();
}

function getWeatherOverview(lat, lon, idx) {
  var localURL =
    "https://forecast.weather.gov/MapClick.php?lat=" + lat + "&lon=" + lon;

  console.log(lat, lon, idx);

  var printIdx = idx + 1;
  $("#dynamic-div").append(
    '<a target="_blank" href="' +
      localURL +
      '"><h1> Location ' +
      printIdx +
      "</h1></a>"
  );

  var deleteButton = $(
    '<button id="deleteButton-' +
      idx +
      '">Delete Location ' +
      printIdx +
      "</button>"
  );

  // Append the button to a container div
  $("#dynamic-div").append(deleteButton);

  var myDiv = $("<div>").attr("id", "forecast-" + idx);

  $("#dynamic-div").append(myDiv);

  // Add a click event listener to the button
  deleteButton.on("click", function () {
    deleteLocation(idx);
  });

  myDiv.load(localURL + " #seven-day-forecast");
}

function getDriveURLParameters(driveString) {
  var driveLocations = driveString.split(";");

  for (driveLocation of driveLocations) {
    var coordinates = driveLocation.split(",");
    if (coordinates.length == 2) {
      appendLatLon(coordinates[0], coordinates[1]);
    }
  }
}

function driveWeatherInit() {
  // Usage example
  const initialCenter = { lat: 41.69, lng: -111.8 };
  const initialZoom = 8;
  const myMapManager = new MapManager("map", initialCenter, initialZoom);
  // Make this a global variable 
  window.myMapManager = myMapManager;

  // Add a click event listener to the map
  myMapManager.setMapClickListener((position) => {
    console.log(`Map clicked at: ${position.lat}, ${position.lng}`);
    // myMapManager.addMarker(position, "");

    myMapManager.addMarker({
      position: position,
      title: "",
      draggable: true,
      onDragEnd: ({ lat, lng, marker }) => {
        // Refresh the drive list
        updateDriveList();
      }
    });

    //appendLatLon(lat, lon);
    updateDriveList();
  });

  var reverseButton = $('<button id="reverseButton">Reverse List</button>');

  $("#map-div").append(reverseButton);
  // Add a click event listener to the button
  reverseButton.on("click", function () {
    reverseList();
  });

  // Get the URL and see if we have pre-set
  const queryString = window.location.search;
  console.log(queryString);
  const urlParams = new URLSearchParams(queryString);

  // appendLatLon(41.73, -111.83);

  if (urlParams.has("showPlots")) {
    displayForecastTruePlotsFalse = false;
  }

  if (urlParams.has("drive")) {
    console.log("Found a drive parameter");
    getDriveURLParameters(urlParams.get("drive"));
    updateDriveList();
  }

  var intervalId = window.setInterval(function () {
    console.log("Updating Images");
    updateWeatherImages();
  }, 1000);
}


function reverseList() {
  const markers = myMapManager.getMarkers();
  markers.reverse();
  myMapManager.setMarkers(markers);
  updateMarkerTitles();
  updateDriveList();
}

function updateWeatherImages() {
  // Only do this if we're doing embedded forecasts
  if (displayForecastTruePlotsFalse) {
    $("#dynamic-div")
      .find("img")
      .each(function (index) {
        if ($(this).attr("class") != "fixed") {
          var $imgsrc = $(this).attr("src");
          var $imgsrc2 = "https://forecast.weather.gov/" + $imgsrc;
          $(this).attr("src", $imgsrc2);
          $(this).attr("class", "fixed");
          // $img.attr('alt',imgalt);
        }
      });
  }
}

function liveWeatherInit() {
  // Call displayTemperatureData function on page load to display temperature data for Logan, UT (KLGU)
  // window.onload = function () {
  // Initialize the map
  // initMap();

  var locationObjects = initLocationObjects();
  createDropDownMenu(locationObjects);

  // handleDropDownChange(-1);
}
