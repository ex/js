import Piece from './Piece.js'; // Assuming Piece is converted to an ES6 module

export default class Board {
    // Static Constants
    static get BORDER_SIZE() { return 4; }
    static get CORNER_SIZE() { return 12; }
    static get BACK_COLOR() { return 0xF0F0C0; }
    static get BACK_BORDER_COLOR() { return 0xCACAB0; }

    /**
     * @param {HTMLCanvasElement} canvasElement - The HTML canvas element
     * @param {Array<Array<number>>} initialBoardLayout - 2D array representing the board
     */
    constructor(owner, initialBoardLayout) {
        this.canvas = owner.canvas;
        this.ctx = this.canvas.getContext('2d');
        this.initialLayout = initialBoardLayout;

        // Set board size in cells
        this.mHeight = this.initialLayout.length;
        this.mWidth = this.initialLayout[0].length;

        // Calculate visual dimensions
        // Assuming Piece.SIZE is a static constant in the Piece class
        const pieceSize = Piece.SIZE || 100;

        this.boardWidth = pieceSize * this.mWidth + 2 * Board.BORDER_SIZE;
        this.boardHeight = pieceSize * this.mHeight + 2 * Board.BORDER_SIZE;

        // Center on Canvas
        this.offsetX = (this.canvas.width - this.boardWidth) / 2;
        this.offsetY = (this.canvas.height - this.boardHeight) / 2;

        // Container offsets (simulating mCanvas and mShadowCanvas positions)
        this.innerOffsetX = this.offsetX + Board.BORDER_SIZE;
        this.innerOffsetY = this.offsetY + Board.BORDER_SIZE;

        // State initialization
        this.mTiles = new Array(this.mWidth * this.mHeight).fill(null);
        this.mSelectedPiece = null;
        this.mIsDragging = false;

        // Mouse tracking
        this.mOldMouseX = 0;
        this.mOldMouseY = 0;
        this.currentMouseX = 0;
        this.currentMouseY = 0;

        // Logic init
        this.createPieces(this.initialLayout);

        // Bind events
        this.handleMouseDown = this.onMouseDown.bind(this);
        this.handleMouseUp = this.onMouseUp.bind(this);
        this.handleMouseMove = this.onMouseMove.bind(this); // Added for mouse tracking
        this.handleKeyDown = this.onKeyDown.bind(this);
        this.loop = this.loop.bind(this);

        this.addEventListeners();

        // Timer
        this.mTimer = performance.now();
        this.isRunning = true;

        // Start Loop
        requestAnimationFrame(this.loop);
    }

    addEventListeners() {
        // We attach mouse events to the canvas, keyboard to window
        this.canvas.addEventListener('mousedown', this.handleMouseDown);
        window.addEventListener('mouseup', this.handleMouseUp); // Window ensures drag releases outside canvas
        window.addEventListener('mousemove', this.handleMouseMove);
        window.addEventListener('keydown', this.handleKeyDown);
    }

    createPieces(board) {
        // Piece.ID_EMPTY should be defined in Piece class, defaulting to 0 here if missing
        const EMPTY_ID = Piece.ID_EMPTY !== undefined ? Piece.ID_EMPTY : 0;

        for (let y = 0; y < this.mHeight; ++y) {
            for (let x = 0; x < this.mWidth; ++x) {
                const index = x + y * this.mWidth;
                if (this.mTiles[index] === null && board[y][x] !== EMPTY_ID) {
                    // In JS version, we pass the logical coordinates.
                    // The Piece class is responsible for drawing itself on the context provided.
                    const piece = new Piece(board[y][x], x, y);
                    this.addPieceToBoard(piece);
                }
            }
        }
    }

    removePieceFromBoard(piece) {
        for (let x = 0; x < piece.width; ++x) {
            for (let y = 0; y < piece.height; ++y) {
                this.mTiles[piece.column + x + (piece.row + y) * this.mWidth] = null;
            }
        }
    }

    addPieceToBoard(piece) {
        const pieceSize = Piece.SIZE || 100;
        for (let x = 0; x < piece.width; ++x) {
            for (let y = 0; y < piece.height; ++y) {
                this.mTiles[piece.column + x + (piece.row + y) * this.mWidth] = piece;
            }
        }
        // Sync visual position
        piece.x = piece.column * pieceSize;
        piece.y = piece.row * pieceSize;
    }

    getCellUnderMouse(mouseX, mouseY) {
        const pieceSize = Piece.SIZE || 100;

        // Adjust mouse coordinates relative to the "Inner Canvas" (where pieces live)
        const relX = mouseX - this.innerOffsetX;
        const relY = mouseY - this.innerOffsetY;

        if (relX > 0 && relY > 0) {
            const x = Math.floor(relX / pieceSize);
            const y = Math.floor(relY / pieceSize);

            if (x >= 0 && x < this.mWidth && y >= 0 && y < this.mHeight) {
                return { x, y };
            }
        }
        return null;
    }

    // Logic Checks
    canPieceGoUp(piece) {
        if (piece.row > 0) {
            for (let k = 0; k < piece.width; ++k) {
                if (this.mTiles[piece.column + k + (piece.row - 1) * this.mWidth] !== null) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }

    canPieceGoDown(piece) {
        if (piece.row + piece.height < this.mHeight) {
            for (let k = 0; k < piece.width; ++k) {
                if (this.mTiles[piece.column + k + (piece.row + piece.height) * this.mWidth] !== null) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }

    canPieceGoLeft(piece) {
        if (piece.column > 0) {
            for (let k = 0; k < piece.height; ++k) {
                if (this.mTiles[piece.column - 1 + (piece.row + k) * this.mWidth] !== null) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }

    canPieceGoRight(piece) {
        if (piece.column + piece.width < this.mWidth) {
            for (let k = 0; k < piece.height; ++k) {
                if (this.mTiles[piece.column + piece.width + (piece.row + k) * this.mWidth] !== null) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }

    // Input Handlers
    onMouseMove(event) {
        // Track mouse position for update loop (emulating stage.mouseX)
        const rect = this.canvas.getBoundingClientRect();
        this.currentMouseX = event.clientX - rect.left;
        this.currentMouseY = event.clientY - rect.top;
    }

    onMouseDown(event) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        const point = this.getCellUnderMouse(mouseX, mouseY);

        if (point) {
            if (this.mSelectedPiece) {
                // Assuming Piece has a select method
                if (typeof this.mSelectedPiece.select === 'function') this.mSelectedPiece.select(false);
            }

            this.mSelectedPiece = this.mTiles[point.x + this.mWidth * point.y];

            if (this.mSelectedPiece) {
                if (typeof this.mSelectedPiece.select === 'function') this.mSelectedPiece.select(true);
                this.mOldMouseX = mouseX;
                this.mOldMouseY = mouseY;
                this.mIsDragging = true;
            }
        }
    }

    onMouseUp(event) {
        this.mIsDragging = false;
    }

    // Movement Logic
    moveSelectedPieceLeft() {
        if (this.canPieceGoLeft(this.mSelectedPiece)) {
            this.removePieceFromBoard(this.mSelectedPiece);
            --this.mSelectedPiece.column;
            this.addPieceToBoard(this.mSelectedPiece);
        }
    }

    moveSelectedPieceRight() {
        if (this.canPieceGoRight(this.mSelectedPiece)) {
            this.removePieceFromBoard(this.mSelectedPiece);
            ++this.mSelectedPiece.column;
            this.addPieceToBoard(this.mSelectedPiece);
        }
    }

    moveSelectedPieceDown() {
        if (this.canPieceGoDown(this.mSelectedPiece)) {
            this.removePieceFromBoard(this.mSelectedPiece);
            ++this.mSelectedPiece.row;
            this.addPieceToBoard(this.mSelectedPiece);
        }
    }

    moveSelectedPieceUp() {
        if (this.canPieceGoUp(this.mSelectedPiece)) {
            this.removePieceFromBoard(this.mSelectedPiece);
            --this.mSelectedPiece.row;
            this.addPieceToBoard(this.mSelectedPiece);
        }
    }

    onKeyDown(event) {
        if (this.mSelectedPiece) {
            // We switch on .code instead of .key
            switch (event.code) {
                case "ArrowDown":
                case "KeyS":
                    this.moveSelectedPieceDown();
                    break;

                case "ArrowUp":
                case "KeyW":
                    this.moveSelectedPieceUp();
                    break;

                case "ArrowLeft":
                case "KeyA":
                    this.moveSelectedPieceLeft();
                    break;

                case "ArrowRight":
                case "KeyD":
                    this.moveSelectedPieceRight();
                    break;
            }
        }
    }

    update(dt) {
        const pieceSize = Piece.SIZE || 100;

        if (this.mIsDragging && this.mSelectedPiece) {
            const dx = this.currentMouseX - this.mOldMouseX;
            const dy = this.currentMouseY - this.mOldMouseY;
            const adx = Math.abs(dx);
            const ady = Math.abs(dy);

            // Select the direction to move.
            if (adx > ady) {
                if (adx > pieceSize / 2) {
                    if (dx > 0) this.moveSelectedPieceRight();
                    else this.moveSelectedPieceLeft();

                    this.mOldMouseX = this.currentMouseX;
                    this.mOldMouseY = this.currentMouseY;
                }
            } else {
                if (ady > pieceSize / 2) {
                    if (dy > 0) this.moveSelectedPieceDown();
                    else this.moveSelectedPieceUp();

                    this.mOldMouseX = this.currentMouseX;
                    this.mOldMouseY = this.currentMouseY;
                }
            }
        }
    }

    // Main Loop
    loop() {
        if (!this.isRunning) return;

        const now = performance.now();
        const dt = now - this.mTimer;

        this.update(dt);
        this.render(); // Draw everything

        this.mTimer = now;
        requestAnimationFrame(this.loop);
    }

    // Canvas Drawing
    render() {
        const ctx = this.ctx;

        // Clear screen
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 1. Draw Background
        ctx.save();
        ctx.translate(this.offsetX, this.offsetY);

        // Emulate DropShadowFilter
        ctx.shadowColor = "rgba(0, 0, 0, 1)";
        ctx.shadowBlur = 14;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        this.drawRoundedRect(
            ctx,
            0, 0,
            this.boardWidth, this.boardHeight,
            Board.CORNER_SIZE,
            Board.BACK_COLOR,
            Board.BACK_BORDER_COLOR,
            Board.BORDER_SIZE
        );
        ctx.restore();

        // 2. Draw Pieces and Shadows
        // We translate context to the "inner" area where pieces sit
        ctx.save();
        ctx.translate(this.innerOffsetX, this.innerOffsetY);

        // Get unique pieces to draw (mTiles has duplicates for multi-cell pieces)
        const uniquePieces = new Set(this.mTiles.filter(p => p !== null));

        // Draw Shadows first (if Piece supports it)
        uniquePieces.forEach(piece => {
             if (piece.drawShadow) piece.drawShadow(ctx);
        });

        // Draw Pieces
        uniquePieces.forEach(piece => {
            // Assumes Piece has a draw method: draw(ctx)
            // The piece should draw itself at its local this.x/this.y
            if (piece.draw) piece.draw(ctx);
        });

        ctx.restore();

        // 3. Draw Border (Overlays everything)
        // Note: In AS3 code, mBorder was added last, so it sits on top.
        ctx.save();
        ctx.translate(this.offsetX, this.offsetY);
        // Reset shadow for border
        ctx.shadowColor = "transparent";
        this.drawRoundedRect(
            ctx,
            0, 0,
            this.boardWidth, this.boardHeight,
            Board.CORNER_SIZE,
            null, // No fill (transparent)
            Board.BACK_BORDER_COLOR,
            Board.BORDER_SIZE
        );
        ctx.restore();
    }

    /**
     * Helper to replicate Graphics.getRoundedRect
     */
    drawRoundedRect(ctx, x, y, width, height, radius, fillColor, borderColor, borderSize) {
        ctx.beginPath();
        if ("roundRect" in ctx) {
            ctx.roundRect(x, y, width, height, radius);
        } else {
            // Fallback for older browsers
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + width - radius, y);
            ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
            ctx.lineTo(x + width, y + height - radius);
            ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            ctx.lineTo(x + radius, y + height);
            ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
        }
        ctx.closePath();

        if (fillColor !== null) {
            // Convert int color to hex string if needed, assumes hex integer input
            ctx.fillStyle = `#${fillColor.toString(16).padStart(6, '0')}`;
            ctx.fill();
        }

        if (borderColor !== null && borderSize > 0) {
            ctx.lineWidth = borderSize;
            ctx.strokeStyle = `#${borderColor.toString(16).padStart(6, '0')}`;
            ctx.stroke();
        }
    }

    free() {
        this.isRunning = false;
        this.canvas.removeEventListener('mousedown', this.handleMouseDown);
        window.removeEventListener('mouseup', this.handleMouseUp);
        window.removeEventListener('mousemove', this.handleMouseMove);
        window.removeEventListener('keydown', this.handleKeyDown);

        this.mSelectedPiece = null;
        this.mTiles = [];
    }
}
