// Retrieve Mesonet temperature data using Mesonet API
const apiURL = "https://api.mesowest.net/v2/stations/timeseries";
const token = "0ad1ebf61ff847a78b2166e39db3cbd6";
const params = {
  token: token,
  stid: "KLGU",
  vars: "air_temp",
  units: "english",
  start: "202201010000",
  end: "202203010000",
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
    console.log(data);

    console.log(data.STATION[0].OBSERVATIONS.air_temp_set_1);
    // Extract temperature data from API response
    const temperatureData = data.data[0].values.map((value) =>
      parseFloat(value.value)
    );

    // Create line graph using Chart.js
    const ctx = document.getElementById("temperatureChart").getContext("2d");
    new Chart(ctx, {
      type: "line",
      data: {
        labels: [...Array(temperatureData.length).keys()],
        datasets: [
          {
            label: `Temperature at Tulsa`,
            data: temperatureData,
            fill: false,
            borderColor: "rgb(75, 192, 192)",
            tension: 0.1,
          },
        ],
      },
      options: {},
    });
  })
  .catch((error) => console.error(error));
