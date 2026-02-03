class StravaManager {
    constructor(databaseUrl) {
        this.databaseUrl = databaseUrl
        this.activities = [];
    }

    async getMapActivities(mapBounds) {

        let north = mapBounds.north;
        let south = mapBounds.south;
        let east = mapBounds.east;
        let west = mapBounds.west;

        const sqlQuery = `SELECT
                a.Activity_ID, 
                a.Activity_Date, 
                a.Activity_Name, 
                a.Activity_Type,
                a.Elapsed_Time,
                a.Distance,
                a.Elevation_Gain 
            FROM activities a 
            JOIN bounds b ON a.activity_id = b.activity_id WHERE \
            (min_lat BETWEEN ? AND ? OR max_lat BETWEEN ? AND ?) AND \
            (min_lon BETWEEN ? AND ? OR max_lon BETWEEN ? AND ?)`;

        const params = [south, north, south, north, west, east, west, east];

        const data = await this.databaseQuery(sqlQuery, params);


        // return 0;

        /*data.forEach((row) => {
            console.log(row.Activity_ID + " - " + row.Activity_Date + " - " + row.Activity_Name + " - " + row.Activity_Type)
        });
        

        data.forEach((row) => {
            let consoleEntry = ""
            for (const [key, value] of Object.entries(row)) {
                consoleEntry += key + "=" + value + "\n";
            }
            console.log(consoleEntry);
        });

        */

        return data;

    }

    async databaseQuery(sql, params = []) {

        console.log("Checking server...");

        const response = await fetch(`${this.databaseUrl}/query`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sql, params })
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`DB query failed: ${text}`);
        }

        const data = await response.json();
        console.log("Server responded:", data);

        return data;
    }



}