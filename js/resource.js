var R = window.R = {};

R.black = "#080808";

R.cellBorder = "#102028";
R.cellBg = "#0e1010";
R.cellPathBg = "#181818";
R.cellHover = "rgba(255,255,255,0.1)";
R.cellDark = "#101010";

R.cellActiveBorder = "#204050";

R.cellStart = "#202b24";
R.cellEnd = "#2b2420";

R.enemyGreen = "#30ff90";
R.enemyDarkGreen = "#005500";

R.towerGrey = "#303030";
R.towerYellow = "#f0a000";
R.towerDarkYellow = "#704000";
R.towerDarkRed = "#9b0000";
R.towerRed = "#cb0000";
R.towerRange = "rgba(0,10,10,0.3)";
R.towerDarkGreen = "#007000";
R.towerGreen = "#00f000";

R.towerBulletYellow = R.towerDarkYellow;

R.makePatterns = function(ctx){
  var patternCanvas = document.createElement("canvas");
  patternCanvas.width = 8;
  patternCanvas.height = 8;
  var pctx = patternCanvas.getContext("2d");

  // dotPattern
  pctx.clearRect(0,0, patternCanvas.width,patternCanvas.height);
  pctx.fillStyle = R.cellDark;
  pctx.beginPath();
  pctx.arc(4, 4, 2, 0, 2*Math.PI);
  pctx.closePath();
  pctx.fill();
  R.dotPattern = ctx.createPattern(patternCanvas, "repeat");

  // crossPattern
  pctx.fillStyle = R.black;
  pctx.rect(0,0, patternCanvas.width,patternCanvas.height);
  pctx.fill();
  pctx.fillStyle = R.cellDark;
  pctx.beginPath();
  pctx.moveTo(0, 4);
  pctx.lineTo(4, 0);
  pctx.lineTo(8, 0);
  pctx.lineTo(0, 8);
  pctx.closePath();
  pctx.fill();
  pctx.beginPath();
  pctx.moveTo(4, 8);
  pctx.lineTo(8, 4);
  pctx.lineTo(8, 8);
  pctx.closePath();
  pctx.fill();
  R.crossPattern = ctx.createPattern(patternCanvas, "repeat");

};

R.makeTowers = function(ctx){
  R.towers = {};

  // standard
  (function(){
    R.towers['standard'] = makeTowerCanvas();
    var tctx = R.towers['standard'].getContext("2d");
    var towerBase = new Path2D();
    towerBase.arc(0, 0, 7, 0, 2*Math.PI);
    var towerGun = new Path2D();
    towerGun.rect(-6, -1.5, 22, 3);
    tctx.translate(Hex.radius, Hex.radius);
    tctx.fillStyle = R.towerGrey;
    tctx.strokeStyle = R.towerDarkYellow;
    tctx.fill(towerBase);
    tctx.stroke(towerBase);
    tctx.fillStyle = R.towerYellow;
    tctx.fill(towerGun);
    tctx.stroke(towerGun);
  })();

  // rapid
  (function(){
    R.towers['rapid'] = makeTowerCanvas();
    var tctx = R.towers['rapid'].getContext("2d");
    var towerBase = new Path2D();
    towerBase.arc(0, 0, 9, 0, 2*Math.PI);
    var towerGun = new Path2D();
    towerGun.rect(-6, -3, 22, 2);
    towerGun.rect(-6, 1, 22, 2);
    tctx.translate(Hex.radius, Hex.radius);
    tctx.fillStyle = R.towerGrey;
    tctx.strokeStyle = R.towerDarkGreen;
    tctx.fill(towerBase);
    tctx.stroke(towerBase);
    tctx.fillStyle = R.towerGreen;
    tctx.fill(towerGun);
    tctx.stroke(towerGun);
  })();

  // laser
  (function(){
    R.towers['laser'] = makeTowerCanvas();
    var tctx = R.towers['laser'].getContext("2d");
    var towerBase = new Path2D();
    towerBase.arc(0, 0, 8, 0, 2*Math.PI);
    var towerGun = new Path2D();
    towerGun.moveTo(-10, -4);
    towerGun.lineTo(14, 0);
    towerGun.lineTo(-10, 4);
    tctx.translate(Hex.radius, Hex.radius);
    tctx.fillStyle = R.towerGrey;
    tctx.strokeStyle = R.towerDarkRed;
    tctx.fill(towerBase);
    tctx.stroke(towerBase);
    tctx.fillStyle = R.towerGrey;
    tctx.strokeStyle = R.towerRed;
    tctx.lineWidth = 2;
    // tctx.fill(towerGun);
    tctx.stroke(towerGun);
  })();

  // slower

  function makeTowerCanvas(){
    var towerCanvas = document.createElement("canvas");
    towerCanvas.width = Hex.radius * 2;
    towerCanvas.height = Hex.radius * 2;
    return towerCanvas;
  }
};
