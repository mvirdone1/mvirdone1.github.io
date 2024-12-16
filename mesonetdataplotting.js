function displayWeatherData2(
  stid,
  canvasId,
  numHours = 24,
  stationType = 0,
  displayOffset = false,
  radiusInfo = "",
  customCallbackFunction = ""
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
    case CHART_TYPES.snowDepth:
      varName = "snow_depth";
      plotType = "Snow Depth" + changeString;
      break;

    case CHART_TYPES.windSpeed:
      varName = "wind_speed,wind_gust";
      plotType = "Wind Speed and Gust" + changeString;
      break;

    case CHART_TYPES.SWE:
      varName = "snow_water_equiv";
      // varname = "precip_accum_24_hour";
      plotType = "SWE" + changeString;
      break;

    case CHART_TYPES.temperature:
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

  if (stid == "" && radiusInfo == "") {
    console.error("Request for plotting has neither station or radius info");
    return 0;
  }

  const params = {
    token: token,
    vars: varName,
    recent: numHours * 60, // Minutes
    units: "english",
  };
  var queryString = Object.keys(params)
    .map(
      (key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
    )
    .join("&");

  if (stid != "") {
    // Append the comma separated list of station IDs
    queryString += "&stid=" + stidStr;
  } else {
    queryString +=
      "&radius=" +
      radiusInfo.lat +
      "," +
      radiusInfo.lon +
      "," +
      radiusInfo.radius;

    queryString += "&limit=" + radiusInfo.limit;
  }

  const apiUrlWithParams = `${apiURL}?${queryString}`;
  console.log("Station Type: " + stationType);
  console.log(apiUrlWithParams);
  fetch(apiUrlWithParams)
    .then((response) => response.json())
    .then((data) => {
      let numStations = data.STATION?.length || 0;
      console.log("Inside Fetch: " + stid);
      console.log("Stations " + numStations);

      var dataSets = [];

      const chartColors = [
        "rgb(255, 99, 132)", // Red
        "rgb(54, 162, 235)", // Blue
        "rgb(0, 236, 100)", // Bright green
        "rgb(75, 192, 192)", // Teal
        "rgb(153, 102, 255)", // Purple
        "rgb(0, 0, 0)", // Black
      ];

      // Iterate over the data sets
      for (var dataSetIdx = 0; dataSetIdx < numStations; dataSetIdx++) {
        var dataSet = [];
        var tempData = [];
        var dates = [];
        var stationName = data.STATION[dataSetIdx].NAME;
        var stationID = data.STATION[dataSetIdx].STID;

        var station = {};
        station.lat = data.STATION[dataSetIdx].LATITUDE;
        station.lon = data.STATION[dataSetIdx].LONGITUDE;
        station.name = data.STATION[dataSetIdx].NAME;
        station.stid = data.STATION[dataSetIdx].STID;
        station.elevation = data.STATION[dataSetIdx].ELEVATION;
        station.stationType = stationType;
        station.displayOffset = displayOffset;

        maxChange = 0;

        // Get the data based on what type of request we've sent
        switch (stationType) {
          case CHART_TYPES.snowDepth: // Snow Depth
            tempData = data.STATION[dataSetIdx].OBSERVATIONS.snow_depth_set_1;
            maxChange = 10; // Made up number for 10" won't change
            break;

          case CHART_TYPES.windSpeed:
            tempData = data.STATION[dataSetIdx].OBSERVATIONS.wind_speed_set_1;
            maxChange = 25; // Made up number for 25 MPH max change
            break;

          case CHART_TYPES.SWE:
            tempData =
              data.STATION[dataSetIdx].OBSERVATIONS.snow_water_equiv_set_1;
            maxChange = 1; // 1 inch of SWE between measurements
            break;

          case CHART_TYPES.temperature: // Air Temp
          default: // Default to air temp
            tempData = data.STATION[dataSetIdx].OBSERVATIONS.air_temp_set_1;
            maxChange = 15; // Made up number for 15 degrees max change
        }

        // Clean up the data removing null and doing the offsets if needed
        fixZeroAndNull(tempData);

        tempData = fixBadDataOnMaxChange(tempData, maxChange);

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

        // dataSet = replaceXYDataAnomaliesWithAdjacentAverage(dataSet, 1);

        // Add the array of objects to the array of arrays
        dataSets.push({
          //x: dates,
          //y: dataSet,
          station: station,
          label: stationName + " (" + stationID + ")",
          data: dataSet,
          fill: false,
          borderColor: chartColors[dataSetIdx],
          tension: 0.1,
          pointRadius: 0,
        });
      }

      if (customCallbackFunction) {
        // This is passing by reference, so values of dataSets
        // is being modified in here, specifically the borderColor
        customCallbackFunction(dataSets);
      }

      const numTicks = Math.max(12, Math.floor(numHours / 12));

      // Create line graph using Chart.js
      const canvas = document.getElementById(canvasId);
      canvas.style.width = "80%";
      // canvas.style.height = "50vh";
      // canvas.style.width = "80vw";
      // canvas.style.width = "80%";
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
