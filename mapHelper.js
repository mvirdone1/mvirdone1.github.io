const STATE_ABBR = {
    "Alabama": "AL",
    "Alaska": "AK",
    "Arizona": "AZ",
    "Arkansas": "AR",
    "California": "CA",
    "Colorado": "CO",
    "Connecticut": "CT",
    "Delaware": "DE",
    "Florida": "FL",
    "Georgia": "GA",
    "Hawaii": "HI",
    "Idaho": "ID",
    "Illinois": "IL",
    "Indiana": "IN",
    "Iowa": "IA",
    "Kansas": "KS",
    "Kentucky": "KY",
    "Louisiana": "LA",
    "Maine": "ME",
    "Maryland": "MD",
    "Massachusetts": "MA",
    "Michigan": "MI",
    "Minnesota": "MN",
    "Mississippi": "MS",
    "Missouri": "MO",
    "Montana": "MT",
    "Nebraska": "NE",
    "Nevada": "NV",
    "New Hampshire": "NH",
    "New Jersey": "NJ",
    "New Mexico": "NM",
    "New York": "NY",
    "North Carolina": "NC",
    "North Dakota": "ND",
    "Ohio": "OH",
    "Oklahoma": "OK",
    "Oregon": "OR",
    "Pennsylvania": "PA",
    "Rhode Island": "RI",
    "South Carolina": "SC",
    "South Dakota": "SD",
    "Tennessee": "TN",
    "Texas": "TX",
    "Utah": "UT",
    "Vermont": "VT",
    "Virginia": "VA",
    "Washington": "WA",
    "West Virginia": "WV",
    "Wisconsin": "WI",
    "Wyoming": "WY"
};

function toStateAbbr(stateName) {

    if (!stateName) return null;

    const normalized =
        stateName
            .trim()
            .toLowerCase()
            .replace(/\b\w/g, c => c.toUpperCase());

    return STATE_ABBR[normalized] || null;
}


async function getLocationStringFromLatLon(lat, lon) {

    // https://nominatim.openstreetmap.org/reverse?lat=41.7370&lon=-111.8338&format=jsonv2

    const response =
        await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=jsonv2&zoom=12`)


    if (!response.ok) {
        throw new Error(`Nominatim location lookup failed: ${response.status}`);
    }

    const data = await response.json();

    // console.log(data);
    // console.log(data.address);

    const address = data.address;

    const place = address.city || address.town || address.hamlet || address.county;
    const state = toStateAbbr(address.state);

    const locationString = place + ", " + state

    console.log(locationString);

    return locationString;
}