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

  createUrl(options) {
    const queryParams = new URLSearchParams({
      lat: options.lat,
      lon: options.lon,
      wfo: "SLC",
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

function fixZeroAndNull(data) {
  for (let i = 1; i < data.length; i++) {
    if (data[i] === 0 || data[i] === null) {
      data[i] = data[i - 1];
    }
  }
}

function displayAvyForecast() {
  console.log("Avy Forecast");
  // make API request to get forecast data
  const proxyAddress = "https://api.codetabs.com/v1/proxy?quest=";
  const forecastAddress = "https://utahavalanchecenter.org/forecast/logan/json";
  fetch(proxyAddress + forecastAddress)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      // parse data and display in HTML
      const forecastElement = document.getElementById("forecast");
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
    case 1:
      varName = "snow_depth";
      plotType = "Snow Depth" + changeString;
      break;

    case 2:
      varName = "wind_speed,wind_gust";
      plotType = "Wind Speed and Gust" + changeString;
      break;

    case 0:
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
          case 1: // Snow Depth
            tempData = data.STATION[dataSetIdx].OBSERVATIONS.snow_depth_set_1;
            break;

          case 2:
            tempData = data.STATION[dataSetIdx].OBSERVATIONS.wind_speed_set_1;
            break;

          case 0: // Air Temp
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

// Call displayTemperatureData function on page load to display temperature data for Logan, UT (KLGU)
window.onload = function () {
  const stationArray = [
    {
      locTitle: "Logan Airport",
      stid: "KLGU",
    },
    {
      locTitle: "Upper Green Canyon",
      stid: "TS303",
    },
    {
      locTitle: "Lower Green Canyon",
      stid: "PC114",
    },
    {
      locTitle: "Tony Grove Campground",
      stid: "TYGRC",
    },
    {
      locTitle: "Tony Grove Upper",
      stid: "TGLU1",
    },
    {
      locTitle: "Tony Grove Upper Snotel",
      stid: "TGSU1",
    },
    {
      locTitle: "Swan Flats",
      stid: "LGS",
    },
  ];

  var chartObjects = [];

  var charts = [];
  charts.push("KLGU");
  charts.push("TS303");
  charts.push("PC114");

  var tempChartObject = {
    charts: charts,
    title: "Logan Local Weather (Green Canyon) - 24 Hour",
    divName: "logan-weather",
    numHours: 24 * 1,
    offset: false,
    dataType: 0, // 0 = Temperature, 1 = Snow Depth
  };

  chartObjects.push(tempChartObject);

  var tempChartObject = {
    charts: charts,
    title: "Logan Local Wind (Green Canyon) - 24 Hour",
    divName: "logan-wind",
    numHours: 24 * 1,
    offset: false,
    dataType: 2, // 0 = Temperature, 1 = Snow Depth
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
    dataType: 1, // 0 = Temperature, 1 = Snow Depth
  };

  chartObjects.push(tempChartObject);

  tempChartObject = {
    charts: charts2,
    title: "Change in Snow Up Canyon - 1 Day",
    divName: "up-snow-change-24",
    numHours: 24 * 1,
    offset: true,
    dataType: 1, // 0 = Temperature, 1 = Snow Depth
  };

  chartObjects.push(tempChartObject);

  tempChartObject = {
    charts: charts2,
    title: "Temperature Up Canyon - 24 Hour",
    divName: "up-temp",
    numHours: 24 * 1,
    offset: false,
    dataType: 0, // 0 = Temperature, 1 = Snow Depth
  };

  chartObjects.push(tempChartObject);

  tempChartObject = {
    charts: charts2,
    title: "Wind Up Canyon - 24 Hour",
    divName: "up-wind",
    numHours: 24 * 1,
    offset: false,
    dataType: 2, // 0 = Temperature, 1 = Snow Depth
  };

  chartObjects.push(tempChartObject);

  tempChartObject = {
    charts: charts2,
    title: "Total Snow Up Canyon - 3 Day",
    divName: "up-snow-total",
    numHours: 24 * 3,
    offset: false,
    dataType: 1, // 0 = Temperature, 1 = Snow Depth
  };

  chartObjects.push(tempChartObject);

  displayAvyForecast();

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

  const loganURL = plotter.createUrl(weatherPlotParamObject);

  weatherPlotParamObject.lat = "41.95216";
  weatherPlotParamObject.lon = "-111.49158";
  const summitURL = plotter.createUrl(weatherPlotParamObject);

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

  // Iterate over the charts
  for (const chartObject of chartObjects) {
    var newHeading = document.createElement("h2");
    newHeading.textContent = chartObject.title;
    document.body.appendChild(newHeading);

    var newCanvas = document.createElement("canvas");

    newCanvas.setAttribute("id", chartObject.divName);

    document.body.appendChild(newCanvas);

    displayWeatherData2(
      chartObject.charts,
      chartObject.divName,
      chartObject.numHours,
      chartObject.dataType,
      chartObject.offset
    );
  }
};
