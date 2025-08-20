// kml-script.js

// --- Utilities ---
function deg2rad(d){return d*Math.PI/180;}
function rad2deg(r){return r*180/Math.PI;}

// Converts #RRGGBB + alpha (0–255) -> KML ABGR string
function colorToKmlHex(hex, alpha = 255) {
  const h = (hex || '#ffffff').replace('#', '');
  const r = h.substring(0, 2);
  const g = h.substring(2, 4);
  const b = h.substring(4, 6);
  const a = Math.max(0, Math.min(255, alpha)).toString(16).padStart(2, '0');
  // KML color order is AABBGGRR
  return a + b + g + r;
}


// Convert antenna-centered az/el/r (km) to lat/lon/alt
function azElR_to_LLA(lat0, lon0, alt0, azDeg, elDeg, rKm){
  const R_E = 6378137.0; // Earth radius (approx)
  const r = rKm*1000;
  const az = deg2rad(azDeg);
  const el = deg2rad(elDeg);

  // ENU offsets
  const dNorth = r * Math.cos(el) * Math.cos(az);
  const dEast  = r * Math.cos(el) * Math.sin(az);
  const dUp    = r * Math.sin(el);

  // Simple geodetic offset (small-angle approx)
  const dLat = (dNorth / R_E) * (180/Math.PI);
  const dLon = (dEast / (R_E * Math.cos(deg2rad(lat0)))) * (180/Math.PI);

  return {
    lat: lat0 + dLat,
    lon: lon0 + dLon,
    alt: alt0 + dUp
  };
}

function polygonKml(coords){
  let s = `<Polygon><altitudeMode>relativeToGround</altitudeMode><outerBoundaryIs><LinearRing><coordinates>\n`;
  coords.forEach(c=>{
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

// Old version of polygonKml, kept for reference
// (does not close the polygon loop, which is not strictly necessary in KML)

function polygonKmlOld(coords){
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

// --- Build one wedge as 5 faces ---
function buildWedge(params){
  const {lat, lon, alt, azCtr, azBw, elCtr, elBw, rMin, rMax, azSteps, elSteps, name, color} = params;

  const azMin = azCtr - azBw/2;
  const azMax = azCtr + azBw/2;
  const elMin = elCtr - elBw/2;
  const elMax = elCtr + elBw/2;

  const alpha = Math.round(255 * (1 - (params.trans / 100)));
  const kmlColor = colorToKmlHex(params.color, alpha);



  let kml = `<Folder><name>${name}</name>\n`;

  // kml += `<Placemark><Style><PolyStyle><color>${kmlColor}</color><fill>1</fill><outline>0</outline></PolyStyle></Style>`;

  function face(pts){

    return `<Placemark><Style><PolyStyle><color>${kmlColor}</color><fill>1</fill><outline>0</outline></PolyStyle></Style>` 
    + polygonKml(pts) 
    + `</Placemark>\n`;


    // return `<Placemark><styleUrl>#wedge</styleUrl>`+polygonKml(pts)+`</Placemark>\n`;
  }

  const sliceSize = (azMax - azMin) / azSteps

  // Left side (az=azMin)
  {
    const pts=[];
    pts.push(azElR_to_LLA(lat,lon,alt, azMin,elMin,rMin));
    pts.push(azElR_to_LLA(lat,lon,alt, azMin,elMin,rMax));
    pts.push(azElR_to_LLA(lat,lon,alt, azMin,elMax,rMax));
    pts.push(azElR_to_LLA(lat,lon,alt, azMin,elMax,rMin));
    kml+=face(pts);
  }

  
  // Right side (az=azMax)
  {
    const pts=[];
    pts.push(azElR_to_LLA(lat,lon,alt, azMax,elMin,rMin));
    pts.push(azElR_to_LLA(lat,lon,alt, azMax,elMin,rMax));
    pts.push(azElR_to_LLA(lat,lon,alt, azMax,elMax,rMax));
    pts.push(azElR_to_LLA(lat,lon,alt, azMax,elMax,rMin));
    kml+=face(pts);
  }
    

  // Bottom side (el = elMin)
  {
    const elRef = elMin;
    const pts = [];
    pts.push(azElR_to_LLA(lat, lon, alt, azMin, elRef, rMin));

    pts.push(azElR_to_LLA(lat, lon, alt, azMin, elRef, rMax));
    for (let i=1; i<=azSteps; i++) {
      const az = azMin + sliceSize * i;
      pts.push(azElR_to_LLA(lat, lon, alt, az, elRef, rMax));
    }

    pts.push(azElR_to_LLA(lat, lon, alt, azMax, elRef, rMin));
    for (let i=azSteps-1; i>=1; i--) {
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
      for (let i=1; i<=azSteps; i++) {
        const az = azMin + sliceSize * i;
        pts.push(azElR_to_LLA(lat, lon, alt, az, elRef, rMax));
      }

      pts.push(azElR_to_LLA(lat, lon, alt, azMax, elRef, rMin));
      for (let i=azSteps-1; i>=1; i--) {
        const az = azMin + sliceSize * i;
        pts.push(azElR_to_LLA(lat, lon, alt, az, elRef, rMin));
      }

      // manually close
      pts.push(pts[0]);

      kml += face(pts);
    }

  
  /*

  // Top side (el=elMax)
  {
    const pts=[];
    pts.push(azElR_to_LLA(lat,lon,alt,azMin,elMax,rMin));
    

    for(let i=0;i<=azSteps;i++){
      const az=azMin+(sliceSize*i);
      pts.push(azElR_to_LLA(lat,lon,alt,az,elMax,rMax));
    }

    for(let i=0;i<=(azSteps-1);i++){
      const az=azMax-(sliceSize*i);
      pts.push(azElR_to_LLA(lat,lon,alt,az,elMax,rMin));
    }

    pts.push(azElR_to_LLA(lat,lon,alt, azMin,elMax,rMin));
    kml+=face(pts);
  }
    */

  /*

  // Front cap (r=rMax, tessellated in az/el)
  {
    const pts=[];
    for(let i=0;i<=azSteps;i++){
      const az=azMin+(azMax-azMin)*i/azSteps;
      const el=elMin;
      pts.push(azElR_to_LLA(lat,lon,alt,az,el,rMax));
    }
    for(let j=1;j<=elSteps;j++){
      const el=elMin+(elMax-elMin)*j/elSteps;
      const az=azMax;
      pts.push(azElR_to_LLA(lat,lon,alt,az,el,rMax));
    }
    for(let i=azSteps-1;i>=0;i--){
      const az=azMin+(azMax-azMin)*i/azSteps;
      const el=elMax;
      pts.push(azElR_to_LLA(lat,lon,alt,az,el,rMax));
    }
    for(let j=elSteps-1;j>0;j--){
      const el=elMin+(elMax-elMin)*j/elSteps;
      const az=azMin;
      pts.push(azElR_to_LLA(lat,lon,alt,az,el,rMax));
    }
    kml+=face(pts);
  }
    */
    

  kml+=`</Folder>\n`;
  return kml;
}

// --- Generate button ---
document.getElementById('gen').addEventListener('click',()=>{
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
    kml += buildWedge(paramsCopy);
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

  const out=document.getElementById('out');
  out.textContent = kml.slice(0,1000) + (kml.length > 1000 ? "\n…(truncated preview)" : "");

  const dlBtn=document.getElementById('download');
  const blob=new Blob([kml],{type:'application/vnd.google-earth.kml+xml'});
  const url=URL.createObjectURL(blob);
  dlBtn.disabled=false;
  dlBtn.onclick=()=>{const a=document.createElement('a');a.href=url;a.download=params.name.replace(/\\s+/g,'_')+'.kml';a.click();};
});
