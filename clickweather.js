// Debug variables
const removeAbsoluteSnow = false;

// const myClickWeatherManager = new persistentDataModule();

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

  // Switch on the chart modes, and also ignore case by making the input all lower
  switch (urlParams.get("chartMode").toLowerCase()) {
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

  clickWeatherClickListener(position, false, stations);
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

  /*
 
  var latValue = parseFloat(document.getElementById("lat").value);
  var lonValue = parseFloat(document.getElementById("lon").value);

  console.log(latValue + " " + lonValue);

  // This is a dumb logic check, but hopefully nobody is trying to use this tool at 0.000, 0.000 :shrug:
  if (latValue != 0 && lonValue != 0) {
    linkURL += "lat=" + latValue;
    linkURL += "&lon=" + lonValue;
  }
    */

  // Set the href attribute using JavaScript
  var myPageLink = document.getElementById("page-link-position");
  myPageLink.href = linkURL;

  console.log("Update Link URL");
  console.log(getAllToggleChildren());
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
  sortableTablesElement.innerHTML = tabulateDataHtml;

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

function chartFormPrintChartRow(
  formContentDiv,
  currentChart = {},
  isFirstRow = false
) {
  // Create a wrapper div for the chart row
  const chartRow = document.createElement("div");
  chartRow.style.display = "flex";
  chartRow.style.gap = "10px";
  chartRow.style.alignItems = "center";
  chartRow.style.marginBottom = "10px";

  if (isFirstRow) {
    // Create a header row with labels
    const headerRow = document.createElement("div");
    headerRow.style.display = "flex";
    headerRow.style.gap = "10px";
    headerRow.style.alignItems = "center";
    headerRow.style.fontWeight = "bold";
    headerRow.style.marginBottom = "10px";

    // Add labels to the header row with consistent widths
    const headers = [
      { label: "Full Chart Title", width: "350px" },
      { label: "Chart Subtitle", width: "150px" },
      { label: "Days", width: "60px" },
      { label: "Offset Type", width: "180px" },
      { label: "Chart Type", width: "190px" },
      { label: "Radius Miles", width: "60px" },
      { label: "Radius Stations", width: "60px" },
      { label: "Actions", width: "auto" },
    ];

    headers.forEach(({ label, width }) => {
      const labelDiv = document.createElement("div");
      labelDiv.textContent = label;
      labelDiv.style.width = width;
      labelDiv.style.textAlign = "center"; // Align text with inputs
      headerRow.appendChild(labelDiv);
    });

    // Append the header row to the form
    formContentDiv.appendChild(headerRow);
  }

  // Chart title (non-editable)
  const titleDiv = document.createElement("div");
  titleDiv.textContent = currentChart.fullTitle || "New Chart"; // Default value for new rows
  titleDiv.style.width = "350px";
  titleDiv.style.textAlign = "center"; // Align text
  chartRow.appendChild(titleDiv);

  // Chart Subtitle (input)
  const titleInput = document.createElement("input");
  titleInput.type = "text";
  titleInput.placeholder = "Title";
  titleInput.style.width = "150px";
  titleInput.value = currentChart.title || ""; // Default value
  chartRow.appendChild(titleInput);

  // Days input
  const daysInput = document.createElement("input");
  daysInput.type = "number";
  daysInput.placeholder = "Days";
  daysInput.style.width = "60px";
  daysInput.value = currentChart.days || ""; // Default value
  chartRow.appendChild(daysInput);

  // Offset radio buttons
  const offsetWrapper = document.createElement("div");
  offsetWrapper.style.display = "flex";
  offsetWrapper.style.gap = "5px";
  offsetWrapper.style.width = "190px";

  const absoluteValueRadio = document.createElement("input");
  absoluteValueRadio.type = "radio";
  absoluteValueRadio.name = `offset-${formContentDiv.children.length}`;
  absoluteValueRadio.value = "false";
  absoluteValueRadio.checked =
    currentChart.offset === false || !currentChart.offset;
  offsetWrapper.appendChild(absoluteValueRadio);
  offsetWrapper.appendChild(document.createTextNode("Absolute"));

  const changeInValueRadio = document.createElement("input");
  changeInValueRadio.type = "radio";
  changeInValueRadio.name = `offset-${formContentDiv.children.length}`;
  changeInValueRadio.value = "true";
  changeInValueRadio.checked = currentChart.offset === true;
  offsetWrapper.appendChild(changeInValueRadio);
  offsetWrapper.appendChild(document.createTextNode("Change"));

  chartRow.appendChild(offsetWrapper);

  // Chart Type dropdown
  const chartTypeSelect = document.createElement("select");
  chartTypeSelect.style.width = "150px"; // Match width to header

  let hasSelectedOption = false;

  Object.entries(CHART_TYPE_READABLE).forEach(([key, label]) => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = label;

    // If we don't have a data type for the object,
    // and we haven't set a default yet, set the first one to default
    /*
    if (!currentChart.dataType && !hasSelectedOption) {
      console.log("Another way to try and set this to not be null");
      option.selected = true;
      hasSelectedOption = true;
    }
      */

    // Otherwise, update the flag as we find the key
    if (parseInt(key) === currentChart.dataType) {
      option.selected = true; // Default value
      hasSelectedOption = true;
    }

    console.log(option);
    chartTypeSelect.appendChild(option);
  });

  /*  // If no matching dataType found, select the first option
  if (!hasSelectedOption) {
    chartTypeSelect.options[0].selected = true;
  }
    */

  /*
  if (!hasSelectedOption) {
    console.log("Setting unselected index 1");
    chartTypeSelect.selectedIndex = 0; // Explicitly set the first option as selected
  }
    */

  chartRow.appendChild(chartTypeSelect);

  // Radius Miles input
  const radiusMilesInput = document.createElement("input");
  radiusMilesInput.type = "number";
  radiusMilesInput.placeholder = "Miles";
  radiusMilesInput.style.width = "60px";
  radiusMilesInput.value = currentChart.radiusMiles || ""; // Default value
  chartRow.appendChild(radiusMilesInput);

  // Radius Stations input
  const radiusStationsInput = document.createElement("input");
  radiusStationsInput.type = "number";
  radiusStationsInput.placeholder = "Num Stations";
  radiusStationsInput.style.width = "60px";
  radiusStationsInput.value = currentChart.radiusStations || ""; // Default value
  chartRow.appendChild(radiusStationsInput);

  // Remove button
  const removeButton = document.createElement("button");
  removeButton.textContent = "Remove";
  removeButton.addEventListener("click", function () {
    formContentDiv.removeChild(chartRow);
  });
  chartRow.appendChild(removeButton);

  // Append the row to the list
  formContentDiv.appendChild(chartRow);
}

// Main function
function updateChartFormList(stealthFormInstance) {
  // Get the div element where the form content is going to reside
  const formContentDiv = document.getElementById(
    stealthFormInstance.getStealthFormContentId()
  );

  let isFirstRow = true;

  myClickWeatherManager.getDefinedCharts().forEach((currentChart) => {
    chartFormPrintChartRow(formContentDiv, currentChart, isFirstRow);
    isFirstRow = false; // After the first row, no need for headers
  });
}

function stealthFormAddChartCallback(stealthFormInstance) {
  console.log("Add Chart Click");
  console.log(stealthFormInstance);

  // Get the div element where the form content is going to reside
  const formContentDiv = document.getElementById(
    stealthFormInstance.getStealthFormContentId()
  );

  chartFormPrintChartRow(formContentDiv);
}

function stealthFormCancelChartCallback(stealthFormInstance) {
  console.log("Cancelled");
  stealthFormInstance.hideForm();
}

function parseChartRows(stealthFormInstance) {
  const formContentDiv = document.getElementById(
    stealthFormInstance.getStealthFormContentId()
  );

  const rows = Array.from(formContentDiv.children).slice(1); // Skip the header row
  const chartData = rows.map((row) => {
    const inputs = row.querySelectorAll("input, select");

    // Parse individual inputs and dropdowns
    return {
      title: inputs[0]?.value || "", // Chart Subtitle
      // title: row.children[0].textContent.trim(), // Non-editable title
      // shortTitle: inputs[0]?.value || "", // Chart Subtitle
      days: parseInt(inputs[1]?.value, 10) || 5, // Days
      offset: inputs[2]?.checked ? false : true, // Offset Type (radio buttons)
      chartType: parseInt(inputs[4].value, 10) || 0, // Chart Type (select)
      radiusMiles: parseFloat(inputs[5]?.value) || 5, // Radius Miles
      radiusStations: parseInt(inputs[6]?.value, 10) || 20, // Radius Stations
    };
  });

  return chartData;
}

function stealthFormSubmitChartCallback(stealthFormInstance) {
  console.log("Submitted");

  // Clear the chart list
  myClickWeatherManager.setDefinedCharts([]);

  // Push all the charts we have in the list into the weather manager's chart list
  parseChartRows(stealthFormInstance).forEach((attributes) => {
    myClickWeatherManager.pushAttributesToDefinedCharts(attributes);
  });

  // If the user has submitted the form, this is now a custom chart
  myClickWeatherManager.setChartMode(CHART_MODES.custom);

  stealthFormInstance.hideForm();

  const positionAttributes = myClickWeatherManager.getPositionAttributes();

  // Need to figure out how to handle stations
  clickWeatherClickListener(
    {
      lat: positionAttributes.position.lat,
      lng: positionAttributes.position.lon,
    },
    false,
    []
  );
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

  createToggleChildElements("dynamic-div", "Legend");

  // Create the div for the forecasts from weather.gov
  const ForecastElement = createToggleChildElements(
    "dynamic-div",
    "Forecast Charts"
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
  myMapManager.addMarker(position, "Forecast Location", "Wx");

  var locationObject = {
    lat: lat,
    lon: lon,
    locationName: "Conditions at Map Click",
    // weatherOffice: "SLC",
    chartObjects: [],
  };

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

  // createFullMountainSuitePlots(locationObject, weatherStations);

  // myClickWeatherManager.createFullMountainSuitePlots();

  // Update the URL for the image element
  updateWeatherPlot(locationObject);
  updateWeatherPlot(locationObject, 49, "weather-plot-2");

  // Get the dynamic div where we put all the forecast stuff.
  const contentElement = createToggleChildElements(
    "dynamic-div",
    "Historical Charts"
  );

  //***********************************/
  // Code for the hideable form/menu for managing charts
  //***********************************/

  const chartStealthFormInstance = new stealthForm(
    contentElement,
    "Manage Charts",
    "Historical Chart Attributes",
    updateChartFormList,
    myClickWeatherManager
  );

  chartStealthFormInstance.addCustomButton(
    "Submit",
    stealthFormSubmitChartCallback
  );
  chartStealthFormInstance.addCustomButton(
    "Cancel",
    stealthFormCancelChartCallback
  );
  chartStealthFormInstance.addCustomButton(
    "Add Chart",
    stealthFormAddChartCallback
  );

  // updateChartFormList(chartStealthFormInstance, myClickWeatherManager)

  //***********************************/
  // Create the charts themselves
  //***********************************/
  for (const chartObject of myClickWeatherManager.getDefinedCharts()) {
    newHeading = document.createElement("h2");
    newHeading.textContent = chartObject.fullTitle;

    contentElement.appendChild(newHeading);

    var newCanvas = document.createElement("canvas");

    newCanvas.setAttribute("id", chartObject.divName);

    contentElement.appendChild(newCanvas);

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

    console.log(returnedStations);
    // handleStationList(allStations, returnedStations);
  }
  createToggleChildElements("dynamic-div", "Sortable Tables");

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
  linkHeader.id = "page-link-position";
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

  const globalClickWeatherManager = new clickWeatherManager();
  window.myClickWeatherManager = globalClickWeatherManager;

  myMapManager.setMapClickListener((position) => {
    // mapManager.addMarker(position, "");
    console.log(`Map clicked at: ${position.lat}, ${position.lng}`);
    clickWeatherClickListener(position);
  });

  parseURL();
}
