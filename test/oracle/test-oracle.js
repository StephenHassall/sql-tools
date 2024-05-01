/**
 * Test Oracle database parts
 */
import { SqlConfig, DatabaseType } from "../../sql-config.js";
import { SqlJson, SqlIdentifier, SqlTimestamp } from "../../sql-convert.js";
import { SqlTemplate } from "../../sql-template.js";
import { SqlTemplateFile } from "../../sql-template-file.js";
import Database from "./database.js";
import Test from "./../test.js";

export default class TestOracle {
    /**
     * Run all the Oracle tests.
     */
    static async run() {
        // Set test
        Test.test('Oracle');

        // Set SqlConfig for Oracle database
        TestOracle._sqlConfig = new SqlConfig();
        TestOracle._sqlConfig.databaseType = DatabaseType.ORACLE;
        TestOracle._sqlConfig.removeComments = true;
        TestOracle._sqlConfig.singleLine = true;

        // Initialize the database connection
        Database.initialize();

        // Perform tests
        await TestOracle.testCreateTable();
        await TestOracle.testInsertSampleRecord();
        await TestOracle.testInsertRecordWithValues();
    }

    /**
     * Create (or recreate) the table.
     */
    static async testCreateTable() {
        // Set description
        Test.describe('testCreateTable');

        // Create create table SQL command
        let sqlTemplate = await SqlTemplateFile.getTemplate('./create-table.sql', import.meta.url, TestOracle._sqlConfig);
        Test.assert(sqlTemplate);

        // Format the SQL template (without any values)
        let sql = sqlTemplate.format({});
        Test.assert(sql);

        // Run the SQL query
        let result = await Database.query(sql);
        Test.assert(result);
    }

    /**
     * Insert sample record.
     */
    static async testInsertSampleRecord() {
        // Set description
        Test.describe('testInsertSampleRecord');

        // Create create table SQL command
        let sqlTemplate = await SqlTemplateFile.getTemplate('./insert-sample.sql', import.meta.url, TestOracle._sqlConfig);
        Test.assert(sqlTemplate);

        // Format the SQL template (without any values)
        let sql = sqlTemplate.format({});
        Test.assert(sql);

        // Run the SQL query
        let result = await Database.query(sql);
        Test.assert(result);

        // Create select SQL command
        let sqlSelectTemplate = await SqlTemplateFile.getTemplate('./select.sql', import.meta.url, TestOracle._sqlConfig);
        Test.assert(sqlSelectTemplate);

        // Format the select SQL template (without any values)
        let selectSql = sqlSelectTemplate.format({});
        Test.assert(selectSql);

        // Run the SQL query
        result = await Database.query(selectSql);
        Test.assert(result);
        Test.assertEqual(result.length, 1);
        Test.assert(result[0].rows);
        Test.assert(result[0].rows.length);

        // Set first (and only) record
        const record = result[0].rows[0];
        Test.assert(record.F_BOOL);
        Test.assertEqual(record.F_BOOL, 1);
        Test.assert(record.F_CHAR);
        Test.assertEqual(record.F_CHAR, 'abc');
        Test.assert(record.F_NCHAR);
        Test.assertEqual(record.F_NCHAR, 'XYZ');
        Test.assert(record.F_VARCHAR2);
        Test.assertEqual(record.F_VARCHAR2, 'this is a string with escape codes "\'\\\tmore [](){} NL \n CR \r end.');
        Test.assert(record.F_NVARCHAR2);
        Test.assertEqual(record.F_NVARCHAR2, 'this is more text with\"double quotes\" and \'single quotes\'.');
        Test.assert(record.F_NUMBER);
        Test.assertEqual(record.F_NUMBER, 12.3456);
        Test.assert(record.F_FLOAT);
        Test.assertEqual(record.F_FLOAT, 3.1);
        Test.assert(record.F_DATE);
        Test.assertEqual(record.F_DATE.getFullYear(), 2024);
        Test.assertEqual(record.F_DATE.getMonth(), 3);
        Test.assertEqual(record.F_DATE.getDate(), 20);
        Test.assert(record.F_BINARY_FLOAT);
        Test.assertEqual(record.F_BINARY_FLOAT.toFixed(3), '2.718');
        Test.assert(record.F_BINARY_DOUBLE);
        Test.assertEqual(record.F_BINARY_DOUBLE.toFixed(3), '1.234');
        Test.assert(record.F_TIMESTAMP);
        Test.assertEqual(record.F_TIMESTAMP.getFullYear(), 2024);
        Test.assertEqual(record.F_TIMESTAMP.getMonth(), 3);
        Test.assertEqual(record.F_TIMESTAMP.getDate(), 20);
        Test.assertEqual(record.F_TIMESTAMP.getHours(), 12);
        Test.assertEqual(record.F_TIMESTAMP.getMinutes(), 34);
        Test.assertEqual(record.F_TIMESTAMP.getSeconds(), 56);
        Test.assertEqual(record.F_TIMESTAMP.getMilliseconds(), 123);
        Test.assert(record.F_RAW);
        Test.assertEqual(record.F_RAW[0], 0xF0);
        Test.assertEqual(record.F_RAW[1], 0xE1);
        Test.assertEqual(record.F_RAW[2], 0xD2);
        Test.assertEqual(record.F_RAW[3], 0xC3);
        Test.assertEqual(record.F_RAW[4], 0xB4);
        Test.assertEqual(record.F_RAW[5], 0xA5);
        Test.assertEqual(record.F_RAW[6], 0x96);
        Test.assertEqual(record.F_RAW[7], 0x87);
        Test.assertEqual(record.F_RAW[8], 0x78);
        Test.assertEqual(record.F_RAW[9], 0x69);
        Test.assertEqual(record.F_RAW[10], 0x5A);
        Test.assertEqual(record.F_RAW[11], 0x4B);
        Test.assertEqual(record.F_RAW[12], 0x3C);
        Test.assertEqual(record.F_RAW[13], 0x2D);
        Test.assertEqual(record.F_RAW[14], 0x1E);
        Test.assertEqual(record.F_RAW[15], 0x0F);
        Test.assert(record.F_LONG_RAW);
        Test.assertEqual(record.F_LONG_RAW[0], 0x00);
        Test.assertEqual(record.F_LONG_RAW[1], 0x11);
        Test.assertEqual(record.F_LONG_RAW[2], 0x22);
        Test.assertEqual(record.F_LONG_RAW[3], 0x33);
        Test.assertEqual(record.F_LONG_RAW[4], 0x44);
        Test.assertEqual(record.F_LONG_RAW[5], 0x55);
        Test.assertEqual(record.F_LONG_RAW[6], 0x66);
        Test.assertEqual(record.F_LONG_RAW[7], 0x77);
        Test.assertEqual(record.F_LONG_RAW[8], 0x88);
        Test.assertEqual(record.F_LONG_RAW[9], 0x99);
        Test.assertEqual(record.F_LONG_RAW[10], 0xAA);
        Test.assertEqual(record.F_LONG_RAW[11], 0xBB);
        Test.assertEqual(record.F_LONG_RAW[12], 0xCC);
        Test.assertEqual(record.F_LONG_RAW[13], 0xDD);
        Test.assertEqual(record.F_LONG_RAW[14], 0xEE);
        Test.assertEqual(record.F_LONG_RAW[15], 0xFF);

        Test.assert(record.F_CLOB);

        const tJson = { property1: 123, property2: "te\"s\\t", property3: "te\'st" };
        const tText = JSON.stringify(tJson);

        const fJson = JSON.parse(record.F_CLOB);
        const fText = JSON.stringify(fJson);

        Test.assertEqual(fText, tText);

        Test.assert(record.F_BLOB);
        Test.assertEqual(record.F_BLOB[0], 0x01);
        Test.assertEqual(record.F_BLOB[1], 0x23);
        Test.assertEqual(record.F_BLOB[2], 0x45);
        Test.assertEqual(record.F_BLOB[3], 0x67);
        Test.assertEqual(record.F_BLOB[4], 0x89);
        Test.assertEqual(record.F_BLOB[5], 0xAB);
        Test.assertEqual(record.F_BLOB[6], 0xCD);
        Test.assertEqual(record.F_BLOB[7], 0xEF);
    }

    /**
     * Insert record with values.
     */
    static async testInsertRecordWithValues() {
        // Set description
        Test.describe('testInsertRecordWithValues');

        // Create create table SQL command
        let sqlTemplate = await SqlTemplateFile.getTemplate('./insert.sql', import.meta.url, TestOracle._sqlConfig);
        Test.assert(sqlTemplate);

        // Create values
        const values = {};

        // Add values
        values.testTable = new SqlIdentifier('TEST');
        values.F_BOOL = false;
        values.F_CHAR = 'ABC';
        values.F_NCHAR = 'xyz';
        values.F_VARCHAR2 = 'hello \0\"\'\r\n\\\t{}[]()?%$ world';
        values.F_NVARCHAR2 = 'testing \"more\' text';
        values.F_NUMBER = 456;
        values.F_FLOAT = 2.7;
        values.F_DATE = new Date(Date.UTC(2021, 2, 19, 11, 35, 23));
        values.F_BINARY_FLOAT = 3.142;
        values.F_BINARY_DOUBLE = 2.718;
        values.F_TIMESTAMP = new SqlTimestamp(new Date(Date.UTC(2020, 1, 18, 9, 33, 21, 987)));
        values.F_RAW = Buffer.from([0x10, 0x23, 0x45, 0x67, 0x89, 0xAB, 0xCD, 0xEF]);
        values.F_LONG_RAW = Buffer.from([0xFE, 0xDC, 0xBA, 0x98, 0x76, 0x54, 0x32, 0x10]);
        values.F_BLOB = Buffer.from([0x11, 0xFF, 0x22, 0xEE]);
      
        // Set JSON
        const fObject = { property1: 567, property2: "te\"st\\2", property3: "te\'st2" };
        values.F_CLOB = new SqlJson(fObject);

        // Format the SQL template with values
        let sql = sqlTemplate.format(values);
        Test.assert(sql);

        // Run the SQL query
        let result = await Database.query(sql);
        Test.assert(result);

        // Create select SQL command
        let sqlSelectTemplate = await SqlTemplateFile.getTemplate('./select.sql', import.meta.url, TestOracle._sqlConfig);
        Test.assert(sqlSelectTemplate);

        // Format the select SQL template (without any values)
        let selectSql = sqlSelectTemplate.format({});
        Test.assert(selectSql);

        // Run the SQL query
        result = await Database.query(selectSql);
        Test.assert(result);
        Test.assertEqual(result.length, 1);
        Test.assert(result[0].rows);
        Test.assert(result[0].rows.length);

        // Set first (and only) record
        const record = result[0].rows[0];
        Test.assert(record.F_BOOL);
        Test.assertEqual(record.F_BOOL, 0);
        Test.assert(record.F_CHAR);
        Test.assertEqual(record.F_CHAR, 'ABC');
        Test.assert(record.F_NCHAR);
        Test.assertEqual(record.F_NCHAR, 'xyz');
        Test.assert(record.F_VARCHAR2);
        Test.assertEqual(record.F_VARCHAR2, 'hello \0\"\'\r\n\\\t{}[]()?%$ world');
        Test.assert(record.F_NVARCHAR2);
        Test.assertEqual(record.F_NVARCHAR2, 'testing \"more\' text');
        Test.assert(record.F_NUMBER);
        Test.assertEqual(record.F_NUMBER, 456);
        Test.assert(record.F_FLOAT);
        Test.assertEqual(record.F_FLOAT, 2.7);
        Test.assert(record.F_DATE);
        Test.assertEqual(record.F_DATE.getFullYear(), 2021);
        Test.assertEqual(record.F_DATE.getMonth(), 2);
        Test.assertEqual(record.F_DATE.getDate(), 19);
        Test.assert(record.F_BINARY_FLOAT);
        Test.assertEqual(record.F_BINARY_FLOAT.toFixed(3), '3.142');
        Test.assert(record.F_BINARY_DOUBLE);
        Test.assertEqual(record.F_BINARY_DOUBLE.toFixed(3), '2.718');
        Test.assert(record.F_TIMESTAMP);
        Test.assertEqual(record.F_TIMESTAMP.getFullYear(), 2020);
        Test.assertEqual(record.F_TIMESTAMP.getMonth(), 1);
        Test.assertEqual(record.F_TIMESTAMP.getDate(), 18);
        Test.assertEqual(record.F_TIMESTAMP.getHours(), 9);
        Test.assertEqual(record.F_TIMESTAMP.getMinutes(), 33);
        Test.assertEqual(record.F_TIMESTAMP.getSeconds(), 21);
        Test.assertEqual(record.F_TIMESTAMP.getMilliseconds(), 987);
        Test.assert(record.F_RAW);
        Test.assertEqual(record.F_RAW[0], 0x10);
        Test.assertEqual(record.F_RAW[1], 0x23);
        Test.assertEqual(record.F_RAW[2], 0x45);
        Test.assertEqual(record.F_RAW[3], 0x67);
        Test.assertEqual(record.F_RAW[4], 0x89);
        Test.assertEqual(record.F_RAW[5], 0xAB);
        Test.assertEqual(record.F_RAW[6], 0xCD);
        Test.assertEqual(record.F_RAW[7], 0xEF);
        Test.assert(record.F_LONG_RAW);
        Test.assertEqual(record.F_LONG_RAW[0], 0xFE);
        Test.assertEqual(record.F_LONG_RAW[1], 0xDC);
        Test.assertEqual(record.F_LONG_RAW[2], 0xBA);
        Test.assertEqual(record.F_LONG_RAW[3], 0x98);
        Test.assertEqual(record.F_LONG_RAW[4], 0x76);
        Test.assertEqual(record.F_LONG_RAW[5], 0x54);
        Test.assertEqual(record.F_LONG_RAW[6], 0x32);
        Test.assertEqual(record.F_LONG_RAW[7], 0x10);

        Test.assert(record.F_CLOB);

        const tJson = JSON.parse(record.F_CLOB);
        const tText = JSON.stringify(tJson);

        const fText = JSON.stringify(fObject);

        Test.assertEqual(tText, fText);

        Test.assert(record.F_BLOB);
        Test.assertEqual(record.F_BLOB[0], 0x11);
        Test.assertEqual(record.F_BLOB[1], 0xFF);
        Test.assertEqual(record.F_BLOB[2], 0x22);
        Test.assertEqual(record.F_BLOB[3], 0xEE);
   }
}