function Enemy(data) {

  var origin = data.origin;
  var path = data.path;
  var initialHealth = data.health;

  // parameters
  var moveSpeed = 0.02 * 5;
  var rotPerSec = 1;
  var dAngle = rotPerSec * (2 * Math.PI / 1000);

  // graphic
  var circleEnemy = new Path2D();
  circleEnemy.arc(0, 0, 8, 0, 2*Math.PI);
  var circleEnemy2 = new Path2D();
  circleEnemy2.rect(-2, -8, 4, 16);
  circleEnemy2.rect(-8, -2, 16, 4);
  // circleEnemy2.rect(-8, -2, 2, 4);

  // health bar
  var healthBarRect = new Path2D();
  healthBarRect.rect(-8, -12, 16, 2);

  // movement
  var pathStep = 0;
  var pos = this.pos = Hex.getHexCenter(origin.q, origin.r);
  var rotAngle = 0;

  // state
  this.health = initialHealth;
  this.killed = false;
  this.removed = false;

  // take damage
  this.applyDamage = function(damage){
    this.health -= damage;
    if (this.health <= 0) {
      this.killed = true;
      this.remove();
    }
  };

  // calculate kill reward
  this.reward = function(){
    return Math.floor(2 * initialHealth);
  };

  // remove from map
  this.remove = function(){
    this.removed = true;
    if (this.onRemove) this.onRemove();
  };

  // draw
  this.draw = function(ctx, dt){
    if (this.removed) return;

    var posDt = pathStepDelta(dt);
    pos.x += posDt.dx;
    pos.y += posDt.dy;
    if (pathStepDistance() <= 0) {
      pathStep += 1;
      if (pathStep + 1 === path.length) {
        this.remove();
        return;
      }
      var currentStep = path[pathStep];
      pos = this.pos = Hex.getHexCenter(currentStep.q, currentStep.r);
    }

    rotAngle += dt * dAngle;

    ctx.save();
    ctx.translate(pos.x, pos.y);

    ctx.save();
    ctx.rotate(rotAngle);

    // draw enemy
    ctx.fillStyle = R.enemyGreen;
    ctx.strokeStyle = R.enemyDarkGreen;
    ctx.fill(circleEnemy);
    ctx.stroke(circleEnemy);
    ctx.fillStyle = R.enemyDarkGreen;
    ctx.strokeStyle = R.cellBg;
    ctx.fill(circleEnemy2);
    ctx.stroke(circleEnemy2);
    ctx.restore();

    // draw health bar
    ctx.strokeStyle = R.healthBarBorder;
    ctx.fillStyle = R.healthBarFill;
    ctx.stroke(healthBarRect);
    ctx.scale(this.health / initialHealth, 1);
    ctx.fill(healthBarRect);

    ctx.restore();
  };

  // draw path lines
  this.drawPath = function(ctx){
    ctx.save();
    ctx.lineWidth = 2;
    ctx.lineCap="round";
    ctx.strokeStyle = "#a09000";
    ctx.beginPath();
    var c1x = path[0];
    var c1 = Hex.getHexCenter(c1x.q, c1x.r);
    ctx.moveTo(c1.x, c1.y);
    for (var ei = 1; ei < path.length; ++ei) {
      var cx = path[ei];
      var cc = Hex.getHexCenter(cx.q, cx.r);
      ctx.lineTo(cc.x, cc.y);
    }
    ctx.stroke();
    ctx.restore();
  };

  function pathStepDistance(){
    var p1 = path[pathStep];
    var p2 = path[pathStep+1];
    var cp1 = Hex.getHexCenter(p1.q, p1.r);
    var cp2 = Hex.getHexCenter(p2.q, p2.r);
    var pathStepDistance = Math.abs(cp1.x - cp2.x) + Math.abs(cp1.y - cp2.y);
    var currentDistance = Math.abs(cp1.x - pos.x) + Math.abs(cp1.y - pos.y);
    return pathStepDistance - currentDistance;
  }
  function pathStepDelta(dt){
    var p1 = path[pathStep];
    var p2 = path[pathStep+1];
    var cp1 = Hex.getHexCenter(p1.q, p1.r);
    var cp2 = Hex.getHexCenter(p2.q, p2.r);
    var da = Math.sqrt(Math.pow(cp2.x - cp1.x, 2) + Math.pow(cp2.y - cp1.y, 2));
    return {
      dx: moveSpeed * dt * (cp2.x - cp1.x) / da,
      dy: moveSpeed * dt * (cp2.y - cp1.y) / da
    };
  }
}
