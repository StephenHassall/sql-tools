/**
 * Test SQL Convert
 */
import { Buffer } from 'node:buffer';
import { SqlConfig, DatabaseType } from "../sql-config.js";
import { SqlConvert, SqlIdentifier, SqlTrusted, SqlJson } from "../sql-convert.js";
import Test from "./test.js";

export default class TestSqlConvert {
    /**
     * Run all the SQL convert tests.
     */
    static run() {
        // Set test
        Test.test('SqlConvert');

        // Perform tests
        TestSqlConvert.testBasics();
        TestSqlConvert.testText();
        TestSqlConvert.testDate();
        TestSqlConvert.testBuffer();
        TestSqlConvert.testArray();
        TestSqlConvert.testToSql();
    }

    /**
     * Test basics.
     */
    static testBasics() {
        // Test the basics
        Test.describe('valueToSql basics');
        let sql = SqlConvert.valueToSql(undefined);
        Test.assertEqual(sql, 'NULL');
        sql = SqlConvert.valueToSql(null);
        Test.assertEqual(sql, 'NULL');
        sql = SqlConvert.valueToSql(123);
        Test.assertEqual(sql, '123');
        sql = SqlConvert.valueToSql(123.456);
        Test.assertEqual(sql, '123.456');
        sql = SqlConvert.valueToSql(true);
        Test.assertEqual(sql, 'TRUE');
        sql = SqlConvert.valueToSql(false);
        Test.assertEqual(sql, 'FALSE');
        sql = SqlConvert.valueToSql({});
        Test.assertEqual(sql, '');
    }

    /**
     * Test text.
     */
    static testText() {
        // Create configs
        const mySqlConfig = new SqlConfig();
        mySqlConfig.databaseType = DatabaseType.MYSQL;
        const postgreSQLConfig = new SqlConfig();
        postgreSQLConfig.databaseType = DatabaseType.POSTGRESQL;

        // Test text
        Test.describe('valueToSql text');
        let sql = SqlConvert.valueToSql('hello world', mySqlConfig);
        Test.assertEqual(sql, '\'hello world\'');
        sql = SqlConvert.valueToSql('hello world', postgreSQLConfig);
        Test.assertEqual(sql, 'E\'hello world\'');

        // Test MySQL escape characters
        Test.describe('valueToSql MySQL escape characters');
        sql = SqlConvert.valueToSql('hello \0\b\t\r\n\x1A\"\'\\ world', mySqlConfig);
        Test.assertEqual(sql, '\'hello \\0\\b\\t\\r\\n\\Z\\"\\\'\\\\ world\'');

        // Test PostgreSQL escape characters
        Test.describe('valueToSql PostgreSQL escape characters');
        sql = SqlConvert.valueToSql('hello \b\f\r\n\t\"\'\\ world', postgreSQLConfig);
        Test.assertEqual(sql, 'E\'hello \\b\\f\\r\\n\\t\\"\\\'\\\\ world\'');

        // Test MySQL identifier
        Test.describe('valueToSql MySQL identifier');
        sql = SqlConvert.identifierToSql('table', mySqlConfig);
        Test.assertEqual(sql, '`table`');
        sql = SqlConvert.identifierToSql('ta`ble', mySqlConfig);
        Test.assertEqual(sql, '`ta``ble`');

        // Test PostgreSQL identifier
        Test.describe('valueToSql PostgreSQL identifier');
        sql = SqlConvert.identifierToSql('table', postgreSQLConfig);
        Test.assertEqual(sql, '"table"');
        sql = SqlConvert.identifierToSql('ta"ble', postgreSQLConfig);
        Test.assertEqual(sql, '"ta""ble"');

        // Test errors
        Test.describe('valueToSql errors');
        try {
            SqlConvert.stringToSql(undefined);
            Test.assert();
        } catch (e) {
            Test.assertEqual(e.message, 'Invalid value');
        }
        try {
            SqlConvert.stringToSql(null);
            Test.assert();
        } catch (e) {
            Test.assertEqual(e.message, 'Invalid value');
        }
        try {
            SqlConvert.stringToSql(123);
            Test.assert();
        } catch (e) {
            Test.assertEqual(e.message, 'Invalid value');
        }
        try {
            SqlConvert.stringToSql({});
            Test.assert();
        } catch (e) {
            Test.assertEqual(e.message, 'Invalid value');
        }
        try {
            SqlConvert.stringToSql([]);
            Test.assert();
        } catch (e) {
            Test.assertEqual(e.message, 'Invalid value');
        }
        try {
            SqlConvert.stringToSql(function() {});
            Test.assert();
        } catch (e) {
            Test.assertEqual(e.message, 'Invalid value');
        }
    }

    /**
     * Test date.
     */
    static testDate() {
        // Test date
        Test.describe('valueToSql date');
        let date = new Date(Date.UTC(2024, 3, 20, 12, 34, 56, 123));
        let sql = SqlConvert.valueToSql(date);
        Test.assertEqual(sql, '\'2024-04-20 12:34:56.123\'');

        // Create configs
        const config = new SqlConfig();
        config.utc = false;

        // Test date non-utc (problem testing if timezone and daylight saving is the same as UTC).
        Test.describe('valueToSql date non-utc');
        date = new Date(2024, 3, 20, 12, 34, 56, 123);
        sql = SqlConvert.valueToSql(date, config);
        Test.assertEqual(sql, '\'2024-04-20 12:34:56.123\'');

        // Test milliseconds
        Test.describe('valueToSql milliseconds');
        date = new Date(Date.UTC(2024, 3, 20, 12, 34, 56, 0));
        sql = SqlConvert.valueToSql(date);
        Test.assertEqual(sql, '\'2024-04-20 12:34:56\'');

        // Test zero padding
        Test.describe('valueToSql zero padding');
        date = new Date(Date.UTC(2024, 3, 2, 1, 3, 6, 1));
        sql = SqlConvert.valueToSql(date);
        Test.assertEqual(sql, '\'2024-04-02 01:03:06.001\'');

        // Test errors
        Test.describe('dateToSql errors');
        try {
            SqlConvert.dateToSql(undefined);
            Test.assert();
        } catch (e) {
            Test.assertEqual(e.message, 'Invalid date');
        }
        try {
            SqlConvert.dateToSql(null);
            Test.assert();
        } catch (e) {
            Test.assertEqual(e.message, 'Invalid date');
        }
        try {
            SqlConvert.dateToSql(123);
            Test.assert();
        } catch (e) {
            Test.assertEqual(e.message, 'Invalid date');
        }
        try {
            SqlConvert.dateToSql("hello world");
            Test.assert();
        } catch (e) {
            Test.assertEqual(e.message, 'Invalid date');
        }
        try {
            SqlConvert.dateToSql({});
            Test.assert();
        } catch (e) {
            Test.assertEqual(e.message, 'Invalid date');
        }
        try {
            SqlConvert.dateToSql([]);
            Test.assert();
        } catch (e) {
            Test.assertEqual(e.message, 'Invalid date');
        }
        try {
            SqlConvert.dateToSql(function() {});
            Test.assert();
        } catch (e) {
            Test.assertEqual(e.message, 'Invalid date');
        }
    }

    /**
     * Test buffer.
     */
    static testBuffer() {
        // Create configs
        const mySqlConfig = new SqlConfig();
        mySqlConfig.databaseType = DatabaseType.MYSQL;
        const postgreSQLConfig = new SqlConfig();
        postgreSQLConfig.databaseType = DatabaseType.POSTGRESQL;

        // Test MySQL buffer
        Test.describe('valueToSql MySQL buffer');
        let buffer = Buffer.from([0, 1, 2, 3, 4, 5, 255]);
        let sql = SqlConvert.valueToSql(buffer, mySqlConfig);
        Test.assertEqual(sql, 'X\'000102030405ff\'');

        // Test MySQL buffer
        Test.describe('valueToSql PostgreSQL buffer');
        buffer = Buffer.from([0, 1, 2, 3, 4, 5, 255]);
        sql = SqlConvert.valueToSql(buffer, postgreSQLConfig);
        Test.assertEqual(sql, '\'\\x000102030405ff\'');

        // Test errors
        Test.describe('bufferToSql errors');
        try {
            SqlConvert.bufferToSql(undefined);
            Test.assert();
        } catch (e) {
            Test.assertEqual(e.message, 'Invalid buffer');
        }
        try {
            SqlConvert.bufferToSql(null);
            Test.assert();
        } catch (e) {
            Test.assertEqual(e.message, 'Invalid buffer');
        }
        try {
            SqlConvert.bufferToSql(123);
            Test.assert();
        } catch (e) {
            Test.assertEqual(e.message, 'Invalid buffer');
        }
        try {
            SqlConvert.bufferToSql("hello world");
            Test.assert();
        } catch (e) {
            Test.assertEqual(e.message, 'Invalid buffer');
        }
        try {
            SqlConvert.bufferToSql({});
            Test.assert();
        } catch (e) {
            Test.assertEqual(e.message, 'Invalid buffer');
        }
        try {
            SqlConvert.bufferToSql([]);
            Test.assert();
        } catch (e) {
            Test.assertEqual(e.message, 'Invalid buffer');
        }
        try {
            SqlConvert.bufferToSql(function() {});
            Test.assert();
        } catch (e) {
            Test.assertEqual(e.message, 'Invalid buffer');
        }
    }

    /**
     * Test array.
     */
    static testArray() {
        // Test array
        Test.describe('valueToSql array');
        let sql = SqlConvert.valueToSql([1, 2, 3]);
        Test.assertEqual(sql, '1, 2, 3');

        // Test array of arrays
        Test.describe('valueToSql array of arrays');
        sql = SqlConvert.valueToSql([['row1', 1], ['row2', 2], ['row3', 3]]);
        Test.assertEqual(sql, "('row1', 1), ('row2', 2), ('row3', 3)");

        // Test array of escape text
        Test.describe('valueToSql array of escape text');
        sql = SqlConvert.valueToSql(['\'', '\"']);
        Test.assertEqual(sql, '\'\\\'\', \'\\\"\'');

        // Test errors
        Test.describe('arrayToSql errors');
        try {
            SqlConvert.arrayToSql(undefined);
            Test.assert();
        } catch (e) {
            Test.assertEqual(e.message, 'Invalid array');
        }
        try {
            SqlConvert.arrayToSql(null);
            Test.assert();
        } catch (e) {
            Test.assertEqual(e.message, 'Invalid array');
        }
        try {
            SqlConvert.arrayToSql(123);
            Test.assert();
        } catch (e) {
            Test.assertEqual(e.message, 'Invalid array');
        }
        try {
            SqlConvert.arrayToSql("hello world");
            Test.assert();
        } catch (e) {
            Test.assertEqual(e.message, 'Invalid array');
        }
        try {
            SqlConvert.arrayToSql({});
            Test.assert();
        } catch (e) {
            Test.assertEqual(e.message, 'Invalid array');
        }
        try {
            SqlConvert.arrayToSql(function() {});
            Test.assert();
        } catch (e) {
            Test.assertEqual(e.message, 'Invalid array');
        }
    }

    /**
     * Test toSql function.
     */
    static testToSql() {
        // Create configs
        const mySqlConfig = new SqlConfig();
        mySqlConfig.databaseType = DatabaseType.MYSQL;
        const postgreSQLConfig = new SqlConfig();
        postgreSQLConfig.databaseType = DatabaseType.POSTGRESQL;

        // Make object with toSql function
        const test = {};
        test.toSql = function () {
            return 'test';
        };

        // Test toSql
        Test.describe('valueToSql toSql');
        let sql = SqlConvert.valueToSql(test);
        Test.assertEqual(sql, 'test');

        // Create SQL identifier
        const sqlIdentifier = new SqlIdentifier('identifier-test')

        // Test MySQL SqlIdentifer
        Test.describe('valueToSql MySQL SqlIdentifer');
        sql = SqlConvert.valueToSql(sqlIdentifier, mySqlConfig);
        Test.assertEqual(sql, '`identifier-test`');

        // Test PostgreSQL SqlIdentifer
        Test.describe('valueToSql PostgreSQL SqlIdentifer');
        sql = SqlConvert.valueToSql(sqlIdentifier, postgreSQLConfig);
        Test.assertEqual(sql, '"identifier-test"');

        // Create SQL trusted
        const sqlTrusted = new SqlTrusted('trusted-test');

        // Test MySQL SqlTrusted
        Test.describe('valueToSql MySQL SqlTrusted');
        sql = SqlConvert.valueToSql(sqlTrusted);
        Test.assertEqual(sql, 'trusted-test');

        // Create SQL JSON
        let sqlJson = new SqlJson({ name: 'hello\'world', age: 50 });

        // Test MySQL SqlJson
        Test.describe('valueToSql MySQL SqlJson');
        sql = SqlConvert.valueToSql(sqlJson, mySqlConfig);
        Test.assertEqual(sql, '\'{"name":"hello\\\'world","age":50}\'');

        // Test PostgreSQL SqlJson
        Test.describe('valueToSql PostgresSQL SqlJson');
        sql = SqlConvert.valueToSql(sqlJson, postgreSQLConfig);
        Test.assertEqual(sql, 'E\'{"name":"hello\\\'world","age":50}\'');

        // Create SQL JSON with escape characters
        sqlJson = new SqlJson({ name: 'hello \b\t\r\n\"\'\\ world', age: 50 });

        // Test MySQL SqlJson escape characters
        Test.describe('valueToSql MySQL SqlJson escape characters');
        sql = SqlConvert.valueToSql(sqlJson, mySqlConfig);
        Test.assertEqual(sql, '\'{"name":"hello \\b\\t\\r\\n\\"\\\'\\\\ world","age":50}\'');

        // Create SQL JSON with escape characters
        sqlJson = new SqlJson({ name: 'hello \b\f\r\n\t\"\'\\ world', age: 50 });

        // Test PostgreSQL SqlJson escape characters
        Test.describe('valueToSql PostgresSQL SqlJson escape characters');
        sql = SqlConvert.valueToSql(sqlJson, postgreSQLConfig);
        Test.assertEqual(sql, 'E\'{"name":"hello \\b\\f\\r\\n\\t\\"\\\'\\\\ world","age":50}\'');
    }
}