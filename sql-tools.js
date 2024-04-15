/**
 * SQL Tools.
 */
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import Path from 'node:path';

export default class SqlTools {
    /**
     * Template map. The cache of templates
     */
    static _templateCache = new Map();

    // let sqlTemplate = SqlTools.getTemplate('./sql/test.sql', import.meta.url);
    // sql = SqlTools.format(sqlTemplate, values);
    

    // getSql - 
    // whole file with formatting
    // subSQL within file

    // format date, date > text, dateTime > text, text > date, text > dateTime (local/UTC?)
    // 

    // get(file, importMetaUrl)
    // get(fillFilePath)

    // format (sql, values)
    // format (file, importMetaUrl, values)
    // format (fullFilePath, values)

    static format(template, values) {
        // Create the list of blocks
        const blockList = SqlTools._createBlockList(template);

        // Create the tree of blocks
        const blockTree = SqlTools._createBlockTree(blockList);

        // Check for errors
        SqlTools._checkBlockTreeErrors(template, blockTree);

        // Perform preprocessor operations
        // SqlTools._performPreprocessorOperations(template, blockTree, values)

        console.log(blockList);

    }

    /**
     * Get a template that is stored within a SQL file that has the given name. There need to be a "#template [name]...#endtemplate" in the file.
     * @param {String} name The name of the template. This is used to search for the template within the file.
     * @param {String} file Either the full path to the file or (if importMetaUrl is used) the relative path to the file.
     * @param {String} importMetaUrl The location of the module that is calling the function. This is used when working with relative paths.
     * @param {Boolean} [cache=true] Is the template cached so that it does not need to be read from the file next time.
     * @return {Promise} A promise that resolves the SQL template.
     */
    static async getTemplateByName(name, file, importMetaUrl, cache) {
        // Check cache default value
        if (cache === undefined) cache = true;

        // Set full path
        let fullPath = file;

        // If using relative path
        if (importMetaUrl) {
            // Get calling file path
            const callingFile = fileURLToPath(importMetaUrl);

            // Get calling folder location
            const callingFolder = Path.dirname(callingFile);

            // Set the relative full path
            fullPath = Path.join(callingFolder, file);
        }

        // Set cache key
        let cacheKey;

        // If cache being used
        if (cache === true) {
            // Set cache key
            cacheKey = importMetaUrl + '-' + file + '-' + name;

            // If the template in the cache
            if (SqlTools._templateCache.has(cacheKey) === true) {
                // Get the cached template
                const template = Sql._templateCache.get(cacheKey);

                // Return a promise that resolves the template
                return Promise.resolve(template);
            }
        }

        // Get file data
        const fileData = await readFile(fullPath, { encoding: 'utf8' });

        // Set the text to search for
        const searchTemplate = '#template ' + name;

        // Look for text
        let startIndex = fileData.indexOf(searchTemplate);

        // If not found
        if (startIndex === -1) {
            // Return a rejected promise
            return Promise.reject('Template not found');
        }

        // Look for end of template
        let endIndex = fileData.indexOf('#endtemplate', startIndex);

        // If not found
        if (endIndex === -1) {
            // Return a rejected promise
            return Promise.reject('Missing endtemplate');
        }

        // Adjust start of index
        startIndex += searchTemplate.length;

        // Check LF CR characters at the start
        if (fileData.charAt(startIndex) === '\n' || fileData.charAt(startIndex) === '\r') startIndex++;
        if (fileData.charAt(startIndex) === '\n' || fileData.charAt(startIndex) === '\r') startIndex++;

        // Check LF CR characters at the end
        if (fileData.charAt(endIndex - 1) === '\n' || fileData.charAt(endIndex - 1) === '\r') endIndex--;
        if (fileData.charAt(endIndex - 1) === '\n' || fileData.charAt(endIndex - 1) === '\r') endIndex--;

        // Get the template
        const template = fileData.substring(startIndex, endIndex);

        // If cache being used
        if (cache === true) {
            // Add the template to the cache
            SqlTools._templateCache.set(cacheKey, template);
        }

        // Return a promise with the resolved template
        return Promise.resolve(template);
    }

    /**
     * Get a SQL template from a file (or cache).
     * @param {String} file Either the full path to the file or (if importMetaUrl is used) the relative path to the file.
     * @param {String} importMetaUrl The location of the module that is calling the function. This is used when working with relative paths.
     * @param {Boolean} [cache=true] Is the SQL template cached so that it does not need to be read from the file next time.
     * @return {Promise} A promise that resolves the SQL template.
     */
    static async getTemplate(file, importMetaUrl, cache) {
        // Check cache default value
        if (cache === undefined) cache = true;

        // Set full path
        let fullPath = file;

        // If using relative path
        if (importMetaUrl) {
            // Get calling file path
            const callingFile = fileURLToPath(importMetaUrl);

            // Get calling folder location
            const callingFolder = Path.dirname(callingFile);

            // Set the relative full path
            fullPath = Path.join(callingFolder, file);
        }

        // If cache being used
        if (cache === true) {
            // If the template is in the cache
            if (SqlTools._templateCache.has(fullPath) === true) {
                // Get the cached template
                const template = SqlTools._templateCache.get(fullPath);

                // Return a promise that resolves the template
                return Promise.resolve(template);
            }
        }

        // Get template file data
        const template = await readFile(fullPath, { encoding: 'utf8' });

        // If cache being used
        if (cache === true) {
            // Add the template to the cache
            SqlTools._templateCache.set(fullPath, template);
        }

        // Return a promise with the resolved template
        return Promise.resolve(template);
    }

    /**
     * Create a list of blocks from the template. This splites the template into preprocessor sections.
     * @param {String} text The template text to process.
     * @return {Object[]} List of block objects.
     */
    static _createBlockList(text) {
        // Set block list
        const blockList = [];

        // Set text index
        let textIndex = 0;

        // Loop until done
        while (true) {
            // Loop for next #if, #elif, #else and #end preprocessor command
            let ifIndex = text.indexOf('#if', textIndex);
            let elifIndex = text.indexOf('#elif', textIndex);
            let elseIndex = text.indexOf('#else', textIndex);
            let endIndex = text.indexOf('#end', textIndex);

            // Set next index to any non-minus index
            let nextIndex = -1;
            if (ifIndex !== -1) nextIndex = ifIndex;
            if (elifIndex !== -1) nextIndex = elifIndex;
            if (elseIndex !== -1) nextIndex = elseIndex;
            if (endIndex !== -1) nextIndex = endIndex;

            // Set next index to the nearest away
            if (ifIndex !== -1 && ifIndex < nextIndex) nextIndex = ifIndex;
            if (elifIndex !== -1 && elifIndex < nextIndex) nextIndex = elifIndex;
            if (elseIndex !== -1 && elseIndex < nextIndex) nextIndex = elseIndex;
            if (endIndex !== -1 && endIndex < nextIndex) nextIndex = endIndex;

            // If nothing found then stop
            if (nextIndex === -1) break;

            // If previous block exists
            if (nextIndex !== textIndex) {
                // Create previous block
                const block = {};
                block.preprocessor = false;
                block.text = text.substring(textIndex, nextIndex);
        
                // Add to block list
                blockList.push(block);
            }

            // Get end of line index
            const endOfLineIndex = SqlTools._getNextLineIndex(text, nextIndex);

            // If end of file
            if (endOfLineIndex === -1) {
                // Add preprocessor block
                const block = {};
                block.preprocessor = true;
                block.text = text.substring(nextIndex);
                block.textIndex = nextIndex;

                // Add to block list
                blockList.push(block);

                // Stop here and return the block list
                return blockList;
            }

            // Add preprocessor block
            const block = {};
            block.preprocessor = true;
            block.text = text.substring(nextIndex, endOfLineIndex);
            block.textIndex = nextIndex;

            // Add to block list
            blockList.push(block);

            // Set the text index for the next block
            textIndex = endOfLineIndex;
        }

        // Create ending block
        const block = {};
        block.preprocessor = false;
        block.text = text.substring(textIndex);

        // Add to block list
        blockList.push(block);

        // Return the block list
        return blockList;
    }

    /**
     * Create block tree from the block list.
     * @param {Object[]} blockList The list of blocks created from the template.
     * @return {Object} The root parent block of the tree of blocks.
     */
    static _createBlockTree(blockList) {
        // Create root parent
        const rootParent = {};
        rootParent.isParent = true;
        rootParent.blockList = [];

        // Set parent row list (max level is 5)
        const parentRowList = [rootParent, null, null, null, null];

        // Set parent row index
        let parentRowIndex = 0;

        // For each block in list
        for (let index = 0; index < blockList.length; index++) {
            // Get block
            const block = blockList[index];

            // Set not parent
            block.isParent = false;

            // If #if block
            if (block.text.startsWith('#if') === true) {

                // Create parent
                const parent = {};
                parent.isParent = true;
                parent.blockList = [];
                parent.blockList.push(block);

                // Add parent to current parent
                parentRowList[parentRowIndex].blockList.push(parent)

                // Increase the parent row
                parentRowIndex++;

                // If over limit
                if (parentRowIndex >= 5) throw new Error('Too many nested #if...#endif blocks.');

                // Set the parent row
                parentRowList[parentRowIndex] = parent;

                // Move on to the next block
                continue;
            }

            // If #end block
            if (block.text.startsWith('#endif') === true) {
                // Add this block to the current parent
                parentRowList[parentRowIndex].blockList.push(block);

                // If not on root index already then move back to the previous parent
                if (parentRowIndex !== 0) parentRowIndex--;

                // Move on to the next block
                continue;
            }

            // Add this block to the current parent
            parentRowList[parentRowIndex].blockList.push(block);
        }

        // Return the root parent
        return rootParent;
    }

    /**
     * Check the block tree for errors.
     * @param {String} text The template text.
     * @param {Object} blockParent The parent block to check.
     */
    static _checkBlockTreeErrors(text, blockParent) {
        // Set has parts
        let hasIf = false;
        let hasElif = false;
        let hasElse = false;
        let hasEndIf = false;

        // Set #if block
        let ifBlock = null;

        // For each block
        for (let index = 0; index < blockParent.blockList.length; index++) {
            // Get block
            const block = blockParent.blockList[index];

            // If parent
            if (block.isParent === true) {
                // Check this parent block
                SqlTools._checkBlockTreeErrors(text, block);

                // Move on to next block
                continue;
            }

            // If #if
            if (block.text.startsWith('#if') === true) {
                // Set has if
                hasIf = true;

                // Set if block
                ifBlock = block;

                // Move on to next block
                continue;
            }

            // If #elif
            if (block.text.startsWith('#elif') === true) {
                // If we have not had an #if
                if (hasIf === false) throw new Error('Cannot have #elif without #if. Line ' + SqlTools._getLineNumber(text, block.textIndex));

                // If we have the #else
                if (hasElse === true) throw new Error('Cannot have #elif after #else. Line ' + SqlTools._getLineNumber(text, block.textIndex));

                // If we have the #endif
                if (hasEndIf === true) throw new Error('Cannot have #elif after #endif. Line ' + SqlTools._getLineNumber(text, block.textIndex));

                // Set has elif
                hasElif = true;

                // Move on to next block
                continue;
            }

            // If #else
            if (block.text.startsWith('#else') === true) {
                // If we have not had an #if
                if (hasIf === false) throw new Error('Cannot have #else without #if. Line ' + SqlTools._getLineNumber(text, block.textIndex));

                // If we have the #else
                if (hasElse === true) throw new Error('Duplicate #else. Line ' + SqlTools._getLineNumber(text, block.textIndex));

                // Set has else
                hasElse = true;

                // Move on to next block
                continue;
            }

            // If #endif
            if (block.text.startsWith('#endif') === true) {
                // If we have not had an #if
                if (hasIf === false) throw new Error('Cannot have #endif without #if. Line ' + SqlTools._getLineNumber(text, block.textIndex));

                // Set has endif
                hasEndIf = true;

                // Move on to next block
                continue;
            }
        }

        // If has #if but does not have #endif
        if (hasIf === true && hasEndIf === false) throw new Error('Has #if but missing #endif. Line ' + SqlTools._getLineNumber(text, ifBlock.textIndex));
    }

    /**
     * Get the line number at the given index.
     * @param {String} text The text the index exists in.
     * @param {Number} index The index in the next where we want the line number for.
     * @return {Number} The line number that index points to.
     */
    static _getLineNumber(text, index) {
        // Set line number
        let lineNumber = 1;

        // For each character in the length
        for (let characterIndex = 0; characterIndex < index; characterIndex++) {
            // Get character
            const character = text.charAt(characterIndex);

            // If new line character
            if (character === '\n') lineNumber++;
        }

        // Return the line number
        return lineNumber;
    }








    /**
     * Condition token processing.
     */

    /**
     * Token constants
     */
    static TOKEN_IDENTIFIER = 1;
    static TOKEN_NUMBER = 2;
    static TOKEN_TEXT = 3;
    static TOKEN_MULTIPLE = 4;
    static TOKEN_DIVIDE = 5;
    static TOKEN_ADD = 6;
    static TOKEN_SUBTRACT = 7;
    static TOKEN_OPEN_BRACKET = 8;
    static TOKEN_CLOSE_BRACKET = 9;
    static TOKEN_COMPARE_EQUAL = 10;
    static TOKEN_COMPARE_NOT_EQUAL = 11;
    static TOKEN_COMPARE_LESS = 12;
    static TOKEN_COMPARE_GREATER = 13;
    static TOKEN_COMPARE_LESS_EQUAL = 14;
    static TOKEN_COMPARE_GREATER_EQUAL = 15;
    static TOKEN_NOT = 16;
    static TOKEN_TRUE = 17;
    static TOKEN_FALSE = 18;
    static TOKEN_AND = 19;
    static TOKEN_OR = 20;

    /**
     * Process the conditions for the #if and #elif preprocessor commands.
     * @param {String} text The text being processed.
     * @param {Object} values The values passed to the format function.
     */
    static _processCondition(text, values) {
        // Create condition token list
        const conditionTokenList = SqlTools._createConditionTokenList(text);

        // Create condition tree
        const conditionTokenTree = SqlTools._createConditionTokenTree(conditionTokenList);

        // Check condition tree errors


    }

    /**
     * Create the condition token list. The tokens are as follows:
     * white space,(,),$value,=,==,===,>=,<=,>,<,!=,!==,!,+,-,*,/,"string",'string',number,&&,||,true,false
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
     * Create condition token tree from the condition token list.
     * @param {Object[]} conditionTokenList The list of condition tokens created from the condition text.
     * @return {Object} The root parent condition of the tree of condition tokens.
     */
    static _createConditionTokenTree(conditionTokenList) {
        // Create root parent
        const rootParent = {};
        rootParent.isParent = true;
        rootParent.conditionList = [];

        // Set parent row list (max level is 5)
        const parentRowList = [rootParent, null, null, null, null];

        // Set parent row index
        let parentRowIndex = 0;

        // For each condition token in list
        for (let index = 0; index < conditionTokenList.length; index++) {
            // Get condition token
            const conditionToken = conditionTokenList[index];

            // If (
            if (conditionToken === '(') {

                // Create parent
                const parent = {};
                parent.isParent = true;
                parent.conditionList = [];

                // Add parent to current parent
                parentRowList[parentRowIndex].conditionList.push(parent)

                // Increase the parent row
                parentRowIndex++;

                // If over limit
                if (parentRowIndex >= 5) throw new Error('Too many nested (...) conditions.');

                // Set the parent row
                parentRowList[parentRowIndex] = parent;

                // Move on to the next block
                continue;
            }

            // If )
            if (conditionToken === ')') {
                // If not on root index already then move back to the previous parent
                if (parentRowIndex !== 0) parentRowIndex--;

                // Move on to the next block
                continue;
            }

            // Add this condition token to the current parent
            parentRowList[parentRowIndex].conditionList.push(conditionToken);
        }

        // Return the root parent
        return rootParent;
    }

    /**
     * Check the condition token list for errors.
     * @param {Object} conditionTokenList The condition token list to check.
     */
    static _checkConditionTokenListErrors(conditionTokenList) {
        // Set ( and ) counts
        let startParenthesesCount = 0;
        let endParenthesesCount = 0;

        // For each condition token in list
        for (let index = 0; index < conditionTokenList.length; index++) {
            // Get condition token
            const conditionToken = conditionTokenList[index];

            // If ( token then increase start parentheses count 
            if (conditionToken === '(') startParenthesesCount++;

            // If ) token then increase end parentheses count 
            if (conditionToken === ')') endParenthesesCount++;
        }

        // If parentheses counts do not match
        if (startParenthesesCount !== endParenthesesCount) throw new Error('Parentheses error');
    }

    static _performBoolExpression(conditionTokenList) {
        // For each condition
    }

    static _performRelationExpression(conditionTokenList, index) {

    }

    static _conditionIdentifier(data) {
        //data.

    }
}

