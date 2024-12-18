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
function displayWeatherGovHourlyForecast(contentElement) {
  // const contentElement =

  lat = document.getElementById("lat").value;
  lon = document.getElementById("lon").value;

  /*
  // Create the heading
  var newHeading = document.createElement("h1");
  newHeading.textContent = "Map Click Forecast";
  contentElement.append(newHeading);

  */

  var forecastAddress = "https://forecast.weather.gov/MapClick.php?";
  forecastAddress += "lat=" + lat;
  forecastAddress += "&lon=" + lon;
  var linkHeader = document.createElement("a");
  linkHeader.id = "forecast-weathergov-link";
  linkHeader.href = forecastAddress;
  linkHeader.innerHTML = "<h1>Map Click Forecast</h1>";
  contentElement.append(linkHeader);

  var plotId = "weather-plot";

  createWeatherPlotImageElement(plotId, contentElement);

  var plotId = "weather-plot-2";

  createWeatherPlotImageElement(plotId, contentElement);

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
