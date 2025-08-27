// kml-script.js






// Old version of polygonKml, kept for reference
// (does not close the polygon loop, which is not strictly necessary in KML)

function polygonKmlOld(coords) {
  let s = `<Polygon><altitudeMode>relativeToGround</altitudeMode><outerBoundaryIs><LinearRing><coordinates>\n`;
  coords.forEach(c => {
    const lon = c.lon.toFixed(5);
    const lat = c.lat.toFixed(5);
    const alt = c.alt.toFixed(5);
    s += `${lon},${lat},${alt}\n`;
  });
  // s += `${coords[0].lon},${coords[0].lat},${coords[0].alt}\n`; // close loop
  s += `</coordinates></LinearRing></outerBoundaryIs></Polygon>`;
  return s;
}



// --- Generate button ---
document.getElementById('gen').addEventListener('click', () => {
  const params = {
    lat: parseFloat(document.getElementById('lat').value),
    lon: parseFloat(document.getElementById('lon').value),
    alt: parseFloat(document.getElementById('alt').value),
    azCtr: parseFloat(document.getElementById('az').value),
    azBw: parseFloat(document.getElementById('azBw').value),
    elCtr: parseFloat(document.getElementById('el').value),
    elBw: parseFloat(document.getElementById('elBw').value),
    rMin: 0, // Parsing from elsewhere in the form
    rMax: 0, // Parsing from elsewhere in the form
    azSteps: Math.max(4, parseInt(document.getElementById('azSteps').value)),
    elSteps: 1, // Default to 1 for elevation steps
    name: document.getElementById('name').value || 'Antenna Wedge',
    color: (document.getElementById('styleColor').value || '7dff8000').trim()
  };


  // Collect ranges from GUI
  const r1 = parseFloat(document.getElementById('rMax1').value);
  const r2 = parseFloat(document.getElementById('rMax2').value);
  const r3 = parseFloat(document.getElementById('rMax3').value);

  // const ranges = [r1, r2, r3].filter(r => !isNaN(r) && r > 0);


  let kml = `<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<kml xmlns=\"http://www.opengis.net/kml/2.2\">\n<Document>\n`;
  // kml += `<Style id=\"wedge\"><PolyStyle><color>${params.color}</color><fill>1</fill><outline>0</outline></PolyStyle></Style>\n`;


  const ranges = [];
  for (let i = 1; i <= 3; i++) {
    const maxVal = parseFloat(document.getElementById(`rMax${i}`).value);
    if (!isNaN(maxVal) && maxVal > 0) {
      const color = document.getElementById(`color${i}`).value;
      const trans = 30; // Default transparency
      ranges.push({ max: maxVal, color, trans });
    }
  }

  kml += `<Folder><name>${params.name}</name>\n`;

  let rMin = 0;
  ranges.forEach((ring, idx) => {
    const paramsCopy = { ...params };
    paramsCopy.rMin = rMin;
    paramsCopy.rMax = ring.max;
    paramsCopy.color = ring.color;
    paramsCopy.trans = ring.trans;
    paramsCopy.name = `Coverage ${idx + 1}`;
    kml += buildWedgeKML(paramsCopy);
    rMin = ring.max;
  });
  // If no ranges were specified, use the default rMax

  kml += `</Folder>\n`;


  /*
  kml += buildWedge(params);

  params.rMin = params.rMax;
  params.rMax = Math.max(0.001, parseFloat(document.getElementById('rMax').value)) * 2;

  kml += buildWedge(params);
  */

  kml += `</Document></kml>`;

  const out = document.getElementById('out');
  out.textContent = kml.slice(0, 1000) + (kml.length > 1000 ? "\n…(truncated preview)" : "");

  const dlBtn = document.getElementById('download');
  const blob = new Blob([kml], { type: 'application/vnd.google-earth.kml+xml' });
  const url = URL.createObjectURL(blob);
  dlBtn.disabled = false;
  dlBtn.onclick = () => { const a = document.createElement('a'); a.href = url; a.download = params.name.replace(/\\s+/g, '_') + '.kml'; a.click(); };
});
