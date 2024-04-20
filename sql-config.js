/**
 * SQL Config
 * 
 * Settings that are used to control other SQL tools.
 */

/**
 * Database types
 */
export class DatabaseType {
    // Database types
    static MYSQL = 1;
    static POSTGRESQL = 2;
    static MS_SQL_SERVER = 3;
}

/**
 * SQL config
 * Used to contain the different SQL configurations that other SQL tools use.
 */
export class SqlConfig {
    /**
     * The default configuration object.
     */
    static _default = new SqlConfig();

    /**
     * Get the default SQL config settings.
     * @return {SqlConfig} The default SQL config object.
     */
    static get default() {
        // Return the default SQL config object
        return SqlConfig._default;
    }

    /**
     * Set the default SQL config settings.
     * @param {SqlConfig} value The default SQL config object.
     */
    static set default(value) {
        // Set the default SQL config settings
        SqlConfig._default = value;
    }
    
    /**
     * SQL options constructor.
     */
    constructor() {
        // Set defaults
        this._databaseType = DatabaseType.MYSQL;
        this._utc = true;
    }

    /**
     * Get the database type.
     * @return {Number} The type of database being used. See DatabaseType.xxx for options.
     */
    get databaseType() {
        // Return the type of database
        return this._databaseType;
    }

    /**
     * Set the database type this being using.
     * @param {Number} value The database type value. See DatabaseType.xxx for options.
     */
    set databaseType(value) {
        // Set the database type value
        this._databaseType = value;
    }

    /**
     * Get the UTC setting.
     * @return {Boolean} The UTC setting.
     */
    get utc() {
        // Return the utc setting
        return this._utc;
    }

    /**
     * Sets the UTC setting.
     * @param {Boolean} value The UTC setting.
     */
    set utc(value) {
        // Set UTC value
        this._utc = value;
    }
}
