function Menu(options){

  var $el = options.$el;
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
    // <div id="current_tower">
    //   <div class="tower_type">Test Tower</div>
    //   <div class="tower_level">Level: 1</div>
    //   <div class="tower_dps">Damage: 2</div>
    //   <button class="tower_upgrade control_button">Upgrade</button>
    //   <button class="tower_sell control_button">Sell</button>
    // </div>

  // controls
  var $controls = U.createElement('div', 'controls');
  var $nextWaveBtn = U.createElement('button', 'next_wave', 'control_button', 'Next Wave');
  var $pauseResumeBtn = U.createElement('button', 'pause_resume', 'control_button', 'Pause');
  var $endGameBtn = U.createElement('button', 'end_game', 'control_button', 'End Game');
  $controls.appendChild($nextWaveBtn);
  $controls.appendChild($pauseResumeBtn);
  $controls.appendChild($endGameBtn);
  $el.appendChild($controls);

  $nextWaveBtn.addEventListener('click', function(e){
    game.nextWave();
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

  // update gui
  function updateGUI() {
    $currentWave.innerHTML = "Wave: "+(game.wave+1)+" / "+game.waves.length;
    $lives.innerHTML = "Lives: "+game.lives;
    $cash.innerHTML = "Cash: "+game.cash;

    if (game.ended || (game.enemiesReleased < game.waves[game.wave].count)) {
      $nextWaveBtn.setAttribute('disabled', 'disabled');
    } else {
      $nextWaveBtn.removeAttribute('disabled');
    }
  }
  game.updateGUI = updateGUI;
  game.updateGUI();
}
