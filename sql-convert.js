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
     * Microsoft SQL server string regex. This is used to convert strings into SQL strings.
     */
    static _msSqlServerStringRegex = RegExp(
        // Single quotation
        '(?<singleQuotation>\')',

        // Global
        'g');

    /**
     * Oracle string regex. This is used to convert strings into SQL strings.
     */
    static _oracleStringRegex = RegExp(
        // Single quotation
        '(?<singleQuotation>\')|' +

        // New line
        '(?<newline>\n)|' +

        // Carriage return
        '(?<carriageReturn>\r)', 

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
        '(?<singleQuotation>\')|' +
        
       // Back slash
       '(?<backSlash>\\\\)',
        
        // Global
        'g');

    /**
     * Microsoft SQL Server JSON regex. This is used to convert JSON into SQL strings.
     */
    static _msSqlServerJsonRegex = RegExp(
        // Single quotation
        '(?<singleQuotation>\')',
        
        // Global
        'g');

    /**
     * Oracle JSON regex. This is used to convert JSON into SQL strings.
     */
    static _oracleJsonRegex = RegExp(
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
        else if (value === null) return 'NULL';

        // If number
        else if (typeof value === 'number') return value.toString();

        // If boolean
        else if (typeof value === 'boolean') return SqlConvert.booleanToSql(value, sqlConfig);

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
     * Convert the boolean into an SQL text format.
     * @param {Boolean} value The boolean value to convert.
     * @param {SqlConfig} [sqlConfig] The SQL config settings to use.
     * @return {String} The boolean in SQL text format.
     */
    static booleanToSql(value, sqlConfig) {
        // Make sure the value is a boolean
        if (typeof value !== 'boolean') throw new Error('Invalid value');

        // If SQL config is not set then use the default one
        if (!sqlConfig) sqlConfig = SqlConfig.default;

        // If database is Microsoft SQL Server
        if (sqlConfig.databaseType === DatabaseType.MS_SQL_SERVER) {
            // Check value and return resut
            if (value === true) return '1';
            if (value === false) return '0';
        }

        // If database is Oracle
        if (sqlConfig.databaseType === DatabaseType.ORACLE) {
            // Check value and return resut
            if (value === true) return '1';
            if (value === false) return '0';
        }

        // If true then return TRUE
        if (value === true) return 'TRUE';

        // Otherwise return FALSE
        return 'FALSE';
    }

    /**
     * Convert the date and time into an SQL text format.
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

        // Convert the date into SQL text
        const sqlDateText = SqlConvert._convertDateToSql(date, sqlConfig);

        // If database is Oracle
        if (sqlConfig.databaseType === DatabaseType.ORACLE) {
            // Only include the date part, suround with single quotation marks and prefix with DATE keyword, 
            const sqlText = 'DATE ' + '\'' + sqlDateText.substring(0, 10) + '\'';

            // Return formatted SQL date time
            return sqlText;
        }

        // Add single quotation marks
        const sqlText ='\'' + sqlDateText + '\'';
        
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

        // Convert value into SQL text
        const sql = SqlConvert._convertStringToSql(value, sqlConfig);

        // If database is MySQL
        if (sqlConfig.databaseType === DatabaseType.MYSQL) {
            // Return the SQL text within single quotation marks
            return '\'' + sql + '\'';
        }

        // If database is PostgreSQL
        if (sqlConfig.databaseType === DatabaseType.POSTGRESQL) {
            // Return the SQL text within an E and single quotation marks
            return 'E\'' + sql + '\'';
        }

        // If database is Microsoft SQL Server
        if (sqlConfig.databaseType === DatabaseType.MS_SQL_SERVER) {
            // Return the SQL text within an N and single quotation marks
            return 'N\'' + sql + '\'';
        }

        // If database is Oracle
        if (sqlConfig.databaseType === DatabaseType.ORACLE) {
            // Return the SQL text within an N and single quotation marks
            return 'N\'' + sql + '\'';
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

        // If database is Microsoft SQL Server
        if (sqlConfig.databaseType === DatabaseType.MS_SQL_SERVER) {
            // Check for the "]" character
            if (value.indexOf(']') !== -1) throw new Error('Invalid value. Contains "]" character');

            // Return the value as it is with [...] square brackets
            return '[' + value + ']';
        }

        // If database is Oracle
        if (sqlConfig.databaseType === DatabaseType.ORACLE) {
            // Check for the " character
            if (value.indexOf('"') !== -1) throw new Error('Invalid value. Contains " character');

            // Return the value as it is with "..." double quotation marks
            return '"' + value + '"';
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

        // If database is Microsoft SQL Server
        if (sqlConfig.databaseType === DatabaseType.MS_SQL_SERVER) {
            // Return the hexadecimal SQL text
            return '0x' + buffer.toString('hex');
        }

        // If database is Oracle
        if (sqlConfig.databaseType === DatabaseType.ORACLE) {
            // Return the hexadecimal SQL text
            return 'HEXTORAW(\'' + buffer.toString('hex') + '\')';
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

        // If SQL config is not set then use the default one
        if (!sqlConfig) sqlConfig = SqlConfig.default;

        // Convert the array into SQL text
        const sql = SqlConvert._convertArrayToSql(array, sqlConfig);

        // If database is MySQL
        if (sqlConfig.databaseType === DatabaseType.MYSQL) {
            // Return the SQL text within single quotation marks
            return '\'' + sql + '\'';
        }

        // If database is PostgreSQL
        if (sqlConfig.databaseType === DatabaseType.POSTGRESQL) {
            // Return the SQL text within an E, single quotation marks and {...} characters
            return 'E\'{' + sql + '}\'';
        }

        // If database is Microsoft SQL Server
        if (sqlConfig.databaseType === DatabaseType.MS_SQL_SERVER) {
            // Return the SQL text within an N and single quotation marks
            return 'N\'' + sql + '\'';
        }

        // If database is Oracle
        if (sqlConfig.databaseType === DatabaseType.ORACLE) {
            // Return the SQL text within an N and single quotation marks
            return 'N\'' + sql + '\'';
        }

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
                    singleQuotation,
                    backSlash) => {
                    // Check match and return SQL response
                    if (singleQuotation) return '\\\'';
                    if (backSlash) return '\\\\';
                    return fullMatch;
                }
            );

            // Return the SQL text within an E and single quotation marks
            return 'E\'' + sql + '\'';
        }

        // If database is Microsoft SQL Server
        if (sqlConfig.databaseType === DatabaseType.MS_SQL_SERVER) {
            // Replace any problem characters in the string value to be used in SQL
            const sql = json.replace(
                SqlConvert._mySqlJsonRegex,
                (
                    fullMatch,
                    singleQuotation) => {
                    // Check match and return SQL response
                    if (singleQuotation) return '\'\'';
                    return fullMatch;
                }
            );

            // Return the SQL text within a N (for unicode) and single quotation marks
            return 'N\'' + sql + '\'';
        }

        // If database is Oracle
        if (sqlConfig.databaseType === DatabaseType.ORACLE) {
            // Replace any problem characters in the string value to be used in SQL
            const sql = json.replace(
                SqlConvert._oracleJsonRegex,
                (
                    fullMatch,
                    singleQuotation) => {
                    // Check match and return SQL response
                    if (singleQuotation) return '\'\'';
                    return fullMatch;
                }
            );

            // Return the SQL text within a N (for unicode) and single quotation marks
            return 'N\'' + sql + '\'';
        }
    }

    /**
     * Convert the string of text into a SQL string. This checks for escape characters.
     * @param {String} value The string that needs checking and converting.
     * @param {SqlConfig} sqlConfig The SQL config settings to use.
     * @return {String} The string that is safe to use as SQL text.
     */
    static _convertStringToSql(value, sqlConfig) {
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

            // Return the SQL text
            return sql;
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

            // Return the SQL text
            return sql;
        }

        // If database is Microsoft SQL Server
        if (sqlConfig.databaseType === DatabaseType.MS_SQL_SERVER) {
            // Replace any problem characters in the string value to be used in SQL
            const sql = value.replace(
                SqlConvert._msSqlServerStringRegex,
                (
                    fullMatch,
                    singleQuotation) => {
                    // Check match and return SQL response
                    if (singleQuotation) return '\'\'';
                    return fullMatch;
                }
            );

            // Return the SQL text
            return sql;
        }

        // If database is Oracle
        if (sqlConfig.databaseType === DatabaseType.ORACLE) {
            // Replace any problem characters in the string value to be used in SQL
            const sql = value.replace(
                SqlConvert._oracleStringRegex,
                (
                    fullMatch,
                    singleQuotation,
                    newline,
                    carriageReturn) => {
                    // Check match and return SQL response
                    if (singleQuotation) return '\'\'';
                    if (newline) return '\' || CHR(10) || \'';
                    if (carriageReturn) return '\' || CHR(13) || \'';
                    return fullMatch;
                }
            );

            // Return the SQL text
            return sql;
        }
    }

    /**
     * Convert the date and time into an SQL text format.
     * @param {Date} date The date object to convert.
     * @param {SqlConfig} sqlConfig The SQL config settings to use.
     * @return {String} The date in SQL text format.
     */
    static _convertDateToSql(date, sqlConfig) {
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
            yearText + '-' + monthText + '-' + dayText + ' ' +
            hourText + ':' + minuteText + ':' + secondText +
            millisecondText;
        
        // Return formatted SQL date time
        return sqlText;
    }

    /**
     * Convert the array into multiple {...} SQL parts.
     * @param {Array} array The array of things to convert to SQL.
     * @param {SqlConfig} sqlConfig The SQL config settings to use.
     * @return {String} The array of things in a text SQL format.
     */
    static _convertArrayToSql(array, sqlConfig) {
        // Set sql list
        const sqlList = [];

        // For each array value
        for (let index = 0; index < array.length; index++) {
            // Get value
            const value = array[index];

            // If not the first value in the list then add , character
            if (index !== 0) sqlList.push(', ');

            // If undefined
            if (value === undefined) sqlList.push('NULL');

            // If null
            else if (value === null) sqlList.push('NULL');

            // If number
            else if (typeof value === 'number') sqlList.push(value.toString());

            // If boolean
            else if (typeof value === 'boolean') {
                if (value === true) sqlList.push('TRUE');
                if (value === false) sqlList.push('FALSE');
            }

            // If value is a sub-array
            else if (Array.isArray(value) === true) {
                // Add opening bracket
                sqlList.push('{');

                // Add sub-array to SQL
                sqlList.push(SqlConvert._convertArrayToSql(value, sqlConfig));

                // Add closing bracket
                sqlList.push('}');

                // Move on to next value
                continue;
            }

            // If string
            else if (typeof value === 'string') {
                // Convert value into SQL text
                const sqlStringText = SqlConvert._convertStringToSql(value, sqlConfig);

                // Add date to list
                sqlList.push('\"' + sqlStringText + '\"');
            }
            
            // If object
            else if (typeof value === 'object') {
                // If date
                if (value instanceof Date) {
                    // If the date is invalid then add NULL to list
                    if (isNaN(value.getTime()) === true) { sqlList.push('NULL'); continue; }

                    // Conver the date into SQL text
                    const sqlDateText = SqlConvert._convertDateToSql(date, sqlConfig);

                    // Add date to list
                    sqlList.push('\"' + sqlDateText + '\"');
                }                
            }
        };

        // Put together the array SQL
        const sql = sqlList.join('');

        // Return the SQL
        return sql;
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

        // Convert and return the value as JSON text
        return SqlConvert.jsonToSql(this._value, sqlConfig);
    }
}

/**
 * SQL Non-Unicode.
 * Used to add sting data that is non-unicode into a SQL safe string value.
 * Microsoft SQL server has all unicode text start with N'...'. By default
 * all strings are outputted using this format. Using this class stops the
 * N prefix being added.
 */
export class SqlNonUnicode {
    /**
     * SQL non-unicode constructor.
     * @param {String} text The text that will be added to the SQL.
     */
    constructor(text) {
        // Set text value
        this._text = text;
    }

    /**
     * Convert the text value into safe SQL string.
     * @param {SqlConfig} [sqlConfig] The SQL config settings to use.
     * @return {String} The text as safe SQL text.
     */
    toSql(sqlConfig) {
        // If SQL config is not set then use the default one
        if (!sqlConfig) sqlConfig = SqlConfig.default;

        // Get the sql value
        const sql = SqlConvert.stringToSql(this._text, sqlConfig);

        // If database is not Microsoft SQL Server
        if (sqlConfig.databaseType !== DatabaseType.MS_SQL_SERVER) {
            // Return the SQL without the starting N character
            return sql.substring(1);
        }

        // Otherwise just return the string as is
        return sql;
    }
}

/**
 * SQL Timestamp.
 * Used to add date and time parts to an Oracle TIMESTAMP column. A date
 * object is converted into "DATE 'YYYY-MM-DD'" SQL text for Oracle, but
 * when you want to convert it into a timestamp then use this.
 */
export class SqlTimestamp {
    /**
     * SQL Timestamp constructor.
     * @param {Date} date The date that will be added to the SQL.
     */
    constructor(date) {
        // Set date value
        this._date = date;
    }

    /**
     * Convert the date value into safe SQL string.
     * @param {SqlConfig} [sqlConfig] The SQL config settings to use.
     * @return {String} The date as safe SQL text.
     */
    toSql(sqlConfig) {
        // If SQL config is not set then use the default one
        if (!sqlConfig) sqlConfig = SqlConfig.default;

        // Make sure the date is a date object
        if (typeof this._date !== 'object' || !(this._date instanceof Date)) throw new Error('Invalid date');

        // If the date is invalid then add NULL to list
        if (isNaN(this._date.getTime()) === true) return 'NULL';

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
            year = this._date.getUTCFullYear();
            month = this._date.getUTCMonth() + 1;
            day = this._date.getUTCDate();
            hour = this._date.getUTCHours();
            minute = this._date.getUTCMinutes();
            second = this._date.getUTCSeconds();
            millisecond = this._date.getUTCMilliseconds();
        } else {
            // Get local date and time values
            year = this._date.getFullYear();
            month = this._date.getMonth() + 1;
            day = this._date.getDate();
            hour = this._date.getHours();
            minute = this._date.getMinutes();
            second = this._date.getSeconds();
            millisecond = this._date.getMilliseconds();
        }

        // Format parts
        const yearText = year.toString();
        const monthText = month.toString().padStart(2, '0');
        const dayText = day.toString().padStart(2, '0');
        const hourText = hour.toString().padStart(2, '0');
        const minuteText = minute.toString().padStart(2, '0');
        const secondText = second.toString().padStart(2, '0');
        const millisecondText = millisecond.toString().padStart(3, '0');

        // Format SQL date time
        const sqlText =
            'TIMESTAMP \'' +
            yearText + '-' + monthText + '-' + dayText + ' ' +
            hourText + ':' + minuteText + ':' + secondText + '.' +
            millisecondText +
            '\'';
        
        // Return formatted SQL date time
        return sqlText;
    }
}