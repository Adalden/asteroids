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
    mesh.position.x = Math.random() * 420 - 210;
    mesh.position.y = Math.random() * 180 - 90;
    mesh.rotation.x = mesh.rotation.y = mesh.rotation.z = 0;
    mesh.scale.x    = mesh.scale.y    = mesh.scale.z    = 20;

    while (collidesTEST(mesh)) {
      mesh.position.x = Math.random() * 420 - 210;
      mesh.position.y = Math.random() * 180 - 90;
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
  return {
    rotX: (Math.random() - .5) / 50,
    rotY: (Math.random() - .5) / 50,
    dx: (Math.random() - .5) / 2,
    dy: (Math.random() - .5) / 2,
    mesh: mesh
  };
}

function animate() {
  requestAnimationFrame(animate);
  update();
  render();
}

function update() {
  for (var i = 0; i < meshes.length; ++i) {
    var a = meshes[i];
    var oldPos = a.mesh.position;

    a.mesh.position.x += a.dx;
    a.mesh.position.y += a.dy;

    if (checkCollisions(i)) {
      a.mesh.position.x = oldPos.x;
      a.mesh.position.y = oldPos.y;
    }

    if (a.mesh.position.x > 225) {
      a.mesh.position.x = 225;
      a.dx *= -1;
    }

    if (a.mesh.position.x < -225) {
      a.mesh.position.x = -225;
      a.dx *= -1;
    }

    if (a.mesh.position.y > 100) {
      a.mesh.position.y = 100;
      a.dy *= -1;
    }

    if (a.mesh.position.y < -100) {
      a.mesh.position.y = -100;
      a.dy *= -1;
    }

    a.mesh.rotation.z += a.rotX;
    a.mesh.rotation.x += a.rotY;

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
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvZGFsbGluLm9zbXVuL2NvZGUvYXN0ZXJvaWRzL2NsaWVudC9tYWluLmpzIiwiL1VzZXJzL2RhbGxpbi5vc211bi9jb2RlL2FzdGVyb2lkcy9jbGllbnQvdGVzdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbIndpbmRvdy5yZXF1aXJlID0gcmVxdWlyZTtcblxudmFyIHRlc3QgPSByZXF1aXJlKCcuL3Rlc3QnKTtcblxudGVzdC5pbml0KCk7XG50ZXN0LnN0YXJ0KCk7XG4iLCJ2YXIgcmVuZGVyZXJcbiAgLCBjYW1lcmFcbiAgLCBzY2VuZVxuICAsIG1lc2hlcyA9IFtdO1xuXG52YXIgREVCVUcgPSB0cnVlO1xuXG5leHBvcnRzLmluaXQgPSBpbml0aWFsaXplO1xuZXhwb3J0cy5zdGFydCA9IGFuaW1hdGU7XG5cbmZ1bmN0aW9uIGluaXRpYWxpemUoKSB7XG4gIC8vIHNldCB0aGUgc2NlbmUgc2l6ZVxuICB2YXIgV0lEVEggID0gMTQ0MFxuICAgICwgSEVJR0hUID0gNzAwO1xuXG4gIC8vIHNldCBzb21lIGNhbWVyYSBhdHRyaWJ1dGVzXG4gIHZhciBWSUVXX0FOR0xFID0gNDVcbiAgICAsIEFTUEVDVCAgICAgPSBXSURUSCAvIEhFSUdIVFxuICAgICwgTkVBUiAgICAgICA9IDAuMVxuICAgICwgRkFSICAgICAgICA9IDEwMDAwO1xuXG4gIC8vIGdldCB0aGUgRE9NIGVsZW1lbnQgdG8gYXR0YWNoIHRvXG4gIC8vIC0gYXNzdW1lIHdlJ3ZlIGdvdCBqUXVlcnkgdG8gaGFuZFxuICB2YXIgJGNvbnRhaW5lciA9ICQoJyN0ZXN0Jyk7XG5cbiAgLy8gY3JlYXRlIGEgV2ViR0wgcmVuZGVyZXIsIGNhbWVyYVxuICAvLyBhbmQgYSBzY2VuZVxuICByZW5kZXJlciA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlcmVyKCk7XG4gIGNhbWVyYSAgID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKFZJRVdfQU5HTEUsIEFTUEVDVCwgTkVBUiwgRkFSKTtcbiAgc2NlbmUgICAgPSBuZXcgVEhSRUUuU2NlbmUoKTtcblxuICAvLyBhZGQgdGhlIGNhbWVyYSB0byB0aGUgc2NlbmVcbiAgc2NlbmUuYWRkKGNhbWVyYSk7XG5cbiAgLy8gdGhlIGNhbWVyYSBzdGFydHMgYXQgMCwwLDBcbiAgLy8gc28gcHVsbCBpdCBiYWNrXG4gIGNhbWVyYS5wb3NpdGlvbi56ID0gMzAwO1xuXG4gIC8vIHN0YXJ0IHRoZSByZW5kZXJlclxuICByZW5kZXJlci5zZXRTaXplKFdJRFRILCBIRUlHSFQpO1xuXG4gIC8vIGF0dGFjaCB0aGUgcmVuZGVyLXN1cHBsaWVkIERPTSBlbGVtZW50XG4gICRjb250YWluZXIuYXBwZW5kKHJlbmRlcmVyLmRvbUVsZW1lbnQpO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgODsgKytpKSB7XG4gICAgYWRkTW9kZWwoJ21vZGVscy9hc3Rlcm9pZC5qcycsICdtb2RlbHMvYXN0ZXJvaWQuanBnJywgYWRkQm91bmRpbmdTcGhlcmUpO1xuICB9XG5cbiAgLy8gY3JlYXRlIGEgcG9pbnQgbGlnaHRcbiAgdmFyIHBvaW50TGlnaHQgPSBuZXcgVEhSRUUuUG9pbnRMaWdodCgweEZGRkZGRik7XG5cbiAgLy8gc2V0IGl0cyBwb3NpdGlvblxuICBwb2ludExpZ2h0LnBvc2l0aW9uLnggPSAxMDtcbiAgcG9pbnRMaWdodC5wb3NpdGlvbi55ID0gNTA7XG4gIHBvaW50TGlnaHQucG9zaXRpb24ueiA9IDEzMDtcblxuICAvLyBhZGQgdG8gdGhlIHNjZW5lXG4gIHNjZW5lLmFkZChwb2ludExpZ2h0KTtcbn1cblxuZnVuY3Rpb24gYWRkTW9kZWwoX21vZGVsLCBtZXNoVGV4dHVyZSwgY2IpIHtcbiAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHsgbWFwOiBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKG1lc2hUZXh0dXJlKSB9KTtcbiAgdmFyIGxvYWRlciA9IG5ldyBUSFJFRS5KU09OTG9hZGVyKGZhbHNlKTtcbiAgbG9hZGVyLmxvYWQoX21vZGVsLCBmdW5jdGlvbiAoZ2VvbWV0cnksIG1hdGVyaWFscykge1xuICAgIHZhciBtZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTsgLy8gbmV3IFRIUkVFLk1lc2hGYWNlTWF0ZXJpYWwobWF0ZXJpYWxzKVxuICAgIG1lc2gucG9zaXRpb24ueiA9IDA7XG4gICAgbWVzaC5wb3NpdGlvbi54ID0gTWF0aC5yYW5kb20oKSAqIDQyMCAtIDIxMDtcbiAgICBtZXNoLnBvc2l0aW9uLnkgPSBNYXRoLnJhbmRvbSgpICogMTgwIC0gOTA7XG4gICAgbWVzaC5yb3RhdGlvbi54ID0gbWVzaC5yb3RhdGlvbi55ID0gbWVzaC5yb3RhdGlvbi56ID0gMDtcbiAgICBtZXNoLnNjYWxlLnggICAgPSBtZXNoLnNjYWxlLnkgICAgPSBtZXNoLnNjYWxlLnogICAgPSAyMDtcblxuICAgIHdoaWxlIChjb2xsaWRlc1RFU1QobWVzaCkpIHtcbiAgICAgIG1lc2gucG9zaXRpb24ueCA9IE1hdGgucmFuZG9tKCkgKiA0MjAgLSAyMTA7XG4gICAgICBtZXNoLnBvc2l0aW9uLnkgPSBNYXRoLnJhbmRvbSgpICogMTgwIC0gOTA7XG4gICAgfVxuICAgIG1lc2gubWF0cml4QXV0b1VwZGF0ZSA9IGZhbHNlO1xuICAgIG1lc2gudXBkYXRlTWF0cml4KCk7XG4gICAgc2NlbmUuYWRkKG1lc2gpO1xuICAgIG1lc2hlcy5wdXNoKGNyZWF0ZUFzdGVyb2lkKG1lc2gpKTtcbiAgICBjYihtZXNoKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGNvbGxpZGVzVEVTVChtZXNoKSB7XG4gIHZhciBtMiA9IG1lc2gucG9zaXRpb247XG4gIHZhciBkaXN0MiA9IG1lc2guZ2VvbWV0cnkuYm91bmRpbmdTcGhlcmUucmFkaXVzICogbWVzaC5zY2FsZS54O1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbWVzaGVzLmxlbmd0aDsgKytpKSB7XG5cbiAgICB2YXIgbTEgPSBtZXNoZXNbaV0ubWVzaC5wb3NpdGlvbjtcbiAgICB2YXIgZCA9IE1hdGguc3FydChNYXRoLnBvdyhtMS54IC0gbTIueCwgMikgKyBNYXRoLnBvdyhtMS55IC0gbTIueSwgMikgKyBNYXRoLnBvdyhtMS56IC0gbTIueiwgMikpO1xuXG4gICAgdmFyIGRpc3QgPSBkaXN0MiArIG1lc2hlc1tpXS5tZXNoLmdlb21ldHJ5LmJvdW5kaW5nU3BoZXJlLnJhZGl1cyAqIG1lc2hlc1tpXS5tZXNoLnNjYWxlLng7XG4gICAgaWYgKGQgPD0gZGlzdCkge1xuICAgIC8vIGlmIChkIDw9IDQwKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIGFkZEJvdW5kaW5nU3BoZXJlKG1lc2gpIHtcbiAgaWYgKCFERUJVRykgcmV0dXJuO1xuXG4gIHZhciByYWRpdXMgICA9IG1lc2guZ2VvbWV0cnkuYm91bmRpbmdTcGhlcmUucmFkaXVzXG4gICAgLCBzZWdtZW50cyA9IDE2XG4gICAgLCByaW5ncyAgICA9IDE2O1xuXG4gIHZhciBzcGhlcmUgPSBuZXcgVEhSRUUuTWVzaChcbiAgICBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkocmFkaXVzLCBzZWdtZW50cywgcmluZ3MpXG4gICAgLy8gbmV3IFRIUkVFLk1lc2hMYW1iZXJ0TWF0ZXJpYWwoeyBjb2xvcjogMHhDQzAwMDAgfSlcbiAgKTtcblxuICBzcGhlcmUuc2NhbGUgPSBtZXNoLnNjYWxlO1xuICBzcGhlcmUucG9zaXRpb24gPSBtZXNoLnBvc2l0aW9uO1xuXG4gIHNjZW5lLmFkZChzcGhlcmUpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVBc3Rlcm9pZChtZXNoKSB7XG4gIHJldHVybiB7XG4gICAgcm90WDogKE1hdGgucmFuZG9tKCkgLSAuNSkgLyA1MCxcbiAgICByb3RZOiAoTWF0aC5yYW5kb20oKSAtIC41KSAvIDUwLFxuICAgIGR4OiAoTWF0aC5yYW5kb20oKSAtIC41KSAvIDIsXG4gICAgZHk6IChNYXRoLnJhbmRvbSgpIC0gLjUpIC8gMixcbiAgICBtZXNoOiBtZXNoXG4gIH07XG59XG5cbmZ1bmN0aW9uIGFuaW1hdGUoKSB7XG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZShhbmltYXRlKTtcbiAgdXBkYXRlKCk7XG4gIHJlbmRlcigpO1xufVxuXG5mdW5jdGlvbiB1cGRhdGUoKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbWVzaGVzLmxlbmd0aDsgKytpKSB7XG4gICAgdmFyIGEgPSBtZXNoZXNbaV07XG4gICAgdmFyIG9sZFBvcyA9IGEubWVzaC5wb3NpdGlvbjtcblxuICAgIGEubWVzaC5wb3NpdGlvbi54ICs9IGEuZHg7XG4gICAgYS5tZXNoLnBvc2l0aW9uLnkgKz0gYS5keTtcblxuICAgIGlmIChjaGVja0NvbGxpc2lvbnMoaSkpIHtcbiAgICAgIGEubWVzaC5wb3NpdGlvbi54ID0gb2xkUG9zLng7XG4gICAgICBhLm1lc2gucG9zaXRpb24ueSA9IG9sZFBvcy55O1xuICAgIH1cblxuICAgIGlmIChhLm1lc2gucG9zaXRpb24ueCA+IDIyNSkge1xuICAgICAgYS5tZXNoLnBvc2l0aW9uLnggPSAyMjU7XG4gICAgICBhLmR4ICo9IC0xO1xuICAgIH1cblxuICAgIGlmIChhLm1lc2gucG9zaXRpb24ueCA8IC0yMjUpIHtcbiAgICAgIGEubWVzaC5wb3NpdGlvbi54ID0gLTIyNTtcbiAgICAgIGEuZHggKj0gLTE7XG4gICAgfVxuXG4gICAgaWYgKGEubWVzaC5wb3NpdGlvbi55ID4gMTAwKSB7XG4gICAgICBhLm1lc2gucG9zaXRpb24ueSA9IDEwMDtcbiAgICAgIGEuZHkgKj0gLTE7XG4gICAgfVxuXG4gICAgaWYgKGEubWVzaC5wb3NpdGlvbi55IDwgLTEwMCkge1xuICAgICAgYS5tZXNoLnBvc2l0aW9uLnkgPSAtMTAwO1xuICAgICAgYS5keSAqPSAtMTtcbiAgICB9XG5cbiAgICBhLm1lc2gucm90YXRpb24ueiArPSBhLnJvdFg7XG4gICAgYS5tZXNoLnJvdGF0aW9uLnggKz0gYS5yb3RZO1xuXG4gICAgYS5tZXNoLnVwZGF0ZU1hdHJpeCgpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgcmVuZGVyZXIucmVuZGVyKHNjZW5lLCBjYW1lcmEpO1xufVxuXG5mdW5jdGlvbiBjaGVja0NvbGxpc2lvbnMoaikge1xuICB2YXIgbTIgPSBtZXNoZXNbal0ubWVzaC5wb3NpdGlvbjtcbiAgdmFyIGRpc3QyID0gbWVzaGVzW2pdLm1lc2guZ2VvbWV0cnkuYm91bmRpbmdTcGhlcmUucmFkaXVzICogbWVzaGVzW2pdLm1lc2guc2NhbGUueDtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IG1lc2hlcy5sZW5ndGg7ICsraSkge1xuICAgIGlmIChpID09PSBqKSBjb250aW51ZTtcblxuICAgIHZhciBtMSA9IG1lc2hlc1tpXS5tZXNoLnBvc2l0aW9uO1xuICAgIHZhciBkID0gTWF0aC5zcXJ0KE1hdGgucG93KG0xLnggLSBtMi54LCAyKSArIE1hdGgucG93KG0xLnkgLSBtMi55LCAyKSArIE1hdGgucG93KG0xLnogLSBtMi56LCAyKSk7XG5cbiAgICB2YXIgZGlzdCA9IGRpc3QyICsgbWVzaGVzW2ldLm1lc2guZ2VvbWV0cnkuYm91bmRpbmdTcGhlcmUucmFkaXVzICogbWVzaGVzW2ldLm1lc2guc2NhbGUueDtcbiAgICAvLyBpZiAoaiA9PSAwKVxuICAgIC8vICAgY29uc29sZS5sb2coZCwgZGlzdCk7XG5cbiAgICBpZiAoZCA8PSBkaXN0KSB7XG4gICAgLy8gaWYgKGQgPD0gNDApIHtcbiAgICAgIHZhciB0ZW1wWCA9IG1lc2hlc1tpXS5keDtcbiAgICAgIHZhciB0ZW1wWSA9IG1lc2hlc1tpXS5keTtcblxuICAgICAgbWVzaGVzW2ldLmR4ID0gbWVzaGVzW2pdLmR4O1xuICAgICAgbWVzaGVzW2ldLmR5ID0gbWVzaGVzW2pdLmR5O1xuXG4gICAgICBtZXNoZXNbal0uZHggPSB0ZW1wWDtcbiAgICAgIG1lc2hlc1tqXS5keSA9IHRlbXBZO1xuXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59XG4iXX0=
;