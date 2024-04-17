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

export class SqlTemplate {
    /**
     * SQL template constructor.
     * @param {String} [template] The template to setup the SQL template with.
     * @param {Boolean} [utc=true] Will the dates use local date and time or UTC
     */
    constructor(template, utc) {
        // Set defaults
        this._blockTree = null;

        // Check and set default utc
        if (utc === undefined) utc = true;
        this._utc = utc;

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
