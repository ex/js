
Pascal = function ( canvasName, colors, lineColor, borderColor, backColor, textColor ) {

    this.TIME_SHOW = 1000;
    this.TIME_FADE = 100;
    this.ALPHA_DECREASE = 0.011;

    this.ST_DRAW = 0;
    this.ST_DELETE_CENTER = 1;
    this.ST_SHOW = 2;
    this.ST_FADE = 3;

    this.PRIMES = [
        11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 97, 101, 103, 107, 109, 113,
        128, 131, 137, 139, 149, 151, 157, 163, 167, 169, 173, 179, 181, 191, 193, 197, 211, 223, 227, 229,
        233, 239, 241, 243, 251, 254, 256, 257, 263, 269, 271, 277, 281, 283, 289, 293, 307, 311
    ];

    var canvas = document.getElementById( canvasName );
    if ( !canvas || !canvas.getContext ) {
        return;
    }
    this.m_context = canvas.getContext( '2d' );
    this.m_state = this.ST_DRAW;
    this.m_colors = colors;
    this.m_lineColor = lineColor;
    this.m_borderColor = borderColor;
    this.m_backColor = backColor;
    this.m_textColor = textColor;

    this.m_halfWidth = 0;
    this.m_halfHeight = 0;
    this.m_cellSize = 0;
    this.m_nextOrder = 0;
    this.m_cells = 0;
    this.m_array = null;

    this.m_row = 0;	// File to draw
    this.m_color = 0;	// Random index color

    this.m_alphaBack = 1;

    this.m_halfWidth = Math.floor( canvas.width / 2 )
    this.m_halfHeight = Math.floor( canvas.height / 2 );
    this.m_cellSize = 3;
    this.m_cells = Math.floor( this.m_halfHeight / this.m_cellSize ); // number of cells

    this.m_backCanvas = this.createCanvas( this.m_halfWidth, this.m_halfHeight );
    this.m_frontCanvas = this.createCanvas( this.m_halfWidth, this.m_halfHeight );
    this.m_borderCanvas = this.createCanvas( this.m_halfWidth, this.m_halfHeight );

    this.m_frontContext = this.m_frontCanvas.getContext( '2d' );
    this.m_boderContext = this.m_borderCanvas.getContext( '2d' );
    this.m_backContext = this.m_backCanvas.getContext( '2d' );

    this.m_context.fillStyle = this.m_backColor;
    this.m_context.fillRect( 0, 0, 2 * this.m_halfWidth, 2 * this.m_halfHeight );
    this.m_context.fillStyle = textColor;
    this.m_context.font = '12px Verdana';
    this.m_context.fillText( 'Loading...', this.m_halfWidth - 30, this.m_halfHeight - 5 );
}

Pascal.prototype.setReady = function setReady() {
    this.m_context.fillStyle = this.m_backColor;
    this.m_context.fillRect( 0, 0, 2 * this.m_halfWidth, 2 * this.m_halfHeight );
    this.m_context.fillStyle = this.m_textColor;
    this.m_context.font = '12px Verdana';
    this.m_context.fillText( 'Code: Laurens Rodriguez', this.m_halfWidth - 80, this.m_halfHeight - 20 );
    this.m_context.fillText( 'Music: Micky Gonzalez', this.m_halfWidth - 80, this.m_halfHeight - 5 );
    this.m_context.fillText( "Click to play", this.m_halfWidth - 80, this.m_halfHeight + 10 );
};

Pascal.prototype.start = function start() {
    this.m_nextOrder = this.getNextOrder();
    this.makeTriangle();
    setInterval( this.update.bind( this ), 1000 / 35 );
};

Pascal.prototype.getNextOrder = function getNextOrder() {
    var num = 2 + Math.floor( Math.random() * this.m_cells );
    while ( ( num > 2 ) && ( ( num == this.m_nextOrder ) || ( this.binaryFind( num, this.PRIMES ) >= 0 ) ) ) {
        num--;
    }
    return num;
};

Pascal.prototype.makeTriangle = function makeTriangle() {
    if ( this.m_array != null ) {
        this.m_array = null;
    }
    this.m_array = new Array();
    this.m_array[0] = new Array();
    this.m_array[0].push( 1 );
    for ( var p = 1; p < this.m_cells; p++ ) {
        this.m_array[p] = new Array();
        this.m_array[p].push( 1 );
        for ( var q = 0; q < this.m_array[p - 1].length - 1; q++ ) {
            this.m_array[p].push(( this.m_array[p - 1][q] + this.m_array[p - 1][q + 1] ) % this.m_nextOrder );
        }
        this.m_array[p].push( 1 );
    }
    for ( p = this.m_cells; p < 2 * this.m_cells - 1; p++ ) {
        this.m_array[p] = new Array();
        for ( q = 0; q < this.m_array[p - 1].length - 1; q++ ) {
            this.m_array[p].push(( this.m_array[p - 1][q] + this.m_array[p - 1][q + 1] ) % this.m_nextOrder );
        }
    }
};

Pascal.prototype.drawBorderSquare = function drawBorderSquare( x, y, size ) {
    this.m_boderContext.fillStyle = this.m_lineColor;
    this.m_boderContext.fillRect( x + 1, y + 1, size, size );
};

Pascal.prototype.drawBox = function drawBox( x, y, size, colorIndex, offsetColor ) {
    this.m_frontContext.strokeStyle = this.m_borderColor;
    this.m_frontContext.strokeRect( x + 0.5, y + 0.5, size, size );
    this.m_frontContext.fillStyle = '#' + this.m_colors[( colorIndex + offsetColor ) % this.m_colors.length];
    this.m_frontContext.fillRect( x + 1, y + 1, size - 1, size - 1 );
};

Pascal.prototype.onFade = function onFade() {
    this.m_state = this.ST_FADE;
    setTimeout( this.onRedraw.bind( this ), this.TIME_FADE );
};

Pascal.prototype.onRedraw = function onRedraw() {
    this.m_nextOrder = this.getNextOrder();
    this.makeTriangle();
    this.m_row = 0;
    this.m_color = Math.floor( Math.random() * this.m_array.length );
    this.m_state = this.ST_DRAW;
};

Pascal.prototype.update = function update() {
    switch ( this.m_state ) {
        case this.ST_DRAW:
            if ( this.m_row >= this.m_array.length ) {
                this.m_alphaBack = 1;
                this.m_backContext.clearRect( 0, 0, this.m_halfWidth, this.m_halfHeight );
                // Swap front and back canvas.
                var temp = this.m_frontCanvas;
                this.m_frontCanvas = this.m_backCanvas;
                this.m_backCanvas = temp;
                temp = this.m_frontContext;
                this.m_frontContext = this.m_backContext;
                this.m_backContext = temp;
                this.m_state = this.ST_DELETE_CENTER;
                setTimeout( this.onFade.bind( this ), this.TIME_SHOW );
            }
            else {
                this.redrawBmps();
                this.m_row++;
                if ( ( this.m_row % 2 ) && ( this.m_alphaBack > 0 ) ) {
                    this.m_alphaBack -= this.ALPHA_DECREASE;
                }
            }
            break;

        case this.ST_DELETE_CENTER:
            this.m_boderContext.clearRect( 0, 0, this.m_halfWidth, this.m_halfHeight );
            this.m_state = this.ST_SHOW;
            break;

        case this.ST_FADE:
            this.m_alphaBack -= this.ALPHA_DECREASE;
            break;

        case this.ST_SHOW:
            return;
    }

    this.m_context.fillStyle = this.m_backColor;
    this.m_context.fillRect( 0, 0, 2 * this.m_halfWidth, 2 * this.m_halfHeight );
    this.m_context.save();
    for ( var k = 0; k < 4; k++ ) {
        this.m_context.setTransform( k < 2 ? -1 : 1, 0, 0, k % 2 ? -1 : 1, this.m_halfWidth, this.m_halfHeight );
        this.m_context.globalAlpha = this.m_alphaBack;
        this.m_context.drawImage( this.m_backCanvas, 0, 0 );
        this.m_context.globalAlpha = 1;
        this.m_context.drawImage( this.m_frontCanvas, 0, 0 );
        this.m_context.drawImage( this.m_borderCanvas, 0, 0 );
    }
    this.m_context.restore();
};

Pascal.prototype.redrawBmps = function redrawBmps() {
    var p = this.m_row;
    this.m_boderContext.clearRect( 0, 0, this.m_halfWidth, this.m_halfHeight );
    if ( p < this.m_cells ) {
        for ( var q = 0; q < this.m_array[p].length; q++ ) {
            if ( this.m_array[p][q] ) {
                this.drawBorderSquare( q * this.m_cellSize,
                                       ( this.m_array[p].length - q - 1 ) * this.m_cellSize, this.m_cellSize );
                this.drawBox( q * this.m_cellSize, ( this.m_array[p].length - q - 1 ) * this.m_cellSize,
                              this.m_cellSize, this.m_array[p][q], this.m_color );
            }
        }
    }
    else {
        for ( q = 0; q < this.m_array[p].length; q++ ) {
            if ( this.m_array[p][q] ) {
                this.drawBorderSquare( ( p + q - this.m_cells + 1 ) * this.m_cellSize,
                                       ( this.m_cells - q - 1 ) * this.m_cellSize, this.m_cellSize );
                this.drawBox(( p + q - this.m_cells + 1 ) * this.m_cellSize, ( this.m_cells - q - 1 ) * this.m_cellSize,
                               this.m_cellSize, this.m_array[p][q], this.m_color );
            }
        }
    }
};

Pascal.prototype.createCanvas = function createCanvas( width, height ) {
    var canvas = document.createElement( 'canvas' );
    canvas.width = width;
    canvas.height = height;
    return canvas;
};

Pascal.prototype.binaryFind = function binaryFind( value, array ) {
    var a = 0;
    var b = array.length - 1;
    var c;
    while ( a <= b ) {
        c = a + Math.floor(( b - a ) / 2 );
        if ( array[c] == value ) {
            return c;
        }
        else {
            if ( array[c] > value ) {
                b = c - 1;
            } else {
                a = c + 1;
            }
        }
    }
    return -1;
};
