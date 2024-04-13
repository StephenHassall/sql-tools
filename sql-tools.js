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
        token.type = type;

        // Add to list
        list.push(token);
    }

    static _conditionAddTokenWithValue(list, type, value) {
        // Create token
        const token = {};

        // Set type
        token.type = type;

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

/**
 * SQL Template
 * Used to load in and format SQL templates. These are SQL files that contain
 * preprocessor statements like
 * SELECT
 *   field1
 * #if $version>=1.2
 *   field2
 * #endif
 * WHERE
 *   field3=$searchByField3;
 * 
 * It also used to set values using the $objectProperty notation (instead of ? and $1, $2).
 */
export class SqlTemplate {
    // setup (template text)

    // format(values)

    /**
     * SQL template constructor.
     * @param {String} [template] The template to setup the SQL template with.
     */
    constructor(template) {
        // Set defaults
        this._blockTree = null;

        // If there is a template then call setup
        if (template) this.setup(template);
    }

    /**
     * Setup the SQL template object with the given formatted template string data.
     * @param {String} template The text data that contains the formatted text.
     */
    setup(template) {
        // If no template
        if (typeof template !== 'string') throw new Error('Invalid template');

        // Set template
        this._template = template;

        // Create block list
        const blockList = this._createBlockList();

        // Create block tree
        this._blockTree = this._createBlockTree(blockList);

        // Create block tree for errors
        this._checkBlockTreeErrors(this._blockTree);

        // Create SQL conditions


    }

    /**
     * Create a list of blocks from the template. This splites the template into preprocessor blocks.
     * @return {Block[]} List of blocks found in template.
     */
    _createBlockList() {
        // Reset block list
        const blockList = [];

        // Set text index
        let textIndex = 0;

        // Set block type
        let blockType = 0;

        // Loop until done
        while (true) {
            // Loop for next #if, #elif, #else and #end preprocessor command
            let ifIndex = this._template.indexOf('#if', textIndex);
            let elifIndex = this._template.indexOf('#elif', textIndex);
            let elseIndex = this._template.indexOf('#else', textIndex);
            let endIndex = this._template.indexOf('#endif', textIndex);

            // Set next index to any non-minus index
            let nextIndex = -1;
            if (ifIndex !== -1) nextIndex = ifIndex;
            if (elifIndex !== -1) nextIndex = elifIndex;
            if (elseIndex !== -1) nextIndex = elseIndex;
            if (endIndex !== -1) nextIndex = endIndex;

            // Set next index to the nearest away
            if (ifIndex !== -1 && ifIndex <= nextIndex) { nextIndex = ifIndex; blockType = BlockType.IF; }
            if (elifIndex !== -1 && elifIndex <= nextIndex) { nextIndex = elifIndex; blockType = BlockType.ELIF; }
            if (elseIndex !== -1 && elseIndex <= nextIndex) { nextIndex = elseIndex; blockType = BlockType.ELSE; }
            if (endIndex !== -1 && endIndex <= nextIndex) { nextIndex = endIndex; blockType = BlockType.ENDIF; }

            // If nothing found then stop
            if (nextIndex === -1) break;

            // If previous block exists
            if (nextIndex !== textIndex) {
                // Create previous block
                const block = new Block();
                block.blockType = BlockType.TEXT;
                block.text = this._template.substring(textIndex, nextIndex);
        
                // Add to block list
                blockList.push(block);
            }

            // Get end of line index
            const endOfLineIndex = this._getNextLineIndex(nextIndex);

            // If end of file
            if (endOfLineIndex === -1) {
                // Add preprocessor block
                const block = new Block();
                block.blockType = blockType;
                block.text = this._template.substring(nextIndex);
                block.textIndex = nextIndex;

                // Add to block list
                blockList.push(block);

                // Stop here and return the block list
                return blockList;
            }

            // Add preprocessor block
            const block = new Block();
            block.blockType = blockType;
            block.text = this._template.substring(nextIndex, endOfLineIndex);
            block.textIndex = nextIndex;

            // Add to block list
            blockList.push(block);

            // Set the text index for the next block
            textIndex = endOfLineIndex;
        }

        // Create ending block
        const block = new Block();
        block.blockType = BlockType.TEXT;
        block.text = this._template.substring(textIndex);

        // Add to block list
        blockList.push(block);

        // Return the block list
        return blockList;
    }

    /**
     * Get the index to the next line.
     * @param {Number} index The index to start looking from.
     * @return {Number} The index of the start of the next new line or -1 for end of text.
     */
    _getNextLineIndex(index) {
        // Loop until done
        while (true) {
            // If reached end of text
            if (index + 1 >= this._template.length) return -1;

            // Get character
            const character = this._template.charAt(index);

            // Get the next character
            const characterNext = this._template.charAt(index + 1);

            // If \r\n
            if (character === '\r' && characterNext === '\n') {
                // If there is not something after this
                if (index + 2 >= this._template.length) return -1;

                // Otherwise return the index to the next line
                return index + 2;
            }

            // If \n
            if (character === '\n') {
                // Return the index to the next line
                return index + 1;
            }

            // If \r
            if (character === '\r') {
                // Return the index to the next line
                return index + 1;
            }

            // Increase index for the next character
            index++;
        }
    }

    /**
     * Create block tree from the block list.
     * @param {Block[]} blockList The list of blocks created from the template.
     * @return {Block} The root parent block of the tree of blocks.
     */
    _createBlockTree(blockList) {
        // Create root block
        const rootBlock = new Block();
        rootBlock.blockType = BlockType.PARENT;

        // Set parent row list (max level is 5)
        const parentRowList = [rootBlock, null, null, null, null];

        // Set parent row index
        let parentRowIndex = 0;

        // For each block in list
        for (let index = 0; index < blockList.length; index++) {
            // Get block
            const block = blockList[index];

            // If #if block type
            if (block.blockType === BlockType.IF) {
                // Create parent block
                const parentBlock = new Block();
                parentBlock.blockType = BlockType.PARENT;
                parentBlock.blockList.push(block);

                // Add parent to current parent
                parentRowList[parentRowIndex].blockList.push(parentBlock)

                // Increase the parent row
                parentRowIndex++;

                // If over limit
                if (parentRowIndex >= 5) throw new Error('Too many nested #if...#endif blocks');

                // Set the parent row
                parentRowList[parentRowIndex] = parentBlock;

                // Move on to the next block
                continue;
            }

            // If #end block type
            if (block.blockType === BlockType.ENDIF) {
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

        // Return the root block
        return rootBlock;
    }

    /**
     * Check the block tree for errors.
     * @param {Block} parentBlock The parent block to check.
     */
    _checkBlockTreeErrors(blockParent) {
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
            if (block.blockType === BlockType.PARENT) {
                // Check this parent block
                this._checkBlockTreeErrors(block);

                // Move on to next block
                continue;
            }

            // If #if
            if (block.blockType === BlockType.IF) {
                // Set has if
                hasIf = true;

                // Set if block
                ifBlock = block;

                // Move on to next block
                continue;
            }

            // If #elif
            if (block.blockType === BlockType.ELIF) {
                // If we have not had an #if
                if (hasIf === false) throw new Error('Cannot have #elif without #if. Line ' + this._getLineNumber(block.textIndex));

                // If we have the #else
                if (hasElse === true) throw new Error('Cannot have #elif after #else. Line ' + this._getLineNumber(block.textIndex));

                // If we have the #endif
                if (hasEndIf === true) throw new Error('Cannot have #elif after #endif. Line ' + this._getLineNumber(block.textIndex));

                // Set has elif
                hasElif = true;

                // Move on to next block
                continue;
            }

            // If #else
            if (block.blockType === BlockType.ELSE) {
                // If we have not had an #if
                if (hasIf === false) throw new Error('Cannot have #else without #if. Line ' + this._getLineNumber(block.textIndex));

                // If we have the #else
                if (hasElse === true) throw new Error('Duplicate #else. Line ' + this._getLineNumber(block.textIndex));

                // Set has else
                hasElse = true;

                // Move on to next block
                continue;
            }

            // If #endif
            if (block.blockType === BlockType.ENDIF) {
                // If we have not had an #if
                if (hasIf === false) throw new Error('Cannot have #endif without #if. Line ' + this._getLineNumber(block.textIndex));

                // Set has endif
                hasEndIf = true;

                // Move on to next block
                continue;
            }
        }

        // If has #if but does not have #endif
        if (hasIf === true && hasEndIf === false) throw new Error('Has #if but missing #endif. Line ' + this._getLineNumber(ifBlock.textIndex));
    }

    /**
     * Get the line number at the given index.
     * @param {Number} index The index in the next where we want the line number for.
     * @return {Number} The line number that index points to.
     */
    _getLineNumber(index) {
        // Set line number
        let lineNumber = 1;

        // For each character in the length
        for (let characterIndex = 0; characterIndex < index; characterIndex++) {
            // Get character
            const character = this._template.charAt(characterIndex);

            // If new line character
            if (character === '\n') lineNumber++;
        }

        // Return the line number
        return lineNumber;
    }
}

/**
 * Block types
 */
export class BlockType {
    // Block types
    static TEXT = 1;
    static IF = 2;
    static ELIF = 3;
    static ELSE = 4;
    static ENDIF = 5;
    static PARENT = 6;
}

/**
 * Block
 * Used to contain the section of text that makes up the preprocessor parts of the SQL template.
 */
export class Block {
    /**
     * Default block constructor.
     */
    constructor() {
        // Set defaults
        this._blockType = 0;
        this._text = '';
        this._textIndex = -1;
        this._blockList = [];
        this._sqlTemplateCondition = null;
    }

    /**
     * Get the block type.
     * @return {Number} The type of block is this. See BlockType.xxx for options.
     */
    get blockType() {
        // Return the type of block
        return this._blockType;
    }

    /**
     * Set the block type this object is using.
     * @param {Number} value The block type value. See BlockType.xxx for options.
     */
    set blockType(value) {
        // Set the block type value
        this._blockType = value;
    }

    /**
     * Get the text.
     * @return {String} The block's text.
     */
    get text() {
        // Return the text
        return this._text;
    }

    /**
     * Sets the text.
     * @param {String} value The block's text.
     */
    set text(value) {
        // Set text
        this._text = value;
    }

    /**
     * Get the text index.
     * @return {Number} The text index where the block is located in the template text.
     */
    get textIndex() {
        // Return the text index
        return this._textIndex;
    }

    /**
     * Sets the text index.
     * @param {String} value The text index where the block is located.
     */
    set textIndex(value) {
        // Set text index
        this._textIndex = value;
    }

    /**
     * Get the block list.
     * @return {Block[]} The list of child blocks.
     */
    get blockList() {
        // Return the block list
        return this._blockList;
    }

    /**
     * Set the block list.
     * @param {Block[]} value The list of blocks.
     */
    set blockList(value) {
        // Set the block list value
        this._blockList = value;
    }
}

/**
 * Token types
 */
export class TokenType {
    // Token types
    static IDENTIFIER = 1;
    static NUMBER = 2;
    static TEXT = 3;
    static MULTIPLE = 4;
    static DIVIDE = 5;
    static ADD = 6;
    static SUBTRACT = 7;
    static OPEN_BRACKET = 8;
    static CLOSE_BRACKET = 9;
    static COMPARE_EQUAL = 10;
    static COMPARE_NOT_EQUAL = 11;
    static COMPARE_LESS = 12;
    static COMPARE_GREATER = 13;
    static COMPARE_LESS_EQUAL = 14;
    static COMPARE_GREATER_EQUAL = 15;
    static NOT = 16;
    static TRUE = 17;
    static FALSE = 18;
    static AND = 19;
    static OR = 20;
}

/**
 * Token
 * Used to contain the condition expression parts.
 */
export class Token {
    /**
     * Default token constructor.
     */
    constructor() {
        // Set defaults
        this._tokenType = 0;
        this._text = '';
        this._value = undefined;
    }

    /**
     * Get the token type.
     * @return {Number} The type of token is this. See TokenType.xxx for options.
     */
    get tokenType() {
        // Return the type of token
        return this._tokenType;
    }

    /**
     * Set the token type this object is using.
     * @param {Number} value The token type value. See TokenType.xxx for options.
     */
    set tokenType(value) {
        // Set the token type value
        this._tokenType = value;
    }

    /**
     * Get the text.
     * @return {String} The token's text.
     */
    get text() {
        // Return the text
        return this._text;
    }

    /**
     * Sets the text.
     * @param {String} value The token's text.
     */
    set text(value) {
        // Set text
        this._text = value;
    }

    /**
     * Get the value.
     * @return {String|Number|Boolean} The token's value.
     */
    get value() {
        // Return the value
        return this._value;
    }

    /**
     * Sets the value.
     * @param {String|Number|Boolean} value The token's value.
     */
    set value(value) {
        // Set value
        this._value = value;
    }
}

/**
 * SQL Template Condition
 * Used to process the #if <condition> parts of the SQL Template preprocessor.
 */
export class SqlTemplateCondition {
    /**
     * Default constructor.
     * @param {String} condition The condition text. 
     */
    constructor(condition) {
        // If no condition text
        if (!condition) throw new Error('Missing condition data');

        // Set condition
        this._condition = condition;

        // Build condition
    }

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
     * Build the condition. This takes the condition text, reads each token and makes the boolean expression tree.
     */
    _build() {
        // Set token index
        this._tokenIndex = 0;
        
    }

    /**
     * Create the condition token list. This is a quick method of getting the tokens. The tokens are as follows:
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
        token.type = type;

        // Add to list
        list.push(token);
    }

    static _conditionAddTokenWithValue(list, type, value) {
        // Create token
        const token = {};

        // Set type
        token.type = type;

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

                // If true
                if (character === 't' || character === 'T') {
                    if (character2 === 'r' || character2 === 'R') {
                        if (character3 === 'u' || character3 === 'U') {
                            if (this._tokenIndex + 3 < this._condition.length) {
                                const character4 = this._condition.charAt(this._tokenIndex + 3);
                                if (character4 === 'e' || character4 === 'E') { tokenType = TokenType.TOKEN_TRUE; this._tokenIndex += 3; break; }
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
                                    (character5 === 'e' || character5 === 'E')) { tokenType = TokenType.TOKEN_FALSE; this._tokenIndex += 4; break; }
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

                // This is the end of the hex number, so stop looking
                break;
            }



        }

        // If there is no token then return end of tokens
        if (tokenType === -1) return null;

        // Create token
        const token = new Token();
        token.tokenType = tokenType;

        // If token is true or false
        if (tokenType === TokenType.TRUE) token.value = true;
        if (tokenType === TokenType.FALSE) token.value = false;

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
    }

}