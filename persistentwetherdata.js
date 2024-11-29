class persistentWeatherData {
  constructor() {
    if (persistentWeatherData.instance) return persistentWeatherData.instance;
    this.allStations = [];
    this.allData = {};

    // this.stationDataTemplate = [];
    persistentWeatherData.instance = this;
  }

  setAllStations(newAllStations) {
    this.allStations = newAllStations;
  }

  addStationData(currentDataSet) {
    var stationArrayIndex = this.allStations.findIndex(
      (station) => station.stid === currentDataSet.station.stid
    );
    const currentStation = currentDataSet.station;

    // If the station doesn't currently exist,
    // then we need to add it to the station list
    if (stationArrayIndex === -1) {
      this.allStations.push(currentStation);
      stationArrayIndex = this.allStations.length - 1;

      this.allData[stationArrayIndex] = {};

      /*
        station.lat = data.STATION[dataSetIdx].LATITUDE;
        station.lon = data.STATION[dataSetIdx].LONGITUDE;
        station.name = data.STATION[dataSetIdx].NAME;
        station.stid = data.STATION[dataSetIdx].STID;
        station.elevation = data.STATION[dataSetIdx].ELEVATION;
        station.stationType = stationType;
        station.displayOffset 
      // Note the enumeration for stationType is defined in
      // weatherHealper.js as chartTypes
      */

      const stationLocation = {
        lat: parseFloat(currentStation.lat),
        lng: parseFloat(currentStation.lon),
      };

      // The map manager is global
      myMapManager.addMarker(
        stationLocation,
        currentStation.name,
        currentStation.stid,
        clickWeatherColors[stationArrayIndex]
      );
    }
    // Because this (currentDataSet) is an object that was passed
    // we are actually modifying the source object in this case
    currentDataSet.borderColor = rgbArrayToString(
      clickWeatherColors[stationArrayIndex]
    );

    var lastDataPoint = currentDataSet.data.length - 1;
    var stationType = currentStation.stationType;

    // Determine offsetIndex based on displayOffset
    var offsetIndex = currentStation.displayOffset == true ? 1 : 0;

    /*
    var offsetIndex = 0;
    if (currentStation.displayOffset == true) {
      offsetIndex = 1;
    }
      */

    // First see if the sub arrays exist for the needed data types
    // if they don't initialize them for this station
    // Once that's done, populate the actual data array

    if (!this.allData[stationArrayIndex][stationType]) {
      this.allData[stationArrayIndex][stationType] = {};
    }

    if (!this.allData[stationArrayIndex][stationType][offsetIndex]) {
      this.allData[stationArrayIndex][stationType][offsetIndex] = [];
    }

    this.allData[stationArrayIndex][stationType][offsetIndex] =
      currentDataSet.data;
  }

  getAbsoluteDataTypes() {
    // This gets the unique keys at the 2nd level where the 3rd level has a key of '0'
    const items = Object.values(this.allData);

    const keys = items
      .map((obj) => {
        return Object.keys(obj).filter((key) => {
          return obj[key][0] && obj[key][0].hasOwnProperty(0); // Check if key '0' exists at 3rd level
        });
      })
      .flat(); // Flatten the result into a single array of keys

    // Using Set to ensure uniqueness
    return [...new Set(keys)];
  }

  getLatestStationData(stationIndex, stationType) {
    // console.log("station Data get: " + stationIndex + " " + stationType);
    // console.log(this.allData);

    // If the station type doesn't exist, return a blank cell
    if (stationType in this.allData[stationIndex] == false) {
      return "<td>&nbsp</td>";
    }

    // If the absolute data type (0) doesn't exist, return a blank cell
    if ("0" in this.allData[stationIndex][stationType] == false) {
      return "<td>&nbsp</td>";
    }

    const dataSource = this.allData[stationIndex][stationType][0];

    const lastDataIndex = dataSource.length - 1;

    const lastMeasurementTime = timeUTCToLocalString(
      dataSource[lastDataIndex].x
    );
    const lastMeasurementValue = parseFloat(
      dataSource[lastDataIndex].y
    ).toFixed(0);

    const cellString =
      "<td>" +
      lastMeasurementValue +
      " <sub>" +
      lastMeasurementTime +
      "</sub></td>\n";

    return cellString;
  }

  prepareLegendTable(mapCenter) {
    // Calculate distances and add original index to each station
    const stationsWithDistance = this.allStations.map((station, index) => {
      const distance = calculateLatLonDistance(
        station.lat,
        station.lon,
        mapCenter.lat,
        mapCenter.lon
      );

      var distance_mi = distance.miles.toFixed(1);
      return { ...station, distance_mi, originalIndex: index };
    });

    // Sort stations based on distance
    stationsWithDistance.sort((a, b) => a.distance_mi - b.distance_mi);
    let legendTableHTML = "";
    /*legendTableHTML += ` 
        <button onclick="toggleTableVisibility('legend-table')">Show/Hide Legend</button> `;
    */
    legendTableHTML += "<table id='legend-table' border='1' cellpadding='5'>";
    legendTableHTML += "<tr>";

    let headings = [
      "ID",
      "Dist (mi)",
      "Name",
      "Elev (ft)",
      // "Temp (f)",
      // "Snow (in)",
      // "Wind (mph)",
    ];

    let availableStationTypes = this.getAbsoluteDataTypes(this.allData);

    // Append the specific headings for the data that is present
    availableStationTypes.forEach((stationType) => {
      headings.push(chartHeadings[stationType]);
    });

    // Iterate over the headings and print each one
    headings.forEach((heading) => {
      legendTableHTML += "<th>" + heading + "</th>";
    });

    legendTableHTML += "</tr>";
    // ("<tr><th>ID</th><th>Dist (mi)</th><th>Name</th><th>Elevation</th></tr>");

    stationsWithDistance.forEach((station, index) => {
      const color = rgbArrayToString(clickWeatherColors[station.originalIndex]);

      legendTableHTML += `<tr>`;
      legendTableHTML += `<td style="background-color: ${color};">${station.stid}</td>`;
      legendTableHTML += `<td>${station.distance_mi}</td>`;
      legendTableHTML += `<td>${station.name}</td>`;
      legendTableHTML += `<td>${station.elevation}</td>`;

      availableStationTypes.forEach((stationType) => {
        legendTableHTML += globalStationData.getLatestStationData(
          station.originalIndex,
          stationType
        );
      });

      legendTableHTML += "</tr>";
    });

    legendTableHTML += "</table>";

    return legendTableHTML;
  }
}
