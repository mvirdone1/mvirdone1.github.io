class WeatherGovManager {

    constructor() {

        this.locations = [];

        this.charts = [];

    }

    addChartType(canvasId, chartTitle, parser) {

        this.charts.push({
            canvasId,
            chartTitle,
            parser,
            chartJs: null
        });

    }

    async addLocation(name, lat, lon) {

        const forecast =
            await getForecastHourlyData(
                lat,
                lon
            );

        this.locations.push({
            name,
            lat,
            lon,
            forecast
        });

        this.refreshAllCharts();

    }

    removeLocation(name) {

        this.locations =
            this.locations.filter(
                loc => loc.name !== name
            );

        this.refreshAllCharts();

    }

    buildDatasets(chart) {

        return this.locations.map(loc => ({

            label: loc.name,

            data:
                chart.parser(loc.forecast)
                    .map(point => ({
                        x: point.time,
                        y: point.value
                    }))

        }));

    }

    refreshChart(chart) {

        const datasets =
            this.buildDatasets(chart);

        // console.log(datasets);

        if (!chart.chartJs) {

            chart.chartJs =
                new Chart(
                    document.getElementById(
                        chart.canvasId
                    ),
                    {
                        type: "line",

                        data: {
                            datasets
                        },

                        options: {

                            responsive: true,

                            parsing: false,

                            interaction: {
                                mode: "nearest",
                                intersect: false
                            },

                            scales: {

                                x: {
                                    type: "time",
                                    time: {
                                        unit: "hour"
                                    }
                                }

                            },

                            plugins: {

                                title: {
                                    display: true,
                                    text: chart.chartTitle
                                }

                            }

                        }

                    }
                );


        } else {

            chart.chartJs.data.datasets =
                datasets;

            chart.chartJs.update();

        }
        console.log(chart.chartJs.data.datasets);

    }

    refreshAllCharts() {

        this.charts.forEach(chart => {
            this.refreshChart(chart);
        });

    }

    //
    // PARSERS
    //

    parseTemperature(jsonData) {

        return jsonData.properties.periods.map(
            period => ({
                time: new Date(
                    period.startTime
                ),
                value: period.temperature
            })
        );

    }

    parsePrecipitationProbability(
        jsonData
    ) {

        return jsonData.properties.periods.map(
            period => ({
                time: new Date(
                    period.startTime
                ),
                value:
                    period
                        .probabilityOfPrecipitation
                        ?.value ?? null
            })
        );

    }

    parseWindSpeed(jsonData) {

        return jsonData.properties.periods.map(
            period => ({
                time: new Date(
                    period.startTime
                ),
                value:
                    parseFloat(
                        period.windSpeed
                    ) || null
            })
        );

    }

}

//
// NOAA API
//

async function getForecastHourlyUrl(
    lat,
    lon
) {

    const response =
        await fetch(
            `https://api.weather.gov/points/${lat},${lon}`
        );

    if (!response.ok) {

        throw new Error(
            `NWS points lookup failed: ${response.status}`
        );

    }

    const data =
        await response.json();

    return data.properties
        .forecastHourly;

}

async function getForecastHourlyData(
    lat,
    lon
) {

    const hourlyUrl =
        await getForecastHourlyUrl(
            lat,
            lon
        );

    const response =
        await fetch(hourlyUrl);

    if (!response.ok) {

        throw new Error(
            `Forecast fetch failed: ${response.status}`
        );

    }

    return response.json();

}