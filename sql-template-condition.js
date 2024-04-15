/**
 * SQL Template Condition
 * Used to process the #if <condition> parts of the SQL Template preprocessor.
 */
import { Node } from "./node.js";
import { NodeType } from "./node.js";
import { Token } from "./token.js";
import { TokenType } from "./token.js";

export class SqlTemplateCondition {
    /**
     * Default constructor.
     * @param {String} condition The condition text. 
     * @param {Boolean} utc Will the dates use local date and time or UTC
     */
    constructor(condition, utc) {
        // If no condition text
        if (!condition) throw new Error('Missing condition data');

        // Set condition
        this._condition = condition;

        // Set utc
        this._utc = utc;

        // Build condition
        this._build();
    }

    getResult(values) {
        // Set values
        this._values = values;

        // Get boolean expression node value
        return this._getNodeValue(this._booleanNode);
    }



    /**
     * Process the conditions for the #if and #elif preprocessor commands.
     * @param {String} text The text being processed.
     * @param {Object} values The values passed to the format function.
     */
    _processCondition(text, values) {
        // Create condition token list
        //const conditionTokenList = SqlTools._createConditionTokenList(text);

        // Create condition tree
        //const conditionTokenTree = SqlTools._createConditionTokenTree(conditionTokenList);

        // Check condition tree errors

    }

    

    /**
     * Build the condition. This takes the condition text, reads each token and makes the boolean expression tree.
     */
    _build() {
        // Set token index
        this._tokenIndex = 0;

        // Create root boolean expression node
        this._booleanNode = new Node(NodeType.BOOL_EXPRESSION);

        // Create first required relation expression node
        const relationExpressionNode = new Node(NodeType.RELATION_EXPRESSION);
        this._booleanNode.nodeList.push(relationExpressionNode);
        this._booleanNode.state = 1;

        // Create node row list (10 levels)
        const nodeRowList = [this._booleanNode, relationExpressionNode, null, null, null, null, null, null, null, null];
        
        // Set node row index
        let nodeRowIndex = 1;

        // For each token
        while (true) {
            // Get next token
            const token = this._getNextToken();

            // If finished
            if (token === null) break;

            // Continue processing this token
            while (true) {
                // If processing boolean expression
                if (nodeRowList[nodeRowIndex].nodeType === NodeType.BOOL_EXPRESSION) {
                    // If state 0 (looking for relation expression)
                    if (nodeRowList[nodeRowIndex].state === 0) {
                        // Add relation expression node
                        const relationExpressionNode = new Node(NodeType.RELATION_EXPRESSION);

                        // Add to node list
                        nodeRowList[nodeRowIndex].nodeList.push(relationExpressionNode);
                        
                        // Move the state on to the and/or
                        nodeRowList[nodeRowIndex].state = 1;

                        // Add term to the row
                        nodeRowIndex++;
                        nodeRowList[nodeRowIndex] = factorNode;

                        // Continue processing this token
                        continue;
                    }

                    // If state 1 (looking for and/or)
                    if (nodeRowList[nodeRowIndex].state === 1) {
                        // If token AND OR
                        if (token.tokenType === TokenType.AND || token.tokenType === TokenType.OR) {
                            // Add new node to the list
                            nodeRowList[nodeRowIndex].nodeList.push(new Node(NodeType.TOKEN, token));

                            // Move the state on to the looking for relation expression
                            nodeRowList[nodeRowIndex].state = 0;

                            // Move on to the next token
                            break;
                        } else {
                            // Move on to the next token (there shouldn't be one)
                            break;
                        }
                    }                    
                }

                // If processing relation expression
                if (nodeRowList[nodeRowIndex].nodeType === NodeType.RELATION_EXPRESSION) {
                    // If state 0 (looking for NOT)
                    if (nodeRowList[nodeRowIndex].state === 0) {
                        // If token in not
                        if (token.tokenType === TokenType.NOT) {
                            // Add new node NOT to the list
                            nodeRowList[nodeRowIndex].nodeList.push(new Node(NodeType.TOKEN, token));

                            // Increase state to then next part
                            nodeRowList[nodeRowIndex].state++;

                            // Move on to the next token
                            break;
                        }

                        // Set state to the next part
                        nodeRowList[nodeRowIndex].state = 1;

                        // Continue processing this token
                        continue;
                    }

                    // If state 1 (looking for true, false or expression)
                    if (nodeRowList[nodeRowIndex].state === 1) {
                        // If token true or false
                        if (token.tokenType === TokenType.TRUE || token.tokenType === TokenType.FALSE) {
                            // Add new node NOT to the list
                            nodeRowList[nodeRowIndex].nodeList.push(new Node(NodeType.TOKEN, token));

                            // Finished this relation expression. Go back one row
                            nodeRowIndex--;

                            // Continue processing this token
                            continue;
                        }

                        // Add expression node
                        const expressionNode = new Node(NodeType.EXPRESSION);

                        // Add to node list
                        nodeRowList[nodeRowIndex].nodeList.push(expressionNode);
                        
                        // Move the state on to the first expression
                        nodeRowList[nodeRowIndex].state = 2;

                        // Add expression to the row
                        nodeRowIndex++;
                        nodeRowList[nodeRowIndex] = expressionNode;

                        // Continue processing this token
                        continue;
                    }

                    // If state 2 (looking for compare)
                    if (nodeRowList[nodeRowIndex].state === 2) {
                        // If token is compare
                        if (token.tokenType === TokenType.COMPARE_EQUAL ||
                            token.tokenType === TokenType.COMPARE_NOT_EQUAL ||
                            token.tokenType === TokenType.COMPARE_LESS ||
                            token.tokenType === TokenType.COMPARE_LESS_EQUAL ||
                            token.tokenType === TokenType.COMPARE_GREATER ||
                            token.tokenType === TokenType.COMPARE_GREATER_EQUAL) {
                            // Add new node NOT to the list
                            nodeRowList[nodeRowIndex].nodeList.push(new Node(NodeType.TOKEN, token));

                            // Set state to the next express
                            nodeRowList[nodeRowIndex].state = 3;

                            // Move on to the next token
                            break;
                        }

                        // Syntax error
                        throw new Error('Syntax error. Expected comparison');
                    }

                    // If state 3 (looking second expression)
                    if (nodeRowList[nodeRowIndex].state === 3) {
                        // Add expression node
                        const expressionNode = new Node(NodeType.EXPRESSION);

                        // Add to node list
                        nodeRowList[nodeRowIndex].nodeList.push(expressionNode);
                        
                        // Move the state on to the second expression
                        nodeRowList[nodeRowIndex].state = 4;

                        // Add expression to the row
                        nodeRowIndex++;
                        nodeRowList[nodeRowIndex] = expressionNode;

                        // Continue processing this token
                        continue;
                    }

                    // If state 4 (finishing second expression)
                    if (nodeRowList[nodeRowIndex].state === 4) {
                        // Finished this relation expression. Go back one row
                        nodeRowIndex--;

                        // Continue processing this token
                        continue;
                    }
                }

                // If processing expression
                if (nodeRowList[nodeRowIndex].nodeType === NodeType.EXPRESSION) {
                    // If state 0 (looking for -)
                    if (nodeRowList[nodeRowIndex].state === 0) {
                        // If token in SUBTRACT
                        if (token.tokenType === TokenType.SUBTRACT) {
                            // Add new node SUBTRACT to the list
                            nodeRowList[nodeRowIndex].nodeList.push(new Node(NodeType.TOKEN, token));

                            // Increase state to then next part
                            nodeRowList[nodeRowIndex].state++;

                            // Move on to the next token
                            break;
                        }

                        // Set state to the next part
                        nodeRowList[nodeRowIndex].state = 1;

                        // Continue processing this token
                        continue;
                    }

                    // If state 1 (looking for term)
                    if (nodeRowList[nodeRowIndex].state === 1) {
                        // Add term node
                        const termNode = new Node(NodeType.TERM);

                        // Add to node list
                        nodeRowList[nodeRowIndex].nodeList.push(termNode);
                        
                        // Move the state on to the add/sub
                        nodeRowList[nodeRowIndex].state = 2;

                        // Add term to the row
                        nodeRowIndex++;
                        nodeRowList[nodeRowIndex] = termNode;

                        // Continue processing this token
                        continue;
                    }

                    // If state 2 (looking for add/sub)
                    if (nodeRowList[nodeRowIndex].state === 2) {
                        // If token add or sub
                        if (token.tokenType === TokenType.ADD || token.tokenType === TokenType.SUBTRACT) {
                            // Add new node to the list
                            nodeRowList[nodeRowIndex].nodeList.push(new Node(NodeType.TOKEN, token));

                            // Move the state on to the looking for term
                            nodeRowList[nodeRowIndex].state = 1;

                            // Move on to the next token
                            break;
                        } else {
                            // Must have finish the expression
                            nodeRowIndex--;

                            // Continue processing this token
                            continue;
                        }
                    }                    
                }

                // If processing term
                if (nodeRowList[nodeRowIndex].nodeType === NodeType.TERM) {
                    // If state 0 (looking for factor)
                    if (nodeRowList[nodeRowIndex].state === 0) {
                        // Add factor node
                        const factorNode = new Node(NodeType.FACTOR);

                        // Add to node list
                        nodeRowList[nodeRowIndex].nodeList.push(factorNode);
                        
                        // Move the state on to the multiple/divide
                        nodeRowList[nodeRowIndex].state = 1;

                        // Add term to the row
                        nodeRowIndex++;
                        nodeRowList[nodeRowIndex] = factorNode;

                        // Continue processing this token
                        continue;
                    }

                    // If state 1 (looking for multiple/divide)
                    if (nodeRowList[nodeRowIndex].state === 1) {
                        // If token multiple or divide
                        if (token.tokenType === TokenType.MULTIPLE || token.tokenType === TokenType.DIVIDE) {
                            // Add new node to the list
                            nodeRowList[nodeRowIndex].nodeList.push(new Node(NodeType.TOKEN, token));

                            // Move the state on to the looking for factor
                            nodeRowList[nodeRowIndex].state = 0;

                            // Move on to the next token
                            break;
                        } else {
                            // Must have finish the term
                            nodeRowIndex--;

                            // Continue processing this token
                            continue;
                        }
                    }                    
                }

                // If processing factor
                if (nodeRowList[nodeRowIndex].nodeType === NodeType.FACTOR) {
                    // If state identifier, variable or open bracket
                    if (nodeRowList[nodeRowIndex].state === 0) {
                        // If TEXT, NUMBER, NULL or IDENTIFIER
                        if (token.tokenType === TokenType.TEXT ||
                            token.tokenType === TokenType.NUMBER ||
                            token.tokenType === TokenType.NULL ||
                            token.tokenType === TokenType.IDENTIFIER) {
                            // Add new node to the list
                            nodeRowList[nodeRowIndex].nodeList.push(new Node(NodeType.TOKEN, token));

                            // Must have finish the factor
                            nodeRowIndex--;

                            // Move on to the next token
                            break;
                        }

                        // If OPEN BRACKET
                        if (token.tokenType === TokenType.OPEN_BRACKET) {
                            // Move the state on to the first expression
                            nodeRowList[nodeRowIndex].state = 1;

                            // Move on to the next token
                            break;
                        }

                        // Syntax error
                        throw new Error('Syntax error. Expected text, number, identifier or open bracket');
                    }

                    // If state 1 (looking for express)
                    if (nodeRowList[nodeRowIndex].state === 1) {
                        // Add expression node
                        const expressionNode = new Node(NodeType.EXPRESSION);

                        // Add to node list
                        nodeRowList[nodeRowIndex].nodeList.push(expressionNode);
                        
                        // Move the state on to the closing bracket
                        nodeRowList[nodeRowIndex].state = 2;

                        // Add expression to the row
                        nodeRowIndex++;
                        nodeRowList[nodeRowIndex] = expressionNode;

                        // Continue processing this token
                        continue;
                    }

                    // If state 2 (looking closing bracket)
                    if (nodeRowList[nodeRowIndex].state === 2) {
                        // If token CLOSE BRACKET
                        if (token.tokenType === TokenType.CLOSE_BRACKET) {
                            // Must have finish the factor
                            nodeRowIndex--;

                            // Move on to the next token
                            break;
                        }
                    }                    
                }
            }
        }
    }

    /**
     * Create the condition token list. This is a quick method of getting the tokens. The tokens are as follows:
     * white space,(,),$value,=,==,===,>=,<=,>,<,!=,!==,!,+,-,*,/,"string",'string',number,&&,||,true,false,null
     * @param {String} text The text to get the tokens from.
     * @return {String[]} List of tokens.
     */
    static _createConditionTokenList(text) {
        // Create token list
        const tokenList = [];

        // Set token type
        let tokenType = 0;

        // Set token start index
        let tokenStartIndex = 0;

        // Set character index
        let characterIndex = 0;

        // Loop until done
        while (true) {
            // Check limits
            if (characterIndex >= text.length) break;

            // Get character
            const character = text.charAt(characterIndex);

            // If unknown token type
            if (tokenType === 0) {
                // If white space then skip
                if (character === ' ' ||
                    character === '\t') {
                    // Increase to the next character
                    characterIndex++;

                    // Continue on to the next character and token
                    continue;
                }

                // If single character tokens
                if (character === '(') { SqlTools._conditionAddToken(tokenList, SqlTools.TOKEN_OPEN_BRACKET); characterIndex++; continue; }
                if (character === ')') { SqlTools._conditionAddToken(tokenList, SqlTools.TOKEN_CLOSE_BRACKET); characterIndex++; continue; }
                if (character === '+') { SqlTools._conditionAddToken(tokenList, SqlTools.TOKEN_ADD); characterIndex++; continue; }
                if (character === '-') { SqlTools._conditionAddToken(tokenList, SqlTools.TOKEN_SUBTRACT); characterIndex++; continue; }
                if (character === '*') { SqlTools._conditionAddToken(tokenList, SqlTools.TOKEN_MULTIPLE); characterIndex++; continue; }
                if (character === '/') { SqlTools._conditionAddToken(tokenList, SqlTools.TOKEN_DIVIDE); characterIndex++; continue; }

                // If start of identifier
                if (character === '$') {
                    // Set index of start of token
                    tokenStartIndex = characterIndex;

                    // Set token type to identifier (1)
                    tokenType = 1;

                    // Increase to the next character
                    characterIndex++;

                    // Continue reading in the identifier
                    continue;
                }

                // If start of string (single quote)
                if (character === '\'') {
                    // Set index of start of token
                    tokenStartIndex = characterIndex;

                    // Set token type to single quote (2)
                    tokenType = 2;

                    // Increase to the next character
                    characterIndex++;

                    // Continue reading in the variable
                    continue;
                }

                // If start of string (double quote)
                if (character === '\"') {
                    // Set index of start of token
                    tokenStartIndex = characterIndex;

                    // Set token type to single quote (3)
                    tokenType = 3;

                    // Increase to the next character
                    characterIndex++;

                    // Continue reading in the variable
                    continue;
                }

                // Set next 2 characters
                let characterP1 = 0;
                let characterP2 = 0;
                if (characterIndex + 1 < text.length) characterP1 = text.charAt(characterIndex + 1);
                if (characterIndex + 2 < text.length) characterP2 = text.charAt(characterIndex + 2);

                // If start of hex number
                if (character >= '0' && (characterP1 <= 'x' || characterP1 <= 'X')) {
                    // Set index of start of token
                    tokenStartIndex = characterIndex;

                    // Set token type to hex number (5)
                    tokenType = 5;

                    // Increase to the next character
                    characterIndex += 2;

                    // Continue reading in the number
                    continue;
                }

                // If start of number
                if (character >= '0' && character <= '9') {
                    // Set index of start of token
                    tokenStartIndex = characterIndex;

                    // Set token type to number (4)
                    tokenType = 4;

                    // Increase to the next character
                    characterIndex++;

                    // Continue reading in the number
                    continue;
                }

                // Check 3 character tokens
                if (character === '=' && characterP1 === '=' && characterP2 === '=') { SqlTools._conditionAddToken(tokenList, SqlTools.TOKEN_COMPARE_EQUAL); characterIndex += 3; continue; }
                if (character === '!' && characterP1 === '=' && characterP2 === '=') { SqlTools._conditionAddToken(tokenList, SqlTools.TOKEN_COMPARE_NOT_EQUAL); characterIndex += 3; continue; }

                // Check 2 character tokens
                if (character === '=' && characterP1 === '=') { SqlTools._conditionAddToken(tokenList, SqlTools.TOKEN_COMPARE_EQUAL); characterIndex += 2; continue; }
                if (character === '!' && characterP1 === '=') { SqlTools._conditionAddToken(tokenList, SqlTools.TOKEN_COMPARE_NOT_EQUAL); characterIndex += 2; continue; }
                if (character === '>' && characterP1 === '=') { SqlTools._conditionAddToken(tokenList, SqlTools.TOKEN_COMPARE_GREATER_EQUAL); characterIndex += 2; continue; }
                if (character === '<' && characterP1 === '=') { SqlTools._conditionAddToken(tokenList, SqlTools.TOKEN_COMPARE_LESS_EQUAL); characterIndex += 2; continue; }
                if (character === '&' && characterP1 === '&') { SqlTools._conditionAddToken(tokenList, SqlTools.TOKEN_AND); characterIndex += 2; continue; }
                if (character === '|' && characterP1 === '|') { SqlTools._conditionAddToken(tokenList, SqlTools.TOKEN_OR); characterIndex += 2; continue; }

                // Check 1 character token
                if (character === '=') { SqlTools._conditionAddToken(tokenList, SqlTools.TOKEN_COMPARE_EQUAL); characterIndex++; continue; }
                if (character === '!') { SqlTools._conditionAddToken(tokenList, SqlTools.TOKEN_NOT); characterIndex++; continue; }
                if (character === '>') { SqlTools._conditionAddToken(tokenList, SqlTools.TOKEN_COMPARE_GREATER); characterIndex++; continue; }
                if (character === '<') { SqlTools._conditionAddToken(tokenList, SqlTools.TOKEN_COMPARE_LESS); characterIndex++; continue; }

                // If true
                if (character === 't' || character === 'T') {
                    if (characterP1 === 'r' || characterP1 === 'R') {
                        if (characterP2 === 'u' || characterP2 === 'U') {
                            if (characterIndex + 3 < text.length) {
                                const characterP3 = text.charAt(characterIndex + 3);
                                if (characterP3 === 'e' || characterP3 === 'E') { SqlTools._conditionAddToken(tokenList, SqlTools.TOKEN_TRUE); characterIndex += 4; continue; }
                            }
                        }
                    }
                }

                // If false
                if (character === 'f' || character === 'F') {
                    if (characterP1 === 'a' || characterP1 === 'A') {
                        if (characterP2 === 'l' || characterP2 === 'L') {
                            if (characterIndex + 4 < text.length) {
                                const characterP3 = text.charAt(characterIndex + 3);
                                const characterP4 = text.charAt(characterIndex + 4);
                                if (characterP3 === 's' || characterP3 === 'S') { 
                                    if (characterP4 === 'e' || characterP4 === 'E') { SqlTools._conditionAddToken(tokenList, SqlTools.TOKEN_FALSE); characterIndex += 5; continue; }
                                }                                    
                            }
                        }
                    }
                }

                // If we got here then there must be an error
                throw new Error('Syntax error. Unknown token starting at: ' + text.substring(characterIndex));
            }

            // If token type is identifier
            if (tokenType === 1) {
                // If part of a identifier
                if ((character >= '0' && character <= '9') ||
                    (character >= 'a' && character <= 'z') ||
                    (character >= 'A' && character <= 'Z') ||
                    (character === '_')) {
                    // Increase character index and read the next identifier character
                    characterIndex++;
                    continue;
                }

                // Set value
                const value = text.substring(tokenStartIndex, characterIndex)

                // We have come to the end of the identifier. Add token identifier to the list with value
                SqlTools._conditionAddTokenWithText(tokenList, SqlTools.TOKEN_IDENTIFIER, value);

                // Change the token type to unknown and reprocess this character
                tokenType = 0;
                continue;
            }

            // If token type is string (single quote)
            if (tokenType === 2) {
                // If \'
                if (character === '\\') {
                    // If not reached the end
                    if (characterIndex + 1 < text.length) {
                        // If ' character
                        if (text.charAt(characterIndex + 1) === '\'') {
                            // Increase character index and read the next string character
                            characterIndex += 2;
                            continue;
                        }
                    }
                }

                // If not single quote
                if (character !== '\'') {
                    // Increase character index and read the next string character
                    characterIndex++;
                    continue;
                }

                // Set value
                const value = text.substring(tokenStartIndex + 1, characterIndex);

                // We have come to the end of the string. Add token text to the list with value
                SqlTools._conditionAddTokenWithValue(tokenList, SqlTools.TOKEN_TEXT, value);

                // Change the token type to unknown and move on to the next character
                tokenType = 0;
                characterIndex++;
                continue;
            }

            // If token type is string (double quote)
            if (tokenType === 3) {
                // If \"
                if (character === '\\') {
                    // If not reached the end
                    if (characterIndex + 1 < text.length) {
                        // If ' character
                        if (text.charAt(characterIndex + 1) === '\"') {
                            // Increase character index and read the next string character
                            characterIndex += 2;
                            continue;
                        }
                    }
                }

                // If not double quote
                if (character !== '\"') {
                    // Increase character index and read the next string character
                    characterIndex++;
                    continue;
                }

                // Set value
                const value = text.substring(tokenStartIndex + 1, characterIndex);

                // We have come to the end of the string. Add token text to the list with value
                SqlTools._conditionAddTokenWithValue(tokenList, SqlTools.TOKEN_TEXT, value);

                // Change the token type to unknown and move on to the next character
                tokenType = 0;
                characterIndex++;
                continue;
            }

            // If token type is number
            if (tokenType === 4) {
                // If part of a number
                if ((character >= '0' && character <= '9') || character === '.') {
                    // Increase character index and read the next number character
                    characterIndex++;
                    continue;
                }

                // Set value
                const value = parseFloat(text.substring(tokenStartIndex, characterIndex));

                // We have come to the end of the number. Add token number to the list with value
                SqlTools._conditionAddTokenWithValue(tokenList, SqlTools.TOKEN_NUMBER, value);

                // Change the token type to unknown and reprocess this character
                tokenType = 0;
                continue;
            }

            // If token type is hex number
            if (tokenType === 5) {
                // If part of a number
                if ((character >= '0' && character <= '9') ||
                    (character >= 'A' && character <= 'F') ||
                    (character >= 'a' && character <= 'f')) {
                    // Increase character index and read the next number character
                    characterIndex++;
                    continue;
                }

                // Set value
                const value = Number(text.substring(tokenStartIndex, characterIndex));

                // We have come to the end of the number. Add token number to the list with value
                SqlTools._conditionAddTokenWithValue(tokenList, SqlTools.TOKEN_NUMBER, value);

                // Change the token type to unknown and reprocess this character
                tokenType = 0;
                continue;
            }
        }

        // If still in the middle of reading a identifier
        if (tokenType === 1) {
            // Finish adding the identifier token to the list with value
            SqlTools._conditionAddTokenWithValue(tokenList, SqlTools.TOKEN_IDENTIFIER, text.substring(tokenStartIndex));
        }

        // If still in the middle of reading a string
        if (tokenType === 2 || tokenType === 3) {
            // There must be something wrong
            throw new Error('Missing closing string quotation mark');
        }

        // If still in the middle of reading a number
        if (tokenType === 4) {
            // Finish adding the number token to the list with value
            SqlTools._conditionAddTokenWithValue(tokenList, SqlTools.TOKEN_NUMBER, parseFloat(text.substring(tokenStartIndex)));
        }

        // If still in the middle of reading a hex number
        if (tokenType === 5) {
            // Finish adding the number token to the list with value
            SqlTools._conditionAddTokenWithValue(tokenList, SqlTools.TOKEN_NUMBER, Number(text.substring(tokenStartIndex)));
        }

        // Return the token list
        return tokenList;
    }

    static _conditionAddToken(list, type) {
        // Create token
        const token = {};

        // Set type
        token.tokenType = type;

        // Add to list
        list.push(token);
    }

    static _conditionAddTokenWithValue(list, type, value) {
        // Create token
        const token = {};

        // Set type
        token.tokenType = type;

        // Set value
        token.value = value;

        // Add to list
        list.push(token);
    }

    /**
     * Get the next token in the condition.
     * @return {Token} The next token. Null means no more tokens.
     */
    _getNextToken() {
        // Set start token index
        let startTokenIndex = this._tokenIndex;

        // Set token type
        let tokenType = 0;

        // Set is double quotation
        let isDoubleQuotation = false;

        // Set is text open
        let isTextOpen = false;

        // Set is hex
        let isHex = false;

        // Loop until we have the next token
        while (true) {
            // Check limits
            if (this._tokenIndex >= this._condition.length) break;

            // Read next character
            const character = this._condition.charAt(this._tokenIndex);

            // Increase to the next character
            this._tokenIndex++;

            // If no token yet
            if (tokenType === 0) {                
                // If white space then skip
                if (character === ' ' || character === '\t') {
                    // Reset start token index
                    startTokenIndex = this._tokenIndex;

                    // Continue on to the next character
                    continue;
                }

                // If single character tokens
                if (character === '(') { tokenType = TokenType.OPEN_BRACKET; break; }
                if (character === ')') { tokenType = TokenType.CLOSE_BRACKET; break; }
                if (character === '+') { tokenType = TokenType.ADD; break; }
                if (character === '-') { tokenType = TokenType.SUBTRACT; break; }
                if (character === '*') { tokenType = TokenType.MULTIPLE; break; }
                if (character === '/') { tokenType = TokenType.DIVIDE; break; }

                // If start of identifier
                if (character === '$') {
                    // Set token type to identifier
                    tokenType = TokenType.IDENTIFIER;

                    // Continue reading in the identifier
                    continue;
                }
              
                // If start of string (single quote)
                if (character === '\'') {
                    // Set token type to text
                    tokenType = TokenType.TEXT;

                    // Set is not double quotation text
                    isDoubleQuotation = false;

                    // Set text is open
                    isTextOpen = true;

                    // Continue reading in the text
                    continue;
                }

                // If start of string (double quote)
                if (character === '\"') {
                    // Set token type to text
                    tokenType = TokenType.TEXT;

                    // Set is double quotation text
                    isDoubleQuotation = true;

                    // Set text is open
                    isTextOpen = true;

                    // Continue reading in the text
                    continue;
                }

                // Set next 2 characters
                let character2 = 0;
                let character3 = 0;
                if (this._tokenIndex + 1 < this._condition.length) character2 = this._condition.charAt(this._tokenIndex + 1);
                if (this._tokenIndex + 2 < this._condition.length) character3 = this._condition.charAt(this._tokenIndex + 2);

                // If start of hex number
                if (character >= '0' && (character2 <= 'x' || character2 <= 'X')) {
                    // Set token type to number
                    tokenType = TokenType.NUMBER;

                    // Set is hex
                    isHex = true;

                    // Skip the second character
                    this._tokenIndex++;

                    // Continue reading in the number
                    continue;
                }

                // If start of number
                if (character >= '0' && character <= '9') {
                    // Set token type to number
                    tokenType = TokenType.NUMBER;

                    // Set is not hex
                    isHex = false;

                    // Continue reading in the number
                    continue;
                }

                // Check 3 character tokens
                if (character === '=' && character2 === '=' && character3 === '=') { tokenType = TokenType.COMPARE_EQUAL; this._tokenIndex += 2; break; }
                if (character === '!' && character2 === '=' && character3 === '=') { tokenType = TokenType.COMPARE_NOT_EQUAL; this._tokenIndex += 2; break; }

                // Check 2 character tokens
                if (character === '=' && character2 === '=') { tokenType = TokenType.COMPARE_EQUAL; this._tokenIndex++; break; }
                if (character === '!' && character2 === '=') { tokenType = TokenType.COMPARE_NOT_EQUAL; this._tokenIndex++; break; }
                if (character === '<' && character2 === '>') { tokenType = TokenType.COMPARE_NOT_EQUAL; this._tokenIndex++; break; }
                if (character === '>' && character2 === '=') { tokenType = TokenType.COMPARE_GREATER_EQUAL; this._tokenIndex++; break; }
                if (character === '<' && character2 === '=') { tokenType = TokenType.COMPARE_LESS_EQUAL; this._tokenIndex++; break; }
                if (character === '&' && character2 === '&') { tokenType = TokenType.AND; this._tokenIndex++; break; }
                if (character === '|' && character2 === '|') { tokenType = TokenType.OR; this._tokenIndex++; break; }

                // Check 1 character token
                if (character === '=') { tokenType = TokenType.COMPARE_EQUAL; break; }
                if (character === '!') { tokenType = TokenType.NOT; break; }
                if (character === '>') { tokenType = TokenType.COMPARE_GREATER; break; }
                if (character === '<') { tokenType = TokenType.COMPARE_LESS; break; }

                // If NULL
                if (character === 'n' || character === 'N') {
                    if (character2 === 'u' || character2 === 'U') {
                        if (character3 === 'l' || character3 === 'L') {
                            if (this._tokenIndex + 3 < this._condition.length) {
                                const character4 = this._condition.charAt(this._tokenIndex + 3);
                                if (character4 === 'l' || character4 === 'l') { tokenType = TokenType.NULL; this._tokenIndex += 3; break; }
                            }
                        }
                    }
                }

                // If true
                if (character === 't' || character === 'T') {
                    if (character2 === 'r' || character2 === 'R') {
                        if (character3 === 'u' || character3 === 'U') {
                            if (this._tokenIndex + 3 < this._condition.length) {
                                const character4 = this._condition.charAt(this._tokenIndex + 3);
                                if (character4 === 'e' || character4 === 'E') { tokenType = TokenType.TRUE; this._tokenIndex += 3; break; }
                            }
                        }
                    }
                }

                // If false
                if (character === 'f' || character === 'F') {
                    if (character2 === 'a' || character2 === 'A') {
                        if (character3 === 'l' || character3 === 'L') {
                            if (this._tokenIndex + 4 < this._condition.length) {
                                const character4 = this._condition.charAt(this._tokenIndex + 3);
                                const character5 = this._condition.charAt(this._tokenIndex + 4);
                                if ((character4 === 's' || character4 === 'S') ||
                                    (character5 === 'e' || character5 === 'E')) { tokenType = TokenType.FALSE; this._tokenIndex += 4; break; }
                            }
                        }
                    }
                }
            }

            // If reading identifier
            if (tokenType === TokenType.IDENTIFIER) {
                // If part of a identifier
                if ((character >= '0' && character <= '9') ||
                    (character >= 'a' && character <= 'z') ||
                    (character >= 'A' && character <= 'Z') ||
                    character === '_') {
                    // Continue to read the next identifier character
                    continue;
                }

                // Go back one character
                this._tokenIndex--;

                // This is the end of the identifier, so stop looking
                break;
            }

            // If reading text
            if (tokenType === TokenType.TEXT) {
                // If closing quotation
                if ((isDoubleQuotation === false && character === '\'') ||
                    (isDoubleQuotation === true && character === '\"')) {
                    // Set is no longer open
                    isTextOpen = false;

                    // Stop looking
                    break;
                }
                

                // If \ escape character
                if (character === '\\') {
                    // Skip the escape character
                    this._tokenIndex++;
                }

                // Continue reading in the text
                continue;
            }

            // If reading number
            if (tokenType === TokenType.NUMBER) {
                // If hex
                if (isHex === true) {
                    // If part of a hex number
                    if ((character >= '0' && character <= '9') ||
                        (character >= 'A' && character <= 'F') ||
                        (character >= 'a' && character <= 'f')) {
                        // Continue to read the next hex number character
                        continue;
                    }
                } else {
                    // If part of a number
                    if ((character >= '0' && character <= '9') || character === '.') {
                        // Continue to read the next hex number character
                        continue;
                    }
                }

                // Go back one character
                this._tokenIndex--;

                // This is the end of the hex number, so stop looking
                break;
            }
        }

        // If there is no token then return end of tokens
        if (tokenType === 0) return null;

        // Create token
        const token = new Token();
        token.tokenType = tokenType;

        // If token is true or false
        if (tokenType === TokenType.TRUE) token.value = true;
        if (tokenType === TokenType.FALSE) token.value = false;

        // If token is NULL
        if (tokenType === TokenType.NULL) token.value = null;

        // If token is identifier
        if (tokenType === TokenType.IDENTIFIER) token.value = this._condition.substring(startTokenIndex, this._tokenIndex);

        // If token is text but is not closed
        if (tokenType === TokenType.TEXT && isTextOpen === true) {
            // There must be something wrong
            throw new Error('Missing closing string quotation mark');
        }

        // If token is text
        if (tokenType === TokenType.TEXT) {
            // Get final text
            const text = this._condition.substring(startTokenIndex + 1, this._tokenIndex);

            // Check and process escape characters
            if (text.indexOf('\\"') !== -1) text = text.replace('\\"', '\"');
            if (text.indexOf('\\"') !== -1) text = text.replace('\\"', '\"');
            if (text.indexOf('\\n') !== -1) text = text.replace('\\n', '\n');
            if (text.indexOf('\\r') !== -1) text = text.replace('\\r', '\r');
            if (text.indexOf('\\t') !== -1) text = text.replace('\\t', '\t');

            // Set text value
            token.value = text;
        }

        // If token in number
        if (tokenType === TokenType.NUMBER) {
            // If hex number
            if (isHex === true) {
                // Convert into number from hex
                token.value = Number(this._condition.substring(startTokenIndex, this._tokenIndex));
            } else {
                // Convert into number
                token.value = parseFloat(this._condition.substring(startTokenIndex, this._tokenIndex));
            }
        }

        // Return the token
        return token;
    }

    _getNodeValue(node) {
        // If node is boolean expression
        if (node.nodeType === NodeType.BOOL_EXPRESSION) {
            // Set boolean value
            let booleanValue = null;

            // Set last child result
            let lastChildResult = true;

            // For each node
            for (var index = 0; index < node.nodeList.length; index++) {
                // Get child node
                const childNode = node.nodeList[index];

                // If relation expression
                if (childNode.nodeType === NodeType.RELATION_EXPRESSION) {
                    // Get result from child node
                    lastChildResult = this._getNodeValue(childNode);

                    // If boolean value not set yet
                    if (booleanValue === null) booleanValue = lastChildResult;
                    continue;
                }

                // If AND
                if (node.token.tokenType === TokenType.AND) {
                    // Add the boolean value with the last child result
                    booleanValue = booleanValue && lastChildResult;
                }

                // If OR
                if (node.token.tokenType === TokenType.OR) {
                    // And the boolean value with the last child result
                    booleanValue = booleanValue || lastChildResult;
                }
            }

            // Return the boolean value
            return booleanValue;
        }

        // If node is relation expression
        if (node.nodeType === NodeType.RELATION_EXPRESSION) {
            // If one node
            if (node.nodeList.length === 1) {
                // Get child node
                const childNode = node.nodeList[0];

                // Check if true or false
                if (childNode.token.tokenType === TokenType.TRUE) return true;
                if (childNode.token.tokenType === TokenType.FALSE) return false;
            }

            // If two nodes
            if (node.nodeList.length === 2) {
                // Get second child node
                const childNode = node.nodeList[1];

                // Check if true or false (it starts with a NOT, so swap)
                if (childNode.token.tokenType === TokenType.TRUE) return false;
                if (childNode.token.tokenType === TokenType.FALSE) return true;
            }

            // If three nodes
            if (node.nodeList.length === 3) {
                // Get results
                const firstResult = this._getNodeValue(node.nodeList[0]);
                const secondResult = this._getNodeValue(node.nodeList[2]);

                // Get compare token
                const compareTokenType = node.nodeList[1].token.tokenType;

                // Check compares
                if (compareTokenType === TokenType.COMPARE_EQUAL && firstResult == secondResult) return true;
                if (compareTokenType === TokenType.COMPARE_NOT_EQUAL && firstResult != secondResult) return true;
                if (compareTokenType === TokenType.COMPARE_LESS && firstResult < secondResult) return true;
                if (compareTokenType === TokenType.COMPARE_LESS_EQUAL && firstResult <= secondResult) return true;
                if (compareTokenType === TokenType.COMPARE_GREATER && firstResult > secondResult) return true;
                if (compareTokenType === TokenType.COMPARE_GREATER_EQUAL && firstResult >= secondResult) return true;

                // Return false otherwise
                return false;
            }

            // If four nodes (starts with NOT)
            if (node.nodeList.length === 4) {
                // Get results
                const firstResult = this._getNodeValue(node.nodeList[1]);
                const secondResult = this._getNodeValue(node.nodeList[3]);

                // Get compare token
                const compareTokenType = node.nodeList[2].token.tokenType;

                // Check compares
                if (compareTokenType === TokenType.COMPARE_EQUAL && firstResult === secondResult) return false;
                if (compareTokenType === TokenType.COMPARE_NOT_EQUAL && firstResult !== secondResult) return false;
                if (compareTokenType === TokenType.COMPARE_LESS && firstResult < secondResult) return false;
                if (compareTokenType === TokenType.COMPARE_LESS_EQUAL && firstResult <= secondResult) return false;
                if (compareTokenType === TokenType.COMPARE_GREATER && firstResult > secondResult) return false;
                if (compareTokenType === TokenType.COMPARE_GREATER_EQUAL && firstResult >= secondResult) return false;

                // Return true otherwise
                return true;
            }
        }

        // If node is expression
        if (node.nodeType === NodeType.EXPRESSION) {
            // Set expression value
            let expressionValue = null;

            // Set negate
            let negate = false;

            // Set last child result
            let lastChildResult = 0;

            // For each node
            for (var index = 0; index < node.nodeList.length; index++) {
                // Get child node
                const childNode = node.nodeList[index];

                // If first and minus
                if (index === 0 && childNode.nodeType === NodeType.TOKEN) {
                    // Set to negate
                    negate = true;
                    continue;
                }

                // If term
                if (childNode.nodeType === NodeType.TERM) {
                    // Get term value
                    const termValue = this._getNodeValue(childNode);

                    // If negate required
                    if (negate === true) {
                        // negate the first term value
                        termValue = -1 * termValue;

                        // Reset negate
                        negate = false;
                    }

                    // Set last child result
                    lastChildResult = termValue;

                    // If expression value not set yet
                    if (expressionValue === null) expressionValue = lastChildResult;
                    continue;
                }

                // If subtraction
                if (childNode.token.tokenType === TokenType.SUBTRACT) {
                    // Subtract the expression value with the last child result
                    expressionValue = expressionValue - lastChildResult;
                }

                // If add
                if (childNode.token.tokenType === TokenType.ADD) {
                    // Add the expression value with the last child result
                    expressionValue = expressionValue + lastChildResult;
                }
            }

            // Return the expression value
            return expressionValue;
        }

        // If node is term
        if (node.nodeType === NodeType.TERM) {
            // Set term value
            let termValue = null;

            // Set last child result
            let lastChildResult = 0;

            // For each node
            for (var index = 0; index < node.nodeList.length; index++) {
                // Get child node
                const childNode = node.nodeList[index];

                // If factor
                if (childNode.nodeType === NodeType.FACTOR) {
                    // Get factor value
                    const factorValue = this._getNodeValue(childNode);

                    // Set last child result
                    lastChildResult = factorValue;

                    // If term value not set yet
                    if (termValue === null) termValue = lastChildResult;
                    continue;
                }

                // If multiple
                if (childNode.token.tokenType === TokenType.MULTIPLE) {
                    // Multiple the expression value with the last child result
                    expressionValue = expressionValue * lastChildResult;
                }

                // If divide
                if (childNode.token.tokenType === TokenType.DIVIDE) {
                    // Divide the expression value with the last child result
                    expressionValue = expressionValue / lastChildResult;
                }
            }

            // Return the term value
            return termValue;
        }

        // If node is factor
        if (node.nodeType === NodeType.FACTOR) {
            // If 1 node
            if (node.nodeList.length === 1) {
                // Get child node
                const childNode = node.nodeList[0];

                // If text, number or NULL
                if (childNode.token.tokenType === TokenType.TEXT) return childNode.token.value;
                if (childNode.token.tokenType === TokenType.NUMBER) return childNode.token.value;
                if (childNode.token.tokenType === TokenType.NULL) return null;

                // If identifier
                if (childNode.token.tokenType === TokenType.IDENTIFIER) {
                    // Set property name
                    const propertyName = childNode.token.value.substring(1);

                    // If the property does not exist
                    if (typeof this._values[propertyName] === 'undefined') throw new Error('Unknown identifier ' + childNode.token.value);

                    // Get value
                    const value = this._values[propertyName];

                    // If null
                    if (value === null) return null;

                    // If Date class
                    if (value instanceof Date) return this._formatDate(value);

                    // Return the value as is
                    return value;
                }
            }

            // If 3 node
            if (node.nodeList.length === 3) {
                // Return the expression
                return this._getNodeValue(node.nodeList[2]);
            }
        }
    }

    /**
     * Format the date and time into an SQL text format. This uses local date time, not UTC.
     * Format is YYYY-MM-DD HH:MM:SS.
     * @param {Date} date The date object to convert.
     * @return {String} The date in text format.
     */
    _formatDate(date) {
        // Get date and time values
        let year = 0;
        let month = 0;
        let day = 0;
        let hour = 0;
        let minute = 0;
        let second = 0;

        // If UTC
        if (this._utc) {
            // Get UTC date and time values
            year = date.getUTCFullYear();
            month = date.getUTCMonth() + 1;
            day = date.getUTCDate();
            hour = date.getUTCHours();
            minute = date.getUTCMinutes();
            second = date.getUTCSeconds();

        } else {
            // Else local

            // Get local date and time values
            year = date.getFullYear();
            month = date.getMonth() + 1;
            day = date.getDate();
            hour = date.getHours();
            minute = date.getMinutes();
            second = date.getSeconds();
        }

        // Format years
        let yearText = year.toString();

        // Format months
        let monthText = month.toString();
        if (monthText.length === 1) monthText = '0' + monthText;
        
        // Format days
        let dayText = day.toString();
        if (dayText.length === 1) dayText = '0' + dayText;

        // Format hours
        let hourText = hour.toString();
        if (hourText.length === 1) hourText = '0' + hourText;

        // Format minutes
        let minuteText = minute.toString();
        if (minuteText.length === 1) minuteText = '0' + minuteText;

        // Format seconds
        let secondText = second.toString();
        if (secondText.length === 1) secondText = '0' + secondText;

        // Format SQL date time
        const sqlText = yearText + monthText + dayText + hourText + minuteText + secondText;
        
        // Return formatted SQL date time
        return sqlText;
    }
}