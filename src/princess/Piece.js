/* ========================================================================== */
/*   Piece.js                                                                 */
/*   Based on original AS3 code by ex.                                        */
/* ========================================================================== */

// Helper class to handle specific Canvas drawing operations
// mimicking the original AS3 Graphics helper.
class GraphicsHelper {
    /**
     * Draws a rounded rectangle path to the context.
     */
    static drawRoundedRect(ctx, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(radius, 0);
        ctx.lineTo(width - radius, 0);
        ctx.quadraticCurveTo(width, 0, width, radius);
        ctx.lineTo(width, height - radius);
        ctx.quadraticCurveTo(width, height, width - radius, height);
        ctx.lineTo(radius, height);
        ctx.quadraticCurveTo(0, height, 0, height - radius);
        ctx.lineTo(0, radius);
        ctx.quadraticCurveTo(0, 0, radius, 0);
        ctx.closePath();
    }

    /**
     * Draws a circle.
     */
    static drawCircle(ctx, x, y, radius, colorHex, strokeColorHex, strokeWidth, alpha = 1) {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);

        if (colorHex !== null) {
            ctx.fillStyle = colorHex;
            ctx.fill();
        }

        if (strokeWidth > 0 && strokeColorHex !== null) {
            ctx.lineWidth = strokeWidth;
            ctx.strokeStyle = strokeColorHex;
            ctx.stroke();
        }
        ctx.restore();
    }

    // Utility to convert AS3 hex int (0xRRGGBB) to CSS string ("#RRGGBB")
    static intToHex(intColor) {
        return '#' + intColor.toString(16).padStart(6, '0').toUpperCase();
    }
}

export default class Piece {
    // Constants
    static get SIZE() { return 70; }

    // Piece IDs
    static get ID_EMPTY() { return 0; }
    static get ID_TARGET() { return 4; }
    static get ID_STATIC() { return 5; }
    static get ID_EXIT() { return 9; }

    // Colors
    static get COLOR_1() { return 0xEE2111; }
    static get COLOR_2() { return 0x3344EE; }
    static get COLOR_3() { return 0xDDDD11; }
    static get COLOR_TARGET() { return 0x22EE22; }
    static get COLOR_STATIC() { return 0xCACAB0; }

    static get COLORS() {
        return [
            Piece.COLOR_1,
            Piece.COLOR_2,
            Piece.COLOR_3,
            Piece.COLOR_TARGET,
            Piece.COLOR_STATIC
        ];
    }

    static get BORDER_COLOR() { return 0x2A2A2A; }
    static get CORNER_SIZE() { return 18; }
    static get BORDER_SIZE() { return 3; }

    constructor(id, initColumn, initRow) {
        this.mId = id;
        this.column = initColumn;
        this.row = initRow;

        // Position variables (Pixel coordinates)
        this.x = 0;
        this.y = 0;
        this.alpha = 1;
        this.visible = true;

        // Dimensions
        this.mWidth = 0;
        this.mHeight = 0;

        // Initialize dimensions based on ID
        switch (this.mId) {
            case 1:
            case Piece.ID_STATIC:
                this.mHeight = 1;
                this.mWidth = 1;
                break;
            case 2:
                this.mWidth = 2;
                this.mHeight = 1;
                break;
            case 3:
                this.mWidth = 1;
                this.mHeight = 2;
                break;
            case Piece.ID_TARGET:
                this.mHeight = 2;
                this.mWidth = 2;
                break;
            case Piece.ID_EXIT:
                // This piece doesn't have a visible image.
                this.visible = false;
                return;
            default:
                throw new Error(`[Piece]: Invalid id: ${this.mId}`);
        }
    }

    // Getters
    get id() { return this.mId; }
    get width() { return this.mWidth; }
    get height() { return this.mHeight; }

    /**
     * Sets the X pixel position.
     * @param {number} val
     */
    setX(val) {
        if (this.mId !== Piece.ID_EXIT) {
            this.x = val;
        }
    }

    /**
     * Sets the Y pixel position.
     * @param {number} val
     */
    setY(val) {
        if (this.mId !== Piece.ID_EXIT) {
            this.y = val;
        }
    }

    /**
     * Simulates the selection alpha effect.
     * @param {boolean} val
     */
    select(val) {
        if (this.mId !== Piece.ID_STATIC && this.mId !== Piece.ID_EXIT) {
            this.alpha = val ? 0.75 : 1;
        }
    }

    /**
     * Cleanup method.
     * In JS garbage collection handles memory, but this sets flags for the renderer to ignore.
     */
    free() {
        this.visible = false;
        this.alpha = 0;
    }

    /**
     * Renders the shadow of the piece.
     * In Canvas, it is common to separate shadow and body rendering
     * if you want all shadows to be below all pieces.
     * @param {CanvasRenderingContext2D} ctx
     */
    drawShadow(ctx) {
        if (!this.visible) return;

        const pWidth = this.mWidth * Piece.SIZE;
        const pHeight = this.mHeight * Piece.SIZE;

        ctx.save();
        ctx.translate(this.x, this.y);

        // Apply DropShadowFilter equivalent
        ctx.shadowColor = "rgba(0, 0, 0, 1)";
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 4; // Approximating 45deg distance
        ctx.shadowOffsetY = 4;

        // Draw the white base of the shadow/border container
        GraphicsHelper.drawRoundedRect(ctx, pWidth, pHeight, Piece.CORNER_SIZE);
        ctx.fillStyle = "#FFFFFF";
        ctx.fill();

        // Draw Border
        ctx.lineWidth = Piece.BORDER_SIZE;
        ctx.strokeStyle = GraphicsHelper.intToHex(Piece.BORDER_COLOR);
        ctx.stroke();

        ctx.restore();
    }

    /**
     * Renders the main body of the piece.
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
        if (!this.visible) return;

        const pWidth = this.mWidth * Piece.SIZE;
        const pHeight = this.mHeight * Piece.SIZE;
        const colorHex = GraphicsHelper.intToHex(Piece.COLORS[this.mId - 1]);

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.globalAlpha = this.alpha;

        // 1. Draw Body Background
        // Note: Canvas shadows are expensive. Since we drew a dedicated shadow
        // in drawShadow(), we disable context shadows here.
        ctx.shadowBlur = 0;

        GraphicsHelper.drawRoundedRect(ctx, pWidth, pHeight, Piece.CORNER_SIZE);
        ctx.fillStyle = colorHex;
        ctx.fill();

        // Border
        ctx.lineWidth = Piece.BORDER_SIZE;
        ctx.strokeStyle = GraphicsHelper.intToHex(Piece.BORDER_COLOR);
        ctx.stroke();

        // 2. Draw Target details (The circles)
        if (this.mId === Piece.ID_TARGET) {
            // center coordinates relative to the piece
            const cx = Piece.SIZE;
            const cy = Piece.SIZE;
            const yellow = "#FFFF00";

            // Outer Circle
            GraphicsHelper.drawCircle(ctx, cx, cy, 0.5 * Piece.SIZE, null, yellow, 3, 0.5);
            // Middle Circle
            GraphicsHelper.drawCircle(ctx, cx, cy, 0.3 * Piece.SIZE, null, yellow, 3, 0.5);
            // Inner Circle
            GraphicsHelper.drawCircle(ctx, cx, cy, 0.1 * Piece.SIZE, null, yellow, 3, 0.5);
        }

        ctx.restore();
    }
}
