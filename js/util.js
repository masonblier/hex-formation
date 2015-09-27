var U = window.U = {};

// math utils

U.distance = function(pos1, pos2){
  return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2));
};

U.pointToLineDistance = function(circle, p1, p2){
  // point to line distance http://stackoverflow.com/a/1088058
  var llen = U.distance(p1, p2);
  var ldx = (p2.x - p1.x) / llen;
  var ldy = (p2.y - p1.y) / llen;
  var cpt = ldx * (circle.x - p1.x) + ldy * (circle.y - p1.y);
  var cpx = cpt * ldx + p1.x;
  var cpy = cpt * ldy + p1.y;
  return U.distance(circle, p1);
};

// format number for display
U.trimNumber = function(num, decimals){
  var numParts = (num.toString()).split('.');
  if (!numParts[1]) decimals = 0;
  return numParts[0] + (decimals > 0 ? ('.' + numParts[1].substr(0, decimals)) : '');
};

// html utils

U.createElement = function(tagName, tagId, tagClass, tagHTML) {
  var $e = document.createElement(tagName);
  if (tagId) $e.setAttribute('id', tagId);
  if (tagClass) $e.setAttribute('class', tagClass);
  if (tagHTML) $e.innerHTML = tagHTML;
  return $e;
};

U.cloneCanvas = function(oldCanvas){
  var newCanvas = document.createElement('canvas');
  var ctx = newCanvas.getContext('2d');
  newCanvas.width = oldCanvas.width;
  newCanvas.height = oldCanvas.height;
  ctx.drawImage(oldCanvas, 0, 0);
  return newCanvas;
};
