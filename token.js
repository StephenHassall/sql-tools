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
    static NULL = 19;
    static AND = 20;
    static OR = 21;
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
