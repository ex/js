//------------------------------------------------------------------------------
ZebraPuzzle = function ( canvas ) {

    // Initial state
    this.colors = ['Red', 'Blue', 'White', 'Yellow', 'Green'];
    this.nations = ['Spain', 'Japan', 'Italy', 'England', 'Norway'];
    this.jobs = ['Violinist', 'Physician', 'Photographer', 'Painter', 'Diplomat'];
    this.pets = ['Fox', 'Snail', 'Zebra', 'Dog', 'Horse'];
    this.drinks = ['Coffee', 'Milk', 'Water', 'Juice', 'Tea'];

    this.m_image = document.getElementById( "zebra_sprites" );

    if ( !canvas || !canvas.getContext || !this.m_image ) {
        return;
    }
    this.m_canvas = canvas;
    this.m_context = canvas.getContext( '2d' );

    this.m_row = -1;
    this.m_col = -1;

    // Register events
    var myself = this;
    function handlerClick( event ) {
        var rect = canvas.getBoundingClientRect();
        myself.onClick( event.clientX - rect.left, event.clientY - rect.top );
    }
    canvas.addEventListener( 'click', handlerClick, false );

    // Set layout
    this.m_width = canvas.width = 350;
    canvas.height = 265 + 240;

    var conditions = [];
    conditions.push( new PuzzleCondition( this.m_context, 'The Englishman lives in the red house', 0, 350, function () {
        return myself.nations.indexOf( 'England' ) === myself.colors.indexOf( 'Red' );
    } ) );
    conditions.push( new PuzzleCondition( this.m_context, 'The Spaniard owns a dog', 1, 350, function () {
        return myself.nations.indexOf( 'Spain' ) === myself.pets.indexOf( 'Dog' );
    } ) );
    conditions.push( new PuzzleCondition( this.m_context, 'The Japanese man is a painter', 2, 350, function () {
        return myself.nations.indexOf( 'Japan' ) === myself.jobs.indexOf( 'Painter' );
    } ) );
    conditions.push( new PuzzleCondition( this.m_context, 'The Italian drinks tea', 3, 350, function () {
        return myself.nations.indexOf( 'Italy' ) === myself.drinks.indexOf( 'Tea' );
    } ) );
    conditions.push( new PuzzleCondition( this.m_context, 'The Norwegian lives in the first house on the left', 4, 350, function () {
        return myself.nations.indexOf( 'Norway' ) === 0;
    } ) );
    conditions.push( new PuzzleCondition( this.m_context, 'The green house is on the right of the white one', 5, 350, function () {
        return myself.colors.indexOf( 'Green' ) === myself.colors.indexOf( 'White' ) + 1;
    } ) );
    conditions.push( new PuzzleCondition( this.m_context, 'The photographer breeds snails', 6, 350, function () {
        return myself.jobs.indexOf( 'Photographer' ) === myself.pets.indexOf( 'Snail' );
    } ) );
    conditions.push( new PuzzleCondition( this.m_context, 'The diplomat lives in the yellow house', 7, 350, function () {
        return myself.jobs.indexOf( 'Diplomat' ) === myself.colors.indexOf( 'Yellow' );
    } ) );
    conditions.push( new PuzzleCondition( this.m_context, 'Milk is drunk in the middle house', 8, 350, function () {
        return myself.drinks.indexOf( 'Milk' ) === 2;
    } ) );
    conditions.push( new PuzzleCondition( this.m_context, 'The owner of the green house drinks coffee', 9, 350, function () {
        return myself.colors.indexOf( 'Green' ) === myself.drinks.indexOf( 'Coffee' )
    } ) );
    conditions.push( new PuzzleCondition( this.m_context, 'The Norwegian’s house is next to the blue one', 10, 350, function () {
        return ( ( myself.nations.indexOf( 'Norway' ) === myself.colors.indexOf( 'Blue' ) + 1 )
              || ( myself.nations.indexOf( 'Norway' ) === myself.colors.indexOf( 'Blue' ) - 1 ) );
    } ) );
    conditions.push( new PuzzleCondition( this.m_context, 'The violinist drinks orange juice', 11, 350, function () {
        return myself.jobs.indexOf( 'Violinist' ) === myself.drinks.indexOf( 'Juice' )
    } ) );
    conditions.push( new PuzzleCondition( this.m_context, 'The fox is in a house next to that of the physician', 12, 350, function () {
        return ( ( myself.pets.indexOf( 'Fox' ) === myself.jobs.indexOf( 'Physician' ) + 1 )
              || ( myself.pets.indexOf( 'Fox' ) === myself.jobs.indexOf( 'Physician' ) - 1 ) );
    } ) );
    this.m_conditions = conditions;

    this.render();
}

ZebraPuzzle.prototype.render = function () {

    this.m_context.clearRect( 0, 0, this.m_canvas.width, this.m_canvas.height );

    // Draw initial state
    var x, y;
    for ( x = 0; x < 5; x++ ) {
        for ( y = 0; y < 5; y++ ) {
            this.m_context.drawImage( this.m_image, ( x + 5 * y ) * 70, 0, 70, 53, 70 * x, 53 * y, 70, 53 );
        }
    }
    for ( var k = 0; k < this.m_conditions.length; k++ ) {
        this.m_conditions[k].render();
    }
};

ZebraPuzzle.prototype.onClick = function ( x, y ) {
    var col = Math.floor( x / 70 );
    var row = Math.floor( y / 53 );

    if ( row === this.m_row && col === this.m_col ) {
        return;
    }
    if ( row > 4 ) {
        return;
    }
    this.m_row = row;
    this.m_col = col;

    this.render();

    this.m_context.strokeStyle = "#FF00FF";
    this.m_context.lineWidth = 3;
    this.m_context.beginPath();
    this.m_context.rect( 70 * col, 53 * row, 70, 53 );
    this.m_context.stroke();
    this.m_context.closePath();
};

//------------------------------------------------------------------------------
PuzzleCondition = function ( context, label, index, width, evaluator ) {
    this.m_context = context;
    this.m_label = label;
    this.m_y = 265 + 20 * index;
    this.m_width = width;
    this.m_evaluator = evaluator;
    this.m_state = this.m_evaluator();
}

PuzzleCondition.prototype.render = function () {
    this.m_context.fillStyle = this.m_state ? 'green' : 'red';
    this.m_context.fillRect( 0, this.m_y, this.m_width, 20 );
    this.m_context.fillStyle = 'yellow';
    this.m_context.font = '12px Verdana';
    this.m_context.fillText( ( this.m_state ? '[OK] ' : '[NO] ' ) + this.m_label, 5, this.m_y + 14 );
};

