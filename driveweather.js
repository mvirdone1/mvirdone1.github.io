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
    document.getElementById("lat-lon").value =
      document.getElementById("lat-lon").value + ";" + lat + "," + lon;

    // Remove the previous marker if it exists
    if (marker) {
      marker.setMap(null);
    }

    // Add a new marker to show the most recent click
    marker = new google.maps.Marker({
      position: event.latLng,
      map,
    });
  });

  updateDriveList();
}

function initMapDrive() {
  console.log("Init Map Callback from Google");
  showMapDrive();
}

function updateDriveList() {
  return 0;
}

function getWeatherOverview(driveObject, idx) {
  localURL =
    "https://forecast.weather.gov/MapClick.php?lat=" +
    driveObject.lat +
    "&lon=" +
    driveObject.lon;

  myDiv = $("<div>").attr("id", "forecast-" + idx);
  $("#dynamic-div").append(myDiv);

  myDiv.load(localURL + " #seven-day-forecast");
}

function getDriveURLParameters(driveString, driveObjects) {
  driveLocations = driveString.split(";");

  for (driveLocation of driveLocations) {
    var locationObject = {
      lat: 0,
      lon: 0,
      div: "",
    };
    coordinates = driveLocation.split(",");
    locationObject.lat = coordinates[0];
    locationObject.lon = coordinates[1];
    driveObjects.push(locationObject);
  }
}

function driveWeatherInit() {
  // Get the URL and see if we have pre-set
  const queryString = window.location.search;
  console.log(queryString);
  const urlParams = new URLSearchParams(queryString);
  var driveObjects = [];
  var driveObject = {
    lat: 41.73,
    lon: -111.83,
    div: "",
  };
  driveObjects.push(driveObject);

  if (urlParams.has("drive")) {
    console.log("Found a drive parameter");
    getDriveURLParameters(urlParams.get("drive"), driveObjects);
  }

  for (idx = 0; idx < driveObjects.length; idx++) {
    console.log(driveObjects[idx]);
    getWeatherOverview(driveObjects[idx], idx);
  }

  //console.log(driveObjects);

  // showMap();

  var intervalId = window.setInterval(function () {
    updateWeatherImages();
  }, 1000);
}

function updateWeatherImages() {
  $("#dynamic-div")
    .find("img")
    .each(function (index) {
      if ($(this).attr("class") != "fixed") {
        var $imgsrc = $(this).attr("src");
        console.log(index + ": " + $(this).attr("src"));

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
