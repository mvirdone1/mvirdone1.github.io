// https://jraviles.com/weather-gov-meteograms.html
const GraphTypes = Object.freeze({
  Temperature: 0,
  Dewpoint: 1,
  HeatIndex: 2,
  WindChill: 3,
  SurfaceWind: 4,
  SkyCover: 5,
  PrecipitationPotential: 6,
  RelativeHumidity: 7,
  Rain: 8,
  Thunder: 9,
  Snow: 10,
  FreezingRain: 11,
  Sleet: 12,
  FreezingSpray: 13,
  Fog: 14,
  CeilingHeight: 15,
  Visibility: 16,
  SignificantWaveHeight: 17,
  WavePeriod: 18,
  EmptyGraph: 19,
  MixingHeight: 20,
  HainesIndex: 21,
  LightningActivityLevel: 22,
  TransportWind: 23,
  TwentyFootWind: 24,
  VentilationRate: 25,
  SwellHeight: 26,
  SwellPeriod: 27,
  Swell2Height: 28,
  Swell2Period: 29,
  WindWaveHeight: 30,
  DispersionIndex: 31,
  Pressure: 32,
  ProbWind15mph: 33,
  ProbWind25mph: 34,
  ProbWind35mph: 35,
  ProbWind45mph: 36,
  ProbWindGust20mph: 37,
  ProbWindGust30mph: 38,
  ProbWindGust40mph: 39,
  ProbWindGust50mph: 40,
  ProbWindGust60mph: 41,
  ProbQPF01: 42,
  ProbQPF025: 43,
  ProbQPF05: 44,
  ProbQPF1: 45,
  ProbQPF2: 46,
  ProbSnow01: 47,
  ProbSnow1: 48,
  ProbSnow3: 49,
  ProbSnow6: 50,
  ProbSnow12: 51,
  GrasslandFireDangerIndex: 52,
  ThunderPotential: 53,
  DavisStabilityIndex: 54,
  AtmosphericDispersionIndex: 55,
  LowVisibilityOccurrenceRiskIndex: 56,
  TurnerStabilityIndex: 57,
  RedFlagThreatIndex: 58,
});

const chartTypes = {
  temperature: 0,
  snowDepth: 1,
  windSpeed: 2,
};

String.prototype.replaceAt = function (index, replacement) {
  return (
    this.substring(0, index) +
    replacement +
    this.substring(index + replacement.length)
  );
};

/*****************************
GLOBAL VARIABLES
******************************/
// Changing this to a global variable:
var locationObjects = [];

var myGoogleMap;

var myMarkers = [];

/*
const myGoogleMap = new google.maps.Map(document.getElementById("map"), {
  center: { lat: 41.5, lng: -111.8 },
  zoom: 7,
});
*/

function loganWeatherPlot() {}

class WeatherPlotter {
  constructor() {
    this.baseURL = "https://forecast.weather.gov/";
    this.plotterPath = "meteograms/Plotter.php";
  }

  getPCMD(pcmdArray) {
    var pcmdString =
      "00000000000000000000000000000000000000000000000000000000000000000000000000000000000000";

    for (var idx = 0; idx < pcmdArray.length; idx++) {
      // pcmdString.replaceAt(pcmdArray[idx], "1");

      pcmdString =
        pcmdString.substring(0, pcmdArray[idx]) +
        "1" +
        pcmdString.substring(pcmdArray[idx] + 1);
      // console.log(pcmdArray[idx]);
    }

    console.log(pcmdString);
    return pcmdString;
  }

  buildURL(options, office, zone) {
    // console.log(wfo);
    const queryParams = new URLSearchParams({
      lat: options.lat,
      lon: options.lon,
      wfo: office,
      zcode: zone,
      gset: "30",
      gdiff: "10",
      unit: "0",
      tinfo: "MY7",
      ahour: options.offsetHours,
      pcmd: this.getPCMD(options.pmcdArray),
      lg: "en",
      indu: "1!1!1!",
      dd: "",
      bw: "",
      hrspan: options.hours.toString(),
      pqpfhr: "3",
      psnwhr: "3",
    });

    return `${this.baseURL}${this.plotterPath}?${queryParams.toString()}`;
  }

  updateHourlyWeatherPlotUrl(options, elementId) {
    const apiUrl = `https://api.weather.gov/points/${options.lat},${options.lon}`;

    return fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        const office = data.properties.cwa;
        const zone = data.properties.forecastZone.substring(39);
        var url = this.buildURL(options, office, zone);
        console.log("Weather Plot URL: " + url);
        document.getElementById(elementId).src = url;
        document.getElementById(elementId + "-link").href = url;

        return { office, zone };
      })
      .catch((error) => {
        console.error(`Error fetching weather info: ${error}`);
        console.log(apiUrl);
        return null;
      });
  }
}

function setErroneousValuesToAverage(data, windowSize, threshold) {
  for (let i = 0; i < data.length; i++) {
    // Check if current index is within the window size
    if (i >= windowSize - 1) {
      // Get the sliding window average
      const windowStart = i - windowSize + 1;
      const windowEnd = i + 1;
      const windowValues = data.slice(windowStart, windowEnd);
      const windowAverage =
        windowValues.reduce((a, b) => a + b, 0) / windowSize;

      // Check if current value is too far from the sliding window average
      const currentValue = data[i];
      if (Math.abs(currentValue - windowAverage) > threshold) {
        // Set the current value to the sliding window average
        data[i] = windowAverage;
      }
    }
  }

  return data;
}

function displayAvyForecast(divId = "forecast") {
  console.log("Avy Forecast");
  // make API request to get forecast data
  const proxyAddress = ""; // "https://api.codetabs.com/v1/proxy?quest=";
  const forecastAddress = "https://utahavalanchecenter.org/forecast/logan/json";
  fetch(proxyAddress + forecastAddress)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      // parse data and display in HTML
      const forecastElement = document.getElementById(divId);
      forecastElement.innerHTML = `

      <table style="width:50%">
      <tr>

      <td>
      <img height="400px" src="${
        "https://utahavalanchecenter.org/" +
        data.advisories[0].advisory.overall_danger_rose_image
      }" alt="Overall Danger Rose Image">
      </td>

      <td>
      <h1><a href="https://utahavalanchecenter.org/forecast/logan">Logan Avy Forecast </a></h1  >
      <h4>${data.advisories[0].advisory.date_issued}</h4>
      <p> 
        ${data.advisories[0].advisory.bottom_line} 
      </p>
      </td>
      </tr>
      </table>
    `;
    })
    .catch((error) => console.error(error));
}

function displayWeatherData2(
  stid,
  canvasId,
  numHours = 24,
  stationType = 0,
  displayOffset = false
) {
  // Retrieve Mesonet temperature data using Mesonet API
  const apiURL = "https://api.mesowest.net/v2/stations/timeseries";
  const token = "32a5383da0cf44a19368207bc32f2d7f";

  var varName = "";
  var plotType = "";
  var changeString = "";
  if (displayOffset) {
    changeString = " Change";
    console.log("Show Change!");
  }

  switch (stationType) {
    case chartTypes.snowDepth:
      varName = "snow_depth";
      plotType = "Snow Depth" + changeString;
      break;

    case chartTypes.windSpeed:
      varName = "wind_speed,wind_gust";
      plotType = "Wind Speed and Gust" + changeString;
      break;

    case chartTypes.temperature:
    default:
      varName = "air_temp";
      plotType = "Temperature" + changeString;
  }

  // Make it so this function can handle an array of strings as an argument
  var stidStr = stid;

  if (Array.isArray(stid)) {
    stidStr = stid.join(",");
  }

  console.log(stidStr);

  const params = {
    token: token,
    //stid: stidStr,
    vars: varName,
    //start: 202204010000,
    //end: 202204080000,
    recent: numHours * 60, // Minutes
    units: "english",
  };
  var queryString = Object.keys(params)
    .map(
      (key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
    )
    .join("&");

  // Append the comma separated list of station IDs
  queryString += "&stid=" + stidStr;

  const apiUrlWithParams = `${apiURL}?${queryString}`;
  console.log(apiUrlWithParams);
  fetch(apiUrlWithParams)
    .then((response) => response.json())
    .then((data) => {
      console.log("Inside Fetch: " + stid);
      console.log("Stations " + data.STATION.length);

      var dataSets = [];

      const colors = [
        "rgb(255, 99, 132)", // Red
        "rgb(54, 162, 235)", // Blue
        "rgb(0, 236, 100)", // Bright green
        "rgb(75, 192, 192)", // Teal
        "rgb(153, 102, 255)", // Purple
        "rgb(0, 0, 0)", // Black
      ];

      // Iterate over the data sets
      for (var dataSetIdx = 0; dataSetIdx < data.STATION.length; dataSetIdx++) {
        var dataSet = [];
        var tempData = [];
        var dates = [];
        var stationName = data.STATION[dataSetIdx].NAME;
        var stationID = data.STATION[dataSetIdx].STID;

        // Get the data based on what type of request we've sent
        switch (stationType) {
          case chartTypes.snowDepth: // Snow Depth
            tempData = data.STATION[dataSetIdx].OBSERVATIONS.snow_depth_set_1;
            break;

          case chartTypes.windSpeed:
            tempData = data.STATION[dataSetIdx].OBSERVATIONS.wind_speed_set_1;
            break;

          case chartTypes.temperature: // Air Temp
          default: // Default to air temp
            tempData = data.STATION[dataSetIdx].OBSERVATIONS.air_temp_set_1;
        }

        // Clean up the data removing null and doing the offsets if needed
        fixZeroAndNull(tempData);

        if (displayOffset) {
          var offset = tempData[0];

          for (var idx = 0; idx < tempData.length; idx++) {
            tempData[idx] = tempData[idx] - offset;
          }
        }

        // Get the timestamps
        dates = data.STATION[dataSetIdx].OBSERVATIONS.date_time;

        // Map the two arrays into an array of x/y objects
        for (var dataIdx = 0; dataIdx < tempData.length; dataIdx++) {
          dataSet.push({ x: dates[dataIdx], y: tempData[dataIdx] });
        }

        // Add the array of objects to the array of arrays
        dataSets.push({
          //x: dates,
          //y: dataSet,
          label: stationName + " (" + stationID + ")",
          data: dataSet,
          fill: false,
          borderColor: colors[dataSetIdx],
          tension: 0.1,
          pointRadius: 0,
        });
      }

      const numTicks = Math.max(12, Math.floor(numHours / 12));

      // Create line graph using Chart.js
      const canvas = document.getElementById(canvasId);
      // canvas.style.width = "80%";
      canvas.style.height = "50vh";
      const ctx = canvas.getContext("2d");

      new Chart(ctx, {
        type: "line",
        data: {
          datasets: dataSets,
        },

        options: {
          responsive: false,
          scales: {
            xAxes: [
              {
                type: "time",
                ticks: {
                  maxTicksLimit: numTicks,
                },
                time: {
                  displayFormats: {
                    // https://momentjs.com/docs/#/displaying/format/
                    hour: "M/d HH:mm",
                  },
                },
              },
            ],
          },
        },
      });
    })
    .catch((error) => console.error(error));
}

function createChartObject(charts, locationTitle, attributes) {
  console.log("My Title: " + attributes.title);
  return (tempChartObject = {
    charts: charts,
    title:
      locationTitle +
      " " +
      attributes.title +
      " - " +
      attributes.days +
      " Day" +
      addS(attributes.days),
    divName:
      divify(locationTitle) +
      "-" +
      attributes.title.substring(0, 4) +
      "-" +
      attributes.days +
      "dy",
    numHours: 24 * attributes.days,
    offset: attributes.offset,
    dataType: attributes.chartType, // 0 = Temperature, 1 = Snow Depth
  });
}

function updateWeatherPlot(
  locationObject,
  offsetHours = 0,
  plotId = "weather-plot"
) {
  const plotter = new WeatherPlotter();

  var weatherPlotParamObject = {
    lat: locationObject.lat,
    lon: locationObject.lon,
    office: locationObject.weatherOffice,
    hours: 48,
    offsetHours: offsetHours,
    pmcdArray: [
      GraphTypes.Temperature,
      GraphTypes.WindChill,
      GraphTypes.Snow,
      GraphTypes.Rain,
      GraphTypes.SurfaceWind,
      GraphTypes.ProbQPF01,
      GraphTypes.ProbQPF025,
      GraphTypes.ProbQPF05,
      GraphTypes.ProbQPF1,
      GraphTypes.ProbQPF2,
      GraphTypes.ProbSnow01,
      GraphTypes.ProbSnow1,
      GraphTypes.ProbSnow3,
      GraphTypes.ProbSnow6,
      GraphTypes.ProbSnow12,
      GraphTypes.SkyCover,
      GraphTypes.PrecipitationPotential,
    ],
  };

  // var plotId = "weather-plot";
  const weatherHourlyURL = plotter.updateHourlyWeatherPlotUrl(
    weatherPlotParamObject,
    plotId
  );
}

function displayAllLocationInfo(locationObject) {
  console.log("Displaying All Location Info");

  const contentElement = document.getElementById("dynamic-div");

  // Create the heading
  var newHeading = document.createElement("h1");
  newHeading.textContent = locationObject.locationName;
  contentElement.append(newHeading);

  var plotId = "weather-plot";
  var linkId = plotId + "-link";

  var linkElement = document.createElement("a");
  linkElement.id = linkId;
  linkElement.target = "_blank";

  // Create the image element
  var imageElement = document.createElement("img");
  imageElement.id = plotId;
  imageElement.alt = "Weather Plot";
  linkElement.appendChild(imageElement);
  contentElement.appendChild(linkElement);

  // Update the URL for the image element
  updateWeatherPlot(locationObject);

  for (const chartObject of locationObject.chartObjects) {
    newHeading = document.createElement("h2");
    newHeading.textContent = chartObject.title;

    contentElement.appendChild(newHeading);

    var newCanvas = document.createElement("canvas");

    newCanvas.setAttribute("id", chartObject.divName);

    contentElement.appendChild(newCanvas);

    displayWeatherData2(
      chartObject.charts,
      chartObject.divName,
      chartObject.numHours,
      chartObject.dataType,
      chartObject.offset
    );
  }
}

function createWeatherPlotImageElement(plotId, contentElement) {
  var linkId = plotId + "-link";
  var linkElement = document.createElement("a");
  linkElement.id = linkId;
  // Create the image element
  var imageElement = document.createElement("img");
  imageElement.id = plotId;
  imageElement.alt = "Weather Plot";
  imageElement.classList.add("scaledImage");
  linkElement.appendChild(imageElement);
  contentElement.appendChild(linkElement);
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

  // Plot 1 day wind
  attributes.title = "Total Snow";
  attributes.days = 5;
  attributes.offset = false;
  attributes.chartType = chartTypes.snowDepth;

  locationObject.chartObjects.push(
    createChartObject(charts, locationObject.locationName, attributes)
  );
}

function initLocationObjects() {
  //---------------------------------
  // Logan Weather
  //---------------------------------
  var locationObject = {
    lat: "41.76760",
    lon: "-111.77928",
    locationName: "Logan Local (Green Canyon)",
    //weatherOffice: "SLC",
    chartObjects: [],
  };

  var charts = [];
  charts.push("KLGU");
  charts.push("TS303");
  charts.push("PC114");

  var attributeTitle = "Temperature";
  var days = 1;
  var offset = false;
  var chartType = chartTypes.temperature;

  var attributes = {
    title: "Temperature",
    days: 1,
    offset: false,
    chartType: chartTypes.temperature,
  };

  console.log(attributes);

  locationObject.chartObjects.push(
    createChartObject(charts, locationObject.locationName, attributes)
  );

  attributes.title = "Wind";
  attributes.chartType = chartTypes.windSpeed;

  locationObject.chartObjects.push(
    createChartObject(charts, locationObject.locationName, attributes)
  );

  locationObjects.push({ ...locationObject });

  //---------------------------------
  // Up Canyon Weather
  //---------------------------------
  locationObject.lat = "41.95216";
  locationObject.lon = "-111.49158";
  locationObject.locationName = "Up Canyon";
  // Clear the array
  locationObject.chartObjects = [];
  charts = [];
  charts.push("TGLU1");
  charts.push("TGSU1");
  charts.push("LGS");
  charts.push("CRDUT");
  charts.push("PRSUT");

  createFullMountainSuitePlots(locationObject, charts);

  locationObjects.push({ ...locationObject });

  locationObject.lat = "36.5785";
  locationObject.lon = "-118.2923";
  locationObject.locationName = "Mount Whitney";
  // locationObject.weatherOffice = "HNX";
  // Clear the array
  locationObject.chartObjects = [];
  charts = [];
  charts.push("CWDC1");
  charts.push("CBTC1");
  charts.push("UTYC1");
  charts.push("CQ270");

  createFullMountainSuitePlots(locationObject, charts);

  locationObjects.push({ ...locationObject });

  return locationObjects;
}

function createDropDownMenu(locationObjects) {
  var selectMenu = document.createElement("select");
  selectMenu.id = "dropDownMenu";

  var option = document.createElement("option");
  option.text = "Map Search";
  option.value = -1;
  selectMenu.add(option);

  option = document.createElement("option");
  option.text = "Avalanche Report";
  option.value = 0;
  selectMenu.add(option);
  document.getElementById("my-header").appendChild(selectMenu);

  for (objIdx = 0; objIdx < locationObjects.length; objIdx++) {
    option = document.createElement("option");
    option.text = locationObjects[objIdx].locationName;
    option.value = objIdx + 1;
    selectMenu.add(option);
  }

  selectMenu.addEventListener("change", function () {
    var selectedOption = parseInt(
      selectMenu.options[selectMenu.selectedIndex].value
    );
    console.log("Selected option: " + selectedOption);
    handleDropDownChange(selectedOption, locationObjects);
  });

  var linkHeader = document.createElement("a");
  linkHeader.id = "page-link";
  linkHeader.href = "#"; // Link to nowhere since it will be dynamically updated
  linkHeader.innerHTML = "<h4>Link to this page</h4>";
  document.getElementById("my-header").appendChild(linkHeader);
}

function handleDropDownChange(selectedOption, locationObjects) {
  document.getElementById("dynamic-div").innerHTML = "";
  document.getElementById("map-div").style.display = "none";

  switch (selectedOption) {
    case -1:
      document.getElementById("map-div").style.display = "block";
      myMapManager.mapResize();
      displayMapClickView();

      // showMap();

      break;

    case 0:
      console.log("Avy Forecast Start");
      displayAvyForecast("dynamic-div");
      break;

    default:
      displayAllLocationInfo(locationObjects[selectedOption - 1]);
  }

  updateLinkURL(selectedOption);
}

function updateLinkURL(selectedOption) {
  var linkURL =
    "https://mvirdone1.github.io/liveweather.html?mode=" + selectedOption;

  var myPageLink = document.getElementById("page-link");

  var latValue = parseFloat(document.getElementById("lat").value);
  var lonValue = parseFloat(document.getElementById("lon").value);

  console.log(latValue + " " + lonValue);

  // This is a dumb logic check, but hopefully nobody is trying to use this tool at 0.000, 0.000 :shrug:
  if (latValue != 0 && lonValue != 0) {
    linkURL += "&lat=" + latValue;
    linkURL += "&lon=" + lonValue;
  }

  // Set the href attribute using JavaScript
  myPageLink.href = linkURL;
}

function parseURL() {
  const queryString = window.location.search;
  console.log(queryString);
  const urlParams = new URLSearchParams(queryString);

  if (!urlParams.has("mode")) {
    return 0;
  }

  pageMode = urlParams.get("mode");
  console.log("Found a mode parameter: " + pageMode);

  // See if the option listed is valid
  var menuOptions = document.getElementById("dropDownMenu").options;
  var validOptions = Array.from(menuOptions).map((option) => option.value);

  console.log(validOptions);

  var lat = document.getElementById("lat").value;
  var lon = document.getElementById("lon").value;

  if (urlParams.has("lat") && urlParams.has("lon")) {
    console.log("Got lat lon");
    lat = parseFloat(urlParams.get("lat"));
    lon = parseFloat(urlParams.get("lon"));

    document.getElementById("lat").value = Math.round(lat * 1000) / 1000;
    document.getElementById("lon").value = Math.round(lon * 1000) / 1000;
  }

  // Only update the page if we received a valid mode
  if (validOptions.includes(pageMode)) {
    console.log("This was a valid option");

    // Clear the page before updading
    document.getElementById("dynamic-div").innerHTML = "";
    document.getElementById("map-div").style.display = "none";

    // Assuming your dropdown has an id "myDropdown"
    var dropdown = document.getElementById("dropDownMenu");

    // Change the dropdown value programmatically
    dropdown.value = pageMode;

    // Manually trigger the "change" event
    var event = new Event("change");
    dropdown.dispatchEvent(event);

    // Special case for the map click forecast
    if (pageMode == -1) {
      displayMapClickView();

      console.log("Showing the map " + lat + " " + lon);
      // showMap(Number(lat), Number(lon));

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
  updateLinkURL(dropdown.value);
}

function displayMapClickView() {
  const contentElement = document.getElementById("dynamic-div");
  // Create the heading
  var newHeading = document.createElement("h1");
  newHeading.textContent = "Map Click Forecast";
  contentElement.append(newHeading);

  var plotId = "weather-plot";

  createWeatherPlotImageElement(plotId, contentElement);

  var plotId = "weather-plot-2";

  createWeatherPlotImageElement(plotId, contentElement);

  lat = document.getElementById("lat").value;
  lon = document.getElementById("lon").value;

  var locationObject = {
    lat: lat,
    lon: lon,
    locationName: "Forecast at Map Click",
    // weatherOffice: "SLC",
    chartObjects: [],
  };

  // Update the URL for the image element
  updateWeatherPlot(locationObject);
  updateWeatherPlot(locationObject, 49, "weather-plot-2");
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

    // Update the URL for the image element
    updateWeatherPlot(locationObject);
    updateWeatherPlot(locationObject, 49, "weather-plot-2");
    updateLinkURL(-1);
  });

  // showMap();

  // Moved from sync init to async init
  locationObjects = initLocationObjects();
  createDropDownMenu(locationObjects);
  parseURL();
  displayMapClickView();
}
