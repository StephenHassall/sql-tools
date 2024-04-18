/**
 * Block
 * Used when processing the SQL templates.
 */
import { SqlTemplateCondition } from "./sql-template-condition.js";

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

    /**
     * Get the SQL template condition.
     * @return {SqlTemplateCondition} The SQL template condition for the #if or #elif parts.
     */
    get sqlTemplateCondition() {
        // Return the SQL template condition
        return this._sqlTemplateCondition;
    }

    /**
     * Sets the SQL template condition.
     * @param {SqlTemplateCondition} value The SQL template condition for the #if or #elif parts.
     */
    set sqlTemplateCondition(value) {
        // Set the SQL template condition
        this._sqlTemplateCondition = value;
    }
}
