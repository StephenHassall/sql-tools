/**
 * Test SQL Template.
 */
import { BlockType } from "../block.js";
import { readFile } from "node:fs/promises";
import { SqlTemplate } from "../sql-template.js";
import { SqlTemplateFile } from "../sql-template-file.js";
import Test from "./test.js";

export default class TestSqlTemplate {
    /**
     * Run all the SQL template tests.
     */
    static async run() {
        // Set test
        Test.test('SqlTemplate');

        // Perform tests
        await TestSqlTemplate.testCreateBlockList();
        await TestSqlTemplate.testCreateBlockTree();
        await TestSqlTemplate.testCheckBlockTreeError();
        await TestSqlTemplate.testProcessBlockTree();
    }

    /**
     * Test the create block list.
     */
    static async testCreateBlockList() {
        // Test block list 1
        Test.describe('createBlockList blockList1.sql');
        let template = await readFile('./test/sql/blockList1.sql', { encoding: 'utf8' });
        Test.assert(template);
        let sqlTemplate = new SqlTemplate('true');
        sqlTemplate._template = template;
        let blockList = sqlTemplate._createBlockList();
        Test.assert(blockList);
        Test.assertEqual(blockList.length, 11);
        Test.assertEqual(blockList[0].blockType, BlockType.TEXT);
        Test.assertEqual(blockList[0].text,'block1\r\n');
        Test.assertEqual(blockList[1].blockType, BlockType.IF);
        Test.assertEqual(blockList[2].blockType, BlockType.TEXT);
        Test.assertEqual(blockList[2].text,'block2\r\n');
        Test.assertEqual(blockList[3].blockType, BlockType.ELIF);
        Test.assertEqual(blockList[4].blockType, BlockType.TEXT);
        Test.assertEqual(blockList[4].text,'block3\r\n');
        Test.assertEqual(blockList[5].blockType, BlockType.ELIF);
        Test.assertEqual(blockList[6].blockType, BlockType.TEXT);
        Test.assertEqual(blockList[6].text,'block4\r\n');
        Test.assertEqual(blockList[7].blockType, BlockType.ELSE);
        Test.assertEqual(blockList[8].blockType, BlockType.TEXT);
        Test.assertEqual(blockList[8].text,'block5\r\n');
        Test.assertEqual(blockList[9].blockType, BlockType.ENDIF);
        Test.assertEqual(blockList[10].blockType, BlockType.TEXT);
        Test.assertEqual(blockList[10].text,'block6');

        // Test block list 2
        Test.describe('createBlockList blockList2.sql');
        template = await readFile('./test/sql/blockList2.sql', { encoding: 'utf8' });
        Test.assert(template);
        sqlTemplate = new SqlTemplate('true');
        sqlTemplate._template = template;
        blockList = sqlTemplate._createBlockList();
        Test.assert(blockList);
        Test.assertEqual(blockList.length, 11);
        Test.assertEqual(blockList[0].blockType, BlockType.IF);
        Test.assertEqual(blockList[1].blockType, BlockType.TEXT);
        Test.assertEqual(blockList[1].text,'block1\r\n');
        Test.assertEqual(blockList[2].blockType, BlockType.IF);
        Test.assertEqual(blockList[3].blockType, BlockType.TEXT);
        Test.assertEqual(blockList[3].text,'block2\r\n');
        Test.assertEqual(blockList[4].blockType, BlockType.ELIF);
        Test.assertEqual(blockList[5].blockType, BlockType.TEXT);
        Test.assertEqual(blockList[5].text,'block3\r\n');
        Test.assertEqual(blockList[6].blockType, BlockType.ELIF);
        Test.assertEqual(blockList[7].blockType, BlockType.TEXT);
        Test.assertEqual(blockList[7].text,'block4\r\n');
        Test.assertEqual(blockList[8].blockType, BlockType.ELSE);
        Test.assertEqual(blockList[9].blockType, BlockType.TEXT);
        Test.assertEqual(blockList[9].text,'block5\r\n');
        Test.assertEqual(blockList[10].blockType, BlockType.ENDIF);

        // Test block list 3
        Test.describe('createBlockList blockList3.sql');
        template = await readFile('./test/sql/blockList3.sql', { encoding: 'utf8' });
        Test.assert(template);
        sqlTemplate = new SqlTemplate('true');
        sqlTemplate._template = template;
        blockList = sqlTemplate._createBlockList();
        Test.assert(blockList);
        Test.assertEqual(blockList.length, 8);
        Test.assertEqual(blockList[0].blockType, BlockType.IF);
        Test.assertEqual(blockList[1].blockType, BlockType.IF);
        Test.assertEqual(blockList[2].blockType, BlockType.ELIF);
        Test.assertEqual(blockList[3].blockType, BlockType.ELIF);
        Test.assertEqual(blockList[4].blockType, BlockType.ELSE);
        Test.assertEqual(blockList[5].blockType, BlockType.ELSE);
        Test.assertEqual(blockList[6].blockType, BlockType.ENDIF);
        Test.assertEqual(blockList[7].blockType, BlockType.ENDIF);

        // Test block list 4
        Test.describe('createBlockList blockList4.sql');
        template = await readFile('./test/sql/blockList4.sql', { encoding: 'utf8' });
        Test.assert(template);
        sqlTemplate = new SqlTemplate('true');
        sqlTemplate._template = template;
        blockList = sqlTemplate._createBlockList();
        Test.assert(blockList);
        Test.assertEqual(blockList.length, 1);
        Test.assertEqual(blockList[0].blockType, BlockType.TEXT);
        Test.assertEqual(blockList[0].text,'no preprocessor');

        // Test block list 5
        Test.describe('createBlockList blockList5.sql');
        template = await readFile('./test/sql/blockList5.sql', { encoding: 'utf8' });
        Test.assert(template);
        sqlTemplate = new SqlTemplate('true');
        sqlTemplate._template = template;
        blockList = sqlTemplate._createBlockList();
        Test.assert(blockList);
        Test.assertEqual(blockList.length, 11);
        Test.assertEqual(blockList[0].blockType, BlockType.IF);
        Test.assertEqual(blockList[1].blockType, BlockType.TEXT);
        Test.assertEqual(blockList[1].text,'block1\r\n');
        Test.assertEqual(blockList[2].blockType, BlockType.IF);
        Test.assertEqual(blockList[3].blockType, BlockType.TEXT);
        Test.assertEqual(blockList[3].text,'block2\r\n');
        Test.assertEqual(blockList[4].blockType, BlockType.ELIF);
        Test.assertEqual(blockList[5].blockType, BlockType.TEXT);
        Test.assertEqual(blockList[5].text,'block3\r\n');
        Test.assertEqual(blockList[6].blockType, BlockType.ELIF);
        Test.assertEqual(blockList[7].blockType, BlockType.TEXT);
        Test.assertEqual(blockList[7].text,'block4\r\n');
        Test.assertEqual(blockList[8].blockType, BlockType.ELSE);
        Test.assertEqual(blockList[9].blockType, BlockType.TEXT);
        Test.assertEqual(blockList[9].text,'block5\r\n');
        Test.assertEqual(blockList[10].blockType, BlockType.ENDIF);
    }

    /**
     * Test the create block tree.
     */
    static async testCreateBlockTree() {
        // Test block tree 1
        Test.describe('createBlockTree blockTree1.sql');
        let template = await readFile('./test/sql/blockTree1.sql', { encoding: 'utf8' });
        Test.assert(template);
        let sqlTemplate = new SqlTemplate('true');
        sqlTemplate._template = template;
        let blockList = sqlTemplate._createBlockList();
        Test.assert(blockList);
        let blockTree = sqlTemplate._createBlockTree(blockList);
        Test.assert(blockTree);
        Test.assertEqual(blockTree.blockType, BlockType.PARENT);
        Test.assertEqual(blockTree.blockList.length, 3);
        Test.assertEqual(blockTree.blockList[0].blockType, BlockType.TEXT);
        Test.assertEqual(blockTree.blockList[0].text, 'block1\r\n');
        Test.assertEqual(blockTree.blockList[1].blockType, BlockType.PARENT);
        Test.assertEqual(blockTree.blockList[1].blockList.length, 3);
        Test.assertEqual(blockTree.blockList[1].blockList[0].blockType, BlockType.IF);
        Test.assertEqual(blockTree.blockList[1].blockList[1].blockType, BlockType.TEXT);
        Test.assertEqual(blockTree.blockList[1].blockList[1].text, 'block2\r\n');
        Test.assertEqual(blockTree.blockList[1].blockList[2].blockType, BlockType.ENDIF);
        Test.assertEqual(blockTree.blockList[2].blockType, BlockType.TEXT);
        Test.assertEqual(blockTree.blockList[2].text, 'block3');

        /*
            Test block tree 2. The block tree should look something like this:
            
            +root
            |-block1
            |-P
            |-|-#if
            |-|-block2
            |-|-P
            |-|-|-#if
            |-|-|-block3
            |-|-|-#endif
            |-|-block4
            |-|-P
            |-|-|-#if
            |-|-|-block5
            |-|-|-#endif
            |-|-block6
            |-|-#endif
            |-block5
            |-P
            |-|-#if
            |-|-block6
            |-|-#endif
            |-block7
        */
        Test.describe('createBlockTree blockTree2.sql');
        template = await readFile('./test/sql/blockTree2.sql', { encoding: 'utf8' });
        Test.assert(template);
        sqlTemplate = new SqlTemplate('true');
        sqlTemplate._template = template;
        blockList = sqlTemplate._createBlockList();
        Test.assert(blockList);
        blockTree = sqlTemplate._createBlockTree(blockList);
        Test.assert(blockTree);
        Test.assertEqual(blockTree.blockType, BlockType.PARENT);
        Test.assertEqual(blockTree.blockList.length, 5);
        Test.assertEqual(blockTree.blockList[0].blockType, BlockType.TEXT);
        Test.assertEqual(blockTree.blockList[0].text, 'block1\r\n');
        Test.assertEqual(blockTree.blockList[1].blockType, BlockType.PARENT);
        Test.assertEqual(blockTree.blockList[2].blockType, BlockType.TEXT);
        Test.assertEqual(blockTree.blockList[2].text, 'block5\r\n');
        Test.assertEqual(blockTree.blockList[3].blockType, BlockType.PARENT);
        Test.assertEqual(blockTree.blockList[4].blockType, BlockType.TEXT);
        Test.assertEqual(blockTree.blockList[4].text, 'block7');

        Test.assertEqual(blockTree.blockList[1].blockList.length, 7);
        Test.assertEqual(blockTree.blockList[1].blockList[0].blockType, BlockType.IF);
        Test.assertEqual(blockTree.blockList[1].blockList[1].blockType, BlockType.TEXT);
        Test.assertEqual(blockTree.blockList[1].blockList[1].text, 'block2\r\n');
        Test.assertEqual(blockTree.blockList[1].blockList[2].blockType, BlockType.PARENT);
        Test.assertEqual(blockTree.blockList[1].blockList[3].blockType, BlockType.TEXT);
        Test.assertEqual(blockTree.blockList[1].blockList[3].text, 'block4\r\n');
        Test.assertEqual(blockTree.blockList[1].blockList[4].blockType, BlockType.PARENT);
        Test.assertEqual(blockTree.blockList[1].blockList[5].blockType, BlockType.TEXT);
        Test.assertEqual(blockTree.blockList[1].blockList[5].text, 'block6\r\n');

        Test.assertEqual(blockTree.blockList[1].blockList[2].blockList.length, 3);
        Test.assertEqual(blockTree.blockList[1].blockList[2].blockList[0].blockType, BlockType.IF);
        Test.assertEqual(blockTree.blockList[1].blockList[2].blockList[1].blockType, BlockType.TEXT);
        Test.assertEqual(blockTree.blockList[1].blockList[2].blockList[1].text, 'block3\r\n');
        Test.assertEqual(blockTree.blockList[1].blockList[2].blockList[2].blockType, BlockType.ENDIF);

        Test.assertEqual(blockTree.blockList[1].blockList[4].blockList.length, 3);
        Test.assertEqual(blockTree.blockList[1].blockList[4].blockList[0].blockType, BlockType.IF);
        Test.assertEqual(blockTree.blockList[1].blockList[4].blockList[1].blockType, BlockType.TEXT);
        Test.assertEqual(blockTree.blockList[1].blockList[4].blockList[1].text, 'block5\r\n');
        Test.assertEqual(blockTree.blockList[1].blockList[4].blockList[2].blockType, BlockType.ENDIF);

        Test.assertEqual(blockTree.blockList[3].blockList.length, 3);
        Test.assertEqual(blockTree.blockList[3].blockList[0].blockType, BlockType.IF);
        Test.assertEqual(blockTree.blockList[3].blockList[1].blockType, BlockType.TEXT);
        Test.assertEqual(blockTree.blockList[3].blockList[1].text, 'block6\r\n');
        Test.assertEqual(blockTree.blockList[3].blockList[2].blockType, BlockType.ENDIF);
    }

    /**
     * Test the check block tree error.
     */
    static async testCheckBlockTreeError() {
        // Test block tree 1
        Test.describe('checkBlockTreeError blockTreeError1.sql');
        let template = await readFile('./test/sql/blockTreeError1.sql', { encoding: 'utf8' });
        Test.assert(template);
        let sqlTemplate = new SqlTemplate('true');
        sqlTemplate._template = template;
        let blockList = sqlTemplate._createBlockList();
        Test.assert(blockList);
        let blockTree = sqlTemplate._createBlockTree(blockList);
        Test.assert(blockTree);
        try {
            sqlTemplate._checkBlockTreeErrors(blockTree);
        } catch (e) {
            Test.assertEqual(e.message, 'Has #if but missing #endif. Line 2');
        }

        // Test block tree 2
        Test.describe('checkBlockTreeError blockTreeError2.sql');
        template = await readFile('./test/sql/blockTreeError2.sql', { encoding: 'utf8' });
        Test.assert(template);
        sqlTemplate = new SqlTemplate('true');
        sqlTemplate._template = template;
        blockList = sqlTemplate._createBlockList();
        Test.assert(blockList);
        blockTree = sqlTemplate._createBlockTree(blockList);
        Test.assert(blockTree);
        try {
            sqlTemplate._checkBlockTreeErrors(blockTree);
        } catch (e) {
            Test.assertEqual(e.message, 'Cannot have #endif without #if. Line 2');
        }

        // Test block tree 3
        Test.describe('checkBlockTreeError blockTreeError3.sql');
        template = await readFile('./test/sql/blockTreeError3.sql', { encoding: 'utf8' });
        Test.assert(template);
        sqlTemplate = new SqlTemplate('true');
        sqlTemplate._template = template;
        blockList = sqlTemplate._createBlockList();
        Test.assert(blockList);
        blockTree = sqlTemplate._createBlockTree(blockList);
        Test.assert(blockTree);
        try {
            sqlTemplate._checkBlockTreeErrors(blockTree);
        } catch (e) {
            Test.assertEqual(e.message, 'Has #if but missing #endif. Line 2');
        }

        // Test block tree 4
        Test.describe('checkBlockTreeError blockTreeError4.sql');
        template = await readFile('./test/sql/blockTreeError4.sql', { encoding: 'utf8' });
        Test.assert(template);
        sqlTemplate = new SqlTemplate('true');
        sqlTemplate._template = template;
        blockList = sqlTemplate._createBlockList();
        Test.assert(blockList);
        blockTree = sqlTemplate._createBlockTree(blockList);
        Test.assert(blockTree);
        try {
            sqlTemplate._checkBlockTreeErrors(blockTree);
        } catch (e) {
            Test.assertEqual(e.message, 'Cannot have #endif without #if. Line 6');
        }

        // Test block tree 5
        Test.describe('checkBlockTreeError blockTreeError5.sql');
        template = await readFile('./test/sql/blockTreeError5.sql', { encoding: 'utf8' });
        Test.assert(template);
        sqlTemplate = new SqlTemplate('true');
        sqlTemplate._template = template;
        blockList = sqlTemplate._createBlockList();
        Test.assert(blockList);
        blockTree = sqlTemplate._createBlockTree(blockList);
        Test.assert(blockTree);
        try {
            sqlTemplate._checkBlockTreeErrors(blockTree);
        } catch (e) {
            Test.assertEqual(e.message, 'Cannot have #else without #if. Line 2');
        }

        // Test block tree 6
        Test.describe('checkBlockTreeError blockTreeError6.sql');
        template = await readFile('./test/sql/blockTreeError6.sql', { encoding: 'utf8' });
        Test.assert(template);
        sqlTemplate = new SqlTemplate('true');
        sqlTemplate._template = template;
        blockList = sqlTemplate._createBlockList();
        Test.assert(blockList);
        blockTree = sqlTemplate._createBlockTree(blockList);
        Test.assert(blockTree);
        try {
            sqlTemplate._checkBlockTreeErrors(blockTree);
        } catch (e) {
            Test.assertEqual(e.message, 'Cannot have #elif without #if. Line 2');
        }

        // Test block tree 7
        Test.describe('checkBlockTreeError blockTreeError7.sql');
        template = await readFile('./test/sql/blockTreeError7.sql', { encoding: 'utf8' });
        Test.assert(template);
        sqlTemplate = new SqlTemplate('true');
        sqlTemplate._template = template;
        blockList = sqlTemplate._createBlockList();
        Test.assert(blockList);
        blockTree = sqlTemplate._createBlockTree(blockList);
        Test.assert(blockTree);
        try {
            sqlTemplate._checkBlockTreeErrors(blockTree);
        } catch (e) {
            Test.assertEqual(e.message, 'Cannot have #elif after #else. Line 6');
        }
    }

    /**
     * Test the process block tree.
     */
    static async testProcessBlockTree() {
        // Set values
        const values = {};

        // Test process block tree 1
        Test.describe('processBlockTree processBlockTree1.sql');
        let template = await readFile('./test/sql/processBlockTree1.sql', { encoding: 'utf8' });
        Test.assert(template);
        let sqlTemplate = new SqlTemplate(template, true);
        let sql = sqlTemplate.format(values);
        Test.assertEqual(sql, 'block1\r\nblock2\r\nblock3');

        // Test process block tree 2
        Test.describe('processBlockTree processBlockTree2.sql');
        template = await readFile('./test/sql/processBlockTree2.sql', { encoding: 'utf8' });
        Test.assert(template);
        sqlTemplate = new SqlTemplate(template, true);
        sql = sqlTemplate.format(values);
        Test.assertEqual(sql, 'block1\r\nblock3\r\nblock4');

        // Test process block tree 3
        Test.describe('processBlockTree processBlockTree3.sql');
        template = await readFile('./test/sql/processBlockTree3.sql', { encoding: 'utf8' });
        Test.assert(template);
        sqlTemplate = new SqlTemplate(template, true);
        sql = sqlTemplate.format(values);
        Test.assertEqual(sql, 'block1\r\nblock4\r\nblock5');

        // Test process block tree 4
        Test.describe('processBlockTree processBlockTree4.sql');
        template = await readFile('./test/sql/processBlockTree4.sql', { encoding: 'utf8' });
        Test.assert(template);
        sqlTemplate = new SqlTemplate(template, true);
        sql = sqlTemplate.format(values);
        Test.assertEqual(sql, 'block1\r\nblock3\r\nblock5');

        // Test process block tree 5
        Test.describe('processBlockTree processBlockTree5.sql');
        template = await readFile('./test/sql/processBlockTree5.sql', { encoding: 'utf8' });
        Test.assert(template);
        sqlTemplate = new SqlTemplate(template, true);
        sql = sqlTemplate.format(values);
        Test.assertEqual(sql, 'block1\r\nblock3\r\nblock6');

        // Test process block tree 6
        Test.describe('processBlockTree processBlockTree6.sql');
        template = await readFile('./test/sql/processBlockTree6.sql', { encoding: 'utf8' });
        Test.assert(template);
        sqlTemplate = new SqlTemplate(template, true);
        sql = sqlTemplate.format(values);
        Test.assertEqual(sql, 'block1\r\nblock2\r\nblock4\r\nblock5\r\nblock10');
    }
}
