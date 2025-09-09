class CoveragePolygonManager {
    constructor(coveragePolygonsList = []) {

        // This should be a reference back to the array of polygons
        this.coveragePolygons = coveragePolygonsList;
        this.menuParentElement = null;
        this.markers = null;



    }

    initPolygonManager(markers, parentElement) {
        this.markers = markers;
        this.menuParentElement = parentElement;
    }

    polygonMenu() {

        // Clear out the whole menu sidebar to start
        this.menuParentElement.innerHTML = "";
        console.log(this.coveragePolygons);

        // Build the overall layout
        const polygonListDiv = document.createElement("div");
        polygonListDiv.id = "polygon-list-div";
        this.menuParentElement.appendChild(polygonListDiv);


        const polygonAddMenuDiv = document.createElement("div");
        polygonAddMenuDiv.id = "polygon-add-menu-div";
        this.menuParentElement.appendChild(polygonAddMenuDiv);


        const polygonWorkshopDiv = document.createElement("div");
        polygonWorkshopDiv.id = "polygon-workshop-div";
        this.menuParentElement.appendChild(polygonWorkshopDiv);


        // Populate dynamic content
        this.listPolygons(this.coveragePolygons, polygonListDiv);
        this.showAddPolygonMenu(this.markers, polygonAddMenuDiv);




    }


    listPolygons(polygons, parentElement) {    // Create the <ul>
        parentElement.innerHTML = "";

        const myTitle = document.createElement("h4");
        myTitle.textContent = "Current Polygons:";
        parentElement.appendChild(myTitle);

        if (polygons.length == 0) { return false; }




        const myList = document.createElement("ul");
        polygons.forEach((polygon, index) => {
            // Example dat
            const myListItem = document.createElement("li");
            const button = document.createElement("button");
            button.style.marginLeft = "4px";

            myListItem.innerHTML = polygon.title;

            button.textContent = "Delete";
            button.addEventListener("click", () => {
                this.removePolygon(polygons, index);
            });

            myListItem.appendChild(button);
            myList.appendChild(myListItem);

            if (polygon.show) {
                // Do something with the google map
            }

        });

        // Add the <ul> to the page
        parentElement.appendChild(myList);
    }

    showAddPolygonMenu(markers, parentElement) {
        console.log("Showing the menu");


        // Dropdown options
        const polygonMenuTypeOptions = [
            { value: "union-auto", text: "Automatic Union of Same-Named Segments" },
            { value: "intersect", text: "Automatic Intersection of Named Segments" },
            { value: "union-manual", text: "Manual Union of Segements" }
        ];


        const polygonTypeDropdown = buildDropdown(polygonMenuTypeOptions);

        // Create the "Add" button
        const addButton = document.createElement("button");
        addButton.style.marginLeft = "4px";

        addButton.textContent = "Create Polygon";

        // Add a click handler
        addButton.addEventListener("click", () => {
            const selected = polygonTypeDropdown.value;

            switch (selected) {
                case "intersect":
                    this.showIntersectMenu();
                    break;

                case "union-auto":
                    this.showUnionAutoMenu(markers);
                    break;

                case "union-manual":
                    this.showUnionManualMenu();
                    break;

                default:
                    console.log("Unknown selection");
            }

        });


        const nameLabel = addFormLabel("Select New Polygon Type: ");
        parentElement.appendChild(nameLabel);

        // Put the dropdown and button in the container
        parentElement.appendChild(polygonTypeDropdown);
        // this.showUnionAutoMenu(markers);


        parentElement.appendChild(addButton);




    }



    showIntersectMenu() {
        // this.polygonMenu()
        menuDiv.innerHTML = "<h2> Intersect Menu Placeholder <h2>";

        return null;
    }

    showUnionManualMenu() {
        // this.polygonMenu()

        const menuDiv = document.getElementById("polygon-workshop-div");
        menuDiv.innerHTML = "<h2> Manual Menu Placeholder <h2>";
        return null;
    }

    showUnionAutoMenu(markers) {

        const unionPolygons = [];

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

        menuDiv.innerHTML = "<p>Select segment for new Polygon:</p>"

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
        generatePolygonButton.textContent = "Add New Polygon";
        generatePolygonButton.addEventListener("click", () => {
            const selected = polygonToGenerateMenu.value;
            const newTurfPolygon = this.generateUnionPolygonBySegmentLabel(markers, selected);
            this.addNewSegmentPolygon(newTurfPolygon);
            this.polygonMenu();
            // this.updatePolygonMap();
        });


        menuDiv.appendChild(document.createElement("br"));
        menuDiv.appendChild(generatePolygonButton);


    }

    addNewSegmentPolygon(newPolygon) {
        this.coveragePolygons.push(
            {
                title: document.getElementById("poly-form-name").value,
                color: document.getElementById("poly-form-color").value,
                transparency: document.getElementById("poly-form-transparency").value,
                polygon: newPolygon,
                show: true,
            }
        );

    }

    updatePolygonMap(foo = "") {

        const googleMapUnionPolygon = turfToGooglePolygon(turfUnionPolygon);
        newPolygon.setOptions({
            strokeColor: "#0000FF"
        });

    }


    generateUnionPolygonBySegmentLabel(markers, label) {
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


    removePolygon(polygons, index) {
        polygons.splice(index, 1); // Remove from the array
        this.polygonMenu();
    }
}