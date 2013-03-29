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
    mesh.matrixAutoUpdate = false;
    mesh.updateMatrix();
    scene.add(mesh);
    meshes.push(createAsteroid(mesh));
    cb(mesh);
  });
}

function addBoundingSphere(mesh) {
  return;

  var radius   = 50
    , segments = 16
    , rings    = 16;

  var sphere = new THREE.Mesh(
    new THREE.SphereGeometry(radius, segments, rings),
    new THREE.MeshLambertMaterial({ color: 0xCC0000 })
  );

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
  // var dist2 = meshes[j].mesh.geometry.boundingSphere.radius * meshes[j].mesh.scale.x;

  for (var i = 0; i < meshes.length; ++i) {
    if (i === j) continue;

    var m1 = meshes[i].mesh.position;
    var d = Math.sqrt(Math.pow(m1.x - m2.x, 2) + Math.pow(m1.y - m2.y, 2) + Math.pow(m1.z - m2.z, 2));

    // var dist = dist2 + meshes[i].mesh.geometry.boundingSphere.radius * meshes[i].mesh.scale.x;
    // if (j == 0)
    //   console.log(d, dist);

    // if (d <= dist) {
    if (d <= 40) {
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
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvZGFsbGluLm9zbXVuL2NvZGUvYXN0ZXJvaWRzL2NsaWVudC9tYWluLmpzIiwiL1VzZXJzL2RhbGxpbi5vc211bi9jb2RlL2FzdGVyb2lkcy9jbGllbnQvdGVzdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsid2luZG93LnJlcXVpcmUgPSByZXF1aXJlO1xuXG52YXIgdGVzdCA9IHJlcXVpcmUoJy4vdGVzdCcpO1xuXG50ZXN0LmluaXQoKTtcbnRlc3Quc3RhcnQoKTtcbiIsInZhciByZW5kZXJlclxuICAsIGNhbWVyYVxuICAsIHNjZW5lXG4gICwgbWVzaGVzID0gW107XG5cbmV4cG9ydHMuaW5pdCA9IGluaXRpYWxpemU7XG5leHBvcnRzLnN0YXJ0ID0gYW5pbWF0ZTtcblxuZnVuY3Rpb24gaW5pdGlhbGl6ZSgpIHtcbiAgLy8gc2V0IHRoZSBzY2VuZSBzaXplXG4gIHZhciBXSURUSCAgPSAxNDQwXG4gICAgLCBIRUlHSFQgPSA3MDA7XG5cbiAgLy8gc2V0IHNvbWUgY2FtZXJhIGF0dHJpYnV0ZXNcbiAgdmFyIFZJRVdfQU5HTEUgPSA0NVxuICAgICwgQVNQRUNUICAgICA9IFdJRFRIIC8gSEVJR0hUXG4gICAgLCBORUFSICAgICAgID0gMC4xXG4gICAgLCBGQVIgICAgICAgID0gMTAwMDA7XG5cbiAgLy8gZ2V0IHRoZSBET00gZWxlbWVudCB0byBhdHRhY2ggdG9cbiAgLy8gLSBhc3N1bWUgd2UndmUgZ290IGpRdWVyeSB0byBoYW5kXG4gIHZhciAkY29udGFpbmVyID0gJCgnI3Rlc3QnKTtcblxuICAvLyBjcmVhdGUgYSBXZWJHTCByZW5kZXJlciwgY2FtZXJhXG4gIC8vIGFuZCBhIHNjZW5lXG4gIHJlbmRlcmVyID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyZXIoKTtcbiAgY2FtZXJhICAgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoVklFV19BTkdMRSwgQVNQRUNULCBORUFSLCBGQVIpO1xuICBzY2VuZSAgICA9IG5ldyBUSFJFRS5TY2VuZSgpO1xuXG4gIC8vIGFkZCB0aGUgY2FtZXJhIHRvIHRoZSBzY2VuZVxuICBzY2VuZS5hZGQoY2FtZXJhKTtcblxuICAvLyB0aGUgY2FtZXJhIHN0YXJ0cyBhdCAwLDAsMFxuICAvLyBzbyBwdWxsIGl0IGJhY2tcbiAgY2FtZXJhLnBvc2l0aW9uLnogPSAzMDA7XG5cbiAgLy8gc3RhcnQgdGhlIHJlbmRlcmVyXG4gIHJlbmRlcmVyLnNldFNpemUoV0lEVEgsIEhFSUdIVCk7XG5cbiAgLy8gYXR0YWNoIHRoZSByZW5kZXItc3VwcGxpZWQgRE9NIGVsZW1lbnRcbiAgJGNvbnRhaW5lci5hcHBlbmQocmVuZGVyZXIuZG9tRWxlbWVudCk7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCA4OyArK2kpIHtcbiAgICBhZGRNb2RlbCgnbW9kZWxzL2FzdGVyb2lkLmpzJywgJ21vZGVscy9hc3Rlcm9pZC5qcGcnLCBhZGRCb3VuZGluZ1NwaGVyZSk7XG4gIH1cblxuICAvLyBjcmVhdGUgYSBwb2ludCBsaWdodFxuICB2YXIgcG9pbnRMaWdodCA9IG5ldyBUSFJFRS5Qb2ludExpZ2h0KDB4RkZGRkZGKTtcblxuICAvLyBzZXQgaXRzIHBvc2l0aW9uXG4gIHBvaW50TGlnaHQucG9zaXRpb24ueCA9IDEwO1xuICBwb2ludExpZ2h0LnBvc2l0aW9uLnkgPSA1MDtcbiAgcG9pbnRMaWdodC5wb3NpdGlvbi56ID0gMTMwO1xuXG4gIC8vIGFkZCB0byB0aGUgc2NlbmVcbiAgc2NlbmUuYWRkKHBvaW50TGlnaHQpO1xufVxuXG5mdW5jdGlvbiBhZGRNb2RlbChfbW9kZWwsIG1lc2hUZXh0dXJlLCBjYikge1xuICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoeyBtYXA6IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUobWVzaFRleHR1cmUpIH0pO1xuICB2YXIgbG9hZGVyID0gbmV3IFRIUkVFLkpTT05Mb2FkZXIoZmFsc2UpO1xuICBsb2FkZXIubG9hZChfbW9kZWwsIGZ1bmN0aW9uIChnZW9tZXRyeSwgbWF0ZXJpYWxzKSB7XG4gICAgdmFyIG1lc2ggPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpOyAvLyBuZXcgVEhSRUUuTWVzaEZhY2VNYXRlcmlhbChtYXRlcmlhbHMpXG4gICAgbWVzaC5wb3NpdGlvbi56ID0gMDtcbiAgICBtZXNoLnBvc2l0aW9uLnggPSBNYXRoLnJhbmRvbSgpICogNDIwIC0gMjEwO1xuICAgIG1lc2gucG9zaXRpb24ueSA9IE1hdGgucmFuZG9tKCkgKiAxODAgLSA5MDtcbiAgICBtZXNoLnJvdGF0aW9uLnggPSBtZXNoLnJvdGF0aW9uLnkgPSBtZXNoLnJvdGF0aW9uLnogPSAwO1xuICAgIG1lc2guc2NhbGUueCAgICA9IG1lc2guc2NhbGUueSAgICA9IG1lc2guc2NhbGUueiAgICA9IDIwO1xuICAgIG1lc2gubWF0cml4QXV0b1VwZGF0ZSA9IGZhbHNlO1xuICAgIG1lc2gudXBkYXRlTWF0cml4KCk7XG4gICAgc2NlbmUuYWRkKG1lc2gpO1xuICAgIG1lc2hlcy5wdXNoKGNyZWF0ZUFzdGVyb2lkKG1lc2gpKTtcbiAgICBjYihtZXNoKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGFkZEJvdW5kaW5nU3BoZXJlKG1lc2gpIHtcbiAgcmV0dXJuO1xuXG4gIHZhciByYWRpdXMgICA9IDUwXG4gICAgLCBzZWdtZW50cyA9IDE2XG4gICAgLCByaW5ncyAgICA9IDE2O1xuXG4gIHZhciBzcGhlcmUgPSBuZXcgVEhSRUUuTWVzaChcbiAgICBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkocmFkaXVzLCBzZWdtZW50cywgcmluZ3MpLFxuICAgIG5ldyBUSFJFRS5NZXNoTGFtYmVydE1hdGVyaWFsKHsgY29sb3I6IDB4Q0MwMDAwIH0pXG4gICk7XG5cbiAgc2NlbmUuYWRkKHNwaGVyZSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUFzdGVyb2lkKG1lc2gpIHtcbiAgcmV0dXJuIHtcbiAgICByb3RYOiAoTWF0aC5yYW5kb20oKSAtIC41KSAvIDUwLFxuICAgIHJvdFk6IChNYXRoLnJhbmRvbSgpIC0gLjUpIC8gNTAsXG4gICAgZHg6IChNYXRoLnJhbmRvbSgpIC0gLjUpIC8gMixcbiAgICBkeTogKE1hdGgucmFuZG9tKCkgLSAuNSkgLyAyLFxuICAgIG1lc2g6IG1lc2hcbiAgfTtcbn1cblxuZnVuY3Rpb24gYW5pbWF0ZSgpIHtcbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGFuaW1hdGUpO1xuICB1cGRhdGUoKTtcbiAgcmVuZGVyKCk7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZSgpIHtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBtZXNoZXMubGVuZ3RoOyArK2kpIHtcbiAgICB2YXIgYSA9IG1lc2hlc1tpXTtcbiAgICB2YXIgb2xkUG9zID0gYS5tZXNoLnBvc2l0aW9uO1xuXG4gICAgYS5tZXNoLnBvc2l0aW9uLnggKz0gYS5keDtcbiAgICBhLm1lc2gucG9zaXRpb24ueSArPSBhLmR5O1xuXG4gICAgaWYgKGNoZWNrQ29sbGlzaW9ucyhpKSkge1xuICAgICAgYS5tZXNoLnBvc2l0aW9uLnggPSBvbGRQb3MueDtcbiAgICAgIGEubWVzaC5wb3NpdGlvbi55ID0gb2xkUG9zLnk7XG4gICAgfVxuXG4gICAgaWYgKGEubWVzaC5wb3NpdGlvbi54ID4gMjI1KSB7XG4gICAgICBhLm1lc2gucG9zaXRpb24ueCA9IDIyNTtcbiAgICAgIGEuZHggKj0gLTE7XG4gICAgfVxuXG4gICAgaWYgKGEubWVzaC5wb3NpdGlvbi54IDwgLTIyNSkge1xuICAgICAgYS5tZXNoLnBvc2l0aW9uLnggPSAtMjI1O1xuICAgICAgYS5keCAqPSAtMTtcbiAgICB9XG5cbiAgICBpZiAoYS5tZXNoLnBvc2l0aW9uLnkgPiAxMDApIHtcbiAgICAgIGEubWVzaC5wb3NpdGlvbi55ID0gMTAwO1xuICAgICAgYS5keSAqPSAtMTtcbiAgICB9XG5cbiAgICBpZiAoYS5tZXNoLnBvc2l0aW9uLnkgPCAtMTAwKSB7XG4gICAgICBhLm1lc2gucG9zaXRpb24ueSA9IC0xMDA7XG4gICAgICBhLmR5ICo9IC0xO1xuICAgIH1cblxuICAgIGEubWVzaC5yb3RhdGlvbi56ICs9IGEucm90WDtcbiAgICBhLm1lc2gucm90YXRpb24ueCArPSBhLnJvdFk7XG5cbiAgICBhLm1lc2gudXBkYXRlTWF0cml4KCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gcmVuZGVyKCkge1xuICByZW5kZXJlci5yZW5kZXIoc2NlbmUsIGNhbWVyYSk7XG59XG5cbmZ1bmN0aW9uIGNoZWNrQ29sbGlzaW9ucyhqKSB7XG4gIHZhciBtMiA9IG1lc2hlc1tqXS5tZXNoLnBvc2l0aW9uO1xuICAvLyB2YXIgZGlzdDIgPSBtZXNoZXNbal0ubWVzaC5nZW9tZXRyeS5ib3VuZGluZ1NwaGVyZS5yYWRpdXMgKiBtZXNoZXNbal0ubWVzaC5zY2FsZS54O1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbWVzaGVzLmxlbmd0aDsgKytpKSB7XG4gICAgaWYgKGkgPT09IGopIGNvbnRpbnVlO1xuXG4gICAgdmFyIG0xID0gbWVzaGVzW2ldLm1lc2gucG9zaXRpb247XG4gICAgdmFyIGQgPSBNYXRoLnNxcnQoTWF0aC5wb3cobTEueCAtIG0yLngsIDIpICsgTWF0aC5wb3cobTEueSAtIG0yLnksIDIpICsgTWF0aC5wb3cobTEueiAtIG0yLnosIDIpKTtcblxuICAgIC8vIHZhciBkaXN0ID0gZGlzdDIgKyBtZXNoZXNbaV0ubWVzaC5nZW9tZXRyeS5ib3VuZGluZ1NwaGVyZS5yYWRpdXMgKiBtZXNoZXNbaV0ubWVzaC5zY2FsZS54O1xuICAgIC8vIGlmIChqID09IDApXG4gICAgLy8gICBjb25zb2xlLmxvZyhkLCBkaXN0KTtcblxuICAgIC8vIGlmIChkIDw9IGRpc3QpIHtcbiAgICBpZiAoZCA8PSA0MCkge1xuICAgICAgdmFyIHRlbXBYID0gbWVzaGVzW2ldLmR4O1xuICAgICAgdmFyIHRlbXBZID0gbWVzaGVzW2ldLmR5O1xuXG4gICAgICBtZXNoZXNbaV0uZHggPSBtZXNoZXNbal0uZHg7XG4gICAgICBtZXNoZXNbaV0uZHkgPSBtZXNoZXNbal0uZHk7XG5cbiAgICAgIG1lc2hlc1tqXS5keCA9IHRlbXBYO1xuICAgICAgbWVzaGVzW2pdLmR5ID0gdGVtcFk7XG5cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmYWxzZTtcbn1cbiJdfQ==
;