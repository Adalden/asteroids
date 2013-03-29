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

    mesh.geometry.boundingSphere.radius -= .2;

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
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvZGFsbGluLm9zbXVuL2NvZGUvYXN0ZXJvaWRzL2NsaWVudC9tYWluLmpzIiwiL1VzZXJzL2RhbGxpbi5vc211bi9jb2RlL2FzdGVyb2lkcy9jbGllbnQvdGVzdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyJ3aW5kb3cucmVxdWlyZSA9IHJlcXVpcmU7XG5cbnZhciB0ZXN0ID0gcmVxdWlyZSgnLi90ZXN0Jyk7XG5cbnRlc3QuaW5pdCgpO1xudGVzdC5zdGFydCgpO1xuIiwidmFyIHJlbmRlcmVyXG4gICwgY2FtZXJhXG4gICwgc2NlbmVcbiAgLCBtZXNoZXMgPSBbXTtcblxudmFyIERFQlVHID0gdHJ1ZTtcblxuZXhwb3J0cy5pbml0ID0gaW5pdGlhbGl6ZTtcbmV4cG9ydHMuc3RhcnQgPSBhbmltYXRlO1xuXG5mdW5jdGlvbiBpbml0aWFsaXplKCkge1xuICAvLyBzZXQgdGhlIHNjZW5lIHNpemVcbiAgdmFyIFdJRFRIICA9IDE0NDBcbiAgICAsIEhFSUdIVCA9IDcwMDtcblxuICAvLyBzZXQgc29tZSBjYW1lcmEgYXR0cmlidXRlc1xuICB2YXIgVklFV19BTkdMRSA9IDQ1XG4gICAgLCBBU1BFQ1QgICAgID0gV0lEVEggLyBIRUlHSFRcbiAgICAsIE5FQVIgICAgICAgPSAwLjFcbiAgICAsIEZBUiAgICAgICAgPSAxMDAwMDtcblxuICAvLyBnZXQgdGhlIERPTSBlbGVtZW50IHRvIGF0dGFjaCB0b1xuICAvLyAtIGFzc3VtZSB3ZSd2ZSBnb3QgalF1ZXJ5IHRvIGhhbmRcbiAgdmFyICRjb250YWluZXIgPSAkKCcjdGVzdCcpO1xuXG4gIC8vIGNyZWF0ZSBhIFdlYkdMIHJlbmRlcmVyLCBjYW1lcmFcbiAgLy8gYW5kIGEgc2NlbmVcbiAgcmVuZGVyZXIgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcigpO1xuICBjYW1lcmEgICA9IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYShWSUVXX0FOR0xFLCBBU1BFQ1QsIE5FQVIsIEZBUik7XG4gIHNjZW5lICAgID0gbmV3IFRIUkVFLlNjZW5lKCk7XG5cbiAgLy8gYWRkIHRoZSBjYW1lcmEgdG8gdGhlIHNjZW5lXG4gIHNjZW5lLmFkZChjYW1lcmEpO1xuXG4gIC8vIHRoZSBjYW1lcmEgc3RhcnRzIGF0IDAsMCwwXG4gIC8vIHNvIHB1bGwgaXQgYmFja1xuICBjYW1lcmEucG9zaXRpb24ueiA9IDMwMDtcblxuICAvLyBzdGFydCB0aGUgcmVuZGVyZXJcbiAgcmVuZGVyZXIuc2V0U2l6ZShXSURUSCwgSEVJR0hUKTtcblxuICAvLyBhdHRhY2ggdGhlIHJlbmRlci1zdXBwbGllZCBET00gZWxlbWVudFxuICAkY29udGFpbmVyLmFwcGVuZChyZW5kZXJlci5kb21FbGVtZW50KTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IDg7ICsraSkge1xuICAgIGFkZE1vZGVsKCdtb2RlbHMvYXN0ZXJvaWQuanMnLCAnbW9kZWxzL2FzdGVyb2lkLmpwZycsIGFkZEJvdW5kaW5nU3BoZXJlKTtcbiAgfVxuXG4gIC8vIGNyZWF0ZSBhIHBvaW50IGxpZ2h0XG4gIHZhciBwb2ludExpZ2h0ID0gbmV3IFRIUkVFLlBvaW50TGlnaHQoMHhGRkZGRkYpO1xuXG4gIC8vIHNldCBpdHMgcG9zaXRpb25cbiAgcG9pbnRMaWdodC5wb3NpdGlvbi54ID0gMTA7XG4gIHBvaW50TGlnaHQucG9zaXRpb24ueSA9IDUwO1xuICBwb2ludExpZ2h0LnBvc2l0aW9uLnogPSAxMzA7XG5cbiAgLy8gYWRkIHRvIHRoZSBzY2VuZVxuICBzY2VuZS5hZGQocG9pbnRMaWdodCk7XG59XG5cbmZ1bmN0aW9uIGFkZE1vZGVsKF9tb2RlbCwgbWVzaFRleHR1cmUsIGNiKSB7XG4gIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7IG1hcDogVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShtZXNoVGV4dHVyZSkgfSk7XG4gIHZhciBsb2FkZXIgPSBuZXcgVEhSRUUuSlNPTkxvYWRlcihmYWxzZSk7XG4gIGxvYWRlci5sb2FkKF9tb2RlbCwgZnVuY3Rpb24gKGdlb21ldHJ5LCBtYXRlcmlhbHMpIHtcbiAgICB2YXIgbWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7IC8vIG5ldyBUSFJFRS5NZXNoRmFjZU1hdGVyaWFsKG1hdGVyaWFscylcbiAgICBtZXNoLnBvc2l0aW9uLnogPSAwO1xuICAgIG1lc2gucG9zaXRpb24ueCA9IE1hdGgucmFuZG9tKCkgKiA0MjAgLSAyMTA7XG4gICAgbWVzaC5wb3NpdGlvbi55ID0gTWF0aC5yYW5kb20oKSAqIDE4MCAtIDkwO1xuICAgIG1lc2gucm90YXRpb24ueCA9IG1lc2gucm90YXRpb24ueSA9IG1lc2gucm90YXRpb24ueiA9IDA7XG4gICAgbWVzaC5zY2FsZS54ICAgID0gbWVzaC5zY2FsZS55ICAgID0gbWVzaC5zY2FsZS56ICAgID0gMjA7XG5cbiAgICBtZXNoLmdlb21ldHJ5LmJvdW5kaW5nU3BoZXJlLnJhZGl1cyAtPSAuMjtcblxuICAgIHdoaWxlIChjb2xsaWRlc1RFU1QobWVzaCkpIHtcbiAgICAgIG1lc2gucG9zaXRpb24ueCA9IE1hdGgucmFuZG9tKCkgKiA0MjAgLSAyMTA7XG4gICAgICBtZXNoLnBvc2l0aW9uLnkgPSBNYXRoLnJhbmRvbSgpICogMTgwIC0gOTA7XG4gICAgfVxuICAgIG1lc2gubWF0cml4QXV0b1VwZGF0ZSA9IGZhbHNlO1xuICAgIG1lc2gudXBkYXRlTWF0cml4KCk7XG4gICAgc2NlbmUuYWRkKG1lc2gpO1xuICAgIG1lc2hlcy5wdXNoKGNyZWF0ZUFzdGVyb2lkKG1lc2gpKTtcbiAgICBjYihtZXNoKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGNvbGxpZGVzVEVTVChtZXNoKSB7XG4gIHZhciBtMiA9IG1lc2gucG9zaXRpb247XG4gIHZhciBkaXN0MiA9IG1lc2guZ2VvbWV0cnkuYm91bmRpbmdTcGhlcmUucmFkaXVzICogbWVzaC5zY2FsZS54O1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbWVzaGVzLmxlbmd0aDsgKytpKSB7XG5cbiAgICB2YXIgbTEgPSBtZXNoZXNbaV0ubWVzaC5wb3NpdGlvbjtcbiAgICB2YXIgZCA9IE1hdGguc3FydChNYXRoLnBvdyhtMS54IC0gbTIueCwgMikgKyBNYXRoLnBvdyhtMS55IC0gbTIueSwgMikgKyBNYXRoLnBvdyhtMS56IC0gbTIueiwgMikpO1xuXG4gICAgdmFyIGRpc3QgPSBkaXN0MiArIG1lc2hlc1tpXS5tZXNoLmdlb21ldHJ5LmJvdW5kaW5nU3BoZXJlLnJhZGl1cyAqIG1lc2hlc1tpXS5tZXNoLnNjYWxlLng7XG4gICAgaWYgKGQgPD0gZGlzdCkge1xuICAgIC8vIGlmIChkIDw9IDQwKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIGFkZEJvdW5kaW5nU3BoZXJlKG1lc2gpIHtcbiAgaWYgKCFERUJVRykgcmV0dXJuO1xuXG4gIHZhciByYWRpdXMgICA9IG1lc2guZ2VvbWV0cnkuYm91bmRpbmdTcGhlcmUucmFkaXVzXG4gICAgLCBzZWdtZW50cyA9IDE2XG4gICAgLCByaW5ncyAgICA9IDE2O1xuXG4gIHZhciBzcGhlcmUgPSBuZXcgVEhSRUUuTWVzaChcbiAgICBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkocmFkaXVzLCBzZWdtZW50cywgcmluZ3MpXG4gICAgLy8gbmV3IFRIUkVFLk1lc2hMYW1iZXJ0TWF0ZXJpYWwoeyBjb2xvcjogMHhDQzAwMDAgfSlcbiAgKTtcblxuICBzcGhlcmUuc2NhbGUgPSBtZXNoLnNjYWxlO1xuICBzcGhlcmUucG9zaXRpb24gPSBtZXNoLnBvc2l0aW9uO1xuXG4gIHNjZW5lLmFkZChzcGhlcmUpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVBc3Rlcm9pZChtZXNoKSB7XG4gIHJldHVybiB7XG4gICAgcm90WDogKE1hdGgucmFuZG9tKCkgLSAuNSkgLyA1MCxcbiAgICByb3RZOiAoTWF0aC5yYW5kb20oKSAtIC41KSAvIDUwLFxuICAgIGR4OiAoTWF0aC5yYW5kb20oKSAtIC41KSAvIDIsXG4gICAgZHk6IChNYXRoLnJhbmRvbSgpIC0gLjUpIC8gMixcbiAgICBtZXNoOiBtZXNoXG4gIH07XG59XG5cbmZ1bmN0aW9uIGFuaW1hdGUoKSB7XG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZShhbmltYXRlKTtcbiAgdXBkYXRlKCk7XG4gIHJlbmRlcigpO1xufVxuXG5mdW5jdGlvbiB1cGRhdGUoKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbWVzaGVzLmxlbmd0aDsgKytpKSB7XG4gICAgdmFyIGEgPSBtZXNoZXNbaV07XG4gICAgdmFyIG9sZFBvcyA9IGEubWVzaC5wb3NpdGlvbjtcblxuICAgIGEubWVzaC5wb3NpdGlvbi54ICs9IGEuZHg7XG4gICAgYS5tZXNoLnBvc2l0aW9uLnkgKz0gYS5keTtcblxuICAgIGlmIChjaGVja0NvbGxpc2lvbnMoaSkpIHtcbiAgICAgIGEubWVzaC5wb3NpdGlvbi54ID0gb2xkUG9zLng7XG4gICAgICBhLm1lc2gucG9zaXRpb24ueSA9IG9sZFBvcy55O1xuICAgIH1cblxuICAgIGlmIChhLm1lc2gucG9zaXRpb24ueCA+IDIyNSkge1xuICAgICAgYS5tZXNoLnBvc2l0aW9uLnggPSAyMjU7XG4gICAgICBhLmR4ICo9IC0xO1xuICAgIH1cblxuICAgIGlmIChhLm1lc2gucG9zaXRpb24ueCA8IC0yMjUpIHtcbiAgICAgIGEubWVzaC5wb3NpdGlvbi54ID0gLTIyNTtcbiAgICAgIGEuZHggKj0gLTE7XG4gICAgfVxuXG4gICAgaWYgKGEubWVzaC5wb3NpdGlvbi55ID4gMTAwKSB7XG4gICAgICBhLm1lc2gucG9zaXRpb24ueSA9IDEwMDtcbiAgICAgIGEuZHkgKj0gLTE7XG4gICAgfVxuXG4gICAgaWYgKGEubWVzaC5wb3NpdGlvbi55IDwgLTEwMCkge1xuICAgICAgYS5tZXNoLnBvc2l0aW9uLnkgPSAtMTAwO1xuICAgICAgYS5keSAqPSAtMTtcbiAgICB9XG5cbiAgICBhLm1lc2gucm90YXRpb24ueiArPSBhLnJvdFg7XG4gICAgYS5tZXNoLnJvdGF0aW9uLnggKz0gYS5yb3RZO1xuXG4gICAgYS5tZXNoLnVwZGF0ZU1hdHJpeCgpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgcmVuZGVyZXIucmVuZGVyKHNjZW5lLCBjYW1lcmEpO1xufVxuXG5mdW5jdGlvbiBjaGVja0NvbGxpc2lvbnMoaikge1xuICB2YXIgbTIgPSBtZXNoZXNbal0ubWVzaC5wb3NpdGlvbjtcbiAgdmFyIGRpc3QyID0gbWVzaGVzW2pdLm1lc2guZ2VvbWV0cnkuYm91bmRpbmdTcGhlcmUucmFkaXVzICogbWVzaGVzW2pdLm1lc2guc2NhbGUueDtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IG1lc2hlcy5sZW5ndGg7ICsraSkge1xuICAgIGlmIChpID09PSBqKSBjb250aW51ZTtcblxuICAgIHZhciBtMSA9IG1lc2hlc1tpXS5tZXNoLnBvc2l0aW9uO1xuICAgIHZhciBkID0gTWF0aC5zcXJ0KE1hdGgucG93KG0xLnggLSBtMi54LCAyKSArIE1hdGgucG93KG0xLnkgLSBtMi55LCAyKSArIE1hdGgucG93KG0xLnogLSBtMi56LCAyKSk7XG5cbiAgICB2YXIgZGlzdCA9IGRpc3QyICsgbWVzaGVzW2ldLm1lc2guZ2VvbWV0cnkuYm91bmRpbmdTcGhlcmUucmFkaXVzICogbWVzaGVzW2ldLm1lc2guc2NhbGUueDtcbiAgICAvLyBpZiAoaiA9PSAwKVxuICAgIC8vICAgY29uc29sZS5sb2coZCwgZGlzdCk7XG5cbiAgICBpZiAoZCA8PSBkaXN0KSB7XG4gICAgLy8gaWYgKGQgPD0gNDApIHtcbiAgICAgIHZhciB0ZW1wWCA9IG1lc2hlc1tpXS5keDtcbiAgICAgIHZhciB0ZW1wWSA9IG1lc2hlc1tpXS5keTtcblxuICAgICAgbWVzaGVzW2ldLmR4ID0gbWVzaGVzW2pdLmR4O1xuICAgICAgbWVzaGVzW2ldLmR5ID0gbWVzaGVzW2pdLmR5O1xuXG4gICAgICBtZXNoZXNbal0uZHggPSB0ZW1wWDtcbiAgICAgIG1lc2hlc1tqXS5keSA9IHRlbXBZO1xuXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59XG4iXX0=
;