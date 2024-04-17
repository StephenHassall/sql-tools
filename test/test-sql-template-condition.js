/**
 * Test SQL Template Condition.
 */
import Test from "./test.js";
import { SqlTemplateCondition } from "../sql-template-condition.js";
import { TokenType } from "../token.js";
import { NodeType } from "../node.js";

export default class TestSqlTemplateCondition {
    /**
     * Run all the SQL template condition tests.
     */
    static run() {
        // Set test
        Test.test('SqlTemplateCondition');

        // Perform tests
        TestSqlTemplateCondition.testGetNextToken();
        TestSqlTemplateCondition.testBuild();
        TestSqlTemplateCondition.testGetResult();
    }

    /**
     * Test the get next token.
     */
    static testGetNextToken() {
        // Test empty1
        Test.describe('getNextToken empty');
        let condition = new SqlTemplateCondition('true', true);
        condition._condition = '';
        condition._tokenIndex = 0;
        let token = condition._getNextToken();
        Test.assertEqual(token, null);

        // Test white space
        Test.describe('getNextToken white space');
        condition = new SqlTemplateCondition('true', true);
        condition._condition = '   ';
        condition._tokenIndex = 0;
        token = condition._getNextToken();
        Test.assertEqual(token, null);

        // Test white space with equal
        Test.describe('getNextToken white space with equal');
        condition = new SqlTemplateCondition('true', true);
        condition._condition = ' = ';
        condition._tokenIndex = 0;
        token = condition._getNextToken();
        Test.assert(token);
        Test.assertEqual(token.tokenType, TokenType.COMPARE_EQUAL);

        // Test strings
        Test.describe('getNextToken strings');
        condition = new SqlTemplateCondition('true', true);
        condition._condition = ' "hello\\"world" \'hello\\\'world\' "hello\'world" \'hello"world\'  ';
        condition._tokenIndex = 0;
        token = condition._getNextToken();
        Test.assert(token);
        Test.assertEqual(token.tokenType, TokenType.TEXT);
        Test.assertEqual(token.value, 'hello\"world');
        token = condition._getNextToken();
        Test.assert(token);
        Test.assertEqual(token.tokenType, TokenType.TEXT);
        Test.assertEqual(token.value, "hello\'world");
        token = condition._getNextToken();
        Test.assert(token);
        Test.assertEqual(token.tokenType, TokenType.TEXT);
        Test.assertEqual(token.value, "hello\'world");
        token = condition._getNextToken();
        Test.assert(token);
        Test.assertEqual(token.tokenType, TokenType.TEXT);
        Test.assertEqual(token.value, 'hello\"world');

        // Test numbers
        Test.describe('getNextToken numbers');
        condition = new SqlTemplateCondition('true', true);
        condition._condition = ' 1234 1234.567 0xAD0012E3 ';
        condition._tokenIndex = 0;
        token = condition._getNextToken();
        Test.assert(token);
        Test.assertEqual(token.tokenType, TokenType.NUMBER);
        Test.assertEqual(token.value, 1234);
        token = condition._getNextToken();
        Test.assert(token);
        Test.assertEqual(token.tokenType, TokenType.NUMBER);
        Test.assertEqual(token.value, 1234.567);
        token = condition._getNextToken();
        Test.assert(token);
        Test.assertEqual(token.tokenType, TokenType.NUMBER);
        Test.assertEqual(token.value, 0xAD0012E3);

        // Test identifier
        Test.describe('getNextToken identifiers');
        condition = new SqlTemplateCondition('true', true);
        condition._condition = ' $test $test1 $test_var2 ';
        condition._tokenIndex = 0;
        token = condition._getNextToken();
        Test.assert(token);
        Test.assertEqual(token.tokenType, TokenType.IDENTIFIER);
        Test.assertEqual(token.value, '$test');
        token = condition._getNextToken();
        Test.assert(token);
        Test.assertEqual(token.tokenType, TokenType.IDENTIFIER);
        Test.assertEqual(token.value, '$test1');
        token = condition._getNextToken();
        Test.assert(token);
        Test.assertEqual(token.tokenType, TokenType.IDENTIFIER);
        Test.assertEqual(token.value, '$test_var2');

        // Test other tokens
        Test.describe('getNextToken other tokens');
        condition = new SqlTemplateCondition('true', true);
        condition._condition = ' = == === ! != !== <> >= <= > < ( ) + - * / && AND || OR true false null ';
        condition._tokenIndex = 0;
        token = condition._getNextToken();
        Test.assert(token);
        Test.assertEqual(token.tokenType, TokenType.COMPARE_EQUAL);
        token = condition._getNextToken();
        Test.assert(token);
        Test.assertEqual(token.tokenType, TokenType.COMPARE_EQUAL);
        token = condition._getNextToken();
        Test.assert(token);
        Test.assertEqual(token.tokenType, TokenType.COMPARE_EQUAL);
        token = condition._getNextToken();
        Test.assert(token);
        Test.assertEqual(token.tokenType, TokenType.NOT);
        token = condition._getNextToken();
        Test.assert(token);
        Test.assertEqual(token.tokenType, TokenType.COMPARE_NOT_EQUAL);
        token = condition._getNextToken();
        Test.assert(token);
        Test.assertEqual(token.tokenType, TokenType.COMPARE_NOT_EQUAL);
        token = condition._getNextToken();
        Test.assert(token);
        Test.assertEqual(token.tokenType, TokenType.COMPARE_NOT_EQUAL);
        token = condition._getNextToken();
        Test.assert(token);
        Test.assertEqual(token.tokenType, TokenType.COMPARE_GREATER_EQUAL);
        token = condition._getNextToken();
        Test.assert(token);
        Test.assertEqual(token.tokenType, TokenType.COMPARE_LESS_EQUAL);
        token = condition._getNextToken();
        Test.assert(token);
        Test.assertEqual(token.tokenType, TokenType.COMPARE_GREATER);
        token = condition._getNextToken();
        Test.assert(token);
        Test.assertEqual(token.tokenType, TokenType.COMPARE_LESS);
        token = condition._getNextToken();
        Test.assert(token);
        Test.assertEqual(token.tokenType, TokenType.OPEN_BRACKET);
        token = condition._getNextToken();
        Test.assert(token);
        Test.assertEqual(token.tokenType, TokenType.CLOSE_BRACKET);
        token = condition._getNextToken();
        Test.assert(token);
        Test.assertEqual(token.tokenType, TokenType.ADD);
        token = condition._getNextToken();
        Test.assert(token);
        Test.assertEqual(token.tokenType, TokenType.SUBTRACT);
        token = condition._getNextToken();
        Test.assert(token);
        Test.assertEqual(token.tokenType, TokenType.MULTIPLE);
        token = condition._getNextToken();
        Test.assert(token);
        Test.assertEqual(token.tokenType, TokenType.DIVIDE);
        token = condition._getNextToken();
        Test.assert(token);
        Test.assertEqual(token.tokenType, TokenType.AND);
        token = condition._getNextToken();
        Test.assert(token);
        Test.assertEqual(token.tokenType, TokenType.AND);
        token = condition._getNextToken();
        Test.assert(token);
        Test.assertEqual(token.tokenType, TokenType.OR);
        token = condition._getNextToken();
        Test.assert(token);
        Test.assertEqual(token.tokenType, TokenType.OR);
        token = condition._getNextToken();
        Test.assert(token);
        Test.assertEqual(token.tokenType, TokenType.TRUE);
        token = condition._getNextToken();
        Test.assert(token);
        Test.assertEqual(token.tokenType, TokenType.FALSE);
        token = condition._getNextToken();
        Test.assert(token);
        Test.assertEqual(token.tokenType, TokenType.NULL);

        // Test no white space
        Test.describe('getNextToken no white space');
        condition = new SqlTemplateCondition('true', true);
        condition._condition = '$test1==="hello"&&($test2===13||!$test3)AND$test4!=true';
        condition._tokenIndex = 0;
        token = condition._getNextToken();
        Test.assert(token);
        Test.assertEqual(token.tokenType, TokenType.IDENTIFIER);
        Test.assertEqual(token.value, '$test1');
        token = condition._getNextToken();
        Test.assert(token);
        Test.assertEqual(token.tokenType, TokenType.COMPARE_EQUAL);
        token = condition._getNextToken();
        Test.assert(token);
        Test.assertEqual(token.tokenType, TokenType.TEXT);
        Test.assertEqual(token.value, 'hello');
        token = condition._getNextToken();
        Test.assert(token);
        Test.assertEqual(token.tokenType, TokenType.AND);
        token = condition._getNextToken();
        Test.assert(token);
        Test.assertEqual(token.tokenType, TokenType.OPEN_BRACKET);
        token = condition._getNextToken();
        Test.assert(token);
        Test.assertEqual(token.tokenType, TokenType.IDENTIFIER);
        Test.assertEqual(token.value, '$test2');
        token = condition._getNextToken();
        Test.assert(token);
        Test.assertEqual(token.tokenType, TokenType.COMPARE_EQUAL);
        token = condition._getNextToken();
        Test.assert(token);
        Test.assertEqual(token.tokenType, TokenType.NUMBER);
        Test.assertEqual(token.value, 13);
        token = condition._getNextToken();
        Test.assert(token);
        Test.assertEqual(token.tokenType, TokenType.OR);
        token = condition._getNextToken();
        Test.assert(token);
        Test.assertEqual(token.tokenType, TokenType.NOT);
        token = condition._getNextToken();
        Test.assert(token);
        Test.assertEqual(token.tokenType, TokenType.IDENTIFIER);
        Test.assertEqual(token.value, '$test3');
        token = condition._getNextToken();
        Test.assert(token);
        Test.assertEqual(token.tokenType, TokenType.CLOSE_BRACKET);
        token = condition._getNextToken();
        Test.assert(token);
        Test.assertEqual(token.tokenType, TokenType.AND);
        token = condition._getNextToken();
        Test.assert(token);
        Test.assertEqual(token.tokenType, TokenType.IDENTIFIER);
        Test.assertEqual(token.value, '$test4');
        token = condition._getNextToken();
        Test.assert(token);
        Test.assertEqual(token.tokenType, TokenType.COMPARE_NOT_EQUAL);
        token = condition._getNextToken();
        Test.assert(token);
        Test.assertEqual(token.tokenType, TokenType.TRUE);

        // Test endings
        Test.describe('getNextToken endings');
        condition = new SqlTemplateCondition('true', true);
        condition._condition = '123 $test';
        condition._tokenIndex = 0;
        token = condition._getNextToken();
        Test.assert(token);
        token = condition._getNextToken();
        Test.assert(token);
        Test.assertEqual(token.tokenType, TokenType.IDENTIFIER);
        Test.assertEqual(token.value, '$test');

        condition._condition = '123 "text"';
        condition._tokenIndex = 0;
        token = condition._getNextToken();
        Test.assert(token);
        token = condition._getNextToken();
        Test.assert(token);
        Test.assertEqual(token.tokenType, TokenType.TEXT);
        Test.assertEqual(token.value, 'text');

        condition._condition = '123 12345';
        condition._tokenIndex = 0;
        token = condition._getNextToken();
        Test.assert(token);
        token = condition._getNextToken();
        Test.assert(token);
        Test.assertEqual(token.tokenType, TokenType.NUMBER);
        Test.assertEqual(token.value, 12345);

        condition._condition = '123 true';
        condition._tokenIndex = 0;
        token = condition._getNextToken();
        Test.assert(token);
        token = condition._getNextToken();
        Test.assert(token);
        Test.assertEqual(token.tokenType, TokenType.TRUE);

        condition._condition = '123 false';
        condition._tokenIndex = 0;
        token = condition._getNextToken();
        Test.assert(token);
        token = condition._getNextToken();
        Test.assert(token);
        Test.assertEqual(token.tokenType, TokenType.FALSE);

        condition._condition = '123 null';
        condition._tokenIndex = 0;
        token = condition._getNextToken();
        Test.assert(token);
        token = condition._getNextToken();
        Test.assert(token);
        Test.assertEqual(token.tokenType, TokenType.NULL);

        condition._condition = '123 )';
        condition._tokenIndex = 0;
        token = condition._getNextToken();
        Test.assert(token);
        token = condition._getNextToken();
        Test.assert(token);
        Test.assertEqual(token.tokenType, TokenType.CLOSE_BRACKET);

        // Test invalid tokens (syntax errors)
        Test.describe('getNextToken invalid tokens');
        condition = new SqlTemplateCondition('true', true);
        condition._condition = 'this is an error';
        condition._tokenIndex = 0;
        try {
            token = condition._getNextToken();
            Test.assert();
        } catch (e) {
            Test.assertEqual(e.message, 'Syntax error. Unknown token starting at: this is an error');
        }

        // Test invalid strings
        Test.describe('getNextToken invalid strings');
        condition = new SqlTemplateCondition('true', true);
        condition._condition = ' "no closing quotation';
        condition._tokenIndex = 0;
        try {
            token = condition._getNextToken();
            Test.assert();
        } catch (e) {
            Test.assertEqual(e.message, 'Missing closing string quotation mark');
        }
        condition._condition = " 'no closing quotation";
        condition._tokenIndex = 0;
        try {
            token = condition._getNextToken();
            Test.assert();
        } catch (e) {
            Test.assertEqual(e.message, 'Missing closing string quotation mark');
        }


    }

    /**
     * Test the build node tree.
     */
    static testBuild() {
        // Test $test=1
        Test.describe('build $test=1');
        let condition = new SqlTemplateCondition('true=true', true);
        condition._condition = '$test=1';
        condition._tokenIndex = 0;
        condition._build();
        let booleanExpression = condition._booleanNode;
        Test.assertEqual(booleanExpression.nodeType, NodeType.BOOL_EXPRESSION);
        Test.assertEqual(booleanExpression.nodeList.length, 1);
        let relationExpression = booleanExpression.nodeList[0];
        Test.assertEqual(relationExpression.nodeType, NodeType.RELATION_EXPRESSION);
        Test.assertEqual(relationExpression.nodeList.length, 3);
        Test.assertEqual(relationExpression.nodeList[0].nodeType, NodeType.EXPRESSION);
        Test.assertEqual(relationExpression.nodeList[1].nodeType, NodeType.TOKEN);
        Test.assertEqual(relationExpression.nodeList[1].token.tokenType, TokenType.COMPARE_EQUAL);
        Test.assertEqual(relationExpression.nodeList[2].nodeType, NodeType.EXPRESSION);

        let expression = relationExpression.nodeList[0];
        Test.assertEqual(expression.nodeList.length, 1);
        Test.assertEqual(expression.nodeList[0].nodeType, NodeType.TERM);
        let term = expression.nodeList[0];
        Test.assertEqual(term.nodeList.length, 1);
        Test.assertEqual(term.nodeList[0].nodeType, NodeType.FACTOR);
        let factor = term.nodeList[0];
        Test.assertEqual(factor.nodeList.length, 1);
        Test.assertEqual(factor.nodeList[0].nodeType, NodeType.TOKEN);
        Test.assertEqual(factor.nodeList[0].token.tokenType, TokenType.IDENTIFIER);

        expression = relationExpression.nodeList[2];
        Test.assertEqual(expression.nodeList.length, 1);
        Test.assertEqual(expression.nodeList[0].nodeType, NodeType.TERM);
        term = expression.nodeList[0];
        Test.assertEqual(term.nodeList.length, 1);
        Test.assertEqual(term.nodeList[0].nodeType, NodeType.FACTOR);
        factor = term.nodeList[0];
        Test.assertEqual(factor.nodeList.length, 1);
        Test.assertEqual(factor.nodeList[0].nodeType, NodeType.TOKEN);
        Test.assertEqual(factor.nodeList[0].token.tokenType, TokenType.NUMBER);

        // Test $test1=1 && $test2=2
        Test.describe('build $test1=1 && $test2=2');
        condition = new SqlTemplateCondition('true=true', true);
        condition._condition = '$test1=1 && $test2=2';
        condition._tokenIndex = 0;
        condition._build();
        booleanExpression = condition._booleanNode;
        Test.assertEqual(booleanExpression.nodeType, NodeType.BOOL_EXPRESSION);
        Test.assertEqual(booleanExpression.nodeList.length, 3);
        Test.assertEqual(booleanExpression.nodeList[0].nodeType, NodeType.RELATION_EXPRESSION);
        Test.assertEqual(booleanExpression.nodeList[1].nodeType, NodeType.TOKEN);
        Test.assertEqual(booleanExpression.nodeList[1].token.tokenType, TokenType.AND);
        Test.assertEqual(booleanExpression.nodeList[2].nodeType, NodeType.RELATION_EXPRESSION);

        relationExpression = booleanExpression.nodeList[0];
        Test.assertEqual(relationExpression.nodeType, NodeType.RELATION_EXPRESSION);
        Test.assertEqual(relationExpression.nodeList.length, 3);
        Test.assertEqual(relationExpression.nodeList[0].nodeType, NodeType.EXPRESSION);
        Test.assertEqual(relationExpression.nodeList[1].nodeType, NodeType.TOKEN);
        Test.assertEqual(relationExpression.nodeList[1].token.tokenType, TokenType.COMPARE_EQUAL);
        Test.assertEqual(relationExpression.nodeList[2].nodeType, NodeType.EXPRESSION);

        expression = relationExpression.nodeList[0];
        Test.assertEqual(expression.nodeList.length, 1);
        Test.assertEqual(expression.nodeList[0].nodeType, NodeType.TERM);
        term = expression.nodeList[0];
        Test.assertEqual(term.nodeList.length, 1);
        Test.assertEqual(term.nodeList[0].nodeType, NodeType.FACTOR);
        factor = term.nodeList[0];
        Test.assertEqual(factor.nodeList.length, 1);
        Test.assertEqual(factor.nodeList[0].nodeType, NodeType.TOKEN);
        Test.assertEqual(factor.nodeList[0].token.tokenType, TokenType.IDENTIFIER);

        expression = relationExpression.nodeList[2];
        Test.assertEqual(expression.nodeList.length, 1);
        Test.assertEqual(expression.nodeList[0].nodeType, NodeType.TERM);
        term = expression.nodeList[0];
        Test.assertEqual(term.nodeList.length, 1);
        Test.assertEqual(term.nodeList[0].nodeType, NodeType.FACTOR);
        factor = term.nodeList[0];
        Test.assertEqual(factor.nodeList.length, 1);
        Test.assertEqual(factor.nodeList[0].nodeType, NodeType.TOKEN);
        Test.assertEqual(factor.nodeList[0].token.tokenType, TokenType.NUMBER);

        relationExpression = booleanExpression.nodeList[2];
        Test.assertEqual(relationExpression.nodeType, NodeType.RELATION_EXPRESSION);
        Test.assertEqual(relationExpression.nodeList.length, 3);
        Test.assertEqual(relationExpression.nodeList[0].nodeType, NodeType.EXPRESSION);
        Test.assertEqual(relationExpression.nodeList[1].nodeType, NodeType.TOKEN);
        Test.assertEqual(relationExpression.nodeList[1].token.tokenType, TokenType.COMPARE_EQUAL);
        Test.assertEqual(relationExpression.nodeList[2].nodeType, NodeType.EXPRESSION);

        expression = relationExpression.nodeList[0];
        Test.assertEqual(expression.nodeList.length, 1);
        Test.assertEqual(expression.nodeList[0].nodeType, NodeType.TERM);
        term = expression.nodeList[0];
        Test.assertEqual(term.nodeList.length, 1);
        Test.assertEqual(term.nodeList[0].nodeType, NodeType.FACTOR);
        factor = term.nodeList[0];
        Test.assertEqual(factor.nodeList.length, 1);
        Test.assertEqual(factor.nodeList[0].nodeType, NodeType.TOKEN);
        Test.assertEqual(factor.nodeList[0].token.tokenType, TokenType.IDENTIFIER);

        expression = relationExpression.nodeList[2];
        Test.assertEqual(expression.nodeList.length, 1);
        Test.assertEqual(expression.nodeList[0].nodeType, NodeType.TERM);
        term = expression.nodeList[0];
        Test.assertEqual(term.nodeList.length, 1);
        Test.assertEqual(term.nodeList[0].nodeType, NodeType.FACTOR);
        factor = term.nodeList[0];
        Test.assertEqual(factor.nodeList.length, 1);
        Test.assertEqual(factor.nodeList[0].nodeType, NodeType.TOKEN);
        Test.assertEqual(factor.nodeList[0].token.tokenType, TokenType.NUMBER);

        // Test $test1=1 && ($test2=2 || $test3=3)
        Test.describe('build $test1=1 && ($test2=2 || $test3=3)');
        condition = new SqlTemplateCondition('true=true', true);
        condition._condition = '$test1=1 && ($test2=2 || $test3=3)';
        condition._tokenIndex = 0;
        condition._build();
        booleanExpression = condition._booleanNode;
        Test.assertEqual(booleanExpression.nodeType, NodeType.BOOL_EXPRESSION);
        Test.assertEqual(booleanExpression.nodeList.length, 3);
        Test.assertEqual(booleanExpression.nodeList[0].nodeType, NodeType.RELATION_EXPRESSION);
        Test.assertEqual(booleanExpression.nodeList[1].nodeType, NodeType.TOKEN);
        Test.assertEqual(booleanExpression.nodeList[1].token.tokenType, TokenType.AND);
        Test.assertEqual(booleanExpression.nodeList[2].nodeType, NodeType.RELATION_EXPRESSION);

        // $test1=1
        relationExpression = booleanExpression.nodeList[0];
        Test.assertEqual(relationExpression.nodeType, NodeType.RELATION_EXPRESSION);
        Test.assertEqual(relationExpression.nodeList.length, 3);
        Test.assertEqual(relationExpression.nodeList[0].nodeType, NodeType.EXPRESSION);
        Test.assertEqual(relationExpression.nodeList[1].nodeType, NodeType.TOKEN);
        Test.assertEqual(relationExpression.nodeList[1].token.tokenType, TokenType.COMPARE_EQUAL);
        Test.assertEqual(relationExpression.nodeList[2].nodeType, NodeType.EXPRESSION);

        // ($test2=2 || $test3=3)
        relationExpression = booleanExpression.nodeList[2];
        Test.assertEqual(relationExpression.nodeType, NodeType.RELATION_EXPRESSION);
        Test.assertEqual(relationExpression.nodeList.length, 1);
        Test.assertEqual(relationExpression.nodeList[0].nodeType, NodeType.BOOL_EXPRESSION);

        // $test2=2 || $test3=3
        booleanExpression = relationExpression.nodeList[0];
        Test.assertEqual(booleanExpression.nodeList.length, 3);
        Test.assertEqual(booleanExpression.nodeList[0].nodeType, NodeType.RELATION_EXPRESSION);
        Test.assertEqual(booleanExpression.nodeList[1].nodeType, NodeType.TOKEN);
        Test.assertEqual(booleanExpression.nodeList[1].token.tokenType, TokenType.OR);
        Test.assertEqual(booleanExpression.nodeList[2].nodeType, NodeType.RELATION_EXPRESSION);

        // $test2=2
        relationExpression = booleanExpression.nodeList[0];
        Test.assertEqual(relationExpression.nodeType, NodeType.RELATION_EXPRESSION);
        Test.assertEqual(relationExpression.nodeList.length, 3);
        Test.assertEqual(relationExpression.nodeList[0].nodeType, NodeType.EXPRESSION);
        Test.assertEqual(relationExpression.nodeList[1].nodeType, NodeType.TOKEN);
        Test.assertEqual(relationExpression.nodeList[1].token.tokenType, TokenType.COMPARE_EQUAL);
        Test.assertEqual(relationExpression.nodeList[2].nodeType, NodeType.EXPRESSION);

        // $test2
        expression = relationExpression.nodeList[0];
        Test.assertEqual(expression.nodeList.length, 1);
        Test.assertEqual(expression.nodeList[0].nodeType, NodeType.TERM);
        term = expression.nodeList[0];
        Test.assertEqual(term.nodeList.length, 1);
        Test.assertEqual(term.nodeList[0].nodeType, NodeType.FACTOR);
        factor = term.nodeList[0];
        Test.assertEqual(factor.nodeList.length, 1);
        Test.assertEqual(factor.nodeList[0].nodeType, NodeType.TOKEN);
        Test.assertEqual(factor.nodeList[0].token.tokenType, TokenType.IDENTIFIER);

        // 2
        expression = relationExpression.nodeList[2];
        Test.assertEqual(expression.nodeList.length, 1);
        Test.assertEqual(expression.nodeList[0].nodeType, NodeType.TERM);
        term = expression.nodeList[0];
        Test.assertEqual(term.nodeList.length, 1);
        Test.assertEqual(term.nodeList[0].nodeType, NodeType.FACTOR);
        factor = term.nodeList[0];
        Test.assertEqual(factor.nodeList.length, 1);
        Test.assertEqual(factor.nodeList[0].nodeType, NodeType.TOKEN);
        Test.assertEqual(factor.nodeList[0].token.tokenType, TokenType.NUMBER);

        // $test3=3
        relationExpression = booleanExpression.nodeList[2];
        Test.assertEqual(relationExpression.nodeType, NodeType.RELATION_EXPRESSION);
        Test.assertEqual(relationExpression.nodeList.length, 3);
        Test.assertEqual(relationExpression.nodeList[0].nodeType, NodeType.EXPRESSION);
        Test.assertEqual(relationExpression.nodeList[1].nodeType, NodeType.TOKEN);
        Test.assertEqual(relationExpression.nodeList[1].token.tokenType, TokenType.COMPARE_EQUAL);
        Test.assertEqual(relationExpression.nodeList[2].nodeType, NodeType.EXPRESSION);

        // $test3
        expression = relationExpression.nodeList[0];
        Test.assertEqual(expression.nodeList.length, 1);
        Test.assertEqual(expression.nodeList[0].nodeType, NodeType.TERM);
        term = expression.nodeList[0];
        Test.assertEqual(term.nodeList.length, 1);
        Test.assertEqual(term.nodeList[0].nodeType, NodeType.FACTOR);
        factor = term.nodeList[0];
        Test.assertEqual(factor.nodeList.length, 1);
        Test.assertEqual(factor.nodeList[0].nodeType, NodeType.TOKEN);
        Test.assertEqual(factor.nodeList[0].token.tokenType, TokenType.IDENTIFIER);

        // 3
        expression = relationExpression.nodeList[2];
        Test.assertEqual(expression.nodeList.length, 1);
        Test.assertEqual(expression.nodeList[0].nodeType, NodeType.TERM);
        term = expression.nodeList[0];
        Test.assertEqual(term.nodeList.length, 1);
        Test.assertEqual(term.nodeList[0].nodeType, NodeType.FACTOR);
        factor = term.nodeList[0];
        Test.assertEqual(factor.nodeList.length, 1);
        Test.assertEqual(factor.nodeList[0].nodeType, NodeType.TOKEN);
        Test.assertEqual(factor.nodeList[0].token.tokenType, TokenType.NUMBER);

        // Test $test1===true
        Test.describe('build $test1===true');
        condition = new SqlTemplateCondition('true=true', true);
        condition._condition = '$test1===true';
        condition._tokenIndex = 0;
        condition._build();
        booleanExpression = condition._booleanNode;
        Test.assertEqual(booleanExpression.nodeType, NodeType.BOOL_EXPRESSION);
        Test.assertEqual(booleanExpression.nodeList.length, 1);
        relationExpression = booleanExpression.nodeList[0];
        Test.assertEqual(relationExpression.nodeType, NodeType.RELATION_EXPRESSION);
        Test.assertEqual(relationExpression.nodeList.length, 3);
        Test.assertEqual(relationExpression.nodeList[0].nodeType, NodeType.EXPRESSION);
        Test.assertEqual(relationExpression.nodeList[1].nodeType, NodeType.TOKEN);
        Test.assertEqual(relationExpression.nodeList[1].token.tokenType, TokenType.COMPARE_EQUAL);
        Test.assertEqual(relationExpression.nodeList[2].nodeType, NodeType.EXPRESSION);

        expression = relationExpression.nodeList[0];
        Test.assertEqual(expression.nodeList.length, 1);
        Test.assertEqual(expression.nodeList[0].nodeType, NodeType.TERM);
        term = expression.nodeList[0];
        Test.assertEqual(term.nodeList.length, 1);
        Test.assertEqual(term.nodeList[0].nodeType, NodeType.FACTOR);
        factor = term.nodeList[0];
        Test.assertEqual(factor.nodeList.length, 1);
        Test.assertEqual(factor.nodeList[0].nodeType, NodeType.TOKEN);
        Test.assertEqual(factor.nodeList[0].token.tokenType, TokenType.IDENTIFIER);

        expression = relationExpression.nodeList[2];
        Test.assertEqual(expression.nodeList.length, 1);
        Test.assertEqual(expression.nodeList[0].nodeType, NodeType.TERM);
        term = expression.nodeList[0];
        Test.assertEqual(term.nodeList.length, 1);
        Test.assertEqual(term.nodeList[0].nodeType, NodeType.FACTOR);
        factor = term.nodeList[0];
        Test.assertEqual(factor.nodeList.length, 1);
        Test.assertEqual(factor.nodeList[0].nodeType, NodeType.TOKEN);
        Test.assertEqual(factor.nodeList[0].token.tokenType, TokenType.TRUE);

        // Test true==$test1
        Test.describe('build true==$test1');
        condition = new SqlTemplateCondition('true=true', true);
        condition._condition = 'true==$test1';
        condition._tokenIndex = 0;
        condition._build();
        booleanExpression = condition._booleanNode;
        Test.assertEqual(booleanExpression.nodeType, NodeType.BOOL_EXPRESSION);
        Test.assertEqual(booleanExpression.nodeList.length, 1);
        relationExpression = booleanExpression.nodeList[0];
        Test.assertEqual(relationExpression.nodeType, NodeType.RELATION_EXPRESSION);
        Test.assertEqual(relationExpression.nodeList.length, 3);
        Test.assertEqual(relationExpression.nodeList[0].nodeType, NodeType.EXPRESSION);
        Test.assertEqual(relationExpression.nodeList[1].nodeType, NodeType.TOKEN);
        Test.assertEqual(relationExpression.nodeList[1].token.tokenType, TokenType.COMPARE_EQUAL);
        Test.assertEqual(relationExpression.nodeList[2].nodeType, NodeType.EXPRESSION);

        expression = relationExpression.nodeList[0];
        Test.assertEqual(expression.nodeList.length, 1);
        Test.assertEqual(expression.nodeList[0].nodeType, NodeType.TERM);
        term = expression.nodeList[0];
        Test.assertEqual(term.nodeList.length, 1);
        Test.assertEqual(term.nodeList[0].nodeType, NodeType.FACTOR);
        factor = term.nodeList[0];
        Test.assertEqual(factor.nodeList.length, 1);
        Test.assertEqual(factor.nodeList[0].nodeType, NodeType.TOKEN);
        Test.assertEqual(factor.nodeList[0].token.tokenType, TokenType.TRUE);

        expression = relationExpression.nodeList[2];
        Test.assertEqual(expression.nodeList.length, 1);
        Test.assertEqual(expression.nodeList[0].nodeType, NodeType.TERM);
        term = expression.nodeList[0];
        Test.assertEqual(term.nodeList.length, 1);
        Test.assertEqual(term.nodeList[0].nodeType, NodeType.FACTOR);
        factor = term.nodeList[0];
        Test.assertEqual(factor.nodeList.length, 1);
        Test.assertEqual(factor.nodeList[0].nodeType, NodeType.TOKEN);
        Test.assertEqual(factor.nodeList[0].token.tokenType, TokenType.IDENTIFIER);

        // Test !true
        Test.describe('build !true');
        condition = new SqlTemplateCondition('true=true', true);
        condition._condition = '!true';
        condition._tokenIndex = 0;
        condition._build();
        booleanExpression = condition._booleanNode;
        Test.assertEqual(booleanExpression.nodeType, NodeType.BOOL_EXPRESSION);
        Test.assertEqual(booleanExpression.nodeList.length, 1);
        relationExpression = booleanExpression.nodeList[0];
        Test.assertEqual(relationExpression.nodeType, NodeType.RELATION_EXPRESSION);
        Test.assertEqual(relationExpression.nodeList.length, 2);
        Test.assertEqual(relationExpression.nodeList[0].nodeType, NodeType.TOKEN);
        Test.assertEqual(relationExpression.nodeList[0].token.tokenType, TokenType.NOT);
        Test.assertEqual(relationExpression.nodeList[1].nodeType, NodeType.TOKEN);
        Test.assertEqual(relationExpression.nodeList[1].token.tokenType, TokenType.TRUE);

        // Test $test1===-123
        Test.describe('build $test1===-123');
        condition = new SqlTemplateCondition('true=true', true);
        condition._condition = '$test1===-123';
        condition._tokenIndex = 0;
        condition._build();
        booleanExpression = condition._booleanNode;
        Test.assertEqual(booleanExpression.nodeType, NodeType.BOOL_EXPRESSION);
        Test.assertEqual(booleanExpression.nodeList.length, 1);
        relationExpression = booleanExpression.nodeList[0];
        Test.assertEqual(relationExpression.nodeType, NodeType.RELATION_EXPRESSION);
        Test.assertEqual(relationExpression.nodeList.length, 3);
        Test.assertEqual(relationExpression.nodeList[0].nodeType, NodeType.EXPRESSION);
        Test.assertEqual(relationExpression.nodeList[1].nodeType, NodeType.TOKEN);
        Test.assertEqual(relationExpression.nodeList[1].token.tokenType, TokenType.COMPARE_EQUAL);
        Test.assertEqual(relationExpression.nodeList[2].nodeType, NodeType.EXPRESSION);

        expression = relationExpression.nodeList[0];
        Test.assertEqual(expression.nodeList.length, 1);
        Test.assertEqual(expression.nodeList[0].nodeType, NodeType.TERM);
        term = expression.nodeList[0];
        Test.assertEqual(term.nodeList.length, 1);
        Test.assertEqual(term.nodeList[0].nodeType, NodeType.FACTOR);
        factor = term.nodeList[0];
        Test.assertEqual(factor.nodeList.length, 1);
        Test.assertEqual(factor.nodeList[0].nodeType, NodeType.TOKEN);
        Test.assertEqual(factor.nodeList[0].token.tokenType, TokenType.IDENTIFIER);

        expression = relationExpression.nodeList[2];
        Test.assertEqual(expression.nodeList.length, 2);
        Test.assertEqual(expression.nodeList[0].nodeType, NodeType.TOKEN);
        Test.assertEqual(expression.nodeList[0].token.tokenType, TokenType.SUBTRACT);
        Test.assertEqual(expression.nodeList[1].nodeType, NodeType.TERM);
        term = expression.nodeList[1];
        Test.assertEqual(term.nodeList.length, 1);
        Test.assertEqual(term.nodeList[0].nodeType, NodeType.FACTOR);
        factor = term.nodeList[0];
        Test.assertEqual(factor.nodeList.length, 1);
        Test.assertEqual(factor.nodeList[0].nodeType, NodeType.TOKEN);
        Test.assertEqual(factor.nodeList[0].token.tokenType, TokenType.NUMBER);

        // Test 12+34=56-78
        Test.describe('build 12+34=56-78');
        condition = new SqlTemplateCondition('true=true', true);
        condition._condition = '12+34=56-78';
        condition._tokenIndex = 0;
        condition._build();
        booleanExpression = condition._booleanNode;
        Test.assertEqual(booleanExpression.nodeType, NodeType.BOOL_EXPRESSION);
        Test.assertEqual(booleanExpression.nodeList.length, 1);
        relationExpression = booleanExpression.nodeList[0];
        Test.assertEqual(relationExpression.nodeType, NodeType.RELATION_EXPRESSION);
        Test.assertEqual(relationExpression.nodeList.length, 3);
        Test.assertEqual(relationExpression.nodeList[0].nodeType, NodeType.EXPRESSION);
        Test.assertEqual(relationExpression.nodeList[1].nodeType, NodeType.TOKEN);
        Test.assertEqual(relationExpression.nodeList[1].token.tokenType, TokenType.COMPARE_EQUAL);
        Test.assertEqual(relationExpression.nodeList[2].nodeType, NodeType.EXPRESSION);

        expression = relationExpression.nodeList[0];
        Test.assertEqual(expression.nodeList.length, 3);
        Test.assertEqual(expression.nodeList[0].nodeType, NodeType.TERM);
        Test.assertEqual(expression.nodeList[1].nodeType, NodeType.TOKEN);
        Test.assertEqual(expression.nodeList[1].token.tokenType, TokenType.ADD);
        Test.assertEqual(expression.nodeList[2].nodeType, NodeType.TERM);

        term = expression.nodeList[0];
        Test.assertEqual(term.nodeList.length, 1);
        Test.assertEqual(term.nodeList[0].nodeType, NodeType.FACTOR);
        factor = term.nodeList[0];
        Test.assertEqual(factor.nodeList.length, 1);
        Test.assertEqual(factor.nodeList[0].nodeType, NodeType.TOKEN);
        Test.assertEqual(factor.nodeList[0].token.tokenType, TokenType.NUMBER);
        Test.assertEqual(factor.nodeList[0].token.value, 12);

        term = expression.nodeList[2];
        Test.assertEqual(term.nodeList.length, 1);
        Test.assertEqual(term.nodeList[0].nodeType, NodeType.FACTOR);
        factor = term.nodeList[0];
        Test.assertEqual(factor.nodeList.length, 1);
        Test.assertEqual(factor.nodeList[0].nodeType, NodeType.TOKEN);
        Test.assertEqual(factor.nodeList[0].token.tokenType, TokenType.NUMBER);
        Test.assertEqual(factor.nodeList[0].token.value, 34);

        expression = relationExpression.nodeList[2];
        Test.assertEqual(expression.nodeList.length, 3);
        Test.assertEqual(expression.nodeList[0].nodeType, NodeType.TERM);
        Test.assertEqual(expression.nodeList[1].nodeType, NodeType.TOKEN);
        Test.assertEqual(expression.nodeList[1].token.tokenType, TokenType.SUBTRACT);
        Test.assertEqual(expression.nodeList[2].nodeType, NodeType.TERM);

        term = expression.nodeList[0];
        Test.assertEqual(term.nodeList.length, 1);
        Test.assertEqual(term.nodeList[0].nodeType, NodeType.FACTOR);
        factor = term.nodeList[0];
        Test.assertEqual(factor.nodeList.length, 1);
        Test.assertEqual(factor.nodeList[0].nodeType, NodeType.TOKEN);
        Test.assertEqual(factor.nodeList[0].token.tokenType, TokenType.NUMBER);
        Test.assertEqual(factor.nodeList[0].token.value, 56);

        term = expression.nodeList[2];
        Test.assertEqual(term.nodeList.length, 1);
        Test.assertEqual(term.nodeList[0].nodeType, NodeType.FACTOR);
        factor = term.nodeList[0];
        Test.assertEqual(factor.nodeList.length, 1);
        Test.assertEqual(factor.nodeList[0].nodeType, NodeType.TOKEN);
        Test.assertEqual(factor.nodeList[0].token.tokenType, TokenType.NUMBER);
        Test.assertEqual(factor.nodeList[0].token.value, 78);

        // Test 12*34=56/78
        Test.describe('build 12*34=56/78');
        condition = new SqlTemplateCondition('true=true', true);
        condition._condition = '12*34=56/78';
        condition._tokenIndex = 0;
        condition._build();
        booleanExpression = condition._booleanNode;
        Test.assertEqual(booleanExpression.nodeType, NodeType.BOOL_EXPRESSION);
        Test.assertEqual(booleanExpression.nodeList.length, 1);
        relationExpression = booleanExpression.nodeList[0];
        Test.assertEqual(relationExpression.nodeType, NodeType.RELATION_EXPRESSION);
        Test.assertEqual(relationExpression.nodeList.length, 3);
        Test.assertEqual(relationExpression.nodeList[0].nodeType, NodeType.EXPRESSION);
        Test.assertEqual(relationExpression.nodeList[1].nodeType, NodeType.TOKEN);
        Test.assertEqual(relationExpression.nodeList[1].token.tokenType, TokenType.COMPARE_EQUAL);
        Test.assertEqual(relationExpression.nodeList[2].nodeType, NodeType.EXPRESSION);

        expression = relationExpression.nodeList[0];
        Test.assertEqual(expression.nodeList.length, 1);
        Test.assertEqual(expression.nodeList[0].nodeType, NodeType.TERM);
        term = expression.nodeList[0];
        Test.assertEqual(term.nodeList.length, 3);
        Test.assertEqual(term.nodeList[0].nodeType, NodeType.FACTOR);
        Test.assertEqual(term.nodeList[1].nodeType, NodeType.TOKEN);
        Test.assertEqual(term.nodeList[1].token.tokenType, TokenType.MULTIPLE);
        Test.assertEqual(term.nodeList[2].nodeType, NodeType.FACTOR);

        factor = term.nodeList[0];
        Test.assertEqual(factor.nodeList.length, 1);
        Test.assertEqual(factor.nodeList[0].nodeType, NodeType.TOKEN);
        Test.assertEqual(factor.nodeList[0].token.tokenType, TokenType.NUMBER);
        Test.assertEqual(factor.nodeList[0].token.value, 12);

        factor = term.nodeList[2];
        Test.assertEqual(factor.nodeList.length, 1);
        Test.assertEqual(factor.nodeList[0].nodeType, NodeType.TOKEN);
        Test.assertEqual(factor.nodeList[0].token.tokenType, TokenType.NUMBER);
        Test.assertEqual(factor.nodeList[0].token.value, 34);

        expression = relationExpression.nodeList[2];
        Test.assertEqual(expression.nodeList.length, 1);
        Test.assertEqual(expression.nodeList[0].nodeType, NodeType.TERM);
        term = expression.nodeList[0];
        Test.assertEqual(term.nodeList.length, 3);
        Test.assertEqual(term.nodeList[0].nodeType, NodeType.FACTOR);
        Test.assertEqual(term.nodeList[1].nodeType, NodeType.TOKEN);
        Test.assertEqual(term.nodeList[1].token.tokenType, TokenType.DIVIDE);
        Test.assertEqual(term.nodeList[2].nodeType, NodeType.FACTOR);

        factor = term.nodeList[0];
        Test.assertEqual(factor.nodeList.length, 1);
        Test.assertEqual(factor.nodeList[0].nodeType, NodeType.TOKEN);
        Test.assertEqual(factor.nodeList[0].token.tokenType, TokenType.NUMBER);
        Test.assertEqual(factor.nodeList[0].token.value, 56);

        factor = term.nodeList[2];
        Test.assertEqual(factor.nodeList.length, 1);
        Test.assertEqual(factor.nodeList[0].nodeType, NodeType.TOKEN);
        Test.assertEqual(factor.nodeList[0].token.tokenType, TokenType.NUMBER);
        Test.assertEqual(factor.nodeList[0].token.value, 78);

        // Test error 123
        Test.describe('build error 123');
        condition = new SqlTemplateCondition('true=true', true);
        condition._condition = '123';
        condition._tokenIndex = 0;
        try {
            condition._build();
            Test.assert();
        } catch (e) {
            Test.assertEqual(e.message, 'Syntax error in condition');
        }

        // Test error $test1==
        Test.describe('build error $test1==');
        condition = new SqlTemplateCondition('true=true', true);
        condition._condition = '$test1==';
        condition._tokenIndex = 0;
        try {
            condition._build();
            Test.assert();
        } catch (e) {
            Test.assertEqual(e.message, 'Syntax error in condition');
        }

        // Test error ($test1==123
        Test.describe('build error ($test1==123');
        condition = new SqlTemplateCondition('true=true', true);
        condition._condition = '($test1==123';
        condition._tokenIndex = 0;
        try {
            condition._build();
            Test.assert();
        } catch (e) {
            Test.assertEqual(e.message, 'Syntax error in condition');
        }

        // Test error $test1==1+
        Test.describe('build error $test1==1+');
        condition = new SqlTemplateCondition('true=true', true);
        condition._condition = '$test1==1+';
        condition._tokenIndex = 0;
        try {
            condition._build();
            Test.assert();
        } catch (e) {
            Test.assertEqual(e.message, 'Syntax error in condition');
        }

        // Test error $test1==1*
        Test.describe('build error $test1==1*');
        condition = new SqlTemplateCondition('true=true', true);
        condition._condition = '$test1==1*';
        condition._tokenIndex = 0;
        try {
            condition._build();
            Test.assert();
        } catch (e) {
            Test.assertEqual(e.message, 'Syntax error in condition');
        }

        // Test error $test1==(
        Test.describe('build error $test1==(');
        condition = new SqlTemplateCondition('true=true', true);
        condition._condition = '$test1==(';
        condition._tokenIndex = 0;
        try {
            condition._build();
            Test.assert();
        } catch (e) {
            Test.assertEqual(e.message, 'Syntax error in condition');
        }

        // Test errors
        Test.describe('build errors');
        try {
            condition = new SqlTemplateCondition('$test=true', true);
            condition = new SqlTemplateCondition('$test==false', true);
            condition = new SqlTemplateCondition('$test<>$test AND ($test!=NULL OR $test==123)', true);
            condition = new SqlTemplateCondition('($test!=NULL OR $test==123)', true);
            condition = new SqlTemplateCondition('$test!=NULL AND $test>"2024-05-17 00:00:00"', true);
            condition = new SqlTemplateCondition('$test>-123 && $test<23 + 42', true);
            condition = new SqlTemplateCondition('$test+$test2>$test3-$test4', true);
            condition = new SqlTemplateCondition('$test*$test2<$test3/$test4', true);
            condition = new SqlTemplateCondition('($test1==1 AND ((($test2=2 OR $test3=3) AND ($test4=4 OR $test5=5)) OR $test6=6))', true);
        } catch (e) {
            Test.assert();
        }
    }

    /**
     * Test the get result.
     */
    static testGetResult() {
        // Set values
        const values = {
            test1: 1,
            test2: 2,
            test3: 3
        };

        // Test $test1=1
        Test.describe('getResult $test1=1');
        let condition = new SqlTemplateCondition('$test1=1', true);
        let result = condition.getResult(values);
        Test.assertEqual(result, true);
        values.test1 = 0;
        result = condition.getResult(values);
        Test.assertEqual(result, false);

        // Test $test1=1 && ($test2=2 || $test3=3)
        Test.describe('getResult $test1=1 && ($test2=2 || $test3=3)');
        condition = new SqlTemplateCondition('$test1=1 && ($test2=2 || $test3=3)', true);
        values.test1 = 1;
        values.test2 = 2;
        values.test3 = 3;
        result = condition.getResult(values);
        Test.assertEqual(result, true);
        values.test1 = 1;
        values.test2 = 0;
        values.test3 = 3;
        result = condition.getResult(values);
        Test.assertEqual(result, true);
        values.test1 = 1;
        values.test2 = 2;
        values.test3 = 0;
        result = condition.getResult(values);
        Test.assertEqual(result, true);
        values.test1 = 1;
        values.test2 = 0;
        values.test3 = 0;
        result = condition.getResult(values);
        Test.assertEqual(result, false);
        values.test1 = 0;
        values.test2 = 2;
        values.test3 = 3;
        result = condition.getResult(values);
        Test.assertEqual(result, false);
        values.test1 = 0;
        values.test2 = 0;
        values.test3 = 0;
        result = condition.getResult(values);
        Test.assertEqual(result, false);

        // Test $boolean=true
        Test.describe('getResult $boolean=true');
        condition = new SqlTemplateCondition('$boolean=true', true);
        values.boolean = true;
        result = condition.getResult(values);
        Test.assertEqual(result, true);
        values.boolean = false;
        result = condition.getResult(values);
        Test.assertEqual(result, false);

        // Test true==$boolean
        Test.describe('getResult true==$boolean');
        condition = new SqlTemplateCondition('true==$boolean', true);
        values.boolean = true;
        result = condition.getResult(values);
        Test.assertEqual(result, true);
        values.boolean = false;
        result = condition.getResult(values);
        Test.assertEqual(result, false);

        // Test $test1=-123
        Test.describe('getResult $test1=-123');
        condition = new SqlTemplateCondition('$test1=-123', true);
        values.test1 = -123;
        result = condition.getResult(values);
        Test.assertEqual(result, true);
        values.test1 = 123;
        result = condition.getResult(values);
        Test.assertEqual(result, false);
        values.test1 = 0;
        result = condition.getResult(values);
        Test.assertEqual(result, false);

        // Test $test1+12=$test2-34
        Test.describe('getResult $test1+12=$test2-34');
        condition = new SqlTemplateCondition('$test1+12=$test2-34', true);
        values.test1 = 10;
        values.test2 = 56;
        result = condition.getResult(values);
        Test.assertEqual(result, true);
        values.test1 = 1;
        values.test2 = 2;
        result = condition.getResult(values);
        Test.assertEqual(result, false);

        // Test $test1*2=$test2/4
        Test.describe('getResult $test1*2=$test2/4');
        condition = new SqlTemplateCondition('$test1*2=$test2/4', true);
        values.test1 = 10;
        values.test2 = 80;
        result = condition.getResult(values);
        Test.assertEqual(result, true);
        values.test1 = 1;
        values.test2 = 2;
        result = condition.getResult(values);
        Test.assertEqual(result, false);

        // Test $testNull=NULL
        Test.describe('getResult $testNull=NULL');
        condition = new SqlTemplateCondition('$testNull=NULL', true);
        values.testNull = null;
        result = condition.getResult(values);
        Test.assertEqual(result, true);
        values.testNull = 123;
        result = condition.getResult(values);
        Test.assertEqual(result, false);

        // Test $testUndefined=null
        Test.describe('getResult $testUndefined=null');
        condition = new SqlTemplateCondition('$testUndefined=null', true);
        values.testUndefined = undefined;
        result = condition.getResult(values);
        Test.assertEqual(result, true);
        values.testUndefined = 123;
        result = condition.getResult(values);
        Test.assertEqual(result, false);

        // Test $test1>10
        Test.describe('getResult $test1>10');
        condition = new SqlTemplateCondition('$test1>10', true);
        values.test1 = 11;
        result = condition.getResult(values);
        Test.assertEqual(result, true);
        values.test1 = 10;
        result = condition.getResult(values);
        Test.assertEqual(result, false);
        values.test1 = 9;
        result = condition.getResult(values);
        Test.assertEqual(result, false);

        // Test $test1>=10
        Test.describe('getResult $test1>=10');
        condition = new SqlTemplateCondition('$test1>=10', true);
        values.test1 = 11;
        result = condition.getResult(values);
        Test.assertEqual(result, true);
        values.test1 = 10;
        result = condition.getResult(values);
        Test.assertEqual(result, true);
        values.test1 = 9;
        result = condition.getResult(values);
        Test.assertEqual(result, false);

        // Test $test1<10
        Test.describe('getResult $test1<10');
        condition = new SqlTemplateCondition('$test1<10', true);
        values.test1 = 9;
        result = condition.getResult(values);
        Test.assertEqual(result, true);
        values.test1 = 10;
        result = condition.getResult(values);
        Test.assertEqual(result, false);
        values.test1 = 11;
        result = condition.getResult(values);
        Test.assertEqual(result, false);

        // Test $test1<=10
        Test.describe('getResult $test1<=10');
        condition = new SqlTemplateCondition('$test1<=10', true);
        values.test1 = 9;
        result = condition.getResult(values);
        Test.assertEqual(result, true);
        values.test1 = 10;
        result = condition.getResult(values);
        Test.assertEqual(result, true);
        values.test1 = 11;
        result = condition.getResult(values);
        Test.assertEqual(result, false);

        // Test $test1!=10
        Test.describe('getResult $test1!=10');
        condition = new SqlTemplateCondition('$test1!=10', true);
        values.test1 = 10;
        result = condition.getResult(values);
        Test.assertEqual(result, false);
        values.test1 = 9;
        result = condition.getResult(values);
        Test.assertEqual(result, true);
        values.test1 = 11;
        result = condition.getResult(values);
        Test.assertEqual(result, true);

        // Test $test1==$test2
        Test.describe('getResult $test1==$test2');
        condition = new SqlTemplateCondition('$test1==$test2', true);
        values.test1 = 10;
        values.test2 = 10;
        result = condition.getResult(values);
        Test.assertEqual(result, true);
        values.test2 = 9;
        result = condition.getResult(values);
        Test.assertEqual(result, false);

        // Test $testString=="hello world"
        Test.describe('getResult $testString=="hello world"');
        condition = new SqlTemplateCondition('$testString=="hello world"', true);
        values.testString = 'hello world';
        result = condition.getResult(values);
        Test.assertEqual(result, true);
        values.testString = 'good stuff';
        result = condition.getResult(values);
        Test.assertEqual(result, false);
        values.testString = '';
        result = condition.getResult(values);
        Test.assertEqual(result, false);
        values.testString = null;
        result = condition.getResult(values);
        Test.assertEqual(result, false);
        values.testString = undefined;
        result = condition.getResult(values);
        Test.assertEqual(result, false);

        // Test $test1String==$test2String
        Test.describe('getResult $test1String==$test2String');
        condition = new SqlTemplateCondition('$test1String==$test2String', true);
        values.test1String = 'hello world';
        values.test2String = 'hello world';
        result = condition.getResult(values);
        Test.assertEqual(result, true);
        values.test2String = 'good stuff';
        result = condition.getResult(values);
        Test.assertEqual(result, false);
        values.test1String = '';
        values.test2String = '';
        result = condition.getResult(values);
        Test.assertEqual(result, true);
        values.test1String = null;
        values.test2String = null;
        result = condition.getResult(values);
        Test.assertEqual(result, true);
        values.test1String = undefined;
        values.test2String = undefined;
        result = condition.getResult(values);
        Test.assertEqual(result, true);

        // Test $testDate=="date"
        Test.describe('getResult $testDate=="date"');
        condition = new SqlTemplateCondition('$testDate=="2024-05-17 00:00:00"', true);
        values.testDate = new Date(Date.UTC(2024, 4, 17, 0 ,0, 0, 0));
        result = condition.getResult(values);
        Test.assertEqual(result, true);
        values.testDate = new Date(Date.UTC(2023, 1, 23, 0 ,0, 0, 0));
        result = condition.getResult(values);
        Test.assertEqual(result, false);

        // Local date
        condition = new SqlTemplateCondition('$testDate=="2024-05-17 00:00:00"', false);
        values.testDate = new Date(2024, 4, 17, 0 ,0, 0, 0);
        result = condition.getResult(values);
        Test.assertEqual(result, true);
        values.testDate = new Date(2023, 1, 23, 0 ,0, 0, 0);
        result = condition.getResult(values);
        Test.assertEqual(result, false);
        // May fail if timezone is same as UTC (UK!?)
        values.testDate = new Date(Date.UTC(2024, 4, 17, 0 ,0, 0, 0));
        result = condition.getResult(values);
        Test.assertEqual(result, false);
    }
}
