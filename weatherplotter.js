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
