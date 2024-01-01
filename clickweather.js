var allStations = [];
var latestMeasurements = [];

const clickWeatherColors = [
  [230, 25, 75], // Red
  [60, 180, 75], // Green
  [255, 225, 25], // Yellow
  [67, 99, 216], // Blue
  [245, 130, 49], // Orange
  [145, 30, 180], // Purple
  [70, 240, 240], // Cyan
  [240, 50, 230], // Magenta
  [188, 246, 12], // Lime
  [250, 190, 190], // Pink
  [0, 128, 128], // Teal
  [230, 190, 255], // Lavender
  [154, 99, 36], // Brown
  [255, 250, 200], // Beige
  [128, 0, 0], // Maroon
  [170, 255, 195], // Mint
  [128, 128, 0], // Olive
  [255, 216, 177], // Peach
  [0, 0, 117], // Navy
  [128, 128, 128], // Gray
];

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
  var linkURL = "https://mvirdone1.github.io/clickweather.html?";

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

function postAPIDataCallback(dataSets) {
  dataSets.forEach((currentDataSet) => {
    var allStationIndex = allStations.findIndex(
      (station) => station.stid === currentDataSet.station.stid
    );
    const currentStation = currentDataSet.station;

    // If not found, add the new station to the array
    if (allStationIndex === -1) {
      // Empty 3x2 array
      const latestData = [
        { time: "", value: "" },
        { time: "", value: "" },
        { time: "", value: "" },
      ];

      allStations.push(currentStation);
      latestMeasurements.push(latestData);
      // allStations.push({ currentStation, latestData });
      allStationIndex = allStations.length - 1;

      /*
        station.lat = data.STATION[dataSetIdx].LATITUDE;
        station.lon = data.STATION[dataSetIdx].LONGITUDE;
        station.name = data.STATION[dataSetIdx].NAME;
        station.stid = data.STATION[dataSetIdx].STID;
        station.elevation = data.STATION[dataSetIdx].ELEVATION;
        station.stationType = stationType;

      */

      const stationLocation = {
        lat: parseFloat(currentDataSet.station.lat),
        lng: parseFloat(currentDataSet.station.lon),
      };

      myMapManager.addMarker(
        stationLocation,
        currentDataSet.station.name,
        currentDataSet.station.stid,
        clickWeatherColors[allStationIndex]
      );
    }

    currentDataSet.borderColor = rgbArrayToString(
      clickWeatherColors[allStationIndex]
    );

    // Update the latest measurements
    // allStations[allStationIndex].latestData[currentStation.stationType] = 0;
  });

  updateLegendTable();
}

function updateLegendTable() {
  // Sample map center
  const mapCenter = {
    lat: document.getElementById("lat").value,
    lon: document.getElementById("lon").value,
  };

  // Calculate distances and add original index to each station
  const stationsWithDistance = allStations.map((station, index) => {
    const distance = calculateLatLonDistance(
      station.lat,
      station.lon,
      mapCenter.lat,
      mapCenter.lon
    );

    var distance_mi = distance.miles.toFixed(1);
    return { ...station, distance_mi, originalIndex: index };
  });

  // Sort stations based on distance
  stationsWithDistance.sort((a, b) => a.distance_mi - b.distance_mi);

  let legendTableHTML = "";
  legendTableHTML += ` 
  <button onclick="toggleTableVisibility('legend-table')">Show/Hide Legend</button> `;

  legendTableHTML += "<table id='legend-table' border='1' cellpadding='5'>";
  legendTableHTML +=
    "<tr><th>ID</th><th>Dist (mi)</th><th>Name</th><th>Elevation</th></tr>";

  stationsWithDistance.forEach((station, index) => {
    const color = rgbArrayToString(clickWeatherColors[station.originalIndex]);

    legendTableHTML += `<tr>`;
    legendTableHTML += `<td style="background-color: ${color};">${station.stid}</td>`;
    legendTableHTML += `<td>${station.distance_mi}</td>`;
    legendTableHTML += `<td>${station.name}</td>`;
    legendTableHTML += `<td>${station.elevation}</td>`;
    legendTableHTML += "</tr>";
  });

  legendTableHTML += "</table>";
  const legendElement = document.getElementById("map-legend");
  legendElement.innerHTML = legendTableHTML;
}

function clickWeatherClickListener(position) {
  // Clear the dynamic div and then add back in the weather images
  document.getElementById("dynamic-div").innerHTML = "";
  displayMapClickView();

  myMapManager.setMapCenter(position.lat, position.lng);
  myMapManager.setZoom(10);

  // Clear the list of weather stations
  allStations = [];

  const numDecimals = 4;
  const roundFactor = 10 ** numDecimals;

  var lat = Math.round(position.lat * roundFactor) / roundFactor;
  var lon = Math.round(position.lng * roundFactor) / roundFactor;

  document.getElementById("lat").value = position.lat.toFixed(4);
  document.getElementById("lon").value = position.lng.toFixed(4);

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
    radiusInfo.radius = 20;
    radiusInfo.limit = 6;
    var returnedStations;

    returnedStations = displayWeatherData2(
      chartObject.charts,
      chartObject.divName,
      chartObject.numHours,
      chartObject.dataType,
      chartObject.offset,
      radiusInfo,
      postAPIDataCallback
    );

    console.log(returnedStations);
    // handleStationList(allStations, returnedStations);
  }

  updateLinkURL();
}

function initMap() {
  const mapHTML = `    <div id="map"></div>
    <form>
      <label for="lat">Latitude:</label>
      <input type="text" id="lat" name="lat" />
      <br />
      <label for="lon">Longitude:</label>
      <input type="text" id="lon" name="lon" />
    </form>
    
    <div id="map-legend"></div>
    </br>
    `;

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
    clickWeatherClickListener(position);
  });

  updateLinkURL();
  displayMapClickView();
  parseURL();
}
