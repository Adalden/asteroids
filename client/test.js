var renderer
  , camera
  , scene
  , mesh;

exports.init = initialize;
exports.start = animate;

function initialize() {
  // set the scene size
  var WIDTH  = 800
    , HEIGHT = 800;

  // set some camera attributes
  var VIEW_ANGLE = 45
    , ASPECT     = WIDTH / HEIGHT
    , NEAR       = 0.1
    , FAR        = 10000;

  // get the DOM element to attach to
  // - assume we've got jQuery to hand
  var $container = $('#test');

  // create a WebGL renderer, camera
  // and a scene
  renderer = new THREE.WebGLRenderer();
  camera   = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
  scene    = new THREE.Scene();

  // add the camera to the scene
  scene.add(camera);

  // the camera starts at 0,0,0
  // so pull it back
  camera.position.z = 300;

  // start the renderer
  renderer.setSize(WIDTH, HEIGHT);

  // attach the render-supplied DOM element
  $container.append(renderer.domElement);

  addModel('models/asteroid.js', 'models/asteroid.mtl');

  // create a point light
  var pointLight = new THREE.PointLight(0xFFFFFF);

  // set its position
  pointLight.position.x = 10;
  pointLight.position.y = 50;
  pointLight.position.z = 130;

  // add to the scene
  scene.add(pointLight);
}

function addModel(_model, meshTexture) {
  // var material = new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture(meshTexture) });
  var loader = new THREE.JSONLoader(false);
  loader.load(_model, function (geometry, material) {
    // material.morphTargets = true;
    // material.shading = THREE.FlatShading;
    console.log(material);
    mesh = new THREE.Mesh(geometry, material[0]);
    mesh.position.x = mesh.position.y = mesh.position.z = 0;
    mesh.rotation.x = mesh.rotation.y = mesh.rotation.z = 0;
    mesh.scale.x    = mesh.scale.y    = mesh.scale.z    = 40;
    mesh.matrixAutoUpdate = false;
    mesh.updateMatrix();
    scene.add(mesh);
  });
}

function animate() {
  requestAnimationFrame(animate);
  render();
}

function render() {
  if (mesh) {
    mesh.rotation.y += .01;
    mesh.rotation.x += .005;
    mesh.updateMatrix();
  }

  renderer.render(scene, camera);
}
