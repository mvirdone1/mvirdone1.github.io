//
// Day separator plugin (ADD ONCE globally)
//

const daySeparatorPlugin = {
    id: "daySeparators",

    afterDatasetsDraw(chart) {

        const { ctx, chartArea: { top, bottom }, scales: { x } } = chart;

        const datasets = chart.data.datasets;
        if (!datasets || datasets.length === 0) return;

        const data = datasets[0].data;
        if (!data || data.length === 0) return;

        ctx.save();

        let lastDay = null;

        for (let i = 0; i < data.length; i++) {

            const point = data[i];
            const date = new Date(point.x);
            const day = date.getDate();

            if (lastDay === null) {
                lastDay = day;
                continue;
            }

            if (day !== lastDay) {

                const xPos = x.getPixelForValue(point.x);

                // vertical separator
                ctx.strokeStyle = "rgba(0,0,0,0.15)";
                ctx.lineWidth = 1;
                ctx.setLineDash([5, 5]);

                ctx.beginPath();
                ctx.moveTo(xPos, top);
                ctx.lineTo(xPos, bottom);
                ctx.stroke();

                ctx.setLineDash([]);

                // weekday label
                const weekday = date.toLocaleDateString("en-US", {
                    weekday: "short"
                });

                ctx.fillStyle = "rgba(0,0,0,0.5)";
                ctx.font = "12px sans-serif";
                ctx.fillText(weekday, xPos + 4, top + 12);

                lastDay = day;
            }
        }

        ctx.restore();
    }
};

Chart.register(daySeparatorPlugin);

//
// Weather Manager
//

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
        console.log("adding weather at " + name);
        console.log(this.charts);


        const forecast =
            await getForecastHourlyData(lat, lon);

        const locationObject = {
            name,
            lat,
            lon,
            forecast
        };

        this.locations.push(locationObject);

        this.refreshAllCharts();
        return locationObject;

    }

    getLocations() {
        return this.locations;
    }

    setLocations(locations) {
        this.locations = locations;
        this.refreshAllCharts();
    }

    removeLocationByIndex(idx) {
        this.locations =
            this.locations.splice(idx, 1);

        this.refreshAllCharts();
    }

    removeLocationByName(name) {

        this.locations =
            this.locations.filter(loc => loc.name !== name);

        this.refreshAllCharts();
    }

    buildDatasets(chart) {

        return this.locations.map(loc => {

            const points = chart.parser(loc.forecast);

            return {
                label: loc.name,

                parsing: false,
                normalized: true,

                data: points.map(p => ({
                    x: p.time,
                    y: p.value
                }))
            };

        });

    }

    refreshChart(chart) {
        console.log("Refreshing Chart");
        console.log(chart.canvasId);

        console.log("Refreshing: " + chart.chartTitle);

        const datasets = this.buildDatasets(chart);

        if (!chart.chartJs) {

            const ctx = document.getElementById(chart.canvasId);

            chart.chartJs = new Chart(ctx, {
                type: "line",

                data: {
                    datasets
                },

                options: {
                    responsive: true,

                    parsing: false,
                    normalized: true,

                    interaction: {
                        mode: "nearest",
                        intersect: false
                    },

                    scales: {
                        x: {
                            type: "time",
                            time: {
                                unit: "hour"
                            },

                            ticks: {
                                stepSize: 6,
                                autoSkip: true,
                                maxRotation: 45,
                                minRotation: 45,

                                callback: function (value) {

                                    const date = new Date(value);

                                    const h = date.getHours().toString().padStart(2, "0");
                                    const m = date.getMinutes().toString().padStart(2, "0");

                                    return `${h}:${m}`;
                                }
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
            });

        } else {

            chart.chartJs.data.datasets = datasets;
            chart.chartJs.update();

        }

        console.log(
            "Updated chart:",
            chart.chartTitle,
            "locations:",
            datasets.length,
            "points/sample:",
            datasets[0]?.data?.length
        );
    }

    refreshAllCharts() {
        this.charts.forEach(chart => this.refreshChart(chart));
    }

    //
    // PARSERS
    //

    parseTemperature(jsonData) {

        return jsonData.properties.periods.map(period => ({
            time: new Date(period.startTime).getTime(),
            value: period.temperature
        }));

    }

    parsePrecipitationProbability(jsonData) {

        return jsonData.properties.periods.map(period => ({
            time: new Date(period.startTime).getTime(),
            value: period.probabilityOfPrecipitation?.value ?? null
        }));

    }

    parseWindSpeed(jsonData) {

        return jsonData.properties.periods.map(period => ({
            time: new Date(period.startTime).getTime(),
            value: parseFloat(period.windSpeed) || null
        }));

    }
}

//
// NOAA API
//

async function getForecastHourlyUrl(lat, lon) {

    const response =
        await fetch(`https://api.weather.gov/points/${lat},${lon}`);

    if (!response.ok) {
        throw new Error(`NWS points lookup failed: ${response.status}`);
    }

    const data = await response.json();

    return data.properties.forecastHourly;
}

async function getForecastHourlyData(lat, lon) {

    const hourlyUrl =
        await getForecastHourlyUrl(lat, lon);

    const response = await fetch(hourlyUrl);

    if (!response.ok) {
        throw new Error(`Forecast fetch failed: ${response.status}`);
    }

    return response.json();
}