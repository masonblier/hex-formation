Tower.types = {
  'standard': {
    'name': "Standard",
    'cost': 50,
    'initial_dps': 2,
    'initial_range': 3,
    'multiplier': 1.5,
    'rate': 1
  },
  'rapid': {
    'name': "Rapid Fire",
    'cost': 70,
    'initial_dps': 2,
    'initial_range': 2,
    'multiplier': 1.5,
    'rate': 5
  },
  'laser': {
    'name': "Laser Beam",
    'cost': 120,
    'initial_dps': 2,
    'initial_range': 4,
    'multiplier': 1.2
  },
  // 'slower': {
  //   'name': "Slow-Down Beam",
  //   'cost': 200,
  //   'initial_dps': 1,
  //   'initial_range': 3,
  //   'multiplier': 1.5
  // }
};

function Tower(data) {
  var _this = this;

  var pos = this.pos = data.position;
  var target = data.target || null;

  if (!Tower.types[data.type])
    throw new Error("unknown tower type: "+data.type);

  var params = Tower.types[data.type];
  var towerCanvas = R.towers[data.type];

  // parameters
  var bulletSpeed = 0.5;
  var bulletsPerSecond = params.rate;

  // state
  var rotAngle = 0;
  var bullets = [];
  var msToBullet = 0;

  _this.level = 0;
  function updateParams(){
    var multiplier = (1 + params.multiplier * _this.level);
    _this.range = Hex.radius * params.initial_range * multiplier;
    _this.damage = params.initial_dps * multiplier;
  }
  updateParams();

  // resource
  var towerRange = new Path2D();
  towerRange.arc(0, 0, _this.range, 0, 2*Math.PI);

  // method overrides
  var makeBullet, drawBullet, toggleSide = -1;
  if (data.type === 'rapid') {
    makeBullet = function(){
      toggleSide = -toggleSide;
      return {
        x: pos.x + (Math.cos(rotAngle + toggleSide*0.1) * 18),
        y: pos.y + (Math.sin(rotAngle + toggleSide*0.1) * 18),
        angle: rotAngle
      };
    };
    drawBullet = function(bullet){
      ctx.save();
      ctx.fillStyle = R.towerGreen;
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, 2, 0, 2*Math.PI);
      ctx.fill();
      ctx.restore();
    };

  } else if (data.type === 'laser') {
    makeBullet = function(){
      return {};
    };
    drawBullet = function(bullet){
      var x1 = pos.x + (Math.cos(rotAngle) * 18);
      var y1 = pos.y + (Math.sin(rotAngle) * 18);

      ctx.save();
      ctx.strokeStyle = R.towerRed;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(target.pos.x, target.pos.y);
      ctx.stroke();
      ctx.restore();
    };

  } else {
    makeBullet = function(){
      return {
        x: pos.x + (Math.cos(rotAngle) * 18),
        y: pos.y + (Math.sin(rotAngle) * 18),
        angle: rotAngle
      };
    };
    drawBullet = function(bullet){
      ctx.save();
      ctx.fillStyle = R.towerBulletYellow;
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, 3, 0, 2*Math.PI);
      ctx.fill();
      ctx.restore();
    };
  }

  // draw
  _this.draw = function(ctx, dt){
    if (_this.removed) return;

    // update
    if (target && (target.removed || U.distance(pos, target.pos) > _this.range)) {
      // target out of range
      target = null;
    }
    if (!target) {
      // check for new target
      target = game.getTargetsInRange(pos, _this.range)[0] || null;
    }
    if (target) {
      // aim at target
      var dx = target.pos.x - pos.x;
      var dy = target.pos.y - pos.y;
      rotAngle = Math.atan2(dy, dx);

      // fire bullet on interval
      if (msToBullet <= 0) {
        bullets.push(makeBullet());
        msToBullet = 1000 / bulletsPerSecond;
      } else {
        msToBullet -= dt;
      }
    }

    // draw
    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate(rotAngle);
    ctx.translate(-Hex.radius, -Hex.radius);

    ctx.drawImage(towerCanvas, 0, 0);

    ctx.restore();

    _this.drawBullets(ctx, dt);
  };

  _this.drawBullets = function(ctx, dt){
    for (var i = 0; i < bullets.length; ++i) {
      if (!bullets[i]) continue;
      var bullet = bullets[i];

      // check if out of range
      var mapRange = game.getMapRange();
      if (bullet.x < mapRange.x1 || bullet.x > mapRange.x2 ||
          bullet.y < mapRange.y1 || bullet.y > mapRange.y2) {
        bullets[i] = null;
        return;
      }

      var nextX = Math.cos(bullet.angle) * dt * bulletSpeed;
      var nextY = Math.sin(bullet.angle) * dt * bulletSpeed;

      // check for hit
      var enemyRadius = 8;
      var llen = U.distance(bullet, {x:nextX,y:nextY});
      var collisions = game.getTargetsInRange(bullet, llen + enemyRadius);
      for (var ci = 0; ci < collisions.length; ++ci) {
        var cd = U.pointToLineDistance(collisions[ci].pos, bullet, {x:nextX,y:nextY});
        if (cd < enemyRadius) {
          // collision
          collisions[ci].applyDamage(_this.damage / bulletsPerSecond);
          bullets[i] = null;
          return;
        }
      }

      // draw
      drawBullet(bullet);

      // update position
      bullet.x += nextX;
      bullet.y += nextY;
    }
  };

  if (data.type === "laser") {
    _this.drawBullets = function(ctx, dt){
      if (target) {
        target.applyDamage(_this.damage * (dt / 1000.0));
        drawBullet();
      }
    };
  }

  _this.drawRange = function(ctx){
    ctx.save();
    ctx.translate(pos.x, pos.y);

    ctx.fillStyle = R.towerRange;
    ctx.fill(towerRange);

    ctx.restore();
  };

  // remove from map
  _this.remove = function(){
    _this.removed = true;
    if (_this.onRemove) _this.onRemove();
  };

}
