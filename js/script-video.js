/**
 *
 * WebGL With Three.js - Lesson 10 - Drag and Drop Objects
 * http://www.script-tutorials.com/webgl-with-three-js-lesson-10/
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2015, Script Tutorials
 * http://www.script-tutorials.com/
 */

sbVertexShader = [
"varying vec3 vWorldPosition;",
"void main() {",
"  vec4 worldPosition = modelMatrix * vec4( position, 1.0 );",
"  vWorldPosition = worldPosition.xyz;",
"  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
"}",
].join("\n");

sbFragmentShader = [
"uniform vec3 topColor;",
"uniform vec3 bottomColor;",
"uniform float offset;",
"uniform float exponent;",
"varying vec3 vWorldPosition;",
"void main() {",
"  float h = normalize( vWorldPosition + offset ).y;",
"  gl_FragColor = vec4( mix( bottomColor, topColor, max( pow( h, exponent ), 0.0 ) ), 1.0 );",
"}",
].join("\n");

let clicked = false, clickedTimeout = null;

var lesson10 = {
  scene: null, camera: null, renderer: null,
  container: null, controls: null,
  clock: null, stats: null,
  plane: null, selection: null, offset: new THREE.Vector3(), objects: [],
  raycaster: null, ctrl: false, previousMousePosition: {},
  focus: null, prevColour: null, box: null,
  arrows: [], background: null, mouse: null,

  init: function() {

    // Create main scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0xcce0ff, 0.0003);

    var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;

    // Prepare perspective camera
    var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 1, FAR = 1000;
    this.camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
    this.scene.add(this.camera);
    this.camera.position.set(100, 0, 0);
    this.camera.lookAt(new THREE.Vector3(0,0,0));

    // Prepare webgl renderer
    this.renderer = new THREE.WebGLRenderer({ antialias:true });
    this.renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    this.renderer.setClearColor(this.scene.fog.color);

    // Prepare container
    this.container = document.createElement('div');
    document.body.appendChild(this.container);
    this.container.appendChild(this.renderer.domElement);

    // Events
    THREEx.WindowResize(this.renderer, this.camera);
    document.addEventListener('mousedown', this.onDocumentMouseDown, true);
    document.addEventListener('mousemove', this.onDocumentMouseMove, false);
    document.addEventListener('mouseup', this.onDocumentMouseUp, false);

    // Prepare Orbit controls
    this.controls = new THREE.OrbitControls(this.camera);
    this.controls.target = new THREE.Vector3(0, 0, 0);
    this.controls.maxDistance = 150;
    this.controls.enableKeys = false;

    // Prepare clock
    this.clock = new THREE.Clock();

    // Prepare stats
    this.stats = new Stats();
    this.stats.domElement.style.position = 'absolute';
    this.stats.domElement.style.left = '50px';
    this.stats.domElement.style.bottom = '50px';
    this.stats.domElement.style.zIndex = 1;
    this.container.appendChild( this.stats.domElement );

    // Add lights
    this.scene.add( new THREE.AmbientLight(0x444444));

    var dirLight = new THREE.DirectionalLight(0xffffff);
    dirLight.position.set(200, 200, 1000).normalize();
    this.camera.add(dirLight);
    this.camera.add(dirLight.target);

    // Display skybox
    this.addBackground();

    for(let i=0; i < 10; i++) {
      const geometry = new THREE.SphereGeometry(1, 100, 100);
      const material1 = new THREE.MeshBasicMaterial({color: 0xffff00});
      const sphere = new THREE.Mesh(geometry, material1);

      const pos = randomOnSphereEven(100, getRandomInt(1, 99), getRandomInt(1, 99))[0];

      sphere.position.x = pos.x;
      sphere.position.y = pos.y;
      sphere.position.z = pos.z;
      sphere.onclick = () => { console.log("TEST")};

      const interaction = new THREE.Interaction(this.renderer, this.scene, this.camera);
      this.scene.add(sphere);

      sphere.cursor = 'pointer';
      sphere.on('mousedown', function(ev) {
        if(!clicked) {
          clicked = true;
          alert("CLICKED");
        }
        clearTimeout(clickedTimeout);
        clickedTimeout = setTimeout(() => {
          clicked = false;
        }, 500);
      });
    }

    // Plane, that helps to determinate an intersection position
    this.plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(500, 500, 8, 8), new THREE.MeshBasicMaterial({color: 0x248f24, alphaTest: 0, visible: false}));

    this.scene.add(this.plane);

    // Add 100 random objects (spheres)
    var object, material, radius;

	//this.add_main_model()

  },
  addBackground: function() {
    var video = document.getElementById( 'myVideo' );
    video.play();
    video.addEventListener( 'play', function () {

      this.currentTime = 3;

    } );

    var geometry = new THREE.SphereGeometry( 100, 100, 100 );
	geometry.scale( - 1, 1, 1 );
	var material = new THREE.MeshBasicMaterial( {
	  map: new THREE.VideoTexture(video)
	} );
	mesh = new THREE.Mesh( geometry, material );
	this.background = mesh;
	mesh.name = "background";
	this.scene.add( mesh );
  },
  addSkybox: function() {
    var iSBrsize = 500;
    var uniforms = {
      topColor: {type: "c", value: new THREE.Color(0x0077ff)}, bottomColor: {type: "c", value: new THREE.Color(0xffffff)},
      offset: {type: "f", value: iSBrsize}, exponent: {type: "f", value: 1.5}
    }

    var skyGeo = new THREE.SphereGeometry(iSBrsize, 32, 32);
    skyMat = new THREE.ShaderMaterial({vertexShader: sbVertexShader, fragmentShader: sbFragmentShader, uniforms: uniforms, side: THREE.DoubleSide, fog: false});
    skyMesh = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(skyMesh);
  },
  onDocumentMouseDown: function (event) {
    //getRaycaster(event);
  },
  onDocumentMouseMove: function (event) {
    
  },
  onDocumentMouseUp: function (event) {
    
  }
};

// Animate the scene
function animate() {
  requestAnimationFrame(animate);
  render();
  update();
}

function getRaycaster(event) {
// update the picking ray with the camera and mouse position
  if(lesson10.mouse == null) {
    lesson10.mouse = new THREE.Vector2();
  }
  if(lesson10.raycaster == null) {
    lesson10.raycaster = new THREE.Raycaster();
  }
  console.log(lesson10.mouse);
  lesson10.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  lesson10.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

  lesson10.raycaster.setFromCamera( lesson10.mouse, lesson10.camera );

  // calculate objects intersecting the picking ray
  const intersects = lesson10.raycaster.intersectObjects( lesson10.scene.children );

  for ( let i = 0; i < intersects.length; i ++ ) {

    intersects[ i ].object.material.color.set( 0xff0000 );

  }
  console.log( intersects);
}

// Update controls and stats
function update() {
  var delta = lesson10.clock.getDelta();

  lesson10.controls.update(delta);
  lesson10.stats.update();
}

// Render the scene
function render() {
  if (lesson10.renderer) {
    lesson10.renderer.render(lesson10.scene, lesson10.camera);
  }
}
var rotateTimeout;
// Initialize lesson on page load
function initializeLesson() {
  lesson10.init();
  animate();
  
  jQuery('input.rotation').keypress(function () {
  	clearTimeout(rotateTimeout);
  	rotateTimeout = setTimeout('rotate', 100);
  });
  
}

function rotate() {
	var amount = 1;
	lesson10.shield.rotation.z = toRadians(amount)
}

if (window.addEventListener)
  window.addEventListener('load', initializeLesson, false);
else if (window.attachEvent)
  window.attachEvent('onload', initializeLesson);
else window.onload = initializeLesson;

function removeBackground() {
 var selectedObject = lesson10.scene.getObjectByName("background");
    lesson10.scene.remove( selectedObject );
    animate();
}

function toRadians(angle) {
	return angle * (Math.PI / 180);
}

function toDegrees(angle) {
	return angle * (180 / Math.PI);
}
let spherical = new THREE.Spherical();
function randomOnSphereEven(radius, PhiNum, thetaNum) {
  let points = [];
  phiSpan = Math.PI / (PhiNum+1);
  thetaSpan = Math.PI * 2 / thetaNum;
  // create random spherical coordinate
      spherical.set(radius, PhiNum, thetaNum);
      let point=new THREE.Vector3();
      point.setFromSpherical(spherical)
      points.push(point);
  return points;
}


function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}