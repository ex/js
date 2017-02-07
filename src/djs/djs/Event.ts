
namespace djs {

    export class Event {

        public time: number;

        constructor( timeStart: number, timeline: djs.Timeline ) {

            this.time = timeStart;
            this.timeline = timeline;
        }

        public onTime() {
        }

        protected modifiers: Array<Modifier>;
        protected timeline: djs.Timeline
    }

    export class EventTextCreation extends Event {

        constructor( timeStart: number, timeline: djs.Timeline, text: string ) {
            super( timeStart, timeline );
            this.text = text;
        }

        public onTime() {
            this.timeline.createText( this.text );
        }

        protected text: string;
    }
}