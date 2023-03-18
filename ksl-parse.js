function getKSLVarData(url, callback) {
  // Use jQuery to get the contents of the external page

  var proxyAddress = "https://api.codetabs.com/v1/proxy?quest=";
  // var proxyAddress = "https://crossorigin.me/"
  var fullURL = proxyAddress + url;
  $.ajax({
    url: fullURL,
    success: function (data) {
      callback(data);
    },
  });
}

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
    return days + " days ago";
  } else if (hours > 0) {
    return hours + " hours ago";
  } else {
    return minutes + " minutes ago";
  }
}

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

function displayKSLItemsFromObject(searchObject) {
  // Example Item
  /*

  {
    "id": 71053851,
    "memberId": 2409406,
    "status": "Active",
    "displayTime": "2023-03-18T03:16:23Z",
    "photo": "https://img.ksl.com/mx/mplace-classifieds.ksl.com/2409406-1677780011-719029.jpg",
    "category": "Winter Sports",
    "city": "Salt Lake City",
    "contactMethod": [
        "messages"
    ],
    "description": "Price is reflecting the value of the bindings as the skis may be out of life... \n\nThe skis are are well used. Bases are are actually in good shape (no core shots) but the top is delaminating in a few spots. The toes have been mounted 2 times and the heals have been mounted 3 times. Heals are mounted to an adjustment plate.\n\nThe bindings have plenty of life left. They are Dynafit TLT Superlite 2.0 12. I also have a spare heal piece and will include leashes. \n\nPrice is OBO.",
    "marketType": "Sale",
    "name": "Bryce Mihalevich",
    "newUsed": "UsedGood",
    "price": 250,
    "sellerType": "Private",
    "state": "UT",
    "subCategory": "Backcountry Equipment",
    "title": "Dynafit bindings and BD Helios",
    "zip": "84103",
    "reducedPriceData": {
        "previousPrice": 350,
        "lowestPrice": 250,
        "startDate": 1679109367
    },
    "pageviews": 267,
    "favorited": 9,
    "priceDropAllowed": true,
    "contentType": "free",
    "activeDealer": false,
    "listingType": "normal",
    "source": "classifiedListing",
    "email": 0
 
        }
   */
  console.log(searchObject);

  // Since the search object array contains all the items, we need to clear the div first:
  $("#" + searchObject.divName).empty();

  for (var idx = 0; idx < searchObject.items.length; idx++) {
    var item = searchObject.items[idx];
    //console.log("In the loop")
    // Get the title, price, image, and description of the ad
    var title = item.title;
    console.group(title);
    var url = "https://classifieds.ksl.com/" + item.id;
    var price = item.price;
    var imgSrc = item.photo;

    var description = item.description;
    var timeOnSite = item.displayTime;
    // timeOnSite = $(this).("span.timeOnSite");
    var location = item.city + ", " + item.state;

    $(this)
      .find("*")
      .each(function () {
        console.log(this);
      });

    // var description = $(".item-description").find("span").text();

    //console.log(imgSrc);

    // Create a new element to display the ad
    var $ad = $('<div class="classified-ad"></div>');
    $ad.append(
      '<h3><a href="https://classifieds.ksl.com/' +
        url +
        '">' +
        title +
        "</a></h3>"
    );
    /*$ad.append(
                              '<img class="ad-image" height="100px" src="' + imgSrc + '">'
                            );*/

    $ad.append(
      '<a href="https://classifieds.ksl.com/' +
        url +
        '"><img height="175px" src="' +
        imgSrc +
        '"></a>'
    );
    /*
                            $ad.append('<p class="ad-description">' + description + "</p>");
                            $ad.append('<p class="ad-price">' + price + "</p>");
                  */

    $ad.append(
      "<p> <b> $" +
        price +
        "</b>" +
        " (" +
        adAge(timeOnSite) +
        "): " +
        location +
        ") </p>"
    );
    $ad.append("<p>" + truncateDescription(description, 250, true) + "</p>");

    // $ad.append("<p> Time:" + timeOnSite + "</p>");
    // $ad.append("<p>" + location + "</p>");

    // Append the ad element to the page
    console.log("Append " + searchObject.divName + " " + title);
    $("#" + searchObject.divName).append($ad);

    // Add a class to every third ad to clear the row
    if ((idx + 1) % 5 === 0) {
      $ad.addClass("clear-row");
      console.log("New Row");
    }

    if (idx >= 19) {
      return false;
    }
    console.groupEnd();
  }
}

function parseArgumentsFromFunction(data, functionName) {
  var scriptContent = $(data)
    .find('script:contains("' + functionName + '(")')
    .html();

  // console.log(scriptContent);

  // Extract the argument passed to the function using a regular expression
  var regex = new RegExp(functionName + "\\((.*?)\\);");
  var match = regex.exec(scriptContent);
  // console.log(match[1]);
  var arg = match[1];

  // Use eval() to evaluate the argument as JavaScript code
  var myVar;
  eval("myVar = " + arg);

  // Access the variable values using Object.values()
  var values = Object.values(myVar);

  // console.log(values); // Output: ["value", "otherValue"]
  return values;
}

function handleKSLVariableData(data, functionName, searchObject) {
  values = parseArgumentsFromFunction(data, functionName);
  var itemArray = values[0];

  // *************************************
  // GPT Code for remove duplicates and sort by time
  // *************************************

  // Combine the two arrays
  const combinedArray = [...searchObject.items, ...values[0]];

  console.log(combinedArray.length);

  // Remove duplicates based on the "id" property
  const uniqueArray = Array.from(
    new Set(combinedArray.map((item) => item.id))
  ).map((id) => {
    return combinedArray.find((item) => item.id === id);
  });

  // Sort the resulting array by the "displayTime" property
  uniqueArray.sort((a, b) => {
    if (a.displayTime > b.displayTime) {
      return -1;
    }
    if (a.displayTime < b.displayTime) {
      return 1;
    }
    return 0;
  });

  // *************************************
  // GPT Code for remove duplicates and sort by time
  // *************************************

  searchObject.items = uniqueArray;
  displayKSLItemsFromObject(searchObject);
}

function buildKSLSearchURL(searchParams) {
  //    https://classifieds.ksl.com/search/Winter-Sports/Downhill-Skis/
  // keyword/qst/expandSearch/1/
  // zip/84341/miles/150/priceFrom/10/priceTo/550/Private/Sale/perPage/96",

  /*
  searchParams = {
    search: "Winter-Sports/Downhill-Skis",
    keyword: "qst",
    zip: "84341",
    miles: "150",
    priceFrom: "10",
    priceTo: "550",
    Private: "Sale",
    perPage: "24",
  }
  */

  var url = "https://classifieds.ksl.com";

  for (const key in searchParams) {
    url = url + "/" + key + "/" + searchParams[key];
  }
  return url;
}

function getKSLItemsFromRenderSearchSection(url) {
  var searchObject = {};
  searchObject.title = "Skis for Mike";
  searchObject.divName = "mike-skis";
  searchObject.searchParams = [];
  searchObject.items = [];

  var searchParams = {
    search: "Winter-Sports/Downhill-Skis",
    keyword: "qst",
    zip: "84341",
    miles: "150",
    priceFrom: "10",
    priceTo: "550",
    Private: "Sale",
    perPage: "24",
  };

  searchObject.searchParams.push(searchParams);

  var searchParams2 = {
    search: "Winter-Sports/Downhill-Skis",
    keyword: "bent",
    zip: "84341",
    miles: "150",
    priceFrom: "10",
    priceTo: "550",
    Private: "Sale",
    perPage: "24",
  };
  searchObject.searchParams.push(searchParams2);

  // Create a div and heading
  var newHeading = document.createElement("h1");
  newHeading.innerHTML = searchObject.title;
  document.body.appendChild(newHeading);

  var newDiv = document.createElement("div");
  var containerName = searchObject.divName;
  newDiv.setAttribute("id", containerName);
  newDiv.setAttribute("class", "classifieds-container");

  document.body.appendChild(newDiv);

  for (idx = 0; idx < searchObject.searchParams.length; idx++) {
    var localURL = buildKSLSearchURL(searchObject.searchParams[idx]);
    const searchFunctionName = "renderSearchSection";

    getKSLVarData(localURL, function (data) {
      console.log("Got a response for " + localURL);
      handleKSLVariableData(data, searchFunctionName, searchObject);
    });
  }
}
