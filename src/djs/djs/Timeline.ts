
///<reference path="../lib/pixi/pixi.js.d.ts"/>
///<reference path="../lib/soundjs/soundjs.d.ts"/>

namespace djs {

    export class Timeline {

        constructor( htmlElement: string ) {

            this.events = new Array<djs.Event>();
            this.time = 0;
            this.soundLoaded = false;
            this.imageLoaded = false;

            this.renderer = new djs.Renderer( this, htmlElement, window.innerWidth, window.innerHeight, true );
        }

        public onResize( width: number, height: number ) {
            this.renderer.onResize( width, height );
        }

        public onDataLoaded( data: any ) {
            // Load events
            var events = data.events;
            for ( var k = 0; k < events.length; k++ ) {
                if ( events[k].length == 5 ) {
                    this.events.push( new djs.EventImageCreation( this, 1000 * events[k][0], 1000 * events[k][1], events[k][2], events[k][3], events[k][4] ) );
                }
                if ( events[k].length == 3 ) {
                    this.events.push( new djs.EventTextCreation( this, 1000 * events[k][0], 1000 * events[k][1], events[k][2] ) );
                }
                else if ( events[k].length == 4 ) {
                    this.events.push( new djs.EventPlayAudio( this, 1000 * events[k][0], events[k][2] ) );
                }
            }

            // Load sound
            var manifest = [
                { id: data.audio, src: this.mediaPath + data.audio },
            ];
            var self = this;
            var queue = new createjs.LoadQueue();
            createjs.Sound.alternateExtensions = ['mp3'];
            queue.installPlugin( createjs.Sound );
            queue.addEventListener( 'fileload', function( event ) {
                self.onSoundLoaded( event );
            });
            queue.addEventListener( 'error', function( event ) {
                self.onSoundError( event );
            });
            queue.loadManifest( manifest );

            // Load image
            var loader = PIXI.loader;
            loader.add( this.mediaPath + data.image );
            loader.load( onAssetsLoaded );
            function onAssetsLoaded() {
                var texture = PIXI.Texture.fromImage( self.mediaPath + data.image, false, 1, 1 );
                self.createImage( texture, 0, 0 );
                self.imageLoaded = true;
            };
        }

        public onSoundLoaded( event ) {
            this.soundLoaded = true;
        }

        public onSoundError( event ) {
            this.soundLoaded = true; // play anyways
            console.warn( 'onSoundError' );
        }

        public load( mediaPath: string, songFile: string ) {

            var self = this;
            this.mediaPath = mediaPath;
            var loader = new PIXI.loaders.Loader();
            loader.add( 'json', mediaPath + songFile );

            loader.load( function( _, res ) {
                self.onDataLoaded( res.json.data );
            });

            this.renderer.createTextStyle( 'default', 'Palatino Linotype', 50, true, true, '#55ffff', '#3366ff' );
            this.renderer.setDefaultInsertPosition( 50, 400 );
        }

        public createText( text: string ): number {
            return this.renderer.createText( text );
        }

        public createImage( texture: PIXI.Texture, x: number, y: number ): number {
            return this.renderer.createImage( texture, new PIXI.Point( x, y ) );
        }

        public playAudio( audioTag: string ) {
            createjs.Sound.play( audioTag, { volume: 0.2 });
        }

        public addEvent( event: Event ) {
            var k = 0;
            while ( ( k < this.events.length ) && ( event.time > this.events[k].time ) ) {
                k++;
            }
            this.events.splice( k, 0, event );
        }

        public deleteNode( idNode: number ) {
            this.renderer.deleteNode( idNode );
        }

        public update( delta: number ) {

            if ( !this.soundLoaded || !this.imageLoaded ) {
                return;
            }

            while ( this.events.length > 0 && ( this.time >= this.events[0].time ) ) {
                this.events[0].onTime();
                this.events.shift();
            }
            this.time += delta;
            this.renderer.render();
        }

        public getTime(): number { return this.time; }

        private time: number;
        private soundLoaded: boolean;
        private imageLoaded: boolean;
        private events: Array<djs.Event>;
        private renderer: djs.Renderer;
        private mediaPath: string;
    }
}