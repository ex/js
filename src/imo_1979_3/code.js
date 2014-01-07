
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
var R2;
var x1;
var x2;
var a1;
var a2;
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

function drawStep(angle, showPoints) {
    // Calculate points on circles for step
    var p1x = x1 + R1 * Math.cos(a1 + angle);
    var p1y = y + R1 * Math.sin(a1 + angle);

    var p2x = x2 + R2 * Math.cos(a2 + dir * angle);
    var p2y = y + R2 * Math.sin(a2 + dir * angle);

    if (showPoints) {
        drawCircle(ctx, p1x, p1y, 4, '#FF0000');
        drawCircle(ctx, p2x, p2y, 4, '#FF0000');
    }

    // Calculate direction between these points
    var ux = p2x - p1x;
    var uy = p2y - p1y;
    var ud = Math.sqrt(ux * ux + uy * uy);
    ux /= ud;
    uy /= ud;

    // Draw the line that has the same distance to for these points
    drawRect(ctx, (p1x + p2x) / 2, (p1y + p2y) / 2, -uy, ux, 400, '#FF7777');
}

function redraw(angle) {

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawRectangle(ctx, 0, 0, canvas.width, canvas.height, '#AAAAAA');

    R2 = r * R1;
    var d = R1 * (1 + 2 * r * p - r);
    x2 = x1 + d;

    drawCircle(ctx, x1, y, R1, '#003300');
    drawCircle(ctx, x2, y, R2, '#003300');

    // Calculate intersection point using cosine law:
    // c ^ 2 = a ^ 2 + b ^ 2 - 2 * a * b * cos( theta ) 

    a1 = Math.acos((R1 * R1 + d * d - R2 * R2) / (2 * R1 * d));
    a2 = Math.PI - Math.acos((R2 * R2 + d * d - R1 * R1) / (2 * R2 * d));

    drawLine(ctx, x1, y, x1 + R1 * Math.cos(a1), y + R1 * Math.sin(a1), '#7777FF');
    drawLine(ctx, x2, y, x2 + R2 * Math.cos(a2), y + R2 * Math.sin(a2), '#7777FF');

    if (dir < 0) {
        drawLine(ctx, x1, y, x1 - R2 * Math.cos(a2), y - R2 * Math.sin(a2), '#999999');
        drawLine(ctx, x2, y, x2 - R1 * Math.cos(a1), y - R1 * Math.sin(a1), '#999999');
    }
    else {
        drawLine(ctx, x1, y, x1 - R2 * Math.cos(a2), y + R2 * Math.sin(a2), '#999999');
        drawLine(ctx, x2, y, x2 - R1 * Math.cos(a1), y + R1 * Math.sin(a1), '#999999');
    }

    if (typeof angle === 'undefined') {
        // Draw steps
        for (var k = 1; k < steps; k++) {
            drawStep(k * da, false);
        }
    }
    else {
        drawStep(angle, true);
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
    s1.setMinimum(1);
    s1.setMaximum(200);
    s1.addEventListener(goog.ui.Component.EventType.CHANGE, function () {
        onRadiusChange(s1.getValue() / 200);
    });
    s1.setMoveToPointEnabled(true);
    s1.setValue(200 * r);

    var e2 = document.getElementById('s2');
    var s2 = new goog.ui.Slider;
    s2.decorate(e2);
    s2.setMinimum(1);
    s2.setMaximum(199);
    s2.setMoveToPointEnabled(true);
    s2.addEventListener(goog.ui.Component.EventType.CHANGE, function () {
        onCenterChange(s2.getValue() / 200);
    });
    s2.setValue(200 * p);

    var e3 = document.getElementById('s3');
    var s3 = new goog.ui.Slider;
    s3.decorate(e3);
    s3.setMoveToPointEnabled(true);
    s3.setMinimum(1);
    s3.setMaximum(999);
    s3.addEventListener(goog.ui.Component.EventType.CHANGE, function () {
        redraw(Math.PI * s3.getValue() / 500);
    });
}

imo_1979_3.onChangeDirection = function (value) {
    dir = value ? -1 : 1;
    redraw();
}

goog.exportSymbol('imo_1979_3.start', imo_1979_3.start);
goog.exportSymbol('imo_1979_3.onChangeDirection', imo_1979_3.onChangeDirection);

