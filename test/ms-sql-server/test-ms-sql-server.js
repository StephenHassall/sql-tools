/**
 * Test Microsoft SQL Server database parts
 */
import { SqlConfig, DatabaseType } from "../../sql-config.js";
import { SqlJson, SqlIdentifier } from "../../sql-convert.js";
import { SqlTemplate } from "../../sql-template.js";
import { SqlTemplateFile } from "../../sql-template-file.js";
import Database from "./database.js";
import Test from "./../test.js";

export default class TestMsSqlServer {
    /**
     * Run all the Microsoft SQL server tests.
     */
    static async run() {
        // Set test
        Test.test('MsSqlServer');

        // Set SqlConfig for Microsoft SQL Server database
        TestMsSqlServer._sqlConfig = new SqlConfig();
        TestMsSqlServer._sqlConfig.databaseType = DatabaseType.MS_SQL_SERVER;

        // Initialize the database connection
        Database.initialize();

        // Perform tests
        await TestMsSqlServer.testCreateTable();
        await TestMsSqlServer.testInsertSampleRecord();
        //await TestMsSqlServer.testInsertRecordWithValues();
    }

    /**
     * Create (or recreate) the table.
     */
    static async testCreateTable() {
        // Set description
        Test.describe('testCreateTable');

        // Create create table SQL command
        let sqlTemplate = await SqlTemplateFile.getTemplate('./create-table.sql', import.meta.url, TestMsSqlServer._sqlConfig);
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
        let sqlTemplate = await SqlTemplateFile.getTemplate('./insert-sample.sql', import.meta.url, TestMsSqlServer._sqlConfig);
        Test.assert(sqlTemplate);

        // Format the SQL template (without any values)
        let sql = sqlTemplate.format({});
        Test.assert(sql);

        // Run the SQL query
        let result = await Database.query(sql);
        Test.assert(result);

        // Create select SQL command
        let sqlSelectTemplate = await SqlTemplateFile.getTemplate('./select.sql', import.meta.url, TestMsSqlServer._sqlConfig);
        Test.assert(sqlSelectTemplate);

        // Format the select SQL template (without any values)
        let selectSql = sqlSelectTemplate.format({});
        Test.assert(selectSql);

        // Run the SQL query
        result = await Database.query(selectSql);
        Test.assert(result);
        Test.assertEqual(result.recordset.length, 1);

        // Set first (and only) record
        const record = result.recordset[0];
        Test.assert(record.f_decimal);
        Test.assertEqual(record.f_decimal, 12.3456);
        Test.assert(record.f_int);
        Test.assertEqual(record.f_int, 123);
        Test.assert(record.f_bit);
        Test.assertEqual(record.f_bit, true);
        Test.assert(record.f_float);
        Test.assertEqual(record.f_float, 123.45);
        Test.assert(record.f_real);
        Test.assertEqual(record.f_real.toFixed(2), '678.91');
        Test.assert(record.f_date);
        Test.assertEqual(record.f_date.getUTCFullYear(), 2022);
        Test.assertEqual(record.f_date.getUTCMonth(), 10);
        Test.assertEqual(record.f_date.getUTCDate(), 1);
        Test.assert(record.f_datetime);
        Test.assertEqual(record.f_datetime.getUTCFullYear(), 2023);
        Test.assertEqual(record.f_datetime.getUTCMonth(), 2);
        Test.assertEqual(record.f_datetime.getUTCDate(), 19);
        Test.assertEqual(record.f_datetime.getUTCHours(), 1);
        Test.assertEqual(record.f_datetime.getUTCMinutes(), 23);
        Test.assertEqual(record.f_datetime.getUTCSeconds(), 45);
        Test.assertEqual(record.f_datetime.getUTCMilliseconds(), 987);
        Test.assert(record.f_datetime2);
        Test.assertEqual(record.f_datetime2.getUTCFullYear(), 2024);
        Test.assertEqual(record.f_datetime2.getUTCMonth(), 3);
        Test.assertEqual(record.f_datetime2.getUTCDate(), 20);
        Test.assertEqual(record.f_datetime2.getUTCHours(), 12);
        Test.assertEqual(record.f_datetime2.getUTCMinutes(), 34);
        Test.assertEqual(record.f_datetime2.getUTCSeconds(), 56);
        Test.assertEqual(record.f_datetime2.getUTCMilliseconds(), 123);
        Test.assert(record.f_time);
        Test.assertEqual(record.f_time.getUTCHours(), 12);
        Test.assertEqual(record.f_time.getUTCMinutes(), 34);
        Test.assertEqual(record.f_time.getUTCSeconds(), 56);
        Test.assert(record.f_char);
        Test.assertEqual(record.f_char, 'abc');
        Test.assert(record.f_varchar);
        Test.assertEqual(record.f_varchar, 'this is a string with escape code \' single quotation mark');
        Test.assert(record.f_nchar);
        Test.assertEqual(record.f_nchar.trim(), 'XYZ');
        Test.assert(record.f_nvarchar);
        Test.assertEqual(record.f_nvarchar, 'this is a unicode string with escape code \' single quotation mark');
        Test.assert(record.f_varbinary);
        Test.assertEqual(record.f_varbinary[0], 0xF0);
        Test.assertEqual(record.f_varbinary[1], 0xE1);
        Test.assertEqual(record.f_varbinary[2], 0xD2);
        Test.assertEqual(record.f_varbinary[3], 0xC3);
        Test.assertEqual(record.f_varbinary[4], 0xB4);
        Test.assertEqual(record.f_varbinary[5], 0xA5);
        Test.assertEqual(record.f_varbinary[6], 0x96);
        Test.assertEqual(record.f_varbinary[7], 0x87);
        Test.assertEqual(record.f_varbinary[8], 0x78);
        Test.assertEqual(record.f_varbinary[9], 0x69);
        Test.assertEqual(record.f_varbinary[10], 0x5A);
        Test.assertEqual(record.f_varbinary[11], 0x4B);
        Test.assertEqual(record.f_varbinary[12], 0x3C);
        Test.assertEqual(record.f_varbinary[13], 0x2D);
        Test.assertEqual(record.f_varbinary[14], 0x1E);
        Test.assertEqual(record.f_varbinary[15], 0x0F);
        Test.assert(record.f_uniqueidentifier);
        Test.assertEqual(record.f_uniqueidentifier, 'A0EEBC99-9C0B-4EF8-BB6D-6BB9BD380A11');

        const tJson = { property1: 123, property2: "te\"s\\t", property3: "te\'st" };
        const tText = JSON.stringify(tJson);

        const fJson = JSON.parse(record.f_nvarchar_json);
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
        let sqlTemplate = await SqlTemplateFile.getTemplate('./insert.sql', import.meta.url, TestMsSqlServer._sqlConfig);
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
        let sqlSelectTemplate = await SqlTemplateFile.getTemplate('./select.sql', import.meta.url, TestMsSqlServer._sqlConfig);
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