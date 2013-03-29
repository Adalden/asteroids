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

  for (var i = 0; i < 8; ++i)
    addModel('models/asteroid.js', 'models/asteroid.jpg');

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
  var material = new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture(meshTexture) });
  var loader = new THREE.JSONLoader(false);
  loader.load(_model, function (geometry, materials) {
    // materials[0].morphTargets = true;
    // material.shading = THREE.FlatShading;
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
  });
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
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvZGFsbGluLm9zbXVuL2NvZGUvYXN0ZXJvaWRzL2NsaWVudC9tYWluLmpzIiwiL1VzZXJzL2RhbGxpbi5vc211bi9jb2RlL2FzdGVyb2lkcy9jbGllbnQvdGVzdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsid2luZG93LnJlcXVpcmUgPSByZXF1aXJlO1xuXG52YXIgdGVzdCA9IHJlcXVpcmUoJy4vdGVzdCcpO1xuXG50ZXN0LmluaXQoKTtcbnRlc3Quc3RhcnQoKTtcbiIsInZhciByZW5kZXJlclxuICAsIGNhbWVyYVxuICAsIHNjZW5lXG4gICwgbWVzaGVzID0gW107XG5cbmV4cG9ydHMuaW5pdCA9IGluaXRpYWxpemU7XG5leHBvcnRzLnN0YXJ0ID0gYW5pbWF0ZTtcblxuZnVuY3Rpb24gaW5pdGlhbGl6ZSgpIHtcbiAgLy8gc2V0IHRoZSBzY2VuZSBzaXplXG4gIHZhciBXSURUSCAgPSAxNDQwXG4gICAgLCBIRUlHSFQgPSA3MDA7XG5cbiAgLy8gc2V0IHNvbWUgY2FtZXJhIGF0dHJpYnV0ZXNcbiAgdmFyIFZJRVdfQU5HTEUgPSA0NVxuICAgICwgQVNQRUNUICAgICA9IFdJRFRIIC8gSEVJR0hUXG4gICAgLCBORUFSICAgICAgID0gMC4xXG4gICAgLCBGQVIgICAgICAgID0gMTAwMDA7XG5cbiAgLy8gZ2V0IHRoZSBET00gZWxlbWVudCB0byBhdHRhY2ggdG9cbiAgLy8gLSBhc3N1bWUgd2UndmUgZ290IGpRdWVyeSB0byBoYW5kXG4gIHZhciAkY29udGFpbmVyID0gJCgnI3Rlc3QnKTtcblxuICAvLyBjcmVhdGUgYSBXZWJHTCByZW5kZXJlciwgY2FtZXJhXG4gIC8vIGFuZCBhIHNjZW5lXG4gIHJlbmRlcmVyID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyZXIoKTtcbiAgY2FtZXJhICAgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoVklFV19BTkdMRSwgQVNQRUNULCBORUFSLCBGQVIpO1xuICBzY2VuZSAgICA9IG5ldyBUSFJFRS5TY2VuZSgpO1xuXG4gIC8vIGFkZCB0aGUgY2FtZXJhIHRvIHRoZSBzY2VuZVxuICBzY2VuZS5hZGQoY2FtZXJhKTtcblxuICAvLyB0aGUgY2FtZXJhIHN0YXJ0cyBhdCAwLDAsMFxuICAvLyBzbyBwdWxsIGl0IGJhY2tcbiAgY2FtZXJhLnBvc2l0aW9uLnogPSAzMDA7XG5cbiAgLy8gc3RhcnQgdGhlIHJlbmRlcmVyXG4gIHJlbmRlcmVyLnNldFNpemUoV0lEVEgsIEhFSUdIVCk7XG5cbiAgLy8gYXR0YWNoIHRoZSByZW5kZXItc3VwcGxpZWQgRE9NIGVsZW1lbnRcbiAgJGNvbnRhaW5lci5hcHBlbmQocmVuZGVyZXIuZG9tRWxlbWVudCk7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCA4OyArK2kpXG4gICAgYWRkTW9kZWwoJ21vZGVscy9hc3Rlcm9pZC5qcycsICdtb2RlbHMvYXN0ZXJvaWQuanBnJyk7XG5cbiAgLy8gY3JlYXRlIGEgcG9pbnQgbGlnaHRcbiAgdmFyIHBvaW50TGlnaHQgPSBuZXcgVEhSRUUuUG9pbnRMaWdodCgweEZGRkZGRik7XG5cbiAgLy8gc2V0IGl0cyBwb3NpdGlvblxuICBwb2ludExpZ2h0LnBvc2l0aW9uLnggPSAxMDtcbiAgcG9pbnRMaWdodC5wb3NpdGlvbi55ID0gNTA7XG4gIHBvaW50TGlnaHQucG9zaXRpb24ueiA9IDEzMDtcblxuICAvLyBhZGQgdG8gdGhlIHNjZW5lXG4gIHNjZW5lLmFkZChwb2ludExpZ2h0KTtcbn1cblxuZnVuY3Rpb24gYWRkTW9kZWwoX21vZGVsLCBtZXNoVGV4dHVyZSkge1xuICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoeyBtYXA6IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUobWVzaFRleHR1cmUpIH0pO1xuICB2YXIgbG9hZGVyID0gbmV3IFRIUkVFLkpTT05Mb2FkZXIoZmFsc2UpO1xuICBsb2FkZXIubG9hZChfbW9kZWwsIGZ1bmN0aW9uIChnZW9tZXRyeSwgbWF0ZXJpYWxzKSB7XG4gICAgLy8gbWF0ZXJpYWxzWzBdLm1vcnBoVGFyZ2V0cyA9IHRydWU7XG4gICAgLy8gbWF0ZXJpYWwuc2hhZGluZyA9IFRIUkVFLkZsYXRTaGFkaW5nO1xuICAgIHZhciBtZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTsgLy8gbmV3IFRIUkVFLk1lc2hGYWNlTWF0ZXJpYWwobWF0ZXJpYWxzKVxuICAgIG1lc2gucG9zaXRpb24ueiA9IDA7XG4gICAgbWVzaC5wb3NpdGlvbi54ID0gTWF0aC5yYW5kb20oKSAqIDQyMCAtIDIxMDtcbiAgICBtZXNoLnBvc2l0aW9uLnkgPSBNYXRoLnJhbmRvbSgpICogMTgwIC0gOTA7XG4gICAgbWVzaC5yb3RhdGlvbi54ID0gbWVzaC5yb3RhdGlvbi55ID0gbWVzaC5yb3RhdGlvbi56ID0gMDtcbiAgICBtZXNoLnNjYWxlLnggICAgPSBtZXNoLnNjYWxlLnkgICAgPSBtZXNoLnNjYWxlLnogICAgPSAyMDtcbiAgICBtZXNoLm1hdHJpeEF1dG9VcGRhdGUgPSBmYWxzZTtcbiAgICBtZXNoLnVwZGF0ZU1hdHJpeCgpO1xuICAgIHNjZW5lLmFkZChtZXNoKTtcbiAgICBtZXNoZXMucHVzaChjcmVhdGVBc3Rlcm9pZChtZXNoKSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVBc3Rlcm9pZChtZXNoKSB7XG4gIHJldHVybiB7XG4gICAgcm90WDogKE1hdGgucmFuZG9tKCkgLSAuNSkgLyA1MCxcbiAgICByb3RZOiAoTWF0aC5yYW5kb20oKSAtIC41KSAvIDUwLFxuICAgIGR4OiAoTWF0aC5yYW5kb20oKSAtIC41KSAvIDIsXG4gICAgZHk6IChNYXRoLnJhbmRvbSgpIC0gLjUpIC8gMixcbiAgICBtZXNoOiBtZXNoXG4gIH07XG59XG5cbmZ1bmN0aW9uIGFuaW1hdGUoKSB7XG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZShhbmltYXRlKTtcbiAgdXBkYXRlKCk7XG4gIHJlbmRlcigpO1xufVxuXG5mdW5jdGlvbiB1cGRhdGUoKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbWVzaGVzLmxlbmd0aDsgKytpKSB7XG4gICAgdmFyIGEgPSBtZXNoZXNbaV07XG4gICAgdmFyIG9sZFBvcyA9IGEubWVzaC5wb3NpdGlvbjtcblxuICAgIGEubWVzaC5wb3NpdGlvbi54ICs9IGEuZHg7XG4gICAgYS5tZXNoLnBvc2l0aW9uLnkgKz0gYS5keTtcblxuICAgIGlmIChjaGVja0NvbGxpc2lvbnMoaSkpIHtcbiAgICAgIGEubWVzaC5wb3NpdGlvbi54ID0gb2xkUG9zLng7XG4gICAgICBhLm1lc2gucG9zaXRpb24ueSA9IG9sZFBvcy55O1xuICAgIH1cblxuICAgIGlmIChhLm1lc2gucG9zaXRpb24ueCA+IDIyNSkge1xuICAgICAgYS5tZXNoLnBvc2l0aW9uLnggPSAyMjU7XG4gICAgICBhLmR4ICo9IC0xO1xuICAgIH1cblxuICAgIGlmIChhLm1lc2gucG9zaXRpb24ueCA8IC0yMjUpIHtcbiAgICAgIGEubWVzaC5wb3NpdGlvbi54ID0gLTIyNTtcbiAgICAgIGEuZHggKj0gLTE7XG4gICAgfVxuXG4gICAgaWYgKGEubWVzaC5wb3NpdGlvbi55ID4gMTAwKSB7XG4gICAgICBhLm1lc2gucG9zaXRpb24ueSA9IDEwMDtcbiAgICAgIGEuZHkgKj0gLTE7XG4gICAgfVxuXG4gICAgaWYgKGEubWVzaC5wb3NpdGlvbi55IDwgLTEwMCkge1xuICAgICAgYS5tZXNoLnBvc2l0aW9uLnkgPSAtMTAwO1xuICAgICAgYS5keSAqPSAtMTtcbiAgICB9XG5cbiAgICBhLm1lc2gucm90YXRpb24ueiArPSBhLnJvdFg7XG4gICAgYS5tZXNoLnJvdGF0aW9uLnggKz0gYS5yb3RZO1xuXG4gICAgYS5tZXNoLnVwZGF0ZU1hdHJpeCgpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgcmVuZGVyZXIucmVuZGVyKHNjZW5lLCBjYW1lcmEpO1xufVxuXG5mdW5jdGlvbiBjaGVja0NvbGxpc2lvbnMoaikge1xuICB2YXIgbTIgPSBtZXNoZXNbal0ubWVzaC5wb3NpdGlvbjtcbiAgLy8gdmFyIGRpc3QyID0gbWVzaGVzW2pdLm1lc2guZ2VvbWV0cnkuYm91bmRpbmdTcGhlcmUucmFkaXVzICogbWVzaGVzW2pdLm1lc2guc2NhbGUueDtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IG1lc2hlcy5sZW5ndGg7ICsraSkge1xuICAgIGlmIChpID09PSBqKSBjb250aW51ZTtcblxuICAgIHZhciBtMSA9IG1lc2hlc1tpXS5tZXNoLnBvc2l0aW9uO1xuICAgIHZhciBkID0gTWF0aC5zcXJ0KE1hdGgucG93KG0xLnggLSBtMi54LCAyKSArIE1hdGgucG93KG0xLnkgLSBtMi55LCAyKSArIE1hdGgucG93KG0xLnogLSBtMi56LCAyKSk7XG5cbiAgICAvLyB2YXIgZGlzdCA9IGRpc3QyICsgbWVzaGVzW2ldLm1lc2guZ2VvbWV0cnkuYm91bmRpbmdTcGhlcmUucmFkaXVzICogbWVzaGVzW2ldLm1lc2guc2NhbGUueDtcbiAgICAvLyBpZiAoaiA9PSAwKVxuICAgIC8vICAgY29uc29sZS5sb2coZCwgZGlzdCk7XG5cbiAgICAvLyBpZiAoZCA8PSBkaXN0KSB7XG4gICAgaWYgKGQgPD0gNDApIHtcbiAgICAgIHZhciB0ZW1wWCA9IG1lc2hlc1tpXS5keDtcbiAgICAgIHZhciB0ZW1wWSA9IG1lc2hlc1tpXS5keTtcblxuICAgICAgbWVzaGVzW2ldLmR4ID0gbWVzaGVzW2pdLmR4O1xuICAgICAgbWVzaGVzW2ldLmR5ID0gbWVzaGVzW2pdLmR5O1xuXG4gICAgICBtZXNoZXNbal0uZHggPSB0ZW1wWDtcbiAgICAgIG1lc2hlc1tqXS5keSA9IHRlbXBZO1xuXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59XG4iXX0=
;