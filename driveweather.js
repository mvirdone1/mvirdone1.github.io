// var myGMap;

function showMapDrive() {
  console.log("In Show Map");

  let lat = 40;
  let lon = -110;

  /* const map = new google.maps.Map($("map"), {
      center: { lat: lat, lng: lon },
      zoom: 5,
    });
*/
  const myGMap = new google.maps.Map(document.getElementById("map"), {
    center: { lat: lat, lng: lon },
    zoom: 5,
  });

  var marker;

  myGMap.addListener("click", (event) => {
    lat = Math.round(event.latLng.lat() * 100) / 100;
    lon = Math.round(event.latLng.lng() * 100) / 100;

    appendLatLon(lat, lon);

    // Remove the previous marker if it exists
    if (marker) {
      marker.setMap(null);
    }

    // Add a new marker to show the most recent click
    marker = new google.maps.Marker({
      position: event.latLng,
      map: myGMap,
    });
    updateDriveList();
  });
}

showMapDrive();
function appendLatLon(lat, lon) {
  oldValue = document.getElementById("lat-lon").value;
  document.getElementById("lat-lon").value = oldValue + lat + "," + lon + ";";
}

function initMapDrive() {
  console.log("Init Map Callback from Google");
  showMapDrive();
}

function updateDriveList() {
  driveLocations = document.getElementById("lat-lon").value.split(";");
  // Clear the inner HTML every time we refresh the list
  $("#dynamic-div").empty();

  linkURL =
    "https://mvirdone1.github.io/driveweather.html?drive=" +
    document.getElementById("lat-lon").value;
  $("#drive-link").attr("href", linkURL);

  for (idx = 0; idx < driveLocations.length - 1; idx++) {
    console.log("[" + idx + "]: " + driveLocations[idx]);
    coordinates = driveLocations[idx].split(",");
    getWeatherOverview(coordinates[0], coordinates[1], idx);
  }

  updateWeatherImages();
}

function deleteLocation(deleteIdx) {
  driveLocations = document.getElementById("lat-lon").value.split(";");

  $("#lat-lon").val("");
  for (idx = 0; idx < driveLocations.length - 1; idx++) {
    if (idx != deleteIdx) {
      coordinates = driveLocations[idx].split(",");
      appendLatLon(coordinates[0], coordinates[1]);
    }
  }
  updateDriveList();
}

function getWeatherOverview(lat, lon, idx) {
  localURL =
    "https://forecast.weather.gov/MapClick.php?lat=" + lat + "&lon=" + lon;

  console.log(lat, lon, idx);

  var printIdx = idx + 1;
  $("#dynamic-div").append("<h1> Location " + printIdx + "</h1>");

  var deleteButton = $(
    '<button id="deleteButton-' + idx + '">Delete Location ' + idx + "</button>"
  );

  // Append the button to a container div
  $("#dynamic-div").append(deleteButton);

  myDiv = $("<div>").attr("id", "forecast-" + idx);

  $("#dynamic-div").append(myDiv);

  // Add a click event listener to the button
  deleteButton.on("click", function () {
    deleteLocation(idx);
  });

  myDiv.load(localURL + " #seven-day-forecast");
}

function getDriveURLParameters(driveString) {
  driveLocations = driveString.split(";");

  for (driveLocation of driveLocations) {
    coordinates = driveLocation.split(",");
    if (coordinates.length == 2) {
      appendLatLon(coordinates[0], coordinates[1]);
    }
  }
}

function driveWeatherInit() {
  // Setup the map pane
  const mapHTML = `    <div id="map"></div>
    <form>
      <label for="lat-lon">Lat Lon List:</label>
      <input type="text" id="lat-lon" name="lat-lon" />
    </form>
    <a id="drive-link" href="">Linkable Version</a>
    `;

  const forecastElement = document.getElementById("map-div");
  forecastElement.innerHTML = mapHTML;

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
  driveLocations = document.getElementById("lat-lon").value.split(";");

  $("#lat-lon").val("");

  for (idx = 0; idx < driveLocations.length - 1; idx++) {
    coordinates = driveLocations[driveLocations.length - 2 - idx].split(",");
    appendLatLon(coordinates[0], coordinates[1]);
  }
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
