/**
 * Node
 * 
 * Used for reading in and processing SQL template conditions.
 */

/**
 * Node types
 */
export class NodeType {
    // Node types
    static TOKEN = 1
    static BOOL_EXPRESSION = 2;
    static RELATION_EXPRESSION = 3;
    static EXPRESSION = 4;
    static COMPARE = 5;
    static TERM = 6;
    static FACTOR = 7;
    static VARIABLE = 8;
}

/**
 * Node
 * Used to contain node and token parts of the condition expression.
 */
export class Node {
    /**
     * Default node constructor.
     * @param {Number} nodeType The type of the node.
     * @param {Token} token The token that is part of the node (if used).
     */
    constructor(nodeType, token) {
        // Set defaults
        this._nodeType = nodeType;
        this._token = token;
        this._nodeList = [];
        this._state = 0;
    }

    /**
     * Get the node type.
     * @return {Number} The type of node is this. See NodeType.xxx for options.
     */
    get nodeType() {
        // Return the type of node
        return this._nodeType;
    }

    /**
     * Set the mode type this object is using.
     * @param {Number} value The node type value. See NodeType.xxx for options.
     */
    set nodeType(value) {
        // Set the node type value
        this._nodeType = value;
    }

    /**
     * Get the token.
     * @return {Token} The node's token if has one.
     */
    get token() {
        // Return the token
        return this._token;
    }

    /**
     * Sets the token.
     * @param {Token} value The node's token.
     */
    set token(value) {
        // Set token
        this._token = value;
    }

    /**
     * Get the node list.
     * @return {Node[]} The list of child nodes.
     */
    get nodeList() {
        // Return the node list
        return this._nodeList;
    }

    /**
     * Set the child node list.
     * @param {Number} value The list of child nodes.
     */
    set nodeList(value) {
        // Set the node list value
        this._nodeList = value;
    }

    /**
     * Get the state. This is used when reading in the nodes.
     * @return {Number} The node's state.
     */
    get state() {
        // Return the state
        return this._state;
    }

    /**
     * Sets the state. This is used when reading in the nodes.
     * @param {Number} value The node's state.
     */
    set state(value) {
        // Set state
        this._state = value;
    }
}
