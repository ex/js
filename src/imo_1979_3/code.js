
goog.provide('imo_1979_3.start');

goog.require('goog.dom');
goog.require('goog.ui.Component');
goog.require('goog.ui.Slider');

imo_1979_3.start = function () {

    var e1 = document.getElementById('s1');
    var s1 = new goog.ui.Slider;
    s1.decorate(e1);
    s1.addEventListener(goog.ui.Component.EventType.CHANGE, function () {
        document.getElementById('out1').value = (s1.getValue() / 100);
    });
    s1.setValue(50);

    var e2 = document.getElementById('s2');
    var s2 = new goog.ui.Slider;
    s2.decorate(e2);
    s2.addEventListener(goog.ui.Component.EventType.CHANGE, function () {
        document.getElementById('out2').value = (s2.getValue() / 100);
    });
    s2.setValue(50);

    // This Luv.js function displays random moving rectangles on the screen.
    var luv = Luv({ id: 'canvas' });

    var rand = function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // This array will hold the game's rectangles
    var rectangles = [];

    // luv.load creates several rectangles and inserts them into the "rectangles"
    // variable at the beginning of the game
    luv.load = function () {
        var d = luv.canvas.getDimensions();
        for (var i = 0; i < 200; i++) {
            rectangles.push({
                l: rand(0, d.width - 50), t: rand(0, d.height - 50),
                w: rand(50, 100), h: rand(50, 100),
                vx: rand(-100, 100), vy: rand(-100, 100),
                r: rand(50, 255), g: rand(50, 255), b: rand(50, 255),
                type: rand(0, 1) ? 'fill' : 'stroke'
            });
        }
    };

    // luv.update moves the rectangles around, making them "bounce" with the screen borders
    // Try removing this function (the rectangles will stop moving)
    luv.update = function (dt) {
        var d = luv.canvas.getDimensions();
        for (var i = 0; i < rectangles.length; i++) {
            var r = rectangles[i];
            r.l += r.vx * dt;
            r.t += r.vy * dt;
            if (r.l < 0) { r.vx = Math.abs(r.vx); }
            if (r.l > d.width - r.w) { r.vx = -Math.abs(r.vx); }
            if (r.t < 0) { r.vy = Math.abs(r.vy); }
            if (r.t > d.height - r.h) { r.vy = -Math.abs(r.vy); }
        }
    };

    // luv.draw draws all the rectangles on their ever-changing positions.
    luv.draw = function () {
        var rect = null;
        for (var i = 0; i < rectangles.length; i++) {
            rect = rectangles[i];
            luv.canvas.setColor(rect.r, rect.g, rect.b);

            if (rect.type == 'fill') {
                luv.canvas.fillRectangle(rect.l, rect.t, rect.w, rect.h);
            } else {
                luv.canvas.strokeRectangle(rect.l, rect.t, rect.w, rect.h);
            }
        }
    };

    // luv.run must be invoked, otherwise the game will not start
    luv.run();
}

goog.exportSymbol('imo_1979_3.start', imo_1979_3.start);

