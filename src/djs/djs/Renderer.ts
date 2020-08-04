
///<reference path="../lib/pixi/pixi.js.d.ts"/>

namespace djs {

    export type RenderElement = {
        node: PIXI.Text;
    }

    export class Renderer {

        constructor( parent: djs.Timeline, htmlElement: string, width: number, height: number, debug: boolean ) {

            this.parent = parent;
            var app = new PIXI.Application( { width: width, height: height, backgroundColor: 0 } );

            var el = document.getElementById(htmlElement);
            if ( el ) {
                el.appendChild( app.view );
            }
            this.stage = app.stage;
            this.renderer = app.renderer;

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
            this.debugMode = debug;
            this.defaultPosition = new PIXI.Point();

            if (this.debugMode )
            {
                // Debug text
                var style = new PIXI.TextStyle( {
                    fontFamily: 'Lucida Console',
                    fontSize: 18,
                    fill: '#FF0000',
                });
                this.debugText = new PIXI.Text( '', style );
                this.debugText.x = 10;
                this.debugText.y = 10;
                this.stage.addChild( this.debugText );
            }
        }

        public createTextStyle( name: string, font: string, size: number,
                                italic: boolean, bold: boolean,
                                colorA: string, colorB?: string,
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

        public createText( text: string, position?: PIXI.Point ): number {

            var id = this.nodeCount++;
            var richText = new PIXI.Text( text, this.defaultTextStyle );
            richText.x = position ? position.x : this.defaultPosition.x;
            richText.y = position ? position.y : this.defaultPosition.y;
            this.stage.addChild( richText );

            this.nodes[id] = { node: richText };
            return id;
        }

        public createImage( texture: PIXI.Texture, position?: PIXI.Point ): number {

            var id = this.nodeCount++;

            var sprite = new PIXI.Sprite( texture );
            this.stage.addChild( sprite )

            //this.nodes[id] = { node: sprite };
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

        public deleteNode( idNode: number ) {
            if ( this.nodes[idNode] ) {
                this.stage.removeChild( this.nodes[idNode].node );
                delete this.nodes[idNode];
            }
        }

        public setDebugText( text: string ) {
            if ( this.debugText ) {
                this.debugText.text = text;
            }
        }

        public render() {
            this.renderer.render( this.stage );
            if ( this.debugMode ) {
                this.setDebugText( this.parent.getTime().toString( 10 ) );
            }
        }

        private onTouchDown() {
        }

        private onTouchUp() {
        }

        public onResize() {
            const vpw = window.innerWidth; // Width of the viewport
            const vph = window.innerHeight; // Height of the viewport
            let nvw; // New game width
            let nvh; // New game height
        
            // The aspect ratio is the ratio of the screen's sizes in different dimensions.
            // The height-to-width aspect ratio of the game is HEIGHT / WIDTH.
        
            if ( vph / vpw < this.HEIGHT /this. WIDTH ) {
              // If height-to-width ratio of the viewport is less than the height-to-width ratio
              // of the game, then the height will be equal to the height of the viewport, and
              // the width will be scaled.
              nvh = vph;
              nvw = ( nvh * this.WIDTH ) / this.HEIGHT;
            } else {
              // In the else case, the opposite is happening.
              nvw = vpw;
              nvh = ( nvw * this.HEIGHT ) / this.WIDTH;
            }
        
            // Set the game screen size to the new values.
            // This command only makes the screen bigger --- it does not scale the contents of the game.
            // There will be a lot of extra room --- or missing room --- if we don't scale the stage.
            this.renderer.resize( nvw, nvh );

            // This command scales the stage to fit the new size of the game.
            this.stage.scale.set( nvw / this.WIDTH, nvh / this.HEIGHT );
        }

        private renderer: PIXI.Renderer;
        private stage: PIXI.Container;
        private graphics: PIXI.Graphics;

        private textStyles: { [id: string]: PIXI.TextStyle };
        private defaultTextStyle?: PIXI.TextStyle;
        private defaultPosition: PIXI.Point;

        private nodes: { [id: number]: RenderElement };
        private nodeCount: number;

        private debugText?: PIXI.Text;
        private debugMode: boolean;
        private parent: djs.Timeline;

        readonly WIDTH = 960;
        readonly HEIGHT = 600;
    }
}
