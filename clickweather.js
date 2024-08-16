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
  }

  const position = { lat: lat, lng: lon };
  clickWeatherClickListener(position, false);
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

  document.title = "Map Click Weather" + " (" + latValue + "," + lonValue + ")";
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

  // Plot 2 day temp
  attributes.title = "Temperature";
  attributes.days = 2;
  attributes.offset = false;
  attributes.chartType = chartTypes.temperature;

  locationObject.chartObjects.push(
    createChartObject(charts, locationObject.locationName, attributes)
  );

  // Plot 2 day wind
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
        lat: parseFloat(currentStation.lat),
        lng: parseFloat(currentStation.lon),
      };

      myMapManager.addMarker(
        stationLocation,
        currentStation.name,
        currentStation.stid,
        clickWeatherColors[allStationIndex]
      );
    }

    currentDataSet.borderColor = rgbArrayToString(
      clickWeatherColors[allStationIndex]
    );

    var lastDataPoint = currentDataSet.data.length - 1;
    var stationType = currentStation.stationType;

    // If it's raw value and not offset, update the latest value table.
    if (currentStation.displayOffset == false) {
      // Update the latest measurements
      latestMeasurements[allStationIndex][stationType].time =
        currentDataSet.data[lastDataPoint].x;

      latestMeasurements[allStationIndex][stationType].value =
        currentDataSet.data[lastDataPoint].y;
    }

    /*
    allStations[allStationIndex].latestData[stationType].time =
      currentDataSet.data[lastDataPoint].x;
    allStations[allStationIndex].latestData[
      parseInt(currentStation.stationType)
    ].value = currentDataSet.data[lastDataPoint].y;
    */
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
  legendTableHTML += "<tr>";

  var headings = [
    "ID",
    "Dist (mi)",
    "Name",
    "Elev (ft)",
    "Temp (f)",
    "Snow (in)",
    "Wind (mph)",
  ];

  // Iterate over the headings and print each one
  headings.forEach((heading) => {
    legendTableHTML += "<th>" + heading + "</th>";
  });

  legendTableHTML += "</tr>";
  // ("<tr><th>ID</th><th>Dist (mi)</th><th>Name</th><th>Elevation</th></tr>");

  stationsWithDistance.forEach((station, index) => {
    const color = rgbArrayToString(clickWeatherColors[station.originalIndex]);

    legendTableHTML += `<tr>`;
    legendTableHTML += `<td style="background-color: ${color};">${station.stid}</td>`;
    legendTableHTML += `<td>${station.distance_mi}</td>`;
    legendTableHTML += `<td>${station.name}</td>`;
    legendTableHTML += `<td>${station.elevation}</td>`;

    // Iterate over the chartTypes object
    for (const key in chartTypes) {
      const colIndex = chartTypes[key];
      legendTableHTML += printNiceWeatherCell(
        latestMeasurements[station.originalIndex][colIndex]
      );

      // Do something with the key and value
    }

    legendTableHTML += "</tr>";
  });

  legendTableHTML += "</table>";
  const legendElement = document.getElementById("map-legend");
  legendElement.innerHTML = legendTableHTML;
}

function printNiceWeatherCell(measurement) {
  if (!measurement.value) {
    return "<td>&nbsp</td>";
  } else {
    var cellString = "<td>";
    cellString += parseFloat(measurement.value).toFixed(0);
    cellString += " <sub>@" + timeUTCToLocalString(measurement.time);
    cellString += "</sub></td>";
    return cellString;
  }
}

function clickWeatherClickListener(position, realClick = true) {
  // Clear the dynamic div and then add back in the weather images
  document.getElementById("dynamic-div").innerHTML = "";
  // This function does all the addition of everything except the weather plots
  displayMapClickView();

  myMapManager.setMapCenter(position.lat, position.lng);

  if (realClick) {
    myMapManager.setZoom(12);
  }

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
    locationName: "Conditions at Map Click",
    // weatherOffice: "SLC",
    chartObjects: [],
  };

  charts = [];

  const weatherRadarDiv = createToggleChildElements(
    "dynamic-div",
    "Weather Radar"
  );
  const numStations = 6;
  weatherRadarDiv.setAttribute("class", "tab-container");
  createTabElements(weatherRadarDiv.id, numStations);
  console.log("Hi");
  var myStations = findNearestStations(lat, lon, numStations);
  console.log(myStations);

  for (var idx = 0; idx < myStations.length; idx++) {
    const stationId = myStations[idx].stationId;
    const stationText = myStations[idx].stationName + " (" + stationId + ")";
    const stationImage =
      "https://radar.weather.gov/ridge/standard/" + stationId + "_loop.gif";
    setTabProperties(idx, stationText, stationImage, stationId);
  }

  createFullMountainSuitePlots(locationObject, charts);

  // Update the URL for the image element
  updateWeatherPlot(locationObject);
  updateWeatherPlot(locationObject, 49, "weather-plot-2");

  // Get the dynamic div where we put all the forecast stuff.
  const contentElement = createToggleChildElements(
    "dynamic-div",
    "Historical Charts"
  );

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
    radiusInfo.limit = 5;
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
  const initialZoom = 10;
  const myMapManager = new MapManager("map", initialCenter, initialZoom);
  myMapManager.addMarker(initialCenter, "Forecast Location", "Wx");

  // Make this instance of the map manager a global variable
  window.myMapManager = myMapManager;

  myMapManager.setMapClickListener((position) => {
    // mapManager.addMarker(position, "");
    console.log(`Map clicked at: ${position.lat}, ${position.lng}`);
    clickWeatherClickListener(position);
  });

  // updateLinkURL();
  parseURL();
  displayMapClickView();
  parseURL();
}
