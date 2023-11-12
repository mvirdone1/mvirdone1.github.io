class DriveWeather {
  constructor(mapId, initialCenter, initialZoom) {}
}

let locationList = [];

function appendLatLon(lat, lon) {
  locationList.push([lat, lon]);
}

function updateDriveList() {
  $("#dynamic-div").empty();

  var linkURL = "https://mvirdone1.github.io/driveweather.html?drive=";

  myMapManager.deleteAllMarkers();

  for (idx = 0; idx < locationList.length; idx++) {
    console.log("[" + idx + "]: " + locationList[idx]);

    var lat = locationList[idx][0];
    var lon = locationList[idx][1];

    getWeatherOverview(lat, lon, idx);
    mapPosition = {
      lat: Number(lat),
      lng: Number(lon),
    };
    myMapManager.addMarker(mapPosition, "");

    linkURL = linkURL + lat + "," + lon + ";";
  }

  $("#drive-link").attr("href", linkURL);

  updateWeatherImages();
}

function deleteLocation(deleteIdx) {
  locationList.splice(deleteIdx, 1);

  updateDriveList();
}

function getWeatherOverview(lat, lon, idx) {
  var localURL =
    "https://forecast.weather.gov/MapClick.php?lat=" + lat + "&lon=" + lon;

  console.log(lat, lon, idx);

  var printIdx = idx + 1;
  $("#dynamic-div").append("<h1> Location " + printIdx + "</h1>");

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

function initMapManager() {
  // Usage example
  const initialCenter = { lat: 41.69, lng: -111.8 };
  const initialZoom = 8;
  const myMapManager = new MapManager("map", initialCenter, initialZoom);
  window.myMapManager = myMapManager;

  // Add a click event listener to the map
  myMapManager.setMapClickListener((position) => {
    // mapManager.addMarker(position, "");
    console.log(`Map clicked at: ${position.lat}, ${position.lng}`);

    const numDecimals = 2;
    const roundFactor = 10 ** numDecimals;

    var lat = Math.round(position.lat * roundFactor) / roundFactor;
    var lon = Math.round(position.lng * roundFactor) / roundFactor;

    appendLatLon(lat, lon);
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

function driveWeatherInit() {
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
  locationList.reverse();
  updateDriveList();
}

function updateWeatherImages() {
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

function liveWeatherInit() {
  // Call displayTemperatureData function on page load to display temperature data for Logan, UT (KLGU)
  // window.onload = function () {
  // Initialize the map
  // initMap();

  var locationObjects = initLocationObjects();
  createDropDownMenu(locationObjects);

  // handleDropDownChange(-1);
}
