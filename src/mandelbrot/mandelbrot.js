/* ========================================================================== */
/*   Mandelbrot.js                                                            */
/* -------------------------------------------------------------------------- */
/*   Converted from AS3 to ES6 JavaScript by a senior developer.              */
/*   Original Copyright (c) 2012 Laurens Rodriguez Oscanoa.                   */
/*   This code is licensed under the MIT license:                             */
/*   http://www.opensource.org/licenses/mit-license.php                       */
/* -------------------------------------------------------------------------- */

// Constants
const INIT_STEPS = 256;
const INCREMENT_STEPS = 64;

const MINIMUM_COLOR_STEP = 5;
const COLOR_RANGE = 64;
const COLOR_STEP = 6;

const COLOR_BLUE = 1;
const COLOR_RED = 2;
const COLOR_GREEN = 3;
const COLOR_GRAY = 4;
const COLOR_RANDOM = 5;
const COLOR_PALETTE = 6;

const MINIMUM_CELL_SIZE = 9e-15;

// The fractal zone and the zoom zone are divided in cells.
const FRACTAL_GRID_CELLS = 8;
const ZOOM_GRID_CELLS = 4;


export default class Mandelbrot {

    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // Create an off-screen canvas for the fractal (equivalent to BitmapData)
        this.backBufferCanvas = document.createElement('canvas');
        this.backBufferCanvas.width = this.width;
        this.backBufferCanvas.height = this.height;
        this.backBufferCtx = this.backBufferCanvas.getContext('2d');
        this.imageData = this.backBufferCtx.createImageData(this.width, this.height);

        this.steps = INIT_STEPS;
        this.zoomIsVisible = false;
        this.zones = [];

        // Zoom zone init position
        this.zoomGridX = this.zoomGridY = (FRACTAL_GRID_CELLS - ZOOM_GRID_CELLS) / 2;

        this.initializeColorData();
        this.setColors(COLOR_PALETTE);

        this.drawMandelbrot(true);
        
        window.addEventListener('keydown', this.onKeyDown.bind(this));
    }

    onKeyDown(evt) {
        // Prevent browser default actions for keys like arrows, space, etc.
        evt.preventDefault();
        
        switch(evt.keyCode) {
            case 87: // W
            case 38: // UP
                this.moveZoomUp();
                break;
            case 83: // S
            case 40: // DOWN
                this.moveZoomDown();
                break;
            case 65: // A
            case 37: // LEFT
                this.moveZoomLeft();
                break;
            case 68: // D
            case 39: // RIGHT
                this.moveZoomRight();
                break;
            case 32: // SPACE
            case 13: // ENTER
                this.redraw();
                break;
            case 115: // F4
                this.setColors(COLOR_PALETTE);
                this.drawMandelbrot();
                break;
            case 116: // F5
                this.setColors(COLOR_RANDOM);
                this.drawMandelbrot();
                break;
            case 117: // F6
                this.setColors(COLOR_RED);
                this.drawMandelbrot();
                break;
            case 118: // F7
                this.setColors(COLOR_GREEN);
                this.drawMandelbrot();
                break;
            case 119: // F8
                this.setColors(COLOR_BLUE);
                this.drawMandelbrot();
                break;
            case 120: // F9
                this.setColors(COLOR_GRAY);
                this.drawMandelbrot();
                break;
            case 8: // BACKSPACE
                this.zoomOut();
                break;
            case 27: // ESCAPE
            case 17: // CONTROL
                this.toggleZoomZone();
                break;
            case 36: // HOME
                this.drawMandelbrot(true);
                break;
            case 33: // PAGE_UP
                this.increaseSteps(INCREMENT_STEPS);
                break;
            case 34: // PAGE_DOWN
                this.increaseSteps(-INCREMENT_STEPS);
                break;
        }
    }

    redraw() {
        if (this.zoomIsVisible) {
            // If the zoom grid is visible we want to redraw the zoom zone.
            const dx = (this.fractalZoneX2 - this.fractalZoneX1) / FRACTAL_GRID_CELLS;
            const dy = (this.fractalZoneY2 - this.fractalZoneY1) / FRACTAL_GRID_CELLS;

            if ((dx >= MINIMUM_CELL_SIZE) && (dy >= MINIMUM_CELL_SIZE)) {

                // Save actual zone position
                this.zones.push([this.fractalZoneX1, this.fractalZoneY1, this.fractalZoneX2, this.fractalZoneY2]);

                // Set new drawing zone. (x1,y1) bottom-left corner, (x2,y2) up-right corner
                this.fractalZoneX1 += (this.zoomGridX * dx);
                this.fractalZoneY1 += (this.zoomGridY * dy);
                this.fractalZoneX2 = this.fractalZoneX1 + ZOOM_GRID_CELLS * dx;
                this.fractalZoneY2 = this.fractalZoneY1 + ZOOM_GRID_CELLS * dy;

                this.drawMandelbrot();
            }
        } else {
            this.toggleZoomZone();
        }
    }

    increaseSteps(increment) {
        if (this.steps + increment > 0) {
            this.steps += increment;
            this.drawMandelbrot();
        }
    }

    zoomOut() {
        if (this.zoomIsVisible) {
            this.toggleZoomZone();
        }
        if (this.zones.length > 0) {
            const zone = this.zones.pop();
            this.fractalZoneX1 = zone[0];
            this.fractalZoneY1 = zone[1];
            this.fractalZoneX2 = zone[2];
            this.fractalZoneY2 = zone[3];
        } else {
            const dx = (this.fractalZoneX2 - this.fractalZoneX1) / 2;
            const dy = (this.fractalZoneY2 - this.fractalZoneY1) / 2;
            this.fractalZoneX1 -= dx;
            this.fractalZoneY1 -= dy;
            this.fractalZoneX2 += dx;
            this.fractalZoneY2 += dy;
        }
        this.drawMandelbrot();
    }

    drawMandelbrot(initializeZone = false) {

        if (this.zoomIsVisible) {
            this.toggleZoomZone();
        }
        if (initializeZone) {
            this.fractalZoneX1 = -2.5;
            this.fractalZoneY1 = -1.2;
            this.fractalZoneX2 = 0.7;
            this.fractalZoneY2 = 1.2;
        }

        const dx = (this.fractalZoneX2 - this.fractalZoneX1) / (this.width - 1);
        const dy = (this.fractalZoneY2 - this.fractalZoneY1) / (this.height - 1);

        const data = this.imageData.data;

        // Draw fractal zone
        for (let x = 0; x < this.width; ++x) {
            for (let y = 0; y < this.height; ++y) {
                // Point in fractal zone
                const px = this.fractalZoneX1 + x * dx;
                const py = this.fractalZoneY2 - y * dy;

                // Iterate fractal computation.
                let steps = 0;
                let fx = 0.0;
                let fy = 0.0;
                let temp;

                while (true) {
                    // Mandelbrot recurrence:
                    // ---------------------
                    // F(n+1) = F(n)*F(n) + (px + i*py)
                    temp = fx * fx - fy * fy + px;
                    fy = 2 * fx * fy + py;
                    fx = temp;

                    steps++;

                    // F(z) belongs to Mandelbrot set if |F(z)| < 2
                    // We give up if we passed the limit of number of iterations.
                    if ((steps >= this.steps) || (fx * fx + fy * fy >= 4.0)) {
                        break;
                    }
                }

                const pixelIndex = (y * this.width + x) * 4;
                if (steps < this.steps) {
                    // We found that: |F(z)| >= 2 (the point doesn't belong to the Mandelbrot set)
                    let indexColor = (steps - 1) % 28 + 1;
                    if (indexColor > 15) {
                        indexColor = 30 - indexColor;
                    }
                    const color = this.colors[indexColor];
                    data[pixelIndex] = color[0];     // R
                    data[pixelIndex + 1] = color[1]; // G
                    data[pixelIndex + 2] = color[2]; // B
                    data[pixelIndex + 3] = 255;      // A
                } else {
                    // We suspect this point belongs to the Mandelbrot set.
                    data[pixelIndex] = 0;
                    data[pixelIndex + 1] = 0;
                    data[pixelIndex + 2] = 0;
                    data[pixelIndex + 3] = 255;
                }
            }
        }
        
        // Put the generated image data onto the off-screen canvas
        this.backBufferCtx.putImageData(this.imageData, 0, 0);
        // Draw the off-screen canvas to the visible canvas
        this.ctx.drawImage(this.backBufferCanvas, 0, 0);
    }

    setColors(opc) {
        this.colors = [];

        switch (opc) {
            case COLOR_GRAY:
                for (let k = 0; k < 16; k++) {
                    this.colors.push([4 * this.colorSteps[k][1], 4 * this.colorSteps[k][1], 4 * this.colorSteps[k][1]]);
                }
                break;
            case COLOR_BLUE:
                for (let k = 0; k < 16; k++) {
                    this.colors.push([4 * this.colorSteps[k][0], 4 * this.colorSteps[k][1], 4 * this.colorSteps[k][2]]);
                }
                break;
            case COLOR_RED:
                for (let k = 0; k < 16; k++) {
                    this.colors.push([4 * this.colorSteps[k][2], 13 * k, 3 * this.colorSteps[k][0]]);
                }
                break;
            case COLOR_GREEN:
                for (let k = 0; k < 16; k++) {
                    this.colors.push([14 * k, 4 * this.colorSteps[k][2], 4 * this.colorSteps[k][0]]);
                }
                break;
            case COLOR_RANDOM:
                let c1, c2, c3;
                do {
                    c1 = COLOR_STEP * Math.random();
                    c2 = COLOR_STEP * Math.random();
                    c3 = COLOR_STEP * Math.random();
                } while ((c1 + c2 + c3) < MINIMUM_COLOR_STEP);

                this.colors.push([0, 0, 0]); // base color is black

                const a1 = COLOR_RANGE * Math.random();
                const a2 = COLOR_RANGE * Math.random();
                const a3 = COLOR_RANGE * Math.random();

                // Fill color table.
                for (let k = 1; k < 16; ++k) {
                    let t1 = (a1 + (k - 1) * c1) % (COLOR_RANGE * 2);
                    let t2 = (a2 + (k - 1) * c2) % (COLOR_RANGE * 2);
                    let t3 = (a3 + (k - 1) * c3) % (COLOR_RANGE * 2);

                    if (t1 >= COLOR_RANGE) t1 = (COLOR_RANGE * 2) - t1 - 1;
                    if (t2 >= COLOR_RANGE) t2 = (COLOR_RANGE * 2) - t2 - 1;
                    if (t3 >= COLOR_RANGE) t3 = (COLOR_RANGE * 2) - t3 - 1;
                    
                    this.colors.push([4 * t1, 4 * t2, 4 * t3]);
                }
                break;
            case COLOR_PALETTE:
                const paletteIndex = Math.floor(Math.random() * this.palette.length);
                this.colors.push([0, 0, 0]); // base color is black

                // Fill color table.
                for (let k = 1; k < 16; ++k) {
                    let p1 = (this.palette[paletteIndex][0] + (k - 1) * this.palette[paletteIndex][1]) % (COLOR_RANGE * 2);
                    let p2 = (this.palette[paletteIndex][2] + (k - 1) * this.palette[paletteIndex][3]) % (COLOR_RANGE * 2);
                    let p3 = (this.palette[paletteIndex][4] + (k - 1) * this.palette[paletteIndex][5]) % (COLOR_RANGE * 2);

                    if (p1 >= COLOR_RANGE) p1 = (COLOR_RANGE * 2) - p1 - 1;
                    if (p2 >= COLOR_RANGE) p2 = (COLOR_RANGE * 2) - p2 - 1;
                    if (p3 >= COLOR_RANGE) p3 = (COLOR_RANGE * 2) - p3 - 1;

                    this.colors.push([4 * p1, 4 * p2, 4 * p3]);
                }
                break;
        }
    }

    drawRectangle(x1, y1, x2, y2, color) {
        this.ctx.strokeStyle = color;
        const rectX = Math.min(x1, x2);
        const rectY = Math.min(y1, y2);
        const rectW = Math.abs(x2 - x1);
        const rectH = Math.abs(y2 - y1);
        this.ctx.strokeRect(rectX, rectY, rectW, rectH);
    }
    
    drawZoomZone() {
        // First, clear any existing zoom rectangle by redrawing the fractal from the back buffer
        this.ctx.drawImage(this.backBufferCanvas, 0, 0);

        const cellWidth = this.width / FRACTAL_GRID_CELLS;
        const cellHeight = this.height / FRACTAL_GRID_CELLS;
        
        const x1 = Math.round(cellWidth * (this.zoomGridX));
        const x2 = Math.round(cellWidth * (this.zoomGridX + ZOOM_GRID_CELLS));
        
        // Canvas y-coordinates start from the top, same as Flash
        const y1 = Math.round(cellHeight * (this.zoomGridY));
        const y2 = Math.round(cellHeight * (this.zoomGridY + ZOOM_GRID_CELLS));
        
        this.drawRectangle(x1, y1, x2, y2, 'white');
        
        this.zoomX1 = x1;
        this.zoomY1 = y1;
        this.zoomX2 = x2;
        this.zoomY2 = y2;
    }
    
    toggleZoomZone() {
        this.zoomIsVisible = !this.zoomIsVisible;
        if (this.zoomIsVisible) {
            this.drawZoomZone();
        } else {
            // Erase the zoom rectangle by redrawing the fractal from the back buffer
            this.ctx.drawImage(this.backBufferCanvas, 0, 0);
        }
    }

    moveZoomLeft() {
        if (!this.zoomIsVisible) {
            this.toggleZoomZone();
        } else {
            if (this.zoomGridX > 0) {
                --this.zoomGridX;
                this.drawZoomZone();
            }
        }
    }

    moveZoomRight() {
        if (!this.zoomIsVisible) {
            this.toggleZoomZone();
        } else {
            if (this.zoomGridX < FRACTAL_GRID_CELLS - ZOOM_GRID_CELLS) {
                ++this.zoomGridX;
                this.drawZoomZone();
            }
        }
    }

    moveZoomUp() {
        if (!this.zoomIsVisible) {
            this.toggleZoomZone();
        } else {
            if (this.zoomGridY > 0) {
                --this.zoomGridY;
                this.drawZoomZone();
            }
        }
    }

    moveZoomDown() {
        if (!this.zoomIsVisible) {
            this.toggleZoomZone();
        } else {
            if (this.zoomGridY < FRACTAL_GRID_CELLS - ZOOM_GRID_CELLS) {
                ++this.zoomGridY;
                this.drawZoomZone();
            }
        }
    }

    initializeColorData() {
        this.palette = [
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

        this.colorSteps = [[ 0,  0,  0], [10,  8, 23], [13, 16, 36], [15, 18, 41],
                           [17, 21, 46], [18, 23, 49], [20, 26, 50], [22, 29, 52],
                           [24, 35, 55], [22, 40, 58], [20, 45, 60], [17, 46, 61],
                           [16, 47, 62], [25, 52, 62], [38, 58, 63], [63, 63, 63]];
    }
}
