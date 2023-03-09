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
  locTitle,
  numHours = 24,
  stationType = 0,
  displayOffset = false
) {
  // Retrieve Mesonet temperature data using Mesonet API
  const apiURL = "https://api.mesowest.net/v2/stations/timeseries";
  const token = "0ad1ebf61ff847a78b2166e39db3cbd6";

  var varName = "";
  var plotType = "";
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

  const params = {
    token: token,
    stid: stid,
    vars: varName,
    units: "english",
    recent: numHours * 60, // Minutes
  };
  const queryString = Object.keys(params)
    .map(
      (key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
    )
    .join("&");

  const apiUrlWithParams = `${apiURL}?${queryString}`;
  console.log(apiUrlWithParams);
  fetch(apiUrlWithParams)
    .then((response) => response.json())
    .then((data) => {
      console.log("Inside Fetch: " + stid);

      //console.log(data);
      var dataSet = [];
      switch (stationType) {
        case 1: // Snow Depth
          dataSet = data.STATION[0].OBSERVATIONS.snow_depth_set_1;

          break;

        case 0: // Air Temp
        default: // Default to air temp
          dataSet = data.STATION[0].OBSERVATIONS.air_temp_set_1;
      }

      //console.log(dataSet);
      fixZeroAndNull(dataSet);

      if (displayOffset) {
        var offset = dataSet[0];

        for (var idx = 0; idx < dataSet.length; idx++) {
          dataSet[idx] = dataSet[idx] - offset;
        }
      }

      // dataSet = setErroneousValuesToAverage(dataSet, 10, 3);

      // Extract temperature data from API response

      const chartData = dataSet.map((value) => parseFloat(value.value));
      const timeData = data.STATION[0].OBSERVATIONS.date_time.map((value) =>
        new Date(value.valid_time).getTime()
      );

      //console.log(data.STATION[0].OBSERVATIONS.date_time);

      // Create line graph using Chart.js
      const canvas = document.getElementById(canvasId);
      // canvas.style.width = "80%";
      canvas.style.height = "50vh";
      const ctx = canvas.getContext("2d");

      var dates = data.STATION[0].OBSERVATIONS.date_time.map((str) =>
        new Date(str).toLocaleTimeString()
      );

      dates = data.STATION[0].OBSERVATIONS.date_time;

      new Chart(ctx, {
        type: "line",
        data: {
          labels: dates,

          /*[
            ...Array(data.STATION[0].OBSERVATIONS.air_temp_set_1.length).keys(),
          ],*/
          datasets: [
            {
              label: plotType + " at " + locTitle + " (" + stid + ")",
              data: dataSet,
              fill: false,
              borderColor: "rgb(75, 192, 192)",
              tension: 0.1,
            },
          ],
        },
        xAxes: [
          {
            ticks: {
              display: true,
              autoSkip: true,
              maxTicksLimit: 4,
            },
          },
        ],
        options: {
          responsive: false,
          scales: {
            xAxes: [
              {
                type: "time",
                ticks: {
                  maxTicksLimit: 12,
                },
                displayFormats: {
                  hour: "MMM D, h:mm",
                },
              },
            ],
          },
        },
      });
    })
    .catch((error) => console.error(error));
}

function displayWeatherData(
  stid,
  canvasId,
  locTitle,
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

  const params = {
    token: token,
    stid: stid,
    vars: varName,
    units: "english",
    recent: numHours * 60, // Minutes
  };
  const queryString = Object.keys(params)
    .map(
      (key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
    )
    .join("&");

  const apiUrlWithParams = `${apiURL}?${queryString}`;
  console.log(apiUrlWithParams);
  fetch(apiUrlWithParams)
    .then((response) => response.json())
    .then((data) => {
      console.log("Inside Fetch: " + stid);

      //console.log(data);
      var dataSet = [];
      switch (stationType) {
        case 1: // Snow Depth
          dataSet = data.STATION[0].OBSERVATIONS.snow_depth_set_1;

          break;

        case 0: // Air Temp
        default: // Default to air temp
          dataSet = data.STATION[0].OBSERVATIONS.air_temp_set_1;
      }

      //console.log(dataSet);
      fixZeroAndNull(dataSet);

      if (displayOffset) {
        var offset = dataSet[0];

        for (var idx = 0; idx < dataSet.length; idx++) {
          dataSet[idx] = dataSet[idx] - offset;
        }
      }

      // dataSet = setErroneousValuesToAverage(dataSet, 10, 3);

      // Extract temperature data from API response

      const chartData = dataSet.map((value) => parseFloat(value.value));
      const timeData = data.STATION[0].OBSERVATIONS.date_time.map((value) =>
        new Date(value.valid_time).getTime()
      );

      //console.log(data.STATION[0].OBSERVATIONS.date_time);

      // console.log("Test 2");
      // Create line graph using Chart.js
      const canvas = document.getElementById(canvasId);
      // canvas.style.width = "80%";
      canvas.style.height = "50vh";
      const ctx = canvas.getContext("2d");

      var dates = data.STATION[0].OBSERVATIONS.date_time.map((str) =>
        new Date(str).toLocaleTimeString()
      );

      dates = data.STATION[0].OBSERVATIONS.date_time;

      new Chart(ctx, {
        type: "line",
        data: {
          labels: dates,

          /*[
            ...Array(data.STATION[0].OBSERVATIONS.air_temp_set_1.length).keys(),
          ],*/
          datasets: [
            {
              label: "Temperature at " + locTitle + " (" + stid + ")",
              data: dataSet,
              fill: false,
              borderColor: "rgb(75, 192, 192)",
              tension: 0.1,
            },
          ],
        },
        xAxes: [
          {
            ticks: {
              display: true,
              autoSkip: true,
              maxTicksLimit: 4,
            },
          },
        ],
        options: {
          responsive: false,
          scales: {
            xAxes: [
              {
                type: "time",
                ticks: {
                  maxTicksLimit: 12,
                },
                displayFormats: {
                  hour: "MMM D, h:mm",
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
  const parseArray = [
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
      locTitle: "Tony Grove Upper",
      stid: "TGSU1",
    },
    {
      locTitle: "Swan Flats",
      stid: "LGS",
    },
  ];

  for (var idx = 0; idx < parseArray.length; idx++) {
    var divName = parseArray[idx].stid;
    var divTitle = parseArray[idx].locTitle;

    var newHeading = document.createElement("h2");
    var link = document.createElement("a");

    link.textContent = divTitle + " (" + divName + ")";
    link.setAttribute("href", " ");
    newHeading.append(link);
    document.body.appendChild(newHeading);

    var newCanvas = document.createElement("canvas");
    var containerName = divName;

    newCanvas.setAttribute("id", containerName);

    document.body.appendChild(newCanvas);

    displayWeatherData2(divName, divName, divTitle, 7 * 24, 1, true);
  }
};
