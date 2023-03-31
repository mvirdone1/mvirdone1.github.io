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
