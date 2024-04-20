/**
 * Test SQL Convert
 */
import { SqlConvert } from "../sql-convert.js";
import Test from "./test.js";

export default class TestSqlConvert {
    /**
     * Run all the SQL convert tests.
     */
    static run() {
        // Set test
        Test.test('SqlConvert');

        // Perform tests
        TestSqlTemplate.testGetTemplate();
    }

    /**
     * Test basics.
     */
    static testBasics() {
        // Text the basics
        Test.describe('valueToSql basics');
        const sql = SqlConvert.valueToSql(undefined);
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

    }
}