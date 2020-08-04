
namespace djs {

    export class Modifier {

        constructor() {
            this.duration = 0;
        }

        protected onStart(): void {
        }

        protected onEnd(): void {
        }

        protected duration: number;
    }
}