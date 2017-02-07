var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
///<reference path="../lib/pixi/pixi.js.d.ts"/>
var djs;
(function (djs) {
    var Renderer = (function () {
        function Renderer(element, width, height) {
            Renderer.instance = this;
            this.onResize(width, height);
            this.renderer = PIXI.autoDetectRenderer(width, height, { antialias: true });
            var el = document.getElementById(element);
            el.appendChild(this.renderer.view);
            // Create the root of the scene graph
            this.stage = new PIXI.Container();
            this.graphics = new PIXI.Graphics();
            this.graphics.width = width;
            this.graphics.height = height;
            this.graphics.interactive = true;
            this.graphics.on('mousedown', this.onTouchDown, this);
            this.graphics.on('touchdown', this.onTouchDown, this);
            this.graphics.on('mouseup', this.onTouchUp, this);
            this.graphics.on('touchup', this.onTouchUp, this);
            this.stage.addChild(this.graphics);
            this.textStyles = {};
            this.nodes = {};
            this.nodeCount = 0;
            this.defaultPosition = new PIXI.Point();
            this.oldTime = Date.now();
            this.timeline = new djs.Timeline(this);
            Renderer.update();
        }
        Renderer.prototype.createTextStyle = function (name, font, size, italic, bold, colorA, colorB, borderColor, borderSize, shadow, shadowColor, shadowBlur, shadowAngle, shadowDistance, wordWrap, wordWrapWidth) {
            if (colorB === void 0) { colorB = null; }
            if (borderColor === void 0) { borderColor = '#401010'; }
            if (borderSize === void 0) { borderSize = 5; }
            if (shadow === void 0) { shadow = true; }
            if (shadowColor === void 0) { shadowColor = '#000000'; }
            if (shadowBlur === void 0) { shadowBlur = 4; }
            if (shadowAngle === void 0) { shadowAngle = 0.5236; }
            if (shadowDistance === void 0) { shadowDistance = 6; }
            if (wordWrap === void 0) { wordWrap = false; }
            if (wordWrapWidth === void 0) { wordWrapWidth = 440; }
            var fillColor = colorB ? [colorA, colorB] : colorA;
            var style = new PIXI.TextStyle({
                fontFamily: font,
                fontSize: size,
                fontStyle: italic ? 'italic' : 'normal',
                fontWeight: bold ? 'bold' : 'normal',
                fill: fillColor,
                stroke: borderColor,
                strokeThickness: borderSize,
                dropShadow: shadow,
                dropShadowColor: shadowColor,
                dropShadowBlur: shadowBlur,
                dropShadowAngle: shadowAngle,
                dropShadowDistance: shadowDistance,
                wordWrap: wordWrap,
                wordWrapWidth: wordWrapWidth
            });
            this.textStyles[name] = style;
            if (!this.defaultTextStyle) {
                this.defaultTextStyle = style;
            }
            return true;
        };
        Renderer.prototype.setDefaultTextStyle = function (style) {
            this.defaultTextStyle = style;
        };
        Renderer.prototype.createText = function (text, position) {
            if (position === void 0) { position = null; }
            var id = 't' + this.nodeCount++;
            var richText = new PIXI.Text(text, this.defaultTextStyle);
            richText.x = position ? position.x : this.defaultPosition.x;
            richText.y = position ? position.y : this.defaultPosition.y;
            this.stage.addChild(richText);
            this.nodes[id] = { node: richText };
            return id;
        };
        Renderer.prototype.setDefaultInsertPosition = function (x, y) {
            this.defaultPosition.x = x;
            this.defaultPosition.y = y;
        };
        Renderer.prototype.clear = function () {
            for (var id in this.nodes) {
                this.stage.removeChild(this.nodes[id].node);
            }
            this.nodes = {};
        };
        Renderer.prototype.render = function () {
            var newTime = Date.now();
            var timeDelta = newTime - this.oldTime;
            this.oldTime = newTime;
            this.timeline.update(timeDelta);
            this.renderer.render(this.stage);
        };
        Renderer.prototype.onTouchDown = function (event) {
        };
        Renderer.prototype.onTouchUp = function (event) {
        };
        Renderer.prototype.onResize = function (width, height) {
            if (this.renderer) {
                this.renderer.resize(width, height);
            }
        };
        Renderer.update = function () {
            Renderer.instance.render();
            window.requestAnimationFrame(Renderer.update);
        };
        return Renderer;
    }());
    djs.Renderer = Renderer;
})(djs || (djs = {}));
//window.onload = () => {
//    var renderer = new djs.Renderer( 'content', window.innerWidth, window.innerHeight );
//};
window.onresize = function () {
    if (djs.Renderer.instance) {
        djs.Renderer.instance.onResize(window.innerWidth, window.innerHeight);
    }
};
var djs;
(function (djs) {
    var Event = (function () {
        function Event(timeStart, timeline) {
            this.time = timeStart;
            this.timeline = timeline;
        }
        Event.prototype.onTime = function () {
        };
        return Event;
    }());
    djs.Event = Event;
    var EventTextCreation = (function (_super) {
        __extends(EventTextCreation, _super);
        function EventTextCreation(timeStart, timeline, text) {
            var _this = _super.call(this, timeStart, timeline) || this;
            _this.text = text;
            return _this;
        }
        EventTextCreation.prototype.onTime = function () {
            this.timeline.createText(this.text);
        };
        return EventTextCreation;
    }(Event));
    djs.EventTextCreation = EventTextCreation;
})(djs || (djs = {}));
var djs;
(function (djs) {
    var Modifier = (function () {
        function Modifier() {
        }
        Modifier.prototype.onStart = function () {
        };
        Modifier.prototype.onEnd = function () {
        };
        return Modifier;
    }());
    djs.Modifier = Modifier;
})(djs || (djs = {}));
var djs;
(function (djs) {
    var Timeline = (function () {
        function Timeline(renderer) {
            this.renderer = renderer;
            this.events = new Array();
            this.time = 0;
            this.load();
        }
        Timeline.prototype.load = function () {
            var events = [
                [18.29, 'Ayer un árbol'],
                [20.79, 'cuidó de mi'],
                [22.93, 'acarició'],
                [25.44, 'un sueño mio.'],
                [27.42, 'Si en verdad'],
                [29.80, 'existe Dios'],
                [31.80, 'sólo lo vi'],
                [34.01, 'a través de él.'],
                [45.91, 'Tiempo es todo'],
                [48.25, 'lo que nos queda'],
                [50.56, 'por ti sería'],
                [52.68, 'esa mujer.'],
                [55.11, 'Y tomé el riesgo'],
                [57.42, 'de no ser libre'],
                [59.71, 'tanto hay que andar'],
                [61.98, 'para encontrarte al fin.'],
                [73.39, 'Estoy aquí'],
                [75.69, 'puedo planear'],
                [77.78, 'sobre tu mar'],
                [80.25, 'sin el riesgo de caer'],
                [86.53, 'a tus pies.'],
                [100.82, 'Si renuncié'],
                [102.84, 'a mi corazón'],
                [104.60, 'fue sólo'],
                [106.54, 'cuando estuve herida.'],
                [109.97, 'Rayos y truenos'],
                [112.24, 'vienen por mi'],
                [114.54, 'rompen mis olas'],
                [116.87, 'llévame ahora.'],
                [128.30, 'Me veo durmiendo'],
                [130.54, 'en tu humedad'],
                [132.86, 'fuego que quema'],
                [135.11, 'cielo que espera.'],
                [137.39, 'Y si despierto'],
                [139.67, 'hoy de este sueño'],
                [141.96, 'madre maestra'],
                [144.25, 'dile que vuelva.'],
                [150.02, 'Estoy cayendo'],
                [154.54, 'y no te das cuenta.'],
            ];
            for (var k = 0; k < events.length; k++) {
                this.events.push(new djs.EventTextCreation(1000 * events[k][0], this, events[k][1]));
            }
            this.renderer.createTextStyle('default', 'Palatino Linotype', 50, true, true, '#55ffff', '#3366ff');
            this.renderer.setDefaultInsertPosition(50, 500);
        };
        Timeline.prototype.createText = function (text) {
            this.renderer.clear();
            this.renderer.createText(text);
        };
        Timeline.prototype.update = function (delta) {
            this.time += delta;
            while (this.events.length > 0 && (this.time >= this.events[0].time)) {
                this.events[0].onTime();
                this.events.shift();
            }
        };
        return Timeline;
    }());
    djs.Timeline = Timeline;
})(djs || (djs = {}));
//# sourceMappingURL=main.js.map