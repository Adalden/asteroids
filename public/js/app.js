;(function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0](function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){
window.require = require;

var test = require('./test');

test.init();
test.start();

},{"./test":2}],2:[function(require,module,exports){
var renderer
  , camera
  , scene
  , meshes = [];

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
  var material = new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture(meshTexture) });
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

},{}]},{},[1])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvZGFsbGluLm9zbXVuL2NvZGUvYXN0ZXJvaWRzL2NsaWVudC9tYWluLmpzIiwiL1VzZXJzL2RhbGxpbi5vc211bi9jb2RlL2FzdGVyb2lkcy9jbGllbnQvdGVzdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbIndpbmRvdy5yZXF1aXJlID0gcmVxdWlyZTtcblxudmFyIHRlc3QgPSByZXF1aXJlKCcuL3Rlc3QnKTtcblxudGVzdC5pbml0KCk7XG50ZXN0LnN0YXJ0KCk7XG4iLCJ2YXIgcmVuZGVyZXJcbiAgLCBjYW1lcmFcbiAgLCBzY2VuZVxuICAsIG1lc2hlcyA9IFtdO1xuXG52YXIgREVCVUcgPSB0cnVlO1xuXG5leHBvcnRzLmluaXQgPSBpbml0aWFsaXplO1xuZXhwb3J0cy5zdGFydCA9IGFuaW1hdGU7XG5cbmZ1bmN0aW9uIGluaXRpYWxpemUoKSB7XG4gIC8vIHNldCB0aGUgc2NlbmUgc2l6ZVxuICB2YXIgV0lEVEggID0gMTQ0MFxuICAgICwgSEVJR0hUID0gNzAwO1xuXG4gIC8vIHNldCBzb21lIGNhbWVyYSBhdHRyaWJ1dGVzXG4gIHZhciBWSUVXX0FOR0xFID0gNDVcbiAgICAsIEFTUEVDVCAgICAgPSBXSURUSCAvIEhFSUdIVFxuICAgICwgTkVBUiAgICAgICA9IDAuMVxuICAgICwgRkFSICAgICAgICA9IDEwMDAwO1xuXG4gIC8vIGdldCB0aGUgRE9NIGVsZW1lbnQgdG8gYXR0YWNoIHRvXG4gIC8vIC0gYXNzdW1lIHdlJ3ZlIGdvdCBqUXVlcnkgdG8gaGFuZFxuICB2YXIgJGNvbnRhaW5lciA9ICQoJyN0ZXN0Jyk7XG5cbiAgLy8gY3JlYXRlIGEgV2ViR0wgcmVuZGVyZXIsIGNhbWVyYVxuICAvLyBhbmQgYSBzY2VuZVxuICByZW5kZXJlciA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlcmVyKCk7XG4vLyAgY2FtZXJhICAgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoVklFV19BTkdMRSwgQVNQRUNULCBORUFSLCBGQVIpO1xuICBjYW1lcmEgICA9IG5ldyBUSFJFRS5PcnRob2dyYXBoaWNDYW1lcmEoV0lEVEggLyAyLCAtV0lEVEggLyAyLCBIRUlHSFQgLyAyLCAtSEVJR0hUIC8gMiwgSEVJR0hUIC8gMiwgTkVBUiwgRkFSKTtcbiAgc2NlbmUgICAgPSBuZXcgVEhSRUUuU2NlbmUoKTtcblxuICAvLyBhZGQgdGhlIGNhbWVyYSB0byB0aGUgc2NlbmVcbiAgc2NlbmUuYWRkKGNhbWVyYSk7XG5cbiAgLy8gc3RhcnQgdGhlIHJlbmRlcmVyXG4gIHJlbmRlcmVyLnNldFNpemUoV0lEVEgsIEhFSUdIVCk7XG5cbiAgLy8gYXR0YWNoIHRoZSByZW5kZXItc3VwcGxpZWQgRE9NIGVsZW1lbnRcbiAgJGNvbnRhaW5lci5hcHBlbmQocmVuZGVyZXIuZG9tRWxlbWVudCk7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCA4OyArK2kpIHtcbiAgICBhZGRNb2RlbCgnbW9kZWxzL2FzdGVyb2lkLmpzJywgJ21vZGVscy9hc3Rlcm9pZC5qcGcnLCBhZGRCb3VuZGluZ1NwaGVyZSk7XG4gIH1cblxuICAvLyBjcmVhdGUgYSBwb2ludCBsaWdodFxuICB2YXIgcG9pbnRMaWdodCA9IG5ldyBUSFJFRS5Qb2ludExpZ2h0KDB4RkZGRkZGKTtcblxuICAvLyBzZXQgaXRzIHBvc2l0aW9uXG4gIHBvaW50TGlnaHQucG9zaXRpb24ueCA9IDEwO1xuICBwb2ludExpZ2h0LnBvc2l0aW9uLnkgPSA1MDtcbiAgcG9pbnRMaWdodC5wb3NpdGlvbi56ID0gMTMwO1xuXG4gIC8vIGFkZCB0byB0aGUgc2NlbmVcbiAgc2NlbmUuYWRkKHBvaW50TGlnaHQpO1xufVxuXG5mdW5jdGlvbiBhZGRNb2RlbChfbW9kZWwsIG1lc2hUZXh0dXJlLCBjYikge1xuICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoeyBtYXA6IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUobWVzaFRleHR1cmUpIH0pO1xuICB2YXIgbG9hZGVyID0gbmV3IFRIUkVFLkpTT05Mb2FkZXIoZmFsc2UpO1xuICBsb2FkZXIubG9hZChfbW9kZWwsIGZ1bmN0aW9uIChnZW9tZXRyeSwgbWF0ZXJpYWxzKSB7XG4gICAgdmFyIG1lc2ggPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpOyAvLyBuZXcgVEhSRUUuTWVzaEZhY2VNYXRlcmlhbChtYXRlcmlhbHMpXG4gICAgbWVzaC5wb3NpdGlvbi56ID0gMDtcbiAgICBtZXNoLnBvc2l0aW9uLnggPSAoTWF0aC5yYW5kb20oKSAtIC41KSAqIDE0NDA7XG4gICAgbWVzaC5wb3NpdGlvbi55ID0gKE1hdGgucmFuZG9tKCkgLSAuNSkgKiA3MDA7XG4gICAgbWVzaC5yb3RhdGlvbi54ID0gbWVzaC5yb3RhdGlvbi55ID0gbWVzaC5yb3RhdGlvbi56ID0gMDtcbiAgICBtZXNoLnNjYWxlLnggICAgPSBtZXNoLnNjYWxlLnkgICAgPSBtZXNoLnNjYWxlLnogICAgPSA2MDtcblxuICAgIG1lc2guZ2VvbWV0cnkuYm91bmRpbmdTcGhlcmUucmFkaXVzIC09IC4yO1xuXG4gICAgd2hpbGUgKGNvbGxpZGVzVEVTVChtZXNoKSkge1xuICAgICAgbWVzaC5wb3NpdGlvbi54ID0gKE1hdGgucmFuZG9tKCkgLSAuNSkgKiAxNDQwO1xuICAgICAgbWVzaC5wb3NpdGlvbi55ID0gKE1hdGgucmFuZG9tKCkgLSAuNSkgKiA3MDA7XG4gICAgfVxuICAgIG1lc2gubWF0cml4QXV0b1VwZGF0ZSA9IGZhbHNlO1xuICAgIG1lc2gudXBkYXRlTWF0cml4KCk7XG4gICAgc2NlbmUuYWRkKG1lc2gpO1xuICAgIG1lc2hlcy5wdXNoKGNyZWF0ZUFzdGVyb2lkKG1lc2gpKTtcbiAgICBjYihtZXNoKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGNvbGxpZGVzVEVTVChtZXNoKSB7XG4gIHZhciBtMiA9IG1lc2gucG9zaXRpb247XG4gIHZhciBkaXN0MiA9IG1lc2guZ2VvbWV0cnkuYm91bmRpbmdTcGhlcmUucmFkaXVzICogbWVzaC5zY2FsZS54O1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbWVzaGVzLmxlbmd0aDsgKytpKSB7XG5cbiAgICB2YXIgbTEgPSBtZXNoZXNbaV0ubWVzaC5wb3NpdGlvbjtcbiAgICB2YXIgZCA9IE1hdGguc3FydChNYXRoLnBvdyhtMS54IC0gbTIueCwgMikgKyBNYXRoLnBvdyhtMS55IC0gbTIueSwgMikgKyBNYXRoLnBvdyhtMS56IC0gbTIueiwgMikpO1xuXG4gICAgdmFyIGRpc3QgPSBkaXN0MiArIG1lc2hlc1tpXS5tZXNoLmdlb21ldHJ5LmJvdW5kaW5nU3BoZXJlLnJhZGl1cyAqIG1lc2hlc1tpXS5tZXNoLnNjYWxlLng7XG4gICAgaWYgKGQgPD0gZGlzdCkge1xuICAgIC8vIGlmIChkIDw9IDQwKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIGFkZEJvdW5kaW5nU3BoZXJlKG1lc2gpIHtcbiAgaWYgKCFERUJVRykgcmV0dXJuO1xuXG4gIHZhciByYWRpdXMgICA9IG1lc2guZ2VvbWV0cnkuYm91bmRpbmdTcGhlcmUucmFkaXVzXG4gICAgLCBzZWdtZW50cyA9IDE2XG4gICAgLCByaW5ncyAgICA9IDE2O1xuXG4gIHZhciBzcGhlcmUgPSBuZXcgVEhSRUUuTWVzaChcbiAgICBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkocmFkaXVzLCBzZWdtZW50cywgcmluZ3MpXG4gICAgLy8gbmV3IFRIUkVFLk1lc2hMYW1iZXJ0TWF0ZXJpYWwoeyBjb2xvcjogMHhDQzAwMDAgfSlcbiAgKTtcblxuICBzcGhlcmUuc2NhbGUgPSBtZXNoLnNjYWxlO1xuICBzcGhlcmUucG9zaXRpb24gPSBtZXNoLnBvc2l0aW9uO1xuXG4gIHNjZW5lLmFkZChzcGhlcmUpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVBc3Rlcm9pZChtZXNoKSB7XG4gIHZhciBTUEVFRCA9IDM7XG5cbiAgcmV0dXJuIHtcbiAgICByb3RYOiAoTWF0aC5yYW5kb20oKSAtIC41KSAvIDUwLFxuICAgIHJvdFk6IChNYXRoLnJhbmRvbSgpIC0gLjUpIC8gNTAsXG4gICAgZHg6IChNYXRoLnJhbmRvbSgpIC0gLjUpICogU1BFRUQsXG4gICAgZHk6IChNYXRoLnJhbmRvbSgpIC0gLjUpICogU1BFRUQsXG4gICAgbWVzaDogbWVzaFxuICB9O1xufVxuXG5mdW5jdGlvbiBhbmltYXRlKCkge1xuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYW5pbWF0ZSk7XG4gIHVwZGF0ZSgpO1xuICByZW5kZXIoKTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlKCkge1xuICB2YXIgV0lEVEggID0gMTQ0MDtcbiAgdmFyIEhFSUdIVCA9IDcwMDtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IG1lc2hlcy5sZW5ndGg7ICsraSkge1xuICAgIHZhciBhID0gbWVzaGVzW2ldO1xuXG4gICAgdmFyIG9sZFggPSBhLm1lc2gucG9zaXRpb24ueDtcbiAgICB2YXIgb2xkWSA9IGEubWVzaC5wb3NpdGlvbi55O1xuXG4gICAgYS5tZXNoLnBvc2l0aW9uLnggKz0gYS5keDtcbiAgICBhLm1lc2gucG9zaXRpb24ueSArPSBhLmR5O1xuXG4gICAgaWYgKGNoZWNrQ29sbGlzaW9ucyhpKSkge1xuICAgICAgYS5tZXNoLnBvc2l0aW9uLnggPSBvbGRYO1xuICAgICAgYS5tZXNoLnBvc2l0aW9uLnkgPSBvbGRZO1xuICAgIH1cblxuICAgIGlmIChhLm1lc2gucG9zaXRpb24ueCA+IFdJRFRIIC8gMikge1xuICAgICAgYS5tZXNoLnBvc2l0aW9uLnggPSBXSURUSCAvIDI7XG4gICAgICBhLmR4ICo9IC0xO1xuICAgIH1cblxuICAgIGlmIChhLm1lc2gucG9zaXRpb24ueCA8IC1XSURUSCAvIDIpIHtcbiAgICAgIGEubWVzaC5wb3NpdGlvbi54ID0gLVdJRFRIIC8gMjtcbiAgICAgIGEuZHggKj0gLTE7XG4gICAgfVxuXG4gICAgaWYgKGEubWVzaC5wb3NpdGlvbi55ID4gSEVJR0hUIC8gMikge1xuICAgICAgYS5tZXNoLnBvc2l0aW9uLnkgPSBIRUlHSFQgLyAyO1xuICAgICAgYS5keSAqPSAtMTtcbiAgICB9XG5cbiAgICBpZiAoYS5tZXNoLnBvc2l0aW9uLnkgPCAtSEVJR0hUIC8gMikge1xuICAgICAgYS5tZXNoLnBvc2l0aW9uLnkgPSAtSEVJR0hUIC8gMjtcbiAgICAgIGEuZHkgKj0gLTE7XG4gICAgfVxuXG4gICAgYS5tZXNoLnJvdGF0aW9uLnggKz0gYS5yb3RYO1xuICAgIGEubWVzaC5yb3RhdGlvbi55ICs9IGEucm90WTtcblxuICAgIGEubWVzaC51cGRhdGVNYXRyaXgoKTtcbiAgfVxufVxuXG5mdW5jdGlvbiByZW5kZXIoKSB7XG4gIHJlbmRlcmVyLnJlbmRlcihzY2VuZSwgY2FtZXJhKTtcbn1cblxuZnVuY3Rpb24gY2hlY2tDb2xsaXNpb25zKGopIHtcbiAgdmFyIG0yID0gbWVzaGVzW2pdLm1lc2gucG9zaXRpb247XG4gIHZhciBkaXN0MiA9IG1lc2hlc1tqXS5tZXNoLmdlb21ldHJ5LmJvdW5kaW5nU3BoZXJlLnJhZGl1cyAqIG1lc2hlc1tqXS5tZXNoLnNjYWxlLng7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBtZXNoZXMubGVuZ3RoOyArK2kpIHtcbiAgICBpZiAoaSA9PT0gaikgY29udGludWU7XG5cbiAgICB2YXIgbTEgPSBtZXNoZXNbaV0ubWVzaC5wb3NpdGlvbjtcbiAgICB2YXIgZCA9IE1hdGguc3FydChNYXRoLnBvdyhtMS54IC0gbTIueCwgMikgKyBNYXRoLnBvdyhtMS55IC0gbTIueSwgMikgKyBNYXRoLnBvdyhtMS56IC0gbTIueiwgMikpO1xuXG4gICAgdmFyIGRpc3QgPSBkaXN0MiArIG1lc2hlc1tpXS5tZXNoLmdlb21ldHJ5LmJvdW5kaW5nU3BoZXJlLnJhZGl1cyAqIG1lc2hlc1tpXS5tZXNoLnNjYWxlLng7XG4gICAgLy8gaWYgKGogPT0gMClcbiAgICAvLyAgIGNvbnNvbGUubG9nKGQsIGRpc3QpO1xuXG4gICAgaWYgKGQgPD0gZGlzdCkge1xuICAgIC8vIGlmIChkIDw9IDQwKSB7XG4gICAgICB2YXIgdGVtcFggPSBtZXNoZXNbaV0uZHg7XG4gICAgICB2YXIgdGVtcFkgPSBtZXNoZXNbaV0uZHk7XG5cbiAgICAgIG1lc2hlc1tpXS5keCA9IG1lc2hlc1tqXS5keDtcbiAgICAgIG1lc2hlc1tpXS5keSA9IG1lc2hlc1tqXS5keTtcblxuICAgICAgbWVzaGVzW2pdLmR4ID0gdGVtcFg7XG4gICAgICBtZXNoZXNbal0uZHkgPSB0ZW1wWTtcblxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuIl19
;