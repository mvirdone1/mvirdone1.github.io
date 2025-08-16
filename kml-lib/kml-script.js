  // === WGS84 constants ===
  const a = 6378137.0;           // semi-major
  const f = 1 / 298.257223563;   // flattening
  const b = a * (1 - f);         // semi-minor
  const e2 = 1 - (b*b)/(a*a);    // eccentricity^2

  function deg2rad(d){ return d * Math.PI / 180; }
  function rad2deg(r){ return r * 180 / Math.PI; }

  function latLonAltToECEF(latDeg, lonDeg, alt){
    const lat = deg2rad(latDeg); const lon = deg2rad(lonDeg);
    const sinLat = Math.sin(lat), cosLat = Math.cos(lat);
    const sinLon = Math.sin(lon), cosLon = Math.cos(lon);
    const N = a / Math.sqrt(1 - e2 * sinLat * sinLat);
    const x = (N + alt) * cosLat * cosLon;
    const y = (N + alt) * cosLat * sinLon;
    const z = (N*(1 - e2) + alt) * sinLat;
    return {x,y,z};
  }

  function ecefToLatLonAlt(x,y,z){
    // Bowring's method
    const ep2 = (a*a - b*b) / (b*b);
    const p = Math.sqrt(x*x + y*y);
    const th = Math.atan2(a * z, b * p);
    const lon = Math.atan2(y, x);
    const sinTh = Math.sin(th), cosTh = Math.cos(th);
    const lat = Math.atan2(z + ep2 * b * sinTh*sinTh*sinTh, p - e2 * a * cosTh*cosTh*cosTh);
    const sinLat = Math.sin(lat);
    const N = a / Math.sqrt(1 - e2 * sinLat * sinLat);
    const alt = p / Math.cos(lat) - N;
    return { lat: rad2deg(lat), lon: rad2deg(lon), alt };
  }

  function enuToEcef(e, n, u, lat0Deg, lon0Deg){
    const lat0 = deg2rad(lat0Deg), lon0 = deg2rad(lon0Deg);
    const sL = Math.sin(lat0), cL = Math.cos(lat0);
    const sO = Math.sin(lon0), cO = Math.cos(lon0);
    // ENU to ECEF rotation
    const x = -sO*e - sL*cO*n + cL*cO*u;
    const y =  cO*e - sL*sO*n + cL*sO*u;
    const z =           cL*n + sL*u;
    return {x,y,z};
  }

  function addVec(a,b){ return {x:a.x+b.x, y:a.y+b.y, z:a.z+b.z}; }

  function azElR_to_LLA(azDeg, elDeg, rKm, lat0, lon0, alt0){
    const r = rKm * 1000;
    const az = deg2rad(azDeg);
    const el = deg2rad(elDeg);
    // ENU components (azimuth measured from North, clockwise)
    const n = r * Math.cos(el) * Math.cos(az); // toward north
    const e = r * Math.cos(el) * Math.sin(az); // toward east
    const u = r * Math.sin(el);                // up
    const ecef0 = latLonAltToECEF(lat0, lon0, alt0);
    const de = enuToEcef(e, n, u, lat0, lon0);
    const ecef = addVec(ecef0, de);
    return ecefToLatLonAlt(ecef.x, ecef.y, ecef.z);
  }

  function clamp(v, lo, hi){ return Math.max(lo, Math.min(hi, v)); }
  function normAz(a){ a = ((a % 360) + 360) % 360; return a; }

  function buildKml(params){
    const {lat, lon, alt, azCtr, azBw, elCtr, elBw, rMin, rMax, azSteps, elSteps, name, color} = params;
    const az0 = normAz(azCtr - azBw/2), az1 = normAz(azCtr + azBw/2);
    // handle wrap-around by mapping to monotonically increasing range
    const wrap = az1 < az0; // if true, we cross 360->0
    const azStart = az0;
    const azEnd = wrap ? az1 + 360 : az1;
    const el0 = clamp(elCtr - elBw/2, -90, 90);
    const el1 = clamp(elCtr + elBw/2, -90, 90);

    const azVals = [];
    for(let i=0;i<=azSteps;i++){ azVals.push(azStart + (azEnd-azStart)*i/azSteps); }
    const elVals = [];
    for(let j=0;j<=elSteps;j++){ elVals.push(el0 + (el1-el0)*j/elSteps); }

    function cornerLLA(azDeg){
      const a = normAz(azDeg);
      return a;
    }

    function quadPolygon(coords){
      // coords: array of {lat,lon,alt} length >= 3; ensure closed
      let s = '<Polygon><altitudeMode>absolute</altitudeMode><outerBoundaryIs><LinearRing><coordinates>';
      for(const c of coords){ s += `${c.lon.toFixed(8)},${c.lat.toFixed(8)},${c.alt.toFixed(2)}\n`; }
      // close loop
      s += `${coords[0].lon.toFixed(8)},${coords[0].lat.toFixed(8)},${coords[0].alt.toFixed(2)}\n`;
      s += '</coordinates></LinearRing></outerBoundaryIs></Polygon>';
      return s;
    }

    function cellAtRange(rKm, i, j){
      // four corners across az (i->i+1) and el (j->j+1)
      const azA = azVals[i], azB = azVals[i+1];
      const elA = elVals[j], elB = elVals[j+1];
      const p1 = azElR_to_LLA(azA, elA, rKm, lat, lon, alt);
      const p2 = azElR_to_LLA(azB, elA, rKm, lat, lon, alt);
      const p3 = azElR_to_LLA(azB, elB, rKm, lat, lon, alt);
      const p4 = azElR_to_LLA(azA, elB, rKm, lat, lon, alt);
      return [p1,p2,p3,p4];
    }

    function sideStrip(isAzFixed, idx, iFrom, iTo){
      // Build quads between rMin and rMax along the index range
      // isAzFixed: if true, vary el along fixed az = azVals[idx] (or azVals[idx+1] when at upper edge)
      // if false, vary az along fixed el = elVals[idx]
      const quads = [];
      const steps = (iTo - iFrom);
      for(let k=iFrom; k< iTo; k++){
        let a1,a2,e1,e2;
        if(isAzFixed){
          const az = (idx === -1) ? azVals[0] : (idx === 9999 ? azVals[azVals.length-1] : azVals[idx]);
          a1 = a2 = az;
          e1 = elVals[k]; e2 = elVals[k+1];
        } else {
          const el = (idx === -1) ? elVals[0] : (idx === 9999 ? elVals[elVals.length-1] : elVals[idx]);
          e1 = e2 = el;
          a1 = azVals[k]; a2 = azVals[k+1];
        }
        const p1 = azElR_to_LLA(a1, e1, rMin, lat, lon, alt);
        const p2 = azElR_to_LLA(a2, e2, rMin, lat, lon, alt);
        const p3 = azElR_to_LLA(a2, e2, rMax, lat, lon, alt);
        const p4 = azElR_to_LLA(a1, e1, rMax, lat, lon, alt);
        quads.push([p1,p2,p3,p4]);
      }
      return quads;
    }

    let kml = '';
    kml += `<?xml version="1.0" encoding="UTF-8"?>\n`;
    kml += `<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2">\n`;
    kml += `<Document>\n`;
    kml += `<name>${escapeXml(name)}</name>\n`;
    kml += `<Style id="wedge"><PolyStyle><color>${color}</color><fill>1</fill><outline>0</outline></PolyStyle></Style>\n`;


    kml += `<Folder><name>${escapeXml(name)} Faces</name>\n`;

    // Caps (top and optional inner cap)
    // Top at rMax
    for(let i=0;i<azVals.length-1;i++){
      for(let j=0;j<elVals.length-1;j++){
        const quad = cellAtRange(rMax, i, j);
        kml += `<Placemark><styleUrl>#wedge</styleUrl>` + quadPolygon(quad) + `</Placemark>\n`;
      }
    }
    // Inner cap at rMin (skip if rMin == 0)
    if(rMin > 0){
      for(let i=0;i<azVals.length-1;i++){
        for(let j=0;j<elVals.length-1;j++){
          const quad = cellAtRange(rMin, i, j);
          kml += `<Placemark><styleUrl>#wedge</styleUrl>` + quadPolygon(quad) + `</Placemark>\n`;
        }
      }
    }

    // Sides (4: az=min, az=max, el=min, el=max)
    // az = min edge
    for(const quad of sideStrip(true, 0, 0, elVals.length-1)){
      kml += `<Placemark><styleUrl>#wedge</styleUrl>` + quadPolygon(quad) + `</Placemark>\n`;
    }
    // az = max edge
    for(const quad of sideStrip(true, azVals.length-1, 0, elVals.length-1)){
      kml += `<Placemark><styleUrl>#wedge</styleUrl>` + quadPolygon(quad) + `</Placemark>\n`;
    }
    // el = min edge
    for(const quad of sideStrip(false, 0, 0, azVals.length-1)){
      kml += `<Placemark><styleUrl>#wedge</styleUrl>` + quadPolygon(quad) + `</Placemark>\n`;
    }
    // el = max edge
    for(const quad of sideStrip(false, elVals.length-1, 0, azVals.length-1)){
      kml += `<Placemark><styleUrl>#wedge</styleUrl>` + quadPolygon(quad) + `</Placemark>\n`;
    }

    kml += `</Folder>\n`;
    kml += `</Document></kml>`;
    return kml;
  }

  function escapeXml(s){
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
  }

  // UI wiring
  const outEl = document.getElementById('out');
  const dlBtn = document.getElementById('download');
  const genBtn = document.getElementById('gen');
  let lastBlobUrl = null;

  genBtn.addEventListener('click', () => {
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
      azSteps: Math.max(1, parseInt(document.getElementById('azSteps').value)),
      elSteps: Math.max(1, parseInt(document.getElementById('elSteps').value)),
      name: document.getElementById('name').value || 'Antenna 3D Wedge',
      color: (document.getElementById('styleColor').value || '7dff8000').trim()
    };

    if(!(isFinite(params.lat)&&isFinite(params.lon)&&isFinite(params.alt))){
      alert('Please enter a valid antenna latitude/longitude/altitude.'); return;
    }
    if(!(isFinite(params.azCtr)&&isFinite(params.azBw)&&isFinite(params.elCtr)&&isFinite(params.elBw))){
      alert('Please enter valid pointing and beamwidth numbers.'); return;
    }
    if(!(isFinite(params.rMin)&&isFinite(params.rMax)) || params.rMax <= params.rMin){
      alert('Max range must be greater than min range.'); return;
    }

    const kml = buildKml(params);
    const head = kml.slice(0, 25000);
    outEl.textContent = head + (kml.length > head.length ? "\n… (truncated preview)" : "");

    const blob = new Blob([kml], {type:'application/vnd.google-earth.kml+xml'});
    if(lastBlobUrl) URL.revokeObjectURL(lastBlobUrl);
    lastBlobUrl = URL.createObjectURL(blob);
    dlBtn.disabled = false;
    dlBtn.onclick = () => {
      const a = document.createElement('a');
      a.href = lastBlobUrl;
      a.download = (params.name.replace(/\s+/g,'_') + '.kml');
      document.body.appendChild(a); a.click(); a.remove();
    };
  });