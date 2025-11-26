/**
 * Mandelbrot Set Visualizer
 * Ported from ActionScript 3 to ES6 JavaScript + HTML5 Canvas
 */

export class Mandelbrot {
    constructor(canvasElement) {
        // --- Configuration Constants ---
        this.INIT_STEPS = 256;
        this.INCREMENT_STEPS = 64;

        this.MINIMUM_COLOR_STEP = 5;
        this.COLOR_RANGE = 64;
        this.COLOR_STEP = 6;

        this.COLOR_BLUE = 1;
        this.COLOR_RED = 2;
        this.COLOR_GREEN = 3;
        this.COLOR_GRAY = 4;
        this.COLOR_RANDOM = 5;
        this.COLOR_PALETTE = 6;

        this.MINIMUM_CELL_SIZE = 9e-15;

        this.FRACTAL_GRID_CELLS = 8;
        this.ZOOM_GRID_CELLS = 4;

        // --- Setup Canvas ---
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext('2d', { alpha: false });

        this.m_width = this.canvas.width;
        this.m_height = this.canvas.height;

        // Create offscreen buffers to mimic AS3 BitmapLayers
        // Layer 1: The Fractal (Static background)
        this.fractalCanvas = document.createElement('canvas');
        this.fractalCanvas.width = this.m_width;
        this.fractalCanvas.height = this.m_height;
        this.fractalCtx = this.fractalCanvas.getContext('2d');

        // Layer 2: The UI/Zoom Box (Dynamic foreground)
        this.uiCanvas = document.createElement('canvas');
        this.uiCanvas.width = this.m_width;
        this.uiCanvas.height = this.m_height;
        this.uiCtx = this.uiCanvas.getContext('2d');

        // --- State Initialization ---
        this.m_steps = this.INIT_STEPS;
        this.m_zoomIsVisible = false;
        this.m_zones = [];

        // Zoom zone init position
        this.m_zoomGridX = (this.FRACTAL_GRID_CELLS - this.ZOOM_GRID_CELLS) / 2;
        this.m_zoomGridY = (this.FRACTAL_GRID_CELLS - this.ZOOM_GRID_CELLS) / 2;

        // Initialize color data
        this.initializeColorData();
        this.setColors(this.COLOR_PALETTE);

        // Bind Events
        window.addEventListener('keydown', this.onKeyDown.bind(this));

        // Initial Draw
        this.drawMandelbrot(true);

        // Start the composition loop
        this.renderLoop();
    }

    /**
     * Main rendering loop (replaces ENTER_FRAME for display updates)
     * Composes the background fractal and foreground UI.
     */
    renderLoop() {
        // Clear main screen
        this.ctx.clearRect(0, 0, this.m_width, this.m_height);

        // Draw Fractal Layer
        this.ctx.drawImage(this.fractalCanvas, 0, 0);

        // Draw UI Layer (Zoom Box)
        this.ctx.drawImage(this.uiCanvas, 0, 0);

        requestAnimationFrame(() => this.renderLoop());
    }

    onKeyDown(evt) {
        // Map JS Key codes to Logic
        switch(evt.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.moveZoomUp();
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.moveZoomDown();
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.moveZoomLeft();
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.moveZoomRight();
                break;
            case 'Space':
            case 'Enter':
                this.redraw();
                break;
            case 'F4':
                this.setColors(this.COLOR_PALETTE);
                this.drawMandelbrot();
                break;
            case 'F5':
                this.setColors(this.COLOR_RANDOM);
                this.drawMandelbrot();
                break;
            case 'F6':
                this.setColors(this.COLOR_RED);
                this.drawMandelbrot();
                break;
            case 'F7':
                this.setColors(this.COLOR_GREEN);
                this.drawMandelbrot();
                break;
            case 'F8':
                this.setColors(this.COLOR_BLUE);
                this.drawMandelbrot();
                break;
            case 'F9':
                this.setColors(this.COLOR_GRAY);
                this.drawMandelbrot();
                break;
            case 'Backspace':
                this.zoomOut();
                break;
            case 'Escape':
            case 'ControlLeft':
            case 'ControlRight':
                this.toggleZoomZone();
                break;
            case 'Home':
                this.drawMandelbrot(true);
                break;
            case 'PageUp':
                this.increaseSteps(this.INCREMENT_STEPS);
                break;
            case 'PageDown':
                this.increaseSteps(-this.INCREMENT_STEPS);
                break;
        }
    }

    redraw() {
        if (this.m_zoomIsVisible) {
            const dx = (this.m_fractalZoneX2 - this.m_fractalZoneX1) / this.FRACTAL_GRID_CELLS;
            const dy = (this.m_fractalZoneY2 - this.m_fractalZoneY1) / this.FRACTAL_GRID_CELLS;

            if ((dx >= this.MINIMUM_CELL_SIZE) && (dy >= this.MINIMUM_CELL_SIZE)) {
                // Save actual zone position
                this.m_zones.push([this.m_fractalZoneX1, this.m_fractalZoneY1, this.m_fractalZoneX2, this.m_fractalZoneY2]);

                // Set new drawing zone
                this.m_fractalZoneX1 += (this.m_zoomGridX * dx);
                this.m_fractalZoneY1 += (this.m_zoomGridY * dy);
                this.m_fractalZoneX2 = this.m_fractalZoneX1 + this.ZOOM_GRID_CELLS * dx;
                this.m_fractalZoneY2 = this.m_fractalZoneY1 + this.ZOOM_GRID_CELLS * dy;

                this.drawMandelbrot();
            }
        } else {
            this.toggleZoomZone();
        }
    }

    increaseSteps(increment) {
        if (this.m_steps + increment > 0) {
            this.m_steps += increment;
            console.log(`Iterations: ${this.m_steps}`);
            this.drawMandelbrot();
        }
    }

    zoomOut() {
        if (this.m_zoomIsVisible) {
            this.toggleZoomZone();
        }

        if (this.m_zones.length > 0) {
            const zone = this.m_zones.pop();
            this.m_fractalZoneX1 = zone[0];
            this.m_fractalZoneY1 = zone[1];
            this.m_fractalZoneX2 = zone[2];
            this.m_fractalZoneY2 = zone[3];
        } else {
            const dx = (this.m_fractalZoneX2 - this.m_fractalZoneX1) / 2;
            const dy = (this.m_fractalZoneY2 - this.m_fractalZoneY1) / 2;
            this.m_fractalZoneX1 -= dx;
            this.m_fractalZoneY1 -= dy;
            this.m_fractalZoneX2 += dx;
            this.m_fractalZoneY2 += dy;
        }
        this.drawMandelbrot();
    }

    drawMandelbrot(initializeZone = false) {
        if (this.m_zoomIsVisible) {
            this.toggleZoomZone();
        }

        if (initializeZone) {
            this.m_fractalZoneX1 = -2.5;
            this.m_fractalZoneY1 = -1.2;
            this.m_fractalZoneX2 = 0.7;
            this.m_fractalZoneY2 = 1.2;
            this.m_zones = []; // Clear history on reset
        }

        const width = this.m_width;
        const height = this.m_height;
        const dx = (this.m_fractalZoneX2 - this.m_fractalZoneX1) / (width - 1);
        const dy = (this.m_fractalZoneY2 - this.m_fractalZoneY1) / (height - 1);

        // Access raw pixel data
        const imageData = this.fractalCtx.createImageData(width, height);
        const data = imageData.data; // Uint8ClampedArray

        // Draw fractal zone
        // Note: JS numbers are always doubles, but we use |0 to hint integers for indices
        for (let x = 0; x < width; ++x) {
            for (let y = 0; y < height; ++y) {

                // Point in fractal zone
                const px = this.m_fractalZoneX1 + x * dx;
                const py = this.m_fractalZoneY2 - y * dy;

                let steps = 0;
                let fx = 0.0;
                let fy = 0.0;
                let temp = 0.0;

                while (true) {
                    temp = fx * fx - fy * fy + px;
                    fy = 2 * fx * fy + py;
                    fx = temp;
                    steps++;

                    if ((steps >= this.m_steps) || (fx * fx + fy * fy >= 4.0)) {
                        break;
                    }
                }

                const pixelIndex = (y * width + x) * 4;

                if (steps < this.m_steps) {
                    // |F(z)| >= 2, not in set
                    let indexColor = (steps - 1) % 28 + 1;
                    if (indexColor > 15) {
                        indexColor = 30 - indexColor;
                    }

                    // Get RGB components from our color table
                    const rgb = this.m_colors[indexColor]; // [r, g, b]

                    data[pixelIndex]     = rgb[0]; // Red
                    data[pixelIndex + 1] = rgb[1]; // Green
                    data[pixelIndex + 2] = rgb[2]; // Blue
                    data[pixelIndex + 3] = 255;    // Alpha
                } else {
                    // In set (Black)
                    data[pixelIndex]     = 0;
                    data[pixelIndex + 1] = 0;
                    data[pixelIndex + 2] = 0;
                    data[pixelIndex + 3] = 255;
                }
            }
        }

        // Put the data onto the offscreen fractal canvas
        this.fractalCtx.putImageData(imageData, 0, 0);
    }

    setColors(opc) {
        this.m_colors = [];
        let k = 0;

        switch (opc) {
            case this.COLOR_GRAY:
                for (k = 0; k < 16; k++) {
                    this.m_colors.push([4*this.m_colorSteps[k][1], 4*this.m_colorSteps[k][1], 4*this.m_colorSteps[k][1]]);
                }
                break;
            case this.COLOR_BLUE:
                for (k = 0; k < 16; k++) {
                    this.m_colors.push([4*this.m_colorSteps[k][0], 4*this.m_colorSteps[k][1], 4*this.m_colorSteps[k][2]]);
                }
                break;
            case this.COLOR_RED:
                for (k = 0; k < 16; k++) {
                    this.m_colors.push([4*this.m_colorSteps[k][2], 13 * k, 3*this.m_colorSteps[k][0]]);
                }
                break;
            case this.COLOR_GREEN:
                for (k = 0; k < 16; k++) {
                    this.m_colors.push([14 * k, 4*this.m_colorSteps[k][2], 4*this.m_colorSteps[k][0]]);
                }
                break;
            case this.COLOR_RANDOM:
                let c1, c2, c3;
                do {
                    c1 = this.COLOR_STEP * Math.random();
                    c2 = this.COLOR_STEP * Math.random();
                    c3 = this.COLOR_STEP * Math.random();
                } while ((c1 + c2 + c3) < this.MINIMUM_COLOR_STEP);

                this.m_colors.push([0, 0, 0]);

                const a1 = Math.floor(this.COLOR_RANGE * Math.random());
                const a2 = Math.floor(this.COLOR_RANGE * Math.random());
                const a3 = Math.floor(this.COLOR_RANGE * Math.random());

                for (k = 1; k < 16; ++k) {
                    let t1 = Math.floor((a1 + (k - 1) * c1) % (this.COLOR_RANGE * 2));
                    let t2 = Math.floor((a2 + (k - 1) * c2) % (this.COLOR_RANGE * 2));
                    let t3 = Math.floor((a3 + (k - 1) * c3) % (this.COLOR_RANGE * 2));

                    if (t1 >= this.COLOR_RANGE) t1 = (this.COLOR_RANGE * 2) - t1 - 1;
                    if (t2 >= this.COLOR_RANGE) t2 = (this.COLOR_RANGE * 2) - t2 - 1;
                    if (t3 >= this.COLOR_RANGE) t3 = (this.COLOR_RANGE * 2) - t3 - 1;

                    this.m_colors.push([4*t1, 4*t2, 4*t3]);
                }
                break;

            case this.COLOR_PALETTE:
                const paletteIdx = Math.floor(Math.random() * this.m_palette.length);
                this.m_colors.push([0, 0, 0]);

                for (k = 1; k < 16; ++k) {
                    let p1 = Math.floor((this.m_palette[paletteIdx][0] + (k - 1) * this.m_palette[paletteIdx][1]) % (this.COLOR_RANGE * 2));
                    let p2 = Math.floor((this.m_palette[paletteIdx][2] + (k - 1) * this.m_palette[paletteIdx][3]) % (this.COLOR_RANGE * 2));
                    let p3 = Math.floor((this.m_palette[paletteIdx][4] + (k - 1) * this.m_palette[paletteIdx][5]) % (this.COLOR_RANGE * 2));

                    if (p1 >= this.COLOR_RANGE) p1 = (this.COLOR_RANGE * 2) - p1 - 1;
                    if (p2 >= this.COLOR_RANGE) p2 = (this.COLOR_RANGE * 2) - p2 - 1;
                    if (p3 >= this.COLOR_RANGE) p3 = (this.COLOR_RANGE * 2) - p3 - 1;

                    this.m_colors.push([4*p1, 4*p2, 4*p3]);
                }
                break;
        }
    }

    drawZoomZone() {
        // Clear previous UI drawing
        this.uiCtx.clearRect(0, 0, this.m_width, this.m_height);

        if (!this.m_zoomIsVisible) return;

        const cellWidth = this.m_width / this.FRACTAL_GRID_CELLS;
        const cellHeight = this.m_height / this.FRACTAL_GRID_CELLS;

        const x1 = Math.floor(cellWidth * (this.m_zoomGridX));
        const y1 = Math.floor(cellHeight * (this.FRACTAL_GRID_CELLS - this.m_zoomGridY));

        // Note: AS3 coord logic for y was inverted or based on bottom-up logic in math,
        // but screen coords are top-down. Adjusted slightly to match visual expectation.
        // We calculate width/height based on grid cells.

        const w = Math.floor(cellWidth * this.ZOOM_GRID_CELLS);
        const h = Math.floor(cellHeight * this.ZOOM_GRID_CELLS);

        // In AS3 code: y1 was bottom, y2 was top (subtracted ZOOM_GRID_CELLS).
        // Let's replicate rect drawing.
        const drawX = x1;
        const drawY = y1 - h; // Move "up" (visually) because Y is inverted in math logic but standard in canvas

        this.uiCtx.strokeStyle = 'white';
        this.uiCtx.lineWidth = 1;
        this.uiCtx.strokeRect(drawX, drawY, w, h);
    }

    toggleZoomZone() {
        this.m_zoomIsVisible = !this.m_zoomIsVisible;
        this.drawZoomZone();
    }

    moveZoomLeft() {
        if (!this.m_zoomIsVisible) {
            this.toggleZoomZone();
        } else {
            if (this.m_zoomGridX > 0) {
                --this.m_zoomGridX;
                this.drawZoomZone();
            }
        }
    }

    moveZoomRight() {
        if (!this.m_zoomIsVisible) {
            this.toggleZoomZone();
        } else {
            if (this.m_zoomGridX < this.FRACTAL_GRID_CELLS - this.ZOOM_GRID_CELLS) {
                ++this.m_zoomGridX;
                this.drawZoomZone();
            }
        }
    }

    moveZoomUp() {
        if (!this.m_zoomIsVisible) {
            this.toggleZoomZone();
        } else {
            if (this.m_zoomGridY < this.FRACTAL_GRID_CELLS - this.ZOOM_GRID_CELLS) {
                ++this.m_zoomGridY;
                this.drawZoomZone();
            }
        }
    }

    moveZoomDown() {
        if (!this.m_zoomIsVisible) {
            this.toggleZoomZone();
        } else {
            if (this.m_zoomGridY > 0) {
                --this.m_zoomGridY;
                this.drawZoomZone();
            }
        }
    }

    initializeColorData() {
        this.m_palette = [
            [0, 4, 62, 5, 31, 3],  [7, 4, 4, 4, 42, 5],   [8, 0, 55, 4, 4, 4],   [8, 5, 8, 4, 8, 1],    [12, 4, 44, 2, 46, 3],
            [17, 4, 35, 5, 41, 4], [20, 5, 43, 4, 57, 3], [20, 5, 58, 5, 21, 2], [21, 2, 35, 4, 59, 0], [24, 4, 53, 2, 54, 3],
            [25, 2, 36, 2, 50, 2], [25, 5, 52, 5, 0, 5],  [27, 3, 19, 3, 31, 5], [27, 3, 35, 4, 39, 2], [29, 5, 63, 2, 34, 2],
            [32, 5, 58, 5, 33, 2], [33, 5, 61, 5, 34, 3], [35, 2, 16, 5, 22, 0], [35, 4, 2, 0, 10, 3],  [36, 4, 43, 4, 35, 2],
            [38, 4, 63, 3, 55, 5], [39, 5, 8, 2, 48, 2],  [39, 5, 59, 3, 7, 2],  [40, 3, 6, 0, 61, 5],  [40, 5, 58, 5, 25, 2],
            [41, 2, 49, 5, 52, 3], [41, 5, 59, 5, 0, 3],  [43, 5, 56, 3, 43, 4], [44, 2, 11, 3, 54, 4], [44, 4, 61, 4, 13, 2],
            [45, 3, 61, 3, 10, 1], [45, 4, 63, 5, 6, 3],  [45, 5, 46, 5, 11, 0], [46, 3, 5, 5, 17, 3],  [47, 1, 30, 4, 14, 0],
            [48, 5, 58, 5, 17, 2], [48, 5, 63, 4, 6, 4],  [48, 5, 63, 5, 6, 4],  [49, 3, 17, 4, 38, 2], [50, 2, 63, 5, 57, 3],
            [51, 5, 62, 3, 37, 0], [53, 1, 56, 5, 13, 1], [53, 3, 57, 2, 49, 1], [53, 3, 56, 5, 44, 2], [54, 4, 1, 0, 33, 3],
            [54, 5, 53, 4, 45, 2], [55, 4, 13, 0, 4, 4],  [55, 4, 40, 5, 34, 2], [55, 5, 57, 2, 56, 2], [57, 2, 14, 3, 20, 0],
            [58, 1, 15, 5, 9, 2],  [58, 3, 38, 4, 13, 4], [59, 0, 48, 5, 6, 2],  [59, 3, 3, 0, 6, 3],   [59, 5, 4, 4, 60, 0],
            [59, 5, 52, 3, 5, 0],  [60, 1, 51, 5, 0, 3],  [60, 5, 14, 2, 24, 3], [61, 5, 42, 5, 24, 3], [63, 4, 14, 3, 0, 5],
        ];

        this.m_colorSteps = [[ 0,  0,  0], [10,  8, 23], [13, 16, 36], [15, 18, 41],
                        [17, 21, 46], [18, 23, 49], [20, 26, 50], [22, 29, 52],
                        [24, 35, 55], [22, 40, 58], [20, 45, 60], [17, 46, 61],
                        [16, 47, 62], [25, 52, 62], [38, 58, 63], [63, 63, 63]];
    }
}
