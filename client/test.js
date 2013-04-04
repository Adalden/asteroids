var renderer
  , camera
  , scene
  , ship
  , meshes = [];

$(document).keydown(function (e) {
  if (!ship) return;

  if (e.keyCode === 37) {
    ship.rotation.y += Math.PI / 180 * 5;
    ship.updateMatrix();
  }

  if(e.keyCode == 39){
    ship.rotation.y -= Math.PI / 180 * 5;
    ship.updateMatrix();
  }

  if(e.keyCode == 38){
    ship.position.y -= Math.cos(ship.rotation.y) * 5;
    ship.position.x += Math.sin(ship.rotation.y) * 5;
    ship.updateMatrix();
  }

  if(e.keyCode == 40){
    ship.position.y -= 5;
    ship.updateMatrix();
  }
});

var DEBUG = true;

exports.init = initialize;
exports.start = animate;

function initialize() {
  // set the scene size
  var WIDTH  = 1440
    , HEIGHT = 700;

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
//  camera   = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
  camera   = new THREE.OrthographicCamera(WIDTH / 2, -WIDTH / 2, HEIGHT / 2, -HEIGHT / 2, HEIGHT / 2, NEAR, FAR);
  scene    = new THREE.Scene();

  // add the camera to the scene
  scene.add(camera);

  // start the renderer
  renderer.setSize(WIDTH, HEIGHT);

  // attach the render-supplied DOM element
  $container.append(renderer.domElement);

  for (var i = 0; i < 8; ++i) {
    addModel('models/asteroid.js', 'models/asteroid.jpg', addBoundingSphere);
  }

  addShip('models/ship.js');

  // create a point light
  var pointLight = new THREE.PointLight(0xFFFFFF);

  // set its position
  pointLight.position.x = 10;
  pointLight.position.y = 50;
  pointLight.position.z = 130;

  // add to the scene
  scene.add(pointLight);
}

function addModel(_model, meshTexture, cb) {
  cb = cb || function () {};
  var material = undefined;
  if (meshTexture)
    material = new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture(meshTexture) });
  var loader = new THREE.JSONLoader(false);
  loader.load(_model, function (geometry, materials) {
    var mesh = new THREE.Mesh(geometry, material); // new THREE.MeshFaceMaterial(materials)
    mesh.position.z = 0;
    mesh.position.x = (Math.random() - .5) * 1440;
    mesh.position.y = (Math.random() - .5) * 700;
    mesh.rotation.x = mesh.rotation.y = mesh.rotation.z = 0;
    mesh.scale.x    = mesh.scale.y    = mesh.scale.z    = 60;

    mesh.geometry.boundingSphere.radius -= .2;

    while (collidesTEST(mesh)) {
      mesh.position.x = (Math.random() - .5) * 1440;
      mesh.position.y = (Math.random() - .5) * 700;
    }
    mesh.matrixAutoUpdate = false;
    mesh.updateMatrix();
    scene.add(mesh);
    meshes.push(createAsteroid(mesh));
    cb(mesh);
  });
}

function addShip(_model){
  var loader = new THREE.JSONLoader(false);
  loader.load(_model, function (geometry, materials) {
    var mesh = new THREE.Mesh(geometry, materials[0]); // new THREE.MeshFaceMaterial(materials)
    mesh.position.x = mesh.position.y = mesh.position.z = 0;
    mesh.rotation.x = mesh.rotation.y = mesh.rotation.z = 0;
    mesh.scale.x    = mesh.scale.y    = mesh.scale.z    = .1;

    mesh.rotation.x = 90;

    mesh.matrixAutoUpdate = false;
    mesh.updateMatrix();
    scene.add(mesh);
    ship = mesh;
  });


}

function collidesTEST(mesh) {
  var m2 = mesh.position;
  var dist2 = mesh.geometry.boundingSphere.radius * mesh.scale.x;

  for (var i = 0; i < meshes.length; ++i) {

    var m1 = meshes[i].mesh.position;
    var d = Math.sqrt(Math.pow(m1.x - m2.x, 2) + Math.pow(m1.y - m2.y, 2) + Math.pow(m1.z - m2.z, 2));

    var dist = dist2 + meshes[i].mesh.geometry.boundingSphere.radius * meshes[i].mesh.scale.x;
    if (d <= dist) {
    // if (d <= 40) {
      return true;
    }
  }

  return false;
}

function addBoundingSphere(mesh) {
  if (!DEBUG) return;

  var radius   = mesh.geometry.boundingSphere.radius
    , segments = 16
    , rings    = 16;

  var sphere = new THREE.Mesh(
    new THREE.SphereGeometry(radius, segments, rings)
    // new THREE.MeshLambertMaterial({ color: 0xCC0000 })
  );

  sphere.scale = mesh.scale;
  sphere.position = mesh.position;

  scene.add(sphere);
}

function createAsteroid(mesh) {
  var SPEED = 3;

  return {
    rotX: (Math.random() - .5) / 50,
    rotY: (Math.random() - .5) / 50,
    dx: (Math.random() - .5) * SPEED,
    dy: (Math.random() - .5) * SPEED,
    mesh: mesh
  };
}

function animate() {
  requestAnimationFrame(animate);
  update();
  render();
}

function update() {
  var WIDTH  = 1440;
  var HEIGHT = 700;

  for (var i = 0; i < meshes.length; ++i) {
    var a = meshes[i];

    var oldX = a.mesh.position.x;
    var oldY = a.mesh.position.y;

    a.mesh.position.x += a.dx;
    a.mesh.position.y += a.dy;

    if (checkCollisions(i)) {
      a.mesh.position.x = oldX;
      a.mesh.position.y = oldY;
    }

    if (a.mesh.position.x > WIDTH / 2) {
      a.mesh.position.x = WIDTH / 2;
      a.dx *= -1;
    }

    if (a.mesh.position.x < -WIDTH / 2) {
      a.mesh.position.x = -WIDTH / 2;
      a.dx *= -1;
    }

    if (a.mesh.position.y > HEIGHT / 2) {
      a.mesh.position.y = HEIGHT / 2;
      a.dy *= -1;
    }

    if (a.mesh.position.y < -HEIGHT / 2) {
      a.mesh.position.y = -HEIGHT / 2;
      a.dy *= -1;
    }

    a.mesh.rotation.x += a.rotX;
    a.mesh.rotation.y += a.rotY;

    a.mesh.updateMatrix();
  }
}

function render() {
  renderer.render(scene, camera);
}

function checkCollisions(j) {
  var m2 = meshes[j].mesh.position;
  var dist2 = meshes[j].mesh.geometry.boundingSphere.radius * meshes[j].mesh.scale.x;

  for (var i = 0; i < meshes.length; ++i) {
    if (i === j) continue;

    var m1 = meshes[i].mesh.position;
    var d = Math.sqrt(Math.pow(m1.x - m2.x, 2) + Math.pow(m1.y - m2.y, 2) + Math.pow(m1.z - m2.z, 2));

    var dist = dist2 + meshes[i].mesh.geometry.boundingSphere.radius * meshes[i].mesh.scale.x;
    // if (j == 0)
    //   console.log(d, dist);

    if (d <= dist) {
    // if (d <= 40) {
      var tempX = meshes[i].dx;
      var tempY = meshes[i].dy;

      meshes[i].dx = meshes[j].dx;
      meshes[i].dy = meshes[j].dy;

      meshes[j].dx = tempX;
      meshes[j].dy = tempY;

      return true;
    }
  }

  return false;
}
