//------------------------------------------------------------------------------
ZebraPuzzle = function ( canvas ) {

    // Initial state
    var colors = ['Red', 'Yellow', 'Green', 'White', 'Blue'];
    var nations = ['Spain', 'Japan', 'Italy', 'England', 'Norway'];
    var jobs = ['Violinist', 'Physician', 'Photographer', 'Diplomat', 'Painter'];
    var pets = ['Snail', 'Fox', 'Dog', 'Horse', 'Zebra'];
    var drinks = ['Coffee', 'Milk', 'Water', 'Juice', 'Tea'];
    this.m_imageIndexes = colors.concat( nations, jobs, pets, drinks );

    // Current state
    this.m_matrix = [colors, nations, jobs, pets, drinks];

    this.m_sprites = document.getElementById( "zebra_sprites" );

    if ( !canvas || !canvas.getContext || !this.m_sprites ) {
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
    canvas.height = 265 + 280;

    var conditions = [];
    conditions.push( new PuzzleCondition( this.m_context, 'The Englishman lives in the red house', 0, 350, function () {
        return myself.m_matrix[1].indexOf( 'England' ) === myself.m_matrix[0].indexOf( 'Red' );
    } ) );
    conditions.push( new PuzzleCondition( this.m_context, 'The Spaniard owns a dog', 1, 350, function () {
        return myself.m_matrix[1].indexOf( 'Spain' ) === myself.m_matrix[3].indexOf( 'Dog' );
    } ) );
    conditions.push( new PuzzleCondition( this.m_context, 'The Japanese man is a painter', 2, 350, function () {
        return myself.m_matrix[1].indexOf( 'Japan' ) === myself.m_matrix[2].indexOf( 'Painter' );
    } ) );
    conditions.push( new PuzzleCondition( this.m_context, 'The Italian drinks tea', 3, 350, function () {
        return myself.m_matrix[1].indexOf( 'Italy' ) === myself.m_matrix[4].indexOf( 'Tea' );
    } ) );
    conditions.push( new PuzzleCondition( this.m_context, 'The Norwegian lives in the first house on the left', 4, 350, function () {
        return myself.m_matrix[1].indexOf( 'Norway' ) === 0;
    } ) );
    conditions.push( new PuzzleCondition( this.m_context, 'The green house is on the right of the white one', 5, 350, function () {
        return myself.m_matrix[0].indexOf( 'Green' ) === myself.m_matrix[0].indexOf( 'White' ) + 1;
    } ) );
    conditions.push( new PuzzleCondition( this.m_context, 'The photographer breeds snails', 6, 350, function () {
        return myself.m_matrix[2].indexOf( 'Photographer' ) === myself.m_matrix[3].indexOf( 'Snail' );
    } ) );
    conditions.push( new PuzzleCondition( this.m_context, 'The diplomat lives in the yellow house', 7, 350, function () {
        return myself.m_matrix[2].indexOf( 'Diplomat' ) === myself.m_matrix[0].indexOf( 'Yellow' );
    } ) );
    conditions.push( new PuzzleCondition( this.m_context, 'Milk is drunk in the middle house', 8, 350, function () {
        return myself.m_matrix[4].indexOf( 'Milk' ) === 2;
    } ) );
    conditions.push( new PuzzleCondition( this.m_context, 'The owner of the green house drinks coffee', 9, 350, function () {
        return myself.m_matrix[0].indexOf( 'Green' ) === myself.m_matrix[4].indexOf( 'Coffee' )
    } ) );
    conditions.push( new PuzzleCondition( this.m_context, 'The Norwegian’s house is next to the blue one', 10, 350, function () {
        return ( ( myself.m_matrix[1].indexOf( 'Norway' ) === myself.m_matrix[0].indexOf( 'Blue' ) + 1 )
              || ( myself.m_matrix[1].indexOf( 'Norway' ) === myself.m_matrix[0].indexOf( 'Blue' ) - 1 ) );
    } ) );
    conditions.push( new PuzzleCondition( this.m_context, 'The violinist drinks orange juice', 11, 350, function () {
        return myself.m_matrix[2].indexOf( 'Violinist' ) === myself.m_matrix[4].indexOf( 'Juice' )
    } ) );
    conditions.push( new PuzzleCondition( this.m_context, 'The fox is in a house next to that of the physician', 12, 350, function () {
        return ( ( myself.m_matrix[3].indexOf( 'Fox' ) === myself.m_matrix[2].indexOf( 'Physician' ) + 1 )
              || ( myself.m_matrix[3].indexOf( 'Fox' ) === myself.m_matrix[2].indexOf( 'Physician' ) - 1 ) );
    } ) );
    conditions.push( new PuzzleCondition( this.m_context, 'The horse is in a house next to that of the diplomat', 13, 350, function () {
        return ( ( myself.m_matrix[3].indexOf( 'Horse' ) === myself.m_matrix[2].indexOf( 'Diplomat' ) + 1 )
              || ( myself.m_matrix[3].indexOf( 'Horse' ) === myself.m_matrix[2].indexOf( 'Diplomat' ) - 1 ) );
    } ) );
    this.m_conditions = conditions;

    this.render();
}

ZebraPuzzle.prototype.render = function () {
    var x, y, i;
    this.m_context.clearRect( 0, 0, this.m_canvas.width, this.m_canvas.height );

    // Draw initial state
    for ( x = 0; x < 5; x++ ) {
        for ( y = 0; y < 5; y++ ) {
            i = this.m_imageIndexes.indexOf( this.m_matrix[y][x] );
            this.m_context.drawImage( this.m_sprites, 70 * i, 0, 70, 53, 70 * x, 53 * y, 70, 53 );
        }
    }
    var solved = true;
    for ( i = 0; i < this.m_conditions.length; i++ ) {
        if ( !this.m_conditions[i].render() ) {
            solved = false;
        }
    }
    if ( solved ) {
        alert( "Congrats!" );
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

    if ( row !== this.m_row ) {
        this.m_row = row;
        this.m_col = col;
        this.render();
        this.m_context.strokeStyle = "#FF00FF";
        this.m_context.lineWidth = 3;
        this.m_context.beginPath();
        this.m_context.rect( 70 * col, 53 * row, 70, 53 );
        this.m_context.stroke();
        this.m_context.closePath();
    }
    else {
        var temp = this.m_matrix[row][col];
        this.m_matrix[row][col] = this.m_matrix[row][this.m_col];
        this.m_matrix[row][this.m_col] = temp;
        this.m_row = -1;
        this.m_col = -1;
        this.render();
    }
};

//------------------------------------------------------------------------------
PuzzleCondition = function ( context, label, index, width, evaluator ) {
    this.m_context = context;
    this.m_label = label;
    this.m_y = 265 + 20 * index;
    this.m_width = width;
    this.m_evaluator = evaluator;
}

PuzzleCondition.prototype.render = function () {
    var state = this.m_evaluator();
    this.m_context.fillStyle = state ? 'green' : 'red';
    this.m_context.fillRect( 0, this.m_y, this.m_width, 20 );
    this.m_context.fillStyle = 'yellow';
    this.m_context.font = '12px Verdana';
    this.m_context.fillText(( state ? '[OK] ' : '[NO] ' ) + this.m_label, 5, this.m_y + 14 );
    return state;
};

