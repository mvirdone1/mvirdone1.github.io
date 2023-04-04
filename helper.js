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
function setCookie(name, value) {
  document.cookie = `${name}=${value}; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/`;
}

// Function to get the value of a cookie with the specified name
function getCookie(name) {
  const cookieString = decodeURIComponent(document.cookie);
  const cookieArray = cookieString.split(";");
  for (let i = 0; i < cookieArray.length; i++) {
    let cookie = cookieArray[i];
    while (cookie.charAt(0) === " ") {
      cookie = cookie.substring(1);
    }
    if (cookie.indexOf(name + "=") === 0) {
      return cookie.substring(name.length + 1, cookie.length);
    }
  }
  return null;
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
