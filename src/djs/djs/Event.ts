
namespace djs {

    export class Event {

        public time: number;

        constructor( timeline: djs.Timeline, timeStart: number ) {

            this.time = timeStart;
            this.timeline = timeline;
        }

        public onTime() { };

        protected modifiers: Array<Modifier>;
        protected timeline: djs.Timeline
    }

    export class EventTextCreation extends Event {

        constructor( timeline: djs.Timeline, timeStart: number, timeEnd: number, text: string ) {
            super( timeline, timeStart );
            this.text = text;
            this.timeEnd = timeEnd;
        }

        public onTime() {
            var id = this.timeline.createText( this.text );
            this.timeline.addEvent( new EventDeletion( this.timeline, this.timeEnd, id ) );
        }

        protected text: string;
        protected timeEnd: number;
    }

    export class EventImageCreation extends Event {

        constructor( timeline: djs.Timeline, timeStart: number, timeEnd: number, imageTag: string, x: number, y: number ) {
            super( timeline, timeStart );
            this.image = imageTag;
            this.x = x;
            this.y = y;
            this.timeEnd = timeEnd;
        }

        public onTime() {
            //var id = this.timeline.createImage( this.image, this.x, this.y );
            //this.timeline.addEvent( new EventDeletion( this.timeline, this.timeEnd, id ) );
        }

        protected image: string;
        protected x: number;
        protected y: number;
        protected timeEnd: number;
    }

    export class EventPlayAudio extends Event {

        constructor( timeline: djs.Timeline, timeStart: number, audioTag: string ) {
            super( timeline, timeStart );
            this.audio = audioTag;
        }

        public onTime() {
            this.timeline.playAudio( this.audio );
        }

        protected audio: string;
    }

    export class EventDeletion extends Event {

        constructor( timeline: djs.Timeline, timeStart: number, idNode: number ) {
            super( timeline, timeStart );
            this.idNode = idNode;
        }

        public onTime() {
            this.timeline.deleteNode( this.idNode );
        }

        protected idNode: number;
    }
}