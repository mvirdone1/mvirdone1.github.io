// Take the list of radius segments in a given marker, and add the coverage wedges to the map
function drawCoverageWedgesForMarker(marker) {
    // Remove existing polygons
    if (marker.segmentPoygons) {
        marker.segmentPoygons.forEach(p => p.setMap(null));
    }
    marker.segmentPoygons = [];

    const metadata = marker.coverageMetadata;
    if (!metadata || !metadata.radius || metadata.radius.length === 0) return;

    var innerRadius = 0; // meters


    // iterate over each of the radius in the marker metadata array
    marker.coverageMetadata.radius.forEach((radiusObj, idx) => {
        const polygon = generateGoogleMapsWedgePolygon(marker, innerRadius, radiusObj);
        if (polygon) {
            marker.segmentPoygons.push(polygon);

            // Add the polygon to the map if the show attribute for the marker is set.
            if (marker.coverageMetadata.show) {
                polygon.setMap(myMapManager.map);
            }

        }

        innerRadius = radiusObj.value;
    });


}

function generateGoogleMapsWedgePolygon(marker, innerRadiusKm, radiusObj) {
    if (!marker || !radiusObj) {
        console.warn("Marker or radiusObj missing");
        return;
    }

    // console.log(radiusObj);

    const center = marker.getPosition(); // google.maps.LatLng

    // Convert radius color from [r,g,b] to hex
    const fillColor = rgbToHex(...radiusObj.color);

    // Transparency in your object (0 = opaque, 1 = fully transparent)
    // Convert to fillOpacity: fillOpacity = 1 - transparency
    const fillOpacity = 1 - (radiusObj.transparency || 0);

    // Use your existing wedge helper function
    const outerRadius = radiusObj.value; // km
    const sectorCenter = marker.coverageMetadata.sectorAzimuthHeading;
    const sectorWidth = marker.coverageMetadata.sectorAzimuthWidth;

    const path = getWedgePolygonPath(center, innerRadiusKm, outerRadius, sectorCenter, sectorWidth);

    if (!path || !path.length) {
        console.warn("Computed wedge path is empty!");
        return;
    }

    // console.log(`Adding wedge polygon: inner=${innerRadiusKm}km, outer=${outerRadius}km, center=${sectorCenter}, width=${sectorWidth}`);
    // console.log("Path points:", path.length);

    const polygon = new google.maps.Polygon({
        paths: path,
        strokeColor: fillColor,
        strokeOpacity: fillOpacity + 0.15, // slightly more opaque border
        strokeWeight: 2,
        fillColor: fillColor,
        fillOpacity: fillOpacity,
        // map: marker.getMap(),
    });


    return polygon;
}


function getWedgePolygonPath(center, innerRadiusKm, outerRadiusKm, azimuthCenter, azimuthWidth, pointsPerKm = 2) {
    const path = [];

    // Convert to radians
    const centerRad = (azimuthCenter * Math.PI) / 180;
    const halfWidthRad = ((azimuthWidth / 2) * Math.PI) / 180;

    // Determine number of points along outer arc
    const outerArcLengthKm = outerRadiusKm * azimuthWidth * Math.PI / 180;
    const numPoints = Math.max(2, Math.ceil(outerArcLengthKm * pointsPerKm));

    // Outer arc
    for (let i = 0; i <= numPoints; i++) {
        const angle = centerRad - halfWidthRad + (i / numPoints) * (2 * halfWidthRad);
        const pos = google.maps.geometry.spherical.computeOffset(center, outerRadiusKm * 1000, (angle * 180) / Math.PI);
        path.push(pos);
    }

    // Inner arc (reverse order)
    for (let i = numPoints; i >= 0; i--) {
        const angle = centerRad - halfWidthRad + (i / numPoints) * (2 * halfWidthRad);
        const pos = google.maps.geometry.spherical.computeOffset(center, innerRadiusKm * 1000, (angle * 180) / Math.PI);
        path.push(pos);
    }

    return path;
}


// Convert antenna-centered az/el/r (km) to lat/lon/alt
function azElR_to_LLA(lat0, lon0, alt0, azDeg, elDeg, rKm) {
    const R_E = 6378137.0; // Earth radius (approx)
    const r = rKm * 1000;
    const az = toRadians(azDeg);
    const el = toRadians(elDeg);

    // ENU offsets
    const dNorth = r * Math.cos(el) * Math.cos(az);
    const dEast = r * Math.cos(el) * Math.sin(az);
    const dUp = r * Math.sin(el);

    // Simple geodetic offset (small-angle approx)
    const dLat = (dNorth / R_E) * (180 / Math.PI);
    const dLon = (dEast / (R_E * Math.cos(toRadians(lat0)))) * (180 / Math.PI);

    return {
        lat: lat0 + dLat,
        lon: lon0 + dLon,
        alt: alt0 + dUp
    };
}

function polygonKml(coords) {
    let s = `<Polygon><altitudeMode>relativeToGround</altitudeMode><outerBoundaryIs><LinearRing><coordinates>\n`;
    coords.forEach(c => {
        const lon = c.lon.toFixed(5);
        const lat = c.lat.toFixed(5);
        const alt = c.alt.toFixed(5);
        s += `${lon},${lat},${alt}\n`;
    });
    // Explicit closure
    const f = coords[0];
    s += `${f.lon.toFixed(5)},${f.lat.toFixed(5)},${f.alt.toFixed(5)}\n`;
    s += `</coordinates></LinearRing></outerBoundaryIs></Polygon>`;
    return s;
}

// --- Build one wedge as 5 faces ---
function buildWedgeKML(params, pointsPerKm = 2) {
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




    let kml = `<Folder><name>${name}</name>\n`;

    // kml += `<Placemark><Style><PolyStyle><color>${kmlColor}</color><fill>1</fill><outline>0</outline></PolyStyle></Style>`;

    function face(pts) {

        return `<Placemark><Style><PolyStyle><color>${kmlColor}</color><fill>1</fill><outline>0</outline></PolyStyle></Style>`
            + polygonKml(pts)
            + `</Placemark>\n`;


        // return `<Placemark><styleUrl>#wedge</styleUrl>`+polygonKml(pts)+`</Placemark>\n`;
    }

    const sliceSize = (azMax - azMin) / azSteps

    // Left side (az=azMin)
    {
        const pts = [];
        pts.push(azElR_to_LLA(lat, lon, alt, azMin, elMin, rMin));
        pts.push(azElR_to_LLA(lat, lon, alt, azMin, elMin, rMax));
        pts.push(azElR_to_LLA(lat, lon, alt, azMin, elMax, rMax));
        pts.push(azElR_to_LLA(lat, lon, alt, azMin, elMax, rMin));
        kml += face(pts);
    }


    // Right side (az=azMax)
    {
        const pts = [];
        pts.push(azElR_to_LLA(lat, lon, alt, azMax, elMin, rMin));
        pts.push(azElR_to_LLA(lat, lon, alt, azMax, elMin, rMax));
        pts.push(azElR_to_LLA(lat, lon, alt, azMax, elMax, rMax));
        pts.push(azElR_to_LLA(lat, lon, alt, azMax, elMax, rMin));
        kml += face(pts);
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

        kml += face(pts);
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

        kml += face(pts);
    }

    kml += `</Folder>\n`;
    return kml;
}


function saveCoverageSettingsJSON(markers, polygons = null) {
    if (!markers || markers.length === 0) {
        alert("No markers to save.");
        return;
    }

    // Build array of marker objects
    const markerData = markers.map(marker => {
        return {
            title: marker.getTitle ? marker.getTitle() : "",
            position: {
                lat: marker.getPosition().lat(),
                lng: marker.getPosition().lng()
            },
            coverageMetadata: marker.coverageMetadata || null
        };
    });



    // Create final object to save
    const dataToSave = {
        savedAt: new Date().toISOString(),
        markers: markerData
    };


    if (polygons) {
        polygonData = polygons.map(polygon => {
            return {
                title: polygon.title,
                color: pologon.color,
                transparency: polygon.transparency,
                polygonSourceMetadata: polygon.polygonSourceMetadata,
                show: show,
            }
        });
    }


    // Convert to JSON string
    const jsonString = JSON.stringify(dataToSave, null, 2);

    // Generate filename with timestamp
    const now = new Date();
    const pad = num => num.toString().padStart(2, "0");
    const filename =
        `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-` +
        `${pad(now.getHours())}${pad(now.getMinutes())}_coverage_settings.json`;

    // Trigger download
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function loadCoverageSettingsJSON(callbackFunction) {
    const fileInput = document.getElementById("jsonFileInput");
    fileInput.click(); // open file chooser

    fileInput.onchange = (event) => {
        const file = event.target.files[0];
        if (!file) return;


        let json = null;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                json = JSON.parse(e.target.result);
                console.log("Parsed JSON:", json);

                // Expecting array of marker objects with title, position, coverageMetadata
                if (!Array.isArray(json.markers)) {
                    alert("Invalid JSON format: Expected an array of markers.");
                    return;
                }

                console.log("Loaded markers:", json.markers);

                //  return the array of markers (from promise or callback)
                callbackFunction(json.markers);

            } catch (err) {
                console.error("Error parsing JSON:", err);
                alert("Failed to parse JSON file.");
            }
        };

        reader.readAsText(file);
    };
}

function computeCoveragePolygonOverlap(markers) {
    // For each marker in markers, create two new turf polygons for each radius
    // The first one will be the same inner/outer radius, the second will be from zero
    // For each marker element, add a new object turfMetadata will have an array called radius
    // Each radius will have fullPoly and poly


    // prepare all the markers
    markers.forEach(marker => {

        innerRadius = 0;


        marker.overlapMetadata = [];
        marker.coverageMetadata.radius.forEach((currentRadiusObj, idx) => {
            // Build the new wedges
            const polygon = generateGoogleMapsWedgePolygon(marker, innerRadius, currentRadiusObj);
            const fullPolygon = generateGoogleMapsWedgePolygon(marker, 0, currentRadiusObj);

            const newOverlap = {
                radius: currentRadiusObj,
                polygon: polygon,
                fullPolygon: fullPolygon,
                turfPolgyon: googlePolygonToTurf(polygon),
                turfFullPolygon: googlePolygonToTurf(fullPolygon),
            };

            // Update the metadata in each marker object
            marker.overlapMetadata.push(newOverlap)

            // console.log(newOverlap);

            innerRadius = currentRadiusObj.value; // Set the inner radius for the next iteration

        });

    });


    const overlapResults = [];

    markers.forEach((primaryMarker, idx) => {

        markers.slice(idx + 1).forEach((compareMarker) => {

            primaryMarker.overlapMetadata.forEach((primaryOverlap) => {

                compareMarker.overlapMetadata.forEach((compareOverlap) => {


                    // console.log(turf.getType(primaryOverlap.turfPolgyon)); // should output 'Polygon'
                    // console.log(turf.getType(compareOverlap.turfPolgyon)); // should output 'Polygon'

                    const fullOverlap = turf.intersect(primaryOverlap.turfFullPolygon, compareOverlap.turfFullPolygon);
                    let fullOverlapArea = fullOverlap ? turf.area(fullOverlap) : 0;

                    const sectorOverlap = turf.intersect(primaryOverlap.turfPolgyon, compareOverlap.turfPolgyon);
                    let sectorOverlapArea = sectorOverlap ? turf.area(sectorOverlap) : 0;

                    // console.log(compareMarker);

                    const currentOverlapResult = {
                        markerOneName: primaryMarker.title,
                        segmentOneName: primaryOverlap.radius.label,
                        markerTwoName: compareMarker.title,
                        segmentTwoName: compareOverlap.radius.label,
                        fullOverlap: fullOverlapArea,
                        overlap: sectorOverlapArea,
                        // fullOverlap: turf.intersect(primaryOverlap.turfFullPolygon, compareOverlap.turfFullPolygon),
                        /*
                        fullOverlap: turf.intersect(
                            turf.featureCollection(primaryOverlap.turfFullPolygon,
                                compareOverlap.turfFullPolygon
                            )),
                        overlap: turf.intersect(primaryOverlap.turfPolygon, compareOverlap.turfPolygon),*/
                    };
                    // console.log(currentOverlapResult);
                    overlapResults.push(currentOverlapResult);

                });

            });


        });

    });

    return overlapResults;
}

function googlePolygonToTurf(polygon) {
    // Get the path (array of LatLng objects)
    const path = polygon.getPath();

    // Convert to [lng, lat] coordinate array
    const coordinates = [];
    path.forEach((latLng) => {
        coordinates.push([latLng.lng(), latLng.lat()]);
    });

    // Close the polygon (first and last points must match)
    if (
        coordinates.length > 0 &&
        (coordinates[0][0] !== coordinates[coordinates.length - 1][0] ||
            coordinates[0][1] !== coordinates[coordinates.length - 1][1])
    ) {
        coordinates.push([...coordinates[0]]);
    }


    const turfPolygon = turf.polygon([coordinates]);

    return turfPolygon;
}

function turfToGooglePolygon(turfPolygon, options = {}) {
    if (!turfPolygon || !turfPolygon.geometry) return null;

    console.log(turfPolygon.geometry);

    const { type, coordinates } = turfPolygon.geometry;

    let paths = [];
    const mapPolygons = [];

    if (type === "Polygon") {
        // Turf Polygon: coordinates = [ [ [lng, lat], ... ] ] 
        paths = coordinates.map(ring =>
            ring.map(coord => ({ lat: coord[1], lng: coord[0] }))
        );

        mapPolygons.push(new google.maps.Polygon({
            paths: paths,
            ...options
        }));

    } else if (type === "MultiPolygon") {
        // Turf MultiPolygon: coordinates = [ [ [ [lng, lat], ... ] ], ... ]

        coordinates.forEach((coords) => {
            paths = coords.map(ring =>
                ring.map(coord => ({ lat: coord[1], lng: coord[0] }))
            );

            mapPolygons.push(new google.maps.Polygon({
                paths: paths,
                ...options
            }));
        });

    } else {
        console.error("Unsupported geometry type:", type);
        return null;
    }

    // console.log(paths);
    return mapPolygons;
}


// Generate a polygon of all places where at least 2 polygons are overlapping
function turfMultiSingleIntersect(polygons) {
    const intersections = [];

    // Loop through every unique pair of polygons
    for (let i = 0; i < polygons.length; i++) {
        for (let j = i + 1; j < polygons.length; j++) {
            const intersection = turf.intersect(polygons[i], polygons[j]);
            if (intersection) {
                intersections.push(intersection);
            }
        }
    }

    // If no overlaps were found, return null
    if (intersections.length === 0) {
        return null;
    }

    // Use your turfMultiUnion function to merge intersections
    return turfMultiUnion(intersections);
}


function turfMultiUnion(polygons) {
    if (!polygons || polygons.length === 0) return null;

    return polygons.reduce((acc, curr) => {
        if (!acc) return curr;
        return turf.union(acc, curr);
    }, null);
}