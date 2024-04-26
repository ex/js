
module Stc {

    export class PlatformHTML5 implements Platform {
        // UI layout (quantities are expressed in pixels)

        // Screen size
        private static SCREEN_WIDTH = 480;
        private static SCREEN_HEIGHT = 320;

        // Size of square tile
        private static TILE_SIZE = 12;

        // Board up-left corner coordinates
        private static BOARD_X = 180;
        private static BOARD_Y = 28;

        // Preview tetromino position
        private static PREVIEW_X = 112;
        private static PREVIEW_Y = 232;

        // Score position and length on screen
        private static SCORE_X = 72;
        private static SCORE_Y = 86;
        private static SCORE_LENGTH = 10;

        // Lines position and length on screen
        private static LINES_X = 108;
        private static LINES_Y = 68;
        private static LINES_LENGTH = 5;

        // Level position and length on screen
        private static LEVEL_X = 108;
        private static LEVEL_Y = 50;
        private static LEVEL_LENGTH = 5;

        // Tetromino subtotals position
        private static TETROMINO_X = 425;
        private static TETROMINO_L_Y = 79;
        private static TETROMINO_I_Y = 102;
        private static TETROMINO_T_Y = 126;
        private static TETROMINO_S_Y = 150;
        private static TETROMINO_Z_Y = 174;
        private static TETROMINO_O_Y = 198;
        private static TETROMINO_J_Y = 222;

        // Size of subtotals
        private static TETROMINO_LENGTH = 5;

        // Tetromino total position
        private static PIECES_X = 418;
        private static PIECES_Y = 246;
        private static PIECES_LENGTH = 6;

        // Size of number
        private static NUMBER_WIDTH = 7;
        private static NUMBER_HEIGHT = 9;

        // Texture size of compounded images
        private static TEXTURE_SIZE = 512;

        // Frames per seconds
        public static FPS = 35;

        // Touch zones limits
        private static TY_1 = 50;
        private static TY_2 = 270;

        private static TY_DOWN = 70;
        private static TY_DROP = 250;

        private static TX_1 = 160;
        private static TX_2 = 320;

        private static KEY_A = 65;
        private static KEY_W = 87;
        private static KEY_S = 83;
        private static KEY_D = 68;

        private static KEY_SPACE = 32;

        private static KEY_LEFT = 37;
        private static KEY_RIGHT = 39;
        private static KEY_UP = 38;
        private static KEY_DOWN = 40;

        constructor( image: HTMLImageElement ) {

            // http://stackoverflow.com/questions/9038625/detect-if-device-is-ios
            this.m_isIOS = ( navigator.userAgent.match( /(iPad|iPhone|iPod)/i ) ? true : false );

            this.m_image = image;

            // Create background layer.
            var canvasBack = <HTMLCanvasElement>document.createElement( "canvas" );
            canvasBack.width = 480;
            canvasBack.height = 320;
            canvasBack.style.position = "absolute";
            canvasBack.style.left = "0";
            canvasBack.style.top = "0";
            canvasBack.style.zIndex = "0";
            document.body.appendChild( canvasBack );

            // Draw background
            var context = canvasBack.getContext( '2d' );
            if ( context == null ) return;

            context.drawImage( this.m_image, 0, PlatformHTML5.TEXTURE_SIZE - PlatformHTML5.SCREEN_HEIGHT,
                PlatformHTML5.SCREEN_WIDTH, PlatformHTML5.SCREEN_HEIGHT, 0, 0,
                PlatformHTML5.SCREEN_WIDTH, PlatformHTML5.SCREEN_HEIGHT );

            // Create stats layer.
            var canvasStats = <HTMLCanvasElement>document.createElement( "canvas" );
            canvasStats.width = 480;
            canvasStats.height = 320;
            canvasStats.style.position = "absolute";
            canvasStats.style.left = "0";
            canvasStats.style.top = "0";
            canvasStats.style.zIndex = "1";
            document.body.appendChild( canvasStats );
            this.m_canvasStats = canvasStats.getContext( '2d' );

            // Create game layer.
            var canvas = <HTMLCanvasElement>document.createElement( "canvas" );
            canvas.width = 480;
            canvas.height = 320;
            canvas.style.position = "absolute";
            canvas.style.left = "0";
            canvas.style.top = "0";
            canvas.style.zIndex = "2";
            document.body.appendChild( canvas );
            this.m_canvas = canvas.getContext( '2d' );

            // Register events.
            var myself = this;
            function handlerKeyDown( event: any ) {
                myself.onKeyDown( event );
            }
            window.addEventListener( 'keydown', handlerKeyDown, false );

            function handlerKeyUp( event: any ) {
                myself.onKeyUp( event );
            }
            window.addEventListener( 'keyup', handlerKeyUp, false );

            function handlerTouchDown( event: any ) {
                myself.onTouchStart( event );
            }
            if ( this.m_isIOS ) {
                canvas['ontouchstart'] = handlerTouchDown;
            }
            else {
                canvas.onmousedown = handlerTouchDown;
            }

            function handlerTouchEnd( event: any ) {
                myself.onTouchEnd( event );
            }
            if ( this.m_isIOS ) {
                canvas['ontouchend'] = handlerTouchEnd;
            }
            else {
                canvas.onmouseup = handlerTouchEnd;
            }
        }

        private showOverlay( text: string ): void {
            this.m_canvas.globalAlpha = 0.4;
            this.m_canvas.fillStyle = "rgb(0, 0, 0)";
            this.m_canvas.fillRect( 0, 0, PlatformHTML5.SCREEN_WIDTH, PlatformHTML5.SCREEN_HEIGHT );
            this.m_canvas.globalAlpha = 1;

            this.m_canvas.fillStyle = "white";
            this.m_canvas.font = "20px monospace";
            var textWidth = this.m_canvas.measureText( text ).width;
            this.m_canvas.fillText( text, ( PlatformHTML5.SCREEN_WIDTH - textWidth ) / 2, PlatformHTML5.SCREEN_HEIGHT / 2 );
        }

        private onTouchStart( event: any ): void {
            var tx = event.layerX;
            var ty = event.layerY;

            if ( tx < PlatformHTML5.TX_1 ) {
                if ( ty < PlatformHTML5.TY_1 ) {
                    this.m_game.onEventStart( Game.EVENT_RESTART );
                }
                else if ( ty < PlatformHTML5.TY_2 ) {
                    this.m_game.onEventStart( Game.EVENT_MOVE_LEFT );
                }
                else {
                    this.m_game.onEventStart( Game.EVENT_SHOW_NEXT );
                }
            }
            else if ( tx < PlatformHTML5.TX_2 ) {
                if ( ty > PlatformHTML5.TY_DROP ) {
                    this.m_game.onEventStart( Game.EVENT_DROP );
                }
                else if ( ty > PlatformHTML5.TY_DOWN ) {
                    this.m_game.onEventStart( Game.EVENT_MOVE_DOWN );
                }
                else {
                    this.m_game.onEventStart( Game.EVENT_ROTATE_CW );
                }
            }
            else {
                if ( ty < PlatformHTML5.TY_1 ) {
                    if ( !this.m_game.isOver() ) {
                        if ( !this.m_game.isPaused() ) {
                            this.showOverlay( "Game is paused" );
                        }
                        else {
                            // Force redraw.
                            this.m_game.setChanged( true );
                            this.renderGame();
                        }
                        this.m_game.onEventStart( Game.EVENT_PAUSE );
                    }
                }
                else if ( ty < PlatformHTML5.TY_2 ) {
                    this.m_game.onEventStart( Game.EVENT_MOVE_RIGHT );
                }
                else {
                    this.m_game.onEventStart( Game.EVENT_SHOW_SHADOW );
                }
            }
            console.info( "-- touchStart:" + tx + " " + ty );
        }
        // @ts-ignore
        private onTouchEnd( event: any ): void { 
            this.m_game.onEventEnd( Game.EVENT_MOVE_LEFT );
            this.m_game.onEventEnd( Game.EVENT_MOVE_RIGHT );
            this.m_game.onEventEnd( Game.EVENT_MOVE_DOWN );
            this.m_game.onEventEnd( Game.EVENT_ROTATE_CW );
        }

        private onKeyDown( event: any ): void {
            var key = ( event.which ) ? event.which : event.keyCode;

            switch ( key ) {
                case PlatformHTML5.KEY_A:
                case PlatformHTML5.KEY_LEFT:
                    this.m_game.onEventStart( Game.EVENT_MOVE_LEFT );
                    break;
                case PlatformHTML5.KEY_D:
                case PlatformHTML5.KEY_RIGHT:
                    this.m_game.onEventStart( Game.EVENT_MOVE_RIGHT );
                    break;
                case PlatformHTML5.KEY_W:
                case PlatformHTML5.KEY_UP:
                    this.m_game.onEventStart( Game.EVENT_ROTATE_CW );
                    break;
                case PlatformHTML5.KEY_S:
                case PlatformHTML5.KEY_DOWN:
                    this.m_game.onEventStart( Game.EVENT_MOVE_DOWN );
                    break;
                case PlatformHTML5.KEY_SPACE:
                    this.m_game.onEventStart( Game.EVENT_DROP );
                    break;
            }
        }

        private onKeyUp( event: any ): void {
            var key = ( event.which ) ? event.which : event.keyCode;

            switch ( key ) {
                case PlatformHTML5.KEY_LEFT:
                    this.m_game.onEventEnd( Game.EVENT_MOVE_LEFT );
                    break;
                case PlatformHTML5.KEY_RIGHT:
                    this.m_game.onEventEnd( Game.EVENT_MOVE_RIGHT );
                    break;
                case PlatformHTML5.KEY_UP:
                    this.m_game.onEventEnd( Game.EVENT_ROTATE_CW );
                    break;
                case PlatformHTML5.KEY_DOWN:
                    this.m_game.onEventEnd( Game.EVENT_MOVE_DOWN );
                    break;
            }
        }

        // Initializes platform
        public init( game: Game ): number {
            this.m_game = game;
            return Game.ERROR_NONE;
        }

        // Clear resources used by platform
        public end(): void {
            // No really a way to free game resources in garbage collected languages
        }

        // Process events and notify game
        public processEvents(): void {
            // Events are handled by document handlers, nothing to do here.
        }

        // Render the state of the game
        public renderGame(): void {
            var i: number, j: number;

            // Check if the game state has changed, if so redraw
            if ( this.m_game.hasChanged() ) {
                // Clear canvas.
                this.m_canvas.clearRect( 0, 0, PlatformHTML5.SCREEN_WIDTH, PlatformHTML5.SCREEN_HEIGHT );

                // Draw preview block
                if ( this.m_game.showPreview() ) {
                    for ( i = 0; i < Game.TETROMINO_SIZE; ++i ) {
                        for ( j = 0; j < Game.TETROMINO_SIZE; ++j ) {
                            if ( this.m_game.nextBlock().cells[i][j] != Game.EMPTY_CELL ) {
                                this.drawTile( PlatformHTML5.PREVIEW_X + ( PlatformHTML5.TILE_SIZE * i ),
                                    PlatformHTML5.PREVIEW_Y + ( PlatformHTML5.TILE_SIZE * j ),
                                    this.m_game.nextBlock().cells[i][j], false );
                            }
                        }
                    }
                }

                // Draw shadow tetromino
                if ( this.m_game.showShadow() && this.m_game.shadowGap() > 0 ) {
                    for ( i = 0; i < Game.TETROMINO_SIZE; ++i ) {
                        for ( j = 0; j < Game.TETROMINO_SIZE; ++j ) {
                            if ( this.m_game.fallingBlock().cells[i][j] != Game.EMPTY_CELL ) {
                                this.drawTile( PlatformHTML5.BOARD_X + ( PlatformHTML5.TILE_SIZE * ( this.m_game.fallingBlock().x + i ) ),
                                    PlatformHTML5.BOARD_Y + ( PlatformHTML5.TILE_SIZE * ( this.m_game.fallingBlock().y + this.m_game.shadowGap() + j ) ),
                                    this.m_game.fallingBlock().cells[i][j], true );
                            }
                        }
                    }
                }
                // Draw the cells in the board
                for ( i = 0; i < Game.BOARD_TILEMAP_WIDTH; ++i ) {
                    for ( j = 0; j < Game.BOARD_TILEMAP_HEIGHT; ++j ) {
                        if ( this.m_game.getCell( i, j ) != Game.EMPTY_CELL ) {
                            this.drawTile( PlatformHTML5.BOARD_X + ( PlatformHTML5.TILE_SIZE * i ),
                                PlatformHTML5.BOARD_Y + ( PlatformHTML5.TILE_SIZE * j ),
                                this.m_game.getCell( i, j ), false );
                        }
                    }
                }

                // Draw falling tetromino
                for ( i = 0; i < Game.TETROMINO_SIZE; ++i ) {
                    for ( j = 0; j < Game.TETROMINO_SIZE; ++j ) {
                        if ( this.m_game.fallingBlock().cells[i][j] != Game.EMPTY_CELL ) {
                            this.drawTile( PlatformHTML5.BOARD_X + ( PlatformHTML5.TILE_SIZE * ( this.m_game.fallingBlock().x + i ) ),
                                PlatformHTML5.BOARD_Y + ( PlatformHTML5.TILE_SIZE * ( this.m_game.fallingBlock().y + j ) ),
                                this.m_game.fallingBlock().cells[i][j], false );
                        }
                    }
                }

                // Draw game statistic data
                if ( !this.m_game.isPaused() ) {
                    // Clear stats canvas.
                    this.m_canvasStats.clearRect( 0, 0, PlatformHTML5.SCREEN_WIDTH, PlatformHTML5.SCREEN_HEIGHT );

                    this.drawNumber( PlatformHTML5.LEVEL_X, PlatformHTML5.LEVEL_Y, this.m_game.stats().level, PlatformHTML5.LEVEL_LENGTH, Game.COLOR_WHITE );
                    this.drawNumber( PlatformHTML5.LINES_X, PlatformHTML5.LINES_Y, this.m_game.stats().lines, PlatformHTML5.LINES_LENGTH, Game.COLOR_WHITE );
                    this.drawNumber( PlatformHTML5.SCORE_X, PlatformHTML5.SCORE_Y, this.m_game.stats().score, PlatformHTML5.SCORE_LENGTH, Game.COLOR_WHITE );

                    this.drawNumber( PlatformHTML5.TETROMINO_X, PlatformHTML5.TETROMINO_L_Y, this.m_game.stats().pieces[Game.TETROMINO_L], PlatformHTML5.TETROMINO_LENGTH, Game.COLOR_ORANGE );
                    this.drawNumber( PlatformHTML5.TETROMINO_X, PlatformHTML5.TETROMINO_I_Y, this.m_game.stats().pieces[Game.TETROMINO_I], PlatformHTML5.TETROMINO_LENGTH, Game.COLOR_CYAN );
                    this.drawNumber( PlatformHTML5.TETROMINO_X, PlatformHTML5.TETROMINO_T_Y, this.m_game.stats().pieces[Game.TETROMINO_T], PlatformHTML5.TETROMINO_LENGTH, Game.COLOR_PURPLE );
                    this.drawNumber( PlatformHTML5.TETROMINO_X, PlatformHTML5.TETROMINO_S_Y, this.m_game.stats().pieces[Game.TETROMINO_S], PlatformHTML5.TETROMINO_LENGTH, Game.COLOR_GREEN );
                    this.drawNumber( PlatformHTML5.TETROMINO_X, PlatformHTML5.TETROMINO_Z_Y, this.m_game.stats().pieces[Game.TETROMINO_Z], PlatformHTML5.TETROMINO_LENGTH, Game.COLOR_RED );
                    this.drawNumber( PlatformHTML5.TETROMINO_X, PlatformHTML5.TETROMINO_O_Y, this.m_game.stats().pieces[Game.TETROMINO_O], PlatformHTML5.TETROMINO_LENGTH, Game.COLOR_YELLOW );
                    this.drawNumber( PlatformHTML5.TETROMINO_X, PlatformHTML5.TETROMINO_J_Y, this.m_game.stats().pieces[Game.TETROMINO_J], PlatformHTML5.TETROMINO_LENGTH, Game.COLOR_BLUE );

                    this.drawNumber( PlatformHTML5.PIECES_X, PlatformHTML5.PIECES_Y, this.m_game.stats().totalPieces, PlatformHTML5.PIECES_LENGTH, Game.COLOR_WHITE );
                }

                if ( this.m_game.isOver() ) {
                    this.showOverlay( "Game is over" );
                }

                // Inform the game that we are done with the changed state
                this.m_game.onChangeProcessed();
            }

        }

        // Return the current system time in milliseconds
        public getSystemTime(): number {
            return Date.now();
        }

        // Return a random positive integer number
        public random(): number {
            // JavaScript maximum integer number is 2^53 = 9007199254740992.
            return Math.floor( 9007199254740992 * Math.random() );
        }

        private drawTile( x: number, y: number, tile: number, shadow: boolean ): void {
            this.m_canvas.drawImage( this.m_image,
                PlatformHTML5.TILE_SIZE * ( shadow ? Game.TETROMINO_TYPES + tile + 1 : tile ), 0,
                PlatformHTML5.TILE_SIZE, PlatformHTML5.TILE_SIZE, x, y,
                PlatformHTML5.TILE_SIZE, PlatformHTML5.TILE_SIZE );
        }

        private drawNumber( x: number, y: number, value: number, length: number, color: number ): void {
            var pos = 0;
            do {
                this.m_canvasStats.drawImage( this.m_image,
                    PlatformHTML5.NUMBER_WIDTH * ( value % 10 ),
                    1 + PlatformHTML5.TILE_SIZE + PlatformHTML5.NUMBER_HEIGHT * color,
                    PlatformHTML5.NUMBER_WIDTH, PlatformHTML5.NUMBER_HEIGHT,
                    x + PlatformHTML5.NUMBER_WIDTH * ( length - pos ), y,
                    PlatformHTML5.NUMBER_WIDTH, PlatformHTML5.NUMBER_HEIGHT );

                value = Math.floor( value / 10 );
            } while ( ++pos < length );
        }

        private m_game!: Game;
        private m_canvasStats: any;
        private m_canvas: any;
        private m_image: HTMLImageElement;

        private m_isIOS: boolean;
    }
}
