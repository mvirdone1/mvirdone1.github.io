// Debug variables
const removeAbsoluteSnow = false;

// const myClickWeatherManager = new persistentDataModule();

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

  var stationMode = STATION_LIST_MODES.position;

  //.html?stations=TGLU1,TGSU1,LGS,CRDUT,PRSUT
  const stations = urlParams.get("stations")?.split(",") || [];

  if (stations.length > 0) {
    stationMode = STATION_LIST_MODES.stations;
  }

  myClickWeatherManager.setPositionAttributes(
    stationMode,
    { lat: position.lat, lon: position.lng },
    stations
  );

  console.log(stations);

  var urlChartMode = "";

  if (urlParams.get("chartMode")) {
    urlChartMode = urlParams.get("chartMode").toLowerCase();
  }

  // Switch on the chart modes, and also ignore case by making the input all lower
  switch (urlChartMode) {
    case "local":
      myClickWeatherManager.createLocalPlots();
      break;

    // If it's the custom type, make sure the custom data exists
    case "custom":
      // 12/2 - Tested a very basic case
      // chartMode=custom&customCharts=Hi,1,1,1,1,1
      if (urlParams.has("customCharts")) {
        myClickWeatherManager.setCustomChartsFromURL(
          urlParams.get("customCharts")
        );
      } else {
        alert(
          "Custom chart type selected, but customCharts parameter not set. Using snow charts"
        );
        myClickWeatherManager.createFullMountainSuitePlots();
      }
      break;

    case "snow":
    default:
      myClickWeatherManager.createFullMountainSuitePlots();

      break;
  }

  console.log("Charts: " + urlParams?.get("charts") || "No Charts");

  // Create all the charts and data based on what was in the URL
  clickWeatherClickListener(position, false, stations);

  // Update visibility of elements based on URL
  if (urlParams.get("hideDiv")) {
    setAllToggleDivOnURLString(urlParams.get("hideDiv").toLowerCase());
  }
}

function updateLinkURL() {
  var linkURL = "https://mvirdone1.github.io/clickweather.html?";

  const positionAttributes = myClickWeatherManager.getPositionAttributes();

  // Either include the lat lon or the station list, depending on how
  // the current session is configured
  if (positionAttributes.stationMode == STATION_LIST_MODES.stations) {
    linkURL += "stations=" + positionAttributes.stations.join(",");
    document.title =
      "Map Click Weather Station List (" +
      positionAttributes.stations.join(",") +
      ")";
  } else {
    let localLat = positionAttributes.position.lat.toFixed(4);
    let localLon = positionAttributes.position.lon.toFixed(4);
    linkURL += "lat=" + localLat;
    linkURL += "&lon=" + localLon;
    document.title =
      "Map Click Weather" + " (" + localLat + "," + localLon + ")";
  }

  linkURL +=
    "&chartMode=" + CHART_MODE_FOR_URL[myClickWeatherManager.getChartMode()];

  if (myClickWeatherManager.getChartMode() == CHART_MODES.custom) {
    linkURL += "&customCharts=" + myClickWeatherManager.getCustomChartsToURL();
  }

  const toggleElements = getAllToggleChildren();

  const allDivAreVisible = toggleElements.every(
    (item) => item.display === "block"
  );

  // If we have some hidden div, add that to the URL
  if (!allDivAreVisible) {
    const firstLetters = toggleElements.map((item) => item.display[0]).join("");
    linkURL += "&hideDiv=" + firstLetters;
  }

  // Set the href attribute using JavaScript
  var myPageLink = document.getElementById("page-link-position");
  myPageLink.href = linkURL;

  console.log("Update Link URL");
}

// This function is a callback from inside displayWeatherData2
// When the data is returend from the weather stations, this updates
// the legend table and the latest measurement data in the table
function postAPIDataCallback(dataSets) {
  // Iterate over the returned data sets and see if our data-set-of-data-sets
  // already has this station id for a different measurement,
  // If found, put the station in at the same index
  dataSets.forEach((currentDataSet) => {
    myClickWeatherManager.addStationData(currentDataSet);
  });

  updateLegendTable();
  myMapManager.setZoomOnMarkerBounds();
  // myClickWeatherManager.getChangeInData(chartTypes.snowDepth, 2 * 24);

  tabulateStationMeasurements();
}

function printStationTable(
  stationMeasurements,
  sortParameter,
  attributesToPrint,
  tableId
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

  let myTable = `<table id="${tableId}" border="1" cellpadding="5">\n`;

  // Build the headings
  myTable += buildTableRow(
    attributesToPrint.map((obj) => obj.title),
    true
  );

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

  const tablesToSort = [];

  const tableParameters = [];

  console.log(myClickWeatherManager.getDefinedCharts());

  myClickWeatherManager.getDefinedCharts().forEach((currentChart) => {
    currentChart.tables.forEach((currentTable) => {
      const tempTableParameters = {
        type: currentChart.chartType,
        hours: currentTable.hours,
        title: currentChart.title,
      };

      tableParameters.push(tempTableParameters);
    });
  });

  tableParameters.forEach((currentTable) => {
    let stationMeasurements = myClickWeatherManager.getChangeInData(
      currentTable.type,
      currentTable.hours
    );

    const fullTableTitle = currentTable.title + " " + currentTable.hours;

    tabulateDataHtml += "<h2>" + fullTableTitle + " Hours</h2>\n";

    const sortParameters = [];
    sortParameters.push({
      parameter: "endValue",
      ascending: false,
    });
    /*
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

    */

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
      title: `Change in ${currentTable.hours} hours`,
      fixed: 1,
    });

    sortParameters.forEach((sortParameter) => {
      const tableId = divify(fullTableTitle);
      tabulateDataHtml += printStationTable(
        stationMeasurements,
        sortParameter,
        attributesToPrint,
        tableId
      );

      tablesToSort.push(tableId);
    });
  });

  const sortableTablesElement = document.getElementById(
    "hide-show-sortable-tables-child"
  );

  /*
  const tableDataStealthFormInstance = new stealthForm(
    sortableTablesElement,
    "Manage Tables",
    "Historical Chart Attributes",
    updateTableFormList,
    myClickWeatherManager
  );

  tableDataStealthFormInstance.addCustomButton(
    "Cancel",
    stealthFormCancelChartCallback
  );
*/

  sortableTablesElement.innerHTML = tabulateDataHtml;

  clickWeatherTableCRUD.createWeatherTableStealthCRUD(
    sortableTablesElement,
    myClickWeatherManager
  );

  tablesToSort.forEach((tableId, index) => {
    makeTableSortable(tableId);
  });
}

function updateLegendTable() {
  // Sample map center
  const mapCenter = {
    lat: parseFloat(document.getElementById("lat").value),
    lon: parseFloat(document.getElementById("lon").value),
  };

  let legendTableHTML = myClickWeatherManager.prepareLegendTable(mapCenter);

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

function getBrowserLocation() {
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

// Main function
function updateTableFormList(stealthFormInstance) {
  // Get the div element where the form content is going to reside
  const formContentDiv = document.getElementById(
    stealthFormInstance.getStealthFormContentId()
  );

  let isFirstRow = true;

  myClickWeatherManager.getDefinedCharts().forEach((currentChart) => {
    tableFormPrintRow(formContentDiv, currentChart, isFirstRow);
    isFirstRow = false; // After the first row, no need for headers
  });
}

// 11/25/24 - Updating this function to somewhat revert to allow adding a list of named stations.
//
// Fortunately I hadn't removed the ability to handle a list of "charts" but really this array of charts
// is actually a list of weather station IDs. The only place the charts list gets set is in the parseURL()
// function. This is also the only place that I set the argument to this function.
// 12/2/24 - Renamed "charts" to "weatherStations"
//
// Way-way down in the function calls in displayWeatherData2() does it finally make a decision on precidence
// for using the chart list over the lat/lon/radius configuration
function clickWeatherClickListener(
  position,
  realClick = true,
  weatherStations = []
) {
  // Clear the dynamic div and then add back in the weather images
  document.getElementById("dynamic-div").innerHTML = "";

  createToggleChildElements("dynamic-div", "Legend", updateLinkURL);

  // Create the div for the forecasts from weather.gov
  const ForecastElement = createToggleChildElements(
    "dynamic-div",
    "Forecast Charts",
    updateLinkURL
  );

  // This function does all the addition of everything except the weather plots
  displayWeatherGovHourlyForecast(ForecastElement);

  myMapManager.setMapCenter(position.lat, position.lng);

  let stationMode = undefined;
  if (realClick) {
    stationMode = STATION_LIST_MODES.position;
  }

  // Update the position of the weather manager
  myClickWeatherManager.setPositionAttributes(stationMode, {
    lat: position.lat,
    lon: position.lng,
  });

  if (realClick) {
    myMapManager.setZoom(12);
  }

  // Clear the list of weather stations
  // myClickWeatherManager.setAllStations([]);
  myClickWeatherManager.resetReturnedDataAndStations();

  const numDecimals = 4;
  const roundFactor = 10 ** numDecimals;

  var lat = Math.round(position.lat * roundFactor) / roundFactor;
  var lon = Math.round(position.lng * roundFactor) / roundFactor;

  document.getElementById("lat").value = position.lat.toFixed(4);
  document.getElementById("lon").value = position.lng.toFixed(4);

  myMapManager.deleteAllMarkers();
  myMapManager.addMarkerLegacy(position, "Forecast Location", "Wx");

  var locationObject = {
    lat: lat,
    lon: lon,
    locationName: "Conditions at Map Click",
    // weatherOffice: "SLC",
    chartObjects: [],
  };

  const weatherRadarDiv = createToggleChildElements(
    "dynamic-div",
    "Weather Radar",
    updateLinkURL
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

  // createFullMountainSuitePlots(locationObject, weatherStations);

  // myClickWeatherManager.createFullMountainSuitePlots();

  // Update the URL for the image element
  updateWeatherPlot(locationObject);
  updateWeatherPlot(locationObject, 49, "weather-plot-2");

  // Get the dynamic div where we put all the forecast stuff.
  const chartContentElement = createToggleChildElements(
    "dynamic-div",
    "Historical Charts",
    updateLinkURL
  );

  //***********************************/
  // Code for the hideable form/menu for managing charts
  //***********************************/
  clickWeatherChartCRUD.createWeatherChartStealthCRUD(
    chartContentElement,
    myClickWeatherManager
  );

  //***********************************/
  // Create the charts themselves
  //***********************************/
  for (const chartObject of myClickWeatherManager.getDefinedCharts()) {
    newHeading = document.createElement("h2");
    newHeading.textContent = chartObject.fullTitle;

    chartContentElement.appendChild(newHeading);

    var newCanvas = document.createElement("canvas");

    newCanvas.setAttribute("id", chartObject.divName);

    chartContentElement.appendChild(newCanvas);

    console.log(chartObject);

    const radiusInfo = {};
    radiusInfo.lat = locationObject.lat;
    radiusInfo.lon = locationObject.lon;
    radiusInfo.radius = chartObject.radiusMiles;
    radiusInfo.limit = chartObject.radiusStations;
    var returnedStations;

    returnedStations = displayWeatherData2(
      weatherStations,
      chartObject.divName,
      chartObject.numHours,
      chartObject.dataType,
      chartObject.offset,
      radiusInfo,
      postAPIDataCallback
    );

    // handleStationList(allStations, returnedStations);
  }
  const tableContentElement = createToggleChildElements(
    "dynamic-div",
    "Sortable Tables",
    updateLinkURL
  );

  updateLinkURL();
}

function initMap() {
  const mapHTML = `    
    <button onclick="getLocation()">Use My Location</button>
    </br>
    </br>
    <div id="map"></div>
    <br>
    <form>
      <label for="lat">Latitude:</label>
      <input type="text" id="lat" name="lat" />
      <br />
      <label for="lon">Longitude:</label>
      <input type="text" id="lon" name="lon" />
    </form>


    `;

  // const forecastElement = document.getElementById("map-div");
  const mapDivElement = createToggleChildElements(
    "map-div",
    "Map",
    updateLinkURL
  );
  mapDivElement.innerHTML += mapHTML;

  var linkHeader = document.createElement("a");
  linkHeader.id = "page-link-position";
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
  myMapManager.addMarkerLegacy(initialCenter, "Forecast Location", "Wx");

  // Make this instance of the map manager a global variable
  window.myMapManager = myMapManager;

  const globalClickWeatherManager = new clickWeatherManager();
  window.myClickWeatherManager = globalClickWeatherManager;

  myMapManager.setMapClickListener((position) => {
    // mapManager.addMarkerLegacy(position, "");
    console.log(`Map clicked at: ${position.lat}, ${position.lng}`);
    clickWeatherClickListener(position);
  });

  parseURL();
}
