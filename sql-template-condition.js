/**
 * SQL Template Condition
 * Used to process the #if <condition> parts of the SQL Template preprocessor.
 */
import { Node } from "./node.js";
import { NodeType } from "./node.js";
import { SqlConfig } from "./sql-config.js";
import { SqlConvert } from "./sql-convert.js";
import { Token } from "./token.js";
import { TokenType } from "./token.js";

export class SqlTemplateCondition {
    /**
     * Default constructor.
     * @param {String} condition The condition text. 
     * @param {SqlConfig} sqlConfig The SQL config settings to use.
     */
    constructor(condition, sqlOptions) {
        // If no condition text
        if (!condition) throw new Error('Missing condition data');

        // Set condition
        this._condition = condition;

        // Set SQL config
        this._sqlConfig = sqlConfig;

        // Build condition
        this._build();
    }

    /**
     * Get the boolean value result by processing the condition using the given values.
     * @param {Object} values The values used to process the condition.
     * @return {Boolean} The result of the condition.
     */
    getResult(values) {
        // Set values
        this._values = values;

        // Get boolean expression node value
        return this._getNodeValue(this._booleanNode);
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
                        nodeRowList[nodeRowIndex] = relationExpressionNode;

                        // Continue processing this token
                        continue;
                    }

                    // If state 1 (looking for and/or)
                    if (nodeRowList[nodeRowIndex].state === 1) {
                        // If no more tokens
                        if (token === null) {
                            // If this is the first boolean expression then we have finished
                            if (nodeRowIndex === 0) return;

                            // Something has gone wrong
                            throw new Error('Syntax error in condition');
                        }

                        // If token AND OR
                        if (token.tokenType === TokenType.AND || token.tokenType === TokenType.OR) {
                            // Add new node to the list
                            nodeRowList[nodeRowIndex].nodeList.push(new Node(NodeType.TOKEN, token));

                            // Move the state on to the looking for relation expression
                            nodeRowList[nodeRowIndex].state = 0;

                            // Move on to the next token
                            break;
                        } else {
                            // If this is the lowest level then we should have finished
                            if (nodeRowIndex === 0) break;
                            
                            // Finished this boolean expression. Go back one row
                            nodeRowIndex--;

                            // Continue processing this token
                            continue;
                        }
                    }                    
                }

                // If processing relation expression
                if (nodeRowList[nodeRowIndex].nodeType === NodeType.RELATION_EXPRESSION) {
                    // If state 0 (looking for true, false, not, identifier (, or expression)
                    if (nodeRowList[nodeRowIndex].state === 0) {
                        // If no token then something is wrong
                        if (token === null) throw new Error('Syntax error in condition');

                        // If token true or false
                        if (token.tokenType === TokenType.TRUE || token.tokenType === TokenType.FALSE) {
                            // Poll the next token
                            const nextToken = this._pollNextToken();

                            // If no next token
                            if (nextToken === null) {
                                // Add new node to the list
                                nodeRowList[nodeRowIndex].nodeList.push(new Node(NodeType.TOKEN, token));

                                // Finished this relation expression. Go back one row
                                nodeRowIndex--;

                                // Continue processing this token
                                continue;
                            }

                            // If next token is not compare
                            if (nextToken.tokenType !== TokenType.COMPARE_EQUAL &&
                                nextToken.tokenType !== TokenType.COMPARE_NOT_EQUAL &&
                                nextToken.tokenType !== TokenType.COMPARE_LESS &&
                                nextToken.tokenType !== TokenType.COMPARE_LESS_EQUAL &&
                                nextToken.tokenType !== TokenType.COMPARE_GREATER &&
                                nextToken.tokenType !== TokenType.COMPARE_GREATER_EQUAL) {
                                // Add new node to the list
                                nodeRowList[nodeRowIndex].nodeList.push(new Node(NodeType.TOKEN, token));

                                // Finished this relation expression. Go back one row
                                nodeRowIndex--;

                                // Continue processing this token
                                continue;
                            }
                        }

                        // If NOT
                        if (token.tokenType === TokenType.NOT) {
                            // Poll the next token
                            const nextToken = this._pollNextToken();

                            // If token
                            if (nextToken !== null) {
                                // If IDENTIFIER
                                if (nextToken.tokenType === TokenType.IDENTIFIER) {
                                    // Add new node to the list
                                    nodeRowList[nodeRowIndex].nodeList.push(new Node(NodeType.TOKEN, token));

                                    // Move on to the next token
                                    break;
                                }
                            }

                            // Should not get here
                            throw new Error('Syntax error in condition');
                        }

                        // If IDENTIFIER
                        if (token.tokenType === TokenType.IDENTIFIER) {
                            // Poll the next token
                            const nextToken = this._pollNextToken();

                            // If no next token
                            if (nextToken === null) {
                                // Add new node to the list
                                nodeRowList[nodeRowIndex].nodeList.push(new Node(NodeType.TOKEN, token));

                                // Finished this relation expression. Go back one row
                                nodeRowIndex--;

                                // Continue processing this token
                                continue;
                            }

                            // If next token is not compare or term/factor part
                            if (nextToken.tokenType !== TokenType.COMPARE_EQUAL &&
                                nextToken.tokenType !== TokenType.COMPARE_NOT_EQUAL &&
                                nextToken.tokenType !== TokenType.COMPARE_LESS &&
                                nextToken.tokenType !== TokenType.COMPARE_LESS_EQUAL &&
                                nextToken.tokenType !== TokenType.COMPARE_GREATER &&
                                nextToken.tokenType !== TokenType.COMPARE_GREATER_EQUAL &&
                                nextToken.tokenType !== TokenType.ADD &&
                                nextToken.tokenType !== TokenType.SUBTRACT &&
                                nextToken.tokenType !== TokenType.MULTIPLE &&
                                nextToken.tokenType !== TokenType.DIVIDE) {
                                // Add new node to the list
                                nodeRowList[nodeRowIndex].nodeList.push(new Node(NodeType.TOKEN, token));

                                // Finished this relation expression. Go back one row
                                nodeRowIndex--;

                                // Continue processing this token
                                continue;
                            }
                        }

                        // If open bracket
                        if (token.tokenType === TokenType.OPEN_BRACKET) {
                            // Add boolean expression node
                            const booleanExpressionNode = new Node(NodeType.BOOL_EXPRESSION);

                            // Add to node list
                            nodeRowList[nodeRowIndex].nodeList.push(booleanExpressionNode);
                            
                            // Move the state on to the closing bracket boolean expression
                            nodeRowList[nodeRowIndex].state = 4;

                            // Add expression to the row
                            nodeRowIndex++;
                            nodeRowList[nodeRowIndex] = booleanExpressionNode;

                            // Move on to the next token
                            break;
                        }

                        // Add expression node
                        const expressionNode = new Node(NodeType.EXPRESSION);

                        // Add to node list
                        nodeRowList[nodeRowIndex].nodeList.push(expressionNode);
                        
                        // Move the state on to the first expression
                        nodeRowList[nodeRowIndex].state = 1;

                        // Add expression to the row
                        nodeRowIndex++;
                        nodeRowList[nodeRowIndex] = expressionNode;

                        // Continue processing this token
                        continue;
                    }

                    // If state 2 (looking for compare)
                    if (nodeRowList[nodeRowIndex].state === 1) {
                        // If no token then something is wrong
                        if (token === null) throw new Error('Syntax error in condition');

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
                            nodeRowList[nodeRowIndex].state = 2;

                            // Move on to the next token
                            break;
                        }

                        // Syntax error
                        throw new Error('Syntax error. Expected comparison');
                    }

                    // If state 3 (looking second expression)
                    if (nodeRowList[nodeRowIndex].state === 2) {
                        // Add expression node
                        const expressionNode = new Node(NodeType.EXPRESSION);

                        // Add to node list
                        nodeRowList[nodeRowIndex].nodeList.push(expressionNode);
                        
                        // Move the state on to the second expression
                        nodeRowList[nodeRowIndex].state = 3;

                        // Add expression to the row
                        nodeRowIndex++;
                        nodeRowList[nodeRowIndex] = expressionNode;

                        // Continue processing this token
                        continue;
                    }

                    // If state 4 (finishing second expression)
                    if (nodeRowList[nodeRowIndex].state === 3) {
                        // Finished this relation expression. Go back one row
                        nodeRowIndex--;

                        // Continue processing this token
                        continue;
                    }

                    // If state 5 (closing bracket)
                    if (nodeRowList[nodeRowIndex].state === 4) {
                        // If no token then something is wrong
                        if (token === null) throw new Error('Syntax error in condition');

                        // If token closing bracket
                        if (token.tokenType === TokenType.CLOSE_BRACKET) {
                            // Finished this relation expression. Go back one row
                            nodeRowIndex--;

                            // Move on to the next token
                            break;
                        }

                        // Something has gone wrong
                        throw new Error('Missing closing bracket');
                    }
                }

                // If processing expression
                if (nodeRowList[nodeRowIndex].nodeType === NodeType.EXPRESSION) {
                    // If state 0 (looking for -)
                    if (nodeRowList[nodeRowIndex].state === 0) {
                        // If no token then something is wrong
                        if (token === null) throw new Error('Syntax error in condition');

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
                        // If token
                        if (token !== null) {
                            // If token add or sub
                            if (token.tokenType === TokenType.ADD || token.tokenType === TokenType.SUBTRACT) {
                                // Add new node to the list
                                nodeRowList[nodeRowIndex].nodeList.push(new Node(NodeType.TOKEN, token));

                                // Move the state on to the looking for term
                                nodeRowList[nodeRowIndex].state = 1;

                                // Move on to the next token
                                break;
                            }
                        }

                        // Must have finish the expression
                        nodeRowIndex--;

                        // Continue processing this token
                        continue;
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
                        // If token
                        if (token !== null) {
                            // If token multiple or divide
                            if (token.tokenType === TokenType.MULTIPLE || token.tokenType === TokenType.DIVIDE) {
                                // Add new node to the list
                                nodeRowList[nodeRowIndex].nodeList.push(new Node(NodeType.TOKEN, token));

                                // Move the state on to the looking for factor
                                nodeRowList[nodeRowIndex].state = 0;

                                // Move on to the next token
                                break;
                            }
                        }

                        // Must have finish the term
                        nodeRowIndex--;

                        // Continue processing this token
                        continue;
                    }                    
                }

                // If processing factor
                if (nodeRowList[nodeRowIndex].nodeType === NodeType.FACTOR) {
                    // If state identifier, variable or open bracket
                    if (nodeRowList[nodeRowIndex].state === 0) {
                        // If no token then something is wrong
                        if (token === null) throw new Error('Syntax error in condition');

                        // If TEXT, NUMBER, NULL or IDENTIFIER
                        if (token.tokenType === TokenType.TEXT ||
                            token.tokenType === TokenType.NUMBER ||
                            token.tokenType === TokenType.NULL ||
                            token.tokenType === TokenType.TRUE ||
                            token.tokenType === TokenType.FALSE ||
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
                        throw new Error('Syntax error in condition');
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
                        // If no token then something is wrong
                        if (token === null) throw new Error('Syntax error in condition');

                        // If token CLOSE BRACKET
                        if (token.tokenType === TokenType.CLOSE_BRACKET) {
                            // Must have finish the factor
                            nodeRowIndex--;

                            // Move on to the next token
                            break;
                        }
                    }                    
                }

                // Should not get here
                throw new Error('Syntax error in condition');
            }
        }
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
                if (this._tokenIndex < this._condition.length) character2 = this._condition.charAt(this._tokenIndex);
                if (this._tokenIndex + 1 < this._condition.length) character3 = this._condition.charAt(this._tokenIndex + 1);

                // If start of hex number
                if (character === '0' && (character2 === 'x' || character2 === 'X')) {
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
                
                // Check AND
                if ((character === 'a' || character === 'A') && 
                    (character2 === 'n' || character2 === 'N') &&
                    (character3 === 'd' || character3 === 'D')) {
                    // Set token, increase token index and move on
                    tokenType = TokenType.AND;
                    this._tokenIndex += 2;
                    break;
                }

                // Check 2 character tokens
                if (character === '=' && character2 === '=') { tokenType = TokenType.COMPARE_EQUAL; this._tokenIndex++; break; }
                if (character === '!' && character2 === '=') { tokenType = TokenType.COMPARE_NOT_EQUAL; this._tokenIndex++; break; }
                if (character === '<' && character2 === '>') { tokenType = TokenType.COMPARE_NOT_EQUAL; this._tokenIndex++; break; }
                if (character === '>' && character2 === '=') { tokenType = TokenType.COMPARE_GREATER_EQUAL; this._tokenIndex++; break; }
                if (character === '<' && character2 === '=') { tokenType = TokenType.COMPARE_LESS_EQUAL; this._tokenIndex++; break; }
                if (character === '&' && character2 === '&') { tokenType = TokenType.AND; this._tokenIndex++; break; }
                if (character === '|' && character2 === '|') { tokenType = TokenType.OR; this._tokenIndex++; break; }

                // If OR
                if ((character === 'o' || character === 'O') && 
                    (character2 === 'r' || character2 === 'R')) {
                    // Set token, increase token index and move on
                    tokenType = TokenType.OR;
                    this._tokenIndex++;
                    break;
                }

                // Check 1 character token
                if (character === '=') { tokenType = TokenType.COMPARE_EQUAL; break; }
                if (character === '!') { tokenType = TokenType.NOT; break; }
                if (character === '>') { tokenType = TokenType.COMPARE_GREATER; break; }
                if (character === '<') { tokenType = TokenType.COMPARE_LESS; break; }

                // If NULL
                if (character === 'n' || character === 'N') {
                    if (character2 === 'u' || character2 === 'U') {
                        if (character3 === 'l' || character3 === 'L') {
                            if (this._tokenIndex + 2 < this._condition.length) {
                                const character4 = this._condition.charAt(this._tokenIndex + 2);
                                if (character4 === 'l' || character4 === 'L') { tokenType = TokenType.NULL; this._tokenIndex += 3; break; }
                            }
                        }
                    }
                }

                // If true
                if (character === 't' || character === 'T') {
                    if (character2 === 'r' || character2 === 'R') {
                        if (character3 === 'u' || character3 === 'U') {
                            if (this._tokenIndex + 2 < this._condition.length) {
                                const character4 = this._condition.charAt(this._tokenIndex + 2);
                                if (character4 === 'e' || character4 === 'E') { tokenType = TokenType.TRUE; this._tokenIndex += 3; break; }
                            }
                        }
                    }
                }

                // If false
                if (character === 'f' || character === 'F') {
                    if (character2 === 'a' || character2 === 'A') {
                        if (character3 === 'l' || character3 === 'L') {
                            if (this._tokenIndex + 3 < this._condition.length) {
                                const character4 = this._condition.charAt(this._tokenIndex + 2);
                                const character5 = this._condition.charAt(this._tokenIndex + 3);
                                if ((character4 === 's' || character4 === 'S') ||
                                    (character5 === 'e' || character5 === 'E')) { tokenType = TokenType.FALSE; this._tokenIndex += 4; break; }
                            }
                        }
                    }
                }

                // If we got here then there must be an error
                throw new Error('Syntax error. Unknown token starting at: ' + this._condition.substring(this._tokenIndex - 1));
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
                        // Continue to read the next number character
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
            let text = this._condition.substring(startTokenIndex + 1, this._tokenIndex - 1);

            // Check and process escape characters
            if (text.indexOf('\\"') !== -1) text = text.replace('\\"', '\"');
            if (text.indexOf('\\\'') !== -1) text = text.replace('\\\'', '\'');
            if (text.indexOf('\\n') !== -1) text = text.replace('\\n', '\n');
            if (text.indexOf('\\r') !== -1) text = text.replace('\\r', '\r');
            if (text.indexOf('\\t') !== -1) text = text.replace('\\t', '\t');

            // Set text value
            token.value = text;
        }

        // If token in number
        if (tokenType === TokenType.NUMBER) {
            // Get final text
            const text = this._condition.substring(startTokenIndex, this._tokenIndex);

            // If hex number
            if (isHex === true) {
                // Convert into number from hex
                token.value = Number(text);
            } else {
                // Convert into number
                token.value = parseFloat(text);
            }
        }

        // Return the token
        return token;
    }

    /**
     * Get the next token but do not increase the token index. This looks ahead to see what
     * the next token is without changing what calling _getNextToken will return.
     */
    _pollNextToken() {
        // Save token index
        const currentTokenIndex = this._tokenIndex;

        // Get next token
        const token = this._getNextToken();

        // Reset the token index to the last one
        this._tokenIndex = currentTokenIndex;

        // Return the next token
        return token;
    }

    /**
     * Get the node's value.
     * @param {Node} node The node to get the value for.
     * @return {String|Number|Boolean} Some value relating to the node.
     */
    _getNodeValue(node) {
        // If node is boolean expression
        if (node.nodeType === NodeType.BOOL_EXPRESSION) {
            // Set boolean value
            let booleanValue = null;

            // Set last boolean token type
            let lastBooleanTokenType = null;

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

                    // If last boolean token used
                    if (lastBooleanTokenType !== null) {
                        // If last was AND
                        if (lastBooleanTokenType === TokenType.AND) {
                            // AND the boolean value with the last child result
                            booleanValue = booleanValue && lastChildResult;
                        }

                        // If last was OR
                        if (lastBooleanTokenType === TokenType.OR) {
                            // OR the boolean value with the last child result
                            booleanValue = booleanValue || lastChildResult;
                        }
                    }
                    continue;
                }

                // If AND or OR
                if (childNode.token.tokenType === TokenType.AND || childNode.token.tokenType === TokenType.OR) {
                    // Set the last boolean token type
                    lastBooleanTokenType = childNode.token.tokenType;
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

                // If bool expression
                if (childNode.nodeType === NodeType.BOOL_EXPRESSION) return this._getNodeValue(childNode);

                // Check if true or false
                if (childNode.token.tokenType === TokenType.TRUE) return true;
                if (childNode.token.tokenType === TokenType.FALSE) return false;

                // If IDENTIFIER
                if (childNode.token.tokenType === TokenType.IDENTIFIER) {
                    // Set property name
                    const propertyName = childNode.token.value.substring(1);

                    // If the property does not exist then return false
                    if (typeof this._values[propertyName] === 'undefined') return false;

                    // Get value
                    const value = this._values[propertyName];

                    // If null then return false
                    if (value === null) return false;

                    // If string
                    if (typeof value === 'string') {
                        // If the string is empty then return false
                        if (value.length === 0) return false;
                    }

                    // If boolean then return the boolean value
                    if (typeof value === 'boolean') return value;

                    // Otherwise we have the property so return true
                    return true;
                }
            }

            // If two nodes
            if (node.nodeList.length === 2) {
                // Get IDENTIFIER child node (the second, the first one is NOT)
                const childNode = node.nodeList[1];

                // Set property name
                const propertyName = childNode.token.value.substring(1);

                // If the property does not exist then return NOT false
                if (typeof this._values[propertyName] === 'undefined') return true;

                // Get value
                const value = this._values[propertyName];

                // If null then return NOT false
                if (value === null) return true;

                // If string
                if (typeof value === 'string') {
                    // If the string is empty then return NOT false
                    if (value.length === 0) return true;
                }

                // If boolean then return the NOT boolean value
                if (typeof value === 'boolean') return !value;

                // Otherwise we have the property so return NOT true
                return false;
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
        }

        // If node is expression
        if (node.nodeType === NodeType.EXPRESSION) {
            // Set expression value
            let expressionValue = null;

            // Set last expression token type
            let lastExpressionTokenType = null;

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
                    let termValue = this._getNodeValue(childNode);

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

                    // If last expression token used
                    if (lastExpressionTokenType !== null) {
                        // If last was ADD
                        if (lastExpressionTokenType === TokenType.ADD) {
                            // ADD the expression value with the last child result
                            expressionValue = expressionValue + lastChildResult;
                        }

                        // If last was SUBTRACT
                        if (lastExpressionTokenType === TokenType.SUBTRACT) {
                            // SUBTRACT the expression value with the last child result
                            expressionValue = expressionValue - lastChildResult;
                        }
                    }
                    continue;
                }

                // If add or subtraction
                if (childNode.token.tokenType === TokenType.ADD || childNode.token.tokenType === TokenType.SUBTRACT) {
                    // Set the last expression token type
                    lastExpressionTokenType = childNode.token.tokenType;
                }
            }

            // Return the expression value
            return expressionValue;
        }

        // If node is term
        if (node.nodeType === NodeType.TERM) {
            // Set term value
            let termValue = null;

            // Set last term token type
            let lastTermTokenType = null;

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

                    // If last term token used
                    if (lastTermTokenType !== null) {
                        // If last was MULTIPLE
                        if (lastTermTokenType === TokenType.MULTIPLE) {
                            // MULTIPLE the term value with the last child result
                            termValue = termValue * lastChildResult;
                        }

                        // If last was DIVIDE
                        if (lastTermTokenType === TokenType.DIVIDE) {
                            // DIVIDE the term value with the last child result
                            termValue = termValue / lastChildResult;
                        }
                    }
                    continue;
                }

                // If multiple or divide
                if (childNode.token.tokenType === TokenType.MULTIPLE || childNode.token.tokenType === TokenType.DIVIDE) {
                    // Set the last term token type
                    lastTermTokenType = childNode.token.tokenType
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
                if (childNode.token.tokenType === TokenType.TRUE) return true;
                if (childNode.token.tokenType === TokenType.FALSE) return false;

                // If identifier
                if (childNode.token.tokenType === TokenType.IDENTIFIER) {
                    // Set property name
                    const propertyName = childNode.token.value.substring(1);

                    // If the property does not exist then return null
                    if (typeof this._values[propertyName] === 'undefined') return null;

                    // Get value
                    const value = this._values[propertyName];

                    // If null
                    if (value === null) return null;

                    // If Date class
                    if (value instanceof Date) return SqlConvert.dateToSql(value, this._sqlConfig);

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
}