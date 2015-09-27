function Game(data) {
  var game = this;

  // state
  var gameMap;
  var towers = {};
  var enemies = [];
  var enemyPath = null;

  var enemiesPerSecond = 2;
  var msToNextEnemy = 0;
  game.enemiesReleased = 0;

  game.wave = 0;
  game.lives = 10;
  game.cash = 100;

  game.started = false;
  game.ended = false;

  game.selectedTowerType = null;
  game.selectedTower = null;

  // listeners
  game.updateGUI = function(){};

  // waves
  game.waves = [
    {type:'enemy', count:5, health:5},
    {type:'enemy', count:20, health:6},
    {type:'enemy', count:20, health:10},
    {type:'enemy', count:10, health:15},
    {type:'enemy', count:10, health:20},
    {type:'enemy', count:20, health:22},
    {type:'enemy', count:20, health:25},
    {type:'enemy', count:10, health:35},
    {type:'enemy', count:10, health:38},
    {type:'enemy', count:20, health:40},
  ];

  // game map
  gameMap = game.map = new GameMap(window.testMapData);

  var mapOffsetX = gameMap.offsetX + Hex.width/2 + gameMap.mapX;
  var mapOffsetY = gameMap.offsetY + Hex.height/2 + gameMap.mapY;

  // enemy path
  var startCell = gameMap.getStartCells()[0];
  var endCell = gameMap.getEndCells()[0];
  enemyPath = gameMap.getPath(startCell, endCell);

  // load map towers
  gameMap.getTowers().forEach(function(towerCell){
    addTower(towerCell, towerCell.cell.tower);
  });

  // add test towers
  // addTower({q:15,r:6}, "standard");
  // addTower({q:17,r:6}, "rapid");
  // addTower({q:19,r:6}, "laser");

  // onClick
  game.click = function(x, y){
    var clickedHex = gameMap.getHexAt(x, y);
    var clickedCell = gameMap.getCell(clickedHex.q, clickedHex.r);
    game.selectedTower = null;

    if (clickedCell) {
      if (clickedCell.type === "tower") {
        var clickedTower = towers[Hex.toString(clickedHex)];
        if (clickedTower) {
          selectTower(clickedHex, clickedTower);
        }
      } else if (!clickedCell.type) {
        if (game.selectedTowerType) {
          var cost = Tower.types[game.selectedTowerType].cost;
          if (cost <= game.cash) {
            var tower = addTower(clickedHex, game.selectedTowerType);
            game.selectedTower = tower;
            game.cash -= cost;
            game.updateGUI();
          }
        }
      }
    }
  };

  // draw
  game.draw = function(ctx, dt){
    if (game.ended) return;

    // make next enemy
    if (game.started) {
      if (game.enemiesReleased < game.waves[game.wave].count) {
        if (msToNextEnemy <= 0) {
          game.addEnemy(game.waves[game.wave]);
          msToNextEnemy = 1000 / enemiesPerSecond;
          game.enemiesReleased += 1;
          if (game.enemiesReleased === game.waves[game.wave].count) {
            game.updateGUI();
          }
        } else {
          msToNextEnemy -= dt;
        }
      }
    }

    // draw map
    ctx.clearRect(0,0, App.width, App.height);
    gameMap.draw(ctx, dt);

    ctx.save();
    ctx.translate(mapOffsetX, mapOffsetY);

    // draw enemy path lines
    // if (enemyPath) {
    //   testEnemy.drawPath(ctx);
    // }

    // draw towers
    for (var k in towers) {
      if (towers[k]) {
        if (game.selectedTower === towers[k]) {
          towers[k].drawRange(ctx);
        }
        towers[k].draw(ctx, dt);
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
    App.showGameEndScreen(isWin);
  };

  // tower functions
  function addTower(hex, towerType){
    var cell = gameMap.getCell(hex.q, hex.r);
    cell.type = "tower";
    cell.tower = towerType;
    var tower = new Tower({
      game: game,
      type: cell.tower,
      hex: hex
    });
    towers[Hex.toString(hex)] = tower;
    return tower;
  }
  function selectTower(hex, tower){
    game.selectedTower = tower;
    game.updateGUI();
  }

  game.upgradeTower = function(tower){
    if (tower.upgradeCost() <= game.cash) {
      game.cash -= tower.upgradeCost();
      tower.level += 1;
      tower.updateParams();
      game.updateGUI();
    }
  };
  game.sellTower = function(tower){
    var cell = gameMap.getCell(tower.hex.q, tower.hex.r);
    cell.tower = null;
    cell.type = null;
    delete towers[Hex.toString(tower.hex)];
    game.selectedTower = null;

    game.cash += tower.sellValue();
    game.updateGUI();
  };

  // enemy functions
  game.addEnemy = function(data){
    var idx = enemies.length;
    var enemy = new Enemy({
      type: data.type,
      game: game,
      origin: startCell,
      path: enemyPath,
      health: data.health
    });
    enemy.onRemove = function(){
      game.removeEnemy(idx, enemy);
    };
    enemies[idx] = enemy;
  };
  game.removeEnemy = function(idx, enemy){
    if (enemy.killed) {
      game.cash += enemy.reward();
    } else {
      game.lives -= 1;
    }

    game.updateGUI();
    if (game.lives === 0) {
      game.end(false);
      return;
    }

    enemies[idx] = null;

    if (game.allEnemiesKilled()) {
      enemies = [];
      game.nextWave();
    }
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
