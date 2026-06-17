class WeatherGovManager {
    constructor() {
        this.charts = [];

    }

    // Appends a chart with a given attribute and destination canvas to the managed list
    addChartType(attribute, canvasTitle, parser) {
        // Charts should not be added dynamically, but more done right after constructor
        // Otherwise there will need to be all sorts of syncing between the chart list and the location list

        var myChart = {
            attribute: attribute,
            canvasTitle: canvasTitle,
            parserCallback: parser,
            chartData: []
        }

        this.charts.push(myChart);
    }

    async addLocation(lat, lon, name) {

        const forecastJson = await getForecastHourlyData(lat, lon);

        this.charts.forEach(chart => {
            console.log(chart.attribute);

            chart.chartData.push(
                {
                    name: name,
                    data: chart.parserCallback(forecastJson, chart.attribute)
                });
        });


        // console.log(forecastJson);

        // console.log(parseHourlyForecast(forecastJson, "temperature"));

    }

    getCharts() {
        return this.charts;
    }

}

function parseHourlyForecastSimple(jsonData, attribute) {
    console.log(jsonData);
    return jsonData.properties.periods.map(period => ({
        time: new Date(period.startTime),
        value: period[attribute]
    }));
}

function parseHourlyForecastNested(jsonData, attribute) {
    console.log(jsonData);
    return jsonData.properties.periods.map(period => ({
        time: new Date(period.startTime),
        value: period[attribute].value
    }));
}



async function getForecastHourlyUrl(lat, lon) {
    const response = await fetch(
        `https://api.weather.gov/points/${lat},${lon}`
    );

    if (!response.ok) {
        throw new Error(
            `NWS points lookup failed: ${response.status}`
        );
    }

    const data = await response.json();

    return data.properties.forecastHourly;
}

async function getForecastHourlyData(lat, lon) {
    const gridUrl = await getForecastHourlyUrl(lat, lon);

    const response = await fetch(gridUrl);

    if (!response.ok) {
        throw new Error(`Grid fetch failed: ${response.status}`);
    }

    return response.json();
}