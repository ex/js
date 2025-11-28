/* ========================================================================== */
/*   Graphics.js                                                              */
/*   Modern ES6 Canvas implementation of Flash Graphics utilities.            */
/* -------------------------------------------------------------------------- */

/**
 * Helper to convert Flash uint colors (0xFFFFFF) to CSS RGBA strings.
 * @param {number} hex - The integer color code (e.g., 0xFF0000).
 * @param {number} alpha - The alpha transparency (0.0 to 1.0).
 * @returns {string} CSS color string.
 */
const toCSSColor = (hex, alpha = 1) => {
    const r = (hex >> 16) & 0xFF;
    const g = (hex >> 8) & 0xFF;
    const b = hex & 0xFF;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * Helper to create an offscreen canvas to act as a cached "Sprite".
 * This mimics the Flash Sprite behavior by creating a drawable bitmap source.
 * @param {number} width 
 * @param {number} height 
 * @returns {HTMLCanvasElement}
 */
const createOffscreenCanvas = (width, height) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
};

export default class Graphics {

    /**
     * Return a generic canvas element containing a drawn rectangle.
     * Mimics: public static function getRect(...)
     * 
     * @param {number} width 
     * @param {number} height 
     * @param {number} bodyColor - 0xRRGGBB format
     * @param {number} borderColor - 0xRRGGBB format
     * @param {number} borderSize 
     * @returns {HTMLCanvasElement} A canvas element acting as the Sprite.
     */
    static getRect(width, height, bodyColor = 0xFFFFFF, borderColor = 0x000000, borderSize = 0.5) {
        // Flash strokes are centered on the line. To avoid clipping, 
        // we increase canvas size by the border size.
        const canvas = createOffscreenCanvas(width + borderSize, height + borderSize);
        const ctx = canvas.getContext('2d');
        
        // Offset drawing by half border size to simulate center-stroke
        const offset = borderSize / 2;

        ctx.lineWidth = borderSize;
        ctx.strokeStyle = toCSSColor(borderColor);
        ctx.fillStyle = toCSSColor(bodyColor);

        ctx.beginPath();
        // Equivalent to graphics.drawRect
        ctx.rect(offset, offset, width, height);
        ctx.fill();
        
        if (borderSize > 0) {
            ctx.stroke();
        }

        return canvas;
    }

    /**
     * Return a canvas element containing a drawn rounded rectangle.
     * Mimics: public static function getRoundedRect(...)
     * 
     * @param {number} width 
     * @param {number} height 
     * @param {number} roundWidth - Corner radius
     * @param {number} roundHeight - Corner radius (Unified with width in standard Canvas)
     * @param {number} bodyColor 
     * @param {number} borderColor 
     * @param {number} borderSize 
     * @param {number} alpha 
     * @returns {HTMLCanvasElement}
     */
    static getRoundedRect(width, height, roundWidth, roundHeight, bodyColor = 0xFFFFFF, borderColor = 0x000000, borderSize = 0.5, alpha = 1) {
        // Handle canvas sizing to prevent clipping of borders
        const canvas = createOffscreenCanvas(width + borderSize, height + borderSize);
        const ctx = canvas.getContext('2d');
        
        const offset = borderSize / 2;
        const x = offset;
        const y = offset;
        const r = roundWidth; // Using roundWidth as primary radius

        ctx.lineWidth = borderSize;
        ctx.strokeStyle = toCSSColor(borderColor);
        ctx.fillStyle = toCSSColor(bodyColor, alpha);

        ctx.beginPath();
        
        // Modern browsers support ctx.roundRect, but implementing manually ensures
        // broader compatibility and mimics Flash behavior precisely.
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + width - r, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + r);
        ctx.lineTo(x + width, y + height - r);
        ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
        ctx.lineTo(x + r, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        
        ctx.closePath();
        ctx.fill();

        if (borderSize > 0) {
            ctx.stroke();
        }

        return canvas;
    }

    /**
     * Draw a circle directly onto a target Context (Canvas equivalent of drawing on a Sprite).
     * Mimics: public static function drawCircle(...)
     * 
     * Note: In AS3 this accepted a Sprite. In JS Canvas, we pass the RenderingContext
     * or the Canvas element itself.
     * 
     * @param {CanvasRenderingContext2D} ctx - The target context to draw on.
     * @param {number} x 
     * @param {number} y 
     * @param {number} radius 
     * @param {number} colorBody 
     * @param {number} colorBorder 
     * @param {number} alpha 
     * @param {number} borderSize 
     * @param {number} borderAlpha 
     */
    static drawCircle(ctx, x, y, radius, colorBody, colorBorder = 0x000000, alpha = 1, borderSize = 0.5, borderAlpha = 1) {
        ctx.save(); // Save state to prevent pollution of global context properties

        ctx.lineWidth = borderSize;
        ctx.strokeStyle = toCSSColor(colorBorder, borderAlpha);
        ctx.fillStyle = toCSSColor(colorBody, alpha);

        ctx.beginPath();
        // graphics.drawCircle(x, y, radius) -> ctx.arc(x, y, radius, 0, 2PI)
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        
        ctx.fill();
        
        if (borderSize > 0) {
            ctx.stroke();
        }

        ctx.restore(); // Restore previous context state
    }
}

