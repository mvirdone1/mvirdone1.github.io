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

function addS(count) {
  if (count > 1) {
    return "s";
  }
  return "";
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
    //console.group(title);
    var url = "https://classifieds.ksl.com/listing/" + item.id;
    var price = item.price;
    var imgSrc = item.photo;

    var description = item.description;
    var timeOnSite = item.displayTime;
    // timeOnSite = $(this).("span.timeOnSite");
    var location = item.city + ", " + item.state;

    // var description = $(".item-description").find("span").text();

    //console.log(imgSrc);

    // Create a new element to display the ad
    var $ad = $('<div class="classified-ad"></div>');
    $ad.append(
      '<div class="heading-div">' +
        '<h3><a href="' +
        url +
        '">' +
        title +
        "</a></h3>" +
        "</div>"
    );
    /*$ad.append(
                              '<img class="ad-image" height="100px" src="' + imgSrc + '">'
                            );*/

    $ad.append(
      '<div class="image-parent">' +
        '<a href="' +
        url +
        '"><img class="ad-image" src="' +
        imgSrc +
        '"></a></div>'
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
        "): </br> " +
        location +
        "</p>"
    );
    $ad.append("<p>" + truncateDescription(description, 250, true) + "</p>");

    // $ad.append("<p> Time:" + timeOnSite + "</p>");
    // $ad.append("<p>" + location + "</p>");

    // Append the ad element to the page
    //console.log("Append " + searchObject.divName + " " + title);
    $("#" + searchObject.divName).append($ad);

    const itemsPerLine = 5;
    const numLinesPerSearch = 5;

    // Add a class to every third ad to clear the row
    if ((idx + 1) % itemsPerLine === 0) {
      $ad.addClass("clear-row");
      console.log("New Row");
    }

    if (idx >= itemsPerLine * numLinesPerSearch - 1) {
      return false;
    }
    // console.groupEnd();
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
  console.log(searchObject);
  values = parseArgumentsFromFunction(data, functionName);
  var itemArray = values[0];

  // *************************************
  // GPT Code for remove duplicates and sort by time
  // *************************************

  // Combine the two arrays
  const combinedArray = [...searchObject.items, ...values[0]];

  console.log(combinedArray.length);

  // Remove duplicates based on the "id" property
  var uniqueArray = Array.from(
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

  searchObject.items = [...uniqueArray];
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
  // url = url + "/expandSearch/1/";
  return url;
}

function createSearchObject(
  searchObject,
  searchParams,
  searchWords,
  baseSearchString
) {
  searchCategories = Array(searchWords.length).fill(baseSearchString);

  for (wordIdx = 0; wordIdx < searchWords.length; wordIdx++) {
    searchParams.keyword = searchWords[wordIdx];
    searchParams.search = searchCategories[wordIdx];
    // Push each item as a new object
    searchObject.searchParams.push({ ...searchParams });
  }

  // Return a completely new object
  return { ...searchObject };
}

function getKSLItemsFromRenderSearchSection() {
  // Get the browser width in pixels
  var browserWidth = window.innerWidth;

  // Print the browser width to the console
  console.log("Browser width: " + browserWidth + " pixels");

  var searchObjectArray = [];
  var searchObject = {};

  searchObject.title = "Resort Skis for Mike";
  searchObject.divName = "mike-skis";
  searchObject.searchParams = [];
  searchObject.items = [];

  var searchParams = {
    search: "Winter-Sports/Downhill-Skis",
    keyword: "qst",
    zip: "84341",
    miles: "100",
    priceFrom: "10",
    priceTo: "550",
    Private: "Sale",
    perPage: "24",
    expandSearch: "1",
  };

  console.log("Test 123");
  // Create an array of search items to combine under the same umbrella
  var searchWords = [];
  searchWords.push("qst");
  searchWords.push("bent");
  searchWords.push("chetler");
  searchWords.push("bacon");

  searchObjectArray.push(
    createSearchObject(
      searchObject,
      searchParams,
      searchWords,
      "Winter-Sports/Downhill-Skis"
    )
  );

  /*
  searchCategories = Array(searchWords.length).fill(
    "Winter-Sports/Downhill-Skis"
  );

  for (wordIdx = 0; wordIdx < searchWords.length; wordIdx++) {
    searchParams.keyword = searchWords[wordIdx];
    searchParams.search = searchCategories[wordIdx];
    searchObject.searchParams.push({ ...searchParams });
  }
  */

  // Create an array of search items to combine under the same umbrella
  var searchObject2 = {};

  console.log("Test 123");

  searchObject.title = "Boots for Mike";
  searchObject.divName = "mike-boots";
  searchObject.searchParams = [];
  searchObject.items = [];

  searchWords = [];
  searchWords.push("29");
  searchWords.push("29.0");
  searchWords.push("29.5");

  searchObjectArray.push(
    createSearchObject(searchObject, searchParams, searchWords, "Winter-Sports")
  );

  searchObject.title = "Backcountry Gear";
  searchObject.divName = "mike-bc";
  searchObject.searchParams = [];
  searchObject.items = [];

  searchWords = [];
  searchWords.push("dynafit");
  searchWords.push("helio");
  searchWords.push("backland");
  searchWords.push("voile");

  searchObjectArray.push(
    createSearchObject(searchObject, searchParams, searchWords, "Winter-Sports")
  );

  searchObject.title = "SRAM Drivetrain";
  searchObject.divName = "bike-drivetrain";
  searchObject.searchParams = [];
  searchObject.items = [];

  searchParams.priceTo = "200";

  searchWords = [];
  searchWords.push("sx");
  searchWords.push("nx");
  searchWords.push("gx");
  searchWords.push("x01");

  searchObjectArray.push(
    createSearchObject(
      searchObject,
      searchParams,
      searchWords,
      "Cycling/Mountain-Bike-Parts"
    )
  );

  //searchParams.keyword = "bent";
  //searchObject.searchParams.push({ ...searchParams });

  /*
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
  */

  console.log("Test 123");
  console.log("Length: " + searchObjectArray.length);

  for (searchIdx = 0; searchIdx < searchObjectArray.length; searchIdx++) {
    (function (searchIdxLocal) {
      var thisSearchObject = searchObjectArray[searchIdxLocal];

      console.log(" Search Object Index: " + searchIdxLocal);
      console.log(thisSearchObject);

      // Create a div and heading
      var newHeading = document.createElement("h1");
      newHeading.innerHTML = thisSearchObject.title;
      document.body.appendChild(newHeading);

      for (idx = 0; idx < thisSearchObject.searchParams.length; idx++) {
        var localURL = buildKSLSearchURL(thisSearchObject.searchParams[idx]);
        newHeading = document.createElement("h3");
        var link = document.createElement("a");

        link.textContent =
          "Search for " + thisSearchObject.searchParams[idx].keyword;
        link.setAttribute("href", localURL);
        newHeading.append(link);
        document.body.appendChild(newHeading);
        const searchFunctionName = "renderSearchSection";

        getKSLVarData(localURL, function (data) {
          console.log("Got a response for " + localURL);
          handleKSLVariableData(data, searchFunctionName, thisSearchObject);
        });
      }

      var newDiv = document.createElement("div");
      var containerName = thisSearchObject.divName;
      newDiv.setAttribute("id", containerName);
      newDiv.setAttribute("class", "classifieds-container");

      document.body.appendChild(newDiv);

      console.log("Created Div");
      console.log("Done With Search Params");
    })(searchIdx);
  }
}
