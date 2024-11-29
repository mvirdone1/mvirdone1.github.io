// Debug variables
const removeAbsoluteSnow = false;

// const globalStationData = new persistentDataModule();

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

  var lat = parseFloat(document.getElementById("lat").value);
  var lon = parseFloat(document.getElementById("lon").value);

  if (urlParams.has("lat") && urlParams.has("lon")) {
    console.log("Got lat lon");
    lat = parseFloat(urlParams.get("lat"));
    lon = parseFloat(urlParams.get("lon"));

    document.getElementById("lat").value = Math.round(lat * 1000) / 1000;
    document.getElementById("lon").value = Math.round(lon * 1000) / 1000;
  }

  const position = { lat: lat, lng: lon };

  //.html?stations=TGLU1,TGSU1,LGS,CRDUT,PRSUT
  const stations = urlParams.get("stations")?.split(",") || [];
  console.log(stations);
  // Output: ["TGLU1", "TGSU1", "LGS", "CRDUT", "PRSUT"]

  /*
    charts.push("TGLU1");
  charts.push("TGSU1");
  charts.push("LGS");
  charts.push("CRDUT");
  charts.push("PRSUT");
  */

  clickWeatherClickListener(position, false, stations);
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
  attributes.chartType = CHART_TYPES.snowDepth;

  locationObject.chartObjects.push(
    createChartObject(charts, locationObject.locationName, attributes)
  );

  // Plot 2 day temp
  attributes.title = "Temperature";
  attributes.days = 2;
  attributes.offset = false;
  attributes.chartType = CHART_TYPES.temperature;

  locationObject.chartObjects.push(
    createChartObject(charts, locationObject.locationName, attributes)
  );

  // Plot 2 day wind
  attributes.title = "Wind Speed";
  attributes.chartType = CHART_TYPES.windSpeed;

  locationObject.chartObjects.push(
    createChartObject(charts, locationObject.locationName, attributes)
  );

  // Plot 5 day total snow
  if (!removeAbsoluteSnow) {
    attributes.title = "Total Snow";
    attributes.days = 5;
    attributes.offset = false;
    attributes.chartType = CHART_TYPES.snowDepth;

    locationObject.chartObjects.push(
      createChartObject(charts, locationObject.locationName, attributes)
    );
  }

  attributes.title = "SWE";
  attributes.days = 3;
  attributes.offset = false;
  attributes.chartType = CHART_TYPES.SWE;

  locationObject.chartObjects.push(
    createChartObject(charts, locationObject.locationName, attributes)
  );
}

// This function is a callback from inside displayWeatherData2
// When the data is returend from the weather stations, this updates
// the legend table and the latest measurement data in the table
function postAPIDataCallback(dataSets) {
  // Iterate over the returned data sets and see if our data-set-of-data-sets
  // already has this station id for a different measurement,
  // If found, put the station in at the same index
  dataSets.forEach((currentDataSet) => {
    globalStationData.addStationData(currentDataSet);
  });

  updateLegendTable();
  // globalStationData.getChangeInData(chartTypes.snowDepth, 2 * 24);

  tabulateStationMeasurements();
}

function printStationTable(
  stationMeasurements,
  sortParameter,
  attributesToPrint
) {
  if (sortParameter.ascending) {
    stationMeasurements.sort(
      (a, b) => a[sortParameter.parameter] - b[sortParameter.parameter]
    );
  } else {
    stationMeasurements.sort(
      (a, b) => b[sortParameter.parameter] - a[sortParameter.parameter]
    );
  }

  let myTable = '<table border="1" cellpadding="5">\n';

  // Build the headings
  myTable += buildTableRow(attributesToPrint.map((obj) => obj.title));

  // Build the sub-table of measurement values only
  const attributesList = attributesToPrint.map((item) => item.attribute);

  // Filter the stationMeasurements array and return arrays of values
  const filteredMeasurements = stationMeasurements.map((station) => {
    return attributesList.map((attribute) => station[attribute]);
  });

  filteredMeasurements.forEach((station) => {
    const formattedStation = station.map((value, index) => {
      // Check if 'fixed' exists for the corresponding attribute in attributesToPrint
      const fixedDigits = attributesToPrint[index].fixed;

      // Check if the value is a number and 'fixed' is defined
      if (typeof value === "number" && fixedDigits !== undefined) {
        return value.toFixed(fixedDigits); // Format to fixed-point string
      }

      // If no 'fixed' attribute, return the value as is
      return value;
    });
    myTable += buildTableRow(formattedStation);
  });

  myTable += "</table>";
  return myTable;
}

function tabulateStationMeasurements() {
  const numDays = 1;
  const numHours = numDays * 24;

  let tabulateDataHtml = "";

  const tableParameters = [];
  tableParameters.push({
    type: CHART_TYPES.snowDepth,
    hours: numHours,
    title: "Snow Depth",
  });
  tableParameters.push({
    type: CHART_TYPES.snowDepth,
    hours: 72,
    title: "Snow Depth",
  });
  tableParameters.push({
    type: CHART_TYPES.SWE,
    hours: numHours,
    title: "Snow Water Equivalent",
  });

  tableParameters.forEach((currentTable) => {
    let stationMeasurements = globalStationData.getChangeInData(
      currentTable.type,
      currentTable.hours
    );

    tabulateDataHtml +=
      "<h2>" + currentTable.title + " " + currentTable.hours + " Hours</h2>\n";

    const sortParameters = [];
    sortParameters.push({
      parameter: "endValue",
      ascending: false,
      title: "Stations By Latest Measurement",
    });
    sortParameters.push({
      parameter: "elevation",
      ascending: true,
      title: "Stations By Elevation",
    });
    sortParameters.push({
      parameter: "delta",
      ascending: true,
      title: "Stations By Change In Measurement",
    });

    const attributesToPrint = [];
    attributesToPrint.push({ attribute: "name", title: "Station" });
    attributesToPrint.push({
      attribute: "elevation",
      title: "Elevation (ft)",
      fixed: 0,
    });
    attributesToPrint.push({ attribute: "min", title: "Min", fixed: 1 });
    attributesToPrint.push({ attribute: "max", title: "Max", fixed: 1 });
    attributesToPrint.push({
      attribute: "endValue",
      title: "Latest",
      fixed: 1,
    });
    attributesToPrint.push({
      attribute: "delta",
      title: `Change in ${numHours} hours`,
      fixed: 1,
    });

    sortParameters.forEach((sortParameter) => {
      tabulateDataHtml += "<h3>" + sortParameter.title + "</h3>\n";
      tabulateDataHtml += printStationTable(
        stationMeasurements,
        sortParameter,
        attributesToPrint
      );
    });
  });

  const bonusElement = document.getElementById("hide-show-bonus-content-child");
  bonusElement.innerHTML = tabulateDataHtml;
}

function updateLegendTable() {
  // Sample map center
  const mapCenter = {
    lat: parseFloat(document.getElementById("lat").value),
    lon: parseFloat(document.getElementById("lon").value),
  };

  let legendTableHTML = globalStationData.prepareLegendTable(mapCenter);

  // I don't love how this is tied to me hard-coding the div id, but it'll have to do for now
  const legendElement = document.getElementById("hide-show-legend-child");
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

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(updateLocationFromBrowser);
  } else {
    alert("Cannot get location");
  }
}

function updateLocationFromBrowser(position) {
  var lat = position.coords.latitude;
  var lon = position.coords.longitude;

  document.getElementById("lat").value = Math.round(lat * 1000) / 1000;
  document.getElementById("lon").value = Math.round(lon * 1000) / 1000;

  const myPosition = { lat: lat, lng: lon };
  clickWeatherClickListener(myPosition, false);
}

// 11/25/24 - Updating this function to somewhat revert to allow adding a list of named stations.
//
// Fortunately I hadn't removed the ability to handle a list of "charts" but really this array of charts
// is actually a list of weather station IDs. The only place the charts list gets set is in the parseURL()
// function. This is also the only place that I set the argument to this function.
//
// Way-way down in the function calls in displayWeatherData2() does it finally make a decision on precidence
// for using the chart list over the lat/lon/radius configuration
function clickWeatherClickListener(position, realClick = true, charts = []) {
  // Clear the dynamic div and then add back in the weather images
  document.getElementById("dynamic-div").innerHTML = "";

  createToggleChildElements("dynamic-div", "Legend");

  // Create the div for the forecasts from weather.gov
  const ForecastElement = createToggleChildElements(
    "dynamic-div",
    "Forecast Charts"
  );

  // This function does all the addition of everything except the weather plots
  displayWeatherGovHourlyForecast(ForecastElement);

  myMapManager.setMapCenter(position.lat, position.lng);

  if (realClick) {
    myMapManager.setZoom(12);
  }

  // Clear the list of weather stations
  // globalStationData.setAllStations([]);
  globalStationData.resetPersistentData();

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

  // charts = [];
  /*
  charts.push("TGLU1");
  charts.push("TGSU1");
  charts.push("LGS");
  charts.push("CRDUT");
  charts.push("PRSUT");
  */

  const weatherRadarDiv = createToggleChildElements(
    "dynamic-div",
    "Weather Radar"
  );
  const numRadarStations = 6;
  weatherRadarDiv.setAttribute("class", "tab-container");
  createTabElements(weatherRadarDiv.id, numRadarStations);
  console.log("Hi");
  var myStations = findNearestStations(lat, lon, numRadarStations);
  console.log(myStations);

  for (var idx = 0; idx < myStations.length; idx++) {
    const stationId = myStations[idx].stationId;

    const stationText =
      myStations[idx].stationName +
      " (" +
      stationId +
      ") " +
      Math.round(myStations[idx].distance) +
      " mi " +
      bearingToCompass(myStations[idx].heading);
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
  createToggleChildElements("dynamic-div", "Bonus Content");

  updateLinkURL();
}

function initMap() {
  const mapHTML = `    
    <hr>
    <div id="map"></div>
    <form>
      <label for="lat">Latitude:</label>
      <input type="text" id="lat" name="lat" />
      <br />
      <label for="lon">Longitude:</label>
      <input type="text" id="lon" name="lon" />
    </form>


    `;

  const forecastElement = document.getElementById("map-div");
  forecastElement.innerHTML = mapHTML;

  var linkHeader = document.createElement("a");
  linkHeader.id = "page-link";
  linkHeader.href = "#"; // Link to nowhere since it will be dynamically updated
  linkHeader.innerHTML = "<h4>Link to this page</h4>";
  document.getElementById("my-header").appendChild(linkHeader);

  document.getElementById("my-header").innerHTML =
    document.getElementById("my-header").innerHTML +
    '<button onclick="getLocation()">Use My Location</button>';

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

  const globalStationData = new persistentWeatherData();
  window.globalStationData = globalStationData;

  myMapManager.setMapClickListener((position) => {
    // mapManager.addMarker(position, "");
    console.log(`Map clicked at: ${position.lat}, ${position.lng}`);
    clickWeatherClickListener(position);
  });

  parseURL();
}
