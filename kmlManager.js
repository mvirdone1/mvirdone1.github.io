class KMLManager {
    constructor(docName = "KML Document") {
        this.kmlHeader = `<?xml version="1.0" encoding="UTF-8"?>\n<kml xmlns="http://www.opengis.net/kml/2.2">\n<Document>\n<name>${docName}</name>\n`;
        this.kmlFooter = `</Document>\n</kml>`;
        this.content = "";   // dynamic content

        this.currentFolder =
        {
            header: this.kmlHeader,
            footer: this.kmlFooter,
            contents: [],
        }

        this.folderStack = [this.currentFolder]; // track open folders
    }

    // Start a folder and push to stack
    openFolder(name) {

        const newFolder =
        {
            header: `<Folder>\n<name>${name}</name>\n`,
            footer: "</Folder>",
            contents: [],
        }

        this.currentFolder.contents.push(newFolder);
        this.folderStack.push(newFolder);
        this.currentFolder = newFolder;

    }

    // Close the most recent folder
    closeFolder() {
        // If we're not at the top level
        if (this.folderStack.length > 1) {
            // Pop the last item off the list and give me the last item in the list
            this.folderStack.pop();

        }
        // Update the current folder to the new folder at the end of the array
        this.currentFolder = this.folderStack.at(-1);
    }

    addToFolder(contentObject) {
        /*
        const contentObject =
        {
            header: string,
            footer: string,
            contents: string or array,
        }
        */

        this.currentFolder.contents.push(contentObject);
    }

    buildKMLDocument() {
        if (this.folderStack.length != 1) {
            console.log("Folder Stack is wrong length, should be 1: " + this.folderStack.length);
            console.log(this.folderStack);
            return null;
        }

        return this.buildKMLString(this.folderStack[0], 0);
    }

    buildKMLString(contentObject, depth = 0) {

        console.log(contentObject.header);
        console.log(depth);

        let kmlString = "";
        const baseSpaces = depth * 2;

        function kmlIndent(startingString, numSpaces) {
            const baseIndent = " ".repeat(numSpaces);
            return baseIndent + startingString.replace(/\n/g, "\n" + baseIndent);
        }
        let contentString = "";

        // Its turtles all the way down
        // Recursively build the structure if you find more arrays
        if (Array.isArray(contentObject.contents)) {
            contentObject.contents.forEach((currentContent) => {
                contentString += this.buildKMLString(currentContent, depth + 1);
            });
            // kmlString += kmlIndent(contentObject.footer, baseSpaces);
        }
        else {

            contentString = kmlIndent(contentObject.contents, baseSpaces + 2);
            //kmlString += baseIndent + contentObject.header;
            //kmlString += baseIndent + " ".repeat(2) + contentObject.contents;
            // kmlString += baseIndent + contentObject.footer;
        }

        kmlString += kmlIndent(contentObject.header, baseSpaces);
        kmlString += contentString;
        kmlString += kmlIndent(contentObject.footer, baseSpaces) + "\n";


        return kmlString;
    }

    polygonKmlObject(coords) {

        const contentObject =
        {
            header: `<Polygon><altitudeMode>relativeToGround</altitudeMode><outerBoundaryIs><LinearRing><coordinates>\n`,
            footer: `</coordinates></LinearRing></outerBoundaryIs></Polygon>`,
            contents: "",
        }


        let contentString = "";
        coords.forEach(c => {
            const lon = c.lon.toFixed(5);
            const lat = c.lat.toFixed(5);
            const alt = c.alt.toFixed(5);
            contentString += `${lon},${lat},${alt}\n`;
        });
        // Explicit closure
        const f = coords[0];
        contentString += `${f.lon.toFixed(5)},${f.lat.toFixed(5)},${f.alt.toFixed(5)}\n`;
        contentObject.contents = contentString
        return contentObject;
    }

    // --- Build one wedge as 5 faces ---
    buildWedgeKMLObject(params, pointsPerKm = 2) {
        const { lat, lon, alt, azCtr, azBw, elCtr, elBw, rMin, rMax, name, color } = params;

        const azMin = azCtr - azBw / 2;
        const azMax = azCtr + azBw / 2;
        const elMin = elCtr - elBw / 2;
        const elMax = elCtr + elBw / 2;

        // const alpha = Math.round(255 * (1 - (params.trans / 100)));
        // const kmlColor = colorToKmlHex(color);
        const kmlColor = color;

        const outerArcLengthKm = rMax * azBw * Math.PI / 180;
        const azSteps = Math.max(4, Math.ceil(outerArcLengthKm * pointsPerKm));


        const contentObject =
        {
            header: `<Placemark> <Style><PolyStyle><color>${kmlColor}</color><fill>1</fill><outline>0</outline></PolyStyle></Style>\n`,
            footer: `</Placemark>\n`,
            contents: [],
        }



        const sliceSize = (azMax - azMin) / azSteps

        // Left side (az=azMin)
        {
            const pts = [];
            pts.push(azElR_to_LLA(lat, lon, alt, azMin, elMin, rMin));
            pts.push(azElR_to_LLA(lat, lon, alt, azMin, elMin, rMax));
            pts.push(azElR_to_LLA(lat, lon, alt, azMin, elMax, rMax));
            pts.push(azElR_to_LLA(lat, lon, alt, azMin, elMax, rMin));
            contentObject.contents = [this.polygonKmlObject(pts)];
            this.currentFolder.contents.push(structuredClone(contentObject));
        }


        // Right side (az=azMax)
        {
            const pts = [];
            pts.push(azElR_to_LLA(lat, lon, alt, azMax, elMin, rMin));
            pts.push(azElR_to_LLA(lat, lon, alt, azMax, elMin, rMax));
            pts.push(azElR_to_LLA(lat, lon, alt, azMax, elMax, rMax));
            pts.push(azElR_to_LLA(lat, lon, alt, azMax, elMax, rMin));
            contentObject.contents = [this.polygonKmlObject(pts)];
            this.currentFolder.contents.push(structuredClone(contentObject));
        }


        // Bottom side (el = elMin)
        {
            const elRef = elMin;
            const pts = [];
            pts.push(azElR_to_LLA(lat, lon, alt, azMin, elRef, rMin));

            pts.push(azElR_to_LLA(lat, lon, alt, azMin, elRef, rMax));
            for (let i = 1; i <= azSteps; i++) {
                const az = azMin + sliceSize * i;
                pts.push(azElR_to_LLA(lat, lon, alt, az, elRef, rMax));
            }

            pts.push(azElR_to_LLA(lat, lon, alt, azMax, elRef, rMin));
            for (let i = azSteps - 1; i >= 1; i--) {
                const az = azMin + sliceSize * i;
                pts.push(azElR_to_LLA(lat, lon, alt, az, elRef, rMin));
            }

            // manually close
            pts.push(pts[0]);

            contentObject.contents = [this.polygonKmlObject(pts)];
            this.currentFolder.contents.push(structuredClone(contentObject));
        }

        // Top side (el = elMax)
        {
            const elRef = elMax;
            const pts = [];
            pts.push(azElR_to_LLA(lat, lon, alt, azMin, elRef, rMin));

            pts.push(azElR_to_LLA(lat, lon, alt, azMin, elRef, rMax));
            for (let i = 1; i <= azSteps; i++) {
                const az = azMin + sliceSize * i;
                pts.push(azElR_to_LLA(lat, lon, alt, az, elRef, rMax));
            }

            pts.push(azElR_to_LLA(lat, lon, alt, azMax, elRef, rMin));
            for (let i = azSteps - 1; i >= 1; i--) {
                const az = azMin + sliceSize * i;
                pts.push(azElR_to_LLA(lat, lon, alt, az, elRef, rMin));
            }

            // manually close
            pts.push(pts[0]);

            contentObject.contents = [this.polygonKmlObject(pts)];
            this.currentFolder.contents.push(structuredClone(contentObject));
        }


        return contentObject;
    }

}
