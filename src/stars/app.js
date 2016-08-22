///<reference path="lib/pixi/pixi.js.d.ts"/>
var stars = [
    { id: 0, x: 1.631e-005, y: 0, z: 0 },
    { id: 32263, x: -1.612481626, y: 8.079096522, z: -2.47417807 },
    { id: 53879, x: -6.517476, y: 1.64504291, z: 4.878334048 },
    { id: 70666, x: -1.540525168, y: -1.179053162, z: -3.755276378 },
    { id: 71453, x: -1.615280422, y: -1.350379926, z: -3.773070588 },
    { id: 71456, x: -1.615352186, y: -1.350742008, z: -3.77291075 },
    { id: 87665, x: -0.056670726, y: -5.925791606, z: 0.486439226 },
    { id: 92115, x: 1.911150346, y: -8.652304948, z: -3.914801226 },
    { id: 118079, x: 7.406367738, y: 3.41521614, z: -2.642099306 },
    { id: 118080, x: 7.406798322, y: 3.415415122, z: -2.64225262 },
    { id: 118441, x: -1.612664298, y: 8.079367268, z: -2.47412914 },
    { id: 118720, x: -7.446529482, y: 2.118127508, z: 0.952689934 },
];
var Renderer = (function () {
    function Renderer(width, height) {
        this.width = width;
        this.height = height;
        this.sx = width / 2;
        this.sy = height / 2;
        this.scale = width / 20;
        this.renderer = PIXI.autoDetectRenderer(width, height, { antialias: true });
        document.body.appendChild(this.renderer.view);
        // Create the root of the scene graph
        this.stage = new PIXI.Container();
        this.stage.interactive = true;
        this.graphics = new PIXI.Graphics();
        this.stage.addChild(this.graphics);
        for (var _i = 0, stars_1 = stars; _i < stars_1.length; _i++) {
            var star = stars_1[_i];
            this.drawStar(this.graphics, this.sx + this.scale * +star['x'], this.sy + this.scale * +star['y']);
        }
        this.renderer.render(this.stage);
    }
    Renderer.prototype.drawStar = function (graphics, x, y) {
        graphics.lineStyle(0);
        graphics.beginFill(0xFFFFFF, 0.3);
        graphics.drawCircle(x, y, 2);
        graphics.endFill();
        graphics.beginFill(0xFFFFFF, 1);
        graphics.drawCircle(x, y, 1);
        graphics.endFill();
    };
    return Renderer;
}());
window.onload = function () {
    var renderer = new Renderer(800, 800);
};
//# sourceMappingURL=app.js.map