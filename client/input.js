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
