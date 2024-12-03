// This class handles all the data returned from the mesonet API
//
// It is very tightly coupled to the implementation of the page
// generated by clickweather.js
//
// In the past, the data returned by mesonet would only be sent to the charts
// plus a callback to build the legend table. Now the data returned by
// the API is managed by this class (which is persistent and a singleton)
//
// In the future, handling the chart objects may move in here as well

const DATA_TYPES = {
  absolute: 0,
  change: 1,
};

class clickWeatherManager {
  constructor() {
    if (clickWeatherManager.instance) return clickWeatherManager.instance;
    // Returned data variables
    this.allStations = [];
    this.allData = {};

    // Variables for creating different chart types
    this.locationAttributes = {};
    this.allCharts = [];

    // this.stationDataTemplate = [];
    clickWeatherManager.instance = this;
  }

  resetPersistentData() {
    this.allStations = [];
    this.allData = {};
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
      // I don't love having this tucked in the weather data object
      // Really I should be doing this back in clickweather.js
      // but that part of the script doesn't know about the new-ness of the station
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
    var offsetIndex =
      currentStation.displayOffset == true
        ? DATA_TYPES.change
        : DATA_TYPES.absolute;

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

  getStationsWtihAbsDataTypes(stationType) {
    let goodStationIdx = [];

    // console.log(this.allStations);

    this.allStations.forEach((thisStation, thisIndex) => {
      // console.log("In the loop");
      // console.log(this.allData[thisIndex]);
      if (stationType in this.allData[thisIndex]) {
        if (String(DATA_TYPES.absolute) in this.allData[thisIndex][stationType])
          goodStationIdx.push(thisIndex);
      }
    });

    return goodStationIdx;
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
    if (
      String(DATA_TYPES.absolute) in this.allData[stationIndex][stationType] ==
      false
    ) {
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
      headings.push(CHART_HEADINGS[stationType]);
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
        legendTableHTML += this.getLatestStationData(
          station.originalIndex,
          stationType
        );
      });

      legendTableHTML += "</tr>";
    });

    legendTableHTML += "</table>";

    return legendTableHTML;
  }

  stationChangeAnalysis(stationIdx, stationType, timeHrs) {
    // Check to see if we have absolte or relative data
    // Start with our data type as delta, and then change it to absolute if it exists

    // EDIT - Nevermind, I got rid of even allowing use of change data
    // If we want to do this stuff, we need absolute data
    /* 
    let dataType = 1;
    if ("0" in this.allData[stationIdx][stationType]) {
      dataType = 0;
    }
    */

    const dataType = 0;

    const thisStationData = this.allData[stationIdx][stationType][dataType];

    const lastDataIdx = thisStationData.length - 1;

    const endMeasurement = thisStationData[lastDataIdx].y;
    const endTime = new Date(thisStationData[lastDataIdx].x);

    let maxValue = endMeasurement;
    let minValue = endMeasurement;

    let startValue = 0;
    let finalDataIdx = 0;
    let timeDeltaHours = 0;

    // Iterate backwards over the data set
    for (let dataIdx = lastDataIdx; dataIdx > 0; dataIdx--) {
      // console.log(thisStationData[dataIdx].x);

      const currentTime = new Date(thisStationData[dataIdx].x);
      timeDeltaHours =
        (endTime.getTime() - currentTime.getTime()) / (1000 * 60 * 60);

      /*console.log(
        "idx:" + (lastDataIdx - dataIdx) + " time: " + timeDeltaHours
      );*/
      const currentValue = thisStationData[dataIdx].y;

      if (currentValue > maxValue) {
        maxValue = currentValue;
      }

      if (currentValue < minValue) {
        minValue = currentValue;
      }

      if (timeDeltaHours >= timeHrs) {
        startValue = currentValue;
        finalDataIdx = dataIdx;
        break;
      }
    }

    const thisStation = this.allStations[stationIdx];

    const results = {
      name: thisStation.name,
      elevation: thisStation.elevation,
      max: maxValue,
      min: minValue,
      startValue: startValue,
      endValue: endMeasurement,
      delta: endMeasurement - startValue,
      numDataPoints: lastDataIdx - finalDataIdx,
      elapsedTime: timeDeltaHours,
    };

    //console.log(results);

    return results;

    // return 0;
  }

  getChangeInData(stationType, timeHrs = 24) {
    const stationList = this.getStationsWtihAbsDataTypes(stationType);
    // console.log("**** STATION LIST ***");
    // console.log(stationList);

    // We'll be pushing objects into this array
    let stationChangeResults = [];
    stationList.forEach((stationIdx) => {
      stationChangeResults.push(
        this.stationChangeAnalysis(stationIdx, stationType, timeHrs)
      );
    });

    /*console.log(stationChangeResults);

    stationChangeResults.sort((a, b) => a.elevation - b.elevation);
    console.log(stationChangeResults);
    */

    return stationChangeResults;
  }
}
