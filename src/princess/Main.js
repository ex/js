/* ========================================================================== */
/*   Main.js                                                                  */
/*   Converted from ActionScript 3 to ES6 JavaScript                          */
/* -------------------------------------------------------------------------- */

// Import external classes (Assuming Board is converted to a module)
// Since the source for Board wasn't provided, this is a placeholder import.
import Board from './Board.js';

export default class Main {

    /**
     * Constructor acts as the entry point.
     * Equivalent to: public function Main()
     *
     * @param {HTMLCanvasElement} canvas - The canvas element acts as the 'Stage'.
     */
    constructor(canvas) {
        if (!canvas) {
            throw new Error("Canvas element is required.");
        }

        this.canvas = canvas;
        /** @type {CanvasRenderingContext2D} */
        this.ctx = this.canvas.getContext('2d');

        this.mBoard = null;

        // JS Equivalent of checking (stage != null) or ADDED_TO_STAGE.
        // We assume if the class is instantiated, the canvas exists.
        this.init();
    }

    /**
     * Initialization logic.
     * Equivalent to: private function init(event:Event = null)
     */
    init() {
        // Create our game board.
        // Typed Arrays (Int32Array) could be used for performance, but standard arrays
        // match the flexibility of AS3 Arrays closest.
        const layout = [
            [2, 2, 2, 2, 1],
            [4, 4, 3, 1, 0],
            [4, 4, 3, 1, 0],
            [2, 2, 2, 2, 1]
        ];

        // Instantiate Board.
        // In AS3, passing 'this' passed the MovieClip/Sprite container.
        // Here, we pass the Main instance so Board can access this.ctx or this.canvas.
        this.mBoard = new Board(this, layout);

        // Requirement: Start the loop (Replacement for Event.ENTER_FRAME)
        this.startLoop();
    }

    /**
     * Sets up the requestAnimationFrame loop.
     * Replaces: addEventListener(Event.ENTER_FRAME, ...)
     */
    startLoop() {
        const loop = (timestamp) => {
            this.update();
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    /**
     * Handles Logic Updates
     */
    update() {
        // If Board has an update method, execute it
        if (this.mBoard && typeof this.mBoard.update === 'function') {
            this.mBoard.update();
        }
    }
}
