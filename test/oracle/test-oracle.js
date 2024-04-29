/**
 * Test Oracle database parts
 */
import { SqlConfig, DatabaseType } from "../../sql-config.js";
import { SqlJson, SqlIdentifier } from "../../sql-convert.js";
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

        // Initialize the database connection
        Database.initialize();

        // Perform tests
        await TestOracle.testCreateTable();
        //await TestMySql.testInsertSampleRecord();
        //await TestMySql.testInsertRecordWithValues();
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
        let sqlTemplate = await SqlTemplateFile.getTemplate('./insert-sample.sql', import.meta.url, TestMySql._sqlConfig);
        Test.assert(sqlTemplate);

        // Format the SQL template (without any values)
        let sql = sqlTemplate.format({});
        Test.assert(sql);

        // Run the SQL query
        let result = await Database.query(sql);
        Test.assert(result);

        // Create select SQL command
        let sqlSelectTemplate = await SqlTemplateFile.getTemplate('./select.sql', import.meta.url, TestMySql._sqlConfig);
        Test.assert(sqlSelectTemplate);

        // Format the select SQL template (without any values)
        let selectSql = sqlSelectTemplate.format({});
        Test.assert(selectSql);

        // Run the SQL query
        result = await Database.query(selectSql);
        Test.assert(result);
        Test.assertEqual(result.length, 1);

        // Set first (and only) record
        const record = result[0];
        Test.assert(record.f_bool);
        Test.assertEqual(record.f_bool, 1);
        Test.assert(record.f_int);
        Test.assertEqual(record.f_int, 123);
        Test.assert(record.f_decimal);
        Test.assertEqual(record.f_decimal, 12.3456);
        Test.assert(record.f_date);
        Test.assertEqual(record.f_date, '2024-04-19');
        Test.assert(record.f_time);
        Test.assertEqual(record.f_time, '12:34:56');
        Test.assert(record.f_datetime);
        Test.assertEqual(record.f_datetime, '2024-04-20 12:34:56');
        Test.assert(record.f_datetime_millisecond);
        Test.assertEqual(record.f_datetime_millisecond, '2024-04-20 12:34:56.123');
        Test.assert(record.f_timestamp);
        Test.assertEqual(record.f_timestamp, '2024-04-26 11:22:33');
        Test.assert(record.f_year);
        Test.assertEqual(record.f_year, 2024);
        Test.assert(record.f_char);
        Test.assertEqual(record.f_char, 'abc');
        Test.assert(record.f_varchar);
        Test.assertEqual(record.f_varchar, 'this is a string with escape codes \0\b\t\n\r\x1a\"\'\\');
        Test.assert(record.f_blob);
        Test.assertEqual(record.f_blob[0], 0xF0);
        Test.assertEqual(record.f_blob[1], 0xE1);
        Test.assertEqual(record.f_blob[2], 0xD2);
        Test.assertEqual(record.f_blob[3], 0xC3);
        Test.assertEqual(record.f_blob[4], 0xB4);
        Test.assertEqual(record.f_blob[5], 0xA5);
        Test.assertEqual(record.f_blob[6], 0x96);
        Test.assertEqual(record.f_blob[7], 0x87);
        Test.assertEqual(record.f_blob[8], 0x78);
        Test.assertEqual(record.f_blob[9], 0x69);
        Test.assertEqual(record.f_blob[10], 0x5A);
        Test.assertEqual(record.f_blob[11], 0x4B);
        Test.assertEqual(record.f_blob[12], 0x3C);
        Test.assertEqual(record.f_blob[13], 0x2D);
        Test.assertEqual(record.f_blob[14], 0x1E);
        Test.assertEqual(record.f_blob[15], 0x0F);
        Test.assert(record.f_text);
        Test.assertEqual(record.f_text, 'this is more text with\"double quotes\" and \'single quotes\'.');
        Test.assert(record.f_enum);
        Test.assertEqual(record.f_enum, 'one');
        Test.assert(record.f_json);

        const tJson = { property1: 123, property2: "te\"s\\t", property3: "te\'st" };
        const tText = JSON.stringify(tJson);

        const fJson = JSON.parse(record.f_json);
        const fText = JSON.stringify(fJson);

        Test.assertEqual(fText, tText);
    }

    /**
     * Insert record with values.
     */
    static async testInsertRecordWithValues() {
        // Set description
        Test.describe('testInsertRecordWithValues');

        // Create create table SQL command
        let sqlTemplate = await SqlTemplateFile.getTemplate('./insert.sql', import.meta.url, TestMySql._sqlConfig);
        Test.assert(sqlTemplate);

        // Create values
        const values = {};

        // Add values
        values.testTable = new SqlIdentifier('test');
        values.fBool = false;
        values.fInt = 456;
        values.fDecimal = 3.142;
        values.fDate = new Date(Date.UTC(2024, 3, 20, 11, 35, 23));
        values.fTime = new Date(Date.UTC(2022, 2, 2, 8, 24, 56));
        values.fDatetime = new Date(Date.UTC(2023, 2, 19, 10, 34, 22));
        values.fDatetimeMillisecond = new Date(Date.UTC(2020, 1, 18, 9, 33, 21, 987));
        values.fTimestamp = new Date(Date.UTC(2019, 0, 17, 7, 25, 46));
        values.fYear = 2038;
        values.fChar = 'XYZ';
        values.fVarchar = 'hello \0\b\t\n\r\Z\"\'\\ world';
        values.fBlob = Buffer.from([0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88, 0x99, 0xAA, 0xBB, 0xCC, 0xDD, 0xEE, 0xFF]);
        values.fText = 'testing \"MySQL\' text';
        values.fEnum = 'two';

        // Set JSON
        const fObject = { property1: 567, property2: "te\"st\\2", property3: "te\'st2" };
        values.fJson = new SqlJson(fObject);

        // Format the SQL template with values
        let sql = sqlTemplate.format(values);
        Test.assert(sql);

        // Run the SQL query
        let result = await Database.query(sql);
        Test.assert(result);

        // Create select SQL command
        let sqlSelectTemplate = await SqlTemplateFile.getTemplate('./select.sql', import.meta.url, TestMySql._sqlConfig);
        Test.assert(sqlSelectTemplate);

        // Format the select SQL template (without any values)
        let selectSql = sqlSelectTemplate.format({});
        Test.assert(selectSql);

        // Run the SQL query
        result = await Database.query(selectSql);
        Test.assert(result);
        Test.assertEqual(result.length, 1);

        // Set first (and only) record
        const record = result[0];
        Test.assert(record.f_bool);
        Test.assertEqual(record.f_bool, 0);
        Test.assert(record.f_int);
        Test.assertEqual(record.f_int, 456);
        Test.assert(record.f_decimal);
        Test.assertEqual(record.f_decimal, 3.142);
        Test.assert(record.f_date);
        Test.assertEqual(record.f_date, '2024-04-20');
        Test.assert(record.f_time);
        Test.assertEqual(record.f_time, '08:24:56');
        Test.assert(record.f_datetime);
        Test.assertEqual(record.f_datetime, '2023-03-19 10:34:22');
        Test.assert(record.f_datetime_millisecond);
        Test.assertEqual(record.f_datetime_millisecond, '2020-02-18 09:33:21.987');
        Test.assert(record.f_timestamp);
        Test.assertEqual(record.f_timestamp, '2019-01-17 07:25:46');
        Test.assert(record.f_year);
        Test.assertEqual(record.f_year, 2038);
        Test.assert(record.f_char);
        Test.assertEqual(record.f_char, 'XYZ');
        Test.assert(record.f_varchar);
        Test.assertEqual(record.f_varchar, 'hello \0\b\t\n\r\Z\"\'\\ world');
        Test.assert(record.f_blob);
        Test.assertEqual(record.f_blob[0], 0x00);
        Test.assertEqual(record.f_blob[1], 0x11);
        Test.assertEqual(record.f_blob[2], 0x22);
        Test.assertEqual(record.f_blob[3], 0x33);
        Test.assertEqual(record.f_blob[4], 0x44);
        Test.assertEqual(record.f_blob[5], 0x55);
        Test.assertEqual(record.f_blob[6], 0x66);
        Test.assertEqual(record.f_blob[7], 0x77);
        Test.assertEqual(record.f_blob[8], 0x88);
        Test.assertEqual(record.f_blob[9], 0x99);
        Test.assertEqual(record.f_blob[10], 0xAA);
        Test.assertEqual(record.f_blob[11], 0xBB);
        Test.assertEqual(record.f_blob[12], 0xCC);
        Test.assertEqual(record.f_blob[13], 0xDD);
        Test.assertEqual(record.f_blob[14], 0xEE);
        Test.assertEqual(record.f_blob[15], 0xFF);
        Test.assert(record.f_text);
        Test.assertEqual(record.f_text, 'testing \"MySQL\' text');
        Test.assert(record.f_enum);
        Test.assertEqual(record.f_enum, 'two');
        Test.assert(record.f_json);

        const tJson = JSON.parse(record.f_json);
        const tText = JSON.stringify(tJson);

        const fText = JSON.stringify(fObject);

        Test.assertEqual(tText, fText);
    }
}