/**
 * Test SQL Tools.
 */
import Test from "./test.js";
import { SqlTemplate } from "../sql-template.js";
import { BlockType } from "../block.js";

export default class TestSqlTemplate {
    static async run() {
        // Set test
        Test.test('SqlTemplate');

        // Perform tests
        //await Test.testGetTemplate();
        //await Test.testGetTemplateByName();
        
        //await TestSqlTemplate.testCreateBlockList();
        //await TestSqlTemplate.testCreateBlockTree();
        await TestSqlTemplate.testCheckBlockTreeError();
        //Test.testCreateConditionTokenList();
    }

    /**
     * Test the get template function.
     */
    static async testGetTemplate() {
        // Get template using relative path
        let template = await SqlTools.getTemplate('./sql/template.sql', import.meta.url);
        if (template.startsWith('# Test template') === false) { console.log('Test SqlTools.getTemplare: FAILED 1'); return; }
        template = await SqlTools.getTemplate('/sql/template.sql', import.meta.url);
        if (template.startsWith('# Test template') === false) { console.log('Test SqlTools.getTemplare: FAILED 2'); return; }
        template = await SqlTools.getTemplate('sql/template.sql', import.meta.url);
        if (template.startsWith('# Test template') === false) { console.log('Test SqlTools.getTemplare: FAILED 3'); return; }

        // Get templaure using full path
        template = await SqlTools.getTemplate('./test/sql/template.sql');
        if (template.startsWith('# Test template') === false) { console.log('Test SqlTools.getTemplare: FAILED 4'); return; }

        // Get templaure using full path without using cache
        template = await SqlTools.getTemplate('./sql/template.sql', import.meta.url, false);
        if (template.startsWith('# Test template') === false) { console.log('Test SqlTools.getTemplare: FAILED 5'); return; }
    }

    /**
     * Test the get template by name function.
     */
    static async testGetTemplateByName() {
        // Get template by name
        let template = await SqlTools.getTemplateByName('first', './sql/template-by-name.sql', import.meta.url);
        if (template.startsWith('SELECT field1 FROM table1;') === false) { console.log('Test SqlTools.getTemplareByName: FAILED 1'); return; }
        template = await SqlTools.getTemplateByName('second', './sql/template-by-name.sql', import.meta.url);
        if (template.startsWith('SELECT field2 FROM table2;') === false) { console.log('Test SqlTools.getTemplareByName: FAILED 2'); return; }

        // Check errors
        let error = false;
        try {
            template = await SqlTools.getTemplateByName('missing-does-not-exist', './sql/template-by-name.sql', import.meta.url);   
        } catch {
            error = true;
        }
        if (error === false) { console.log('Test SqlTools.getTemplareByName: FAILED 3'); return; }

        error = false;
        try {
            template = await SqlTools.getTemplateByName('missingEnd', './sql/template-by-name.sql', import.meta.url);   
        } catch {
            error = true;
        }
        if (error === false) { console.log('Test SqlTools.getTemplareByName: FAILED 4'); return; }

    }

    /**
     * Test the create block list.
     */
    static async testCreateBlockList() {
        // Test block list 1
        Test.describe('createBlockList blockList1.sql');
        let template = await SqlTools.getTemplate('./sql/blockList1.sql', import.meta.url);
        Test.assert(template);
        let sqlTemplate = new SqlTemplate();
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
        template = await SqlTools.getTemplate('./sql/blockList2.sql', import.meta.url);
        Test.assert(template);
        sqlTemplate = new SqlTemplate();
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
        template = await SqlTools.getTemplate('./sql/blockList3.sql', import.meta.url);
        Test.assert(template);
        sqlTemplate = new SqlTemplate();
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
        template = await SqlTools.getTemplate('./sql/blockList4.sql', import.meta.url);
        Test.assert(template);
        sqlTemplate = new SqlTemplate();
        sqlTemplate._template = template;
        blockList = sqlTemplate._createBlockList();
        Test.assert(blockList);
        Test.assertEqual(blockList.length, 1);
        Test.assertEqual(blockList[0].blockType, BlockType.TEXT);
        Test.assertEqual(blockList[0].text,'no preprocessor');
    }

    /**
     * Test the create block tree.
     */
    static async testCreateBlockTree() {
        // Test block tree 1
        Test.describe('createBlockTree blockTree1.sql');
        let template = await SqlTools.getTemplate('./sql/blockTree1.sql', import.meta.url);
        Test.assert(template);
        let sqlTemplate = new SqlTemplate();
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
        template = await SqlTools.getTemplate('./sql/blockTree2.sql', import.meta.url);
        Test.assert(template);
        sqlTemplate = new SqlTemplate();
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
        let template = await SqlTools.getTemplate('./sql/blockTreeError1.sql', import.meta.url);
        Test.assert(template);
        let sqlTemplate = new SqlTemplate();
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
        template = await SqlTools.getTemplate('./sql/blockTreeError2.sql', import.meta.url);
        Test.assert(template);
        sqlTemplate = new SqlTemplate();
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
        template = await SqlTools.getTemplate('./sql/blockTreeError3.sql', import.meta.url);
        Test.assert(template);
        sqlTemplate = new SqlTemplate();
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
        template = await SqlTools.getTemplate('./sql/blockTreeError4.sql', import.meta.url);
        Test.assert(template);
        sqlTemplate = new SqlTemplate();
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
        template = await SqlTools.getTemplate('./sql/blockTreeError5.sql', import.meta.url);
        Test.assert(template);
        sqlTemplate = new SqlTemplate();
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
        template = await SqlTools.getTemplate('./sql/blockTreeError6.sql', import.meta.url);
        Test.assert(template);
        sqlTemplate = new SqlTemplate();
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
        template = await SqlTools.getTemplate('./sql/blockTreeError7.sql', import.meta.url);
        Test.assert(template);
        sqlTemplate = new SqlTemplate();
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

/*
        // Test block tree error 1
        let template = await SqlTools.getTemplate('./sql/blockTreeError1.sql', import.meta.url);
        let blockList = SqlTools._createBlockList(template);
        let blockTree = SqlTools._createBlockTree(blockList);
        try {
            SqlTools._checkBlockTreeErrors(template, blockTree);
        } catch (e) {
            if (e.message !== 'Has #if but missing #endif. Line 2') { console.log('Test SqlTools._createBlockTreeError: FAILED 1'); return; }
        }

        // Test block tree error 2
        template = await SqlTools.getTemplate('./sql/blockTreeError2.sql', import.meta.url);
        blockList = SqlTools._createBlockList(template);
        blockTree = SqlTools._createBlockTree(blockList);
        try {
            SqlTools._checkBlockTreeErrors(template, blockTree);
        } catch (e) {
            if (e.message !== 'Cannot have #endif without #if. Line 2') { console.log('Test SqlTools._createBlockTreeError: FAILED 2'); return; }
        }

        // Test block tree error 3
        template = await SqlTools.getTemplate('./sql/blockTreeError3.sql', import.meta.url);
        blockList = SqlTools._createBlockList(template);
        blockTree = SqlTools._createBlockTree(blockList);
        try {
            SqlTools._checkBlockTreeErrors(template, blockTree);
        } catch (e) {
            if (e.message !== 'Has #if but missing #endif. Line 2') { console.log('Test SqlTools._createBlockTreeError: FAILED 3'); return; }
        }

        // Test block tree error 4
        template = await SqlTools.getTemplate('./sql/blockTreeError4.sql', import.meta.url);
        blockList = SqlTools._createBlockList(template);
        blockTree = SqlTools._createBlockTree(blockList);
        try {
            SqlTools._checkBlockTreeErrors(template, blockTree);
        } catch (e) {
            if (e.message !== 'Cannot have #endif without #if. Line 6') { console.log('Test SqlTools._createBlockTreeError: FAILED 4'); return; }
        }

        // Test block tree error 5
        template = await SqlTools.getTemplate('./sql/blockTreeError5.sql', import.meta.url);
        blockList = SqlTools._createBlockList(template);
        blockTree = SqlTools._createBlockTree(blockList);
        try {
            SqlTools._checkBlockTreeErrors(template, blockTree);
        } catch (e) {
            if (e.message !== 'Cannot have #else without #if. Line 2') { console.log('Test SqlTools._createBlockTreeError: FAILED 5'); return; }
        }

        // Test block tree error 6
        template = await SqlTools.getTemplate('./sql/blockTreeError6.sql', import.meta.url);
        blockList = SqlTools._createBlockList(template);
        blockTree = SqlTools._createBlockTree(blockList);
        try {
            SqlTools._checkBlockTreeErrors(template, blockTree);
        } catch (e) {
            if (e.message !== 'Cannot have #elif without #if. Line 2') { console.log('Test SqlTools._createBlockTreeError: FAILED 6'); return; }
        }

        // Test block tree error 7
        template = await SqlTools.getTemplate('./sql/blockTreeError7.sql', import.meta.url);
        blockList = SqlTools._createBlockList(template);
        blockTree = SqlTools._createBlockTree(blockList);
        try {
            SqlTools._checkBlockTreeErrors(template, blockTree);
        } catch (e) {
            if (e.message !== 'Cannot have #elif after #else. Line 6') { console.log('Test SqlTools._createBlockTreeError: FAILED 7'); return; }
        }
        */
    }

    /**
     * Test the create condition token list.
     */
    static testCreateConditionTokenList() {
        // Test empty
        let tokenList = SqlTools._createConditionTokenList('');
        if (tokenList.length !== 0) { console.log('Test SqlTools._createConditionTokenList: FAILED 1'); return; }

        // Test white space 1
        tokenList = SqlTools._createConditionTokenList('  ');
        if (tokenList.length !== 0) { console.log('Test SqlTools._createConditionTokenList: FAILED 2'); return; }

        // Test white space 2
        tokenList = SqlTools._createConditionTokenList(' = ');
        if (tokenList.length !== 1) { console.log('Test SqlTools._createConditionTokenList: FAILED 3'); return; }
        if (tokenList[0].type !== SqlTools.TOKEN_COMPARE_EQUAL) { console.log('Test SqlTools._createConditionTokenList: FAILED 4'); return; }

        // Test strings
        tokenList = SqlTools._createConditionTokenList(' "hello\\"world" \'hello\\\'world\' ');
        if (tokenList.length !== 2) { console.log('Test SqlTools._createConditionTokenList: FAILED 5'); return; }
        if (tokenList[0].type !== SqlTools.TOKEN_TEXT) { console.log('Test SqlTools._createConditionTokenList: FAILED 6'); return; }
        if (tokenList[0].value !== 'hello\\"world') { console.log('Test SqlTools._createConditionTokenList: FAILED 6'); return; }
        if (tokenList[1].type !== SqlTools.TOKEN_TEXT) { console.log('Test SqlTools._createConditionTokenList: FAILED 7'); return; }
        if (tokenList[1].value !== "hello\\'world") { console.log('Test SqlTools._createConditionTokenList: FAILED 7'); return; }

        // Test numbers
        tokenList = SqlTools._createConditionTokenList(' 1234 1234.567 0xAD0012E3');
        if (tokenList.length !== 3) { console.log('Test SqlTools._createConditionTokenList: FAILED 8'); return; }
        if (tokenList[0].type !== SqlTools.TOKEN_NUMBER) { console.log('Test SqlTools._createConditionTokenList: FAILED 9'); return; }
        if (tokenList[0].value !== '1234') { console.log('Test SqlTools._createConditionTokenList: FAILED 9'); return; }
        if (tokenList[1].type !== SqlTools.TOKEN_NUMBER) { console.log('Test SqlTools._createConditionTokenList: FAILED 10'); return; }
        if (tokenList[1].value !== '1234.567') { console.log('Test SqlTools._createConditionTokenList: FAILED 10'); return; }
        if (tokenList[2].type !== SqlTools.TOKEN_NUMBER) { console.log('Test SqlTools._createConditionTokenList: FAILED 10'); return; }
        if (tokenList[2].value !== '0xAD0012E3') { console.log('Test SqlTools._createConditionTokenList: FAILED 10'); return; }

        // Test identifier
        tokenList = SqlTools._createConditionTokenList(' $test $test1 $test_var2 ');
        if (tokenList.length !== 3) { console.log('Test SqlTools._createConditionTokenList: FAILED 11'); return; }
        if (tokenList[0].type !== SqlTools.TOKEN_IDENTIFIER) { console.log('Test SqlTools._createConditionTokenList: FAILED 12'); return; }
        if (tokenList[0].value !== '$test') { console.log('Test SqlTools._createConditionTokenList: FAILED 12'); return; }
        if (tokenList[1].type !== SqlTools.TOKEN_IDENTIFIER) { console.log('Test SqlTools._createConditionTokenList: FAILED 13'); return; }
        if (tokenList[1].value !== '$test1') { console.log('Test SqlTools._createConditionTokenList: FAILED 13'); return; }
        if (tokenList[2].type !== SqlTools.TOKEN_IDENTIFIER) { console.log('Test SqlTools._createConditionTokenList: FAILED 14'); return; }
        if (tokenList[2].value !== '$test_var2') { console.log('Test SqlTools._createConditionTokenList: FAILED 14'); return; }

        // Test other tokens
        tokenList = SqlTools._createConditionTokenList(' = == === ! != !== >= <= > < ( ) + - * / && || ');
        if (tokenList.length !== 18) { console.log('Test SqlTools._createConditionTokenList: FAILED 15'); return; }
        if (tokenList[0].type !== SqlTools.TOKEN_COMPARE_EQUAL) { console.log('Test SqlTools._createConditionTokenList: FAILED 16'); return; }
        if (tokenList[1].type !== SqlTools.TOKEN_COMPARE_EQUAL) { console.log('Test SqlTools._createConditionTokenList: FAILED 17'); return; }
        if (tokenList[2].type !== SqlTools.TOKEN_COMPARE_EQUAL) { console.log('Test SqlTools._createConditionTokenList: FAILED 18'); return; }
        if (tokenList[3].type !== SqlTools.TOKEN_NOT) { console.log('Test SqlTools._createConditionTokenList: FAILED 19'); return; }
        if (tokenList[4].type !== SqlTools.TOKEN_COMPARE_NOT_EQUAL) { console.log('Test SqlTools._createConditionTokenList: FAILED 20'); return; }
        if (tokenList[5].type !== SqlTools.TOKEN_COMPARE_NOT_EQUAL) { console.log('Test SqlTools._createConditionTokenList: FAILED 21'); return; }
        if (tokenList[6].type !== SqlTools.TOKEN_COMPARE_GREATER_EQUAL) { console.log('Test SqlTools._createConditionTokenList: FAILED 22'); return; }
        if (tokenList[7].type !== SqlTools.TOKEN_COMPARE_LESS_EQUAL) { console.log('Test SqlTools._createConditionTokenList: FAILED 23'); return; }
        if (tokenList[8].type !== SqlTools.TOKEN_COMPARE_LESS) { console.log('Test SqlTools._createConditionTokenList: FAILED 24'); return; }
        if (tokenList[9].type !== SqlTools.TOKEN_COMPARE_GREATER) { console.log('Test SqlTools._createConditionTokenList: FAILED 25'); return; }
        if (tokenList[10].type !== SqlTools.TOKEN_OPEN_BRACKET) { console.log('Test SqlTools._createConditionTokenList: FAILED 26'); return; }
        if (tokenList[11].type !== SqlTools.TOKEN_CLOSE_BRACKET) { console.log('Test SqlTools._createConditionTokenList: FAILED 27'); return; }
        if (tokenList[12].type !== SqlTools.TOKEN_ADD) { console.log('Test SqlTools._createConditionTokenList: FAILED 28'); return; }
        if (tokenList[13].type !== SqlTools.TOKEN_SUBTRACT) { console.log('Test SqlTools._createConditionTokenList: FAILED 29'); return; }
        if (tokenList[14].type !== SqlTools.TOKEN_MULTIPLE) { console.log('Test SqlTools._createConditionTokenList: FAILED 30'); return; }
        if (tokenList[15].type !== SqlTools.TOKEN_DIVIDE) { console.log('Test SqlTools._createConditionTokenList: FAILED 31'); return; }
        if (tokenList[16].type !== SqlTools.TOKEN_AND) { console.log('Test SqlTools._createConditionTokenList: FAILED 32'); return; }
        if (tokenList[17].type !== SqlTools.TOKEN_OR) { console.log('Test SqlTools._createConditionTokenList: FAILED 33'); return; }

        // Test true false
        tokenList = SqlTools._createConditionTokenList(' true TRUE false FALSE ');
        if (tokenList.length !== 4) { console.log('Test SqlTools._createConditionTokenList: FAILED 34'); return; }
        if (tokenList[0].type !== SqlTools.TOKEN_TRUE) { console.log('Test SqlTools._createConditionTokenList: FAILED 35'); return; }
        if (tokenList[1].type !== SqlTools.TOKEN_TRUE) { console.log('Test SqlTools._createConditionTokenList: FAILED 36'); return; }
        if (tokenList[2].type !== SqlTools.TOKEN_FALSE) { console.log('Test SqlTools._createConditionTokenList: FAILED 37'); return; }
        if (tokenList[3].type !== SqlTools.TOKEN_FALSE) { console.log('Test SqlTools._createConditionTokenList: FAILED 38'); return; }

        // Test no white space
        tokenList = SqlTools._createConditionTokenList('$test1==="hello"&&($test2===13||!$test3)&&$test4!=true');
        if (tokenList.length !== 16) { console.log('Test SqlTools._createConditionTokenList: FAILED 39'); return; }
        if (tokenList[0].type !== SqlTools.TOKEN_IDENTIFIER) { console.log('Test SqlTools._createConditionTokenList: FAILED 41'); return; }
        if (tokenList[1].type !== SqlTools.TOKEN_COMPARE_EQUAL) { console.log('Test SqlTools._createConditionTokenList: FAILED 42'); return; }
        if (tokenList[2].type !== SqlTools.TOKEN_TEXT) { console.log('Test SqlTools._createConditionTokenList: FAILED 43'); return; }
        if (tokenList[3].type !== SqlTools.TOKEN_AND) { console.log('Test SqlTools._createConditionTokenList: FAILED 44'); return; }
        if (tokenList[4].type !== SqlTools.TOKEN_OPEN_BRACKET) { console.log('Test SqlTools._createConditionTokenList: FAILED 45'); return; }
        if (tokenList[5].type !== SqlTools.TOKEN_IDENTIFIER) { console.log('Test SqlTools._createConditionTokenList: FAILED 46'); return; }
        if (tokenList[6].type !== SqlTools.TOKEN_COMPARE_EQUAL) { console.log('Test SqlTools._createConditionTokenList: FAILED 47'); return; }
        if (tokenList[7].type !== SqlTools.TOKEN_NUMBER) { console.log('Test SqlTools._createConditionTokenList: FAILED 48'); return; }
        if (tokenList[8].type !== SqlTools.TOKEN_OR) { console.log('Test SqlTools._createConditionTokenList: FAILED 49'); return; }
        if (tokenList[9].type !== SqlTools.TOKEN_NOT) { console.log('Test SqlTools._createConditionTokenList: FAILED 50'); return; }
        if (tokenList[10].type !== SqlTools.TOKEN_IDENTIFIER) { console.log('Test SqlTools._createConditionTokenList: FAILED 51'); return; }
        if (tokenList[11].type !== SqlTools.TOKEN_CLOSE_BRACKET) { console.log('Test SqlTools._createConditionTokenList: FAILED 52'); return; }
        if (tokenList[12].type !== SqlTools.TOKEN_AND) { console.log('Test SqlTools._createConditionTokenList: FAILED 53'); return; }
        if (tokenList[13].type !== SqlTools.TOKEN_IDENTIFIER) { console.log('Test SqlTools._createConditionTokenList: FAILED 54'); return; }
        if (tokenList[14].type !== SqlTools.TOKEN_COMPARE_NOT_EQUAL) { console.log('Test SqlTools._createConditionTokenList: FAILED 55'); return; }
        if (tokenList[15].type !== SqlTools.TOKEN_TRUE) { console.log('Test SqlTools._createConditionTokenList: FAILED 56'); return; }

        // Test invalid tokens (syntax errors)
        try {
            tokenList = SqlTools._createConditionTokenList('this is an error');
        } catch (e) {
            if (e.message.startsWith('Syntax error. Unknown token starting at') === false) { console.log('Test SqlTools._createConditionTokenList: FAILED 57'); return; }
        }

        // Test invalid strings
        try {
            tokenList = SqlTools._createConditionTokenList(' "no closing quotation');
        } catch (e) {
            if (e.message.startsWith('Missing closing string quotation mark') === false) { console.log('Test SqlTools._createConditionTokenList: FAILED 58'); return; }
        }
        try {
            tokenList = SqlTools._createConditionTokenList(" 'no closing quotation");
        } catch (e) {
            if (e.message.startsWith('Missing closing string quotation mark') === false) { console.log('Test SqlTools._createConditionTokenList: FAILED 58'); return; }
        }
    }

    /**
     * Test the create condition token tree.
     */
    /*
    static testCreateConditionTokenTree() {
        // Test root only
        let tokenList = SqlTools._createConditionTokenList('$test===1');
        let tokenTree = SqlTools._createConditionTokenTree(tokenList);
        if (tokenTree.conditionList.length !== 3) { console.log('Test SqlTools._createConditionTokenTree: FAILED 1'); return; }
        if (tokenTree.conditionList[0] !== '$test') { console.log('Test SqlTools._createConditionTokenTree: FAILED 2'); return; }
        if (tokenTree.conditionList[1] !== '===') { console.log('Test SqlTools._createConditionTokenTree: FAILED 3'); return; }
        if (tokenTree.conditionList[2] !== '1') { console.log('Test SqlTools._createConditionTokenTree: FAILED 4'); return; }

        // Test one level up
        tokenList = SqlTools._createConditionTokenList('($test===1)');
        tokenTree = SqlTools._createConditionTokenTree(tokenList);
        if (tokenTree.conditionList.length !== 1) { console.log('Test SqlTools._createConditionTokenTree: FAILED 5'); return; }
        if (tokenTree.conditionList[0].isParent !== true) { console.log('Test SqlTools._createConditionTokenTree: FAILED 6'); return; }
        if (tokenTree.conditionList[0].conditionList.length !== 3) { console.log('Test SqlTools._createConditionTokenTree: FAILED 7'); return; }
        if (tokenTree.conditionList[0].conditionList[0] !== '$test') { console.log('Test SqlTools._createConditionTokenTree: FAILED 8'); return; }
        if (tokenTree.conditionList[0].conditionList[1] !== '===') { console.log('Test SqlTools._createConditionTokenTree: FAILED 9'); return; }
        if (tokenTree.conditionList[0].conditionList[2] !== '1') { console.log('Test SqlTools._createConditionTokenTree: FAILED 10'); return; }

        // Test two together
        tokenList = SqlTools._createConditionTokenList('($test1===1 || !$test2) && ($test3 || $test4===true)');
        tokenTree = SqlTools._createConditionTokenTree(tokenList);
        if (tokenTree.conditionList.length !== 3) { console.log('Test SqlTools._createConditionTokenTree: FAILED 1'); return; }

        if (tokenTree.conditionList[0].isParent !== true) { console.log('Test SqlTools._createConditionTokenTree: FAILED 2'); return; }
        if (tokenTree.conditionList[1] !== '&&') { console.log('Test SqlTools._createConditionTokenTree: FAILED 2'); return; }
        if (tokenTree.conditionList[2].isParent !== true) { console.log('Test SqlTools._createConditionTokenTree: FAILED 2'); return; }

        if (tokenTree.conditionList[0].conditionList.length !== 6) { console.log('Test SqlTools._createConditionTokenTree: FAILED 2'); return; }
        if (tokenTree.conditionList[0].conditionList[0] !== '$test1') { console.log('Test SqlTools._createConditionTokenTree: FAILED 2'); return; }
        if (tokenTree.conditionList[0].conditionList[1] !== '===') { console.log('Test SqlTools._createConditionTokenTree: FAILED 3'); return; }
        if (tokenTree.conditionList[0].conditionList[2] !== '1') { console.log('Test SqlTools._createConditionTokenTree: FAILED 4'); return; }
        if (tokenTree.conditionList[0].conditionList[3] !== '||') { console.log('Test SqlTools._createConditionTokenTree: FAILED 4'); return; }
        if (tokenTree.conditionList[0].conditionList[4] !== '!') { console.log('Test SqlTools._createConditionTokenTree: FAILED 4'); return; }
        if (tokenTree.conditionList[0].conditionList[5] !== '$test2') { console.log('Test SqlTools._createConditionTokenTree: FAILED 4'); return; }

        if (tokenTree.conditionList[2].conditionList.length !== 5) { console.log('Test SqlTools._createConditionTokenTree: FAILED 2'); return; }
        if (tokenTree.conditionList[2].conditionList[0] !== '$test3') { console.log('Test SqlTools._createConditionTokenTree: FAILED 2'); return; }
        if (tokenTree.conditionList[2].conditionList[1] !== '||') { console.log('Test SqlTools._createConditionTokenTree: FAILED 3'); return; }
        if (tokenTree.conditionList[2].conditionList[2] !== '$test4') { console.log('Test SqlTools._createConditionTokenTree: FAILED 4'); return; }
        if (tokenTree.conditionList[2].conditionList[3] !== '===') { console.log('Test SqlTools._createConditionTokenTree: FAILED 4'); return; }
        if (tokenTree.conditionList[2].conditionList[4] !== 'true') { console.log('Test SqlTools._createConditionTokenTree: FAILED 4'); return; }
    }
    */
}
