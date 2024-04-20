/**
 * SQL Convert
 * Used to convert values from JavaScript to SQL.
 */
import { SqlConfig, DatabaseType } from "./sql-config.js";

export class SqlConvert {
    /**
     * MySQL string regex. This is used to convert strings into SQL strings.
     */
    static _mySqlStringRegex = RegExp(
        // Null end
        '(?<nullEnd>\0)' +

        // Backspace
        '(?<backspace>\b)' +

        // Tab
        '(?<tab>\t)' +

        // New line
        '(?<newline>\n)' +

        // Carriage return
        '(?<carriageReturn>\r)' +

        // Substitute
        '(?<substitute>\x1A)' +

        // Double quotation
        '(?<doubleQuotation>\")' +

        // Single quotation
        '(?<singleQuotation>\")' +
        
        // Back slash
        '(?<backSlash>\")',

        // Global
        'g');

    /**
     * PostgreSQL string regex. This is used to convert strings into SQL strings.
     */
    static _postgreSqlStringRegex = RegExp(
        // Backspace
        '(?<backspace>\b)' +

        // Form feed
        '(?<formFeed>\f)' +

        // New line
        '(?<newline>\n)' +

        // Carriage return
        '(?<carriageReturn>\r)' +

        // Tab
        '(?<tab>\t)' +

        // Double quotation
        '(?<doubleQuotation>\")' +

        // Single quotation
        '(?<singleQuotation>\")' +
        
        // Back slash
        '(?<backSlash>\")',

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
            if (typeof value.toSql === 'function') return value.toSql();
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
        // If the date is invalid then return NULL
        if (isNaN(date.getTime()) === true) return 'NULL';

        // Get date and time values
        let year = 0;
        let month = 0;
        let day = 0;
        let hour = 0;
        let minute = 0;
        let second = 0;

        // If SQL config is not set then use the default one
        if (!sqlConfig) sqlConfig = SqlConfig.default;

        // If UTC
        if (sqlConfig.utc === true) {
            // Get UTC date and time values
            year = date.getUTCFullYear();
            month = date.getUTCMonth() + 1;
            day = date.getUTCDate();
            hour = date.getUTCHours();
            minute = date.getUTCMinutes();
            second = date.getUTCSeconds();
        } else {
            // Get local date and time values
            year = date.getFullYear();
            month = date.getMonth() + 1;
            day = date.getDate();
            hour = date.getHours();
            minute = date.getMinutes();
            second = date.getSeconds();
        }

        // Format years
        let yearText = year.toString();

        // Format months
        let monthText = month.toString();
        if (monthText.length === 1) monthText = '0' + monthText;
        
        // Format days
        let dayText = day.toString();
        if (dayText.length === 1) dayText = '0' + dayText;

        // Format hours
        let hourText = hour.toString();
        if (hourText.length === 1) hourText = '0' + hourText;

        // Format minutes
        let minuteText = minute.toString();
        if (minuteText.length === 1) minuteText = '0' + minuteText;

        // Format seconds
        let secondText = second.toString();
        if (secondText.length === 1) secondText = '0' + secondText;

        // Format SQL date time
        const sqlText = yearText + '-' + monthText + '-' + dayText + ' ' + hourText + ':' + minuteText + ':' + secondText;
        
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
        // If SQL config is not set then use the default one
        if (!sqlConfig) sqlConfig = SqlConfig.default;

        // If database is MySQL
        if (sqlConfig.databaseType === DatabaseType.MYSQL) {
            // Replace any problem characters in the string value to be used in sql
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
            // Replace any problem characters in the string value to be used in sql
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
     * Convert the buffer into a SQL string.
     * @param {Buffer} buffer The buffer to convert.
     * @param {SqlConfig} [sqlConfig] The SQL config settings to use.
     * @return {String} The buffer data in text SQL format.
     */
    static bufferToSql(buffer, sqlConfig) {
        // If SQL config is not set then use the default one
        if (!sqlConfig) sqlConfig = SqlConfig.default;

        // If database is MySQL
        if (sqlConfig.databaseType === DatabaseType.MYSQL) {
            // Return the hexadecimal value
            return 'X\'' + buffer.toString('hex') + '\'';
        }

        // If database is PostgreSQL
        if (sqlConfig.databaseType === DatabaseType.POSTGRESQL) {
            // Return the hexadecimal value
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
        // Set sql list
        const sqlList = [];

        // Add starting opening bracket
        sqlList.push('(')

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
}
