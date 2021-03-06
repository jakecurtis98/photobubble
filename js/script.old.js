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

var lesson10 = {
  scene: null, camera: null, renderer: null,
  container: null, controls: null,
  clock: null, stats: null,
  plane: null, selection: null, offset: new THREE.Vector3(), objects: [],
  raycaster: new THREE.Raycaster(),

  init: function() {
	this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
	this.renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(this.renderer.domElement);

// camera
	this.camera = new THREE.PerspectiveCamera(10, window.innerWidth / window.innerHeight, 0.1, 10000);
	this.camera.position.set(1, 40, 70); // settings in `sceneList` "Monster"
	this.camera.up.set(0, 1, 0);
	this.camera.lookAt(new THREE.Vector3(0, 0, 0));

// scene and lights
	this.scene = new THREE.Scene();
	var ambientLight = new THREE.AmbientLight( 0xcccccc );
	this.scene.add( ambientLight );
	var directionalLight = new THREE.DirectionalLight( 0xffffff );
	directionalLight.position.set( 0, 1, 1 ).normalize();
	
	this.scene.add( directionalLight );				
	this.scene.fog = new THREE.Fog('green', 1, 10000 );
	this.scene.background = new THREE.Color( 'white'  );

    var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;

    // Prepare perspective camera
    var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 1, FAR = 1000;
    
    // Prepare container
    this.container = document.createElement('div');
    document.body.appendChild(this.container);
    this.container.appendChild(this.renderer.domElement);

    // Events
    //THREEx.WindowResize(this.renderer, this.camera);
    document.addEventListener('mousedown', this.onDocumentMouseDown, false);
    document.addEventListener('mousemove', this.onDocumentMouseMove, false);
    document.addEventListener('mouseup', this.onDocumentMouseUp, false);

    // Prepare Orbit controls
    this.controls = new THREE.OrbitControls(this.camera);
    this.controls.target = new THREE.Vector3(0, 0, 0);
    this.controls.maxDistance = 150;

    // Prepare clock
    this.clock = new THREE.Clock();

    // Display skybox
    //this.addSkybox();

    // Plane, that helps to determinate an intersection position
    this.plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(500, 500, 8, 8), new THREE.MeshBasicMaterial({color: 0x248f24, alphaTest: 0, visible: false}));
    //this.plane.visible = false;
    this.scene.add(this.plane);

    // Add 100 random objects (spheres)
    var object, material, radius;
    var objGeometry = new THREE.SphereGeometry(1, 24, 24);
    for (var i = 0; i < 50; i++) {
      material = new THREE.MeshPhongMaterial({color: Math.random() * 0xffffff});
      material.transparent = true;
      object = new THREE.Mesh(objGeometry.clone(), material);
      this.objects.push(object);

      radius = Math.random() * 4 + 2;
      object.scale.x = radius;
      object.scale.y = radius;
      object.scale.z = radius;

      object.position.x = Math.random() * 50 - 25;
      object.position.y = Math.random() * 50 - 25;
      object.position.z = Math.random() * 50 - 25;

      this.scene.add(object);
    }
    
    this.add_main_model()

  },
  add_main_model: function() {
	const theloader = new THREE.GLTFLoader();
	theloader.load("../models/retro_fridge/scene.gltf", gltf => {
		// model is a THREE.Group (THREE.Object3D)
		const mixer = new THREE.AnimationMixer(gltf.scene);
		// animations is a list of THREE.AnimationClip
		for (const anim of gltf.animations) {
			mixer.clipAction(anim).play();
		}
		// settings in `sceneList` "Monster"
		var object = gltf.scene;				
		gltf.scene.scale.set( 2, 2, 2 );			   
		gltf.scene.position.x = 0;				    //Position (x = right+ left-) 
    	gltf.scene.position.y = 0;				    //Position (y = up+, down-)
		gltf.scene.position.z = 0;				    //Position (z = front +, back-)
		
		lesson10.scene.add( gltf.scene );
		/* 
gltf.scene.children.forEach(function (model) {
			 lesson10.objects.push(model);
		});
 */
 		gltf.scene.traverse( function( object ) {

		   if ( object.isMesh) lesson10.objects.push( object );

		} );
    
		var el = document.querySelectorAll('.loader')[0];
		var className = 'hide';
		if (el.classList)
  			el.classList.add(className);
		else
  			el.className += ' ' + className;
	},
		// called while loading is progressing
	function ( xhr ) {
		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
	});
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
    // Get mouse position
    var mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    var mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

    // Get 3D vector from 3D mouse position using 'unproject' function
    var vector = new THREE.Vector3(mouseX, mouseY, 1);
    vector.unproject(lesson10.camera);
	
    // Set the raycaster position
    lesson10.raycaster.set( lesson10.camera.position, vector.sub( lesson10.camera.position ).normalize() );
	
    // Find all intersected objects
    var intersects = lesson10.raycaster.intersectObjects(lesson10.objects);

    if (intersects.length > 0) {
      // Disable the controls
      lesson10.controls.enabled = false;

      // Set the selection - first intersected object
      lesson10.selection = intersects[0].object;

      // Calculate the offset
      var intersects = lesson10.raycaster.intersectObject(lesson10.plane);
      lesson10.offset.copy(intersects[0].point).sub(lesson10.plane.position);
    }
  },
  onDocumentMouseMove: function (event) {
    event.preventDefault();

    // Get mouse position
    var mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    var mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

    // Get 3D vector from 3D mouse position using 'unproject' function
    var vector = new THREE.Vector3(mouseX, mouseY, 1);
    vector.unproject(lesson10.camera);

    // Set the raycaster position
    lesson10.raycaster.set( lesson10.camera.position, vector.sub( lesson10.camera.position ).normalize() );

    if (lesson10.selection) {
      // Check the position where the plane is intersected
      var intersects = lesson10.raycaster.intersectObject(lesson10.plane);
      // Reposition the object based on the intersection point with the plane
      lesson10.selection.position.copy(intersects[0].point.sub(lesson10.offset));
    } else {
      // Update position of the plane if need
      var intersects = lesson10.raycaster.intersectObjects(lesson10.objects);
      console.log(intersects);
      if (intersects.length > 0) {
        lesson10.plane.position.copy(intersects[0].object.position);
        lesson10.plane.lookAt(lesson10.camera.position);
      }
    }
  },
  onDocumentMouseUp: function (event) {
    // Enable the controls
    lesson10.controls.enabled = true;
    lesson10.selection = null;
  }
};

// Animate the scene
function animate() {
  requestAnimationFrame(animate);
  render();
  update();
}

// Update controls and stats
function update() {
  var delta = lesson10.clock.getDelta();

  lesson10.controls.update(delta);
  //lesson10.stats.update();
}

// Render the scene
function render() {
  if (lesson10.renderer) {
    lesson10.renderer.render(lesson10.scene, lesson10.camera);
  }
}

// Initialize lesson on page load
function initializeLesson() {
  lesson10.init();
  animate();
}

if (window.addEventListener)
  window.addEventListener('load', initializeLesson, false);
else if (window.attachEvent)
  window.attachEvent('onload', initializeLesson);
else window.onload = initializeLesson;
