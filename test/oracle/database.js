/**
 * Database
 * Used to link to Oracle database and run queries. For testing only.
 */
import Process from "process";
import OracleDb from "oracledb";

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
            user: Process.env.ORACLE_USER,
            password: Process.env.ORACLE_PASSWORD,
            connectionString: Process.env.ORACLE_CONNECTION_STRING
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
            // Make a connection to the database
            OracleDb.getConnection(Database._connectConfig, function (error, connection) {
                // If error
                if (error) {
                    // Reject the promise with the error
                    reject(error);
                    
                    // Stop here
                    return;
                }

                // Execute SQL statement
                connection.execute(sql, function (error, results) {
                    // If error
                    if (error) {
                        // Close connection
                        connection.close();

                        // Reject the promise with the error
                        reject(error);

                        // Stop here
                        return;
                    }

                    // Resolve promise with the results
                    resolve(results);

                    // Close connection
                    connection.close();
                });
            });
        });

        // Return the promise
        return promise;
    }
}