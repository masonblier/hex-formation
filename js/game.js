function Game(data) {
  var game = this;

  // state
  var gameMap;
  var towers = [];
  var enemies = [];
  var enemyPath = null;

  var enemiesPerSecond = 2;
  var msToNextEnemy = 0;
  game.enemiesReleased = 0;

  game.wave = 0;
  game.lives = 20;
  game.cash = 100;

  game.ended = false;

  // listeners
  game.updateGUI = function(){};

  // waves
  game.waves = [
    {type:'enemy', count:5},
    {type:'enemy', count:20},
    {type:'enemy', count:20},
  ];

  // game map
  gameMap = new GameMap(window.testMapData);

  var mapOffsetX = gameMap.offsetX + Hex.width/2 + gameMap.mapX;
  var mapOffsetY = gameMap.offsetY + Hex.height/2 + gameMap.mapY;

  // enemy path
  var startCell = gameMap.getStartCells()[0];
  var endCell = gameMap.getEndCells()[0];
  enemyPath = gameMap.getPath(startCell, endCell);

  // console.log(enemyPath);
  function makeEnemy(){
    var idx = enemies.length;
    var enemy = new Enemy({
      game: game,
      origin: startCell,
      path: enemyPath
    });
    enemy.onRemove = function(){
      if (!enemy.killed) {
        game.lives -= 1;
        game.updateGUI();
        if (game.lives === 0) {
          game.end(false);
          return;
        }
      }
      enemies[idx] = null;

      if (game.allEnemiesKilled()) {
        enemies = [];
        game.nextWave();
      }
    };
    enemies[idx] = enemy;
  }

  // test tower
  gameMap.getTowers().forEach(function(towerCell){
    towers.push(new Tower({
      game: game,
      type: towerCell.cell.tower,
      position: Hex.getHexCenter(towerCell.q, towerCell.r)
    }));
  });

  // onClick
  game.click = function(x, y){
    gameMap.click(x, y);
  };

  // draw
  game.draw = function(ctx, dt){
    if (game.ended) return;

    // make next enemy
    if (game.enemiesReleased < game.waves[game.wave].count) {
      if (msToNextEnemy <= 0) {
        makeEnemy();
        msToNextEnemy = 1000 / enemiesPerSecond;
        game.enemiesReleased += 1;
        if (game.enemiesReleased === game.waves[game.wave].count) {
          game.updateGUI();
        }
      } else {
        msToNextEnemy -= dt;
      }
    }

    // draw map
    ctx.clearRect(0,0, App.width, App.height);
    gameMap.draw(ctx, dt);

    ctx.save();
    ctx.translate(mapOffsetX, mapOffsetY);

    // draw enemy path lines
    if (enemyPath) {
      // testEnemy.drawPath(ctx);
    }

    // draw towers
    for (var i = 0; i < towers.length; ++i) {
      if (towers[i]) {
        towers[i].drawRange(ctx);
        towers[i].draw(ctx, dt);
      }
    }

    // draw enemies
    for (var i = 0; i < enemies.length; ++i) {
      if (enemies[i]) {
        enemies[i].draw(ctx, dt);
      }
    }

    ctx.restore();
  };

  // next wave start
  game.nextWave = function(){
    game.enemiesReleased = 0;
    game.wave += 1;

    if (game.wave === game.waves.length) {
      game.end(true);
    }
    game.updateGUI();
  };

  // game end
  game.end = function(isWin){
    game.ended = true;
    App.pause();

    console.log('game '+(isWin ? 'won' : 'lost'))
    // TODO
  };

  // data functions
  game.getTargetsInRange = function(pos, radius){
    var targets = [];
    for (var i = 0; i < enemies.length; ++i) {
      if (enemies[i]) {
        if (U.distance(pos, enemies[i].pos) < radius) {
          targets.push(enemies[i]);
        }
      }
    }
    return targets;
  };

  game.getMapRange = function(){
    return {
      x1: 0 - mapOffsetX,
      y1: 0 - mapOffsetY,
      x2: App.width - mapOffsetX,
      y2: App.height - mapOffsetY
    };
  };

  game.allEnemiesKilled = function(){
    for (var i = 0; i < enemies.length; ++i) {
      if (enemies[i]) return false;
    }
    return true;
  };
}
