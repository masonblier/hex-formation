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

  var type = this.type = data.type;
  var hex = this.hex = data.hex;
  var pos = this.pos = Hex.getHexCenter(hex.q, hex.r);

  if (!Tower.types[type])
    throw new Error("unknown tower type: "+type);

  var params = Tower.types[type];
  var towerCanvas = R.towers[type];

  // parameters
  var bulletSpeed = 0.5;
  var bulletsPerSecond = params.rate;

  // state
  var rotAngle = 0;
  var bullets = [];
  var msToBullet = 0;
  var target = null;

  _this.level = 0;
  _this.multiplier = 0;
  _this.range = null;
  _this.damage = null;

  _this.updateParams = function(){
    _this.multiplier = (1 + params.multiplier * _this.level);
    _this.range = Hex.radius * (params.initial_range + (_this.multiplier / 3));
    _this.damage = params.initial_dps * _this.multiplier * 1.5;
  };
  _this.updateParams();

  // upgrade/sell amounts
  _this.upgradeCost = function(){
    return (10 *
      Math.floor(Tower.types[type].cost * _this.multiplier / 20));
  };
  _this.sellValue = function(){
    return (10 *
      Math.floor(0.7 * (Tower.types[type].cost + _this.upgradeCost()) / 10));
  };

  // remove from map
  _this.remove = function(){
    _this.removed = true;
    if (_this.onRemove) _this.onRemove();
  };

  // method overrides
  var makeBullet, drawBullet, toggleSide = -1;
  if (type === 'rapid') {
    makeBullet = function(){
      toggleSide = -toggleSide;
      return {
        x: pos.x,// + (Math.cos(rotAngle + toggleSide*0.1) * 18),
        y: pos.y,// + (Math.sin(rotAngle + toggleSide*0.1) * 18),
        angle: rotAngle
      };
    };
    drawBullet = function(ctx, bullet){
      ctx.save();
      ctx.fillStyle = R.towerGreen;
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, 2, 0, 2*Math.PI);
      ctx.fill();
      ctx.restore();
    };

  } else if (type === 'laser') {
    makeBullet = function(){
      return {
        x: pos.x,
        y: pos.y
      };
    };
    drawBullet = function(ctx, bullet){
      if (target) {
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
      }
    };

  } else {
    makeBullet = function(){
      return {
        x: pos.x,// + (Math.cos(rotAngle) * 18),
        y: pos.y,// + (Math.sin(rotAngle) * 18),
        angle: rotAngle
      };
    };
    drawBullet = function(ctx, bullet){
      ctx.save();
      ctx.fillStyle = R.towerBulletYellow;
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, 3, 0, 2*Math.PI);
      ctx.fill();
      ctx.restore();
    };
  }

  // update
  _this.update = function(dt){
    // check if target is removed or out of range
    if (target && (target.removed || U.distance(pos, target.pos) > _this.range)) {
      target = null;
    }

    // check for new target
    if (!target) {
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

    // update active bullets
    _this.updateBullets(dt);
  };

  // update bullets
  _this.updateBullets = function(dt){
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

      // calculate next position
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

      // update position
      bullet.x += nextX;
      bullet.y += nextY;
    }
  };

  // override update for laser type towers
  if (type === "laser") {
    _this.updateBullets = function(dt){
      if (target) {
        target.applyDamage(_this.damage * (dt / 1000.0));
      }
    };
  }

  // draw
  _this.draw = function(ctx){
    if (_this.removed) return;

    // draw
    if (_this.isSelected) {
      _this.drawRange();
    }

    ctx.save();
    ctx.translate(pos.x, pos.y);

    // draw level dots
    drawLevelDots(ctx);

    // draw tower image
    ctx.save();
    ctx.rotate(rotAngle);
    ctx.translate(-Hex.radius, -Hex.radius);
    ctx.drawImage(towerCanvas, 0, 0);
    ctx.restore();

    ctx.restore();

    _this.drawBullets(ctx);
  };

  _this.drawBullets = function(ctx){
    for (var i = 0; i < bullets.length; ++i) {
      if (!bullets[i]) continue;
      var bullet = bullets[i];

      // draw
      drawBullet(ctx, bullet);
    }
  };

  _this.drawRange = function(ctx){
    ctx.save();
    ctx.translate(pos.x, pos.y);

    var rangePath = new Path2D();
    rangePath.arc(0, 0, _this.range, 0, 2*Math.PI);

    ctx.fillStyle = R.towerRange;
    ctx.fill(rangePath);

    ctx.restore();
  };

  function drawLevelDots(ctx){
    // 0 - 4
    for (var hci = 0; (hci < _this.level && hci < 4); hci++) {
      drawLevelDot(ctx, { x: -Hex.radius + 8, y: -8 + hci*5 });
    }

    // 5 - 8
    for (var hci = 4; (hci < _this.level && hci < 8); hci++) {
      drawLevelDot(ctx, { x: Hex.radius - 8, y: -8 + (hci - 4)*5 });
    }

    // 9, 10
    if (_this.level >= 9) {
      drawLevelDot(ctx, { x: 0, y: -Hex.radius + 6 });
    }
    if (_this.level >= 10) {
      drawLevelDot(ctx, { x: 0, y: Hex.radius - 6 });
    }
  }
  function drawLevelDot(ctx, corner){
    ctx.fillStyle = R.cellBorder;
    ctx.beginPath();
    ctx.arc(corner.x, corner.y, 2, 0, 2*Math.PI);
    ctx.closePath();
    ctx.fill();
  }
}
