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
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvc2Nvb2JzL0Rldi9qcy9hc3Rlcm9pZHMvY2xpZW50L21haW4uanMiLCIvVXNlcnMvc2Nvb2JzL0Rldi9qcy9hc3Rlcm9pZHMvY2xpZW50L3Rlc3QuanMiLCIvVXNlcnMvc2Nvb2JzL0Rldi9qcy9hc3Rlcm9pZHMvY2xpZW50L2lucHV0LmpzIiwiL1VzZXJzL3Njb29icy9EZXYvanMvYXN0ZXJvaWRzL2NsaWVudC9wbGF5ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyJ3aW5kb3cucmVxdWlyZSA9IHJlcXVpcmU7XG5cbnZhciB0ZXN0ID0gcmVxdWlyZSgnLi90ZXN0Jyk7XG5cbnRlc3QuaW5pdCgpO1xudGVzdC5zdGFydCgpO1xuIiwidmFyIHJlbmRlcmVyXG4gICwgY2FtZXJhXG4gICwgc2NlbmVcbiAgLCBzaGlwXG4gICwgbWVzaGVzID0gW107XG5cbnZhciBpbnAgICAgPSByZXF1aXJlKCcuL2lucHV0JylcbiAgLCBwbGF5ZXIgPSByZXF1aXJlKCcuL3BsYXllcicpO1xuXG52YXIgREVCVUcgPSBmYWxzZTtcblxuZXhwb3J0cy5pbml0ID0gaW5pdGlhbGl6ZTtcbmV4cG9ydHMuc3RhcnQgPSBhbmltYXRlO1xuXG5mdW5jdGlvbiBpbml0aWFsaXplKCkge1xuICAvLyBzZXQgdGhlIHNjZW5lIHNpemVcbiAgdmFyIFdJRFRIICA9IDE0NDBcbiAgICAsIEhFSUdIVCA9IDcwMDtcblxuICAvLyBzZXQgc29tZSBjYW1lcmEgYXR0cmlidXRlc1xuICB2YXIgVklFV19BTkdMRSA9IDQ1XG4gICAgLCBBU1BFQ1QgICAgID0gV0lEVEggLyBIRUlHSFRcbiAgICAsIE5FQVIgICAgICAgPSAwLjFcbiAgICAsIEZBUiAgICAgICAgPSAxMDAwMDtcblxuICAvLyBnZXQgdGhlIERPTSBlbGVtZW50IHRvIGF0dGFjaCB0b1xuICAvLyAtIGFzc3VtZSB3ZSd2ZSBnb3QgalF1ZXJ5IHRvIGhhbmRcbiAgdmFyICRjb250YWluZXIgPSAkKCcjdGVzdCcpO1xuXG4gIC8vIGNyZWF0ZSBhIFdlYkdMIHJlbmRlcmVyLCBjYW1lcmFcbiAgLy8gYW5kIGEgc2NlbmVcbiAgcmVuZGVyZXIgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcigpO1xuLy8gIGNhbWVyYSAgID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKFZJRVdfQU5HTEUsIEFTUEVDVCwgTkVBUiwgRkFSKTtcbiAgY2FtZXJhICAgPSBuZXcgVEhSRUUuT3J0aG9ncmFwaGljQ2FtZXJhKFdJRFRIIC8gMiwgLVdJRFRIIC8gMiwgSEVJR0hUIC8gMiwgLUhFSUdIVCAvIDIsIEhFSUdIVCAvIDIsIE5FQVIsIEZBUik7XG4gIHNjZW5lICAgID0gbmV3IFRIUkVFLlNjZW5lKCk7XG5cbiAgLy8gYWRkIHRoZSBjYW1lcmEgdG8gdGhlIHNjZW5lXG4gIHNjZW5lLmFkZChjYW1lcmEpO1xuXG4gIC8vIHN0YXJ0IHRoZSByZW5kZXJlclxuICByZW5kZXJlci5zZXRTaXplKFdJRFRILCBIRUlHSFQpO1xuXG4gIC8vIGF0dGFjaCB0aGUgcmVuZGVyLXN1cHBsaWVkIERPTSBlbGVtZW50XG4gICRjb250YWluZXIuYXBwZW5kKHJlbmRlcmVyLmRvbUVsZW1lbnQpO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgODsgKytpKSB7XG4gICAgYWRkTW9kZWwoJ21vZGVscy9hc3Rlcm9pZC5qcycsICdtb2RlbHMvYXN0ZXJvaWQuanBnJywgYWRkQm91bmRpbmdTcGhlcmUpO1xuICB9XG5cbiAgYWRkU2hpcCgnbW9kZWxzL3NoaXAuanMnKTtcblxuICAvLyBjcmVhdGUgYSBwb2ludCBsaWdodFxuICB2YXIgcG9pbnRMaWdodCA9IG5ldyBUSFJFRS5Qb2ludExpZ2h0KDB4RkZGRkZGKTtcblxuICAvLyBzZXQgaXRzIHBvc2l0aW9uXG4gIHBvaW50TGlnaHQucG9zaXRpb24ueCA9IDEwO1xuICBwb2ludExpZ2h0LnBvc2l0aW9uLnkgPSA1MDtcbiAgcG9pbnRMaWdodC5wb3NpdGlvbi56ID0gMTMwO1xuXG4gIC8vIGFkZCB0byB0aGUgc2NlbmVcbiAgc2NlbmUuYWRkKHBvaW50TGlnaHQpO1xufVxuXG5mdW5jdGlvbiBhZGRNb2RlbChfbW9kZWwsIG1lc2hUZXh0dXJlLCBjYikge1xuICBjYiA9IGNiIHx8IGZ1bmN0aW9uICgpIHt9O1xuICB2YXIgbWF0ZXJpYWwgPSB1bmRlZmluZWQ7XG4gIGlmIChtZXNoVGV4dHVyZSlcbiAgICBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7IG1hcDogVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShtZXNoVGV4dHVyZSkgfSk7XG4gIHZhciBsb2FkZXIgPSBuZXcgVEhSRUUuSlNPTkxvYWRlcihmYWxzZSk7XG4gIGxvYWRlci5sb2FkKF9tb2RlbCwgZnVuY3Rpb24gKGdlb21ldHJ5LCBtYXRlcmlhbHMpIHtcbiAgICB2YXIgbWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7IC8vIG5ldyBUSFJFRS5NZXNoRmFjZU1hdGVyaWFsKG1hdGVyaWFscylcbiAgICBtZXNoLnBvc2l0aW9uLnogPSAwO1xuICAgIG1lc2gucG9zaXRpb24ueCA9IChNYXRoLnJhbmRvbSgpIC0gLjUpICogMTQ0MDtcbiAgICBtZXNoLnBvc2l0aW9uLnkgPSAoTWF0aC5yYW5kb20oKSAtIC41KSAqIDcwMDtcbiAgICBtZXNoLnJvdGF0aW9uLnggPSBtZXNoLnJvdGF0aW9uLnkgPSBtZXNoLnJvdGF0aW9uLnogPSAwO1xuICAgIG1lc2guc2NhbGUueCAgICA9IG1lc2guc2NhbGUueSAgICA9IG1lc2guc2NhbGUueiAgICA9IDYwO1xuXG4gICAgbWVzaC5nZW9tZXRyeS5ib3VuZGluZ1NwaGVyZS5yYWRpdXMgLT0gLjI7XG5cbiAgICB3aGlsZSAoY29sbGlkZXNURVNUKG1lc2gpKSB7XG4gICAgICBtZXNoLnBvc2l0aW9uLnggPSAoTWF0aC5yYW5kb20oKSAtIC41KSAqIDE0NDA7XG4gICAgICBtZXNoLnBvc2l0aW9uLnkgPSAoTWF0aC5yYW5kb20oKSAtIC41KSAqIDcwMDtcbiAgICB9XG4gICAgbWVzaC5tYXRyaXhBdXRvVXBkYXRlID0gZmFsc2U7XG4gICAgbWVzaC51cGRhdGVNYXRyaXgoKTtcbiAgICBzY2VuZS5hZGQobWVzaCk7XG4gICAgbWVzaGVzLnB1c2goY3JlYXRlQXN0ZXJvaWQobWVzaCkpO1xuICAgIGNiKG1lc2gpO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gYWRkU2hpcChfbW9kZWwpe1xuICB2YXIgbG9hZGVyID0gbmV3IFRIUkVFLkpTT05Mb2FkZXIoZmFsc2UpO1xuICBsb2FkZXIubG9hZChfbW9kZWwsIGZ1bmN0aW9uIChnZW9tZXRyeSwgbWF0ZXJpYWxzKSB7XG4gICAgdmFyIG1lc2ggPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSk7IC8vIG5ldyBUSFJFRS5NZXNoRmFjZU1hdGVyaWFsKG1hdGVyaWFscylcbiAgICBtZXNoLnBvc2l0aW9uLnggPSBtZXNoLnBvc2l0aW9uLnkgPSBtZXNoLnBvc2l0aW9uLnogPSAwO1xuICAgIG1lc2gucm90YXRpb24ueCA9IG1lc2gucm90YXRpb24ueSA9IG1lc2gucm90YXRpb24ueiA9IDA7XG4gICAgbWVzaC5zY2FsZS54ICAgID0gbWVzaC5zY2FsZS55ICAgID0gbWVzaC5zY2FsZS56ICAgID0gMTtcblxuICAgIG1lc2gucG9zaXRpb24ueiA9IC0xMDA7XG4gICAgbWVzaC5yb3RhdGlvbi54ID0gOTA7XG5cbiAgICBtZXNoLm1hdHJpeEF1dG9VcGRhdGUgPSBmYWxzZTtcbiAgICBtZXNoLnVwZGF0ZU1hdHJpeCgpO1xuICAgIHNjZW5lLmFkZChtZXNoKTtcbiAgICBzaGlwID0gbWVzaDtcblxuICAgIHBsYXllci5zZXRTaGlwKHNoaXApO1xuICB9KTtcblxuXG59XG5cbmZ1bmN0aW9uIGNvbGxpZGVzVEVTVChtZXNoKSB7XG4gIHZhciBtMiA9IG1lc2gucG9zaXRpb247XG4gIHZhciBkaXN0MiA9IG1lc2guZ2VvbWV0cnkuYm91bmRpbmdTcGhlcmUucmFkaXVzICogbWVzaC5zY2FsZS54O1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbWVzaGVzLmxlbmd0aDsgKytpKSB7XG5cbiAgICB2YXIgbTEgPSBtZXNoZXNbaV0ubWVzaC5wb3NpdGlvbjtcbiAgICB2YXIgZCA9IE1hdGguc3FydChNYXRoLnBvdyhtMS54IC0gbTIueCwgMikgKyBNYXRoLnBvdyhtMS55IC0gbTIueSwgMikgKyBNYXRoLnBvdyhtMS56IC0gbTIueiwgMikpO1xuXG4gICAgdmFyIGRpc3QgPSBkaXN0MiArIG1lc2hlc1tpXS5tZXNoLmdlb21ldHJ5LmJvdW5kaW5nU3BoZXJlLnJhZGl1cyAqIG1lc2hlc1tpXS5tZXNoLnNjYWxlLng7XG4gICAgaWYgKGQgPD0gZGlzdCkge1xuICAgIC8vIGlmIChkIDw9IDQwKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIGFkZEJvdW5kaW5nU3BoZXJlKG1lc2gpIHtcbiAgaWYgKCFERUJVRykgcmV0dXJuO1xuXG4gIHZhciByYWRpdXMgICA9IG1lc2guZ2VvbWV0cnkuYm91bmRpbmdTcGhlcmUucmFkaXVzXG4gICAgLCBzZWdtZW50cyA9IDE2XG4gICAgLCByaW5ncyAgICA9IDE2O1xuXG4gIHZhciBzcGhlcmUgPSBuZXcgVEhSRUUuTWVzaChcbiAgICBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkocmFkaXVzLCBzZWdtZW50cywgcmluZ3MpXG4gICAgLy8gbmV3IFRIUkVFLk1lc2hMYW1iZXJ0TWF0ZXJpYWwoeyBjb2xvcjogMHhDQzAwMDAgfSlcbiAgKTtcblxuICBzcGhlcmUuc2NhbGUgPSBtZXNoLnNjYWxlO1xuICBzcGhlcmUucG9zaXRpb24gPSBtZXNoLnBvc2l0aW9uO1xuXG4gIHNjZW5lLmFkZChzcGhlcmUpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVBc3Rlcm9pZChtZXNoKSB7XG4gIHZhciBTUEVFRCA9IDM7XG5cbiAgcmV0dXJuIHtcbiAgICByb3RYOiAoTWF0aC5yYW5kb20oKSAtIC41KSAvIDUwLFxuICAgIHJvdFk6IChNYXRoLnJhbmRvbSgpIC0gLjUpIC8gNTAsXG4gICAgZHg6IChNYXRoLnJhbmRvbSgpIC0gLjUpICogU1BFRUQsXG4gICAgZHk6IChNYXRoLnJhbmRvbSgpIC0gLjUpICogU1BFRUQsXG4gICAgbWVzaDogbWVzaFxuICB9O1xufVxuXG5mdW5jdGlvbiBhbmltYXRlKCkge1xuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYW5pbWF0ZSk7XG4gIHVwZGF0ZUFzdGVyb2lkcygpO1xuICB1cGRhdGVQbGF5ZXIoKTtcbiAgcmVuZGVyKCk7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZVBsYXllcigpIHtcbiAgaWYgKCFzaGlwKSByZXR1cm47XG5cbiAgaWYgKGlucC51cCgpKSB7XG4gICAgcGxheWVyLm1vdmVVcCgpO1xuICB9XG5cbiAgaWYgKGlucC5kb3duKCkpIHtcbiAgICBwbGF5ZXIubW92ZURvd24oKTtcbiAgfVxuXG4gIGlmIChpbnAubGVmdCgpKSB7XG4gICAgcGxheWVyLm1vdmVMZWZ0KCk7XG4gIH1cblxuICBpZiAoaW5wLnJpZ2h0KCkpIHtcbiAgICBwbGF5ZXIubW92ZVJpZ2h0KCk7XG4gIH1cblxuICBwbGF5ZXIudXBkYXRlKCk7XG4gIHNoaXAudXBkYXRlTWF0cml4KCk7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUFzdGVyb2lkcygpIHtcbiAgdmFyIFdJRFRIICA9IDE0NDA7XG4gIHZhciBIRUlHSFQgPSA3MDA7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBtZXNoZXMubGVuZ3RoOyArK2kpIHtcbiAgICB2YXIgYSA9IG1lc2hlc1tpXTtcblxuICAgIHZhciBvbGRYID0gYS5tZXNoLnBvc2l0aW9uLng7XG4gICAgdmFyIG9sZFkgPSBhLm1lc2gucG9zaXRpb24ueTtcblxuICAgIGEubWVzaC5wb3NpdGlvbi54ICs9IGEuZHg7XG4gICAgYS5tZXNoLnBvc2l0aW9uLnkgKz0gYS5keTtcblxuICAgIGlmIChjaGVja0NvbGxpc2lvbnMoaSkpIHtcbiAgICAgIGEubWVzaC5wb3NpdGlvbi54ID0gb2xkWDtcbiAgICAgIGEubWVzaC5wb3NpdGlvbi55ID0gb2xkWTtcbiAgICB9XG5cbiAgICBpZiAoYS5tZXNoLnBvc2l0aW9uLnggPiBXSURUSCAvIDIpIHtcbiAgICAgIGEubWVzaC5wb3NpdGlvbi54ID0gV0lEVEggLyAyO1xuICAgICAgYS5keCAqPSAtMTtcbiAgICB9XG5cbiAgICBpZiAoYS5tZXNoLnBvc2l0aW9uLnggPCAtV0lEVEggLyAyKSB7XG4gICAgICBhLm1lc2gucG9zaXRpb24ueCA9IC1XSURUSCAvIDI7XG4gICAgICBhLmR4ICo9IC0xO1xuICAgIH1cblxuICAgIGlmIChhLm1lc2gucG9zaXRpb24ueSA+IEhFSUdIVCAvIDIpIHtcbiAgICAgIGEubWVzaC5wb3NpdGlvbi55ID0gSEVJR0hUIC8gMjtcbiAgICAgIGEuZHkgKj0gLTE7XG4gICAgfVxuXG4gICAgaWYgKGEubWVzaC5wb3NpdGlvbi55IDwgLUhFSUdIVCAvIDIpIHtcbiAgICAgIGEubWVzaC5wb3NpdGlvbi55ID0gLUhFSUdIVCAvIDI7XG4gICAgICBhLmR5ICo9IC0xO1xuICAgIH1cblxuICAgIGEubWVzaC5yb3RhdGlvbi54ICs9IGEucm90WDtcbiAgICBhLm1lc2gucm90YXRpb24ueSArPSBhLnJvdFk7XG5cbiAgICBhLm1lc2gudXBkYXRlTWF0cml4KCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gcmVuZGVyKCkge1xuICByZW5kZXJlci5yZW5kZXIoc2NlbmUsIGNhbWVyYSk7XG59XG5cbmZ1bmN0aW9uIGNoZWNrQ29sbGlzaW9ucyhqKSB7XG4gIHZhciBtMiA9IG1lc2hlc1tqXS5tZXNoLnBvc2l0aW9uO1xuICB2YXIgZGlzdDIgPSBtZXNoZXNbal0ubWVzaC5nZW9tZXRyeS5ib3VuZGluZ1NwaGVyZS5yYWRpdXMgKiBtZXNoZXNbal0ubWVzaC5zY2FsZS54O1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbWVzaGVzLmxlbmd0aDsgKytpKSB7XG4gICAgaWYgKGkgPT09IGopIGNvbnRpbnVlO1xuXG4gICAgdmFyIG0xID0gbWVzaGVzW2ldLm1lc2gucG9zaXRpb247XG4gICAgdmFyIGQgPSBNYXRoLnNxcnQoTWF0aC5wb3cobTEueCAtIG0yLngsIDIpICsgTWF0aC5wb3cobTEueSAtIG0yLnksIDIpICsgTWF0aC5wb3cobTEueiAtIG0yLnosIDIpKTtcblxuICAgIHZhciBkaXN0ID0gZGlzdDIgKyBtZXNoZXNbaV0ubWVzaC5nZW9tZXRyeS5ib3VuZGluZ1NwaGVyZS5yYWRpdXMgKiBtZXNoZXNbaV0ubWVzaC5zY2FsZS54O1xuICAgIC8vIGlmIChqID09IDApXG4gICAgLy8gICBjb25zb2xlLmxvZyhkLCBkaXN0KTtcblxuICAgIGlmIChkIDw9IGRpc3QpIHtcbiAgICAvLyBpZiAoZCA8PSA0MCkge1xuICAgICAgdmFyIHRlbXBYID0gbWVzaGVzW2ldLmR4O1xuICAgICAgdmFyIHRlbXBZID0gbWVzaGVzW2ldLmR5O1xuXG4gICAgICBtZXNoZXNbaV0uZHggPSBtZXNoZXNbal0uZHg7XG4gICAgICBtZXNoZXNbaV0uZHkgPSBtZXNoZXNbal0uZHk7XG5cbiAgICAgIG1lc2hlc1tqXS5keCA9IHRlbXBYO1xuICAgICAgbWVzaGVzW2pdLmR5ID0gdGVtcFk7XG5cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmYWxzZTtcbn1cbiIsInZhciBrZXlzID0ge307XG5cbiQoZG9jdW1lbnQpLmtleWRvd24oZnVuY3Rpb24gKGUpIHtcbiAga2V5c1tlLmtleUNvZGVdID0gdHJ1ZTtcbi8vICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbi8vICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbi8vICAgcmV0dXJuIGZhbHNlO1xufSk7XG5cbiQoZG9jdW1lbnQpLmtleXVwKGZ1bmN0aW9uIChlKSB7XG4gIGtleXNbZS5rZXlDb2RlXSA9IGZhbHNlO1xuLy8gICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuLy8gICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuLy8gICByZXR1cm4gZmFsc2U7XG59KTtcblxudmFyIHRlc3QgPSB7fTtcbmV4cG9ydHMubGVmdCAgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBrZXlzWzM3XSB8fCBrZXlzWzY1XTsgfTtcbmV4cG9ydHMucmlnaHQgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBrZXlzWzM5XSB8fCBrZXlzWzY4XTsgfTtcbmV4cG9ydHMudXAgICAgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBrZXlzWzM4XSB8fCBrZXlzWzg3XTsgfTtcbmV4cG9ydHMuZG93biAgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBrZXlzWzQwXSB8fCBrZXlzWzgzXTsgfTtcblxuLy8gd2FzZCBhbmQgYXJyb3cga2V5c1xuXG5leHBvcnRzLnJlc2V0S2V5cyA9IGZ1bmN0aW9uICgpIHtcbiAgZm9yICh2YXIga2V5IGluIGtleXMpIHtcbiAgICBrZXlzW2tleV0gPSBmYWxzZTtcbiAgfVxufVxuIiwidmFyIHNoaXA7XG5cbnZhciB2ZWxvY2l0eSA9IHtcbiAgZHg6IDAsXG4gIGR5OiAwXG59XG5cbmV4cG9ydHMuc2V0U2hpcCA9IGZ1bmN0aW9uICh0aGVTaGlwKSB7XG4gIHNoaXAgPSB0aGVTaGlwO1xufTtcblxuZXhwb3J0cy5tb3ZlTGVmdCA9IGZ1bmN0aW9uICgpIHtcbiAgc2hpcC5yb3RhdGlvbi55IC09IE1hdGguUEkgLyAxODAgKiA1O1xufTtcblxuZXhwb3J0cy5tb3ZlUmlnaHQgPSBmdW5jdGlvbiAoKSB7XG4gIHNoaXAucm90YXRpb24ueSArPSBNYXRoLlBJIC8gMTgwICogNTtcbn07XG5cbmV4cG9ydHMubW92ZVVwID0gZnVuY3Rpb24gKCkge1xuICB2ZWxvY2l0eS5keSAtPSBNYXRoLmNvcyhzaGlwLnJvdGF0aW9uLnkpICogLjU7XG4gIHZlbG9jaXR5LmR4ICs9IE1hdGguc2luKHNoaXAucm90YXRpb24ueSkgKiAuNTtcbn07XG5cbmV4cG9ydHMubW92ZURvd24gPSBmdW5jdGlvbiAoKSB7XG5cbn07XG5cbmV4cG9ydHMudXBkYXRlID0gZnVuY3Rpb24gKCkge1xuICBzaGlwLnBvc2l0aW9uLnggKz0gdmVsb2NpdHkuZHg7XG4gIHNoaXAucG9zaXRpb24ueSArPSB2ZWxvY2l0eS5keTtcbn07XG4iXX0=
;