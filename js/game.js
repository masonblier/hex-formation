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

  game.selectedTowerType = "standard";
  game.selectedTower = null;

  // listeners
  game.updateGUI = function(){};

  // waves
  game.waves = [
    {type:'enemy', count:5, health:3},
    {type:'enemy', count:10, health:5},
    {type:'enemy', count:20, health:6},
    {type:'enemy', count:20, health:8},
    {type:'enemy', count:10, health:12},
    {type:'enemy', count:10, health:16},
    {type:'enemy', count:20, health:20},
    {type:'enemy', count:20, health:25},
    {type:'enemy', count:10, health:35},
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

  // add test towers
  // addTower({q:15,r:6}, "standard");
  // addTower({q:17,r:6}, "rapid");
  // addTower({q:19,r:6}, "laser");

  // onClick
  game.click = function(x, y){
    var clickedHex = gameMap.getHexAt(x, y);
    var clickedCell = gameMap.getCell(clickedHex.q, clickedHex.r);

    if (clickedCell) {
      game.selectedTower = null;

      var clickedTower = towers[Hex.toString(clickedHex)];
      if (clickedTower) {
        selectTower(clickedHex, clickedTower);
      } else if (!clickedCell.type) {
        if (game.selectedTowerType) {
          var cost = Tower.types[game.selectedTowerType].cost;
          if (cost <= game.cash) {
            var tower = addTower(clickedHex, game.selectedTowerType);
            game.selectedTower = tower;
            game.cash -= cost;
          }
        }
      }

      game.updateGUI();
    }
  };

  // draw map (static)
  game.drawMap = function(ctxa){
    ctxa.clearRect(0,0, App.width, App.height);
    gameMap.draw(ctxa, dt);
  };

  // draw active layer
  game.drawActive = function(ctxa, dt){
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

    // clear layer
    ctxa.clearRect(0,0, App.width, App.height);

    ctxa.save();
    ctxa.translate(mapOffsetX, mapOffsetY);

    // draw enemy path lines
    // if (enemyPath) {
    //   testEnemy.drawPath(ctxa);
    // }

    // draw towers
    for (var k in towers) {
      if (towers[k]) {
        if (game.selectedTower === towers[k]) {
          towers[k].drawRange(ctxa);
        }
        towers[k].draw(ctxa, dt);
      }
    }

    // draw enemies
    for (var i = 0; i < enemies.length; ++i) {
      if (enemies[i]) {
        enemies[i].draw(ctxa, dt);
      }
    }

    ctxa.restore();
  };

  // draw preview layer
  game.drawPreview = function(ctxp, dt){
    // clear layer
    ctxp.clearRect(0,0, App.width, App.height);

    var mouseHex = gameMap.getHexAt(App.mouseX, App.mouseY);
    var hc = Hex.getHexCenter(mouseHex.q, mouseHex.r);

    // draw mouseovered cell
    gameMap.drawCellHighlight(ctxp, hc);

    // draw selectedTowerType preview
    if (game.selectedTowerType && !towers[Hex.toString(mouseHex)]) {
      ctxp.save();
      ctxp.translate(hc.x + mapOffsetX - Hex.radius, hc.y + mapOffsetY - Hex.radius);
      ctxp.drawImage(R.towers[game.selectedTowerType], 0, 0);
      ctxp.restore();
    }
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
    var tower = new Tower({
      game: game,
      type: towerType,
      hex: hex
    });
    towers[Hex.toString(hex)] = tower;
    return tower;
  }
  function selectTower(hex, tower){
    game.selectedTower = tower;
    game.selectedTowerType = null;
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
