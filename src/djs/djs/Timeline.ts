
///<reference path="../lib/pixi/pixi.js.d.ts"/>
///<reference path="../lib/soundjs/soundjs.d.ts"/>

namespace djs {

    export class Timeline {

        private time: number = 0;
        private soundLoaded: boolean = false;
        private imageLoaded: boolean = false;
        private initClick: boolean = false;
        private mediaPath: string = "";

        private events: Array<djs.Event>;
        private renderer: djs.Renderer;

        constructor() {
            this.events = new Array<djs.Event>();
            this.renderer = new djs.Renderer( this, window.innerWidth, window.innerHeight, false );
        }

        public onResize() {
            this.renderer.onResize();
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
                self.onSoundLoaded();
            });
            queue.addEventListener( 'error', function( event ) {
                self.onSoundError();
            });
            queue.loadManifest( manifest );

            // Load image
            var loader = PIXI.Loader.shared;

            loader.add( this.mediaPath + data.image );
            loader.add( "media/filter.jpg" );
            loader.load( onAssetsLoaded );
            function onAssetsLoaded() {
                var texture = PIXI.Texture.from( self.mediaPath + data.image );
                self.createImage( texture, 0, 0 );
                self.imageLoaded = true;
            };
        }

        public onSoundLoaded() {
            this.soundLoaded = true;
        }

        public onSoundError() {
            this.soundLoaded = true; // play anyways
            console.warn( 'onSoundError' );
        }

        public load( mediaPath: string, songFile: string ) {
            var self = this;
            this.mediaPath = mediaPath;

            this.renderer.createTextStyle( 'default', 'Palatino Linotype', 45, true, true, '#55ffff', '#3366ff' );
            this.renderer.setDefaultInsertPosition( 45, 490 );
            const idNode = this.renderer.createText( "Loading..." );

            var loader = PIXI.Loader.shared;
            loader.add( 'json', mediaPath + songFile );
            loader.load( function( _: any, res: any ) {
                self.deleteNode( idNode );
                self.onDataLoaded( res.json.data );
            });
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
            if ( !this.initClick ) {
                return;
            }
            while ( this.events.length > 0 && ( this.time >= this.events[0].time ) ) {
                this.events[0].onTime();
                this.events.shift();
            }
            this.time += delta;
            this.renderer.render();
        }

        public getTime(): number {
            return this.time;
        }

    }
}