
///<reference path="../lib/pixi/pixi.js.d.ts"/>
///<reference path="../lib/soundjs/soundjs.d.ts"/>

namespace djs {

    export class Timeline {

        constructor( element: string ) {

            this.events = new Array<djs.Event>();
            this.time = 0;
            this.loaded = false;

            this.renderer = new djs.Renderer( element, window.innerWidth, window.innerHeight );
        }

        public onResize( width: number, height: number ) {
            this.renderer.onResize( width, height );
        }

        public onDataLoaded( data: any ) {

            var events = data.events;
            for ( var k = 0; k < events.length; k++ ) {
                if ( events[k].length == 3 ) {
                    this.events.push( new djs.EventTextCreation( this, 1000 * events[k][0], 1000 * events[k][1], events[k][2] ) );
                }
                else {
                    this.events.push( new djs.EventPlayAudio( this, 1000 * events[k][0], events[k][2] ) );
                }
            }

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
        }

        public onSoundLoaded( event ) {
            this.loaded = true;
        }

        public onSoundError( event ) {
            this.loaded = true;
            //console.log( 'onSoundError' );
        }

        public load( mediaPath: string, songFile: string ) {

            var self = this;
            this.mediaPath = mediaPath;
            var loader = new PIXI.loaders.Loader();
            loader.add( 'json', mediaPath + songFile );

            loader.load( function( loader, res ) {
                self.onDataLoaded( res.json.data );
            });

            this.renderer.createTextStyle( 'default', 'Palatino Linotype', 50, true, true, '#55ffff', '#3366ff' );
            this.renderer.setDefaultInsertPosition( 50, 400 );
        }

        public createText( text: string ): number {
            return this.renderer.createText( text );
        }

        public playAudio( audioTag: string ) {
            createjs.Sound.play( audioTag, { volume: 1.0 });
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

            if ( !this.loaded ) {
                return;
            }

            this.renderer.setDebugText( this.time );

            while ( this.events.length > 0 && ( this.time >= this.events[0].time ) ) {
                this.events[0].onTime();
                this.events.shift();
            }
            this.time += delta;
            this.renderer.render();
        }

        private loaded: boolean;
        private time: number;
        private events: Array<djs.Event>;
        private renderer: djs.Renderer;
        private mediaPath: string;
    }
}