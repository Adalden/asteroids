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
