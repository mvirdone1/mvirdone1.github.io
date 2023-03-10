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
    numHours: 24,
    offset: false,
    dataType: 0, // 0 = Temperature, 1 = Snow Depth
  };

  chartObjects.push(tempChartObject);

  var charts2 = [];
  charts2.push("TGLU1");
  charts2.push("TGSU1");
  charts2.push("LGS");

  tempChartObject = {
    charts: charts2,
    title: "Change in Snow Up Canyon - 3 Day",
    divName: "up-snow-change",
    numHours: 72,
    offset: true,
    dataType: 1, // 0 = Temperature, 1 = Snow Depth
  };

  chartObjects.push(tempChartObject);

  tempChartObject = {
    charts: charts2,
    title: "Temperature Up Canyon - 24 Hour",
    divName: "up-temp",
    numHours: 24,
    offset: false,
    dataType: 0, // 0 = Temperature, 1 = Snow Depth
  };

  chartObjects.push(tempChartObject);

  tempChartObject = {
    charts: charts2,
    title: "Total Snow Up Canyon - 3 Day",
    divName: "up-snow-total",
    numHours: 72,
    offset: false,
    dataType: 1, // 0 = Temperature, 1 = Snow Depth
  };

  chartObjects.push(tempChartObject);

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
