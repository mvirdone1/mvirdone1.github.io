class DriveWeather {
  constructor(mapId, initialCenter, initialZoom) { }
}

let locationList = [];
let displayForecastTruePlotsFalse = true;

function appendLatLon(lat, lon) {
  locationList.push([lat, lon]);
}

// Update the marker list titles in the map manager markers
function updateMarkerTitles() {
  // Re-label all the markers since we deleted one
  myMapManager.getMarkers().forEach((marker, idx) => {
    marker.setLabel((idx + 1).toString());
  })
}

function updateDriveList() {
  console.log("Updating Drive List");
  $("#dynamic-div").empty();

  var linkURL = "https://mvirdone1.github.io/driveweather.html?drive=";

  // myMapManager.deleteAllMarkers();

  // Get all markers from the map manager and then iterate over them
  // iterate over all markers and their index
  myMapManager.getMarkers().forEach((marker, idx) => {
    // print troubleshooting info
    // console.log(marker);

    const numDecimals = 2;
    const lat = roundDecimal(marker.getPosition().lat(), numDecimals);
    const lon = roundDecimal(marker.getPosition().lng(), numDecimals);

    getWeatherOverview(lat, lon, idx, marker.title);
    linkURL = linkURL + lat + "," + lon + ";";

  })


  $("#drive-link").attr("href", linkURL);

  updateWeatherImages();
}

function deleteLocation(deleteIdx) {

  myMapManager.deleteMarker(deleteIdx);
  updateMarkerTitles();
  updateDriveList();
}

function getWeatherOverview(lat, lon, idx, title) {
  var localURL =
    "https://forecast.weather.gov/MapClick.php?lat=" + lat + "&lon=" + lon;

  console.log(lat, lon, idx);

  var printIdx = idx + 1;
  $("#dynamic-div").append(
    '<a target="_blank" href="' +
    localURL +
    '"><h1> Location ' +
    printIdx +
    " (" +
    title +
    ")</h1></a>"
  );

  var deleteButton = $(
    '<button id="deleteButton-' +
    idx +
    '">Delete Location ' +
    printIdx +
    "</button>"
  );

  // Append the button to a container div
  $("#dynamic-div").append(deleteButton);

  var myDiv = $("<div>").attr("id", "forecast-" + idx);

  $("#dynamic-div").append(myDiv);

  // Add a click event listener to the button
  deleteButton.on("click", function () {
    deleteLocation(idx);
  });

  myDiv.load(localURL + " #seven-day-forecast");
}

function getDriveURLParameters(driveString) {
  // Take the list of lat,lon;lat,lon;lat,lon and add to the mapmanager using addmarker
  console.log("Drive String:", driveString);

  driveString.split(";").forEach((loc) => {
    console.log("Location:", loc);
    if (loc.includes(",")) {
      myMapManager.addMarker({
        position: { lat: parseFloat(loc.split(",")[0]), lng: parseFloat(loc.split(",")[1]) },
        title: "",
        draggable: true,
        onDragEnd: ({ lat, lng, marker }) => {
          // Refresh the drive list
          updateDriveList();
        },
        label: (myMapManager.getMarkers().length + 1).toString()
      });
    }
  });
}

function driveWeatherInit() {
  // Usage example
  const initialCenter = { lat: 41.69, lng: -111.8 };
  const initialZoom = 8;
  const myMapManager = new MapManager("map", initialCenter, initialZoom);
  // Make this a global variable 
  window.myMapManager = myMapManager;

  // Create a weather manager and make it a global variable
  myWeatherManager = new WeatherGovManager();
  window.myWeatherManager = myWeatherManager;
  initForecastCharts(myWeatherManager);



  // Add a click event listener to the map
  myMapManager.setMapClickListener(async (position) => {
    console.log(`Map clicked at: ${position.lat}, ${position.lng}`);
    // myMapManager.addMarker(position, "");

    const locationString = await getLocationStringFromLatLon(position.lat, position.lng)
    const weatherLocationInstance = await myWeatherManager.addLocation(locationString, position.lat, position.lng);


    myMapManager.addMarker({
      position: position,
      title: locationString,
      draggable: true,
      weatherLocationInstance: weatherLocationInstance,

      onDragEnd: async ({ lat, lng }, marker) => {
        // Refresh the drive list
        const locationString = await getLocationStringFromLatLon(lat, lng);
        marker.setTitle(locationString);

        weatherLocationInstance.name = locationString;
        weatherLocationInstance.lat = lat;
        weatherLocationInstance.lon = lng;
        weatherLocationInstance.forecast = await getForecastHourlyData(lat, lng);
        myWeatherManager.refreshAllCharts();


        updateDriveList();
      }


    });



    //appendLatLon(lat, lon);
    updateDriveList();
  });

  var reverseButton = $('<button id="reverseButton">Reverse List</button>');

  $("#map-div").append(reverseButton);
  // Add a click event listener to the button
  reverseButton.on("click", function () {
    reverseList();
  });

  // Get the URL and see if we have pre-set
  const queryString = window.location.search;
  console.log(queryString);
  const urlParams = new URLSearchParams(queryString);

  // appendLatLon(41.73, -111.83);

  if (urlParams.has("showPlots")) {
    displayForecastTruePlotsFalse = false;
  }

  if (urlParams.has("drive")) {
    console.log("Found a drive parameter");
    getDriveURLParameters(urlParams.get("drive"));
    updateDriveList();
    myMapManager.setZoomOnMarkerBounds();
  }

  var intervalId = window.setInterval(function () {
    console.log("Updating Images");
    updateWeatherImages();
  }, 1000);
}

function initForecastCharts(myWeatherManager) {
  const ForecastElement = createToggleChildElements(
    "chart-div",
    "Forecast Charts",
  );

  const charts = [
    {
      canvasId: "tempChart",
      chartTitle: "Temperature",
      parser: myWeatherManager
        .parseTemperature
        .bind(myWeatherManager)
    },
    {
      canvasId: "popChart",
      chartTitle: "Precipitation %",
      parser: myWeatherManager
        .parsePrecipitationProbability
        .bind(myWeatherManager)
    },

  ]

  charts.forEach(chart => {


    const myDiv = document.createElement("div");
    myDiv.style.width = 800 + "px";
    myDiv.style.height = 600 + "px";

    //myDiv.style.height = 600 + "px";
    myDiv.style.backgroundColor = "white";
    myDiv.id = chart.canvasId + "-canvas-div"

    myDiv.innerHTML = "<h2>" + chart.chartTitle + "</h2>\n";
    const myCanvas = document.createElement("canvas");
    myCanvas.id = chart.canvasId;


    myDiv.appendChild(myCanvas);
    ForecastElement.appendChild(myDiv);

    myWeatherManager.addChartType(
      chart.canvasId,
      chart.chartTitle,
      chart.parser
    );

  });




}


function reverseList() {
  const markers = myMapManager.getMarkers();
  markers.reverse();
  myMapManager.setMarkers(markers);
  updateMarkerTitles();
  updateDriveList();
}

function updateWeatherImages() {
  // Only do this if we're doing embedded forecasts
  if (displayForecastTruePlotsFalse) {
    $("#dynamic-div")
      .find("img")
      .each(function (index) {
        if ($(this).attr("class") != "fixed") {
          var $imgsrc = $(this).attr("src");
          var $imgsrc2 = "https://forecast.weather.gov/" + $imgsrc;
          $(this).attr("src", $imgsrc2);
          $(this).attr("class", "fixed");
          // $img.attr('alt',imgalt);
        }
      });
  }
}

