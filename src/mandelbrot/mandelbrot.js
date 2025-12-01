/* ========================================================================== */
/*   Mandelbrot.js                                                            */
/* -------------------------------------------------------------------------- */
/*   Ported from AS3 to ES6 JavaScript                                        */
/* ========================================================================== */

const COLOR_BLUE = 1;
const COLOR_RED = 2;
const COLOR_GREEN = 3;
const COLOR_GRAY = 4;
const COLOR_RANDOM = 5;
const COLOR_PALETTE = 6;

const INIT_STEPS = 256;
const INCREMENT_STEPS = 64;
const MINIMUM_COLOR_STEP = 5;
const COLOR_RANGE = 64;
const COLOR_STEP = 6;
const MINIMUM_CELL_SIZE = 9e-15;

const FRACTAL_GRID_CELLS = 8;
const ZOOM_GRID_CELLS = 4;

export class Mandelbrot {
    constructor(containerElement) {
        // Setup DOM
        this.container = containerElement;
        this.width = containerElement.clientWidth || 800;
        this.height = containerElement.clientHeight || 600;

        // Create Layers (Back for Fractal, Front for UI)
        this.canvasBack = this.createCanvas(0);
        this.ctxBack = this.canvasBack.getContext('2d', { alpha: false });

        this.canvasFront = this.createCanvas(1);
        this.ctxFront = this.canvasFront.getContext('2d');

        // State initialization
        this.steps = INIT_STEPS;
        this.zoomIsVisible = false;
        this.zones = []; // History stack
        this.colors = [];
        this.palette = [];
        this.colorSteps = [];

        // Zoom zone init position (integer math simulated with floor)
        this.zoomGridX = Math.floor((FRACTAL_GRID_CELLS - ZOOM_GRID_CELLS) / 2);
        this.zoomGridY = Math.floor((FRACTAL_GRID_CELLS - ZOOM_GRID_CELLS) / 2);

        // Zoom render coordinates
        this.zoomX1 = 0;
        this.zoomY1 = 0;
        this.zoomX2 = 0;
        this.zoomY2 = 0;

        // Fractal Coordinates
        this.fractalZoneX1 = -2.5;
        this.fractalZoneY1 = -1.2;
        this.fractalZoneX2 = 0.7;
        this.fractalZoneY2 = 1.2;

        // Initialize Data
        this.initializeColorData();
        this.setColors(COLOR_PALETTE);

        // Events
        window.addEventListener('keydown', (e) => this.onKeyDown(e));

        // --- MOUSE SUPPORT ADDED HERE ---
        this.canvasFront.addEventListener('mousedown', (e) => this.onMouseDown(e));

        // Initial Draw
        this.drawMandelbrot(true);
    }

    createCanvas(zIndex) {
        const canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.zIndex = zIndex;
        this.container.appendChild(canvas);
        return canvas;
    }

    // --- NEW METHOD FOR MOUSE HANDLING ---
    onMouseDown(evt) {
        // Get mouse position relative to the canvas element
        const rect = this.canvasFront.getBoundingClientRect();

        // Calculate scaling factors in case canvas is resized via CSS
        const scaleX = this.canvasFront.width / rect.width;
        const scaleY = this.canvasFront.height / rect.height;

        const mouseX = (evt.clientX - rect.left) * scaleX;
        const mouseY = (evt.clientY - rect.top) * scaleY;

        // Check if we are clicking inside the currently visible zoom zone
        if (this.zoomIsVisible) {
            const cellWidth = this.width / FRACTAL_GRID_CELLS;
            const cellHeight = this.height / FRACTAL_GRID_CELLS;

            // Calculate current visual bounds of the yellow box
            const zRectLeft = cellWidth * this.zoomGridX;
            const zRectRight = cellWidth * (this.zoomGridX + ZOOM_GRID_CELLS);

            // Note: In this class logic, zoomGridY increases upwards (bottom-up),
            // but canvas draws top-down. We must reconstruct the visual Y coordinates.
            const zRectTop = cellHeight * (FRACTAL_GRID_CELLS - this.zoomGridY - ZOOM_GRID_CELLS);
            const zRectBottom = cellHeight * (FRACTAL_GRID_CELLS - this.zoomGridY);

            // Hit test
            if (mouseX >= zRectLeft && mouseX <= zRectRight &&
                mouseY >= zRectTop && mouseY <= zRectBottom) {
                // Clicked inside selection -> ZOOM IN
                this.redraw();
                return;
            }
        }

        // If we didn't click inside an existing zone (or zone wasn't visible), move the zone
        this.moveZoomToMouse(mouseX, mouseY);
    }

    // --- NEW METHOD TO CALCULATE GRID POSITION FROM MOUSE ---
    moveZoomToMouse(mx, my) {
        const cellWidth = this.width / FRACTAL_GRID_CELLS;
        const cellHeight = this.height / FRACTAL_GRID_CELLS;

        // 1. Convert pixel coordinate to Grid Coordinate (0 to 8)
        const gridX = mx / cellWidth;

        // Grid Y is tricky because the class uses a bottom-up logical index (zoomGridY)
        // but the mouse provides top-down pixel coordinates.
        // Convert mouse Y to a bottom-up grid value:
        const gridY = (this.height - my) / cellHeight;

        // 2. Center the Zoom Window (4 cells wide) around the mouse
        // We subtract half the zoom size (2) from the mouse position
        let targetGridX = Math.floor(gridX - (ZOOM_GRID_CELLS / 2));
        let targetGridY = Math.floor(gridY - (ZOOM_GRID_CELLS / 2));

        // 3. Clamp values so the box doesn't go off screen
        const maxGridIndex = FRACTAL_GRID_CELLS - ZOOM_GRID_CELLS; // 8 - 4 = 4

        if (targetGridX < 0) targetGridX = 0;
        if (targetGridX > maxGridIndex) targetGridX = maxGridIndex;

        if (targetGridY < 0) targetGridY = 0;
        if (targetGridY > maxGridIndex) targetGridY = maxGridIndex;

        // 4. Update state and draw
        this.zoomGridX = targetGridX;
        this.zoomGridY = targetGridY;

        this.drawZoomZone();
        this.zoomIsVisible = true;
    }

    onKeyDown(evt) {
        // Prevent default scrolling for arrow keys/space
        if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(evt.code) > -1) {
            evt.preventDefault();
        }

        switch (evt.code) {
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
                this.setColors(COLOR_PALETTE);
                this.drawMandelbrot();
                break;
            case 'F5':
                this.setColors(COLOR_RANDOM);
                this.drawMandelbrot();
                break;
            case 'F6':
                this.setColors(COLOR_RED);
                this.drawMandelbrot();
                break;
            case 'F7':
                this.setColors(COLOR_GREEN);
                this.drawMandelbrot();
                break;
            case 'F8':
                this.setColors(COLOR_BLUE);
                this.drawMandelbrot();
                break;
            case 'F9':
                this.setColors(COLOR_GRAY);
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
                this.increaseSteps(INCREMENT_STEPS);
                break;
            case 'PageDown':
                this.increaseSteps(-INCREMENT_STEPS);
                break;
        }
    }

    redraw() {
        if (this.zoomIsVisible) {
            const dx = (this.fractalZoneX2 - this.fractalZoneX1) / FRACTAL_GRID_CELLS;
            const dy = (this.fractalZoneY2 - this.fractalZoneY1) / FRACTAL_GRID_CELLS;

            if ((dx >= MINIMUM_CELL_SIZE) && (dy >= MINIMUM_CELL_SIZE)) {
                // Save actual zone position
                this.zones.push([this.fractalZoneX1, this.fractalZoneY1, this.fractalZoneX2, this.fractalZoneY2]);

                // Set new drawing zone
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
            this.zones = []; // Clear history on reset
        }

        // Use requestAnimationFrame to prevent blocking the UI immediately
        requestAnimationFrame(() => {
            const width = this.width;
            const height = this.height;
            const dx = (this.fractalZoneX2 - this.fractalZoneX1) / (width - 1);
            const dy = (this.fractalZoneY2 - this.fractalZoneY1) / (height - 1);

            // Access pixel data directly for performance (Equivalent to BitmapData)
            const imageData = this.ctxBack.createImageData(width, height);
            const data = imageData.data;

            // Draw fractal zone
            for (let x = 0; x < width; ++x) {
                // In AS3 code, py calculation uses fractalZoneY2 - y * dy (standard Cartesian).
                // Screen Y increases downwards, Fractal Y increases upwards.
                
                // Pre-calculate px for this column
                const px = this.fractalZoneX1 + x * dx;

                for (let y = 0; y < height; ++y) {
                    const py = this.fractalZoneY2 - y * dy;

                    // Iterate fractal computation
                    let steps = 0;
                    let fx = 0.0;
                    let fy = 0.0;
                    let temp = 0.0;

                    while (true) {
                        temp = fx * fx - fy * fy + px;
                        fy = 2 * fx * fy + py;
                        fx = temp;

                        steps++;

                        if ((steps >= this.steps) || (fx * fx + fy * fy >= 4.0)) {
                            break;
                        }
                    }

                    // Pixel Index for Uint8ClampedArray (RGBA)
                    const index = (y * width + x) * 4;

                    if (steps < this.steps) {
                        // Point doesn't belong to set
                        let indexColor = (steps - 1) % 28 + 1;
                        if (indexColor > 15) {
                            indexColor = 30 - indexColor;
                        }

                        // Colors are stored as [r, g, b]
                        const c = this.colors[indexColor];
                        
                        data[index] = c[0];     // R
                        data[index + 1] = c[1]; // G
                        data[index + 2] = c[2]; // B
                        data[index + 3] = 255;  // Alpha
                    } else {
                        // Belongs to set (Black)
                        data[index] = 0;
                        data[index + 1] = 0;
                        data[index + 2] = 0;
                        data[index + 3] = 255;
                    }
                }
            }
            
            this.ctxBack.putImageData(imageData, 0, 0);
        });
    }

    setColors(opc) {
        let k;
        this.colors = [];

        switch (opc) {
            case COLOR_GRAY:
                for (k = 0; k < 16; k++) {
                    this.colors.push([4 * this.colorSteps[k][1], 4 * this.colorSteps[k][1], 4 * this.colorSteps[k][1]]);
                }
                break;

            case COLOR_BLUE:
                for (k = 0; k < 16; k++) {
                    this.colors.push([4 * this.colorSteps[k][0], 4 * this.colorSteps[k][1], 4 * this.colorSteps[k][2]]);
                }
                break;

            case COLOR_RED:
                for (k = 0; k < 16; k++) {
                    this.colors.push([4 * this.colorSteps[k][2], 13 * k, 3 * this.colorSteps[k][0]]);
                }
                break;

            case COLOR_GREEN:
                for (k = 0; k < 16; k++) {
                    this.colors.push([14 * k, 4 * this.colorSteps[k][2], 4 * this.colorSteps[k][0]]);
                }
                break;

            case COLOR_RANDOM:
                let c1, c2, c3;
                do {
                    c1 = Math.floor(COLOR_STEP * Math.random());
                    c2 = Math.floor(COLOR_STEP * Math.random());
                    c3 = Math.floor(COLOR_STEP * Math.random());
                } while ((c1 + c2 + c3) < MINIMUM_COLOR_STEP);

                this.colors.push([0, 0, 0]); // base color is black

                const a1 = Math.floor(COLOR_RANGE * Math.random());
                const a2 = Math.floor(COLOR_RANGE * Math.random());
                const a3 = Math.floor(COLOR_RANGE * Math.random());

                for (k = 1; k < 16; ++k) {
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
                const paletteIdx = Math.floor(Math.random() * this.palette.length);
                const pVals = this.palette[paletteIdx];
                
                this.colors.push([0, 0, 0]); // base color is black

                for (k = 1; k < 16; ++k) {
                    let p1 = (pVals[0] + (k - 1) * pVals[1]) % (COLOR_RANGE * 2);
                    let p2 = (pVals[2] + (k - 1) * pVals[3]) % (COLOR_RANGE * 2);
                    let p3 = (pVals[4] + (k - 1) * pVals[5]) % (COLOR_RANGE * 2);

                    if (p1 >= COLOR_RANGE) p1 = (COLOR_RANGE * 2) - p1 - 1;
                    if (p2 >= COLOR_RANGE) p2 = (COLOR_RANGE * 2) - p2 - 1;
                    if (p3 >= COLOR_RANGE) p3 = (COLOR_RANGE * 2) - p3 - 1;
                    
                    this.colors.push([4 * p1, 4 * p2, 4 * p3]);
                }
                break;
        }
    }

    drawRectangle(x1, y1, x2, y2, colorStr) {
        // Clear previous rect (simplified logic: clear whole front canvas)
        // In the original AS3, it drew over pixels with XOR or specific logic, 
        // here we just clear and redraw the UI layer.
        this.ctxFront.clearRect(0, 0, this.width, this.height);
        
        if (colorStr) {
            this.ctxFront.strokeStyle = colorStr;
            this.ctxFront.lineWidth = 1;
            this.ctxFront.beginPath();
            
            // Draw rectangle outline
            const w = x2 - x1;
            const h = y2 - y1;
            this.ctxFront.strokeRect(x1, y1, w, h);
        }
    }

    drawZoomZone() {
        const cellWidth = Math.floor(this.width / FRACTAL_GRID_CELLS);
        const cellHeight = Math.floor(this.height / FRACTAL_GRID_CELLS);

        const x1 = cellWidth * (this.zoomGridX);
        const x2 = cellWidth * (this.zoomGridX + ZOOM_GRID_CELLS);

        // In AS3: y1 = cellHeight * (8 - gridY)
        // Note on coordinate systems: 
        // JS Canvas (0,0) is Top-Left. 
        // Logic below preserves visual behavior of the original AS3 code relative to the grid.
        const y1 = cellHeight * (FRACTAL_GRID_CELLS - this.zoomGridY);
        const y2 = cellHeight * (FRACTAL_GRID_CELLS - this.zoomGridY - ZOOM_GRID_CELLS);

        // Since canvas Y grows down, y1 is physically lower (larger value) than y2 if gridY is small.
        // Normalize for strokeRect
        const rX = x1;
        const rY = y2; // Top 
        const rW = x2 - x1;
        const rH = y1 - y2; // Height

        this.drawRectangle(rX, rY, rX + rW, rY + rH, 'white');

        this.zoomX1 = x1;
        this.zoomY1 = y2;
        this.zoomX2 = x2;
        this.zoomY2 = y1;
    }

    toggleZoomZone() {
        if (!this.zoomIsVisible) {
            this.drawZoomZone();
            this.zoomIsVisible = true;
        } else {
            this.ctxFront.clearRect(0, 0, this.width, this.height);
            this.zoomIsVisible = false;
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
            if (this.zoomGridY < FRACTAL_GRID_CELLS - ZOOM_GRID_CELLS) {
                ++this.zoomGridY;
                this.drawZoomZone();
            }
        }
    }

    moveZoomDown() {
        if (!this.zoomIsVisible) {
            this.toggleZoomZone();
        } else {
            if (this.zoomGridY > 0) {
                --this.zoomGridY;
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

        this.colorSteps = [
            [ 0,  0,  0], [10,  8, 23], [13, 16, 36], [15, 18, 41],
            [17, 21, 46], [18, 23, 49], [20, 26, 50], [22, 29, 52],
            [24, 35, 55], [22, 40, 58], [20, 45, 60], [17, 46, 61],
            [16, 47, 62], [25, 52, 62], [38, 58, 63], [63, 63, 63]
        ];
    }
}

