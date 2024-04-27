/**
 * Database
 * Used to link to MS SQL Server database and run queries. For testing only.
 */
import Process from "process";
import MsSql from "mssql";

export default class Database {
    /**
     * Connect config information.
     */
    static _connectConfig = undefined;

    /**
     * Initialize the database module.
     */
    static initialize() {
        // Create connect config information
        Database._connectConfig = {
            server: 'localhost',
            database: 'sql_tools_test',
            user: Process.env.MS_SQL_SERVER_USER,
            password: Process.env.MS_SQL_SERVER_PASSWORD,
            options: {
                encrypt: false
            }
        };
    }

    /**
     * Run a query on the database.
     * @param sql The SQL query to run.
     * @return {Promise} A promise resolving the data.
     */
    static query(sql) {
        // Create promise
        const promise = new Promise((resolve, reject) => {
            // Make a connection to the database (this is using a global pool)
            MsSql.connect(Database._connectConfig, function (error) {
                // If error
                if (error) {
                    // Reject the promise with the error
                    reject(error);
                    
                    // Stop here
                    return;
                }

                // Create request
                const request = new MsSql.Request();
    
                // Run query
                request.query(sql, function (error, results) {
                    // If error
                    if (error) {
                        // Log sql that created the error
                        console.error(sql);

                        // Reject the promise with the error
                        reject(error);

                        // Stop here
                        return;
                    }
    
                    // Resolve promise with the results
                    resolve(results);
                });
            });
        });

        // Return the promise
        return promise;
    }
}