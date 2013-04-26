;(function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0](function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){
window.require = require;

var test = require('./test');

test.init();
test.start();

},{"./test":2}],2:[function(require,module,exports){
var renderer
  , camera
  , scene
  , ship
  , meshes = [];

var inp    = require('./input')
  , player = require('./player');

var DEBUG = false;

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
    var mesh2 = new THREE.Mesh(geometry, material); // new THREE.MeshFaceMaterial(materials)
    var mesh3 = new THREE.Mesh(geometry, material); // new THREE.MeshFaceMaterial(materials)
    var mesh4 = new THREE.Mesh(geometry, material); // new THREE.MeshFaceMaterial(materials)
    mesh.position.z = 0;
    mesh.position.x = (Math.random() - .5) * 1440;
    mesh.position.y = (Math.random() - .5) * 700;
    mesh.rotation.x = mesh.rotation.y = mesh.rotation.z = 0;
    mesh.scale.x    = mesh.scale.y    = mesh.scale.z    = 60;

    mesh2.rotation = mesh3.rotation = mesh4.rotation = mesh.rotation;
    mesh2.scale = mesh3.scale = mesh4.scale = mesh.scale;

    // mesh.geometry.boundingSphere.radius -= .2;

    // while (collidesTEST(mesh)) {
    //   mesh.position.x = (Math.random() - .5) * 1440;
    //   mesh.position.y = (Math.random() - .5) * 700;
    // }
    mesh.matrixAutoUpdate = false;
    mesh.updateMatrix();
    scene.add(mesh);
    scene.add(mesh2);
    scene.add(mesh3);
    scene.add(mesh4);
    meshes.push(createAsteroid(mesh, mesh2, mesh3, mesh4));
    cb(mesh);
  });
}

function addShip(_model){
  var loader = new THREE.JSONLoader(false);
  loader.load(_model, function (geometry, materials) {
    var mesh = new THREE.Mesh(geometry); // new THREE.MeshFaceMaterial(materials)
    var mesh2 = new THREE.Mesh(geometry); // new THREE.MeshFaceMaterial(materials)
    var mesh3 = new THREE.Mesh(geometry); // new THREE.MeshFaceMaterial(materials)
    var mesh4 = new THREE.Mesh(geometry); // new THREE.MeshFaceMaterial(materials)
    
    mesh.position.x = mesh.position.y = mesh.position.z = 0;
    mesh.rotation.x = mesh.rotation.y = mesh.rotation.z = 0;
    mesh.scale.x    = mesh.scale.y    = mesh.scale.z    = 1;

    mesh.position.z = -100;
    mesh.rotation.x = 90;

    mesh2.rotation = mesh3.rotation = mesh4.rotation = mesh.rotation;
    mesh2.scale = mesh3.scale = mesh4.scale = mesh.scale;

    mesh.matrixAutoUpdate = false;
    mesh.updateMatrix();
    scene.add(mesh);
    scene.add(mesh2);
    scene.add(mesh3);
    scene.add(mesh4);
    ship = mesh;

    player.setShip(ship, mesh2, mesh3, mesh4);
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

function createAsteroid(mesh, mesh2, mesh3, mesh4) {
  var SPEED = 3;

  return {
    rotX: (Math.random() - .5) / 50,
    rotY: (Math.random() - .5) / 50,
    dx: (Math.random() - .5) * SPEED,
    dy: (Math.random() - .5) * SPEED,
    mesh: mesh,
    mesh2: mesh2,
    mesh3: mesh3,
    mesh4: mesh4
  };
}

function animate() {
  requestAnimationFrame(animate);
  updateAsteroids();
  updatePlayer();
  render();
}

function updatePlayer() {
  if (!ship) return;

  if (inp.up()) {
    player.moveUp();
  }

  if (inp.down()) {
    player.moveDown();
  }

  if (inp.left()) {
    player.moveLeft();
  }

  if (inp.right()) {
    player.moveRight();
  }

  player.update();
  ship.updateMatrix();
}

function updateAsteroids() {
  var WIDTH  = 1440;
  var HEIGHT = 700;

  for (var i = 0; i < meshes.length; ++i) {
    var a = meshes[i];

    var oldX = a.mesh.position.x;
    var oldY = a.mesh.position.y;

    a.mesh.position.x += a.dx;
    a.mesh.position.y += a.dy;

    // if (checkCollisions(i)) {
    //   a.mesh.position.x = oldX;
    //   a.mesh.position.y = oldY;
    // }

    if (a.mesh.position.x > WIDTH / 2) {
      a.mesh.position.x -= WIDTH;
      // a.mesh.position.x = WIDTH / 2;
      // a.dx *= -1;
    }

    if (a.mesh.position.x < -WIDTH / 2) {
      a.mesh.position.x += WIDTH;
      // a.mesh.position.x = -WIDTH / 2;
      // a.dx *= -1;
    }

    if (a.mesh.position.y > HEIGHT / 2) {
      a.mesh.position.y -= HEIGHT;
      // a.mesh.position.y = HEIGHT / 2;
      // a.dy *= -1;
    }

    if (a.mesh.position.y < -HEIGHT / 2) {
      a.mesh.position.y += HEIGHT;
      // a.mesh.position.y = -HEIGHT / 2;
      // a.dy *= -1;
    }


    a.mesh2.position.y = a.mesh.position.y;
    a.mesh2.position.z = a.mesh.position.z;

    if (a.mesh.position.x > 0)
      a.mesh2.position.x = a.mesh.position.x - WIDTH;
    else
      a.mesh2.position.x = a.mesh.position.x + WIDTH;

    a.mesh3.position.x = a.mesh.position.x;
    a.mesh3.position.z = a.mesh.position.z;

    if (a.mesh.position.y > 0)
      a.mesh3.position.y = a.mesh.position.y - HEIGHT;
    else
      a.mesh3.position.y = a.mesh.position.y + HEIGHT;


    a.mesh4.position.z = a.mesh.position.z;


    if (a.mesh.position.x > 0)
      a.mesh4.position.x = a.mesh.position.x - WIDTH;
    else
      a.mesh4.position.x = a.mesh.position.x + WIDTH;
    if (a.mesh.position.y > 0)
      a.mesh4.position.y = a.mesh.position.y - HEIGHT;
    else
      a.mesh4.position.y = a.mesh.position.y + HEIGHT;



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

},{"./input":3,"./player":4}],3:[function(require,module,exports){
var keys = {};

$(document).keydown(function (e) {
  keys[e.keyCode] = true;
//   e.stopPropagation();
//   e.stopImmediatePropagation();
//   return false;
});

$(document).keyup(function (e) {
  keys[e.keyCode] = false;
//   e.stopPropagation();
//   e.stopImmediatePropagation();
//   return false;
});

var test = {};
exports.left  = function () { return keys[37] || keys[65]; };
exports.right = function () { return keys[39] || keys[68]; };
exports.up    = function () { return keys[38] || keys[87]; };
exports.down  = function () { return keys[40] || keys[83]; };

// wasd and arrow keys

exports.resetKeys = function () {
  for (var key in keys) {
    keys[key] = false;
  }
}

},{}],4:[function(require,module,exports){
var WIDTH  = 1440
  , HEIGHT = 700;

var ship;

var mesh2, mesh3, mesh4;

var velocity = {
  dx: 0,
  dy: 0
}

exports.setShip = function (theShip, mesh22, mesh33, mesh44) {
  ship = theShip;
  mesh2 = mesh22;
  mesh3 = mesh33;
  mesh4 = mesh44;
};

exports.moveLeft = function () {
  ship.rotation.y -= Math.PI / 180 * 5;
};

exports.moveRight = function () {
  ship.rotation.y += Math.PI / 180 * 5;
};

exports.moveUp = function () {
  velocity.dy -= Math.cos(ship.rotation.y) * .5;
  velocity.dx += Math.sin(ship.rotation.y) * .5;

  if (velocity.dx > 100)
  	velocity.dx = 100;
  if (velocity.dy > 100)
  	velocity.dy = 100;

  if (velocity.dx < -100)
  	velocity.dx = -100;
  if (velocity.dy < -100)
  	velocity.dy = -100;

};

exports.moveDown = function () {

};

exports.update = function () {
  ship.position.x += velocity.dx;
  ship.position.y += velocity.dy;

  if (ship.position.x >= WIDTH/2) ship.position.x -= WIDTH;
  if (ship.position.x <= -WIDTH/2) ship.position.x += WIDTH;
  if (ship.position.y >= HEIGHT/2) ship.position.y -= HEIGHT;
  if (ship.position.y <= -HEIGHT/2) ship.position.y += HEIGHT;

    mesh2.position.y = ship.position.y;
    mesh2.position.z = ship.position.z;

    if (ship.position.x > 0)
      mesh2.position.x = ship.position.x - WIDTH;
    else
      mesh2.position.x = ship.position.x + WIDTH;

    mesh3.position.x = ship.position.x;
    mesh3.position.z = ship.position.z;

    if (ship.position.y > 0)
      mesh3.position.y = ship.position.y - HEIGHT;
    else
      mesh3.position.y = ship.position.y + HEIGHT;


    mesh4.position.z = ship.position.z;


    if (ship.position.x > 0)
      mesh4.position.x = ship.position.x - WIDTH;
    else
      mesh4.position.x = ship.position.x + WIDTH;
    if (ship.position.y > 0)
      mesh4.position.y = ship.position.y - HEIGHT;
    else
      mesh4.position.y = ship.position.y + HEIGHT;
};

},{}]},{},[1])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvZGFsbGlub3NtdW4vY29kZS9hc3Rlcm9pZHMvY2xpZW50L21haW4uanMiLCIvVXNlcnMvZGFsbGlub3NtdW4vY29kZS9hc3Rlcm9pZHMvY2xpZW50L3Rlc3QuanMiLCIvVXNlcnMvZGFsbGlub3NtdW4vY29kZS9hc3Rlcm9pZHMvY2xpZW50L2lucHV0LmpzIiwiL1VzZXJzL2RhbGxpbm9zbXVuL2NvZGUvYXN0ZXJvaWRzL2NsaWVudC9wbGF5ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFVQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyJ3aW5kb3cucmVxdWlyZSA9IHJlcXVpcmU7XG5cbnZhciB0ZXN0ID0gcmVxdWlyZSgnLi90ZXN0Jyk7XG5cbnRlc3QuaW5pdCgpO1xudGVzdC5zdGFydCgpO1xuIiwidmFyIHJlbmRlcmVyXG4gICwgY2FtZXJhXG4gICwgc2NlbmVcbiAgLCBzaGlwXG4gICwgbWVzaGVzID0gW107XG5cbnZhciBpbnAgICAgPSByZXF1aXJlKCcuL2lucHV0JylcbiAgLCBwbGF5ZXIgPSByZXF1aXJlKCcuL3BsYXllcicpO1xuXG52YXIgREVCVUcgPSBmYWxzZTtcblxuZXhwb3J0cy5pbml0ID0gaW5pdGlhbGl6ZTtcbmV4cG9ydHMuc3RhcnQgPSBhbmltYXRlO1xuXG5mdW5jdGlvbiBpbml0aWFsaXplKCkge1xuICAvLyBzZXQgdGhlIHNjZW5lIHNpemVcbiAgdmFyIFdJRFRIICA9IDE0NDBcbiAgICAsIEhFSUdIVCA9IDcwMDtcblxuICAvLyBzZXQgc29tZSBjYW1lcmEgYXR0cmlidXRlc1xuICB2YXIgVklFV19BTkdMRSA9IDQ1XG4gICAgLCBBU1BFQ1QgICAgID0gV0lEVEggLyBIRUlHSFRcbiAgICAsIE5FQVIgICAgICAgPSAwLjFcbiAgICAsIEZBUiAgICAgICAgPSAxMDAwMDtcblxuICAvLyBnZXQgdGhlIERPTSBlbGVtZW50IHRvIGF0dGFjaCB0b1xuICAvLyAtIGFzc3VtZSB3ZSd2ZSBnb3QgalF1ZXJ5IHRvIGhhbmRcbiAgdmFyICRjb250YWluZXIgPSAkKCcjdGVzdCcpO1xuXG4gIC8vIGNyZWF0ZSBhIFdlYkdMIHJlbmRlcmVyLCBjYW1lcmFcbiAgLy8gYW5kIGEgc2NlbmVcbiAgcmVuZGVyZXIgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcigpO1xuLy8gIGNhbWVyYSAgID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKFZJRVdfQU5HTEUsIEFTUEVDVCwgTkVBUiwgRkFSKTtcbiAgY2FtZXJhICAgPSBuZXcgVEhSRUUuT3J0aG9ncmFwaGljQ2FtZXJhKFdJRFRIIC8gMiwgLVdJRFRIIC8gMiwgSEVJR0hUIC8gMiwgLUhFSUdIVCAvIDIsIEhFSUdIVCAvIDIsIE5FQVIsIEZBUik7XG4gIHNjZW5lICAgID0gbmV3IFRIUkVFLlNjZW5lKCk7XG5cbiAgLy8gYWRkIHRoZSBjYW1lcmEgdG8gdGhlIHNjZW5lXG4gIHNjZW5lLmFkZChjYW1lcmEpO1xuXG4gIC8vIHN0YXJ0IHRoZSByZW5kZXJlclxuICByZW5kZXJlci5zZXRTaXplKFdJRFRILCBIRUlHSFQpO1xuXG4gIC8vIGF0dGFjaCB0aGUgcmVuZGVyLXN1cHBsaWVkIERPTSBlbGVtZW50XG4gICRjb250YWluZXIuYXBwZW5kKHJlbmRlcmVyLmRvbUVsZW1lbnQpO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgODsgKytpKSB7XG4gICAgYWRkTW9kZWwoJ21vZGVscy9hc3Rlcm9pZC5qcycsICdtb2RlbHMvYXN0ZXJvaWQuanBnJywgYWRkQm91bmRpbmdTcGhlcmUpO1xuICB9XG5cbiAgYWRkU2hpcCgnbW9kZWxzL3NoaXAuanMnKTtcblxuICAvLyBjcmVhdGUgYSBwb2ludCBsaWdodFxuICB2YXIgcG9pbnRMaWdodCA9IG5ldyBUSFJFRS5Qb2ludExpZ2h0KDB4RkZGRkZGKTtcblxuICAvLyBzZXQgaXRzIHBvc2l0aW9uXG4gIHBvaW50TGlnaHQucG9zaXRpb24ueCA9IDEwO1xuICBwb2ludExpZ2h0LnBvc2l0aW9uLnkgPSA1MDtcbiAgcG9pbnRMaWdodC5wb3NpdGlvbi56ID0gMTMwO1xuXG4gIC8vIGFkZCB0byB0aGUgc2NlbmVcbiAgc2NlbmUuYWRkKHBvaW50TGlnaHQpO1xufVxuXG5mdW5jdGlvbiBhZGRNb2RlbChfbW9kZWwsIG1lc2hUZXh0dXJlLCBjYikge1xuICBjYiA9IGNiIHx8IGZ1bmN0aW9uICgpIHt9O1xuICB2YXIgbWF0ZXJpYWwgPSB1bmRlZmluZWQ7XG4gIGlmIChtZXNoVGV4dHVyZSlcbiAgICBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7IG1hcDogVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShtZXNoVGV4dHVyZSkgfSk7XG4gIHZhciBsb2FkZXIgPSBuZXcgVEhSRUUuSlNPTkxvYWRlcihmYWxzZSk7XG4gIGxvYWRlci5sb2FkKF9tb2RlbCwgZnVuY3Rpb24gKGdlb21ldHJ5LCBtYXRlcmlhbHMpIHtcbiAgICB2YXIgbWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7IC8vIG5ldyBUSFJFRS5NZXNoRmFjZU1hdGVyaWFsKG1hdGVyaWFscylcbiAgICB2YXIgbWVzaDIgPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpOyAvLyBuZXcgVEhSRUUuTWVzaEZhY2VNYXRlcmlhbChtYXRlcmlhbHMpXG4gICAgdmFyIG1lc2gzID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTsgLy8gbmV3IFRIUkVFLk1lc2hGYWNlTWF0ZXJpYWwobWF0ZXJpYWxzKVxuICAgIHZhciBtZXNoNCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7IC8vIG5ldyBUSFJFRS5NZXNoRmFjZU1hdGVyaWFsKG1hdGVyaWFscylcbiAgICBtZXNoLnBvc2l0aW9uLnogPSAwO1xuICAgIG1lc2gucG9zaXRpb24ueCA9IChNYXRoLnJhbmRvbSgpIC0gLjUpICogMTQ0MDtcbiAgICBtZXNoLnBvc2l0aW9uLnkgPSAoTWF0aC5yYW5kb20oKSAtIC41KSAqIDcwMDtcbiAgICBtZXNoLnJvdGF0aW9uLnggPSBtZXNoLnJvdGF0aW9uLnkgPSBtZXNoLnJvdGF0aW9uLnogPSAwO1xuICAgIG1lc2guc2NhbGUueCAgICA9IG1lc2guc2NhbGUueSAgICA9IG1lc2guc2NhbGUueiAgICA9IDYwO1xuXG4gICAgbWVzaDIucm90YXRpb24gPSBtZXNoMy5yb3RhdGlvbiA9IG1lc2g0LnJvdGF0aW9uID0gbWVzaC5yb3RhdGlvbjtcbiAgICBtZXNoMi5zY2FsZSA9IG1lc2gzLnNjYWxlID0gbWVzaDQuc2NhbGUgPSBtZXNoLnNjYWxlO1xuXG4gICAgLy8gbWVzaC5nZW9tZXRyeS5ib3VuZGluZ1NwaGVyZS5yYWRpdXMgLT0gLjI7XG5cbiAgICAvLyB3aGlsZSAoY29sbGlkZXNURVNUKG1lc2gpKSB7XG4gICAgLy8gICBtZXNoLnBvc2l0aW9uLnggPSAoTWF0aC5yYW5kb20oKSAtIC41KSAqIDE0NDA7XG4gICAgLy8gICBtZXNoLnBvc2l0aW9uLnkgPSAoTWF0aC5yYW5kb20oKSAtIC41KSAqIDcwMDtcbiAgICAvLyB9XG4gICAgbWVzaC5tYXRyaXhBdXRvVXBkYXRlID0gZmFsc2U7XG4gICAgbWVzaC51cGRhdGVNYXRyaXgoKTtcbiAgICBzY2VuZS5hZGQobWVzaCk7XG4gICAgc2NlbmUuYWRkKG1lc2gyKTtcbiAgICBzY2VuZS5hZGQobWVzaDMpO1xuICAgIHNjZW5lLmFkZChtZXNoNCk7XG4gICAgbWVzaGVzLnB1c2goY3JlYXRlQXN0ZXJvaWQobWVzaCwgbWVzaDIsIG1lc2gzLCBtZXNoNCkpO1xuICAgIGNiKG1lc2gpO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gYWRkU2hpcChfbW9kZWwpe1xuICB2YXIgbG9hZGVyID0gbmV3IFRIUkVFLkpTT05Mb2FkZXIoZmFsc2UpO1xuICBsb2FkZXIubG9hZChfbW9kZWwsIGZ1bmN0aW9uIChnZW9tZXRyeSwgbWF0ZXJpYWxzKSB7XG4gICAgdmFyIG1lc2ggPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSk7IC8vIG5ldyBUSFJFRS5NZXNoRmFjZU1hdGVyaWFsKG1hdGVyaWFscylcbiAgICB2YXIgbWVzaDIgPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSk7IC8vIG5ldyBUSFJFRS5NZXNoRmFjZU1hdGVyaWFsKG1hdGVyaWFscylcbiAgICB2YXIgbWVzaDMgPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSk7IC8vIG5ldyBUSFJFRS5NZXNoRmFjZU1hdGVyaWFsKG1hdGVyaWFscylcbiAgICB2YXIgbWVzaDQgPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSk7IC8vIG5ldyBUSFJFRS5NZXNoRmFjZU1hdGVyaWFsKG1hdGVyaWFscylcbiAgICBcbiAgICBtZXNoLnBvc2l0aW9uLnggPSBtZXNoLnBvc2l0aW9uLnkgPSBtZXNoLnBvc2l0aW9uLnogPSAwO1xuICAgIG1lc2gucm90YXRpb24ueCA9IG1lc2gucm90YXRpb24ueSA9IG1lc2gucm90YXRpb24ueiA9IDA7XG4gICAgbWVzaC5zY2FsZS54ICAgID0gbWVzaC5zY2FsZS55ICAgID0gbWVzaC5zY2FsZS56ICAgID0gMTtcblxuICAgIG1lc2gucG9zaXRpb24ueiA9IC0xMDA7XG4gICAgbWVzaC5yb3RhdGlvbi54ID0gOTA7XG5cbiAgICBtZXNoMi5yb3RhdGlvbiA9IG1lc2gzLnJvdGF0aW9uID0gbWVzaDQucm90YXRpb24gPSBtZXNoLnJvdGF0aW9uO1xuICAgIG1lc2gyLnNjYWxlID0gbWVzaDMuc2NhbGUgPSBtZXNoNC5zY2FsZSA9IG1lc2guc2NhbGU7XG5cbiAgICBtZXNoLm1hdHJpeEF1dG9VcGRhdGUgPSBmYWxzZTtcbiAgICBtZXNoLnVwZGF0ZU1hdHJpeCgpO1xuICAgIHNjZW5lLmFkZChtZXNoKTtcbiAgICBzY2VuZS5hZGQobWVzaDIpO1xuICAgIHNjZW5lLmFkZChtZXNoMyk7XG4gICAgc2NlbmUuYWRkKG1lc2g0KTtcbiAgICBzaGlwID0gbWVzaDtcblxuICAgIHBsYXllci5zZXRTaGlwKHNoaXAsIG1lc2gyLCBtZXNoMywgbWVzaDQpO1xuICB9KTtcblxuXG59XG5cbmZ1bmN0aW9uIGNvbGxpZGVzVEVTVChtZXNoKSB7XG4gIHZhciBtMiA9IG1lc2gucG9zaXRpb247XG4gIHZhciBkaXN0MiA9IG1lc2guZ2VvbWV0cnkuYm91bmRpbmdTcGhlcmUucmFkaXVzICogbWVzaC5zY2FsZS54O1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbWVzaGVzLmxlbmd0aDsgKytpKSB7XG5cbiAgICB2YXIgbTEgPSBtZXNoZXNbaV0ubWVzaC5wb3NpdGlvbjtcbiAgICB2YXIgZCA9IE1hdGguc3FydChNYXRoLnBvdyhtMS54IC0gbTIueCwgMikgKyBNYXRoLnBvdyhtMS55IC0gbTIueSwgMikgKyBNYXRoLnBvdyhtMS56IC0gbTIueiwgMikpO1xuXG4gICAgdmFyIGRpc3QgPSBkaXN0MiArIG1lc2hlc1tpXS5tZXNoLmdlb21ldHJ5LmJvdW5kaW5nU3BoZXJlLnJhZGl1cyAqIG1lc2hlc1tpXS5tZXNoLnNjYWxlLng7XG4gICAgaWYgKGQgPD0gZGlzdCkge1xuICAgIC8vIGlmIChkIDw9IDQwKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIGFkZEJvdW5kaW5nU3BoZXJlKG1lc2gpIHtcbiAgaWYgKCFERUJVRykgcmV0dXJuO1xuXG4gIHZhciByYWRpdXMgICA9IG1lc2guZ2VvbWV0cnkuYm91bmRpbmdTcGhlcmUucmFkaXVzXG4gICAgLCBzZWdtZW50cyA9IDE2XG4gICAgLCByaW5ncyAgICA9IDE2O1xuXG4gIHZhciBzcGhlcmUgPSBuZXcgVEhSRUUuTWVzaChcbiAgICBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkocmFkaXVzLCBzZWdtZW50cywgcmluZ3MpXG4gICAgLy8gbmV3IFRIUkVFLk1lc2hMYW1iZXJ0TWF0ZXJpYWwoeyBjb2xvcjogMHhDQzAwMDAgfSlcbiAgKTtcblxuICBzcGhlcmUuc2NhbGUgPSBtZXNoLnNjYWxlO1xuICBzcGhlcmUucG9zaXRpb24gPSBtZXNoLnBvc2l0aW9uO1xuXG4gIHNjZW5lLmFkZChzcGhlcmUpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVBc3Rlcm9pZChtZXNoLCBtZXNoMiwgbWVzaDMsIG1lc2g0KSB7XG4gIHZhciBTUEVFRCA9IDM7XG5cbiAgcmV0dXJuIHtcbiAgICByb3RYOiAoTWF0aC5yYW5kb20oKSAtIC41KSAvIDUwLFxuICAgIHJvdFk6IChNYXRoLnJhbmRvbSgpIC0gLjUpIC8gNTAsXG4gICAgZHg6IChNYXRoLnJhbmRvbSgpIC0gLjUpICogU1BFRUQsXG4gICAgZHk6IChNYXRoLnJhbmRvbSgpIC0gLjUpICogU1BFRUQsXG4gICAgbWVzaDogbWVzaCxcbiAgICBtZXNoMjogbWVzaDIsXG4gICAgbWVzaDM6IG1lc2gzLFxuICAgIG1lc2g0OiBtZXNoNFxuICB9O1xufVxuXG5mdW5jdGlvbiBhbmltYXRlKCkge1xuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYW5pbWF0ZSk7XG4gIHVwZGF0ZUFzdGVyb2lkcygpO1xuICB1cGRhdGVQbGF5ZXIoKTtcbiAgcmVuZGVyKCk7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZVBsYXllcigpIHtcbiAgaWYgKCFzaGlwKSByZXR1cm47XG5cbiAgaWYgKGlucC51cCgpKSB7XG4gICAgcGxheWVyLm1vdmVVcCgpO1xuICB9XG5cbiAgaWYgKGlucC5kb3duKCkpIHtcbiAgICBwbGF5ZXIubW92ZURvd24oKTtcbiAgfVxuXG4gIGlmIChpbnAubGVmdCgpKSB7XG4gICAgcGxheWVyLm1vdmVMZWZ0KCk7XG4gIH1cblxuICBpZiAoaW5wLnJpZ2h0KCkpIHtcbiAgICBwbGF5ZXIubW92ZVJpZ2h0KCk7XG4gIH1cblxuICBwbGF5ZXIudXBkYXRlKCk7XG4gIHNoaXAudXBkYXRlTWF0cml4KCk7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUFzdGVyb2lkcygpIHtcbiAgdmFyIFdJRFRIICA9IDE0NDA7XG4gIHZhciBIRUlHSFQgPSA3MDA7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBtZXNoZXMubGVuZ3RoOyArK2kpIHtcbiAgICB2YXIgYSA9IG1lc2hlc1tpXTtcblxuICAgIHZhciBvbGRYID0gYS5tZXNoLnBvc2l0aW9uLng7XG4gICAgdmFyIG9sZFkgPSBhLm1lc2gucG9zaXRpb24ueTtcblxuICAgIGEubWVzaC5wb3NpdGlvbi54ICs9IGEuZHg7XG4gICAgYS5tZXNoLnBvc2l0aW9uLnkgKz0gYS5keTtcblxuICAgIC8vIGlmIChjaGVja0NvbGxpc2lvbnMoaSkpIHtcbiAgICAvLyAgIGEubWVzaC5wb3NpdGlvbi54ID0gb2xkWDtcbiAgICAvLyAgIGEubWVzaC5wb3NpdGlvbi55ID0gb2xkWTtcbiAgICAvLyB9XG5cbiAgICBpZiAoYS5tZXNoLnBvc2l0aW9uLnggPiBXSURUSCAvIDIpIHtcbiAgICAgIGEubWVzaC5wb3NpdGlvbi54IC09IFdJRFRIO1xuICAgICAgLy8gYS5tZXNoLnBvc2l0aW9uLnggPSBXSURUSCAvIDI7XG4gICAgICAvLyBhLmR4ICo9IC0xO1xuICAgIH1cblxuICAgIGlmIChhLm1lc2gucG9zaXRpb24ueCA8IC1XSURUSCAvIDIpIHtcbiAgICAgIGEubWVzaC5wb3NpdGlvbi54ICs9IFdJRFRIO1xuICAgICAgLy8gYS5tZXNoLnBvc2l0aW9uLnggPSAtV0lEVEggLyAyO1xuICAgICAgLy8gYS5keCAqPSAtMTtcbiAgICB9XG5cbiAgICBpZiAoYS5tZXNoLnBvc2l0aW9uLnkgPiBIRUlHSFQgLyAyKSB7XG4gICAgICBhLm1lc2gucG9zaXRpb24ueSAtPSBIRUlHSFQ7XG4gICAgICAvLyBhLm1lc2gucG9zaXRpb24ueSA9IEhFSUdIVCAvIDI7XG4gICAgICAvLyBhLmR5ICo9IC0xO1xuICAgIH1cblxuICAgIGlmIChhLm1lc2gucG9zaXRpb24ueSA8IC1IRUlHSFQgLyAyKSB7XG4gICAgICBhLm1lc2gucG9zaXRpb24ueSArPSBIRUlHSFQ7XG4gICAgICAvLyBhLm1lc2gucG9zaXRpb24ueSA9IC1IRUlHSFQgLyAyO1xuICAgICAgLy8gYS5keSAqPSAtMTtcbiAgICB9XG5cblxuICAgIGEubWVzaDIucG9zaXRpb24ueSA9IGEubWVzaC5wb3NpdGlvbi55O1xuICAgIGEubWVzaDIucG9zaXRpb24ueiA9IGEubWVzaC5wb3NpdGlvbi56O1xuXG4gICAgaWYgKGEubWVzaC5wb3NpdGlvbi54ID4gMClcbiAgICAgIGEubWVzaDIucG9zaXRpb24ueCA9IGEubWVzaC5wb3NpdGlvbi54IC0gV0lEVEg7XG4gICAgZWxzZVxuICAgICAgYS5tZXNoMi5wb3NpdGlvbi54ID0gYS5tZXNoLnBvc2l0aW9uLnggKyBXSURUSDtcblxuICAgIGEubWVzaDMucG9zaXRpb24ueCA9IGEubWVzaC5wb3NpdGlvbi54O1xuICAgIGEubWVzaDMucG9zaXRpb24ueiA9IGEubWVzaC5wb3NpdGlvbi56O1xuXG4gICAgaWYgKGEubWVzaC5wb3NpdGlvbi55ID4gMClcbiAgICAgIGEubWVzaDMucG9zaXRpb24ueSA9IGEubWVzaC5wb3NpdGlvbi55IC0gSEVJR0hUO1xuICAgIGVsc2VcbiAgICAgIGEubWVzaDMucG9zaXRpb24ueSA9IGEubWVzaC5wb3NpdGlvbi55ICsgSEVJR0hUO1xuXG5cbiAgICBhLm1lc2g0LnBvc2l0aW9uLnogPSBhLm1lc2gucG9zaXRpb24uejtcblxuXG4gICAgaWYgKGEubWVzaC5wb3NpdGlvbi54ID4gMClcbiAgICAgIGEubWVzaDQucG9zaXRpb24ueCA9IGEubWVzaC5wb3NpdGlvbi54IC0gV0lEVEg7XG4gICAgZWxzZVxuICAgICAgYS5tZXNoNC5wb3NpdGlvbi54ID0gYS5tZXNoLnBvc2l0aW9uLnggKyBXSURUSDtcbiAgICBpZiAoYS5tZXNoLnBvc2l0aW9uLnkgPiAwKVxuICAgICAgYS5tZXNoNC5wb3NpdGlvbi55ID0gYS5tZXNoLnBvc2l0aW9uLnkgLSBIRUlHSFQ7XG4gICAgZWxzZVxuICAgICAgYS5tZXNoNC5wb3NpdGlvbi55ID0gYS5tZXNoLnBvc2l0aW9uLnkgKyBIRUlHSFQ7XG5cblxuXG4gICAgYS5tZXNoLnJvdGF0aW9uLnggKz0gYS5yb3RYO1xuICAgIGEubWVzaC5yb3RhdGlvbi55ICs9IGEucm90WTtcblxuICAgIGEubWVzaC51cGRhdGVNYXRyaXgoKTtcbiAgfVxufVxuXG5mdW5jdGlvbiByZW5kZXIoKSB7XG4gIHJlbmRlcmVyLnJlbmRlcihzY2VuZSwgY2FtZXJhKTtcbn1cblxuZnVuY3Rpb24gY2hlY2tDb2xsaXNpb25zKGopIHtcbiAgdmFyIG0yID0gbWVzaGVzW2pdLm1lc2gucG9zaXRpb247XG4gIHZhciBkaXN0MiA9IG1lc2hlc1tqXS5tZXNoLmdlb21ldHJ5LmJvdW5kaW5nU3BoZXJlLnJhZGl1cyAqIG1lc2hlc1tqXS5tZXNoLnNjYWxlLng7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBtZXNoZXMubGVuZ3RoOyArK2kpIHtcbiAgICBpZiAoaSA9PT0gaikgY29udGludWU7XG5cbiAgICB2YXIgbTEgPSBtZXNoZXNbaV0ubWVzaC5wb3NpdGlvbjtcbiAgICB2YXIgZCA9IE1hdGguc3FydChNYXRoLnBvdyhtMS54IC0gbTIueCwgMikgKyBNYXRoLnBvdyhtMS55IC0gbTIueSwgMikgKyBNYXRoLnBvdyhtMS56IC0gbTIueiwgMikpO1xuXG4gICAgdmFyIGRpc3QgPSBkaXN0MiArIG1lc2hlc1tpXS5tZXNoLmdlb21ldHJ5LmJvdW5kaW5nU3BoZXJlLnJhZGl1cyAqIG1lc2hlc1tpXS5tZXNoLnNjYWxlLng7XG4gICAgLy8gaWYgKGogPT0gMClcbiAgICAvLyAgIGNvbnNvbGUubG9nKGQsIGRpc3QpO1xuXG4gICAgaWYgKGQgPD0gZGlzdCkge1xuICAgIC8vIGlmIChkIDw9IDQwKSB7XG4gICAgICB2YXIgdGVtcFggPSBtZXNoZXNbaV0uZHg7XG4gICAgICB2YXIgdGVtcFkgPSBtZXNoZXNbaV0uZHk7XG5cbiAgICAgIG1lc2hlc1tpXS5keCA9IG1lc2hlc1tqXS5keDtcbiAgICAgIG1lc2hlc1tpXS5keSA9IG1lc2hlc1tqXS5keTtcblxuICAgICAgbWVzaGVzW2pdLmR4ID0gdGVtcFg7XG4gICAgICBtZXNoZXNbal0uZHkgPSB0ZW1wWTtcblxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuIiwidmFyIGtleXMgPSB7fTtcblxuJChkb2N1bWVudCkua2V5ZG93bihmdW5jdGlvbiAoZSkge1xuICBrZXlzW2Uua2V5Q29kZV0gPSB0cnVlO1xuLy8gICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuLy8gICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuLy8gICByZXR1cm4gZmFsc2U7XG59KTtcblxuJChkb2N1bWVudCkua2V5dXAoZnVuY3Rpb24gKGUpIHtcbiAga2V5c1tlLmtleUNvZGVdID0gZmFsc2U7XG4vLyAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4vLyAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4vLyAgIHJldHVybiBmYWxzZTtcbn0pO1xuXG52YXIgdGVzdCA9IHt9O1xuZXhwb3J0cy5sZWZ0ICA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIGtleXNbMzddIHx8IGtleXNbNjVdOyB9O1xuZXhwb3J0cy5yaWdodCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIGtleXNbMzldIHx8IGtleXNbNjhdOyB9O1xuZXhwb3J0cy51cCAgICA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIGtleXNbMzhdIHx8IGtleXNbODddOyB9O1xuZXhwb3J0cy5kb3duICA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIGtleXNbNDBdIHx8IGtleXNbODNdOyB9O1xuXG4vLyB3YXNkIGFuZCBhcnJvdyBrZXlzXG5cbmV4cG9ydHMucmVzZXRLZXlzID0gZnVuY3Rpb24gKCkge1xuICBmb3IgKHZhciBrZXkgaW4ga2V5cykge1xuICAgIGtleXNba2V5XSA9IGZhbHNlO1xuICB9XG59XG4iLCJ2YXIgV0lEVEggID0gMTQ0MFxuICAsIEhFSUdIVCA9IDcwMDtcblxudmFyIHNoaXA7XG5cbnZhciBtZXNoMiwgbWVzaDMsIG1lc2g0O1xuXG52YXIgdmVsb2NpdHkgPSB7XG4gIGR4OiAwLFxuICBkeTogMFxufVxuXG5leHBvcnRzLnNldFNoaXAgPSBmdW5jdGlvbiAodGhlU2hpcCwgbWVzaDIyLCBtZXNoMzMsIG1lc2g0NCkge1xuICBzaGlwID0gdGhlU2hpcDtcbiAgbWVzaDIgPSBtZXNoMjI7XG4gIG1lc2gzID0gbWVzaDMzO1xuICBtZXNoNCA9IG1lc2g0NDtcbn07XG5cbmV4cG9ydHMubW92ZUxlZnQgPSBmdW5jdGlvbiAoKSB7XG4gIHNoaXAucm90YXRpb24ueSAtPSBNYXRoLlBJIC8gMTgwICogNTtcbn07XG5cbmV4cG9ydHMubW92ZVJpZ2h0ID0gZnVuY3Rpb24gKCkge1xuICBzaGlwLnJvdGF0aW9uLnkgKz0gTWF0aC5QSSAvIDE4MCAqIDU7XG59O1xuXG5leHBvcnRzLm1vdmVVcCA9IGZ1bmN0aW9uICgpIHtcbiAgdmVsb2NpdHkuZHkgLT0gTWF0aC5jb3Moc2hpcC5yb3RhdGlvbi55KSAqIC41O1xuICB2ZWxvY2l0eS5keCArPSBNYXRoLnNpbihzaGlwLnJvdGF0aW9uLnkpICogLjU7XG5cbiAgaWYgKHZlbG9jaXR5LmR4ID4gMTAwKVxuICBcdHZlbG9jaXR5LmR4ID0gMTAwO1xuICBpZiAodmVsb2NpdHkuZHkgPiAxMDApXG4gIFx0dmVsb2NpdHkuZHkgPSAxMDA7XG5cbiAgaWYgKHZlbG9jaXR5LmR4IDwgLTEwMClcbiAgXHR2ZWxvY2l0eS5keCA9IC0xMDA7XG4gIGlmICh2ZWxvY2l0eS5keSA8IC0xMDApXG4gIFx0dmVsb2NpdHkuZHkgPSAtMTAwO1xuXG59O1xuXG5leHBvcnRzLm1vdmVEb3duID0gZnVuY3Rpb24gKCkge1xuXG59O1xuXG5leHBvcnRzLnVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgc2hpcC5wb3NpdGlvbi54ICs9IHZlbG9jaXR5LmR4O1xuICBzaGlwLnBvc2l0aW9uLnkgKz0gdmVsb2NpdHkuZHk7XG5cbiAgaWYgKHNoaXAucG9zaXRpb24ueCA+PSBXSURUSC8yKSBzaGlwLnBvc2l0aW9uLnggLT0gV0lEVEg7XG4gIGlmIChzaGlwLnBvc2l0aW9uLnggPD0gLVdJRFRILzIpIHNoaXAucG9zaXRpb24ueCArPSBXSURUSDtcbiAgaWYgKHNoaXAucG9zaXRpb24ueSA+PSBIRUlHSFQvMikgc2hpcC5wb3NpdGlvbi55IC09IEhFSUdIVDtcbiAgaWYgKHNoaXAucG9zaXRpb24ueSA8PSAtSEVJR0hULzIpIHNoaXAucG9zaXRpb24ueSArPSBIRUlHSFQ7XG5cbiAgICBtZXNoMi5wb3NpdGlvbi55ID0gc2hpcC5wb3NpdGlvbi55O1xuICAgIG1lc2gyLnBvc2l0aW9uLnogPSBzaGlwLnBvc2l0aW9uLno7XG5cbiAgICBpZiAoc2hpcC5wb3NpdGlvbi54ID4gMClcbiAgICAgIG1lc2gyLnBvc2l0aW9uLnggPSBzaGlwLnBvc2l0aW9uLnggLSBXSURUSDtcbiAgICBlbHNlXG4gICAgICBtZXNoMi5wb3NpdGlvbi54ID0gc2hpcC5wb3NpdGlvbi54ICsgV0lEVEg7XG5cbiAgICBtZXNoMy5wb3NpdGlvbi54ID0gc2hpcC5wb3NpdGlvbi54O1xuICAgIG1lc2gzLnBvc2l0aW9uLnogPSBzaGlwLnBvc2l0aW9uLno7XG5cbiAgICBpZiAoc2hpcC5wb3NpdGlvbi55ID4gMClcbiAgICAgIG1lc2gzLnBvc2l0aW9uLnkgPSBzaGlwLnBvc2l0aW9uLnkgLSBIRUlHSFQ7XG4gICAgZWxzZVxuICAgICAgbWVzaDMucG9zaXRpb24ueSA9IHNoaXAucG9zaXRpb24ueSArIEhFSUdIVDtcblxuXG4gICAgbWVzaDQucG9zaXRpb24ueiA9IHNoaXAucG9zaXRpb24uejtcblxuXG4gICAgaWYgKHNoaXAucG9zaXRpb24ueCA+IDApXG4gICAgICBtZXNoNC5wb3NpdGlvbi54ID0gc2hpcC5wb3NpdGlvbi54IC0gV0lEVEg7XG4gICAgZWxzZVxuICAgICAgbWVzaDQucG9zaXRpb24ueCA9IHNoaXAucG9zaXRpb24ueCArIFdJRFRIO1xuICAgIGlmIChzaGlwLnBvc2l0aW9uLnkgPiAwKVxuICAgICAgbWVzaDQucG9zaXRpb24ueSA9IHNoaXAucG9zaXRpb24ueSAtIEhFSUdIVDtcbiAgICBlbHNlXG4gICAgICBtZXNoNC5wb3NpdGlvbi55ID0gc2hpcC5wb3NpdGlvbi55ICsgSEVJR0hUO1xufTtcbiJdfQ==
;