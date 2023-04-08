const sortOptions = {
  dateNew: 0,
  dateOld: 1,
  priceLow: 2,
  priceHigh: 3,
};

function displayKSLItemsFromObject(
  searchObject,
  searchString = "",
  sortOption = sortOptions.dateNew,
  divOverride = false
) {
  console.log(searchObject);

  console.log("Search:" + searchString + " Length: " + searchString.length);
  // Since the search object array contains all the items, we need to clear the div first:
  var thisDivName = searchObject.divName;

  if (divOverride) {
    thisDivName = divOverride;
  }

  $("#" + thisDivName).empty();

  sortKSLItems(searchObject.items, sortOption);

  var itemIdx = 0;

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
        '<h3><a target="_blank" href="' +
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
        '<a target="_blank" href="' +
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

    if (
      searchString.length == 0 ||
      (searchString.length > 0 &&
        (description.toLowerCase().includes(searchString.toLowerCase()) ||
          title.toLowerCase().includes(searchString.toLowerCase())))
    ) {
      $("#" + thisDivName).append($ad);

      const itemsPerLine = 5;
      const numLinesPerSearch = 7;

      // Add a class to every third ad to clear the row
      if ((itemIdx + 1) % itemsPerLine === 0) {
        $ad.addClass("clear-row");
        // console.log("New Row");
      }

      if (itemIdx >= itemsPerLine * numLinesPerSearch - 1) {
        return false;
      }
      itemIdx++;
    }

    // console.groupEnd();
  }
}

// Deprecated function kept around for reference
function parseKSLDataFromDOM(data, divName) {
  // Convert the response data to a jQuery object
  var $html = $(data);

  // Find all of the classified ad elements on the page
  var $ads = $html.find(".listing-item");

  console.log("Display Data: " + divName);
  console.log("Starting the loop");

  // console.log($ads)

  // Loop through the ad elements and display them on the page
  $ads.each(function (index) {
    //console.log("In the loop")
    // Get the title, price, image, and description of the ad
    var title = $(this).find(".item-info-title").text();
    console.group(title);
    var url = $(this).find(".item-info-title a").attr("href");
    var price = $(this).find(".item-info-price").text();
    var imgSrc = $(this).find(".img-wrapper img").attr("src");
    var description = $(this).find(".item-description").text();
    var timeOnSite = $(this).find(".item-detail").text();
    // timeOnSite = $(this).("span.timeOnSite");
    var location = $(this).find(".item-address").text();

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
      '<h2><a href="https://classifieds.ksl.com/' +
        url +
        '">' +
        title +
        "</a></h2>"
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

    $ad.append("<p>" + description + "</p>");
    $ad.append("<p>" + price + "</p>");
    $ad.append("<p> Time:" + timeOnSite + "</p>");
    $ad.append("<p>" + location + "</p>");

    // Append the ad element to the page
    $(divName).append($ad);

    // Add a class to every third ad to clear the row
    if ((index + 1) % 6 === 0) {
      $ad.addClass("clear-row");
    }

    if (index >= 17) {
      return false;
    }
    console.groupEnd();
  });
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
  // var itemArray = values[0];

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
  sortKSLItems(uniqueArray);

  // *************************************
  // GPT Code for remove duplicates and sort by time
  // *************************************

  searchObject.items = [...uniqueArray];
  // displayKSLItemsFromObject(searchObject);
}

function sortKSLItems(sortArray, sortOption = sortOptions.dateNew) {
  // A generally terrible idea where I am going to use the LSB to
  // enumerate sort order
  // And then the remaining bits will be the sort option type...

  // Bitwise operator to get the LSB for the sort order
  var sortOrder = sortOption & 1;

  var sortUp = -1;
  var sortDown = 1;

  if (sortOrder == 1) {
    sortUp = 1;
    sortDown = -1;
  }

  console.log("Sort Option: " + sortOption);

  switch (+sortOption) {
    case sortOptions.priceHigh:
    case sortOptions.priceLow:
      console.log("Sort By Price");
      sortArray.sort((a, b) => {
        if (a.price > b.price) {
          return sortDown;
        }
        if (a.price < b.price) {
          return sortUp;
        }
        return 0;
      });
      break;

    case sortOptions.dateNew:
    case sortOptions.dateOld:
      console.log("Actually Sort By Date, not default");
    default:
      console.log("Sort By Date");
      sortArray.sort((a, b) => {
        if (a.displayTime > b.displayTime) {
          return sortUp;
        }
        if (a.displayTime < b.displayTime) {
          return sortDown;
        }
        return 0;
      });
      break;
  }
}

function renderSelectedAdContents(
  selectMenu,
  sortMenu,
  searchObjectArray,
  headingDiv,
  containerName,
  searchString
) {
  var selectedOption = selectMenu.options[selectMenu.selectedIndex].value;
  console.log("Selected option: " + selectedOption);
  var selectedSearchObject = searchObjectArray[selectedOption];
  generateHeadingsForDiv(selectedSearchObject, headingDiv);

  var sortOption = sortMenu.options[sortMenu.selectedIndex].value;
  displayKSLItemsFromObject(
    selectedSearchObject,
    searchString,
    sortOption,
    containerName
  );
}

function generateHeadingsForDiv(thisSearchObject, divObject) {
  var newHeading = document.createElement("h1");
  // newHeading.setAttribute("id", containerName + "-hdr");
  divObject.innerHTML = "";
  newHeading.innerHTML = thisSearchObject.title;

  divObject.append(newHeading);

  for (idx = 0; idx < thisSearchObject.searchParams.length; idx++) {
    var localURL = buildKSLSearchURL(thisSearchObject.searchParams[idx]);
    newHeading = document.createElement("h3");
    newHeading.setAttribute("class", "search-heading");
    //newHeading.setAttribute("display", "inline block");
    var link = document.createElement("a");

    link.textContent =
      "Search for " + thisSearchObject.searchParams[idx].keyword;
    link.setAttribute("href", localURL);
    link.setAttribute("target", "_blank");
    newHeading.append(link);
    // document.body.appendChild(newHeading);
    divObject.append(newHeading);
  }
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
  url += "/private";
  // url = url + "/expandSearch/1/";
  return url;
}

// Using some of the existing arrays create drop downs and stuff
function buildPageLayoutAndMenus(searchObjectArray) {
  var menuDiv = document.createElement("div");
  var selectMenu = document.createElement("select");
  selectMenu.setAttribute("id", "item-menu");
  var containerName = "menu-div";
  menuDiv.setAttribute("id", containerName);

  document.body.append(menuDiv);
  var option = document.createElement("option");

  option.text = "-- Select a Search --";
  option.value = -1;
  selectMenu.add(option);

  for (const key in searchObjectArray) {
    var thisSearchObject = searchObjectArray[key];

    console.log(" Search Object Index: " + key);
    console.log(thisSearchObject);

    option = document.createElement("option");
    option.text = thisSearchObject.title;
    option.value = key;
    selectMenu.add(option);
  }

  menuDiv.append(selectMenu);
  selectMenu.addEventListener("change", function () {
    renderSelectedAdContents(
      selectMenu,
      sortMenu,
      searchObjectArray,
      headingDiv,
      containerName,
      document.getElementById("search-input").value
    );
    /*
    var selectedOption = selectMenu.options[selectMenu.selectedIndex].value;
    console.log("Selected option: " + selectedOption);
    var selectedSearchObject = searchObjectArray[selectedOption];
    generateHeadingsForDiv(selectedSearchObject, headingDiv);
    displayKSLItemsFromObject(selectedSearchObject, containerName);

    // $("#" + thisDivName).append($ad);
    */
  });

  var sortMenu = document.createElement("select");
  sortMenu.setAttribute("id", "sort-menu");

  for (const key in sortOptions) {
    option = document.createElement("option");
    option.text = camelToTitleCase(key);
    option.value = sortOptions[key];
    sortMenu.add(option);
  }

  menuDiv.append(sortMenu);

  sortMenu.addEventListener("change", function () {
    renderSelectedAdContents(
      selectMenu,
      sortMenu,
      searchObjectArray,
      headingDiv,
      containerName,
      document.getElementById("search-input").value
    );

    // $("#" + thisDivName).append($ad);
  });

  var searchText = document.createElement("input");
  searchText.setAttribute("type", "text");

  searchText.setAttribute("id", "search-input");
  menuDiv.append(searchText);

  const updateSearchButton = document.createElement("button");
  updateSearchButton.textContent = "Update Filter";
  // Insert the button into the div
  menuDiv.appendChild(updateSearchButton);

  updateSearchButton.onclick = function () {
    renderSelectedAdContents(
      selectMenu,
      sortMenu,
      searchObjectArray,
      headingDiv,
      containerName,
      document.getElementById("search-input").value
    );
  };

  // Create a single div that we can select different searches
  var headingDiv = document.createElement("div");
  var containerName = "heading-div";
  headingDiv.setAttribute("id", containerName);
  // headingDiv.setAttribute("class", "classifieds-container");
  document.body.append(headingDiv);

  var newDiv = document.createElement("div");
  containerName = "items-div";
  newDiv.setAttribute("id", containerName);
  newDiv.setAttribute("class", "classifieds-container");
  document.body.append(newDiv);
}

function getKSLItemsFromRenderSearchSection() {
  // Get the browser width in pixels
  var browserWidth = window.innerWidth;

  // Print the browser width to the console
  console.log("Browser width: " + browserWidth + " pixels");

  // Load the list of items from local storage
  const searchObjectArrayCookie = getLocalStorage("searchObjectArray");
  searchObjectArray = JSON.parse(searchObjectArrayCookie);
  console.log("Ate a Cookie - But really local storage");

  // Build out the search menus in our upper div
  buildPageLayoutAndMenus(searchObjectArray);

  // Prototype of the search object
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
  */

  console.log("Length: " + searchObjectArray.length);

  // Create an array of callback functions
  for (searchIdx = 0; searchIdx < searchObjectArray.length; searchIdx++) {
    (function (searchIdxLocal) {
      var thisSearchObject = searchObjectArray[searchIdxLocal];

      console.log(" Search Object Index: " + searchIdxLocal);
      console.log(thisSearchObject);

      for (idx = 0; idx < thisSearchObject.searchParams.length; idx++) {
        var localURL = buildKSLSearchURL(thisSearchObject.searchParams[idx]);

        const searchFunctionName = "renderSearchSection";

        const proxyAddress = "https://api.codetabs.com/v1/proxy?quest=";

        getAjaxDataWithCallback(
          localURL,
          function (data) {
            console.log("Got a response for " + localURL);
            handleKSLVariableData(data, searchFunctionName, thisSearchObject);
          },
          proxyAddress
        );
      }

      console.log("Created Div");
      console.log("Done With Search Params");
    })(searchIdx);
  }
}
