
///<reference path="lib/pixi/pixi.js.d.ts"/>

var STARS = [
    { id: 0, x: 1.631e-005, y: 0, z: 0 },
    { id: 1472, x: 8.38749905, y: 0.67415754, z: 8.132351934 },
    { id: 5632, x: 10.940004264, y: 3.58159445, z: -3.519149984 },
    { id: 8087, x: 10.288618746, y: 5.021875096, z: -3.26937212 },
    { id: 16496, x: 6.19444014, y: 8.290131612, z: -1.724042026 },
    { id: 32263, x: -1.612481626, y: 8.079096522, z: -2.47417807 },
    { id: 36107, x: -4.597948838, y: 11.465460272, z: 1.129819796 },
    { id: 37173, x: -4.792895744, y: 10.36066654, z: 1.043918288 },
    { id: 53879, x: -6.517476, y: 1.64504291, z: 4.878334048 },
    { id: 57375, x: -10.927347704, y: 0.585111464, z: 0.153676082 },
    { id: 70666, x: -1.540525168, y: -1.179053162, z: -3.755276378 },
    { id: 71453, x: -1.615280422, y: -1.350379926, z: -3.773070588 },
    { id: 71456, x: -1.615352186, y: -1.350742008, z: -3.77291075 },
    { id: 82472, x: -1.574091148, y: -5.3599553, z: -10.68551281 },
    { id: 87665, x: -0.056670726, y: -5.925791606, z: 0.486439226 },
    { id: 91484, x: 1.092300272, y: -5.78386851, z: 10.044836438 },
    { id: 91487, x: 1.057432754, y: -5.598759796, z: 9.722002822 },
    { id: 92115, x: 1.911150346, y: -8.652304948, z: -3.914801226 },
    { id: 103879, x: 6.456659272, y: -6.079180632, z: 7.117331704 },
    { id: 103883, x: 6.479222526, y: -6.099251718, z: 7.139676404 },
    { id: 108526, x: 5.651705318, y: -3.15342433, z: -9.884861434 },
    { id: 113687, x: 8.420957384, y: -2.026853486, z: -6.259037526 },
    { id: 117979, x: 8.343426168, y: 0.67027576, z: 8.089740428 },
    { id: 118079, x: 7.406367738, y: 3.41521614, z: -2.642099306 },
    { id: 118080, x: 7.406798322, y: 3.415415122, z: -2.64225262 },
    { id: 118441, x: -1.612664298, y: 8.079367268, z: -2.47412914 },
    { id: 118493, x: -4.769937788, y: 10.311250502, z: 1.03930582 },
    { id: 118541, x: -6.421090424, y: 8.381222962, z: 5.328359568 },
    { id: 118720, x: -7.446529482, y: 2.118127508, z: 0.952689934 },
    { id: 119518, x: 10.013990966, y: -3.716279168, z: -2.922585638 },
    { id: 119585, x: 7.380761038, y: -0.583969764, z: 7.193603788 },
];

class Vector {

    public x: number;
    public y: number;
    public z: number;

    constructor( x: number = 0, y: number = 0, z: number = 0 ) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

class Renderer {

    public static instance: Renderer;

    constructor( element: string, width: number, height: number ) {

        Renderer.instance = this;

        this.onResize( width, height );

        this.theta = 0;
        this.phi = 0;
        this.gamma = 0;
        this.speedTheta = 0;
        this.speedPhi = 0;
        this.speedGamma = 0;

        this.renderer = PIXI.autoDetectRenderer( { width: width, height: height, antialias: true } );
        var el = document.getElementById( element );
        if (el)
            el.appendChild( this.renderer.view );

        // Create the root of the scene graph
        this.stage = new PIXI.Container();
        
        this.graphics = new PIXI.Graphics();
        this.graphics.width = width;
        this.graphics.height = height;
        this.graphics.interactive = true;
        this.graphics.on( 'mousedown', this.onTouchDown, this );
        this.graphics.on( 'touchdown', this.onTouchDown, this );
        this.graphics.on( 'mouseup', this.onTouchUp, this );
        this.graphics.on( 'touchup', this.onTouchUp, this );

        this.stage.addChild( this.graphics );

        Renderer.update();
    }

    private render() {

        this.theta += this.speedTheta;
        this.phi += this.speedPhi;
        this.gamma += this.speedGamma;

        this.graphics.clear();
        this.graphics.beginFill( 0x000010 );
        this.graphics.drawRect( this.offsetX, this.offsetY, this.size, this.size );

        for ( let star of STARS ) {
            var p = this.toWorld( star['x'], star['y'], star['z'] );
            p = this.rotateZ( p, this.theta );
            p = this.rotateX( p, this.phi );
            p = this.rotateY( p, this.gamma );
            this.drawStar( this.graphics, this.fromWorldToScreen( p ) );
        }
        this.renderer.render( this.stage );
    }

    private onTouchDown( event: any ) {
        var dx = event.data.global.x - this.centerX;
        if ( ( dx > this.RADIUS ) || ( dx < -this.RADIUS ) ) {
            this.speedTheta = 0.1 * dx / this.size;
        }
        else {
            var dy = event.data.global.y - this.centerY;
            if ( ( dy > this.RADIUS ) || ( dy < -this.RADIUS ) ) {
                this.speedPhi = 0.1 * dy / this.size;
            }
            else {
                this.speedGamma = 0.01;
            }
        }
    }

    private onTouchUp( event: any ) {
        this.speedTheta = 0;
        this.speedPhi = 0;
        this.speedGamma = 0;
    }

    public onResize( width: number, height: number ) {

        this.size = ( height < width ) ? height : width;
        this.offsetX = ( width - this.size ) / 2;
        this.offsetY = ( height - this.size ) / 2;

        this.centerX = this.offsetX + this.size / 2;
        this.centerY = this.offsetY + this.size / 2;

        this.scale = this.size / 30;

        if ( this.renderer ) {
            this.renderer.resize( width, height );
        }
    }

    static update() {
        Renderer.instance.render();
        window.requestAnimationFrame( Renderer.update );
    }

    // Scale star coordinates to world coordinates 
    private toWorld( x: number, y: number, z: number ): Vector {
        return new Vector( this.scale * x, this.scale * y, this.scale * z );
    }

    // Rotates point [p] along the z-axis an angle theta
    private rotateZ( p: Vector, theta: number ): Vector {
        var cosTheta = Math.cos( theta );
        var sinTheta = Math.sin( theta );
        return new Vector( p.x * cosTheta - p.y * sinTheta, p.y * cosTheta + p.x * sinTheta, p.z );
    }

    // Rotates point [p] along the y-axis an angle gamma
    private rotateY( p: Vector, gamma: number ): Vector {
        var cosGamma = Math.cos( gamma );
        var sinGamma = Math.sin( gamma );
        return new Vector( p.x * cosGamma - p.z * sinGamma, p.y, p.z * cosGamma + p.x * sinGamma );
    }

    // Rotates point [p] along the x-axis an angle phi
    private rotateX( p: Vector, phi: number ): Vector {
        var cosPhi = Math.cos( phi );
        var sinPhi = Math.sin( phi );
        return new Vector( p.x, p.y * cosPhi + p.z * sinPhi, p.z * cosPhi - p.y * sinPhi );
    }

    private fromWorldToScreen( world: Vector ): Vector {
        return new Vector( this.centerX + world.x, this.centerY - world.z );
    }

    private drawStar( graphics: PIXI.Graphics, screen: Vector ) {
        graphics.lineStyle( 0 );
        graphics.beginFill( 0xFFFF00, 0.15 );
        graphics.drawCircle( screen.x, screen.y, 4 );
        graphics.endFill();
        graphics.beginFill( 0xFFFFAA, 0.4 );
        graphics.drawCircle( screen.x, screen.y, 2 );
        graphics.endFill();
        graphics.beginFill( 0xFFFFFF, 1 );
        graphics.drawCircle( screen.x, screen.y, 1 );
        graphics.endFill();
    }

    private renderer: PIXI.Renderer;
    private stage: PIXI.Container;
    private graphics: PIXI.Graphics;

    private size: number = 0;
    private offsetX: number = 0;
    private offsetY: number = 0;
    private centerX: number = 0;
    private centerY: number = 0;

    private scale: number = 0;

    private theta: number;
    private phi: number;
    private gamma: number;

    private speedTheta: number;
    private speedPhi: number;
    private speedGamma: number;

    readonly RADIUS: number = 100;
}

window.onload = () => {
    var renderer = new Renderer( 'content', window.innerWidth, window.innerHeight );
};

window.onresize = () => {
    if ( Renderer.instance ) {
        Renderer.instance.onResize( window.innerWidth, window.innerHeight );
    }
}
