class CoveragePolygonManager {
    constructor(coveragePolygonsList, polygonChangeCallback) {

        // This should be a reference back to the array of polygons
        this.coveragePolygons = coveragePolygonsList;
        this.menuParentElement = null;
        this.markers = null;

        if (typeof polygonChangeCallback === "function") {
            this.polygonChangeCallback = polygonChangeCallback
        } else {
            console.error("No valid callback provided");
        }

    }

    initPolygonManager(markers, parentElement) {
        this.markers = markers;
        this.menuParentElement = parentElement;
    }

    polygonMenuOld() {

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
        this.listPolygons(polygonListDiv);
        // this.updateModalMapPolygons();
        this.showAddPolygonMenu(this.markers, polygonAddMenuDiv);

        this.polygonChangeCallback(this.coveragePolygons);

    }

    static polygonMenu(coveragePolygons, menuParentElement) {

        // Clear out the whole menu sidebar to start
        menuParentElement.innerHTML = "";
        console.log(coveragePolygons);

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
        this.listPolygons(polygonListDiv);
        // this.updateModalMapPolygons();
        this.showAddPolygonMenu(this.markers, polygonAddMenuDiv);

        this.polygonChangeCallback(coveragePolygons);

    }


    static buildPolygonList(markers, oldPolygons = []) {
        const newSegmentCoveragePolygons = [];

        // Step 1. Collect unique labels from markers
        markers.forEach((marker) => {
            marker.coverageMetadata.radius.forEach((currentSegment) => {
                if (!newSegmentCoveragePolygons.find(p => p.label === currentSegment.label)) {
                    newSegmentCoveragePolygons.push({
                        label: currentSegment.label,
                        unionCoveragePolygon: null,
                        intersectCoveragePolygon: null,
                    });
                }
            });
        });

        // Step 2. Rebuild each polygon, but preserve visibility from oldPolygons
        newSegmentCoveragePolygons.forEach((polygon) => {
            const oldPolygon = oldPolygons.find(p => p.label === polygon.label);

            this.makeNewCoveragePolygons(polygon, markers);

            if (oldPolygon) {
                polygon.unionCoveragePolygon.show = oldPolygon.unionCoveragePolygon?.show ?? false;
                polygon.intersectCoveragePolygon.show = oldPolygon.intersectCoveragePolygon?.show ?? false;
            }
        });

        return newSegmentCoveragePolygons;
    }


    static makeNewCoveragePolygons(polygon, markers) {

        let newColor = [getRandomColor(), getRandomColor(), getRandomColor()];

        markers.some(marker => {
            const parentRadiusExample = marker.coverageMetadata.radius.find(
                rad => rad.label === polygon.label
            );

            if (parentRadiusExample) {
                newColor = parentRadiusExample.color;
                return true; // stop iterating (like break)
            }

            return false; // keep going
        });




        const newCoveragePolygon =
        {
            title: null,
            color: boldRGBColor(...newColor),
            transparency: 0.4,
            polygon: null,
            sourceLabel: polygon.label,
            show: false,
            googleMapCoveragePolygonObjects: [],

        };

        newCoveragePolygon.title = polygon.label + " " + "Union";

        polygon.unionCoveragePolygon = this.buildPolygonFromLabels(
            markers,
            polygon.label,
            structuredClone(newCoveragePolygon),
            turfMultiUnion);

        newCoveragePolygon.title = polygon.label + " " + "Intersect";
        // Make the color different for intersect
        newCoveragePolygon.color = boldRGBColor(...newCoveragePolygon.color);


        polygon.intersectCoveragePolygon = this.buildPolygonFromLabels(
            markers,
            polygon.label,
            structuredClone(newCoveragePolygon),
            turfMultiSingleIntersect);
    }

    static updatePolygons(segmentCoveragePolygons, markers, updateLabel) {


        // Find an element in the polygons with the right label
        let foundLabelPolygon = segmentCoveragePolygons.find(polygon => polygon.label === updateLabel);

        // if we don't have the radius label anywhere in the polygons push a new one
        if (!foundLabelPolygon) {
            segmentCoveragePolygons.push(
                {
                    label: updateLabel,
                    unionCoveragePolygon: null,
                    intersectCoveragePolygon: null,
                }
            );

            // Get the instance guy we just created
            foundLabelPolygon = segmentCoveragePolygons[segmentCoveragePolygons.length - 1];
            this.makeNewCoveragePolygons(foundLabelPolygon, markers);
        }
        else {

            this.clearMapPolygonsForUpdate(foundLabelPolygon.unionCoveragePolygon);

            foundLabelPolygon.unionCoveragePolygon = this.buildPolygonFromLabels(
                markers,
                updateLabel,
                foundLabelPolygon.unionCoveragePolygon,
                turfMultiUnion);


            this.clearMapPolygonsForUpdate(foundLabelPolygon.intersectCoveragePolygon);

            foundLabelPolygon.intersectCoveragePolygon = this.buildPolygonFromLabels(
                markers,
                updateLabel,
                foundLabelPolygon.intersectCoveragePolygon,
                turfMultiSingleIntersect);
        }
    }


    static buildPolygonFromLabels(markers, label, newCoveragePolygon, turfCallback) {
        const polygonsForProcessing = CoveragePolygonManager.getTurfPolygonsFromMarkers(markers, label);


        const turfPolygon = turfCallback(polygonsForProcessing);
        newCoveragePolygon.polygon = turfPolygon;


        if (!turfPolygon) { return newCoveragePolygon }
        // console.log(newCoveragePolygon);


        newCoveragePolygon.googleMapCoveragePolygonObjects = turfToGooglePolygon(
            turfPolygon,
            {
                strokeColor: rgbToHex(...newCoveragePolygon.color),    // Line color
                strokeOpacity: 1 - ((Math.max(0, newCoveragePolygon.transparency - 0.2))),        // Line transparency (0.0–1.0)
                fillColor: rgbToHex(...newCoveragePolygon.color),      // Fill color
                fillOpacity: 1 - (newCoveragePolygon.transparency),
            });

        return newCoveragePolygon;
    }

    static clearAllMapPolygons(coveragePolygons) {
        coveragePolygons.forEach((coveragePolygon) => {
            this.clearMapPolygonsForUpdate(coveragePolygon.unionCoveragePolygon);
            this.clearMapPolygonsForUpdate(coveragePolygon.intersectCoveragePolygon);
        })
    }

    static clearMapPolygonsForUpdate(coveragePolygon) {
        // remove the items from the map
        coveragePolygon.googleMapCoveragePolygonObjects.forEach((currentMapPolygon) => {
            currentMapPolygon.setMap(null);
        });

        // delete all the items in the list since they will be re-generated
        coveragePolygon.googleMapCoveragePolygonObjects = [];
    }

    static refreshPolgyonMapShowHide(segmentCoveragePolygons, googleMapInstance) {
        segmentCoveragePolygons.forEach((polygon) => {

            const keyNames = ["unionCoveragePolygon", "intersectCoveragePolygon"];

            keyNames.forEach((objKey) => {

                const coveragePolygonObject = polygon[objKey]
                if (coveragePolygonObject.polygon) {
                    coveragePolygonObject.googleMapCoveragePolygonObjects.forEach((mapPolygon) => {
                        mapPolygon.setOptions({ zIndex: 2 })
                        mapPolygon.setMap(coveragePolygonObject.show ? googleMapInstance : null);
                    });
                }
            });

        });
    }

    static generateCoverageReport(coveragePolygons) {

        console.log("Generating Coverage Report");

        const myPolygonTable = new TableDomObject("polygon-table",
            {
                border: "1px solid black",
                borderCollapse: "collapse",
            },
            {
                border: "1px solid black",
            },
            {
                border: "1px solid black",
                padding: "4px",
                textAlign: "center",
                verticalAlign: "middle",
            }
        );

        const tableHeadings = ["Segment Label", "Union Area (sq km)", "Intersect Area (sq km)"];

        myPolygonTable.addRow();
        myPolygonTable.addRowItemsList(tableHeadings, true);


        coveragePolygons.forEach((polygon, idx) => {

            // Add the label in the first row
            myPolygonTable.addRow();
            myPolygonTable.addRowItem(polygon.label);

            const keyNames = ["unionCoveragePolygon", "intersectCoveragePolygon"];

            keyNames.forEach((objKey) => {
                const cellReference = myPolygonTable.addRowItem("");

                const coveragePolygonObject = polygon[objKey]
                if (coveragePolygonObject.polygon) {

                    cellReference.innerHTML = (turf.area(coveragePolygonObject.polygon) / (1000 * 1000)).toFixed(1);
                }
            });
        });

        return myPolygonTable.getTable().outerHTML;

    }



    listPolygons(parentElement) {    // Create the <ul>
        parentElement.innerHTML = "";

        const myTitle = document.createElement("h4");
        myTitle.textContent = "Current Polygons:";
        parentElement.appendChild(myTitle);

        if (this.coveragePolygons.length == 0) { return false; }

        const myList = document.createElement("ul");
        this.coveragePolygons.forEach((polygon, index) => {
            // Example dat
            const myListItem = document.createElement("li");
            const button = document.createElement("button");
            button.style.marginLeft = "4px";

            myListItem.innerHTML = polygon.title;

            button.textContent = "Delete";
            button.addEventListener("click", () => {
                this.removePolygon(index);
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
            { value: "union-auto", text: "Coverage (Union) of Same-Named Segments" },
            { value: "intersect", text: "Overlap (Intersection) of Named Segments" },
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
                    this.showGenericAutoMenu(markers, "New " + polygonTypeDropdown.options[polygonTypeDropdown.selectedIndex].text, 2, this.generateSingleInteresectPolygonBySegmentLabel.bind(this));
                    break;

                case "union-auto":
                    // this.showUnionAutoMenu(markers);
                    this.showGenericAutoMenu(markers, "New " + polygonTypeDropdown.options[polygonTypeDropdown.selectedIndex].text, 1, this.generateUnionPolygonBySegmentLabel.bind(this));
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



    showIntersectMenu(markers) {
        // this.polygonMenu()
        menuDiv.innerHTML = "<h2> Intersect Menu Placeholder <h2>";

        unionPolygons = this.getAllMarkerSegementLabels(markers);


        const menuOptions = Object.keys(unionPolygons)
            .filter(key => unionPolygons[key].length > 1) // only keys with >1 segment
            .map(key => ({
                value: key,
                text: `${key} (${unionPolygons[key].length} segments; markers: ${unionPolygons[key].join(", ")})`
            }));


        return null;
    }

    showUnionManualMenu() {
        // this.polygonMenu()

        const menuDiv = document.getElementById("polygon-workshop-div");
        menuDiv.innerHTML = "<h2> Manual Menu Placeholder <h2>";
        return null;
    }

    static getAllMarkerSegementLabels(markers) {
        const sameNamedSegments = [];

        markers.forEach((marker) => {
            marker.coverageMetadata.radius.forEach((currentSegment) => {
                if (currentSegment.label in sameNamedSegments) {
                    sameNamedSegments[currentSegment.label].push(marker.title);
                } else {
                    sameNamedSegments[currentSegment.label] = []
                    sameNamedSegments[currentSegment.label].push(marker.title);
                }
            });
        });


        return sameNamedSegments;
    }


    showGenericAutoMenu(markers, title, minSegments, segmentPolygonCallback) {

        const sameNamedSegments = this.getAllMarkerSegementLabels(markers);

        // Prepare the union list 

        const menuOptions = Object.keys(sameNamedSegments)
            .filter(key => sameNamedSegments[key].length > minSegments - 1) // only keys with >1 segment
            .map(key => ({
                value: key,
                text: `${key} (${sameNamedSegments[key].length} segments; markers: ${sameNamedSegments[key].join(", ")})`
            }));


        const menuDiv = document.getElementById("polygon-workshop-div");

        menuDiv.innerHTML = "<h3>" + title + "</h3>\n";
        menuDiv.innerHTML += "<p>Select segment for new Polygon:</p>"

        const polygonToGenerateMenu = buildDropdown(menuOptions, "poly-segments-select");

        polygonToGenerateMenu.addEventListener("change", () => {
            // Get the selected key (value of the selected option)
            const selectedKey = polygonToGenerateMenu.value;

            console.log("Drop Down Changed!")

            // Find the input element
            const nameInput = document.getElementById("poly-form-name");

            // If the input is blank, set it to the selected key + " polygon"
            if (nameInput && !nameInput.value.trim()) {
                nameInput.value = `${selectedKey} polygon`;
            }
        });

        menuDiv.appendChild(polygonToGenerateMenu);

        menuDiv.appendChild(document.createElement("br"));
        const nameLabel = addFormLabel("Polygon Name: ");
        menuDiv.appendChild(nameLabel);
        menuDiv.appendChild(addShortTextInput("", "poly-form-name"));


        menuDiv.appendChild(document.createElement("br"));
        const colorLabel = addFormLabel("Polygon Color: ")
        menuDiv.appendChild(colorLabel);
        menuDiv.appendChild(addColorPicker("#0000C0", "poly-form-color"))


        menuDiv.appendChild(document.createElement("br"));
        const transparencyLabel = addFormLabel("Polygon Transparency: ")
        const transparencyId = "poly-form-transparency";
        menuDiv.appendChild(transparencyLabel);
        menuDiv.appendChild(addPercentSliderBar(50, 0, 100, transparencyId));
        menuDiv.appendChild(addPercentSliderDisplay(transparencyId));
        updateSliderDisplay(transparencyId);

        // Create the "Add" button
        const generatePolygonButton = document.createElement("button");
        generatePolygonButton.textContent = "Add New Polygon";
        generatePolygonButton.addEventListener("click", () => {
            const selected = polygonToGenerateMenu.value;

            // const newTurfPolygon = this.generateUnionPolygonBySegmentLabel(markers, selected);
            // const newTurfPolygon = this.generateUnionPolygonBySegmentLabel(markers, selected);
            const newTurfPolygon = segmentPolygonCallback(markers, selected);

            const newPolygonObject = {
                title: document.getElementById("poly-form-name").value,
                color: document.getElementById("poly-form-color").value,
                transparency: document.getElementById("poly-form-transparency").value,
                polygon: newTurfPolygon,
                show: true,
                googleMapCoveragePolygonObjects: [],
            };

            this.addNewCoveragePolygon(newPolygonObject);
            this.polygonMenu();
            // this.updatePolygonMap();
        });


        menuDiv.appendChild(document.createElement("br"));
        menuDiv.appendChild(generatePolygonButton);


    }


    showUnionAutoMenu(markers) {



        unionPolygons = this.getAllMarkerSegementLabels(markers);

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

        polygonToGenerateMenu.addEventListener("change", () => {
            // Get the selected key (value of the selected option)
            const selectedKey = polygonToGenerateMenu.value;

            console.log("Drop Down Changed!")

            // Find the input element
            const nameInput = document.getElementById("poly-form-name");

            // If the input is blank, set it to the selected key + " polygon"
            if (nameInput && !nameInput.value.trim()) {
                nameInput.value = `${selectedKey} polygon`;
            }
        });

        menuDiv.appendChild(polygonToGenerateMenu);

        menuDiv.appendChild(document.createElement("br"));
        const nameLabel = addFormLabel("Polygon Name: ");
        menuDiv.appendChild(nameLabel);
        menuDiv.appendChild(addShortTextInput("", "poly-form-name"));


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
            const newPolygonObject = {
                title: document.getElementById("poly-form-name").value,
                color: document.getElementById("poly-form-color").value,
                transparency: document.getElementById("poly-form-transparency").value,
                polygon: newTurfPolygon,
                show: true,
                googleMapCoveragePolygonObjects: [],
            };

            this.addNewCoveragePolygon(newPolygonObject);
            this.polygonMenu();
            // this.updatePolygonMap();
        });


        menuDiv.appendChild(document.createElement("br"));
        menuDiv.appendChild(generatePolygonButton);


    }

    addNewCoveragePolygon(newPolygonObject) {

        const newPolygon = newPolygonObject.polygon;
        // See if the new polygon exists (upstream functions will return null for an empty polygon)
        if (!newPolygon) {
            alert("Generated polygon is empty");
            return null;
        }

        /*
        const newPolygonObject = {
            title: document.getElementById("poly-form-name").value,
            color: document.getElementById("poly-form-color").value,
            transparency: document.getElementById("poly-form-transparency").value,
            polygon: newPolygon,
            show: true,
            googleMapCoveragePolygonObjects: [],
        };
        */

        newPolygonObject.googleMapCoveragePolygonObjects =
            turfToGooglePolygon(
                newPolygon,
                {
                    strokeColor: rgbToHex(newPolygonObject.color),    // Line color
                    strokeOpacity: 1 - ((Math.min(1, newPolygonObject.transparency + 0.2)) / 100),        // Line transparency (0.0–1.0)
                    fillColor: rgbToHex(newPolygonObject.color),      // Fill color
                    fillOpacity: 1 - (newPolygonObject.transparency / 100),
                });


        this.coveragePolygons.push(newPolygonObject);



    }


    static getTurfPolygonsFromMarkers(markers, label) {
        // console.log("creating polygons for processing");
        const turfPolygonsForProcessing = [];

        // console.log(markers);
        markers.forEach((marker) => {
            marker.coverageMetadata.radius.forEach((currentSegment) => {

                // Only add polygons if the label matches
                if (currentSegment.label == label) {
                    turfPolygonsForProcessing.push(
                        googlePolygonToTurf(
                            generateGoogleMapsWedgePolygon(marker, 0, currentSegment)
                        )
                    );
                }

            })
        });

        return turfPolygonsForProcessing;

    }

    generateSingleInteresectPolygonBySegmentLabel(markers, label) {
        // alert(label);

        const turfPolygonsForUnion = this.getTurfPolygonsFromMarkers(markers, label);

        const turfUnionPolygon = turfMultiSingleIntersect(turfPolygonsForUnion);
        // This is making stuff unhappy

        // console.log(turfUnionPolygon);
        // console.log(turf.area(turfUnionPolygon));
        return turfUnionPolygon;

        // googleMapUnionPolygon.setMap(myMapManager.map);

    }


    generateUnionPolygonBySegmentLabel(markers, label) {
        // alert(label);

        const turfPolygonsForUnion = this.getTurfPolygonsFromMarkers(markers, label);

        const turfUnionPolygon = turfMultiUnion(turfPolygonsForUnion);
        // This is making stuff unhappy

        // console.log(turfUnionPolygon);
        // console.log(turf.area(turfUnionPolygon));
        return turfUnionPolygon;

        // googleMapUnionPolygon.setMap(myMapManager.map);



    }


    removePolygon(index) {

        this.coveragePolygons[index].googleMapCoveragePolygonObjects.forEach(myMap => myMap.setMap(null));

        this.coveragePolygons.splice(index, 1);
        //this.googleMapPolygonObjects[index].setMap(null);
        // this.googleMapPolygonObjects.splice(index, 1);

        this.polygonMenu();
    }
}