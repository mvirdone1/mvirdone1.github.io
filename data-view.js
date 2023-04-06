function loadDataViewPage() {
  // loadKSLParams();
  createInitContent();
}

function createInitContent() {
  // Get a reference to the div
  const myDiv = document.getElementById("data-div");

  // Create a button element
  var myHeading = document.createElement("h3");
  myHeading.innerText = "Test out Loading Object";
  myDiv.appendChild(myHeading);
  const loadButton = document.createElement("button");
  loadButton.textContent = "Load Search Object Element";
  myDiv.appendChild(loadButton);

  myHeading = document.createElement("h3");
  myHeading.innerText = "Set From KSL Items From JS Const";
  myDiv.appendChild(myHeading);
  const initButton = document.createElement("button");
  initButton.textContent = "Set Items";
  // Insert the button into the div
  myDiv.appendChild(initButton);

  const preElement = document.createElement("pre");
  preElement.id = "variable-pre";
  preElement.innerHTML = "Variable Contents";
  myDiv.appendChild(preElement);

  // Add an onclick listener to the button
  initButton.onclick = function () {
    searchObjectArray = initKSLVariables();
    console.log("Init Variable");
    document.getElementById("variable-pre").innerHTML = JSON.stringify(
      searchObjectArray
    )
      .replace(/\[/g, "\n[")
      .replace(/\}\,/g, "},\n");

    setLocalStorage("searchObjectArray", JSON.stringify(searchObjectArray));

    /*
    // console.log(searchObjectArray);

    var myFragment = document.createDocumentFragment();

    var myUL = document.createElement("ul");
    myUL.id = "resultsList";
    document.body.appendChild(myUL);

    createNestedList(searchObjectArray, document.getElementById("resultsList"));

    /*
    var myList = ULObjectItems(searchObjectArray, myFragment);
    console.log(myList);
    document.body.appendChild(myFragment);
    

    */
  };

  // Add an onclick listener to the button
  loadButton.onclick = function () {
    var searchObjectArray = loadKSLParams();

    // setLocalStorage("SearchObjectArray", JSON.stringify(searchObjectArray));
  };
}

function loadKSLParams() {
  const searchObjectArrayCookie = getLocalStorage("searchObjectArray");
  console.log("Eating a Cookie");
  // console.log(searchObjectArrayCookie);
  searchObjectArray = JSON.parse(searchObjectArrayCookie);
  console.log("Read from File Variable");
  console.log(searchObjectArray);
}

function initKSLVariables() {
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
    miles: "150",
    priceFrom: "10",
    priceTo: "550",
    Private: "Sale",
    perPage: "24",
    expandSearch: "1",
  };

  // Create an array of search items to combine under the same umbrella
  var searchWords = [];
  searchWords.push("qst");
  searchWords.push("bent");
  searchWords.push("chetler");
  searchWords.push("bacon");

  var searchCategories = Array(searchWords.length).fill(
    "Winter-Sports/Downhill-Skis"
  );

  searchObjectArray.push(
    createKSLSearchObject(
      searchObject,
      searchParams,
      searchWords,
      searchCategories
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

  searchObject.title = "Boots for Mike";
  searchObject.divName = "mike-boots";
  searchObject.searchParams = [];
  searchObject.items = [];

  searchWords = [];
  searchWords.push("29");
  searchWords.push("29.0");
  searchWords.push("29.5");

  searchCategories = [];
  searchCategories = Array(searchWords.length).fill("Winter-Sports");

  searchObjectArray.push(
    createKSLSearchObject(
      searchObject,
      searchParams,
      searchWords,
      searchCategories
    )
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

  searchCategories = [];
  searchCategories = Array(searchWords.length).fill("Winter-Sports");

  searchObjectArray.push(
    createKSLSearchObject(
      searchObject,
      searchParams,
      searchWords,
      searchCategories
    )
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

  searchCategories = [];
  searchCategories = Array(searchWords.length).fill(
    "Cycling/Mountain-Bike-Parts"
  );

  searchObjectArray.push(
    createKSLSearchObject(
      searchObject,
      searchParams,
      searchWords,
      searchCategories
    )
  );

  searchObject.title = "Outdoor Stuff";
  searchObject.divName = "outdoor-stuff";
  searchObject.searchParams = [];
  searchObject.items = [];

  searchParams.priceTo = "300";

  searchWords = [];
  searchWords.push("mammut");
  searchWords.push("osprey");
  searchWords.push("patagonia black hole");
  searchWords.push("kamber");
  searchWords.push("kode");
  searchWords.push("Ascendant");
  searchWords.push("refuge air");
  searchWords.push("uberlayer");
  searchWords.push("dawn patrol");

  searchCategories = [];
  searchCategories = Array(searchWords.length).fill("");

  searchObjectArray.push(
    createKSLSearchObject(
      searchObject,
      searchParams,
      searchWords,
      searchCategories
    )
  );

  searchObject.title = "XC Bikes";
  searchObject.divName = "xc-bikes";
  searchObject.searchParams = [];
  searchObject.items = [];
  searchParams.priceFrom = "1500";
  searchParams.priceTo = "3000";

  searchWords = [];
  searchWords.push("epic");
  searchWords.push("superfly");
  searchWords.push("blur");
  searchWords.push("anthem");
  searchWords.push("scalpel");
  searchWords.push("sb100");
  searchWords.push("ripley");
  searchWords.push("spark");
  searchWords.push("nica");
  searchWords.push("spectral");

  searchCategories = [];
  searchCategories = Array(searchWords.length).fill("Cycling/Mountain-Bikes");

  searchObjectArray.push(
    createKSLSearchObject(
      searchObject,
      searchParams,
      searchWords,
      searchCategories
    )
  );

  searchObject.title = "Clothing";
  searchObject.divName = "clothes";
  searchObject.searchParams = [];
  searchObject.items = [];
  searchParams.priceFrom = "5";
  searchParams.priceTo = "150";

  searchWords = [];
  searchWords.push("patagonia");
  searchWords.push("black diamond");
  searchWords.push("outdoor research");
  searchWords.push("mammut");
  searchWords.push("marmot");
  searchWords.push("rab");
  searchWords.push("polartec alpha");

  searchCategories = [];
  searchCategories = Array(searchWords.length).fill(
    "Clothing-and-Apparel/Mens-Clothing"
  );

  searchObjectArray.push(
    createKSLSearchObject(
      searchObject,
      searchParams,
      searchWords,
      searchCategories
    )
  );

  searchObject.title = "Forks";
  searchObject.divName = "bike-forks";
  searchObject.searchParams = [];
  searchObject.items = [];

  searchParams.priceFrom = "50";
  searchParams.priceTo = "500";

  searchWords = [];
  searchWords.push("lyrik");
  searchWords.push("pike");
  searchWords.push("revelation");
  searchWords.push("yari");
  searchWords.push("sid");
  searchWords.push("reba");
  searchWords.push("charger");
  searchWords.push("fox 32");
  searchWords.push("fox 34");
  searchWords.push("fox 36");

  searchCategories = [];
  searchCategories = Array(searchWords.length).fill(
    "Cycling/Mountain-Bike-Parts"
  );

  searchObjectArray.push(
    createKSLSearchObject(
      searchObject,
      searchParams,
      searchWords,
      searchCategories
    )
  );

  return searchObjectArray;
}
