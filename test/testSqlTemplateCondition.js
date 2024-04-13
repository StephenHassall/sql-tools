/**
 * Test SQL Template Condition.
 */
import Test from "./test.js";
import SqlTools from "../sql-tools.js";
import { SqlTemplateCondition } from "../sql-tools.js";
import { TokenType } from "../sql-tools.js";

export default class TestSqlTemplateCondition {
    static async run() {
        // Set test
        Test.test('SqlTemplateCondition');

        // Perform tests
        TestSqlTemplateCondition.testGetNextToken();
    }

    /**
     * Test the get next token.
     */
    static async testGetNextToken() {
        // Test empty
        Test.describe('getNextToken empty');
        let condition = new SqlTemplateCondition('TEST');
        condition._condition = '';
        condition._tokenIndex = 0;
        let token = condition._getNextToken();
        Test.assertEqual(token, null);

        // Test white space
        Test.describe('getNextToken white space');
        condition = new SqlTemplateCondition('TEST');
        condition._condition = '   ';
        condition._tokenIndex = 0;
        token = condition._getNextToken();
        Test.assertEqual(token, null);

        // Test white space with equal
        Test.describe('getNextToken white space with equal');
        condition = new SqlTemplateCondition('TEST');
        condition._condition = ' = ';
        condition._tokenIndex = 0;
        token = condition._getNextToken();
        Test.assert(token, null);
        Test.assertEqual(token.tokenType, TokenType.COMPARE_EQUAL);

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
