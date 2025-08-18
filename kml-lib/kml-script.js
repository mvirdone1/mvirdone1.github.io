// kml-script.js

// --- Utilities ---
function deg2rad(d){return d*Math.PI/180;}
function rad2deg(r){return r*180/Math.PI;}

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
  let s = `<Polygon><altitudeMode>absolute</altitudeMode><outerBoundaryIs><LinearRing><coordinates>`;
  coords.forEach(c=>{
    s += `${c.lon},${c.lat},${c.alt}\n`;
  });
  s += `${coords[0].lon},${coords[0].lat},${coords[0].alt}\n`; // close loop
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

  let kml = `<Folder><name>${name}</name>\n`;

  function face(pts){
    return `<Placemark><styleUrl>#wedge</styleUrl>`+polygonKml(pts)+`</Placemark>\n`;
  }

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

  // Bottom side (el=elMin)
  {
    const pts=[];
    pts.push(azElR_to_LLA(lat,lon,alt, azMin,elMin,rMin));
    pts.push(azElR_to_LLA(lat,lon,alt, azMax,elMin,rMin));
    pts.push(azElR_to_LLA(lat,lon,alt, azMax,elMin,rMax));
    pts.push(azElR_to_LLA(lat,lon,alt, azMin,elMin,rMax));
    kml+=face(pts);
  }

  // Top side (el=elMax)
  {
    const pts=[];
    pts.push(azElR_to_LLA(lat,lon,alt, azMin,elMax,rMin));
    pts.push(azElR_to_LLA(lat,lon,alt, azMax,elMax,rMin));
    pts.push(azElR_to_LLA(lat,lon,alt, azMax,elMax,rMax));
    pts.push(azElR_to_LLA(lat,lon,alt, azMin,elMax,rMax));
    kml+=face(pts);
  }

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
    rMin: Math.max(0, parseFloat(document.getElementById('rMin').value)),
    rMax: Math.max(0.001, parseFloat(document.getElementById('rMax').value)),
    azSteps: Math.max(4, parseInt(document.getElementById('azSteps').value)),
    elSteps: Math.max(2, parseInt(document.getElementById('elSteps').value)),
    name: document.getElementById('name').value || 'Antenna Wedge',
    color: (document.getElementById('styleColor').value || '7dff8000').trim()
  };

  let kml = `<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<kml xmlns=\"http://www.opengis.net/kml/2.2\">\n<Document>\n`;
  kml += `<Style id=\"wedge\"><PolyStyle><color>${params.color}</color><fill>1</fill><outline>0</outline></PolyStyle></Style>\n`;
  kml += buildWedge(params);
  kml += `</Document></kml>`;

  const out=document.getElementById('out');
  out.textContent = kml.slice(0,25000) + (kml.length > 25000 ? "\n…(truncated preview)" : "");

  const dlBtn=document.getElementById('download');
  const blob=new Blob([kml],{type:'application/vnd.google-earth.kml+xml'});
  const url=URL.createObjectURL(blob);
  dlBtn.disabled=false;
  dlBtn.onclick=()=>{const a=document.createElement('a');a.href=url;a.download=params.name.replace(/\\s+/g,'_')+'.kml';a.click();};
});
