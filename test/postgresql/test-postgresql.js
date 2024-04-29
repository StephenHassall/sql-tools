/**
 * Test PostgreSQL database parts
 */
import { SqlConfig, DatabaseType } from "../../sql-config.js";
import { SqlJson, SqlIdentifier } from "../../sql-convert.js";
import { SqlTemplate } from "../../sql-template.js";
import { SqlTemplateFile } from "../../sql-template-file.js";
import Database from "./database.js";
import Test from "./../test.js";

export default class TestPostgreSql {
    /**
     * Run all the PostgreSQL tests.
     */
    static async run() {
        // Set test
        Test.test('PostgreSQL');

        // Set SqlConfig for PostgreSQL database
        TestPostgreSql._sqlConfig = new SqlConfig();
        TestPostgreSql._sqlConfig.databaseType = DatabaseType.POSTGRESQL;

        // Initialize the database connection
        Database.initialize();

        // Perform tests
        await TestPostgreSql.testCreateTable();
        await TestPostgreSql.testInsertSampleRecord();
        await TestPostgreSql.testInsertRecordWithValues();
    }

    /**
     * Create (or recreate) the table.
     */
    static async testCreateTable() {
        // Set description
        Test.describe('testCreateTable');

        // Create create table SQL command
        let sqlTemplate = await SqlTemplateFile.getTemplate('./create-table.sql', import.meta.url, TestPostgreSql._sqlConfig);
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
        let sqlTemplate = await SqlTemplateFile.getTemplate('./insert-sample.sql', import.meta.url, TestPostgreSql._sqlConfig);
        Test.assert(sqlTemplate);

        // Format the SQL template (without any values)
        let sql = sqlTemplate.format({});
        Test.assert(sql);

        // Run the SQL query
        let result = await Database.query(sql);
        Test.assert(result);

        // Create select SQL command
        let sqlSelectTemplate = await SqlTemplateFile.getTemplate('./select.sql', import.meta.url, TestPostgreSql._sqlConfig);
        Test.assert(sqlSelectTemplate);

        // Format the select SQL template (without any values)
        let selectSql = sqlSelectTemplate.format({});
        Test.assert(selectSql);

        // Run the SQL query
        result = await Database.query(selectSql);
        Test.assert(result);
        Test.assert(result.rows);
        Test.assertEqual(result.rows.length, 1);

        // Set first (and only) record
        const record = result.rows[0];
        Test.assert(record.f_boolean);
        Test.assertEqual(record.f_boolean, true);
        Test.assert(record.f_integer);
        Test.assertEqual(record.f_integer, 123);
        Test.assert(record.f_decimal);
        Test.assertEqual(record.f_decimal, '12.3456');
        Test.assert(record.f_date);
        Test.assertEqual(record.f_date.getFullYear(), 2024);
        Test.assertEqual(record.f_date.getMonth(), 3);
        Test.assertEqual(record.f_date.getDate(), 19);
        Test.assert(record.f_time);
        Test.assertEqual(record.f_time, '12:34:56');
        Test.assert(record.f_timestamp);
        Test.assertEqual(record.f_timestamp.getFullYear(), 2024);
        Test.assertEqual(record.f_timestamp.getMonth(), 3);
        Test.assertEqual(record.f_timestamp.getDate(), 20);
        Test.assertEqual(record.f_timestamp.getHours(), 12);
        Test.assertEqual(record.f_timestamp.getMinutes(), 34);
        Test.assertEqual(record.f_timestamp.getSeconds(), 56);
        Test.assertEqual(record.f_timestamp.getMilliseconds(), 123);
        Test.assert(record.f_char);
        Test.assertEqual(record.f_char, 'abc');
        Test.assert(record.f_varchar);
        Test.assertEqual(record.f_varchar, 'this is a string with escape codes \b\f\n\r\t\"\'\\');
        Test.assert(record.f_text);
        Test.assertEqual(record.f_text, 'this is more text with\"double quotes\" and \'single quotes\'.');
        Test.assert(record.f_bytea);
        Test.assertEqual(record.f_bytea[0], 0xF0);
        Test.assertEqual(record.f_bytea[1], 0xE1);
        Test.assertEqual(record.f_bytea[2], 0xD2);
        Test.assertEqual(record.f_bytea[3], 0xC3);
        Test.assertEqual(record.f_bytea[4], 0xB4);
        Test.assertEqual(record.f_bytea[5], 0xA5);
        Test.assertEqual(record.f_bytea[6], 0x96);
        Test.assertEqual(record.f_bytea[7], 0x87);
        Test.assertEqual(record.f_bytea[8], 0x78);
        Test.assertEqual(record.f_bytea[9], 0x69);
        Test.assertEqual(record.f_bytea[10], 0x5A);
        Test.assertEqual(record.f_bytea[11], 0x4B);
        Test.assertEqual(record.f_bytea[12], 0x3C);
        Test.assertEqual(record.f_bytea[13], 0x2D);
        Test.assertEqual(record.f_bytea[14], 0x1E);
        Test.assertEqual(record.f_bytea[15], 0x0F);
        Test.assert(record.f_enum);
        Test.assertEqual(record.f_enum, 'one');
        Test.assert(record.f_json);

        const tJson = { property1: 123, property2: "te\"s\\t", property3: "te\'st" };
        const tText = JSON.stringify(tJson);

        const fText = JSON.stringify(record.f_json);

        Test.assertEqual(fText, tText);

        Test.assert(record.f_array1);
        Test.assertEqual(record.f_array1.length, 3);
        Test.assertEqual(record.f_array1[0], 123);
        Test.assertEqual(record.f_array1[1], 456);
        Test.assertEqual(record.f_array1[2], 789);
        Test.assert(record.f_array2);
        Test.assertEqual(record.f_array2.length, 2);
        Test.assertEqual(record.f_array2[0].length, 2);
        Test.assertEqual(record.f_array2[0][0], 'test1.1');
        Test.assertEqual(record.f_array2[0][1], 'test1.2');
        Test.assertEqual(record.f_array2[1].length, 2);
        Test.assertEqual(record.f_array2[1][0], 'test2.1');
        Test.assertEqual(record.f_array2[1][1], 'test2.2');

        Test.assert(record.f_uuid);
        Test.assertEqual(record.f_uuid, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
    }

    /**
     * Insert record with values.
     */
    static async testInsertRecordWithValues() {
        // Set description
        Test.describe('testInsertRecordWithValues');

        // Create create table SQL command
        let sqlTemplate = await SqlTemplateFile.getTemplate('./insert.sql', import.meta.url, TestPostgreSql._sqlConfig);
        Test.assert(sqlTemplate);

        // Create values
        const values = {};

        // Add values
        values.testTable = new SqlIdentifier('test')
        values.fBoolean = false;
        values.fInteger = 456;
        values.fDecimal = 3.142;
        values.fDate = new Date(Date.UTC(2024, 3, 20, 11, 35, 23));
        values.fTime = new Date(Date.UTC(2022, 2, 2, 8, 24, 56));
        values.fTimestamp = new Date(Date.UTC(2019, 0, 17, 7, 25, 46, 987));
        values.fChar = 'XYZ';
        values.fVarchar = 'hello \b\f\n\r\t\"\'\\ world';
        values.fText = 'testing \"MySQL\' text';
        values.fBytea = Buffer.from([0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88, 0x99, 0xAA, 0xBB, 0xCC, 0xDD, 0xEE, 0xFF]);
        values.fEnum = 'two';
        values.fArray1 = [11, 22, 33, 44];
        values.fArray2 = [['hello', 'world'],['abc', 'def']];
        values.fUuuid = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';

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
        let sqlSelectTemplate = await SqlTemplateFile.getTemplate('./select.sql', import.meta.url, TestPostgreSql._sqlConfig);
        Test.assert(sqlSelectTemplate);

        // Format the select SQL template (without any values)
        let selectSql = sqlSelectTemplate.format({});
        Test.assert(selectSql);

        // Run the SQL query
        result = await Database.query(selectSql);
        Test.assert(result);
        Test.assert(result.rows);
        Test.assertEqual(result.rows.length, 1);

        // Set first (and only) record
        const record = result.rows[0];
        Test.assert(record.f_boolean);
        Test.assertEqual(record.f_boolean, false);
        Test.assert(record.f_integer);
        Test.assertEqual(record.f_integer, 456);
        Test.assert(record.f_decimal);
        Test.assertEqual(record.f_decimal, '3.1420');
        Test.assert(record.f_date);
        Test.assertEqual(record.f_date.getFullYear(), 2024);
        Test.assertEqual(record.f_date.getMonth(), 3);
        Test.assertEqual(record.f_date.getDate(), 20);
        Test.assert(record.f_time);
        Test.assertEqual(record.f_time, '08:24:56');
        Test.assert(record.f_timestamp);
        Test.assertEqual(record.f_timestamp.getFullYear(), 2019);
        Test.assertEqual(record.f_timestamp.getMonth(), 0);
        Test.assertEqual(record.f_timestamp.getDate(), 17);
        Test.assertEqual(record.f_timestamp.getHours(), 7);
        Test.assertEqual(record.f_timestamp.getMinutes(), 25);
        Test.assertEqual(record.f_timestamp.getSeconds(), 46);
        Test.assertEqual(record.f_timestamp.getMilliseconds(), 987);
        Test.assert(record.f_char);
        Test.assertEqual(record.f_char, 'XYZ');
        Test.assert(record.f_varchar);
        Test.assertEqual(record.f_varchar, 'hello \b\f\n\r\t\"\'\\ world');
        Test.assert(record.f_text);
        Test.assertEqual(record.f_text, 'testing \"MySQL\' text');
        Test.assert(record.f_bytea);
        Test.assertEqual(record.f_bytea[0], 0x00);
        Test.assertEqual(record.f_bytea[1], 0x11);
        Test.assertEqual(record.f_bytea[2], 0x22);
        Test.assertEqual(record.f_bytea[3], 0x33);
        Test.assertEqual(record.f_bytea[4], 0x44);
        Test.assertEqual(record.f_bytea[5], 0x55);
        Test.assertEqual(record.f_bytea[6], 0x66);
        Test.assertEqual(record.f_bytea[7], 0x77);
        Test.assertEqual(record.f_bytea[8], 0x88);
        Test.assertEqual(record.f_bytea[9], 0x99);
        Test.assertEqual(record.f_bytea[10], 0xAA);
        Test.assertEqual(record.f_bytea[11], 0xBB);
        Test.assertEqual(record.f_bytea[12], 0xCC);
        Test.assertEqual(record.f_bytea[13], 0xDD);
        Test.assertEqual(record.f_bytea[14], 0xEE);
        Test.assertEqual(record.f_bytea[15], 0xFF);
        Test.assert(record.f_enum);
        Test.assertEqual(record.f_enum, 'two');
        Test.assert(record.f_json);

        const fText = JSON.stringify(record.f_json);
        const tText = JSON.stringify(fObject);

        Test.assertEqual(tText, fText);

        Test.assert(record.f_array1);
        Test.assertEqual(record.f_array1.length, 4);
        Test.assertEqual(record.f_array1[0], 11);
        Test.assertEqual(record.f_array1[1], 22);
        Test.assertEqual(record.f_array1[2], 33);
        Test.assertEqual(record.f_array1[3], 44);
        Test.assert(record.f_array2);
        Test.assertEqual(record.f_array2.length, 2);
        Test.assertEqual(record.f_array2[0].length, 2);
        Test.assertEqual(record.f_array2[0][0], 'hello');
        Test.assertEqual(record.f_array2[0][1], 'world');
        Test.assertEqual(record.f_array2[1].length, 2);
        Test.assertEqual(record.f_array2[1][0], 'abc');
        Test.assertEqual(record.f_array2[1][1], 'def');

        Test.assert(record.f_uuid);
        Test.assertEqual(record.f_uuid, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22');
    }
}