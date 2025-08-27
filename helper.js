// Chat GPT Code
// Using this to take a javascript element and use
// the key as the text in a dropdown menu
function camelToTitleCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, "$1 $2") // split words at camel case
    .replace(/([A-Z][a-z])/g, " $1") // split words at title case
    .replace(/(\b\w)/gi, function (word) {
      // capitalize first letter of each word
      return word.toUpperCase();
    });
}

function printObjectPre(myObject, itemsOnly = false) {
  if (itemsOnly) {
    var returnString = myObject.length + " elements \n";

    // Iterate over the array of search objects
    for (var objectKey in myObject) {
      console.log(myObject[objectKey].searchParams);
      // For each search object, iterate over the searchParams (another array)
      for (var searchKey in myObject[objectKey].searchParams) {
        console.log(myObject[objectKey].searchParams[searchKey]);
        returnString += myObject[objectKey].title + ",";
        for (var currentSearchParam in myObject[objectKey].searchParams[
          searchKey
        ]) {
          returnString +=
            myObject[objectKey].searchParams[searchKey][currentSearchParam] +
            ",";
        }
        returnString += "\n";
      }
    }

    return returnString;
  } else {
    return (
      myObject.length +
      " elements \n" +
      JSON.stringify(myObject).replace(/\[/g, "\n[").replace(/\}\,/g, "},\n")
    );
  }
}

// GPT Code for set and get cookies
// Function to set a cookie with the specified name and value
function setLocalStorage(name, value) {
  // document.cookie = "username=John Doe; expires=Thu, 18 Dec 2213 12:00:00 UTC";

  localStorage.setItem(name, value);

  /*
  cookieString =
    name + "=" + value + "; expires=Fri, 31 Dec 9999 23:59:59 GMT;";

  console.log(cookieString);
  document.cookie = cookieString;
  console.log(document.cookie);

  */
}

function clearLocalStorage(name) {
  localStorage.removeItem(name);
  alert("removed " + name);
}

// Function to get the value of a cookie with the specified name
function getLocalStorage(name) {
  const myItem = localStorage.getItem(name);

  if (myItem !== null) {
    // Do something with myItem
    return myItem;
  } else {
    // Handle the case where myItem doesn't exist
    alert(name + " not found!");
    return null;
  }
}

function fixBadDataOnMaxChange(data, maxChange) {
  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }

  // Calculate the average of all values
  const average = data.reduce((sum, value) => sum + value, 0) / data.length;

  // Process the array
  // Changed so we always assume the first data point is good, we're not doing the average anymore.
  // This average functionality seemed to be breaking things
  for (let i = 1; i < data.length; i++) {
    // This first clause will never fire since I changed the index.
    if (i === 0) {
      // For the first value, use the average of all values
      data[i] = average;
    } else {
      // For subsequent values, check the change from the previous value
      const change = Math.abs(data[i] - data[i - 1]);
      if (change > maxChange) {
        // If the change is greater than maxChange, set the value to the previous value
        data[i] = data[i - 1];
      }
    }
  }

  return data;
}

function fixZeroAndNull(data) {
  // If the data is zero or null return the previous value
  // Assumes the first value in the range is non-zero and non-null
  for (let i = 1; i < data.length; i++) {
    if (data[i] === 0 || data[i] === null) {
      data[i] = data[i - 1];
    }
  }
}

function divify(inputString) {
  // Replace all spaces with - and make everything lower case
  return inputString
    .replace(/\s+/g, "-")
    .replace(/[^A-Za-z0-9-]/g, "")
    .toLowerCase();
}

// Generic function to scape web stuff
function getAjaxDataWithCallback(url, callback, proxyAddress = "") {
  // Use jQuery to get the contents of the external page
  // var proxyAddress = "https://api.codetabs.com/v1/proxy?quest=";
  // var proxyAddress = "https://crossorigin.me/"
  var fullURL = proxyAddress + url;
  $.ajax({
    url: fullURL,
    dataType: "html",
    success: function (data) {
      callback(data);
    },
  });
}

// Adds an s if a count is greater than 1 so we can make a string plural
// Clearly doesn't handle more complex plurals, but is inteded for minute/hour/day/week/month/year so it all works
function addS(count) {
  if (count > 1) {
    return "s";
  }
  return "";
}

// Convert a fixed time reference to age since now
function adAge(adISODate) {
  // Convert ISO 8601 time string to Date object
  // console.log(adISODate);
  var date = new Date(adISODate);

  // console.group(date);
  // Calculate time difference in milliseconds
  var now = new Date();
  var diff = now.getTime() - date.getTime();

  // Convert milliseconds to minutes, hours, or days
  var minutes = Math.floor(diff / 1000 / 60);
  var hours = Math.floor(diff / 1000 / 60 / 60);
  var days = Math.floor(diff / 1000 / 60 / 60 / 24);

  // Output time difference
  if (days > 0) {
    return days + " day" + addS(days) + " ago";
  } else if (hours > 0) {
    return hours + " hour" + addS(hours) + " ago";
  } else {
    return minutes + " minute" + addS(minutes) + " ago";
  }
}

// From Stack Overflow
function truncateDescription(str, n, useWordBoundary) {
  if (str.length <= n) {
    return str;
  }
  const subString = str.slice(0, n - 1); // the original check
  return (
    (useWordBoundary
      ? subString.slice(0, subString.lastIndexOf(" "))
      : subString) + "&hellip;"
  );
}

function createKSLSearchObject(
  searchObject,
  searchParams,
  searchWords,
  searchCategories
) {
  for (wordIdx = 0; wordIdx < searchWords.length; wordIdx++) {
    searchParams.keyword = searchWords[wordIdx];
    searchParams.search = searchCategories[wordIdx];
    // Push each item as a new object
    searchObject.searchParams.push({ ...searchParams });
  }

  // Return a completely new object
  return { ...searchObject };
}

// Chat GPT code with some modifications
function createNestedList(object, parent) {
  var list = document.createElement("ul");
  parent.appendChild(list);

  for (var key in object) {
    var listItem = document.createElement("li");

    if (typeof object[key] === "object" && !Array.isArray(object[key])) {
      listItem.innerText = key;

      createNestedList(object[key], listItem);
    } else if (Array.isArray(object[key])) {
      listItem.innerText = key;
      var sublist = document.createElement("ul");
      listItem.appendChild(sublist);

      object[key].forEach(function (item) {
        if (typeof object[key] === "object") {
          var sublist = document.createElement("ul");
          parent.appendChild(sublist);
          createNestedList(item, listItem);
        } else {
          var subitem = document.createElement("li");
          subitem.innerText = item + "[" + key + "]";
          sublist.appendChild(subitem);
        }
      });
    } else {
      listItem.innerText = key + ": " + object[key];
    }

    list.appendChild(listItem);
  }
}

// createNestedList(myObject, document.getElementById("resultsList"));

function createArrayIdxString(arrayIdx) {
  var arrayString = "";

  for (idx in arrayIdx) {
    arrayString = arrayString + "[" + arrayIdx[idx] + "]";
  }
  return arrayString;
}
function createSingleLI(key, value, arrayIdx) {
  var myLI = document.createElement("li");
  var itemText = createArrayIdxString(arrayIdx) + key + ": " + value;
  console.log(itemText);
  myLI.text = itemText;

  return myLI;
}

function ULObjectItems(myObject, root, indexArray = []) {
  var myUL = document.createElement("ul");

  root.appendChild(myUL);

  for (const key in myObject) {
    var iteratedObject = myObject[key];

    // Print out what we're working with for the recusion
    console.log({
      currentKey: key,
      currentObject: iteratedObject,
      arrayLength: indexArray.length,
    });

    // Handle arrays
    if (Array.isArray(iteratedObject)) {
      /*
      for (idx in myObject) {
        console.log("Array Level " + idx);
        ULObjectItems(myObject[idx], indexArray.push(idx));
        */

      ULObjectItems(iteratedObject, indexArray.push(key));
    }
    // Handle Objects
    else if (typeof iteratedObject === "object") {
      console.log("Object");
      ULObjectItems(iteratedObject, indexArray);
      // Handle the simplest case
    } else {
      console.log("Single Element");
      var myLI = createSingleLI(key, iteratedObject, indexArray);
      myUL.append(myLI);
    }
  }
  myFragment.appendChild(myUL);

  return myFragment;
}

function fixImgPath(jqueryObject, baseURL) {
  // https://stackoverflow.com/questions/53580130/image-src-relative-path-to-absolute-path

  console.log($(jqueryObject).find("img"));

  myImages = $(jqueryObject).find("img");

  for (img of myImages) {
    oldURL = $(img).attr("src");
    console.log(baseURL + oldURL);
    $(img).attr("src", baseURL + oldURL);
  }

  /*
  $(jqueryObject)
    .find("img")
    .each(function (e) {
      var c = baseURL + $(this).attr("src");
      $(this).attr("src", c);
    });

    */
}

function replaceXYDataAnomaliesWithAdjacentAverage(data, numStdDev) {
  // Extract y values for calculations
  const yValues = data.map((point) => point.y);

  // Calculate mean and standard deviation of y values
  const mean = yValues.reduce((sum, value) => sum + value, 0) / yValues.length;
  const variance =
    yValues.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) /
    yValues.length;
  const stdDev = Math.sqrt(variance);

  // Define a threshold for anomalies
  const anomalyThreshold = numStdDev * stdDev;

  // Replace anomalies with the average of adjacent values
  const result = data.map((point, index) => {
    const y = point.y;

    if (Math.abs(y - mean) > anomalyThreshold) {
      // Anomaly detected, replace y with the average of adjacent y values
      const leftY =
        (data[index - 1] && data[index - 1].y) ||
        (data[index + 1] && data[index + 1].y);
      const rightY =
        (data[index + 1] && data[index + 1].y) ||
        (data[index - 1] && data[index - 1].y);

      // If the left or right Y values don't exist, then use the right/left respectively
      const newY = (leftY + rightY) / 2;

      // Return a new object with the original x and the corrected y
      return { x: point.x, y: newY };
    } else {
      // Not an anomaly, keep the original point
      return point;
    }
  });

  return result;
}

function replaceAnomaliesWithAdjacentAverage(data, numStdDev) {
  // Step 1: Calculate mean and standard deviation
  const mean = data.reduce((sum, value) => sum + value, 0) / data.length;
  const variance =
    data.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) /
    data.length;
  const stdDev = Math.sqrt(variance);

  // Step 2: Define a threshold for anomalies
  const anomalyThreshold = numStdDev * stdDev;

  // Step 3: Replace anomalies with the average of adjacent values
  const result = data.map((value, index) => {
    if (Math.abs(value - mean) > anomalyThreshold) {
      // Anomaly detected, replace with the average of adjacent values
      const leftValue = data[index - 1] || data[index + 1]; // Use right if no left adjacent value
      const rightValue = data[index + 1] || data[index - 1]; // Use left if no right adjacent value
      return (leftValue + rightValue) / 2;
    } else {
      // Not an anomaly, keep the original value
      return value;
    }
  });

  return result;
}

function rgbArrayToString(rgbArray) {
  return `rgb(${rgbArray[0]}, ${rgbArray[1]}, ${rgbArray[2]})`;
}

// Helper functions
function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b)
    .toString(16)
    .slice(1)
    .toUpperCase();
}

function hexToRgb(hex) {
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b];
}

function getRandomColor() {
  return Math.floor(Math.random() * 255); // 100–200
}

// Converts #RRGGBB + alpha (0–255) -> KML ABGR string
function colorToKmlHex(hex, alpha = 255) {
  const h = (hex || '#ffffff').replace('#', '');
  const r = h.substring(0, 2);
  const g = h.substring(2, 4);
  const b = h.substring(4, 6);
  const a = Math.max(0, Math.min(255, alpha)).toString(16).padStart(2, '0');
  // KML color order is AABBGGRR
  return a + b + g + r;
}

function calculateLatLonDistance(lat1, lon1, lat2, lon2) {
  // Radius of the Earth in kilometers and miles
  const R_km = 6371;
  const R_miles = 3958.8;

  // Convert latitude and longitude from degrees to radians
  const lat1Rad = toRadians(lat1);
  const lon1Rad = toRadians(lon1);
  const lat2Rad = toRadians(lat2);
  const lon2Rad = toRadians(lon2);

  // Differences in coordinates
  const dLat = lat2Rad - lat1Rad;
  const dLon = lon2Rad - lon1Rad;

  // Haversine formula
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1Rad) *
    Math.cos(lat2Rad) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Distance in kilometers and miles
  const distance_km = R_km * c;
  const distance_miles = R_miles * c;

  // Calculate the initial bearing (heading) from point 1 to point 2
  let y = Math.sin(dLon) * Math.cos(lat2Rad);
  let x =
    Math.cos(lat1Rad) * Math.sin(lat2Rad) -
    Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
  let initialBearingRad = Math.atan2(y, x);

  // Convert bearing from radians to degrees
  let initialBearingDeg = toDegrees(initialBearingRad);

  // Normalize the bearing to be within the range 0 to 360 degrees
  const bearing = (initialBearingDeg + 360) % 360;

  return {
    km: distance_km,
    miles: distance_miles,
    heading: bearing, // Heading from point 1 to point 2 in degrees
  };
}

function bearingToCompass(bearing_deg) {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

  const bearing_corrected = (bearing_deg + 360 / (directions.length * 2)) % 360;

  const index = Math.floor(bearing_corrected / 45) % 8;
  return directions[index];
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

function toDegrees(radians) {
  return radians * (180 / Math.PI);
}

function timeUTCToLocalString(timeIn) {
  // Create a Date object from the timestamp
  var dateObj = new Date(timeIn);

  // Figure out the time zone offset

  // Get the time zone offset in minutes (Mountain Standard Time)
  var mtOffset = 7 * 60; // Mountain Standard Time is UTC-7

  // Apply the offset to get the local time
  var localTime = new Date(dateObj.getTime() - mtOffset * 60000);

  // Get the formatted time
  var formattedTime = localTime.toISOString().slice(11, 16);

  return formattedTime;
}

// Positive number for more decimals
function roundDecimal(value, numDecimals) {
  const roundFactor = 10 ** numDecimals;
  return Math.round(value * roundFactor) / roundFactor;
}