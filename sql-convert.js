/**
 * SQL Convert
 * Used to convert values between JavaScript and SQL.
 */

export class SqlConvert {
    /**
     * Convert the given value, which could be any type, into the SQL text value.
     * @param {*} value A value of an unknown type.
     * @param {Boolean} utc If the value is a date should local date time be used or UTC.
     */
    static valueToSql(value, utc) {
        // If undefined
        if (value === undefined) return 'NULL';

        // If null
        if (value === null) return 'NULL';

        // If number
        if (typeof value === 'number') valueText = value.toString();

        // If boolean
        else if (typeof value === 'boolean') {
            if (value === true) valueText = 'TRUE';
            if (value === false) valueText = 'FALSE';
        }

        // If object
        else if (typeof value === 'object') {
            // If date
            if (value instanceof Date) return SqlConvert.dateToSql(value, utc);
            
            // If buffer
            if (Buffer.isBuffer(value) === true) return 1;
        }

    }

    /**
     * Convert the date and time into an SQL text format. Format is YYYY-MM-DD HH:MM:SS.
     * @param {Date} date The date object to convert.
     * @param {Boolean} utc Use local date time or UTC.
     * @return {String} The date in SQL text format.
     */
    static dateToSql(date, utc) {
        // If the date is invalid then return NULL
        if (isNaN(date.getTime()) === true) return 'NULL';

        // Get date and time values
        let year = 0;
        let month = 0;
        let day = 0;
        let hour = 0;
        let minute = 0;
        let second = 0;

        // If UTC
        if (utc === true) {
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
     * Convert the buffer into a hex string that SQL can use.
     * @param {Buffer} buffer The buffer to convert into a hex string.
     * @return {String} The converted hex string.
     */
    static bufferToSql(buffer) {

    }
}
