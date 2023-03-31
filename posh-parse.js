function getPoshmarkItems() {
  const localURL =
    "https://poshmark.com/search?query=800&sort_by=price_asc&department=Men&category=Jackets_%26_Coats&brand%5B%5D=Arc%27teryx&brand%5B%5D=Black%20Diamond&brand%5B%5D=Eastern%20Mountain%20Sports&brand%5B%5D=Eddie%20Bauer&brand%5B%5D=L.L.%20Bean&brand%5B%5D=Mammut&brand%5B%5D=Marmot&brand%5B%5D=Outdoor%20Research&brand%5B%5D=Patagonia&brand%5B%5D=REI&brand%5B%5D=The%20North%20Face&brand%5B%5D=Mountain%20Hardwear&size%5B%5D=L&size%5B%5D=M";

  const proxyAddress = "https://api.codetabs.com/v1/proxy?quest=";

  getAjaxDataWithCallback(
    localURL,
    function (data) {
      console.log("Got a response for " + localURL);
      handlePoshmarkSearch(data);
    },
    proxyAddress
  );
}

function handlePoshmarkSearch(data) {
  var vmidValue = "ldjson-schema-carousel"; // the value of the desired data-vmid attribute

  console.log($(data));

  var $html = $(data);

  // Find all of the classified ad elements on the page
  var $ads = $html.find(".card--small");

  // This gets all the ads, but then they aren't what's actually on the page
  $ads.each(function (index) {
    var title = $(this).find(".title__condition__container").text();
    console.log(title);
  });

  // var scriptContent = $(data).find('[data-vmid="' + vmidValue + '"]');
  // .html();
  // .html();
  /*
    .find('script:contains("' + vmidValue + '")')
    .html();
*/

  // Example JavaScript code to read JSON data embedded in a <script> tag
  /*
  var jsonData = JSON.parse(
    $(data).querySelector('script[data-vmid="' + vmidValue + '"]').innerHTML
  );
  console.log(jsonData);

  var scriptContent = $(data).find("ItemList").html();
  console.log(scriptContent);

  var jsonData = JSON.parse(scriptContent);
  console.log(jsonData);

  */
  /*
  var scriptContent = $(data)
    .find('[data-vmid="' + vmidValue + '"]')
    .html();

  // Example JavaScript code to read JSON data embedded in a <script> tag
  var htmlObject = new DOMParser().parseFromString(data, "text/html").body
    .firstChild;

  var jsonData = JSON.parse(scriptContent);
*/
  // console.log(jsonData);
}
