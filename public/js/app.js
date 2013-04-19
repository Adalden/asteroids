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
    var mesh = new THREE.Mesh(geometry); // new THREE.MeshFaceMaterial(materials)
    mesh.position.x = mesh.position.y = mesh.position.z = 0;
    mesh.rotation.x = mesh.rotation.y = mesh.rotation.z = 0;
    mesh.scale.x    = mesh.scale.y    = mesh.scale.z    = 1;

    mesh.position.z = -100;
    mesh.rotation.x = 90;

    mesh.matrixAutoUpdate = false;
    mesh.updateMatrix();
    scene.add(mesh);
    ship = mesh;

    player.setShip(ship);
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
var ship;

var velocity = {
  dx: 0,
  dy: 0
}

exports.setShip = function (theShip) {
  ship = theShip;
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
};

exports.moveDown = function () {

};

exports.update = function () {
  ship.position.x += velocity.dx;
  ship.position.y += velocity.dy;
};

},{}]},{},[1])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvZGFsbGluLm9zbXVuL2NvZGUvYXN0ZXJvaWRzL2NsaWVudC9tYWluLmpzIiwiL1VzZXJzL2RhbGxpbi5vc211bi9jb2RlL2FzdGVyb2lkcy9jbGllbnQvdGVzdC5qcyIsIi9Vc2Vycy9kYWxsaW4ub3NtdW4vY29kZS9hc3Rlcm9pZHMvY2xpZW50L2lucHV0LmpzIiwiL1VzZXJzL2RhbGxpbi5vc211bi9jb2RlL2FzdGVyb2lkcy9jbGllbnQvcGxheWVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaFJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsid2luZG93LnJlcXVpcmUgPSByZXF1aXJlO1xuXG52YXIgdGVzdCA9IHJlcXVpcmUoJy4vdGVzdCcpO1xuXG50ZXN0LmluaXQoKTtcbnRlc3Quc3RhcnQoKTtcbiIsInZhciByZW5kZXJlclxuICAsIGNhbWVyYVxuICAsIHNjZW5lXG4gICwgc2hpcFxuICAsIG1lc2hlcyA9IFtdO1xuXG52YXIgaW5wICAgID0gcmVxdWlyZSgnLi9pbnB1dCcpXG4gICwgcGxheWVyID0gcmVxdWlyZSgnLi9wbGF5ZXInKTtcblxudmFyIERFQlVHID0gZmFsc2U7XG5cbmV4cG9ydHMuaW5pdCA9IGluaXRpYWxpemU7XG5leHBvcnRzLnN0YXJ0ID0gYW5pbWF0ZTtcblxuZnVuY3Rpb24gaW5pdGlhbGl6ZSgpIHtcbiAgLy8gc2V0IHRoZSBzY2VuZSBzaXplXG4gIHZhciBXSURUSCAgPSAxNDQwXG4gICAgLCBIRUlHSFQgPSA3MDA7XG5cbiAgLy8gc2V0IHNvbWUgY2FtZXJhIGF0dHJpYnV0ZXNcbiAgdmFyIFZJRVdfQU5HTEUgPSA0NVxuICAgICwgQVNQRUNUICAgICA9IFdJRFRIIC8gSEVJR0hUXG4gICAgLCBORUFSICAgICAgID0gMC4xXG4gICAgLCBGQVIgICAgICAgID0gMTAwMDA7XG5cbiAgLy8gZ2V0IHRoZSBET00gZWxlbWVudCB0byBhdHRhY2ggdG9cbiAgLy8gLSBhc3N1bWUgd2UndmUgZ290IGpRdWVyeSB0byBoYW5kXG4gIHZhciAkY29udGFpbmVyID0gJCgnI3Rlc3QnKTtcblxuICAvLyBjcmVhdGUgYSBXZWJHTCByZW5kZXJlciwgY2FtZXJhXG4gIC8vIGFuZCBhIHNjZW5lXG4gIHJlbmRlcmVyID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyZXIoKTtcbi8vICBjYW1lcmEgICA9IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYShWSUVXX0FOR0xFLCBBU1BFQ1QsIE5FQVIsIEZBUik7XG4gIGNhbWVyYSAgID0gbmV3IFRIUkVFLk9ydGhvZ3JhcGhpY0NhbWVyYShXSURUSCAvIDIsIC1XSURUSCAvIDIsIEhFSUdIVCAvIDIsIC1IRUlHSFQgLyAyLCBIRUlHSFQgLyAyLCBORUFSLCBGQVIpO1xuICBzY2VuZSAgICA9IG5ldyBUSFJFRS5TY2VuZSgpO1xuXG4gIC8vIGFkZCB0aGUgY2FtZXJhIHRvIHRoZSBzY2VuZVxuICBzY2VuZS5hZGQoY2FtZXJhKTtcblxuICAvLyBzdGFydCB0aGUgcmVuZGVyZXJcbiAgcmVuZGVyZXIuc2V0U2l6ZShXSURUSCwgSEVJR0hUKTtcblxuICAvLyBhdHRhY2ggdGhlIHJlbmRlci1zdXBwbGllZCBET00gZWxlbWVudFxuICAkY29udGFpbmVyLmFwcGVuZChyZW5kZXJlci5kb21FbGVtZW50KTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IDg7ICsraSkge1xuICAgIGFkZE1vZGVsKCdtb2RlbHMvYXN0ZXJvaWQuanMnLCAnbW9kZWxzL2FzdGVyb2lkLmpwZycsIGFkZEJvdW5kaW5nU3BoZXJlKTtcbiAgfVxuXG4gIGFkZFNoaXAoJ21vZGVscy9zaGlwLmpzJyk7XG5cbiAgLy8gY3JlYXRlIGEgcG9pbnQgbGlnaHRcbiAgdmFyIHBvaW50TGlnaHQgPSBuZXcgVEhSRUUuUG9pbnRMaWdodCgweEZGRkZGRik7XG5cbiAgLy8gc2V0IGl0cyBwb3NpdGlvblxuICBwb2ludExpZ2h0LnBvc2l0aW9uLnggPSAxMDtcbiAgcG9pbnRMaWdodC5wb3NpdGlvbi55ID0gNTA7XG4gIHBvaW50TGlnaHQucG9zaXRpb24ueiA9IDEzMDtcblxuICAvLyBhZGQgdG8gdGhlIHNjZW5lXG4gIHNjZW5lLmFkZChwb2ludExpZ2h0KTtcbn1cblxuZnVuY3Rpb24gYWRkTW9kZWwoX21vZGVsLCBtZXNoVGV4dHVyZSwgY2IpIHtcbiAgY2IgPSBjYiB8fCBmdW5jdGlvbiAoKSB7fTtcbiAgdmFyIG1hdGVyaWFsID0gdW5kZWZpbmVkO1xuICBpZiAobWVzaFRleHR1cmUpXG4gICAgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoeyBtYXA6IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUobWVzaFRleHR1cmUpIH0pO1xuICB2YXIgbG9hZGVyID0gbmV3IFRIUkVFLkpTT05Mb2FkZXIoZmFsc2UpO1xuICBsb2FkZXIubG9hZChfbW9kZWwsIGZ1bmN0aW9uIChnZW9tZXRyeSwgbWF0ZXJpYWxzKSB7XG4gICAgdmFyIG1lc2ggPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpOyAvLyBuZXcgVEhSRUUuTWVzaEZhY2VNYXRlcmlhbChtYXRlcmlhbHMpXG4gICAgbWVzaC5wb3NpdGlvbi56ID0gMDtcbiAgICBtZXNoLnBvc2l0aW9uLnggPSAoTWF0aC5yYW5kb20oKSAtIC41KSAqIDE0NDA7XG4gICAgbWVzaC5wb3NpdGlvbi55ID0gKE1hdGgucmFuZG9tKCkgLSAuNSkgKiA3MDA7XG4gICAgbWVzaC5yb3RhdGlvbi54ID0gbWVzaC5yb3RhdGlvbi55ID0gbWVzaC5yb3RhdGlvbi56ID0gMDtcbiAgICBtZXNoLnNjYWxlLnggICAgPSBtZXNoLnNjYWxlLnkgICAgPSBtZXNoLnNjYWxlLnogICAgPSA2MDtcblxuICAgIG1lc2guZ2VvbWV0cnkuYm91bmRpbmdTcGhlcmUucmFkaXVzIC09IC4yO1xuXG4gICAgd2hpbGUgKGNvbGxpZGVzVEVTVChtZXNoKSkge1xuICAgICAgbWVzaC5wb3NpdGlvbi54ID0gKE1hdGgucmFuZG9tKCkgLSAuNSkgKiAxNDQwO1xuICAgICAgbWVzaC5wb3NpdGlvbi55ID0gKE1hdGgucmFuZG9tKCkgLSAuNSkgKiA3MDA7XG4gICAgfVxuICAgIG1lc2gubWF0cml4QXV0b1VwZGF0ZSA9IGZhbHNlO1xuICAgIG1lc2gudXBkYXRlTWF0cml4KCk7XG4gICAgc2NlbmUuYWRkKG1lc2gpO1xuICAgIG1lc2hlcy5wdXNoKGNyZWF0ZUFzdGVyb2lkKG1lc2gpKTtcbiAgICBjYihtZXNoKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGFkZFNoaXAoX21vZGVsKXtcbiAgdmFyIGxvYWRlciA9IG5ldyBUSFJFRS5KU09OTG9hZGVyKGZhbHNlKTtcbiAgbG9hZGVyLmxvYWQoX21vZGVsLCBmdW5jdGlvbiAoZ2VvbWV0cnksIG1hdGVyaWFscykge1xuICAgIHZhciBtZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnkpOyAvLyBuZXcgVEhSRUUuTWVzaEZhY2VNYXRlcmlhbChtYXRlcmlhbHMpXG4gICAgbWVzaC5wb3NpdGlvbi54ID0gbWVzaC5wb3NpdGlvbi55ID0gbWVzaC5wb3NpdGlvbi56ID0gMDtcbiAgICBtZXNoLnJvdGF0aW9uLnggPSBtZXNoLnJvdGF0aW9uLnkgPSBtZXNoLnJvdGF0aW9uLnogPSAwO1xuICAgIG1lc2guc2NhbGUueCAgICA9IG1lc2guc2NhbGUueSAgICA9IG1lc2guc2NhbGUueiAgICA9IDE7XG5cbiAgICBtZXNoLnBvc2l0aW9uLnogPSAtMTAwO1xuICAgIG1lc2gucm90YXRpb24ueCA9IDkwO1xuXG4gICAgbWVzaC5tYXRyaXhBdXRvVXBkYXRlID0gZmFsc2U7XG4gICAgbWVzaC51cGRhdGVNYXRyaXgoKTtcbiAgICBzY2VuZS5hZGQobWVzaCk7XG4gICAgc2hpcCA9IG1lc2g7XG5cbiAgICBwbGF5ZXIuc2V0U2hpcChzaGlwKTtcbiAgfSk7XG5cblxufVxuXG5mdW5jdGlvbiBjb2xsaWRlc1RFU1QobWVzaCkge1xuICB2YXIgbTIgPSBtZXNoLnBvc2l0aW9uO1xuICB2YXIgZGlzdDIgPSBtZXNoLmdlb21ldHJ5LmJvdW5kaW5nU3BoZXJlLnJhZGl1cyAqIG1lc2guc2NhbGUueDtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IG1lc2hlcy5sZW5ndGg7ICsraSkge1xuXG4gICAgdmFyIG0xID0gbWVzaGVzW2ldLm1lc2gucG9zaXRpb247XG4gICAgdmFyIGQgPSBNYXRoLnNxcnQoTWF0aC5wb3cobTEueCAtIG0yLngsIDIpICsgTWF0aC5wb3cobTEueSAtIG0yLnksIDIpICsgTWF0aC5wb3cobTEueiAtIG0yLnosIDIpKTtcblxuICAgIHZhciBkaXN0ID0gZGlzdDIgKyBtZXNoZXNbaV0ubWVzaC5nZW9tZXRyeS5ib3VuZGluZ1NwaGVyZS5yYWRpdXMgKiBtZXNoZXNbaV0ubWVzaC5zY2FsZS54O1xuICAgIGlmIChkIDw9IGRpc3QpIHtcbiAgICAvLyBpZiAoZCA8PSA0MCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBhZGRCb3VuZGluZ1NwaGVyZShtZXNoKSB7XG4gIGlmICghREVCVUcpIHJldHVybjtcblxuICB2YXIgcmFkaXVzICAgPSBtZXNoLmdlb21ldHJ5LmJvdW5kaW5nU3BoZXJlLnJhZGl1c1xuICAgICwgc2VnbWVudHMgPSAxNlxuICAgICwgcmluZ3MgICAgPSAxNjtcblxuICB2YXIgc3BoZXJlID0gbmV3IFRIUkVFLk1lc2goXG4gICAgbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KHJhZGl1cywgc2VnbWVudHMsIHJpbmdzKVxuICAgIC8vIG5ldyBUSFJFRS5NZXNoTGFtYmVydE1hdGVyaWFsKHsgY29sb3I6IDB4Q0MwMDAwIH0pXG4gICk7XG5cbiAgc3BoZXJlLnNjYWxlID0gbWVzaC5zY2FsZTtcbiAgc3BoZXJlLnBvc2l0aW9uID0gbWVzaC5wb3NpdGlvbjtcblxuICBzY2VuZS5hZGQoc3BoZXJlKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlQXN0ZXJvaWQobWVzaCkge1xuICB2YXIgU1BFRUQgPSAzO1xuXG4gIHJldHVybiB7XG4gICAgcm90WDogKE1hdGgucmFuZG9tKCkgLSAuNSkgLyA1MCxcbiAgICByb3RZOiAoTWF0aC5yYW5kb20oKSAtIC41KSAvIDUwLFxuICAgIGR4OiAoTWF0aC5yYW5kb20oKSAtIC41KSAqIFNQRUVELFxuICAgIGR5OiAoTWF0aC5yYW5kb20oKSAtIC41KSAqIFNQRUVELFxuICAgIG1lc2g6IG1lc2hcbiAgfTtcbn1cblxuZnVuY3Rpb24gYW5pbWF0ZSgpIHtcbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGFuaW1hdGUpO1xuICB1cGRhdGVBc3Rlcm9pZHMoKTtcbiAgdXBkYXRlUGxheWVyKCk7XG4gIHJlbmRlcigpO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVQbGF5ZXIoKSB7XG4gIGlmICghc2hpcCkgcmV0dXJuO1xuXG4gIGlmIChpbnAudXAoKSkge1xuICAgIHBsYXllci5tb3ZlVXAoKTtcbiAgfVxuXG4gIGlmIChpbnAuZG93bigpKSB7XG4gICAgcGxheWVyLm1vdmVEb3duKCk7XG4gIH1cblxuICBpZiAoaW5wLmxlZnQoKSkge1xuICAgIHBsYXllci5tb3ZlTGVmdCgpO1xuICB9XG5cbiAgaWYgKGlucC5yaWdodCgpKSB7XG4gICAgcGxheWVyLm1vdmVSaWdodCgpO1xuICB9XG5cbiAgcGxheWVyLnVwZGF0ZSgpO1xuICBzaGlwLnVwZGF0ZU1hdHJpeCgpO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVBc3Rlcm9pZHMoKSB7XG4gIHZhciBXSURUSCAgPSAxNDQwO1xuICB2YXIgSEVJR0hUID0gNzAwO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbWVzaGVzLmxlbmd0aDsgKytpKSB7XG4gICAgdmFyIGEgPSBtZXNoZXNbaV07XG5cbiAgICB2YXIgb2xkWCA9IGEubWVzaC5wb3NpdGlvbi54O1xuICAgIHZhciBvbGRZID0gYS5tZXNoLnBvc2l0aW9uLnk7XG5cbiAgICBhLm1lc2gucG9zaXRpb24ueCArPSBhLmR4O1xuICAgIGEubWVzaC5wb3NpdGlvbi55ICs9IGEuZHk7XG5cbiAgICBpZiAoY2hlY2tDb2xsaXNpb25zKGkpKSB7XG4gICAgICBhLm1lc2gucG9zaXRpb24ueCA9IG9sZFg7XG4gICAgICBhLm1lc2gucG9zaXRpb24ueSA9IG9sZFk7XG4gICAgfVxuXG4gICAgaWYgKGEubWVzaC5wb3NpdGlvbi54ID4gV0lEVEggLyAyKSB7XG4gICAgICBhLm1lc2gucG9zaXRpb24ueCA9IFdJRFRIIC8gMjtcbiAgICAgIGEuZHggKj0gLTE7XG4gICAgfVxuXG4gICAgaWYgKGEubWVzaC5wb3NpdGlvbi54IDwgLVdJRFRIIC8gMikge1xuICAgICAgYS5tZXNoLnBvc2l0aW9uLnggPSAtV0lEVEggLyAyO1xuICAgICAgYS5keCAqPSAtMTtcbiAgICB9XG5cbiAgICBpZiAoYS5tZXNoLnBvc2l0aW9uLnkgPiBIRUlHSFQgLyAyKSB7XG4gICAgICBhLm1lc2gucG9zaXRpb24ueSA9IEhFSUdIVCAvIDI7XG4gICAgICBhLmR5ICo9IC0xO1xuICAgIH1cblxuICAgIGlmIChhLm1lc2gucG9zaXRpb24ueSA8IC1IRUlHSFQgLyAyKSB7XG4gICAgICBhLm1lc2gucG9zaXRpb24ueSA9IC1IRUlHSFQgLyAyO1xuICAgICAgYS5keSAqPSAtMTtcbiAgICB9XG5cbiAgICBhLm1lc2gucm90YXRpb24ueCArPSBhLnJvdFg7XG4gICAgYS5tZXNoLnJvdGF0aW9uLnkgKz0gYS5yb3RZO1xuXG4gICAgYS5tZXNoLnVwZGF0ZU1hdHJpeCgpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgcmVuZGVyZXIucmVuZGVyKHNjZW5lLCBjYW1lcmEpO1xufVxuXG5mdW5jdGlvbiBjaGVja0NvbGxpc2lvbnMoaikge1xuICB2YXIgbTIgPSBtZXNoZXNbal0ubWVzaC5wb3NpdGlvbjtcbiAgdmFyIGRpc3QyID0gbWVzaGVzW2pdLm1lc2guZ2VvbWV0cnkuYm91bmRpbmdTcGhlcmUucmFkaXVzICogbWVzaGVzW2pdLm1lc2guc2NhbGUueDtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IG1lc2hlcy5sZW5ndGg7ICsraSkge1xuICAgIGlmIChpID09PSBqKSBjb250aW51ZTtcblxuICAgIHZhciBtMSA9IG1lc2hlc1tpXS5tZXNoLnBvc2l0aW9uO1xuICAgIHZhciBkID0gTWF0aC5zcXJ0KE1hdGgucG93KG0xLnggLSBtMi54LCAyKSArIE1hdGgucG93KG0xLnkgLSBtMi55LCAyKSArIE1hdGgucG93KG0xLnogLSBtMi56LCAyKSk7XG5cbiAgICB2YXIgZGlzdCA9IGRpc3QyICsgbWVzaGVzW2ldLm1lc2guZ2VvbWV0cnkuYm91bmRpbmdTcGhlcmUucmFkaXVzICogbWVzaGVzW2ldLm1lc2guc2NhbGUueDtcbiAgICAvLyBpZiAoaiA9PSAwKVxuICAgIC8vICAgY29uc29sZS5sb2coZCwgZGlzdCk7XG5cbiAgICBpZiAoZCA8PSBkaXN0KSB7XG4gICAgLy8gaWYgKGQgPD0gNDApIHtcbiAgICAgIHZhciB0ZW1wWCA9IG1lc2hlc1tpXS5keDtcbiAgICAgIHZhciB0ZW1wWSA9IG1lc2hlc1tpXS5keTtcblxuICAgICAgbWVzaGVzW2ldLmR4ID0gbWVzaGVzW2pdLmR4O1xuICAgICAgbWVzaGVzW2ldLmR5ID0gbWVzaGVzW2pdLmR5O1xuXG4gICAgICBtZXNoZXNbal0uZHggPSB0ZW1wWDtcbiAgICAgIG1lc2hlc1tqXS5keSA9IHRlbXBZO1xuXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59XG4iLCJ2YXIga2V5cyA9IHt9O1xuXG4kKGRvY3VtZW50KS5rZXlkb3duKGZ1bmN0aW9uIChlKSB7XG4gIGtleXNbZS5rZXlDb2RlXSA9IHRydWU7XG4vLyAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4vLyAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4vLyAgIHJldHVybiBmYWxzZTtcbn0pO1xuXG4kKGRvY3VtZW50KS5rZXl1cChmdW5jdGlvbiAoZSkge1xuICBrZXlzW2Uua2V5Q29kZV0gPSBmYWxzZTtcbi8vICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbi8vICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbi8vICAgcmV0dXJuIGZhbHNlO1xufSk7XG5cbnZhciB0ZXN0ID0ge307XG5leHBvcnRzLmxlZnQgID0gZnVuY3Rpb24gKCkgeyByZXR1cm4ga2V5c1szN10gfHwga2V5c1s2NV07IH07XG5leHBvcnRzLnJpZ2h0ID0gZnVuY3Rpb24gKCkgeyByZXR1cm4ga2V5c1szOV0gfHwga2V5c1s2OF07IH07XG5leHBvcnRzLnVwICAgID0gZnVuY3Rpb24gKCkgeyByZXR1cm4ga2V5c1szOF0gfHwga2V5c1s4N107IH07XG5leHBvcnRzLmRvd24gID0gZnVuY3Rpb24gKCkgeyByZXR1cm4ga2V5c1s0MF0gfHwga2V5c1s4M107IH07XG5cbi8vIHdhc2QgYW5kIGFycm93IGtleXNcblxuZXhwb3J0cy5yZXNldEtleXMgPSBmdW5jdGlvbiAoKSB7XG4gIGZvciAodmFyIGtleSBpbiBrZXlzKSB7XG4gICAga2V5c1trZXldID0gZmFsc2U7XG4gIH1cbn1cbiIsInZhciBzaGlwO1xuXG52YXIgdmVsb2NpdHkgPSB7XG4gIGR4OiAwLFxuICBkeTogMFxufVxuXG5leHBvcnRzLnNldFNoaXAgPSBmdW5jdGlvbiAodGhlU2hpcCkge1xuICBzaGlwID0gdGhlU2hpcDtcbn07XG5cbmV4cG9ydHMubW92ZUxlZnQgPSBmdW5jdGlvbiAoKSB7XG4gIHNoaXAucm90YXRpb24ueSAtPSBNYXRoLlBJIC8gMTgwICogNTtcbn07XG5cbmV4cG9ydHMubW92ZVJpZ2h0ID0gZnVuY3Rpb24gKCkge1xuICBzaGlwLnJvdGF0aW9uLnkgKz0gTWF0aC5QSSAvIDE4MCAqIDU7XG59O1xuXG5leHBvcnRzLm1vdmVVcCA9IGZ1bmN0aW9uICgpIHtcbiAgdmVsb2NpdHkuZHkgLT0gTWF0aC5jb3Moc2hpcC5yb3RhdGlvbi55KSAqIC41O1xuICB2ZWxvY2l0eS5keCArPSBNYXRoLnNpbihzaGlwLnJvdGF0aW9uLnkpICogLjU7XG59O1xuXG5leHBvcnRzLm1vdmVEb3duID0gZnVuY3Rpb24gKCkge1xuXG59O1xuXG5leHBvcnRzLnVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgc2hpcC5wb3NpdGlvbi54ICs9IHZlbG9jaXR5LmR4O1xuICBzaGlwLnBvc2l0aW9uLnkgKz0gdmVsb2NpdHkuZHk7XG59O1xuIl19
;