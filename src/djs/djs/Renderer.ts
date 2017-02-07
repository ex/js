///<reference path="../lib/pixi/pixi.js.d.ts"/>

namespace djs {

    export type RenderElement = {
        node: PIXI.Text;
    }

    export class Renderer {

        public static instance: Renderer;

        constructor( element: string, width: number, height: number ) {

            Renderer.instance = this;

            this.onResize( width, height );

            this.renderer = PIXI.autoDetectRenderer( width, height, { antialias: true });
            var el = document.getElementById( element );
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

            this.textStyles = {};
            this.nodes = {};
            this.nodeCount = 0;
            this.defaultPosition = new PIXI.Point();
            this.oldTime = Date.now();

            this.timeline = new djs.Timeline( this );

            Renderer.update();
        }

        public createTextStyle( name: string, font: string, size: number,
                                italic: boolean, bold: boolean,
                                colorA: string, colorB: string = null,
                                borderColor: string = '#401010', borderSize: number = 5,
                                shadow: boolean = true, shadowColor: string = '#000000',
                                shadowBlur: number = 4, shadowAngle: number = 0.5236, shadowDistance: number = 6,
                                wordWrap: boolean = false, wordWrapWidth: number = 440 ): boolean {
            
            var fillColor = colorB ? [colorA, colorB] : colorA;

            var style = new PIXI.TextStyle( {
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

            if ( !this.defaultTextStyle ) {
                this.defaultTextStyle = style;
            }
            return true;
        }

        public setDefaultTextStyle( style: PIXI.TextStyle ) {
            this.defaultTextStyle = style;
        }

        public createText( text: string, position: PIXI.Point = null ): string {

            var id = 't' + this.nodeCount++;
            var richText = new PIXI.Text( text, this.defaultTextStyle );
            richText.x = position ? position.x : this.defaultPosition.x;
            richText.y = position ? position.y : this.defaultPosition.y;
            this.stage.addChild( richText );

            this.nodes[id] = { node: richText };
            return id;
        }

        public setDefaultInsertPosition( x: number, y: number ) {
            this.defaultPosition.x = x;
            this.defaultPosition.y = y;
        }

        public clear() {
            for ( var id in this.nodes ) {
                this.stage.removeChild( this.nodes[id].node );
            }
            this.nodes = {};
        }

        private render() {

            var newTime = Date.now();
            var timeDelta = newTime - this.oldTime;
            this.oldTime = newTime;
            this.timeline.update( timeDelta );

            this.renderer.render( this.stage );
        }

        private onTouchDown( event ) {
        }

        private onTouchUp( event ) {
        }

        public onResize( width: number, height: number ) {
            if ( this.renderer ) {
                this.renderer.resize( width, height );
            }
        }

        static update() {
            Renderer.instance.render();
            window.requestAnimationFrame( Renderer.update );
        }

        private renderer: PIXI.SystemRenderer;
        private stage: PIXI.Container;
        private graphics: PIXI.Graphics;

        private textStyles: { [id: string]: PIXI.TextStyle };
        private defaultTextStyle: PIXI.TextStyle;
        private defaultPosition: PIXI.Point;

        private nodes: { [id: string]: RenderElement };
        private nodeCount: number;

        private timeline: djs.Timeline;
        private oldTime: number;
    }
}
