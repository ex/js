
goog.provide( 'DrawTweet.start' );

goog.require( 'goog.object' );
goog.require( 'goog.ui.CustomButton' );
goog.require( 'goog.ui.ButtonRenderer' );
goog.require( 'goog.ui.Component.EventType' );
goog.require( 'goog.ui.Select' );
goog.require( 'goog.ui.Textarea' );

var ctx;
var canvasWidth;
var canvasHeight;
var textRed;
var textGreen;
var textBlue;

function hexColor( c ) {
    return ( c > 16 ) ? c.toString( 16 ) : ( c > 0 ) ? '0' + c.toString( 16 ) : '00';
}

function redraw() {
    var i, j;
    var canvasData = ctx.getImageData( 0, 0, canvasWidth, canvasHeight );

    if ( canvasData ) {
        for ( j = 0; j < canvasHeight; j++ ) {
            for ( i = 0; i < canvasWidth; i++ ) {
                var index = ( i + j * canvasWidth ) * 4;
                canvasData.data[index + 0] = window['red']( 2 * i, 2 * j ) & 255;
                canvasData.data[index + 1] = window['green']( 2 * i, 2 * j ) & 255;
                canvasData.data[index + 2] = window['blue']( 2 * i, 2 * j ) & 255;
                canvasData.data[index + 3] = 255;
            }
        }
        ctx.putImageData( canvasData, 0, 0 );
    }
    else {
        for ( j = 0; j < canvasHeight; j++ ) {
            for ( i = 0; i < canvasWidth; i++ ) {
                ctx.fillStyle = '#' + hexColor( window['red']( i, j ) ) + hexColor( window['green']( i, j ) )
                                    + hexColor( window['blue']( i, j ) );
                ctx.fillRect( i, j, 1, 1 );
            }
        }
    }
}

function onSelectEquation( index ) {
    window['red'] = window['redFunctions'][index];
    window['green'] = window['greenFunctions'][index];
    window['blue'] = window['blueFunctions'][index];
    textRed.setContent( window['red'].toString() );
    textGreen.setContent( window['green'].toString() );
    textBlue.setContent( window['blue'].toString() );
    redraw();
}

function onCompileEquations() {
    try {
        window['red'] = eval( "(" + textRed.getValue() + ")" );
    }
    catch ( e ) {
        alert( "Error in Red function:\n" + e );
        return;
    };
    try {
        window['green'] = eval( "(" + textGreen.getValue() + ")" );
    }
    catch ( e ) {
        alert( "Error in Green function:\n" + e );
        return;
    };
    try {
        window['blue'] = eval( "(" + textBlue.getValue() + ")" );
    }
    catch ( e ) {
        alert( "Error in Blue function:\n" + e );
        return;
    };
    redraw();
}

DrawTweet.start = function () {

    var btnRun = new goog.ui.CustomButton( 'Redraw canvas' );
    btnRun.render( goog.dom.getElement( 'btnRun' ) );
    btnRun.setTooltip( 'Press to redraw canvas with current functions.' );

    goog.events.listen( btnRun, goog.ui.Component.EventType.ACTION,
        function ( e ) {
            onCompileEquations();
        } );

    var minHeight = 100;
    textRed = new goog.ui.Textarea();
    textRed.setMinHeight( minHeight );
    textRed.decorate( goog.dom.getElement( 'textRed' ) );

    textGreen = new goog.ui.Textarea();
    textGreen.setMinHeight( minHeight );
    textGreen.decorate( goog.dom.getElement( 'textGreen' ) );

    textBlue = new goog.ui.Textarea();
    textBlue.setMinHeight( minHeight );
    textBlue.decorate( goog.dom.getElement( 'textBlue' ) );

    var canvas = document.getElementById( "canvas" );
    if ( canvas ) {
        canvasWidth = canvas.width;
        canvasHeight = canvas.height;
        if ( canvas.getContext ) {
            ctx = canvas.getContext( "2d" );
            onSelectEquation( 0 );
        }
    }

    var selectEquations = new goog.ui.Select();
    for ( var k = 0; k < nameFunctions.length; k++ ) {
        selectEquations.addItem( new goog.ui.MenuItem( nameFunctions[k] ) );
    }
    selectEquations.render( goog.dom.getElement( 'selectEquations' ) );
    selectEquations.setSelectedIndex( 0 );

    goog.events.listen( selectEquations, goog.ui.Component.EventType.ACTION,
        function ( e ) {
            var select = e.target;
            var index = select.getSelectedIndex();
            onSelectEquation( index );
        } );
}

goog.exportSymbol( 'DrawTweet.start', DrawTweet.start );

