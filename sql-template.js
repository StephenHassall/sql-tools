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
import { Block } from "./block.js";
import { BlockType } from "./block.js";
import { SqlConfig } from "./sql-config.js";
import { SqlConvert } from "./sql-convert.js";
import { SqlTemplateCondition } from "./sql-template-condition.js";

export class SqlTemplate {
    /**
     * Identifier regex. This is used to look for $value parts.
     */
    static _identifierRegex = RegExp(
        // Identifier group
        // \$ = starts with the "$" character
        // \w = must start with a character (including _)
        // [\w\d]+ = contain zero or more word or digit characters
        '(?<identifier>\\\$\\w[\\w\\d]*)',

        // Global
        'g');

    /**
     * Comments regex. This is used to look for comments in the SQL.
     */
    static _commentRegex = RegExp(
        // Comment block /*....*/
        // \/\* = starts with /*
        // ([\\s\\S](?!\\/\\*))* = any white space and non white space character, but no "/*"
        // *\*\/ = ends with */
        '(\\/\\*([\\s\\S](?!\\/\\*))*\\*\\/)|' +
        
        // Comment line
        // #, \\-\\- = starts with # or --
        // .* = any characters
        // \\r\\n, $, [\r|\n] = ends with either the "CRLF" characters together, or the end of the string, or CR or LF
        '(#.*\\r\\n)|' +
        '(#.*$)|' +
        '(#.*[\\r|\\n])|' +
        '(\\-\\-.*\\r\\n)|' +
        '(\\-\\-.*$)|' +
        '(\\-\\-.*[\\r|\\n])',

        // Global
        'g');

    /**
     * Single line regex. This is used to look for new lines in the SQL.
     */
    static _singleLineRegex = RegExp(
        // New line characters
        '(\\r\\n)|([\\r])|([\\n])',

        // Global
        'g');

    /**
     * SQL template constructor.
     * @param {String} template The template to setup the SQL template with.
     * @param {SqlConfig} [sqlConfig] The SQL config settings to use.
     */
    constructor(template, sqlConfig) {
        // If no template
        if (typeof template !== 'string') throw new Error('Invalid template');

        // Set defaults
        this._blockTree = null;

        // Set SQL config
        this._sqlConfig = sqlConfig;

        // If SQL config is not set then use the default one
        if (!this._sqlConfig) this._sqlConfig = SqlConfig.default;

        // Set template
        this._template = template;

        // Create block list
        const blockList = this._createBlockList();

        // Create the conditions (stop if something wrong)
        if (this._createConditions(blockList) === false) return;

        // Create block tree
        this._blockTree = this._createBlockTree(blockList);

        // Create block tree for errors
        this._checkBlockTreeErrors(this._blockTree);
    }

    /**
     * Format the template using the given values.
     * @param {Object} values An object that contains all the values that will be used within the template.
     * @param {SqlConfig} [sqlConfig] The SQL config settings to use.
     * @return {String} The formatted template. Use this final SQL command with the database.
     */
    format(values, sqlConfig) {
        // Set values
        this._values = values;

        // Process block tree
        let sql = this._processBlockTree(this._blockTree);

        // If no SQL config the set the one it was created with
        if (!sqlConfig) sqlConfig = this._sqlConfig;

        // If remove comments or single line
        if (this._sqlConfig.removeComments === true || this._sqlConfig._singleLine === true) {
            // Remove the comments
            sql = this._removeComments(sql);
        }

        // If single line
        if (this._sqlConfig._singleLine === true) {
            // Make single line
            sql = this._makeSingleLine(sql);
        }

        // Process values
        sql = this._processSqlValues(sql);

        // Return the final SQL
        return sql;
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
            // Loop for next #if, #elif, #else and #endif preprocessor command
            let ifIndex = this._template.indexOf('#if', textIndex);
            let elifIndex = this._template.indexOf('#elif', textIndex);
            let elseIndex = this._template.indexOf('#else', textIndex);
            let endIndex = this._template.indexOf('#endif', textIndex);

            // Look for --if, --elif, --else and --endif
            if (ifIndex === -1) ifIndex = this._template.indexOf('--if', textIndex);
            if (elifIndex === -1) elifIndex = this._template.indexOf('--elif', textIndex);
            if (elseIndex === -1) elseIndex = this._template.indexOf('--else', textIndex);
            if (endIndex === -1) endIndex = this._template.indexOf('--endif', textIndex);

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
                block.textIndex = textIndex;
        
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
     * Create the conditions for the #if and #elif blocks.
     * @param {Block[]} blockList The list of blocks created from the template.
     * @return {Boolean} False if there was an error, true if okay was okay.
     */
    _createConditions(blockList) {
        // For each block in list
        for (let index = 0; index < blockList.length; index++) {
            // Get block
            const block = blockList[index];

            // If not #if or #elif block type
            if (block.blockType === BlockType.TEXT) continue;
            if (block.blockType === BlockType.ELSE) continue;
            if (block.blockType === BlockType.ENDIF) continue;

            // Set condition index
            let conditionIndex = -1;
            if (block.text.startsWith('#if') === true) conditionIndex = 3;
            if (block.text.startsWith('#elif') === true) conditionIndex = 5;
            if (block.text.startsWith('--if') === true) conditionIndex = 4;
            if (block.text.startsWith('--elif') === true) conditionIndex = 6;

            // Set condition text
            const conditionText = block.text.substring(conditionIndex).trim();
            
            try {
                // Create and set SQL template condition
                block.sqlTemplateCondition = new SqlTemplateCondition(conditionText, this._sqlConfig);
            } catch (e) {
                // Throw the error with a line number
                throw new Error(e.message + ' Line ' + this._getLineNumber(block.textIndex));

                // Stop processing
                return false;
            }
        }

        // Return everything was processed okay
        return true;
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

    /**
     * Process the block tree
     * @param {Block} blockParent The parent block to process.
     * @return {String} The SQL from the give parent.
     */
    _processBlockTree(blockParent) {
        // Set SQL list
        const sqlList = [];

        // Set state
        // 0 = outside #if...#end
        // 1 = #if/#elif (true) read until #elif, #else, #endif
        // 2 = #if/#elif (false) read until #elif, #else, #endif
        // 3 = add nothing until #endif
        let state = 0;

        // For each block
        for (let index = 0; index < blockParent.blockList.length; index++) {
            // Get block
            const block = blockParent.blockList[index];

            // If outside #if...#endif
            if (state === 0) {
                // If text
                if (block.blockType === BlockType.TEXT) {
                    // Add this block of text to the SQL list
                    sqlList.push(block.text);

                    // Move on to next block
                    continue;
                }

                // If parent
                if (block.blockType === BlockType.PARENT) {
                    // Process this block
                    const sql = this._processBlockTree(block);

                    // Add parent block SQL to the list
                    sqlList.push(sql);

                    // Move on to next block
                    continue;
                }

                // If #if
                if (block.blockType === BlockType.IF) {
                    // Test the if condition
                    if (block.sqlTemplateCondition.getResult(this._values) === true) {
                        // Set state to read true section
                        state = 1;
                    } else {
                        // Set state to look for next #elif or #else
                        state = 2;
                    }

                    // Move on to next block
                    continue;
                }
            }

            // If inside condition true
            if (state === 1) {
                // If text
                if (block.blockType === BlockType.TEXT) {
                    // Add this block of text to the SQL list
                    sqlList.push(block.text);

                    // Move on to next block
                    continue;
                }

                // If parent
                if (block.blockType === BlockType.PARENT) {
                    // Process this block
                    const sql = this._processBlockTree(block);

                    // Add parent block SQL to the list
                    sqlList.push(sql);

                    // Move on to next block
                    continue;
                }

                // If #endif
                if (block.blockType === BlockType.ENDIF) {
                    // Set state to outside #if...#endif
                    state = 0;

                    // Move on to next block
                    continue;
                }

                // If #elif, #else
                if (block.blockType === BlockType.ELIF || block.blockType === BlockType.ELSE) {
                    // Set state to add nothing until after #endif
                    state = 3;

                    // Move on to next block
                    continue;
                }
            }

            // If inside condition false
            if (state === 2) {
                // If #elif
                if (block.blockType === BlockType.ELIF) {
                    // Test the elif condition
                    if (block.sqlTemplateCondition.getResult(this._values) === true) {
                        // Set state to use the elif section
                        state = 1;
                    }

                    // Move on to next block
                    continue;
                }

                // If #else
                if (block.blockType === BlockType.ELSE) {
                    // Set state to use the elif section
                    state = 1;

                    // Move on to next block
                    continue;
                }

                // If text or parent then do nothing
                if (block.blockType === BlockType.TEXT ||
                    block.blockType === BlockType.PARENT) {
                    // Move on to next block
                    continue;
                }

                // If #endif
                if (block.blockType === BlockType.ENDIF) {
                    // Set state to be outside #if...#endif
                    state = 0;

                    // Move on to next block
                    continue;
                }
            }

            // If inside but adding nothing more until #endif
            if (state === 3) {
                // If #endif
                if (block.blockType === BlockType.ENDIF) {
                    // Set state to be outside #if...#endif
                    state = 0;
                }

                // Move on to next block
                continue;
            }
        }

        // Join all the SQL text into one SQL command
        const sql = sqlList.join('');

        // Return the SQL text
        return sql;
    }

    /**
     * Process the SQL values. This converts the $property values into the final SQL command.
     * @param {String} sql The SQL template text that needs to be processed.
     * @return {String} The processed SQL command.
     */
    _processSqlValues(sql) {
        // Set converted values
        const convertedValues = {};

        // Replace the sql identifiers with their values
        const processedSql = sql.replace(
            SqlTemplate._identifierRegex,
            (fullMatch, identifier) => {
                // If not identifier then return full match
                if (!identifier) return fullMatch;

                // Create $identifier property name (remove the starting $ character)
                const identifierPropertyName = identifier.substring(1);

                // If we have used this identifier already then just return it
                if (identifierPropertyName in convertedValues) return convertedValues[identifierPropertyName];

                // If there is not value with the matching property name then does nothing with the identifier
                if (!(identifierPropertyName in this._values)) return identifier;

                // Get value
                const value = this._values[identifierPropertyName];

                // Convert value into SQL
                const sqlValue = SqlConvert.valueToSql(value, this._sqlConfig);

                // Save the converted value to be used again next time
                convertedValues[identifierPropertyName] = sqlValue;

                // Return the SQL value
                return sqlValue;
            }
        );

        // Return the processed SQL
        return processedSql;
    }

    /**
     * Remove any comments from the SQL
     * @param {String} sql The SQL that has been processed but may still contain comments.
     * @return {String} The SQL text without any comments.
     */
    _removeComments(sql) {
        // Remove the comments from the SQL
        const processedSql = sql.replace(SqlTemplate._commentRegex, () => { return ''; });

        // Return the processed SQL
        return processedSql;
    }

    /**
     * Make the SQL into a single line. Removes any new line characters and replaces them with spaces.
     * @param {String} sql The SQL that may contain multiple lines of text.
     * @return {String} The SQL text all on one line.
     */
    _makeSingleLine(sql) {
        // Replace any new line characters with spaces
        let processedSql = sql.replace(SqlTemplate._singleLineRegex, (t) => 
        { 
            return ' '; 
        });

        // Trim and starting or ending white space
        processedSql = processedSql.trim();

        // Return the processed SQL
        return processedSql;
    }
}
