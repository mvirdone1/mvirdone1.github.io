// Retrieve Mesonet temperature data using Mesonet API
const apiURL = "https://api.mesowest.net/v2/stations/timeseries";
const token = "0ad1ebf61ff847a78b2166e39db3cbd6";
const numHours = 36;
const params = {
  token: token,
  stid: "KLGU",
  vars: "air_temp",
  units: "english",
  recent: numHours * 60, // Minutes
};
const queryString = Object.keys(params)
  .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
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

    // Convert time to local timezone
    const localTimeData = timeData.map((time) =>
      new Date(time).toLocaleString()
    );

    console.log(localTimeData);
    /// var yValues = [42, 40, 48, 57, 52, 60, 45];

    console.log("Test 2");
    // Create line graph using Chart.js
    const ctx = document.getElementById("temperatureChart").getContext("2d");
    new Chart(ctx, {
      type: "line",
      data: {
        labels: [
          ...Array(data.STATION[0].OBSERVATIONS.air_temp_set_1.length).keys(),
        ],
        datasets: [
          {
            label: `Temperature at Logan, UT (KLGU)`,
            data: data.STATION[0].OBSERVATIONS.air_temp_set_1,
            fill: false,
            borderColor: "rgb(75, 192, 192)",
            tension: 0.1,
          },
        ],
      },
      options: {
        scales: {
          x: {
            type: "time",
            time: {
              unit: "hour",
              displayFormats: {
                hour: "MMM D, h:mm A",
              },
            },
            ticks: {
              source: "data",
            },
          },
        },
      },
    });
  })
  .catch((error) => console.error(error));
