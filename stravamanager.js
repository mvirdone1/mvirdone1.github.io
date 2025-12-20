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
                a.Activity_Date, 
                a.Activity_Name, 
                a.Activity_Type 
            FROM activities a 
            JOIN bounds b ON a.activity_id = b.activity_id WHERE \
            (min_lat BETWEEN ? AND ? OR max_lat BETWEEN ? AND ?) AND \
            (min_lon BETWEEN ? AND ? OR max_lon BETWEEN ? AND ?)`;

        const params = [south, north, south, north, west, east, west, east];

        /*
        const response = await fetch("http://127.0.0.1:3000/query", {
            method: "POST",
            headers: { "Content-Type": "application/json" },

            body: JSON.stringify({
                sql: sqlQuery,
                params: params,
            }),


        });

        const data = await response.json();

        */


        const data = await this.databaseQuery(sqlQuery, params);


        // return 0;

        data.forEach((row) => {
            console.log(row.Activity_Date + " - " + row.Activity_Name + " - " + row.Activity_Type)
        });

        return 0;

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