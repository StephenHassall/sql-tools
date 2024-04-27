/**
 * Database
 * Used to link to PostgreSQL database and run queries. For testing only.
 */
import Process from "process";
import PG from "pg";

export default class Database {
    /**
     * Connection connection pool.
     */
    static _pool = null;

    /**
     * Initialize the database module.
     */
    static initialize() {
        // Create connection pool
        Database._pool = new PG.Pool({
            connectionLimit: 10,
            host: 'localhost',
            database: 'sql_tools_test',
            user: Process.env.POSTGRESQL_USER,
            password: Process.env.POSTGRESQL_PASSWORD
        });
    }

    /**
     * Run a query on the database.
     * @param sql The SQL query to run.
     * @return {Promise} A promise resolving the data.
     */
    static query(sql) {
        // Create promise
        const promise = new Promise((resolve, reject) => {
            // Make the query
            Database._pool.query(sql, [], function(error, results, fields) {
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

        // Return the promise
        return promise;
    }
}