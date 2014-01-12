
rubick = function () {

    var love = Luv({ id: 'canvas' });

    var faceSize;
    var cellSize;

    var getColor = function (face) {
        var r, g, b;
        switch (face) {
            case 0: r = 255; g = 128; b = 0; break;
            case 1: r = 0; g = 255; b = 0; break;
            case 2: r = 255; g = 255; b = 255; break;
            case 3: r = 0; g = 0; b = 255; break;
            case 4: r = 255; g = 255; b = 0; break;
            case 5: r = 255; g = 0; b = 0; break;
        }
        return {'r': r, 'g': g, 'b': b};
    };

    var getPosition = function (face) {
        var x, y;
        switch (face) {
            case 0: x = 10 + faceSize; y = 10; break;
            case 1: x = 10; y = faceSize + 10; break;
            case 2: x = 10 + faceSize; y = faceSize + 10; break;
            case 3: x = 10 + 2 * faceSize; y = faceSize + 10; break;
            case 4: x = 10 + 3 * faceSize; y = faceSize + 10; break;
            case 5: x = 10 + faceSize; y = 2 * faceSize + 10; break;
        }
        return {'x': x, 'y': y};
    };

    var getCellOffset = function (cell) {
        var x, y;
        switch (cell) {
            case 0: x = 0; y = 0; break;
            case 1: x = cellSize; y = 0; break;
            case 2: x = 2 * cellSize; y = 0; break;
            case 3: x = 2 * cellSize; y = cellSize; break;
            case 4: x = 2 * cellSize; y = 2 * cellSize; break;
            case 5: x = cellSize; y = 2 * cellSize; break;
            case 6: x = 0; y = 2 * cellSize; break;
            case 7: x = 0; y = cellSize; break;
        }
        return { 'x': x, 'y': y };
    };

    var drawFace = function (face, cells) {
        var color = getColor(face);
        var pos = getPosition(face);

        love.canvas.setColor(color.r, color.g, color.b);
        love.canvas.fillRectangle(pos.x, pos.y, faceSize, faceSize);

        for (var k = 0; k < 8; k++) {
            var co = getCellOffset(k);
            var cc = getColor(parseInt(cells.charAt(k), 10));

            love.canvas.setColor(cc.r, cc.g, cc.b);
            love.canvas.fillRectangle(pos.x + co.x, pos.y + co.y, cellSize, cellSize);

            love.canvas.setColor(0, 0, 0);
            love.canvas.strokeRectangle(pos.x + co.x, pos.y + co.y, cellSize, cellSize);
        }
    };

    love.load = function () {
        var d = love.canvas.getDimensions();
        var fw = (d.width - 20) / 4;
        var fh = (d.height - 20) / 3;
        faceSize = (fw < fh) ? fw : fh;
        cellSize = faceSize / 3;

        love.canvas.setBackgroundColor(255, 255, 255);
        love.draw();
    };

    love.mouse.onPressed = function (x, y, button) {
        if (button === 'l') {
            console.log('click' + love.mouse.getX() + " " + love.mouse.getY());
            love.canvas.setBackgroundColor(love.mouse.getX() % 255, love.mouse.getY() % 255, 255);
            love.draw();
        }
    };

    love.draw = function () {
        love.canvas.clear();
        for (var k = 0; k < 6; k++) {
            drawFace(k, '01234543');
        }
    };

    love.load();
}

