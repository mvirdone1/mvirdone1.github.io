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
  return inputString.replace(/\s+/g, "-").toLowerCase();
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
