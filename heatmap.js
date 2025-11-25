// Using globals to the script rather than the window
let myMapManager;
let myModal;

function initMap() {
    // Initialize MapManager, modal, and modalmapmanager classes
    myMapManager = new MapManager('map', { lat: 41.9, lng: -111.5 }, 13);
    // myMapManager = mapManager; // Global variable

    myModal = new ModalManager();
    // myModal = modalManager; // Global variable






    myMapManager.setMapClickListener((latLng) => {
        console.log(myMapManager.getMapCorners());

        getNumPoints(myMapManager.getMapCorners());


    });


    document.getElementById("buildMap").addEventListener("click", () => {

        console.log(myMapManager.getMapCorners());
        getNumPoints(myMapManager.getMapCorners());


    });


    // Open modal when generating report
    document.getElementById("generateReportBtn").addEventListener("click", () => {
        const modalContentDiv = myModal.getContentDiv();
        modalContentDiv.innerHTML = ""; // Clear previous content
        modalContentDiv.innerHTML = "<h2>Scenario Analysis</h2>";
        modalContentDiv.innerHTML += generateMarkerReport();
        modalContentDiv.innerHTML += generateOverlapReport();
        myModal.showModal();

    });

    document.getElementById("coveragePolygonsBtn").addEventListener("click", () => {

        const modalContentDiv = myModal.getContentDiv();
        modalContentDiv.innerHTML = ""; // Clear previous content
        modalContentDiv.innerHTML = "<h2>Coverage Analysis</h2>";
        modalContentDiv.innerHTML += CoveragePolygonManager.generateCoverageReport(coverageGlobals.segmentCoveragePolygons);

        myModal.showModal();

    });
}


async function getNumPoints(mapBounds) {

    /*
    return {
      north: ne.lat(),
      east: ne.lng(),
      south: sw.lat(),
      west: sw.lng(),
      corners: {
        nw: { lat: ne.lat(), lng: sw.lng() },
        ne: { lat: ne.lat(), lng: ne.lng() },
        sw: { lat: sw.lat(), lng: sw.lng() },
        se: { lat: sw.lat(), lng: ne.lng() }
      }
    };

    */

    let north = mapBounds.north;
    let south = mapBounds.south;
    let east = mapBounds.east;
    let west = mapBounds.west;

    console.log("Checking server...");

    const sqlQuery = "SELECT p.lat, p.lon \
            FROM points p \
            JOIN bounds b ON p.activity_id = b.activity_id WHERE \
            (min_lat BETWEEN ? AND ? OR max_lat BETWEEN ? AND ?) AND \
            (min_lon BETWEEN ? AND ? OR max_lon BETWEEN ? AND ?)";

    const params = [south, north, south, north, west, east, west, east];

    const response = await fetch("http://127.0.0.1:3000/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({
            sql: sqlQuery,
            params: params,
        }),

        /*
        body: JSON.stringify({
            sql: "SELECT 1 AS test",
            params: [],
        }),
   

        body: JSON.stringify({
            sql: "SELECT lat, lon FROM points WHERE activity_id = ?",
            params: [4405103677],
        }),

        body: JSON.stringify({
            sql: "SELECT count(*) FROM points WHERE activity_id = ?",
            params: [4405103677],
        }),

            
        body: JSON.stringify({
            sql: "SELECT count(*) FROM points WHERE lat between ? and ? and lon between ? and ? ",
            params: [south, north, west, east],
        }),

                body: JSON.stringify({
            sql: "SELECT lat,lon FROM points WHERE lat between ? and ? and lon between ? and ? ",
            params: [south, north, west, east],
        }),


        */






        /*
        body: JSON.stringify({
            sql: "SELECT COUNT(*) FROM bounds WHERE (min_lat between ? and ? or max_lat between ? and ?) and (min_lon between ? and ? or max_lon between ? and ?)",
            params: [south, north, south, north, west, east, west, east],
            // params: [north, south, north, south, east, west, east, west],
        }),
        */

    });

    const data = await response.json();
    console.log("Server responded:", data);

    // return 0;

    const points = [];
    data.forEach((row) => {
        points.push(new google.maps.LatLng(row.lat, row.lon));
    });

    let heatmap;

    // heatmap.setMap(null);

    heatmap = new google.maps.visualization.HeatmapLayer({
        data: points,
        opacity: 1,
        maxIntensity: 25,
        dissapating: false,
        radius: 3, // adjust for smoothness
    });

    //        map: myMapManager.getMap(),

    heatmap.setMap(myMapManager.getMap());

}

