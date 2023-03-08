function displayWeatherData(stid = KLGU, canvasId, locTitle, numHours = 24) {
  // Retrieve Mesonet temperature data using Mesonet API
  const apiURL = "https://api.mesowest.net/v2/stations/timeseries";
  const token = "0ad1ebf61ff847a78b2166e39db3cbd6";

  const params = {
    token: token,
    stid: stid,
    vars: "air_temp",
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
      console.log("Inside Fetch");

      console.log(data.STATION[0].OBSERVATIONS.air_temp_set_1);
      // Extract temperature data from API response

      const temperatureData = data.STATION[0].OBSERVATIONS.air_temp_set_1.map(
        (value) => parseFloat(value.value)
      );
      const timeData = data.STATION[0].OBSERVATIONS.date_time.map((value) =>
        new Date(value.valid_time).getTime()
      );

      console.log(data.STATION[0].OBSERVATIONS.date_time);

      console.log("Test 2");
      // Create line graph using Chart.js
      const canvas = document.getElementById(canvasId);
      // canvas.style.width = "80%";
      canvas.style.height = "50vh";
      const ctx = canvas.getContext("2d");

      var dates = data.STATION[0].OBSERVATIONS.date_time.map((str) =>
        new Date(str).toLocaleTimeString()
      );

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
              data: data.STATION[0].OBSERVATIONS.air_temp_set_1,
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
                ticks: {
                  maxTicksLimit: 12,
                },
                //type: "time",

                /*
                time: {
                  unit: "hour",
                  displayFormats: {
                    hour: "MMM D, h:mm",
                  },
                },
                */
              },
            ],
          },

          /*
          scales: {
            x: {
              type: "time",

              /*x: {
              type: "time",
              time: {
                unit: "hour",
                displayFormats: {
                  hour: "MMM D, h:mm",
                },
              },
              ticks: {
                source: "data",
                count: 5,
              },
             
            },
          },*/
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
      locTitle: "Swan Flats",
      stid: "C8914",
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

    displayWeatherData(divName, divName, divTitle);
  }
};
