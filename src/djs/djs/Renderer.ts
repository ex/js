﻿
///<reference path="../lib/pixi/pixi.js.d.ts"/>

namespace djs {

    export type RenderElement = {
        node: PIXI.Text;
    }

    export class Renderer {

        constructor( element: string, width: number, height: number ) {

            var el = document.getElementById( element );
            var app = new PIXI.Application( width, height, { backgroundColor: 0x104090 });
            el.appendChild( app.view );
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
            this.defaultPosition = new PIXI.Point();

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

        public createText( text: string, position: PIXI.Point = null ): number {

            var id = this.nodeCount++;
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

        public deleteNode( idNode: number ) {
            if ( this.nodes[idNode] ) {
                this.stage.removeChild( this.nodes[idNode].node );
                this.nodes[idNode] = null;
            }
        }

        public setDebugText( text ) {
            this.debugText.text = text;
        }

        public render() {
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

        private renderer: PIXI.SystemRenderer;
        private stage: PIXI.Container;
        private graphics: PIXI.Graphics;

        private textStyles: { [id: string]: PIXI.TextStyle };
        private defaultTextStyle: PIXI.TextStyle;
        private defaultPosition: PIXI.Point;

        private nodes: { [id: number]: RenderElement };
        private nodeCount: number;

        private debugText: PIXI.Text;
    }
}