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
            var el = document.getElementById(element);
            var app = new PIXI.Application(width, height, { backgroundColor: 0x104090 });
            el.appendChild(app.view);
            this.stage = app.stage;
            this.renderer = app.renderer;
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
            // Debug text
            var style = new PIXI.TextStyle({
                fontFamily: 'Lucida Console',
                fontSize: 18,
                fill: '#FF0000',
            });
            this.debugText = new PIXI.Text('', style);
            this.debugText.x = 10;
            this.debugText.y = 10;
            this.stage.addChild(this.debugText);
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
            var id = this.nodeCount++;
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
        Renderer.prototype.deleteNode = function (idNode) {
            if (this.nodes[idNode]) {
                this.stage.removeChild(this.nodes[idNode].node);
                this.nodes[idNode] = null;
            }
        };
        Renderer.prototype.setDebugText = function (text) {
            this.debugText.text = text;
        };
        Renderer.prototype.render = function () {
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
        return Renderer;
    }());
    djs.Renderer = Renderer;
})(djs || (djs = {}));
///<reference path="lib/soundjs/soundjs.d.ts"/>
var timeline = null;
window.onload = function () {
    // Check that we can play audio
    if (!createjs.Sound.initializeDefaultPlugins()) {
        alert('Error initializing audio plugins');
        return;
    }
    var timeline = new djs.Timeline('content');
    timeline.load('media/natali/', 'hombre_mar.json');
    var oldTime = Date.now();
    var update = function () {
        var newTime = Date.now();
        var timeDelta = newTime - oldTime;
        oldTime = newTime;
        timeline.update(timeDelta);
        window.requestAnimationFrame(update);
    };
    update();
};
window.onresize = function () {
    if (timeline) {
        timeline.onResize(window.innerWidth, window.innerHeight);
    }
};
var djs;
(function (djs) {
    var Event = (function () {
        function Event(timeline, timeStart) {
            this.time = timeStart;
            this.timeline = timeline;
        }
        Event.prototype.onTime = function () { };
        ;
        return Event;
    }());
    djs.Event = Event;
    var EventTextCreation = (function (_super) {
        __extends(EventTextCreation, _super);
        function EventTextCreation(timeline, timeStart, timeEnd, text) {
            var _this = _super.call(this, timeline, timeStart) || this;
            _this.text = text;
            _this.timeEnd = timeEnd;
            return _this;
        }
        EventTextCreation.prototype.onTime = function () {
            var id = this.timeline.createText(this.text);
            this.timeline.addEvent(new EventDeletion(this.timeline, this.timeEnd, id));
        };
        return EventTextCreation;
    }(Event));
    djs.EventTextCreation = EventTextCreation;
    var EventPlayAudio = (function (_super) {
        __extends(EventPlayAudio, _super);
        function EventPlayAudio(timeline, timeStart, audioTag) {
            var _this = _super.call(this, timeline, timeStart) || this;
            _this.audio = audioTag;
            return _this;
        }
        EventPlayAudio.prototype.onTime = function () {
            this.timeline.playAudio(this.audio);
        };
        return EventPlayAudio;
    }(Event));
    djs.EventPlayAudio = EventPlayAudio;
    var EventDeletion = (function (_super) {
        __extends(EventDeletion, _super);
        function EventDeletion(timeline, timeStart, idNode) {
            var _this = _super.call(this, timeline, timeStart) || this;
            _this.idNode = idNode;
            return _this;
        }
        EventDeletion.prototype.onTime = function () {
            this.timeline.deleteNode(this.idNode);
        };
        return EventDeletion;
    }(Event));
    djs.EventDeletion = EventDeletion;
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
///<reference path="../lib/pixi/pixi.js.d.ts"/>
///<reference path="../lib/soundjs/soundjs.d.ts"/>
var djs;
(function (djs) {
    var Timeline = (function () {
        function Timeline(element) {
            this.events = new Array();
            this.time = 0;
            this.loaded = false;
            this.renderer = new djs.Renderer(element, window.innerWidth, window.innerHeight);
        }
        Timeline.prototype.onResize = function (width, height) {
            this.renderer.onResize(width, height);
        };
        Timeline.prototype.onDataLoaded = function (data) {
            var events = data.events;
            for (var k = 0; k < events.length; k++) {
                if (events[k].length == 3) {
                    this.events.push(new djs.EventTextCreation(this, 1000 * events[k][0], 1000 * events[k][1], events[k][2]));
                }
                else {
                    this.events.push(new djs.EventPlayAudio(this, 1000 * events[k][0], events[k][2]));
                }
            }
            var manifest = [
                { id: data.audio, src: this.mediaPath + data.audio },
            ];
            var self = this;
            var queue = new createjs.LoadQueue();
            createjs.Sound.alternateExtensions = ['mp3'];
            queue.installPlugin(createjs.Sound);
            queue.addEventListener('fileload', function (event) {
                self.onSoundLoaded(event);
            });
            queue.addEventListener('error', function (event) {
                self.onSoundError(event);
            });
            queue.loadManifest(manifest);
        };
        Timeline.prototype.onSoundLoaded = function (event) {
            this.loaded = true;
        };
        Timeline.prototype.onSoundError = function (event) {
            this.loaded = true;
            //console.log( 'onSoundError' );
        };
        Timeline.prototype.load = function (mediaPath, songFile) {
            var self = this;
            this.mediaPath = mediaPath;
            var loader = new PIXI.loaders.Loader();
            loader.add('json', mediaPath + songFile);
            loader.load(function (loader, res) {
                self.onDataLoaded(res.json.data);
            });
            this.renderer.createTextStyle('default', 'Palatino Linotype', 50, true, true, '#55ffff', '#3366ff');
            this.renderer.setDefaultInsertPosition(50, 400);
        };
        Timeline.prototype.createText = function (text) {
            return this.renderer.createText(text);
        };
        Timeline.prototype.playAudio = function (audioTag) {
            createjs.Sound.play(audioTag, { volume: 1.0 });
        };
        Timeline.prototype.addEvent = function (event) {
            var k = 0;
            while ((k < this.events.length) && (event.time > this.events[k].time)) {
                k++;
            }
            this.events.splice(k, 0, event);
        };
        Timeline.prototype.deleteNode = function (idNode) {
            this.renderer.deleteNode(idNode);
        };
        Timeline.prototype.update = function (delta) {
            if (!this.loaded) {
                return;
            }
            this.renderer.setDebugText(this.time);
            while (this.events.length > 0 && (this.time >= this.events[0].time)) {
                this.events[0].onTime();
                this.events.shift();
            }
            this.time += delta;
            this.renderer.render();
        };
        return Timeline;
    }());
    djs.Timeline = Timeline;
})(djs || (djs = {}));
//# sourceMappingURL=main.js.map