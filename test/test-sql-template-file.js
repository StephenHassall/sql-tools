/**
 * Test SQL Template File
 */
import { SqlTemplateFile } from "../sql-template-file.js";
import Test from "./test.js";

export default class TestSqlTemplate {
    /**
     * Run all the SQL template file tests.
     */
    static async run() {
        // Set test
        Test.test('SqlTemplateFile');

        // Perform tests
        await TestSqlTemplate.testGetTemplate();
        await TestSqlTemplate.testGetTemplateByName();
    }

    /**
     * Test the get template function.
     */
    static async testGetTemplate() {
        // Get template using relative path
        Test.describe('getTemplate file naming');
        let sqlTemplate = await SqlTemplateFile.getTemplate('./sql/template.sql', import.meta.url);
        Test.assert(sqlTemplate);
        sqlTemplate = await SqlTemplateFile.getTemplate('/sql/template.sql', import.meta.url);
        Test.assert(sqlTemplate);
        sqlTemplate = await SqlTemplateFile.getTemplate('sql/template.sql', import.meta.url);
        Test.assert(sqlTemplate);

        // Get templaure using full path
        Test.describe('getTemplate full path');
        sqlTemplate = await SqlTemplateFile.getTemplate('./test/sql/template.sql');
        Test.assert(sqlTemplate);

        // Get templaure using full path without using cache
        Test.describe('getTemplate full path without using cache');
        sqlTemplate = await SqlTemplateFile.getTemplate('./sql/template.sql', import.meta.url, false);
        Test.assert(sqlTemplate);
    }

    /**
     * Test the get template by name function.
     */
    static async testGetTemplateByName() {
        // Get template by name
        Test.describe('getTemplateByName');
        let sqlTemplate = await SqlTemplateFile.getTemplateByName('first', './sql/template-by-name.sql', import.meta.url);
        Test.assert(sqlTemplate);
        let sql = sqlTemplate.format({});
        Test.assertEqual(sql, 'SELECT field1 FROM table1;');
        sqlTemplate = await SqlTemplateFile.getTemplateByName('second', './sql/template-by-name.sql', import.meta.url);
        Test.assert(sqlTemplate);
        sql = sqlTemplate.format({});
        Test.assertEqual(sql, 'SELECT field2 FROM table2;');

        // Check errors
        Test.describe('getTemplateByName errors');
        try {
            template = await SqlTemplateFile.getTemplateByName('missing-does-not-exist', './sql/template-by-name.sql', import.meta.url);   
            Test.assert();
        } catch (e) {
            Test.assertEqual(e.message, 'Template not found');
        }

        try {
            template = await SqlTemplateFile.getTemplateByName('missingEnd', './sql/template-by-name.sql', import.meta.url);   
            Test.assert();
        } catch (e) {
            Test.assertEqual(e.message, 'Missing endtemplate');
        }
    }
}
