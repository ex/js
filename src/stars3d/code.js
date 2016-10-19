
var STARS = [
    { id: 0, x: 1.631e-005, y: 0, z: 0 },
    { id: 1472, x: 8.38749905, y: 0.67415754, z: 8.132351934 },
    { id: 5632, x: 10.940004264, y: 3.58159445, z: -3.519149984 },
    { id: 8087, x: 10.288618746, y: 5.021875096, z: -3.26937212 },
    { id: 16496, x: 6.19444014, y: 8.290131612, z: -1.724042026 },
    { id: 32263, x: -1.612481626, y: 8.079096522, z: -2.47417807 },
    { id: 36107, x: -4.597948838, y: 11.465460272, z: 1.129819796 },
    { id: 37173, x: -4.792895744, y: 10.36066654, z: 1.043918288 },
    { id: 53879, x: -6.517476, y: 1.64504291, z: 4.878334048 },
    { id: 57375, x: -10.927347704, y: 0.585111464, z: 0.153676082 },
    { id: 70666, x: -1.540525168, y: -1.179053162, z: -3.755276378 },
    { id: 71453, x: -1.615280422, y: -1.350379926, z: -3.773070588 },
    { id: 71456, x: -1.615352186, y: -1.350742008, z: -3.77291075 },
    { id: 82472, x: -1.574091148, y: -5.3599553, z: -10.68551281 },
    { id: 87665, x: -0.056670726, y: -5.925791606, z: 0.486439226 },
    { id: 91484, x: 1.092300272, y: -5.78386851, z: 10.044836438 },
    { id: 91487, x: 1.057432754, y: -5.598759796, z: 9.722002822 },
    { id: 92115, x: 1.911150346, y: -8.652304948, z: -3.914801226 },
    { id: 103879, x: 6.456659272, y: -6.079180632, z: 7.117331704 },
    { id: 103883, x: 6.479222526, y: -6.099251718, z: 7.139676404 },
    { id: 108526, x: 5.651705318, y: -3.15342433, z: -9.884861434 },
    { id: 113687, x: 8.420957384, y: -2.026853486, z: -6.259037526 },
    { id: 117979, x: 8.343426168, y: 0.67027576, z: 8.089740428 },
    { id: 118079, x: 7.406367738, y: 3.41521614, z: -2.642099306 },
    { id: 118080, x: 7.406798322, y: 3.415415122, z: -2.64225262 },
    { id: 118441, x: -1.612664298, y: 8.079367268, z: -2.47412914 },
    { id: 118493, x: -4.769937788, y: 10.311250502, z: 1.03930582 },
    { id: 118541, x: -6.421090424, y: 8.381222962, z: 5.328359568 },
    { id: 118720, x: -7.446529482, y: 2.118127508, z: 0.952689934 },
    { id: 119518, x: 10.013990966, y: -3.716279168, z: -2.922585638 },
    { id: 119585, x: 7.380761038, y: -0.583969764, z: 7.193603788 },
];

var container, stats;
var camera, controls, scene, renderer;
var pickingData = [], pickingTexture, pickingScene;
var objects = [];
var highlightBox;
var mouse = new THREE.Vector2();
var offset = new THREE.Vector3( 10, 10, 10 );

init();
animate();

function init() {

    container = document.createElement( 'div' );
    document.body.appendChild( container );

    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.z = 1000;
    controls = new THREE.TrackballControls( camera );
    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;
    controls.noZoom = false;
    controls.noPan = false;
    controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.3;

    scene = new THREE.Scene();
    pickingScene = new THREE.Scene();
    pickingTexture = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight );
    pickingTexture.texture.minFilter = THREE.LinearFilter;
    scene.add( new THREE.AmbientLight( 0x555555 ) );
    var light = new THREE.SpotLight( 0xffffff, 1.5 );
    light.position.set( 0, 500, 2000 );
    scene.add( light );

    var geometry = new THREE.Geometry(),
    pickingGeometry = new THREE.Geometry(),
    pickingMaterial = new THREE.MeshBasicMaterial( { vertexColors: THREE.VertexColors } ),
    defaultMaterial = new THREE.MeshPhongMaterial( { color: 0xffffff, shading: THREE.FlatShading, vertexColors: THREE.VertexColors, shininess: 0 } );

    function applyVertexColors( g, c ) {
        g.faces.forEach( function( f ) {
            var n = ( f instanceof THREE.Face3 ) ? 3 : 4;
            for ( var j = 0; j < n; j++ ) {
                f.vertexColors[j] = c;
            }
        } );
    }
    var geom = new THREE.BoxGeometry( 1, 1, 1 );
    var color = new THREE.Color();
    var matrix = new THREE.Matrix4();
    var quaternion = new THREE.Quaternion();

    for ( var i = 0; i < STARS.length; i++ ) {

        var position = new THREE.Vector3();
        position.x = STARS[i].x * 100;
        position.y = STARS[i].y * 100;
        position.z = STARS[i].z * 100;
        var rotation = new THREE.Euler();
        rotation.x = Math.random() * 2 * Math.PI;
        rotation.y = Math.random() * 2 * Math.PI;
        rotation.z = Math.random() * 2 * Math.PI;
        var scale = new THREE.Vector3();
        scale.x = 100;
        scale.y = 100;
        scale.z = 100;

        quaternion.setFromEuler( rotation, false );
        matrix.compose( position, quaternion, scale );
        // Give the geom's vertices a random color, to be displayed
        applyVertexColors( geom, color.setHex( Math.random() * 0xffffff ) );
        geometry.merge( geom, matrix );
        // Give the geom's vertices a color corresponding to the "id"
        applyVertexColors( geom, color.setHex( i ) );
        pickingGeometry.merge( geom, matrix );
        pickingData[i] = {
            position: position,
            rotation: rotation,
            scale: scale
        };
    }

    var drawnObject = new THREE.Mesh( geometry, defaultMaterial );
    scene.add( drawnObject );
    pickingScene.add( new THREE.Mesh( pickingGeometry, pickingMaterial ) );
    highlightBox = new THREE.Mesh(
        new THREE.BoxGeometry( 1, 1, 1 ),
        new THREE.MeshLambertMaterial( { color: 0xffff00 }
    ) );

    scene.add( highlightBox );
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setClearColor( 0xffffff );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.sortObjects = false;
    container.appendChild( renderer.domElement );

    renderer.domElement.addEventListener( 'mousemove', onMouseMove );
}

function onMouseMove( e ) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
}

function animate() {
    requestAnimationFrame( animate );
    render();
}

function pick() {
    // Render the picking scene off-screen
    renderer.render( pickingScene, camera, pickingTexture );
    // Create buffer for reading single pixel
    var pixelBuffer = new Uint8Array( 4 );
    // Read the pixel under the mouse from the texture
    renderer.readRenderTargetPixels( pickingTexture, mouse.x, pickingTexture.height - mouse.y, 1, 1, pixelBuffer );
    // Interpret the pixel as an ID
    var id = ( pixelBuffer[0] << 16 ) | ( pixelBuffer[1] << 8 ) | ( pixelBuffer[2] );
    var data = pickingData[id];
    if ( data ) {
        //move our highlightBox so that it surrounds the picked object
        if ( data.position && data.rotation && data.scale ) {
            highlightBox.position.copy( data.position );
            highlightBox.rotation.copy( data.rotation );
            highlightBox.scale.copy( data.scale ).add( offset );
            highlightBox.visible = true;
        }
    }
    else {
        highlightBox.visible = false;
    }
}

function render() {
    controls.update();
    pick();
    renderer.render( scene, camera );
}
