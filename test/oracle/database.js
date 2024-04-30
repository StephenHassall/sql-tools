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
     * 
     * We need to do the following.
     *   connection = getConnection(...);
     *   result = connection.execute(one command at once, no ; character on the end)
     *   connection.commit()
     *   connecion.close()
     *   
     * @param sql The SQL query to run.
     * @return {Promise} A promise resolving the data.
     */
    static async query(sql) {
        // Create result list
        const resultList = [];

        // Split the SQL into an execute SQL list
        const executeSqlList = sql.split(';');

        // Set connection
        let connection = null;

        // Set execute SQL
        let executeSql = '';

        // Set select options
        const options = { outFormat: OracleDb.OUT_FORMAT_OBJECT };

        try {
            // Make connection
            connection = await OracleDb.getConnection(Database._connectConfig);

            // For each execute SQL to run
            for (let index = 0; index < executeSqlList.length; index++) {
                // Get execute SQL
                executeSql = executeSqlList[index];

                // Trim
                executeSql = executeSql.trim();

                // If empty then skip
                if (executeSql.length === 0) continue;

                // If select command
                if (executeSql.toLowerCase().startsWith('select') === true) {
                    // Execute the SQL
                    const result = await connection.execute(executeSql, [], options);

                    // Add result to the list
                    resultList.push(result);
                } else {
                    // Execute the SQL
                    await connection.execute(executeSql);
                }
            };

            // Commit the changes
            await connection.commit();
        } catch (error) {
            // Log sql that created the error
            console.error(executeSql);

            // Log the error
            console.error(error);
        } finally {
            // If the connection exists
            if (connection !== null) {
                // Close the connection
                await connection.close();
            }

            // Return the result list
            return resultList;
        }
    }
}