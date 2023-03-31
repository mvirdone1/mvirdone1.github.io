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
      console.log(pcmdArray[idx]);
    }

    console.log(pcmdString);
    return pcmdString;
  }

  createHourlyWeatherPlotUrl(options) {
    const queryParams = new URLSearchParams({
      lat: options.lat,
      lon: options.lon,
      wfo: options.office,
      zcode: "UTZ110",
      gset: "30",
      gdiff: "10",
      unit: "0",
      tinfo: "MY7",
      ahour: "0",
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
    return url;
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
  const proxyAddress = "https://api.codetabs.com/v1/proxy?quest=";
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
  const token = "0ad1ebf61ff847a78b2166e39db3cbd6";

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

function displayAllLocationInfo(locationObject) {
  console.log("Displaying All Location Info");
  const plotter = new WeatherPlotter();

  var weatherPlotParamObject = {
    lat: locationObject.lat,
    lon: locationObject.lon,
    office: locationObject.weatherOffice,
    hours: 48,
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

  const weatherHourlyURL = plotter.createHourlyWeatherPlotUrl(
    weatherPlotParamObject
  );
  const contentElement = document.getElementById("dynamic-div");

  var newHeading = document.createElement("h1");
  newHeading.textContent = locationObject.locationName;
  contentElement.append(newHeading);

  var img = document.createElement("img");
  img.src = weatherHourlyURL;
  img.alt = "Weather Plot";
  contentElement.appendChild(img);

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

// Call displayTemperatureData function on page load to display temperature data for Logan, UT (KLGU)
window.onload = function () {
  var locationObjects = [];

  //---------------------------------
  // Logan Weather
  //---------------------------------
  var locationObject = {
    lat: "41.76760",
    lon: "-111.77928",
    locationName: "Logan Local (Green Canyon)",
    weatherOffice: "SLC",
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

  createFullMountainSuitePlots(locationObject, charts);

  locationObjects.push({ ...locationObject });

  locationObject.lat = "36.5785";
  locationObject.lon = "-118.2923";
  locationObject.locationName = "Mount Whitney";
  locationObject.weatherOffice = "HNX";
  // Clear the array
  locationObject.chartObjects = [];
  charts = [];
  charts.push("CWDC1");
  charts.push("CBTC1");
  charts.push("UTYC1");
  charts.push("CQ270");

  createFullMountainSuitePlots(locationObject, charts);

  locationObjects.push({ ...locationObject });

  /*

  var tempChartObject = {
    charts: charts,
    title: "Logan Local Weather (Green Canyon) - 24 Hour",
    divName: "logan-weather",
    numHours: 24 * 1,
    offset: false,
    dataType: chartTypes.temperature, // 0 = Temperature, 1 = Snow Depth
  };

  var chartObjects = [];
  chartObjects.push(tempChartObject);

  var tempChartObject = {
    charts: charts,
    title: "Logan Local Wind (Green Canyon) - 24 Hour",
    divName: "logan-wind",
    numHours: 24 * 1,
    offset: false,
    dataType: chartTypes.windSpeed, // 0 = Temperature, 1 = Snow Depth
  };

  chartObjects.push(tempChartObject);

  var charts2 = [];
  charts2.push("TGLU1");
  charts2.push("TGSU1");
  charts2.push("LGS");

  tempChartObject = {
    charts: charts2,
    title: "Change in Snow Up Canyon - 3 Day",
    divName: "up-snow-change-72",
    numHours: 24 * 3,
    offset: true,
    dataType: chartTypes.snowDepth, // 0 = Temperature, 1 = Snow Depth
  };

  chartObjects.push(tempChartObject);

  tempChartObject = {
    charts: charts2,
    title: "Change in Snow Up Canyon - 1 Day",
    divName: "up-snow-change-24",
    numHours: 24 * 1,
    offset: true,
    dataType: chartTypes.snowDepth, // 0 = Temperature, 1 = Snow Depth
  };

  chartObjects.push(tempChartObject);

  tempChartObject = {
    charts: charts2,
    title: "Temperature Up Canyon - 24 Hour",
    divName: "up-temp",
    numHours: 24 * 1,
    offset: false,
    dataType: chartTypes.temperature, // 0 = Temperature, 1 = Snow Depth
  };

  chartObjects.push(tempChartObject);

  tempChartObject = {
    charts: charts2,
    title: "Wind Up Canyon - 24 Hour",
    divName: "up-wind",
    numHours: 24 * 1,
    offset: false,
    dataType: chartTypes.windSpeed, // 0 = Temperature, 1 = Snow Depth
  };

  chartObjects.push(tempChartObject);

  tempChartObject = {
    charts: charts2,
    title: "Total Snow Up Canyon - 3 Day",
    divName: "up-snow-total",
    numHours: 24 * 3,
    offset: false,
    dataType: chartTypes.snowDepth, // 0 = Temperature, 1 = Snow Depth
  };

  chartObjects.push(tempChartObject);

  var plotWhitney = true;
  if (plotWhitney) {
    charts2 = [];
    charts2.push("CWDC1");
    charts2.push("CBTC1");
    charts2.push("UTYC1");
    charts2.push("CQ270");

    tempChartObject = {
      charts: charts2,
      title: "Change in Snow Whitney - 3 Day",
      divName: "whit-snow-change-72",
      numHours: 24 * 3,
      offset: true,
      dataType: chartObjects.snowDepth, // 0 = Temperature, 1 = Snow Depth
    };

    chartObjects.push(tempChartObject);

    tempChartObject = {
      charts: charts2,
      title: "Change in Snow Whitney - 1 Day",
      divName: "whit-snow-change-24",
      numHours: 24 * 1,
      offset: true,
      dataType: chartTypes.snowDepth, // 0 = Temperature, 1 = Snow Depth
    };

    chartObjects.push(tempChartObject);

    tempChartObject = {
      charts: charts2,
      title: "Temperature Whitney - 24 Hour",
      divName: "whitney-temp",
      numHours: 24 * 1,
      offset: false,
      dataType: chartTypes.temperature, // 0 = Temperature, 1 = Snow Depth
    };

    chartObjects.push(tempChartObject);

    tempChartObject = {
      charts: charts2,
      title: "Wind Whitney - 24 Hour",
      divName: "whitney-wind",
      numHours: 24 * 1,
      offset: false,
      dataType: chartTypes.windSpeed, // 0 = Temperature, 1 = Snow Depth
    };

    chartObjects.push(tempChartObject);

    tempChartObject = {
      charts: charts2,
      title: "Total Snow Whitney - 3 Day",
      divName: "whitney-snow-total",
      numHours: 24 * 3,
      offset: false,
      dataType: chartTypes.snowDepth, // 0 = Temperature, 1 = Snow Depth
    };

    chartObjects.push(tempChartObject);
  }

  console.log("Trying to do the weather URL");
  // Example usage:
  const plotter = new WeatherPlotter();

  var weatherPlotParamObject = {
    lat: "41.76760",
    lon: "-111.77928",
    hours: 36,
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

  */

  var selectMenu = document.createElement("select");
  var option = document.createElement("option");
  option.text = "-- Select a Search --";
  option.value = -1;
  selectMenu.add(option);

  option = document.createElement("option");
  option.text = "Avalanche Report";
  option.value = 0;
  selectMenu.add(option);
  document.body.prepend(selectMenu);

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

    document.getElementById("dynamic-div").innerHTML = "";

    switch (selectedOption) {
      case -1:
        document.getElementById("dynamic-div").innerHTML =
          "<h1>Select a product from above </h1>";
        break;

      case 0:
        console.log("Avy Forecast Start");
        displayAvyForecast("dynamic-div");
        console.log("Case " + selectedOption);
        break;

      default:
        console.log("Case " + selectedOption);
        displayAllLocationInfo(locationObjects[selectedOption - 1]);
        console.log("Case " + selectedOption);
    }

    // $("#" + thisDivName).append($ad);
  });

  // displayAvyForecast();

  /*const loganURL = plotter.createHourlyWeatherPlotUrl(weatherPlotParamObject);

  weatherPlotParamObject.lat = "41.95216";
  weatherPlotParamObject.lon = "-111.49158";
  const summitURL = plotter.createHourlyWeatherPlotUrl(weatherPlotParamObject);

  const forecastElement = document.getElementById("wPlot");
  forecastElement.innerHTML = `
  <table>
  <tr>
    <td>
      <h3>Green Canyon Forecast </h3>

      <img  src="${loganURL}" alt="Weather Plot">

    </td>
    <td>
  
      <h3>Logan Summit (Swan Flats) </h3>
      <img  src="${summitURL}" alt="Weather Plot">
    </td>
  </tr>
  </table>

  `;

  */
  // Iterate over the charts
};

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
