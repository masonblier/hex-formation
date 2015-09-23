var Hex = window.Hex = {};

Hex.radius = 22;
Hex.height = Hex.radius * 2;
Hex.width = Math.sqrt(3)/2 * Hex.height;

Hex.pixelToHex = function(x, y){
  return Hex.roundHex({
    q: (x * Math.sqrt(3)/3 - y / 3) / Hex.radius,
    r: (y * 2/3 / Hex.radius) - 1
  });
};

Hex.getHexCenter = function(q, r){
  return {
    x: Hex.radius * Math.sqrt(3) * (q + r/2),
    y: Hex.radius * 3/2 * r
  };
};

Hex.roundHex = function(ha){
  var hc_x = ha.q;
  var hc_z = ha.r;
  var hc_y = -hc_x-hc_z;

  var rhc_x = Math.round(hc_x);
  var rhc_y = Math.round(hc_y);
  var rhc_z = Math.round(hc_z);

  var x_diff = Math.abs(rhc_x - hc_x);
  var y_diff = Math.abs(rhc_y - hc_y);
  var z_diff = Math.abs(rhc_z - hc_z);

  if (x_diff > y_diff && x_diff > z_diff) {
    rhc_x = -rhc_y-rhc_z;
  } else if (y_diff > z_diff) {
    rhc_y = -rhc_x-rhc_z;
  } else {
    rhc_z = -rhc_x-rhc_y;
  }

  return {
    q: rhc_x,
    r: rhc_z
  };
};
