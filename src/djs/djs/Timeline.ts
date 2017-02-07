
namespace djs {

    export class Timeline {

        constructor( renderer: djs.Renderer ) {

            this.renderer = renderer;
            this.events = new Array<djs.Event>();
            this.time = 0;

            this.load();
        }

        public load() {

            var events:any = [
                [18.29, 'Ayer un árbol'],
                [20.79, 'cuidó de mi'],
                [22.93, 'acarició'],
                [25.44, 'un sueño mio.'],
                [27.42, 'Si en verdad'],
                [29.80, 'existe Dios'],
                [31.80, 'sólo lo vi'],
                [34.01, 'a través de él.'],
                [45.91, 'Tiempo es todo'],
                [48.25, 'lo que nos queda'],
                [50.56, 'por ti sería'],
                [52.68, 'esa mujer.'],
                [55.11, 'Y tomé el riesgo'],
                [57.42, 'de no ser libre'],
                [59.71, 'tanto hay que andar'],
                [61.98, 'para encontrarte al fin.'],
                [73.39, 'Estoy aquí'],
                [75.69, 'puedo planear'],
                [77.78, 'sobre tu mar'],
                [80.25, 'sin el riesgo de caer'],
                [86.53, 'a tus pies.'],
                [100.82, 'Si renuncié'],
                [102.84, 'a mi corazón'],
                [104.60, 'fue sólo'],
                [106.54, 'cuando estuve herida.'],
                [109.97, 'Rayos y truenos'],
                [112.24, 'vienen por mi'],
                [114.54, 'rompen mis olas'],
                [116.87, 'llévame ahora.'],
                [128.30, 'Me veo durmiendo'],
                [130.54, 'en tu humedad'],
                [132.86, 'fuego que quema'],
                [135.11, 'cielo que espera.'],
                [137.39, 'Y si despierto'],
                [139.67, 'hoy de este sueño'],
                [141.96, 'madre maestra'],
                [144.25, 'dile que vuelva.'],
                [150.02, 'Estoy cayendo'],
                [154.54, 'y no te das cuenta.'],
            ];

            for ( var k = 0; k < events.length; k++ ) {
                this.events.push( new djs.EventTextCreation( 1000 * events[k][0], this, events[k][1] ) );
            }

            this.renderer.createTextStyle( 'default', 'Palatino Linotype', 50, true, true, '#55ffff', '#3366ff' );
            this.renderer.setDefaultInsertPosition( 50, 500 );
        }

        public createText( text: string ) {
            this.renderer.clear();
            this.renderer.createText( text );
        }

        public update( delta: number ) {
            this.time += delta;
            while ( this.events.length > 0 && ( this.time >= this.events[0].time ) ) {
                this.events[0].onTime();
                this.events.shift();
            }
        }

        private time: number;
        private events: Array<djs.Event>;
        private renderer: djs.Renderer;
    }
}