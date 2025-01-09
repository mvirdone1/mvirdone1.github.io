const NUM_ELEVATION = 3;
const NUM_BEARINGS = 360 / 45;

const DANGER_ROSE_NUM_TO_TEXT = [
  "No rating", // 0
  "Pockets of low danger", // 1
  "Low danger", // 2
  "Pockets of moderate danger", // 3
  "Moderate danger", // 4
  "Pockets of considerable danger", // 5
  "Considerable danger", // 6
  "Pockets of high danger", // 7
  "High danger", // 8
  "Pockets of extreme danger", // 9
  "Extreme danger", // 10
];

const DANGER_ROSE_NUM_TO_COLOR_STRING = [
  "Light Grey", // 0
  "Green", // 1
  "Green", // 2
  "Yellow", // 3
  "Yellow", // 4
  "Orange", // 5
  "Orange", // 6
  "Red", // 7
  "Red", // 8
  "Black", // 9
  "Black", // 10
];

const DANGER_ROSE_NUM_TO_RGB_COLOR = [
  "#D3D3D3", // Light Grey (0)
  "#008000", // Green (1)
  "#008000", // Green (2)
  "#FFFF00", // Yellow (3)
  "#FFFF00", // Yellow (4)
  "#FFA500", // Orange (5)
  "#FFA500", // Orange (6)
  "#FF0000", // Red (7)
  "#FF0000", // Red (8)
  "#000000", // Black (9)
  "#000000", // Black (10)
];

const REGIONAL_INFO = {
  logan: {
    // Index 0 is highest elevation, index 2 is lowest
    // This matches what's in the danger rose
    elevations: [
      { low: 8500, high: 10000 },
      { low: 7000, high: 8499 },
      { low: 0, high: 6999 },
    ],
  },
};

function generateForecastHTMLFromJSON(forecastJSON) {
  console.log(forecastJSON);
  const forecastText = forecastJSON.advisories[0].advisory.bottom_line;
  const forecastTime = forecastJSON.advisories[0].advisory.date_issued;
  parseUtahDangerRose(forecastJSON.advisories[0].advisory.overall_danger_rose);

  document
    .getElementById("tableDiv")
    .appendChild(
      buildDangerRoseTable(
        parseUtahDangerRose(
          forecastJSON.advisories[0].advisory.overall_danger_rose
        )
      )
    );

  const calTopoLayerString = buildFullCaltopoString(
    parseUtahDangerRose(forecastJSON.advisories[0].advisory.overall_danger_rose)
  );

  let pageString = "<p><b>(" + forecastTime + ") </b>" + forecastText + "</p>";

  pageString +=
    "<hr>" +
    '<a target="_blank" href="' +
    calTopoLayerString +
    '">Linky to CalTopo</a>';

  // return `<p> ${forecastText} </p>`;

  return pageString;
}

function roseElementChanged(oldElement, newElement) {
  if (
    oldElement.elevation.low != newElement.elevation.low ||
    oldElement.elevation.high != newElement.elevation.high ||
    oldElement.rating_color_rgb_hex != newElement.rating_color_rgb_hex
  ) {
    return true;
  } else {
    return false;
  }
}
function buildCaltopoSubString(startElement, endElement) {
  let myString = "";
  myString += "a" + startElement.aspect + "-" + endElement.aspect;
  myString +=
    "e" + startElement.elevation.low + "-" + startElement.elevation.high;
  myString += "fc" + startElement.rating_color_rgb_hex.slice(1);
  myString;
  return myString;
}

function buildFullCaltopoString(
  dangerRoseObject,
  baseURLString = "https://caltopo.com/map.html#ll=41.94969,-111.5188&z=13&b=mbt"
) {
  const useSlope = false;
  const minSlope = 27;
  const maxSlope = 60;

  let finalURL = baseURLString + "&o=scb_";

  // Make the base string either include the slope or be blank
  const baseString = useSlope ? "s" + minSlope + "-" + maxSlope : "";

  const urlStringArray = [];
  let oldElement = dangerRoseObject[0];
  let previousElement = dangerRoseObject[0];
  dangerRoseObject.forEach((currentElement) => {
    if (roseElementChanged(oldElement, currentElement)) {
      finalURL +=
        baseString + buildCaltopoSubString(oldElement, previousElement) + "p";
      urlStringArray.push(
        baseString + buildCaltopoSubString(oldElement, previousElement)
      );
      oldElement = currentElement;
    }

    previousElement = currentElement;
  });

  finalURL +=
    baseString +
    buildCaltopoSubString(
      oldElement,
      dangerRoseArray[dangerRoseArray.length - 1]
    );

  finalURL += "&n=0.45";
  console.log(finalURL);

  return finalURL;

  // console.log(urlStringArray);
}

function buildDangerRoseTable(dangerRoseObject) {
  const myTable = document.createElement("table");
  myTable.border = "1";

  const headerRow = document.createElement("tr");

  const elevationHeadingCell = document.createElement("th");
  elevationHeadingCell.textContent = "Elevation";
  headerRow.appendChild(elevationHeadingCell);

  // Build the heading based on bearings
  for (headerIdx = 0; headerIdx < NUM_BEARINGS; headerIdx++) {
    const headerCell = document.createElement("th");
    headerCell.textContent = headerIdx * 45;
    headerRow.appendChild(headerCell);
  }

  myTable.appendChild(headerRow);

  for (eleIdx = 0; eleIdx < NUM_ELEVATION; eleIdx++) {
    // Create the row object and also make the first cell the elevation
    const myRow = document.createElement("tr");
    const elevationCell = document.createElement("td");

    elevationCell.textContent =
      dangerRoseObject[eleIdx * NUM_BEARINGS].elevation.low +
      " -> " +
      dangerRoseObject[eleIdx * NUM_BEARINGS].elevation.high;
    myRow.appendChild(elevationCell);

    for (hdgIdx = 0; hdgIdx < NUM_BEARINGS; hdgIdx++) {
      const myDataCell = document.createElement("td");

      myDataCell.textContent =
        dangerRoseObject[eleIdx * NUM_BEARINGS + hdgIdx].rating_string;

      myDataCell.style.backgroundColor =
        dangerRoseObject[eleIdx * NUM_BEARINGS + hdgIdx].rating_color_rgb_hex;
      myRow.appendChild(myDataCell);
    }
    myTable.appendChild(myRow);
  }

  console.log(myTable);
  document.getElementById("tableDiv").appendChild(myTable);
  return myTable;
}

function parseUtahDangerRose(
  dangerRoseString,
  regionalInfo = REGIONAL_INFO["logan"]
) {
  const dangerRoseElements = dangerRoseString.split(",");
  if (dangerRoseElements.length != NUM_ELEVATION * NUM_BEARINGS) {
    console.log("ERROR: Danger rose has wrong number of elements ");
  }

  dangerRoseArray = [];

  // Iterate over elevation and aspects and build an array of objects with the information that I need.
  for (eleIdx = 0; eleIdx < NUM_ELEVATION; eleIdx++) {
    for (hdgIdx = 0; hdgIdx < NUM_BEARINGS; hdgIdx++) {
      const arrayIdx = eleIdx * NUM_BEARINGS + hdgIdx;
      const currentRoseNum = dangerRoseElements[arrayIdx];

      const currentRoseElement = {};
      currentRoseElement.elevation = regionalInfo.elevations[eleIdx];
      currentRoseElement.aspect = hdgIdx * 45;
      currentRoseElement.rating_num = currentRoseNum;
      currentRoseElement.rating_string =
        DANGER_ROSE_NUM_TO_TEXT[currentRoseNum];
      currentRoseElement.rating_color_name =
        DANGER_ROSE_NUM_TO_COLOR_STRING[currentRoseNum];
      currentRoseElement.rating_color_rgb_hex =
        DANGER_ROSE_NUM_TO_RGB_COLOR[currentRoseNum];

      dangerRoseArray.push(currentRoseElement);
    }
  }
  return dangerRoseArray;
}
