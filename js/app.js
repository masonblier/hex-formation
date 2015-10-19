var App = window.App = {};

var top_canvas;
var ctxm, ctxa, ctxp;
var game, menu;
var editMap;

var $overlay, $display, $fps;
var $displayOverlay;

App.width;
App.height;

var scaleX, scaleY;

App.mouseX = -1;
App.mouseY = -1;

App.paused = true;

App.start = function(){
  // loading screen
  $overlay = document.getElementById('overlay');
  $overlay.style['background'] = "#080808";
  $overlay.innerHTML = 'Loading...';
  $overlay.style['display'] = null;

  // canvases
  var map_canvas = document.getElementById('map_canvas');
  ctxm = map_canvas.getContext('2d');
  var active_canvas = document.getElementById('active_canvas');
  ctxa = active_canvas.getContext('2d');
  top_canvas = document.getElementById('preview_canvas');
  ctxp = top_canvas.getContext('2d');

  App.width = top_canvas.width;
  App.height = top_canvas.height;

  // scaling
  scaleX = App.width / 640;
  scaleY = App.height / 480;
  ctxm.scale(scaleX, scaleY);
  ctxa.scale(scaleX, scaleY);
  ctxp.scale(scaleX, scaleY);

  // prepare resources
  R.makePatterns(ctxm);
  R.makeTowers();
  R.makeMapPreviews();

  // events
  top_canvas.addEventListener('mousemove', function(e){
    App.mouseX = (e.offsetX || e.layerX) / scaleX;
    App.mouseY = (e.offsetY || e.layerY) / scaleY;
  }, false);

  top_canvas.addEventListener('click', function(e){
    App.click(
      (e.offsetX || e.layerX) / scaleX,
      (e.offsetY || e.layerY) / scaleY
    );
  });

  top_canvas.addEventListener('mouseout', function(e){
    App.mouseX = -1;
    App.mouseY = -1;
  });

  // display
  $display = document.getElementById('display');
  $fps = U.createElement('div', 'fps', null, "fps:");
  $display.appendChild($fps);
  $displayOverlay = U.createElement('div', 'display_overlay');
  $display.appendChild($displayOverlay);

  // show menu
  setTimeout(function(){
    App.showGameMenu();
    // App.showEditMap();
  }, 0);
};

App.showGameMenu = function(){
  $overlay.innerHTML = '';
  $overlay.style['background'] = "#080808";
  $overlay.style['display'] = null;
  $overlay.appendChild(U.createElement('h1', 'map_select_title', null, 'Select Map'));

  ['alternating', 'zig-zag', 'loopback'].forEach(function(mapName){
    var $mapBtn = U.createElement('button', null, 'map_button', '<div class="map_name">'+mapName+'</div>');
    $mapBtn.appendChild(R.mapPreviews[mapName]);

    var mapHighScore = localStorage && localStorage['highscore_'+mapName];
    var $highScore = U.createElement('div', null, 'high_score', (mapHighScore ? 'score: '+mapHighScore : '&nbsp;'));
    $mapBtn.appendChild($highScore);

    $overlay.appendChild($mapBtn);

    $mapBtn.addEventListener('click', function(e){
      App.newGame(mapName);
      $overlay.style['display'] = 'none';
      $overlay.style['background'] = null;
    });
  });
};

App.newGame = function(mapName){
  // game instance
  game = new Game({
    map: mapName
  });

  // menu gui
  menu = new Menu({
    '$el': document.getElementById('menu'),
    '$display': $displayOverlay,
    game: game
  });

  // clear canvases
  ctxm.clearRect(0,0, App.width, App.height);
  ctxa.clearRect(0,0, App.width, App.height);
  ctxp.clearRect(0,0, App.width, App.height);

  // draw map
  game.drawMap(ctxm);

  // start loop
  App.resume();
};

App.endGame = function(){
  var appWasInPausedState = !!App.paused;
  App.pause();

  // show confirmation
  $overlay.innerHTML = '';
  $overlay.style['display'] = null;

  var $endGameConfirm = U.createElement('div', 'end_game_confirm', 'overlay_modal',
    'Are you sure you want to end this game?<br />');
  $overlay.appendChild($endGameConfirm);

  var $endGameBtn = U.createElement('button', 'end_game_button', null, "End Game");
  $endGameConfirm.appendChild($endGameBtn);

  var $cancelBtn = U.createElement('button', 'end_game_cancel_button', null, "Cancel");
  $endGameConfirm.appendChild($cancelBtn);

  $endGameBtn.addEventListener('click', function(e){
    if (game) {
      game = null;
    }
    App.showGameMenu();
  });

  $cancelBtn.addEventListener('click', function(e){
    $overlay.style['display'] = 'none';
    if (!appWasInPausedState) {
      App.resume();
    }
  });
};

App.showGameEndScreen = function(isWin){
  App.pause();

  if (isWin) {
    var finalScore = game.getScore();
    if (localStorage) {
      var oldScore = parseInt(localStorage['highscore_'+game.mapName], 10);
      if (!oldScore || finalScore > oldScore) {
        localStorage['highscore_'+game.mapName] = finalScore;
      }
    }
  }

  $overlay.innerHTML = '';
  $overlay.style['display'] = null;

  var $gameEndScreen = U.createElement('div', 'game_ended_screen', 'overlay_modal',
    (isWin ? 'Game completed. You have won. Score: '+finalScore : 'Game over. You have lost.')+'<br />');
  $overlay.appendChild($gameEndScreen);

  var $returnBtn = U.createElement('button', 'game_ended_button', null, "Return");
  $gameEndScreen.appendChild($returnBtn);

  $returnBtn.addEventListener('click', function(e){
    if (game) {
      game = null;
    }
    App.showGameMenu();
  });
};

App.showEditMap = function(){
  $overlay.innerHTML = '';
  $overlay.style['display'] = 'none';
  $overlay.style['background'] = null;

  // game instance
  editMap = new GameMap(maps.blank);

  // menu gui
  // menu = new Menu({
  //   '$el': document.getElementById('menu'),
  //   '$display': $displayOverlay,
  //   game: game
  // });

  // draw map
  ctxm.clearRect(0,0, App.width, App.height);
  editMap.draw(ctxm);
};

App.click = function(x, y){
  if (game) {
    game.click(x, y);
  } else if (editMap) {
    // map edit mode
    editMap.editClick(x, y);
    editMap.draw(ctxm);
  }
};

var lastAnimTime = 0;
var frameCount = 0;
var dt = 0;
App.draw = function(animTime){
  if (lastAnimTime === 0) {
    lastAnimTime = animTime;
    requestAnimationFrame(App.draw);
    return;
  }

  dt = animTime - lastAnimTime;

  ++frameCount;
  if (frameCount % 15 === 0) {
    $fps.innerHTML = "fps: "+(Math.round(1000 / dt))
  }
  lastAnimTime = animTime;

  game.update(dt);
  game.drawActive(ctxa);
  game.drawPreview(ctxp);

  if (!App.paused) {
    requestAnimationFrame(App.draw);
  }
};

App.resetAnimTimes = function(){
  lastAnimTime = 0;
};

App.pause = function(){
  App.paused = true;
  App.resetAnimTimes();
};
App.resume = function(){
  App.paused = false;
  App.resetAnimTimes();
  requestAnimationFrame(App.draw);
};

document.onreadystatechange = function () {
  if (document.readyState == "complete") {
    App.start();
  }
}
