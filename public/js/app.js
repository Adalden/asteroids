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
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvc2Nvb2JzL0Rldi9qcy9hc3Rlcm9pZHMvY2xpZW50L21haW4uanMiLCIvVXNlcnMvc2Nvb2JzL0Rldi9qcy9hc3Rlcm9pZHMvY2xpZW50L3Rlc3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbIndpbmRvdy5yZXF1aXJlID0gcmVxdWlyZTtcblxudmFyIHRlc3QgPSByZXF1aXJlKCcuL3Rlc3QnKTtcblxudGVzdC5pbml0KCk7XG50ZXN0LnN0YXJ0KCk7XG4iLCJ2YXIgcmVuZGVyZXJcbiAgLCBjYW1lcmFcbiAgLCBzY2VuZVxuICAsIHNoaXBcbiAgLCBtZXNoZXMgPSBbXTtcblxuJChkb2N1bWVudCkua2V5ZG93bihmdW5jdGlvbiAoZSkge1xuICBpZiAoIXNoaXApIHJldHVybjtcblxuICBpZiAoZS5rZXlDb2RlID09PSAzNykge1xuICAgIHNoaXAucm90YXRpb24ueSArPSBNYXRoLlBJIC8gMTgwICogNTtcbiAgICBzaGlwLnVwZGF0ZU1hdHJpeCgpO1xuICB9XG5cbiAgaWYoZS5rZXlDb2RlID09IDM5KXtcbiAgICBzaGlwLnJvdGF0aW9uLnkgLT0gTWF0aC5QSSAvIDE4MCAqIDU7XG4gICAgc2hpcC51cGRhdGVNYXRyaXgoKTtcbiAgfVxuXG4gIGlmKGUua2V5Q29kZSA9PSAzOCl7XG4gICAgc2hpcC5wb3NpdGlvbi55IC09IE1hdGguY29zKHNoaXAucm90YXRpb24ueSkgKiA1O1xuICAgIHNoaXAucG9zaXRpb24ueCArPSBNYXRoLnNpbihzaGlwLnJvdGF0aW9uLnkpICogNTtcbiAgICBzaGlwLnVwZGF0ZU1hdHJpeCgpO1xuICB9XG5cbiAgaWYoZS5rZXlDb2RlID09IDQwKXtcbiAgICBzaGlwLnBvc2l0aW9uLnkgLT0gNTtcbiAgICBzaGlwLnVwZGF0ZU1hdHJpeCgpO1xuICB9XG59KTtcblxudmFyIERFQlVHID0gdHJ1ZTtcblxuZXhwb3J0cy5pbml0ID0gaW5pdGlhbGl6ZTtcbmV4cG9ydHMuc3RhcnQgPSBhbmltYXRlO1xuXG5mdW5jdGlvbiBpbml0aWFsaXplKCkge1xuICAvLyBzZXQgdGhlIHNjZW5lIHNpemVcbiAgdmFyIFdJRFRIICA9IDE0NDBcbiAgICAsIEhFSUdIVCA9IDcwMDtcblxuICAvLyBzZXQgc29tZSBjYW1lcmEgYXR0cmlidXRlc1xuICB2YXIgVklFV19BTkdMRSA9IDQ1XG4gICAgLCBBU1BFQ1QgICAgID0gV0lEVEggLyBIRUlHSFRcbiAgICAsIE5FQVIgICAgICAgPSAwLjFcbiAgICAsIEZBUiAgICAgICAgPSAxMDAwMDtcblxuICAvLyBnZXQgdGhlIERPTSBlbGVtZW50IHRvIGF0dGFjaCB0b1xuICAvLyAtIGFzc3VtZSB3ZSd2ZSBnb3QgalF1ZXJ5IHRvIGhhbmRcbiAgdmFyICRjb250YWluZXIgPSAkKCcjdGVzdCcpO1xuXG4gIC8vIGNyZWF0ZSBhIFdlYkdMIHJlbmRlcmVyLCBjYW1lcmFcbiAgLy8gYW5kIGEgc2NlbmVcbiAgcmVuZGVyZXIgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcigpO1xuICBjYW1lcmEgICA9IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYShWSUVXX0FOR0xFLCBBU1BFQ1QsIE5FQVIsIEZBUik7XG4gIHNjZW5lICAgID0gbmV3IFRIUkVFLlNjZW5lKCk7XG5cbiAgLy8gYWRkIHRoZSBjYW1lcmEgdG8gdGhlIHNjZW5lXG4gIHNjZW5lLmFkZChjYW1lcmEpO1xuXG4gIC8vIHRoZSBjYW1lcmEgc3RhcnRzIGF0IDAsMCwwXG4gIC8vIHNvIHB1bGwgaXQgYmFja1xuICBjYW1lcmEucG9zaXRpb24ueiA9IDMwMDtcblxuICAvLyBzdGFydCB0aGUgcmVuZGVyZXJcbiAgcmVuZGVyZXIuc2V0U2l6ZShXSURUSCwgSEVJR0hUKTtcblxuICAvLyBhdHRhY2ggdGhlIHJlbmRlci1zdXBwbGllZCBET00gZWxlbWVudFxuICAkY29udGFpbmVyLmFwcGVuZChyZW5kZXJlci5kb21FbGVtZW50KTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IDg7ICsraSkge1xuICAgIGFkZE1vZGVsKCdtb2RlbHMvYXN0ZXJvaWQuanMnLCAnbW9kZWxzL2FzdGVyb2lkLmpwZycsIGFkZEJvdW5kaW5nU3BoZXJlKTtcbiAgfVxuXG4gIGFkZFNoaXAoJ21vZGVscy9zaGlwLmpzJyk7XG5cbiAgLy8gY3JlYXRlIGEgcG9pbnQgbGlnaHRcbiAgdmFyIHBvaW50TGlnaHQgPSBuZXcgVEhSRUUuUG9pbnRMaWdodCgweEZGRkZGRik7XG5cbiAgLy8gc2V0IGl0cyBwb3NpdGlvblxuICBwb2ludExpZ2h0LnBvc2l0aW9uLnggPSAxMDtcbiAgcG9pbnRMaWdodC5wb3NpdGlvbi55ID0gNTA7XG4gIHBvaW50TGlnaHQucG9zaXRpb24ueiA9IDEzMDtcblxuICAvLyBhZGQgdG8gdGhlIHNjZW5lXG4gIHNjZW5lLmFkZChwb2ludExpZ2h0KTtcbn1cblxuZnVuY3Rpb24gYWRkTW9kZWwoX21vZGVsLCBtZXNoVGV4dHVyZSwgY2IpIHtcbiAgY2IgPSBjYiB8fCBmdW5jdGlvbiAoKSB7fTtcbiAgdmFyIG1hdGVyaWFsID0gdW5kZWZpbmVkO1xuICBpZiAobWVzaFRleHR1cmUpXG4gICAgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoeyBtYXA6IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUobWVzaFRleHR1cmUpIH0pO1xuICB2YXIgbG9hZGVyID0gbmV3IFRIUkVFLkpTT05Mb2FkZXIoZmFsc2UpO1xuICBsb2FkZXIubG9hZChfbW9kZWwsIGZ1bmN0aW9uIChnZW9tZXRyeSwgbWF0ZXJpYWxzKSB7XG4gICAgdmFyIG1lc2ggPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpOyAvLyBuZXcgVEhSRUUuTWVzaEZhY2VNYXRlcmlhbChtYXRlcmlhbHMpXG4gICAgbWVzaC5wb3NpdGlvbi56ID0gMDtcbiAgICBtZXNoLnBvc2l0aW9uLnggPSBNYXRoLnJhbmRvbSgpICogNDIwIC0gMjEwO1xuICAgIG1lc2gucG9zaXRpb24ueSA9IE1hdGgucmFuZG9tKCkgKiAxODAgLSA5MDtcbiAgICBtZXNoLnJvdGF0aW9uLnggPSBtZXNoLnJvdGF0aW9uLnkgPSBtZXNoLnJvdGF0aW9uLnogPSAwO1xuICAgIG1lc2guc2NhbGUueCAgICA9IG1lc2guc2NhbGUueSAgICA9IG1lc2guc2NhbGUueiAgICA9IDIwO1xuXG4gICAgbWVzaC5nZW9tZXRyeS5ib3VuZGluZ1NwaGVyZS5yYWRpdXMgLT0gLjI7XG5cbiAgICB3aGlsZSAoY29sbGlkZXNURVNUKG1lc2gpKSB7XG4gICAgICBtZXNoLnBvc2l0aW9uLnggPSBNYXRoLnJhbmRvbSgpICogNDIwIC0gMjEwO1xuICAgICAgbWVzaC5wb3NpdGlvbi55ID0gTWF0aC5yYW5kb20oKSAqIDE4MCAtIDkwO1xuICAgIH1cbiAgICBtZXNoLm1hdHJpeEF1dG9VcGRhdGUgPSBmYWxzZTtcbiAgICBtZXNoLnVwZGF0ZU1hdHJpeCgpO1xuICAgIHNjZW5lLmFkZChtZXNoKTtcbiAgICBtZXNoZXMucHVzaChjcmVhdGVBc3Rlcm9pZChtZXNoKSk7XG4gICAgY2IobWVzaCk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBhZGRTaGlwKF9tb2RlbCl7XG4gIHZhciBsb2FkZXIgPSBuZXcgVEhSRUUuSlNPTkxvYWRlcihmYWxzZSk7XG4gIGxvYWRlci5sb2FkKF9tb2RlbCwgZnVuY3Rpb24gKGdlb21ldHJ5LCBtYXRlcmlhbHMpIHtcbiAgICB2YXIgbWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbHNbMF0pOyAvLyBuZXcgVEhSRUUuTWVzaEZhY2VNYXRlcmlhbChtYXRlcmlhbHMpXG4gICAgbWVzaC5wb3NpdGlvbi54ID0gbWVzaC5wb3NpdGlvbi55ID0gbWVzaC5wb3NpdGlvbi56ID0gMDtcbiAgICBtZXNoLnJvdGF0aW9uLnggPSBtZXNoLnJvdGF0aW9uLnkgPSBtZXNoLnJvdGF0aW9uLnogPSAwO1xuICAgIG1lc2guc2NhbGUueCAgICA9IG1lc2guc2NhbGUueSAgICA9IG1lc2guc2NhbGUueiAgICA9IC4xO1xuXG4gICAgbWVzaC5yb3RhdGlvbi54ID0gOTA7XG5cbiAgICBtZXNoLm1hdHJpeEF1dG9VcGRhdGUgPSBmYWxzZTtcbiAgICBtZXNoLnVwZGF0ZU1hdHJpeCgpO1xuICAgIHNjZW5lLmFkZChtZXNoKTtcbiAgICBzaGlwID0gbWVzaDtcbiAgfSk7XG5cblxufVxuXG5mdW5jdGlvbiBjb2xsaWRlc1RFU1QobWVzaCkge1xuICB2YXIgbTIgPSBtZXNoLnBvc2l0aW9uO1xuICB2YXIgZGlzdDIgPSBtZXNoLmdlb21ldHJ5LmJvdW5kaW5nU3BoZXJlLnJhZGl1cyAqIG1lc2guc2NhbGUueDtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IG1lc2hlcy5sZW5ndGg7ICsraSkge1xuXG4gICAgdmFyIG0xID0gbWVzaGVzW2ldLm1lc2gucG9zaXRpb247XG4gICAgdmFyIGQgPSBNYXRoLnNxcnQoTWF0aC5wb3cobTEueCAtIG0yLngsIDIpICsgTWF0aC5wb3cobTEueSAtIG0yLnksIDIpICsgTWF0aC5wb3cobTEueiAtIG0yLnosIDIpKTtcblxuICAgIHZhciBkaXN0ID0gZGlzdDIgKyBtZXNoZXNbaV0ubWVzaC5nZW9tZXRyeS5ib3VuZGluZ1NwaGVyZS5yYWRpdXMgKiBtZXNoZXNbaV0ubWVzaC5zY2FsZS54O1xuICAgIGlmIChkIDw9IGRpc3QpIHtcbiAgICAvLyBpZiAoZCA8PSA0MCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBhZGRCb3VuZGluZ1NwaGVyZShtZXNoKSB7XG4gIGlmICghREVCVUcpIHJldHVybjtcblxuICB2YXIgcmFkaXVzICAgPSBtZXNoLmdlb21ldHJ5LmJvdW5kaW5nU3BoZXJlLnJhZGl1c1xuICAgICwgc2VnbWVudHMgPSAxNlxuICAgICwgcmluZ3MgICAgPSAxNjtcblxuICB2YXIgc3BoZXJlID0gbmV3IFRIUkVFLk1lc2goXG4gICAgbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KHJhZGl1cywgc2VnbWVudHMsIHJpbmdzKVxuICAgIC8vIG5ldyBUSFJFRS5NZXNoTGFtYmVydE1hdGVyaWFsKHsgY29sb3I6IDB4Q0MwMDAwIH0pXG4gICk7XG5cbiAgc3BoZXJlLnNjYWxlID0gbWVzaC5zY2FsZTtcbiAgc3BoZXJlLnBvc2l0aW9uID0gbWVzaC5wb3NpdGlvbjtcblxuICBzY2VuZS5hZGQoc3BoZXJlKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlQXN0ZXJvaWQobWVzaCkge1xuICByZXR1cm4ge1xuICAgIHJvdFg6IChNYXRoLnJhbmRvbSgpIC0gLjUpIC8gNTAsXG4gICAgcm90WTogKE1hdGgucmFuZG9tKCkgLSAuNSkgLyA1MCxcbiAgICBkeDogKE1hdGgucmFuZG9tKCkgLSAuNSkgLyAyLFxuICAgIGR5OiAoTWF0aC5yYW5kb20oKSAtIC41KSAvIDIsXG4gICAgbWVzaDogbWVzaFxuICB9O1xufVxuXG5mdW5jdGlvbiBhbmltYXRlKCkge1xuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYW5pbWF0ZSk7XG4gIHVwZGF0ZSgpO1xuICByZW5kZXIoKTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlKCkge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG1lc2hlcy5sZW5ndGg7ICsraSkge1xuICAgIHZhciBhID0gbWVzaGVzW2ldO1xuICAgIHZhciBvbGRQb3MgPSBhLm1lc2gucG9zaXRpb247XG5cbiAgICBhLm1lc2gucG9zaXRpb24ueCArPSBhLmR4O1xuICAgIGEubWVzaC5wb3NpdGlvbi55ICs9IGEuZHk7XG5cbiAgICBpZiAoY2hlY2tDb2xsaXNpb25zKGkpKSB7XG4gICAgICBhLm1lc2gucG9zaXRpb24ueCA9IG9sZFBvcy54O1xuICAgICAgYS5tZXNoLnBvc2l0aW9uLnkgPSBvbGRQb3MueTtcbiAgICB9XG5cbiAgICBpZiAoYS5tZXNoLnBvc2l0aW9uLnggPiAyMjUpIHtcbiAgICAgIGEubWVzaC5wb3NpdGlvbi54ID0gMjI1O1xuICAgICAgYS5keCAqPSAtMTtcbiAgICB9XG5cbiAgICBpZiAoYS5tZXNoLnBvc2l0aW9uLnggPCAtMjI1KSB7XG4gICAgICBhLm1lc2gucG9zaXRpb24ueCA9IC0yMjU7XG4gICAgICBhLmR4ICo9IC0xO1xuICAgIH1cblxuICAgIGlmIChhLm1lc2gucG9zaXRpb24ueSA+IDEwMCkge1xuICAgICAgYS5tZXNoLnBvc2l0aW9uLnkgPSAxMDA7XG4gICAgICBhLmR5ICo9IC0xO1xuICAgIH1cblxuICAgIGlmIChhLm1lc2gucG9zaXRpb24ueSA8IC0xMDApIHtcbiAgICAgIGEubWVzaC5wb3NpdGlvbi55ID0gLTEwMDtcbiAgICAgIGEuZHkgKj0gLTE7XG4gICAgfVxuXG4gICAgYS5tZXNoLnJvdGF0aW9uLnogKz0gYS5yb3RYO1xuICAgIGEubWVzaC5yb3RhdGlvbi54ICs9IGEucm90WTtcblxuICAgIGEubWVzaC51cGRhdGVNYXRyaXgoKTtcbiAgfVxufVxuXG5mdW5jdGlvbiByZW5kZXIoKSB7XG4gIHJlbmRlcmVyLnJlbmRlcihzY2VuZSwgY2FtZXJhKTtcbn1cblxuZnVuY3Rpb24gY2hlY2tDb2xsaXNpb25zKGopIHtcbiAgdmFyIG0yID0gbWVzaGVzW2pdLm1lc2gucG9zaXRpb247XG4gIHZhciBkaXN0MiA9IG1lc2hlc1tqXS5tZXNoLmdlb21ldHJ5LmJvdW5kaW5nU3BoZXJlLnJhZGl1cyAqIG1lc2hlc1tqXS5tZXNoLnNjYWxlLng7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBtZXNoZXMubGVuZ3RoOyArK2kpIHtcbiAgICBpZiAoaSA9PT0gaikgY29udGludWU7XG5cbiAgICB2YXIgbTEgPSBtZXNoZXNbaV0ubWVzaC5wb3NpdGlvbjtcbiAgICB2YXIgZCA9IE1hdGguc3FydChNYXRoLnBvdyhtMS54IC0gbTIueCwgMikgKyBNYXRoLnBvdyhtMS55IC0gbTIueSwgMikgKyBNYXRoLnBvdyhtMS56IC0gbTIueiwgMikpO1xuXG4gICAgdmFyIGRpc3QgPSBkaXN0MiArIG1lc2hlc1tpXS5tZXNoLmdlb21ldHJ5LmJvdW5kaW5nU3BoZXJlLnJhZGl1cyAqIG1lc2hlc1tpXS5tZXNoLnNjYWxlLng7XG4gICAgLy8gaWYgKGogPT0gMClcbiAgICAvLyAgIGNvbnNvbGUubG9nKGQsIGRpc3QpO1xuXG4gICAgaWYgKGQgPD0gZGlzdCkge1xuICAgIC8vIGlmIChkIDw9IDQwKSB7XG4gICAgICB2YXIgdGVtcFggPSBtZXNoZXNbaV0uZHg7XG4gICAgICB2YXIgdGVtcFkgPSBtZXNoZXNbaV0uZHk7XG5cbiAgICAgIG1lc2hlc1tpXS5keCA9IG1lc2hlc1tqXS5keDtcbiAgICAgIG1lc2hlc1tpXS5keSA9IG1lc2hlc1tqXS5keTtcblxuICAgICAgbWVzaGVzW2pdLmR4ID0gdGVtcFg7XG4gICAgICBtZXNoZXNbal0uZHkgPSB0ZW1wWTtcblxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuIl19
;