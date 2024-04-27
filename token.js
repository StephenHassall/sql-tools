/**
 * Token
 * 
 * Used when reading in and processing SQL template conditions.
 */

/**
 * Token types
 */
export class TokenType {
    // Token types
    static DATABASE_TYPE = 1;
    static IDENTIFIER = 2;
    static NUMBER = 3;
    static TEXT = 4;
    static MULTIPLE = 5;
    static DIVIDE = 6;
    static ADD = 7;
    static SUBTRACT = 8;
    static OPEN_BRACKET = 9;
    static CLOSE_BRACKET = 10;
    static COMPARE_EQUAL = 11;
    static COMPARE_NOT_EQUAL = 12;
    static COMPARE_LESS = 13;
    static COMPARE_GREATER = 14;
    static COMPARE_LESS_EQUAL = 15;
    static COMPARE_GREATER_EQUAL = 16;
    static NOT = 17;
    static TRUE = 18;
    static FALSE = 19;
    static NULL = 20;
    static AND = 21;
    static OR = 22;
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
