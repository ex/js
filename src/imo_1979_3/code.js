
goog.provide('imo_1979_3.start');

goog.require('goog.dom');
goog.require('goog.ui.Component');
goog.require('goog.ui.Slider');

var ctx;
var r = 0.75; // R1/R2
var p = 0.75; // [R1 - R2, R1 + R2] factor
var R1 = 145;
var steps = 36;
var da = 2 * Math.PI / steps;
var dir = 1;
var x1;
var y;

function drawCircle(context, centerX, centerY, radius, color) {
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.lineWidth = 1;
    context.strokeStyle = color;
    context.stroke();
}
function drawRectangle(context, x, y, width, height, color) {
    context.beginPath();
    context.rect(x, y, width, height);
    context.lineWidth = 1;
    context.strokeStyle = color;
    context.stroke();
}

function drawLine(context, x1, y1, x2, y2, color) {
    context.beginPath();
    context.lineWidth = 1;
    context.strokeStyle = color;
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
}

function drawRect(context, x, y, ux, uy, d, color) {
    drawLine(context, x - d * ux, y - d * uy, x + d * ux, y + d * uy, color);
}

function redraw() {

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawRectangle(ctx, 0, 0, canvas.width, canvas.height, '#AAAAAA');

    var R2 = r * R1;
    var d = R1 * (1 + 2 * r * p - r);
    var x2 = x1 + d;

    drawCircle(ctx, x1, y, R1, '#003300');
    drawCircle(ctx, x2, y, R2, '#003300');

    // Calculate intersection point using cosine law:
    // c ^ 2 = a ^ 2 + b ^ 2 - 2 * a * b * cos( theta ) 

    var a1 = Math.acos((R1 * R1 + d * d - R2 * R2) / (2 * R1 * d));
    var a2 = Math.PI - Math.acos((R2 * R2 + d * d - R1 * R1) / (2 * R2 * d));

    drawLine(ctx, x1, y, x1 + R1 * Math.cos(a1), y + R1 * Math.sin(a1), '#7777FF');
    drawLine(ctx, x2, y, x2 + R2 * Math.cos(a2), y + R2 * Math.sin(a2), '#7777FF');

    // Draw steps
    for (var k = 1; k < steps; k++) {

        // Calculate points on circles for step
        var p1x = x1 + R1 * Math.cos(a1 + k * da);
        var p1y = y + R1 * Math.sin(a1 + k * da);

        var p2x = x2 + R2 * Math.cos(a2 + dir * k * da);
        var p2y = y + R2 * Math.sin(a2 + dir * k * da);

        // Calculate direction between these points
        var ux = p2x - p1x;
        var uy = p2y - p1y;
        var ud = Math.sqrt(ux * ux + uy * uy);
        ux /= ud;
        uy /= ud;

        // Draw the line that has the same distance for these points
        drawRect(ctx, (p1x + p2x) / 2, (p1y + p2y) / 2, -uy, ux, 400, '#FF7777');
    }
}

imo_1979_3.start = function () {

    var canvas = document.getElementById("canvas");
    if (canvas.getContext) {
        ctx = canvas.getContext("2d");
        x1 = R1 + (canvas.width - 4 * R1) / 2;
        y = canvas.height / 2;
    }

    function onRadiusChange(value) {
        document.getElementById('out1').value = value;
        r = value;
        redraw();
    }

    function onCenterChange(value) {
        document.getElementById('out2').value = value;
        p = value;
        redraw();
    }

    var e1 = document.getElementById('s1');
    var s1 = new goog.ui.Slider;
    s1.decorate(e1);
    s1.addEventListener(goog.ui.Component.EventType.CHANGE, function () {
        onRadiusChange(s1.getValue() / 100);
    });
    s1.setMoveToPointEnabled(true);
    s1.setValue(100 * r);

    var e2 = document.getElementById('s2');
    var s2 = new goog.ui.Slider;
    s2.decorate(e2);
    s2.setMoveToPointEnabled(true);
    s2.addEventListener(goog.ui.Component.EventType.CHANGE, function () {
        onCenterChange(s2.getValue() / 100);
    });
    s2.setValue(100 * p);
}

imo_1979_3.onChangeDirection = function (value) {
    dir = value ? -1 : 1;
    redraw();
}

goog.exportSymbol('imo_1979_3.start', imo_1979_3.start);
goog.exportSymbol('imo_1979_3.onChangeDirection', imo_1979_3.onChangeDirection);

