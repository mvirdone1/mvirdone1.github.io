// Initialize Cesium
const viewer = new Cesium.Viewer("cesiumContainer", {
    terrainProvider: new Cesium.CesiumTerrainProvider({
        url: "https://assets.agi.com/stk-terrain/world"
    }),
    scene3DOnly: true
});


let coverageOrigin = null;
let coverageEntities = [];

// Click on map to place origin
viewer.screenSpaceEventHandler.setInputAction(function (click) {
    const pickedPosition = viewer.scene.pickPosition(click.position);
    if (pickedPosition) {
        coverageOrigin = pickedPosition;
        // Remove previous origin marker
        viewer.entities.removeAll();
        viewer.entities.add({
            position: coverageOrigin,
            point: { pixelSize: 10, color: Cesium.Color.BLUE },
            label: { text: "Origin", verticalOrigin: Cesium.VerticalOrigin.BOTTOM, pixelOffset: new Cesium.Cartesian2(0, -15) }
        });
        updateCoverage();
    }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

// Layers array
let layers = [
    { rangeMax: 1000, color: "#FF0000", label: "Layer 1" }
];

// Manage layer controls
const layersContainer = document.getElementById("layersContainer");

function renderLayerControls() {
    layersContainer.innerHTML = "";
    layers.forEach((layer, i) => {
        const div = document.createElement("div");
        div.className = "layer-controls";
        div.innerHTML = `
            Label: <input type="text" value="${layer.label}" data-index="${i}" class="layer-label">
            Range Max: <input type="number" value="${layer.rangeMax}" data-index="${i}" class="layer-range">
            Color: <input type="color" value="${layer.color}" data-index="${i}" class="layer-color">
        `;
        layersContainer.appendChild(div);
    });
}
renderLayerControls();

document.getElementById("addLayer").addEventListener("click", () => {
    layers.push({ rangeMax: 1000, color: "#00FF00", label: `Layer ${layers.length+1}` });
    renderLayerControls();
});

document.getElementById("updateLayers").addEventListener("click", () => {
    document.querySelectorAll(".layer-label").forEach(input => layers[input.dataset.index].label = input.value);
    document.querySelectorAll(".layer-range").forEach(input => layers[input.dataset.index].rangeMax = parseFloat(input.value));
    document.querySelectorAll(".layer-color").forEach(input => layers[input.dataset.index].color = input.value);
    updateCoverage();
});

// Create a coverage layer
function createCoverageLayer(origin, options) {
    const { azimuth, azWidth, elAngle, elWidth, rangeMin = 0, rangeMax, color, label } = options;

    const azSteps = 36;
    const elSteps = 10;
    const points = [];

    for (let i = -azWidth/2; i <= azWidth/2; i += azWidth / azSteps) {
        for (let j = -elWidth/2; j <= elWidth/2; j += elWidth / elSteps) {
            const azRad = Cesium.Math.toRadians(azimuth + i);
            const elRad = Cesium.Math.toRadians(elAngle + j);

            const r = rangeMax;

            const x = r * Math.cos(elRad) * Math.sin(azRad);
            const y = r * Math.cos(elRad) * Math.cos(azRad);
            const z = r * Math.sin(elRad);

            points.push(Cesium.Cartesian3.add(origin, new Cesium.Cartesian3(x, y, z), new Cesium.Cartesian3()));
        }
    }

    const entity = viewer.entities.add({
        polygon: { hierarchy: new Cesium.PolygonHierarchy(points), material: Cesium.Color.fromCssColorString(color).withAlpha(0.4) },
        label: { text: label, font: "16px sans-serif", fillColor: Cesium.Color.fromCssColorString(color), showBackground: true, verticalOrigin: Cesium.VerticalOrigin.BOTTOM }
    });

    coverageEntities.push(entity);
}

// Update all coverage layers
function updateCoverage() {
    if (!coverageOrigin) return;
    coverageEntities.forEach(e => viewer.entities.remove(e));
    coverageEntities = [];

    let previousMaxRange = 0;
    const azimuth = parseFloat(document.getElementById("azimuth").value);
    const azWidth = parseFloat(document.getElementById("azWidth").value);
    const elAngle = parseFloat(document.getElementById("elAngle").value);
    const elWidth = parseFloat(document.getElementById("elWidth").value);

    layers.forEach(layer => {
        createCoverageLayer(coverageOrigin, {
            azimuth, azWidth, elAngle, elWidth,
            rangeMin: previousMaxRange,
            rangeMax: layer.rangeMax,
            color: layer.color,
            label: layer.label
        });
        previousMaxRange = layer.rangeMax;
    });
}
