function showMapDrive() {
  console.log("In Show Map");
  const mapHTML = `    <div id="map"></div>
    <form>
      <label for="lat-lon">Lat Lon List:</label>
      <input type="text" id="lat-lon" name="lat-lon" />
    </form>`;

  const forecastElement = document.getElementById("map-div");
  forecastElement.innerHTML = mapHTML;

  let lat = 40;
  let lon = -110;

  /* const map = new google.maps.Map($("map"), {
      center: { lat: lat, lng: lon },
      zoom: 5,
    });
*/
  const map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: lat, lng: lon },
    zoom: 5,
  });

  var marker;

  map.addListener("click", (event) => {
    lat = event.latLng.lat();
    lon = event.latLng.lng();
    appendLatLon(lat, lon);

    // Remove the previous marker if it exists
    if (marker) {
      marker.setMap(null);
    }

    // Add a new marker to show the most recent click
    marker = new google.maps.Marker({
      position: event.latLng,
      map,
    });
    updateDriveList();
  });
}

function appendLatLon(lat, lon) {
  document.getElementById("lat-lon").value =
    document.getElementById("lat-lon").value + lat + "," + lon + ";";
}

function initMapDrive() {
  console.log("Init Map Callback from Google");
  showMapDrive();
}

function updateDriveList() {
  driveLocations = document.getElementById("lat-lon").value.split(";");

  for (idx = 0; idx < driveLocations.length; idx++) {
    console.log("[" + idx + "]: " + driveLocations[idx]);
    coordinates = driveLocations[idx].split(",");
    getWeatherOverview(coordinates[0], coordinates[1], idx);
  }
}

function getWeatherOverview(lat, lon, idx) {
  localURL =
    "https://forecast.weather.gov/MapClick.php?lat=" + lat + "&lon=" + lon;

  console.log(lat, lon, idx);

  myDiv = $("<div>").attr("id", "forecast-" + idx);
  $("#dynamic-div").append(myDiv);

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
  // Get the URL and see if we have pre-set
  const queryString = window.location.search;
  console.log(queryString);
  const urlParams = new URLSearchParams(queryString);

  appendLatLon(41.73, -111.83);

  if (urlParams.has("drive")) {
    console.log("Found a drive parameter");
    getDriveURLParameters(urlParams.get("drive"));
  }

  var intervalId = window.setInterval(function () {
    console.log("Updating Images");
    updateWeatherImages();
  }, 1000);

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
