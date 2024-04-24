/**
 * SQL Convert
 * Used to convert values from JavaScript to SQL.
 */
import { Buffer } from 'node:buffer';
import { SqlConfig, DatabaseType } from "./sql-config.js";

export class SqlConvert {
    /**
     * MySQL string regex. This is used to convert strings into SQL strings.
     */
    static _mySqlStringRegex = RegExp(
        // Null end
        '(?<nullEnd>\0)|' +

        // Backspace
        '(?<backspace>\b)|' +

        // Tab
        '(?<tab>\t)|' +

        // New line
        '(?<newline>\n)|' +

        // Carriage return
        '(?<carriageReturn>\r)|' + 

        // Substitute
        '(?<substitute>\x1A)|' +

        // Double quotation
        '(?<doubleQuotation>\")|' + 

        // Single quotation
        '(?<singleQuotation>\')|' +
        
        // Back slash
        '(?<backSlash>\\\\)',

        // Global
        'g');

    /**
     * PostgreSQL string regex. This is used to convert strings into SQL strings.
     */
    static _postgreSqlStringRegex = RegExp(
        // Backspace
        '(?<backspace>\b)|' +

        // Form feed
        '(?<formFeed>\f)|' +

        // New line
        '(?<newline>\n)|' +

        // Carriage return
        '(?<carriageReturn>\r)|' +

        // Tab
        '(?<tab>\t)|' +

        // Double quotation
        '(?<doubleQuotation>\")|' +

        // Single quotation
        '(?<singleQuotation>\')|' +
        
        // Back slash
        '(?<backSlash>\\\\)',

        // Global
        'g');

    /**
     * MySQL identifier regex. This is used to convert identifiers into SQL strings.
     */
    static _mySqlIdentifierRegex = RegExp(
        // Grave accent
        '(?<graveAccent>`)',

        // Global
        'g');

    /**
     * PostgreSQL identifier regex. This is used to convert identifiers into SQL strings.
     */
    static _postgreSqlIdentifierRegex = RegExp(
        // Double quotation
        '(?<doubleQuotation>\")',

        // Global
        'g');

    /**
     * MySQL JSON regex. This is used to convert json into SQL strings.
     */
    static _mySqlJsonRegex = RegExp(
        // Single quotation
        '(?<singleQuotation>\')|' +

        // Back slash
        '(?<backSlash>\\\\)',

        // Global
        'g');

    /**
     * PostgreSQL JSON regex. This is used to convert JSON into SQL strings.
     */
    static _postgreSqlJsonRegex = RegExp(
        // Single quotation
        '(?<singleQuotation>\')',
        
        // Global
        'g');

    /**
     * Convert the given value, which could be any type, into the SQL text value.
     * @param {*} value A value of an unknown type.
     * @param {SqlConfig} [sqlConfig] The SQL config settings to use.
     * @return {String} The SQL text.
     */
    static valueToSql(value, sqlConfig) {
        // If undefined
        if (value === undefined) return 'NULL';

        // If null
        if (value === null) return 'NULL';

        // If number
        if (typeof value === 'number') return value.toString();

        // If boolean
        else if (typeof value === 'boolean') {
            if (value === true) return 'TRUE';
            if (value === false) return 'FALSE';
        }

        // If string
        else if (typeof value === 'string') return SqlConvert.stringToSql(value, sqlConfig);

        // If object
        else if (typeof value === 'object') {
            // If date
            if (value instanceof Date) return SqlConvert.dateToSql(value, sqlConfig);
            
            // If buffer
            if (value instanceof Buffer) return SqlConvert.bufferToSql(value, sqlConfig);

            // Array
            if (value instanceof Array) return SqlConvert.arrayToSql(value, sqlConfig);

            // If toSql function exists then call it
            if (typeof value.toSql === 'function') return value.toSql(sqlConfig);
        }

        // Unknown object, therefore return empty string
        return '';
    }

    /**
     * Convert the date and time into an SQL text format. Format is YYYY-MM-DD HH:MM:SS.
     * @param {Date} date The date object to convert.
     * @param {SqlConfig} [sqlConfig] The SQL config settings to use.
     * @return {String} The date in SQL text format.
     */
    static dateToSql(date, sqlConfig) {
        // Make sure the date is a date object
        if (typeof date !== 'object' || !(date instanceof Date)) throw new Error('Invalid date');

        // If SQL config is not set then use the default one
        if (!sqlConfig) sqlConfig = SqlConfig.default;

        // If the date is invalid then return NULL
        if (isNaN(date.getTime()) === true) return 'NULL';

        // Get date and time values
        let year = 0;
        let month = 0;
        let day = 0;
        let hour = 0;
        let minute = 0;
        let second = 0;
        let millisecond = 0;

        // If UTC
        if (sqlConfig.utc === true) {
            // Get UTC date and time values
            year = date.getUTCFullYear();
            month = date.getUTCMonth() + 1;
            day = date.getUTCDate();
            hour = date.getUTCHours();
            minute = date.getUTCMinutes();
            second = date.getUTCSeconds();
            millisecond = date.getUTCMilliseconds();
        } else {
            // Get local date and time values
            year = date.getFullYear();
            month = date.getMonth() + 1;
            day = date.getDate();
            hour = date.getHours();
            minute = date.getMinutes();
            second = date.getSeconds();
            millisecond = date.getMilliseconds();
        }

        // Format parts
        const yearText = year.toString();
        const monthText = month.toString().padStart(2, '0');
        const dayText = day.toString().padStart(2, '0');
        const hourText = hour.toString().padStart(2, '0');
        const minuteText = minute.toString().padStart(2, '0');
        const secondText = second.toString().padStart(2, '0');

        // Check milliseconds
        let millisecondText = '';
        if (millisecond !== 0) {
            // Set millisecond text
            millisecondText = '.' + millisecond.toString().padStart(3, '0');
        }

        // Format SQL date time
        const sqlText =
            '\'' + yearText + '-' + monthText + '-' + dayText +
            ' ' + hourText + ':' + minuteText + ':' + secondText +
            millisecondText + '\'';
        
        // Return formatted SQL date time
        return sqlText;
    }

    /**
     * Convert the string of text into a SQL string. This checks for escape characters
     * and adds "quotation marks".
     * @param {String} value The string that needs checking and converting.
     * @param {SqlConfig} [sqlConfig] The SQL config settings to use.
     * @return {String} The string that is safe to use as SQL text.
     */
    static stringToSql(value, sqlConfig) {
        // Make sure value is a string
        if (typeof value !== 'string') throw new Error('Invalid value');

        // If SQL config is not set then use the default one
        if (!sqlConfig) sqlConfig = SqlConfig.default;

        // If database is MySQL
        if (sqlConfig.databaseType === DatabaseType.MYSQL) {
            // Replace any problem characters in the string value to be used in SQL
            const sql = value.replace(
                SqlConvert._mySqlStringRegex,
                (
                    fullMatch,
                    nullEnd,
                    backspace,
                    tab,
                    newline,
                    carriageReturn,
                    substitute,
                    doubleQuotation,
                    singleQuotation,
                    backSlash) => {
                    // Check match and return SQL response
                    if (nullEnd) return '\\0';
                    if (backspace) return '\\b';
                    if (tab) return '\\t';
                    if (newline) return '\\n';
                    if (carriageReturn) return '\\r';
                    if (substitute) return '\\Z';
                    if (doubleQuotation) return '\\"';
                    if (singleQuotation) return '\\\'';
                    if (backSlash) return '\\\\';
                    return fullMatch;
                }
            );

            // Return the SQL text within single quotation marks
            return '\'' + sql + '\'';
        }

        // If database is PostgreSQL
        if (sqlConfig.databaseType === DatabaseType.POSTGRESQL) {
            // Replace any problem characters in the string value to be used in SQL
            const sql = value.replace(
                SqlConvert._postgreSqlStringRegex,
                (
                    fullMatch,
                    backspace,
                    formFeed,
                    newline,
                    carriageReturn,
                    tab,
                    doubleQuotation,
                    singleQuotation,
                    backSlash) => {
                    // Check match and return SQL response
                    if (backspace) return '\\b';
                    if (formFeed) return '\\f';
                    if (newline) return '\\n';
                    if (carriageReturn) return '\\r';
                    if (tab) return '\\t';
                    if (doubleQuotation) return '\\"';
                    if (singleQuotation) return '\\\'';
                    if (backSlash) return '\\\\';
                    return fullMatch;
                }
            );

            // Return the SQL text within an E and single quotation marks
            return 'E\'' + sql + '\'';
        }
    }

    /**
     * Convert the identifier into a SQL string. An identifier is a database, table, field object name.
     * @param {String} value The name of the identifier.
     * @param {SqlConfig} [sqlConfig] The SQL config settings to use.
     * @return {String} The identifier that is safe to use as SQL text.
     */
    static identifierToSql(value, sqlConfig) {
        // Make sure value is a string
        if (typeof value !== 'string') throw new Error('Invalid value');

        // If SQL config is not set then use the default one
        if (!sqlConfig) sqlConfig = SqlConfig.default;

        // If database is MySQL
        if (sqlConfig.databaseType === DatabaseType.MYSQL) {
            // Replace any problem characters in the string value to be used in SQL
            const sql = value.replace(
                SqlConvert._mySqlIdentifierRegex,
                (
                    fullMatch,
                    graveAccent) => {
                    // Check match and return SQL response
                    if (graveAccent) return '``';
                    return fullMatch;
                }
            );

            // Return the SQL text within grave accent quote characters
            return '`' + sql + '`';
        }

        // If database is PostgreSQL
        if (sqlConfig.databaseType === DatabaseType.POSTGRESQL) {
            // Replace any problem characters in the string value to be used in SQL
            const sql = value.replace(
                SqlConvert._postgreSqlIdentifierRegex,
                (
                    fullMatch,
                    doubleQuotation) => {
                    // Check match and return SQL response
                    if (doubleQuotation) return '\"\"';
                    return fullMatch;
                }
            );

            // Return the SQL identifier within double quotation marks
            return '\"' + sql + '\"';
        }
    }

    /**
     * Convert the buffer into a SQL string.
     * @param {Buffer} buffer The buffer to convert.
     * @param {SqlConfig} [sqlConfig] The SQL config settings to use.
     * @return {String} The buffer data in text SQL format.
     */
    static bufferToSql(buffer, sqlConfig) {
        // Make sure the buffer parameter is a buffer
        if (typeof buffer !== 'object' || !(buffer instanceof Buffer)) throw new Error('Invalid buffer');

        // If SQL config is not set then use the default one
        if (!sqlConfig) sqlConfig = SqlConfig.default;

        // If database is MySQL
        if (sqlConfig.databaseType === DatabaseType.MYSQL) {
            // Return the hexadecimal SQL text
            return 'X\'' + buffer.toString('hex') + '\'';
        }

        // If database is PostgreSQL
        if (sqlConfig.databaseType === DatabaseType.POSTGRESQL) {
            // Return the hexadecimal SQL text
            return '\'\\x' + buffer.toString('hex') + '\'';
        }
    }

    /**
     * Convert the array into multiple (...) SQL parts.
     * @param {Array} array The array of things to convert to SQL.
     * @param {SqlConfig} [sqlConfig] The SQL config settings to use.
     * @return {String} The array of things in a text SQL format.
     */
    static arrayToSql(array, sqlConfig) {
        // Make sure the value is an array
        if (typeof array !== 'object' || !(array instanceof Array)) throw new Error('Invalid array');

        // Set sql list
        const sqlList = [];

        // For each array value
        for (let index = 0; index < array.length; index++) {
            // Get value
            const value = array[index];

            // If not the first value in the list then add , character
            if (index !== 0) sqlList.push(', ');

            // If value is a sub-array
            if (Array.isArray(value) === true) {
                // Add opening bracket
                sqlList.push('(');

                // Add sub-array to SQL
                sqlList.push(SqlConvert.arrayToSql(value));

                // Add closing bracket
                sqlList.push(')');

                // Move on to next value
                continue;
            }

            // Add value
            sqlList.push(SqlConvert.valueToSql(value, sqlConfig));
        };

        // Put together the array SQL
        const sql = sqlList.join('');

        // Return the sql text
        return sql;
    }

    /**
     * Convert the object into a SQL JSON string.
     * @param {Object} object The object to convert to JSON SQL.
     * @param {SqlConfig} [sqlConfig] The SQL config settings to use.
     * @return {String} The object as JSON SQL text.
     */
    static jsonToSql(object, sqlConfig) {
        // Convert the object into a JSON strng
        const json = JSON.stringify(object);

        // If database is MySQL
        if (sqlConfig.databaseType === DatabaseType.MYSQL) {
            // Replace any problem characters in the string value to be used in SQL
            const sql = json.replace(
                SqlConvert._mySqlJsonRegex,
                (
                    fullMatch,
                    singleQuotation,
                    backSlash) => {
                    // Check match and return SQL response
                    if (singleQuotation) return '\\\'';
                    if (backSlash) return '\\\\';
                    return fullMatch;
                }
            );

            // Return the SQL text within single quotation marks
            return '\'' + sql + '\'';
        }

        // If database is PostgreSQL
        if (sqlConfig.databaseType === DatabaseType.POSTGRESQL) {
            // Replace any problem characters in the string value to be used in SQL
            const sql = json.replace(
                SqlConvert._postgreSqlJsonRegex,
                (
                    fullMatch,
                    singleQuotation) => {
                    // Check match and return SQL response
                    if (singleQuotation) return '\\\'';
                    return fullMatch;
                }
            );

            // Return the SQL text within an E and single quotation marks
            return 'E\'' + sql + '\'';
        }
    }
}

/**
 * SQL Indentifier.
 * Used to add an identifier value that will be converted into a SQL safe string value.
 */
export class SqlIdentifier {
    /**
     * SQL indentifier constructor.
     * @param {String} identifier The identifier that will be added to the SQL.
     */
    constructor(identifier) {
        // Set identifier value
        this._identifier = identifier;
    }

    /**
     * Convert the object value into safe SQL string.
     * @param {SqlConfig} [sqlConfig] The SQL config settings to use.
     * @return {String} The identifier as safe SQL text.
     */
    toSql(sqlConfig) {
        // Convert and return the identifier
        return SqlConvert.identifierToSql(this._identifier, sqlConfig);
    }
}

/**
 * SQL Trusted.
 * Used to add a trusted value into a SQL string.
 * DO NOT use this will untrusted data (from the user, API, not hard coded).
 */
export class SqlTrusted {
    /**
     * SQL trusted constructor.
     * @param {any} value The value that will be added to the SQL.
     */
    constructor(value) {
        // Set value
        this._value = value;
    }

    /**
     * Convert the object value into safe SQL string.
     * @param {SqlConfig} [sqlConfig] The SQL config settings to use.
     * @return {String} The identifier as safe SQL text.
     */
    toSql(sqlConfig) {
        // Convert and return the value into a string
        return this._value.toString();
    }
}

/**
 * SQL JSON
 * Used to add an object with properties as a JSON string that is SQL safe.
 */
export class SqlJson {
    /**
     * SQL JSON constructor.
     * @param {Object|Array} value The value that will be converted into a JSON string and added to the SQL.
     */
    constructor(value) {
        // Set value
        this._value = value;
    }

    /**
     * Convert the object as a JSON string into a safe SQL string.
     * @param {SqlConfig} [sqlConfig] The SQL config settings to use.
     * @return {String} The JSON string as safe SQL text.
     */
    toSql(sqlConfig) {
        // Check valid value
        if (this._value === undefined ||
            this._value === null ||
            typeof this._value !== 'object') throw new Error('Invalid value');

        //return '\'' + SqlConvert.stringToSql(JSON.stringify(this._value)) + '\'';

        // Convert the object into JSON
        //const json = this._convertObjectToSql(this._value);

        // Return the JSON in a string
        //return '\'' + json + '\'';

        return SqlConvert.jsonToSql(this._value, sqlConfig);
    }

    /**
     * Convert the given object into a SQL safe text.
     * @param {Object|Array} object The object or array to convert.
     * @param {SqlConfig} [sqlConfig] The SQL config settings to use.
     * @return {String} The converted SQL text.
     */
    _convertObjectToSql(object, sqlConfig) {
        // Set SQL list
        const sqlList = [];

        // If array
        if (object instanceof Array) {
            // Add starting [ character
            sqlList.push('[');
        } else {
            // Add starting { character
            sqlList.push('{');
        }

        // Get list of keys
        const keyList = Object.keys(object);

        // For each key
        for (let index = 0; index < keyList.length; index++) {
            // Get key
            const key = keyList[index];

            // If not the first value in the list then add , character
            if (index !== 0) sqlList.push(',');

            // Add key name
            sqlList.push('\"');
            sqlList.push(key);
            sqlList.push('\":');

            // Get value
            const value = object[key];

            // If toSql function exists then call it
            if (typeof value.toSql === 'function') {
                // Add the convert the value
                sqlList.push(value.toSql(sqlConfig));

                // Move on to the next key
                continue;
            }

            // If not an object
            if (typeof value !== "object") {
                // Add the convert of the value
                sqlList.push(SqlConvert.valueToSql(value, sqlConfig));

                // Move on to the next key
                continue;
            }

            // If one of the objects we can convert
            if (value instanceof Date ||
                value instanceof Buffer ||
                value instanceof Array) {
                // Add the convert of the value
                sqlList.push(SqlConvert.valueToSql(value, sqlConfig));

                // Move on to the next key
                continue;
            }

            // Otherwise we need to add this whole object
            this._convertObjectToSql(object, sqlConfig);
        }

        // If array
        if (object instanceof Array) {
            // Add ending ] character
            sqlList.push(']');
        } else {
            // Add starting } character
            sqlList.push('}');
        }

        // Join and return SQL list
        return sqlList.join('');
    }
}
