"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
///<reference path="lib/soundjs/soundjs.d.ts"/>
// For compilation in Windows with tsconfig.json use> tsc.cmd
var timeline;
window.onload = function () {
    // Check that we can play audio
    if (!createjs.Sound.initializeDefaultPlugins()) {
        alert('Error initializing audio plugins');
        return;
    }
    timeline = new djs.Timeline();
    timeline.onResize();
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
window.addEventListener("resize", function () {
    console.log("resize: " + window.innerWidth + " " + window.innerHeight);
    timeline.onResize();
});
var djs;
(function (djs) {
    var Event = /** @class */ (function () {
        function Event(timeline, timeStart) {
            this.time = timeStart;
            this.timeline = timeline;
        }
        Event.prototype.onTime = function () { };
        ;
        return Event;
    }());
    djs.Event = Event;
    var EventTextCreation = /** @class */ (function (_super) {
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
    var EventImageCreation = /** @class */ (function (_super) {
        __extends(EventImageCreation, _super);
        function EventImageCreation(timeline, timeStart, timeEnd, imageTag, x, y) {
            var _this = _super.call(this, timeline, timeStart) || this;
            _this.image = imageTag;
            _this.x = x;
            _this.y = y;
            _this.timeEnd = timeEnd;
            return _this;
        }
        EventImageCreation.prototype.onTime = function () {
            //var id = this.timeline.createImage( this.image, this.x, this.y );
            //this.timeline.addEvent( new EventDeletion( this.timeline, this.timeEnd, id ) );
        };
        return EventImageCreation;
    }(Event));
    djs.EventImageCreation = EventImageCreation;
    var EventPlayAudio = /** @class */ (function (_super) {
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
    var EventDeletion = /** @class */ (function (_super) {
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
    var Modifier = /** @class */ (function () {
        function Modifier() {
            this.duration = 0;
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
var djs;
///<reference path="../lib/pixi/pixi.js.d.ts"/>
(function (djs) {
    var Renderer = /** @class */ (function () {
        function Renderer(parent, width, height, debug) {
            this.WIDTH = 960;
            this.HEIGHT = 600;
            this.parent = parent;
            var app = new PIXI.Application({ width: width, height: height, backgroundColor: 0 });
            document.body.appendChild(app.view);
            this.stage = app.stage;
            this.stage.interactive = true;
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
            this.debugMode = debug;
            this.defaultPosition = new PIXI.Point();
            if (this.debugMode) {
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
        }
        Renderer.prototype.createTextStyle = function (name, font, size, italic, bold, colorA, colorB, borderColor, borderSize, shadow, shadowColor, shadowBlur, shadowAngle, shadowDistance, wordWrap, wordWrapWidth) {
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
            var id = this.nodeCount++;
            var richText = new PIXI.Text(text, this.defaultTextStyle);
            richText.x = position ? position.x : this.defaultPosition.x;
            richText.y = position ? position.y : this.defaultPosition.y;
            this.stage.addChild(richText);
            this.nodes[id] = { node: richText };
            return id;
        };
        Renderer.prototype.createImage = function (texture, position) {
            var id = this.nodeCount++;
            // Container
            var container = new PIXI.Container();
            var sprite = new PIXI.Sprite(texture);
            container.addChild(sprite);
            this.displacementSprite = PIXI.Sprite.from('media/filter.jpg');
            // Make sure the sprite is wrapping.
            this.displacementSprite.texture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;
            var displacementFilter = new PIXI.filters.DisplacementFilter(this.displacementSprite);
            displacementFilter.padding = 10;
            displacementFilter.scale.x = 60;
            displacementFilter.scale.y = 60;
            this.stage.addChild(this.displacementSprite);
            this.stage.addChild(container);
            // Apply it
            sprite.filters = [displacementFilter];
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
                delete this.nodes[idNode];
            }
        };
        Renderer.prototype.setDebugText = function (text) {
            if (this.debugText) {
                this.debugText.text = text;
            }
        };
        Renderer.prototype.render = function () {
            if (this.displacementSprite) {
                // Offset the sprite position to make vFilterCoord update to larger value. Repeat wrapping makes sure there's still pixels on the coordinates.
                this.displacementSprite.x++;
                // Reset x to 0 when it's over width to keep values from going to very huge numbers.
                if (this.displacementSprite.x > this.displacementSprite.width) {
                    this.displacementSprite.x = 0;
                }
            }
            this.renderer.render(this.stage);
            if (this.debugMode) {
                this.setDebugText(this.parent.getTime().toString(10));
            }
        };
        Renderer.prototype.onTouchDown = function () {
        };
        Renderer.prototype.onTouchUp = function () {
        };
        Renderer.prototype.onResize = function () {
            var vpw = window.innerWidth; // Width of the viewport
            var vph = window.innerHeight; // Height of the viewport
            var nvw; // New game width
            var nvh; // New game height
            // The aspect ratio is the ratio of the screen's sizes in different dimensions.
            // The height-to-width aspect ratio of the game is HEIGHT / WIDTH.
            if (vph / vpw < this.HEIGHT / this.WIDTH) {
                // If height-to-width ratio of the viewport is less than the height-to-width ratio
                // of the game, then the height will be equal to the height of the viewport, and
                // the width will be scaled.
                nvh = vph;
                nvw = (nvh * this.WIDTH) / this.HEIGHT;
            }
            else {
                // In the else case, the opposite is happening.
                nvw = vpw;
                nvh = (nvw * this.HEIGHT) / this.WIDTH;
            }
            // Set the game screen size to the new values.
            // This command only makes the screen bigger --- it does not scale the contents of the game.
            // There will be a lot of extra room --- or missing room --- if we don't scale the stage.
            this.renderer.resize(nvw, nvh);
            // This command scales the stage to fit the new size of the game.
            this.stage.scale.set(nvw / this.WIDTH, nvh / this.HEIGHT);
        };
        return Renderer;
    }());
    djs.Renderer = Renderer;
})(djs || (djs = {}));
///<reference path="../lib/pixi/pixi.js.d.ts"/>
///<reference path="../lib/soundjs/soundjs.d.ts"/>
var djs;
///<reference path="../lib/pixi/pixi.js.d.ts"/>
///<reference path="../lib/soundjs/soundjs.d.ts"/>
(function (djs) {
    var Timeline = /** @class */ (function () {
        function Timeline() {
            this.events = new Array();
            this.time = 0;
            this.soundLoaded = false;
            this.imageLoaded = false;
            this.mediaPath = "";
            this.renderer = new djs.Renderer(this, window.innerWidth, window.innerHeight, false);
        }
        Timeline.prototype.onResize = function () {
            this.renderer.onResize();
        };
        Timeline.prototype.onDataLoaded = function (data) {
            // Load events
            var events = data.events;
            for (var k = 0; k < events.length; k++) {
                if (events[k].length == 5) {
                    this.events.push(new djs.EventImageCreation(this, 1000 * events[k][0], 1000 * events[k][1], events[k][2], events[k][3], events[k][4]));
                }
                if (events[k].length == 3) {
                    this.events.push(new djs.EventTextCreation(this, 1000 * events[k][0], 1000 * events[k][1], events[k][2]));
                }
                else if (events[k].length == 4) {
                    this.events.push(new djs.EventPlayAudio(this, 1000 * events[k][0], events[k][2]));
                }
            }
            // Load sound
            var manifest = [
                { id: data.audio, src: this.mediaPath + data.audio },
            ];
            var self = this;
            var queue = new createjs.LoadQueue();
            createjs.Sound.alternateExtensions = ['mp3'];
            queue.installPlugin(createjs.Sound);
            queue.addEventListener('fileload', function (event) {
                self.onSoundLoaded();
            });
            queue.addEventListener('error', function (event) {
                self.onSoundError();
            });
            queue.loadManifest(manifest);
            // Load image
            var loader = PIXI.Loader.shared;
            loader.add(this.mediaPath + data.image);
            loader.add("media/filter.jpg");
            loader.load(onAssetsLoaded);
            function onAssetsLoaded() {
                var texture = PIXI.Texture.from(self.mediaPath + data.image);
                self.createImage(texture, 0, 0);
                self.imageLoaded = true;
            }
            ;
        };
        Timeline.prototype.onSoundLoaded = function () {
            this.soundLoaded = true;
        };
        Timeline.prototype.onSoundError = function () {
            this.soundLoaded = true; // play anyways
            console.warn('onSoundError');
        };
        Timeline.prototype.load = function (mediaPath, songFile) {
            var self = this;
            this.mediaPath = mediaPath;
            this.renderer.createTextStyle('default', 'Palatino Linotype', 45, true, true, '#55ffff', '#3366ff');
            this.renderer.setDefaultInsertPosition(45, 490);
            var idNode = this.renderer.createText("Loading...");
            var loader = PIXI.Loader.shared;
            loader.add('json', mediaPath + songFile);
            loader.load(function (_, res) {
                self.deleteNode(idNode);
                self.onDataLoaded(res.json.data);
            });
        };
        Timeline.prototype.createText = function (text) {
            return this.renderer.createText(text);
        };
        Timeline.prototype.createImage = function (texture, x, y) {
            return this.renderer.createImage(texture, new PIXI.Point(x, y));
        };
        Timeline.prototype.playAudio = function (audioTag) {
            createjs.Sound.play(audioTag, { volume: 0.2 });
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
            if (!this.soundLoaded || !this.imageLoaded) {
                return;
            }
            while (this.events.length > 0 && (this.time >= this.events[0].time)) {
                this.events[0].onTime();
                this.events.shift();
            }
            this.time += delta;
            this.renderer.render();
        };
        Timeline.prototype.getTime = function () {
            return this.time;
        };
        return Timeline;
    }());
    djs.Timeline = Timeline;
})(djs || (djs = {}));
//# sourceMappingURL=main.js.map