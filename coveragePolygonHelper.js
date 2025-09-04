function polygonMenu(polygons, markers, parentElement) {

    const polygonListDiv = document.createElement("div");
    polygonListDiv.id = "polygon-list-div";
    parentElement.appendChild(polygonListDiv);

    listPolygons(polygons, polygonListDiv);

    const polygonAddMenuDiv = document.createElement("div");
    polygonAddMenuDiv.id = "polygon-add-menu-div";
    parentElement.appendChild(polygonAddMenuDiv);

    showAddPolygonMenu(markers, polygonAddMenuDiv);

    const polygonWorkshopDiv = document.createElement("div");
    polygonWorkshopDiv.id = "polygon-workshop-div";
    parentElement.appendChild(polygonWorkshopDiv);



}


function listPolygons(polygons, parentElement) {    // Create the <ul>

    if (polygons.length == 0) { return false; }

    parentElement.innerHTML = "";

    const myList = document.createElement("ul");
    polygons.array.forEach((polygon, index) => {
        // Example dat
        const myListItem = document.createElement("li");
        const button = document.createElement("button");
        myListItem.innerHTML = polygon.title;

        button.textContent = "Delete";
        button.addEventListener("click", () => {
            removePolygon(polygons, index);
        });

        myListItem.appendChild(button);
        myList.appendChild(myListItem);

    });

    // Add the <ul> to the page
    parentElement.appendChild(myList);
}

function showAddPolygonMenu(markers, parentElement) {
    console.log("Showing the menu");


    // Dropdown options
    const polygonMenuTypeOptions = [
        { value: "intersect", text: "New Intersect" },
        { value: "union-auto", text: "New Union Automatic" },
        { value: "union-manual", text: "New Union Manual" }
    ];


    const polygonTypeDropdown = buildDropdown(polygonMenuTypeOptions)

    // Create the "Add" button
    const addButton = document.createElement("button");
    addButton.textContent = "Add";

    // Add a click handler
    addButton.addEventListener("click", () => {
        const selected = polygonTypeDropdown.value;

        switch (selected) {
            case "intersect":
                showIntersectMenu();
                break;

            case "union-auto":
                showUnionAutoMenu(markers);
                break;

            case "union-manual":
                showUnionManualMenu();
                break;

            default:
                console.log("Unknown selection");
        }

    });

    // Put the dropdown and button in the container
    parentElement.appendChild(polygonTypeDropdown);
    parentElement.appendChild(addButton);




}

function showUnionAutoMenu(markers) {

    unionPolygons = {};

    markers.forEach((marker) => {
        marker.coverageMetadata.radius.forEach((currentSegment) => {
            if (currentSegment.label in unionPolygons) {
                unionPolygons[currentSegment.label].push(marker.title);
            } else {
                unionPolygons[currentSegment.label] = []
                unionPolygons[currentSegment.label].push(marker.title);
            }
        });
    });

    // Prepare the union list 

    const menuOptions = Object.keys(unionPolygons).map(key => {
        return {
            value: key,
            text: `${key} (${unionPolygons[key].length} segments; markers: ${unionPolygons[key].join(", ")})`
        };
    });



    const menuDiv = document.getElementById("polygon-workshop-div");

    menuDiv.innerHTML = "<p>Which segment name do you want to generate</p>"

    const polygonToGenerateMenu = buildDropdown(menuOptions, "poly-segments-select");

    menuDiv.appendChild(polygonToGenerateMenu);

    menuDiv.appendChild(document.createElement("br"));
    const nameLabel = addFormLabel("Polygon Name: ");
    menuDiv.appendChild(nameLabel);
    menuDiv.appendChild(addShortTextInput("New Name", "poly-form-name"));


    menuDiv.appendChild(document.createElement("br"));
    const colorLabel = addFormLabel("Polygon Color: ")
    menuDiv.appendChild(colorLabel);
    menuDiv.appendChild(addColorPicker("#0000C0", "poly-form-color"))


    menuDiv.appendChild(document.createElement("br"));
    const transparencyLabel = addFormLabel("Polygon Transparency: ")
    const transparencyId = "poly-form-transparency";
    menuDiv.appendChild(transparencyLabel);
    menuDiv.appendChild(addPercentSliderBar(80, 0, 100, transparencyId));
    menuDiv.appendChild(addPercentSliderDisplay(transparencyId));
    updateSliderDisplay(transparencyId);

    // Create the "Add" button
    const generatePolygonButton = document.createElement("button");
    generatePolygonButton.textContent = "Generate Polygon";
    generatePolygonButton.addEventListener("click", () => {
        const selected = polygonToGenerateMenu.value;
        const newTurfPolygon = generateUnionPolygonBySegmentLabel(markers, selected);
        addNewSegmentPolygon(newTurfPolygon);
        updatePolygonMap();
    });


    menuDiv.appendChild(document.createElement("br"));
    menuDiv.appendChild(generatePolygonButton);




}

function addNewSegmentPolygon(newPolygon) {
    coverageGlobals.coveragePolygons.push(
        {
            title: document.getElementById("poly-form-name").value,
            color: document.getElementById("poly-form-color").value,
            transparency: document.getElementById("poly-form-transparency").value,
            polygon: newPolygon,
        }
    );

}

function updatePolygonMap(foo = "") {

    const googleMapUnionPolygon = turfToGooglePolygon(turfUnionPolygon);
    newPolygon.setOptions({
        strokeColor: "#0000FF"
    });

}


function generateUnionPolygonBySegmentLabel(markers, label) {
    // alert(label);

    const turfPolygonsForUnion = [];

    markers.forEach((marker) => {
        marker.coverageMetadata.radius.forEach((currentSegment) => {

            // Only add polygons if the label matches
            if (currentSegment.label == label) {
                turfPolygonsForUnion.push(
                    googlePolygonToTurf(
                        generateGoogleMapsWedgePolygon(marker, 0, currentSegment)
                    )
                );
            }

        })
    });

    const turfUnionPolygon = turfMultiUnion(turfPolygonsForUnion);
    // This is making stuff unhappy

    console.log(turfUnionPolygon);
    console.log(turf.area(turfUnionPolygon));
    return turfUnionPolygon;

    // googleMapUnionPolygon.setMap(myMapManager.map);



}




function removePolygon(polygons, index) {
    polygons.splice(index, 1); // Remove from the array
}