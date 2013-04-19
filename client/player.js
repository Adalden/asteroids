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
