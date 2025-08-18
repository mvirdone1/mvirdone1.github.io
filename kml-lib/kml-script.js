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
    const wrap = az1 < az0; 
    const azStart = az0;
    const azEnd = wrap ? az1 + 360 : az1;
    const el0 = clamp(elCtr - elBw/2, -90, 90);
    const el1 = clamp(elCtr + elBw/2, -90, 90);
  
    const azVals = [];
    for(let i=0;i<=azSteps;i++){ azVals.push(azStart + (azEnd-azStart)*i/azSteps); }
    const elVals = [];
    for(let j=0;j<=elSteps;j++){ elVals.push(el0 + (el1-el0)*j/elSteps); }
  
    // Origin point
    const origin = {lon, lat, alt};
  
    let kml = '';
    kml += `<?xml version="1.0" encoding="UTF-8"?>\n`;
    kml += `<kml xmlns="http://www.opengis.net/kml/2.2">\n`;
    kml += `<Document>\n`;
    kml += `<name>${escapeXml(name)}</name>\n`;
    kml += `<Style id="wedge"><PolyStyle><color>${color}</color><fill>1</fill><outline>0</outline></PolyStyle></Style>\n`;
  
    // One Placemark = one polygon covering entire wedge
    kml += `<Placemark><styleUrl>#wedge</styleUrl>`;
    kml += `<Polygon><altitudeMode>absolute</altitudeMode><outerBoundaryIs><LinearRing><coordinates>\n`;
  
    // Start at origin
    kml += `${origin.lon},${origin.lat},${origin.alt}\n`;
  
    // Sweep around outer arc: all (az, el1) then (az, el0)
    for (let i = 0; i < azVals.length; i++) {
      const az = azVals[i];
      const pt = azElR_to_LLA(az, el1, rMax, lat, lon, alt);
      kml += `${pt.lon},${pt.lat},${pt.alt}\n`;
    }
    for (let i = azVals.length-1; i >= 0; i--) {
      const az = azVals[i];
      const pt = azElR_to_LLA(az, el0, rMax, lat, lon, alt);
      kml += `${pt.lon},${pt.lat},${pt.alt}\n`;
    }
  
    // Back to origin to close
    kml += `${origin.lon},${origin.lat},${origin.alt}\n`;
  
    kml += `</coordinates></LinearRing></outerBoundaryIs></Polygon>`;
    kml += `</Placemark>\n`;
  
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