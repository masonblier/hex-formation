var App = window.App = {};

var canvas, ctx;
var game, menu;

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

  // canvas
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');
  App.width = canvas.width;
  App.height = canvas.height;

  // scaling
  scaleX = App.width / 640;
  scaleY = App.height / 480;
  ctx.scale(scaleX, scaleY);

  // prepare resources
  R.makePatterns(ctx);
  R.makeTowers(ctx);

  // events
  canvas.addEventListener('mousemove', function(e){
    App.mouseX = e.offsetX / scaleX;
    App.mouseY = e.offsetY / scaleY;
  }, false);

  canvas.addEventListener('click', function(e){
    App.click(e.offsetX / scaleX, e.offsetY / scaleY);
  });

  canvas.addEventListener('mouseout', function(e){
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
  }, 0);
};

App.showGameMenu = function(){
  $overlay.innerHTML = '';
  $overlay.style['background'] = "#080808";
  $overlay.style['display'] = null;

  var $startBtn = U.createElement('button', 'start_button', null, "Start Game");
  $overlay.appendChild($startBtn);

  $startBtn.addEventListener('click', function(e){
    App.newGame();
    $overlay.style['display'] = 'none';
    $overlay.style['background'] = null;
  });
};

App.newGame = function(){
  // game instance
  game = new Game({});

  // menu gui
  menu = new Menu({
    '$el': document.getElementById('menu'),
    '$display': $displayOverlay,
    game: game
  });

  // clear canvas
  ctx.clearRect(0,0, App.width, App.height);

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

  // show confirmation
  $overlay.innerHTML = '';
  $overlay.style['display'] = null;

  var $gameEndScreen = U.createElement('div', 'game_ended_screen', 'overlay_modal',
    (isWin ? 'Game completed. You have won.' : 'Game over. You have lost.')+'<br />');
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

App.click = function(x, y){
  if (game) {
    game.click(x, y);
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

  game.draw(ctx, dt);

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
