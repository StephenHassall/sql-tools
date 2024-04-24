/**
 * Database
 * Used to link to MySQL database and run queries. For testing only.
 */
import Process from "process";
import MySql from "mysql";

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
        Database._pool = MySql.createPool({
            connectionLimit: 10,
            host: 'localhost',
            user: Process.env.MYSQL_USER,
            password: Process.env.MYSQL_PASSWORD,
            multipleStatements: true,
            waitForConnections: false,
            timezone: 'utc',
            dateStrings: true,
            debug:  false
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
            // Get a connection from pool
            Database._pool.getConnection(function(error, connection) {
                // If error
                if (error) {
                    // If connection exists then release it
                    if (connection) connection.release();
                    
                    // Reject the promise with the error
                    reject(error);
                    
                    // Stop here
                    return;
                }
                
                // Make the query
                connection.query(sql, null, function(error, results, fields) {
                    // If error
                    if (error) {
                        // If connection exists then release it
                        connection.release();

                        // Log sql that created the error
                        console.error(sql);

                        // Reject the promise with the error
                        reject(error);

                        // Stop here
                        return;
                    }

                    // Release connection now we have finished with it
                    connection.release();

                    // Resolve promise with the results
                    resolve(results);
                });        
            });
        });

        // Return the promise
        return promise;
    }
}