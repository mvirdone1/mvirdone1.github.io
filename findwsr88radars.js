const stations = [
  {
    stationId: "PAHG",
    latitude: "60.72583",
    longitude: "-150.64861",
  },
  {
    stationId: "PABC",
    latitude: "60.79194",
    longitude: "-160.12361",
  },
  {
    stationId: "KICX",
    latitude: "37.59083",
    longitude: "-111.13806",
  },
  {
    stationId: "KLRX",
    latitude: "40.73944",
    longitude: "-115.19750",
  },
  {
    stationId: "PAPD",
    latitude: "65.03500",
    longitude: "-146.49861",
  },
  {
    stationId: "KFSX",
    latitude: "34.57417",
    longitude: "-110.80167",
  },
  {
    stationId: "KGJX",
    latitude: "39.06194",
    longitude: "-107.78639",
  },
  {
    stationId: "PHKM",
    latitude: "20.12528",
    longitude: "-154.22222",
  },
  {
    stationId: "PAKC",
    latitude: "58.67944",
    longitude: "-155.37056",
  },
  {
    stationId: "KMAX",
    latitude: "42.08111",
    longitude: "-121.28278",
  },
  {
    stationId: "PAIH",
    latitude: "59.46056",
    longitude: "-145.69667",
  },
  {
    stationId: "KMSX",
    latitude: "47.04083",
    longitude: "-112.01389",
  },
  {
    stationId: "PHMO",
    latitude: "21.13278",
    longitude: "-156.81972",
  },
  {
    stationId: "PAEC",
    latitude: "64.51139",
    longitude: "-164.70500",
  },
  {
    stationId: "KCRI",
    latitude: "35.23833",
    longitude: "-96.54000",
  },
  {
    stationId: "KRGX",
    latitude: "39.75389",
    longitude: "-118.53806",
  },
  {
    stationId: "KMTX",
    latitude: "41.26278",
    longitude: "-111.55222",
  },
  {
    stationId: "TJUA",
    latitude: "18.11556",
    longitude: "-65.92194",
  },
  {
    stationId: "PACG",
    latitude: "56.85278",
    longitude: "-134.47083",
  },
  {
    stationId: "PHKI",
    latitude: "21.89389",
    longitude: "-158.44750",
  },
  {
    stationId: "PHWA",
    latitude: "19.09500",
    longitude: "-154.43111",
  },
  {
    stationId: "KYUX",
    latitude: "32.49528",
    longitude: "-113.34333",
  },
];

function findNearestStations(lat, lon, numStations) {
  const distances = stations.map((station) => {
    const distance = calculateLatLonDistance(
      lat,
      lon,
      parseFloat(station.latitude),
      parseFloat(station.longitude)
    );

    const distance_miles = distance.miles;
    return { ...station, distance_miles };
  });

  distances.sort((a, b) => a.distance_miles - b.distance_miles);

  return distances.slice(0, numStations).map((station) => ({
    stationId: station.stationId,
    latitude: station.latitude,
    longitude: station.longitude,
    distance: station.distance_miles.toFixed(2), // Optional: to round the distance
  }));
}
