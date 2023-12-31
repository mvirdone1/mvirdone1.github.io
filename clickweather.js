function parseURL() {
  const queryString = window.location.search;
  console.log(queryString);
  const urlParams = new URLSearchParams(queryString);

  var lat = document.getElementById("lat").value;
  var lon = document.getElementById("lon").value;

  if (urlParams.has("lat") && urlParams.has("lon")) {
    console.log("Got lat lon");
    lat = parseFloat(urlParams.get("lat"));
    lon = parseFloat(urlParams.get("lon"));

    document.getElementById("lat").value = Math.round(lat * 1000) / 1000;
    document.getElementById("lon").value = Math.round(lon * 1000) / 1000;

    console.log("Showing the map " + lat + " " + lon);

    var locationObject = {
      lat: lat,
      lon: lon,
      locationName: "Forecast at Map Click",
      // weatherOffice: "SLC",
      chartObjects: [],
    };

    myMapManager.addMarker({ lat: lat, lng: lon }, "Forecast Location", "Wx");
    myMapManager.setMapCenter(lat, lon);

    // Update the URL for the image element
    updateWeatherPlot(locationObject);
    updateWeatherPlot(locationObject, 49, "weather-plot-2");
  }
}

function updateLinkURL() {
  var linkURL = "https://mvirdone1.github.io/liveweather.html?";

  var myPageLink = document.getElementById("page-link");

  var latValue = parseFloat(document.getElementById("lat").value);
  var lonValue = parseFloat(document.getElementById("lon").value);

  console.log(latValue + " " + lonValue);

  // This is a dumb logic check, but hopefully nobody is trying to use this tool at 0.000, 0.000 :shrug:
  if (latValue != 0 && lonValue != 0) {
    linkURL += "lat=" + latValue;
    linkURL += "&lon=" + lonValue;
  }

  // Set the href attribute using JavaScript
  myPageLink.href = linkURL;
}

function createFullMountainSuitePlots(locationObject, charts) {
  var attributes = {};

  // Plot 3 day snow change
  attributes.title = "Snow Change";
  attributes.days = 3;
  attributes.offset = true;
  attributes.chartType = chartTypes.snowDepth;

  locationObject.chartObjects.push(
    createChartObject(charts, locationObject.locationName, attributes)
  );

  // Plot 1 day snow change
  attributes.days = 1;

  locationObject.chartObjects.push(
    createChartObject(charts, locationObject.locationName, attributes)
  );
  // Plot 1 day temp
  attributes.title = "Temperature";
  attributes.days = 1;
  attributes.offset = false;
  attributes.chartType = chartTypes.temperature;

  locationObject.chartObjects.push(
    createChartObject(charts, locationObject.locationName, attributes)
  );

  // Plot 1 day wind
  attributes.title = "Wind Speed";
  attributes.chartType = chartTypes.windSpeed;

  locationObject.chartObjects.push(
    createChartObject(charts, locationObject.locationName, attributes)
  );

  // Plot 5 day total snow
  attributes.title = "Total Snow";
  attributes.days = 5;
  attributes.offset = false;
  attributes.chartType = chartTypes.snowDepth;

  locationObject.chartObjects.push(
    createChartObject(charts, locationObject.locationName, attributes)
  );
}

function handleStationList(allStations, returnedStations) {
  returnedStations.forEach((currentStation) => {
    console.log(currentStation.stid);

    const existingStation = allStations.find(
      (station) => station.stid === currentStation.stid
    );

    // If not found, add the new station to the array
    if (!existingStation) {
      allStations.push(currentStation);
    }
  });
}

function initMap() {
  const mapHTML = `    <div id="map"></div>
    <form>
      <label for="lat">Latitude:</label>
      <input type="text" id="lat" name="lat" />
      <br />
      <label for="lon">Longitude:</label>
      <input type="text" id="lon" name="lon" />
    </form>`;

  const forecastElement = document.getElementById("map-div");
  forecastElement.innerHTML = mapHTML;

  var linkHeader = document.createElement("a");
  linkHeader.id = "page-link";
  linkHeader.href = "#"; // Link to nowhere since it will be dynamically updated
  linkHeader.innerHTML = "<h4>Link to this page</h4>";
  document.getElementById("my-header").appendChild(linkHeader);

  // Default map center for Logan
  lat = 41.7713;
  lon = -111.8082;
  document.getElementById("lat").value = lat;
  document.getElementById("lon").value = lon;

  console.log("Init Map Callback from Google");
  const initialCenter = { lat: lat, lng: lon };
  const initialZoom = 7;
  const myMapManager = new MapManager("map", initialCenter, initialZoom);
  myMapManager.addMarker(initialCenter, "Forecast Location", "Wx");

  // Make this instance of the map manager a global variable
  window.myMapManager = myMapManager;

  myMapManager.setMapClickListener((position) => {
    // mapManager.addMarker(position, "");
    console.log(`Map clicked at: ${position.lat}, ${position.lng}`);

    // Clear the dynamic div and then add back in the weather images
    document.getElementById("dynamic-div").innerHTML = "";
    displayMapClickView();

    const numDecimals = 4;
    const roundFactor = 10 ** numDecimals;

    var lat = Math.round(position.lat * roundFactor) / roundFactor;
    var lon = Math.round(position.lng * roundFactor) / roundFactor;

    document.getElementById("lat").value = lat;
    document.getElementById("lon").value = lon;

    myMapManager.deleteAllMarkers();
    myMapManager.addMarker(position, "Forecast Location", "Wx");

    var locationObject = {
      lat: lat,
      lon: lon,
      locationName: "Forecast at Map Click",
      // weatherOffice: "SLC",
      chartObjects: [],
    };

    charts = [];

    createFullMountainSuitePlots(locationObject, charts);

    // Update the URL for the image element
    updateWeatherPlot(locationObject);
    updateWeatherPlot(locationObject, 49, "weather-plot-2");
    const contentElement = document.getElementById("dynamic-div");

    allStations = [];

    for (const chartObject of locationObject.chartObjects) {
      newHeading = document.createElement("h2");
      newHeading.textContent = chartObject.title;

      contentElement.appendChild(newHeading);

      var newCanvas = document.createElement("canvas");

      newCanvas.setAttribute("id", chartObject.divName);

      contentElement.appendChild(newCanvas);

      var radiusInfo = {};
      radiusInfo.lat = locationObject.lat;
      radiusInfo.lon = locationObject.lon;
      radiusInfo.radius = 50;
      radiusInfo.limit = 6;
      var returnedStations;
      returnedStations = displayWeatherData2(
        chartObject.charts,
        chartObject.divName,
        chartObject.numHours,
        chartObject.dataType,
        chartObject.offset,
        radiusInfo
      );

      console.log(returnedStations);
      handleStationList(allStations, returnedStations);
    }
    console.log("all Stations:");
    console.log(allStations);

    updateLinkURL();
  });

  updateLinkURL();
  displayMapClickView();
  parseURL();
}
