

//window.onload = () => {
//    var renderer = new djs.Renderer( 'content', window.innerWidth, window.innerHeight );
//};

window.onresize = () => {
    if ( djs.Renderer.instance ) {
        djs.Renderer.instance.onResize( window.innerWidth, window.innerHeight );
    }
}
