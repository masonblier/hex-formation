function Menu(options){

  var $el = options.$el;
  var $display = options.$display;
  var game = options.game;

  $el.innerHTML = '';

  // stats
  var $currentWave = U.createElement('div', 'current_wave');
  $el.appendChild($currentWave);
  var $lives = U.createElement('div', 'lives');
  $el.appendChild($lives);
  var $cash = U.createElement('div', 'cash');
  $el.appendChild($cash);

  // tower select
  var $towers = U.createElement('div', 'towers');
  $el.appendChild($towers);
  Object.keys(Tower.types).forEach(function(type){
    var params = Tower.types[type];

    var $t = U.createElement('div', null, 'tower',
      '<div class="tower_icon"></div>'+
      '<div class="tower_type">'+params.name+'</div>'+
      '<div class="tower_cost">Cost: '+params.cost+'</div>'+
      '<div class="tower_range">Range: '+params.initial_range+'</div>'+
      '<div class="tower_dps">DPS: '+params.initial_dps+'</div>');
    $t.children[0].appendChild(R.towers[type]);
    $towers.appendChild($t);

    $t.addEventListener('click', function(e){
      Array.prototype.forEach.call($towers.children, function($to){
        $to.setAttribute("class", "tower");
      });
      $t.setAttribute("class", "tower selected");
      game.selectedTowerType = type;
    });
  });

  // current tower
  var $currentTower = U.createElement('div', 'current_tower');
  $el.appendChild($currentTower);

  // controls
  var $controls = U.createElement('div', 'controls');
  var $nextWaveBtn = U.createElement('button', 'next_wave', 'control_button', 'Start Game');
  var $pauseResumeBtn = U.createElement('button', 'pause_resume', 'control_button', 'Pause');
  var $endGameBtn = U.createElement('button', 'end_game', 'control_button', 'End Game');
  $controls.appendChild($nextWaveBtn);
  $controls.appendChild($pauseResumeBtn);
  $controls.appendChild($endGameBtn);
  $el.appendChild($controls);

  $nextWaveBtn.addEventListener('click', function(e){
    if (!game.started) {
      game.started = true;
      $nextWaveBtn.innerHTML = "Next Wave";
      updateGUI();
    } else {
      game.nextWave();
    }
  });

  $pauseResumeBtn.addEventListener('click', function(e){
    if ($pauseResumeBtn.innerHTML === "Pause") {
      App.pause();
      $pauseResumeBtn.innerHTML = "Resume";
    } else {
      App.resume();
      $pauseResumeBtn.innerHTML = "Pause";
    }
  });

  $endGameBtn.addEventListener('click', function(e){
    App.endGame();
  });

  // overlayed display
  $display.innerHTML = '';

  // update gui
  var currentTower = null;
  function updateGUI() {
    // game info
    $currentWave.innerHTML = "Wave: "+
      (!game.ended ? game.wave+1 : game.waves.length)+
      " / "+game.waves.length;
    $lives.innerHTML = "Lives: "+game.lives;
    $cash.innerHTML = "Cash: "+game.cash;

    // button states
    if (game.started) {
      var currentWave = game.waves[game.wave];
      if (game.ended || (game.enemiesReleased < currentWave.count)) {
        $nextWaveBtn.setAttribute('disabled', 'disabled');
      } else {
        $nextWaveBtn.removeAttribute('disabled');
      }
    }

    // current wave info display
    if (currentWave) {
      $display.innerHTML = 'Enemy Health: '+currentWave.health;
    }

    // current/selected tower display
    if (game.selectedTower !== currentTower) {
      currentTower = game.selectedTower;

      if (currentTower) {
        // render current tower display
        $currentTower.innerHTML =
          '<div id="current_tower_header">Selected Tower:</div>'+
          '<div class="tower_icon"></div>'+
          '<div class="tower_type">Test Tower</div>'+
          '<div class="tower_level">Level: '+U.trimNumber(currentTower.level, 0)+'</div>'+
          '<div class="tower_dps">DPS: '+U.trimNumber(currentTower.damage, 1)+'</div>'+
          '<div class="tower_upgrade">Upgrade: '+U.trimNumber(currentTower.upgradeCost(), 1)+'</div>'+
          '<div class="tower_sell">Sell: '+U.trimNumber(currentTower.sellValue(), 1)+'</div>';
        $currentTower.children[1].appendChild(
          U.cloneCanvas(R.towers[currentTower.type]));

        var $btnGroup = U.createElement('div', 'tower_control_buttons');
        var $upgradeBtn = U.createElement('button', null, 'tower_upgrade_btn control_button', 'Upgrade');
        var $sellBtn = U.createElement('button', null, 'tower_sell_btn control_button', 'Sell');

        $upgradeBtn.addEventListener('click', function(e){
          currentTower = null;
          game.upgradeTower(game.selectedTower);
        });

        $sellBtn.addEventListener('click', function(e){
          game.sellTower(game.selectedTower);
        });

        $btnGroup.appendChild($upgradeBtn);
        $btnGroup.appendChild($sellBtn);
        $currentTower.appendChild($btnGroup);

      } else {
        // hide current tower display
        $currentTower.innerHTML = '';
      }
    }
  }
  game.updateGUI = updateGUI;
  game.updateGUI();
}
