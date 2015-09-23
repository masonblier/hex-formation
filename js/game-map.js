function GameMap(data) {
  this.data = data;

  var gridWidth = data.width;
  var gridHeight = data.height;

  var mapX = this.mapX = 16;
  var mapY = this.mapY = 20;

  var hexr = Hex.radius;
  var xw = Hex.width;
  var xh = Hex.height;
  var offsetX = this.offsetX = -(xw * gridHeight);
  var offsetY = this.offsetY = 0;

  var mouseHex = {x: 0, y: 0};

  // draw entry

  this.draw = function(ctx) {
    ctx.save();
    ctx.translate(mapX, mapY);

    ctx.strokeStyle = R.cellBorder;
    ctx.fillStyle = R.cellBg;

    mouseHex = Hex.pixelToHex(App.mouseX - mapX - offsetX,
                              App.mouseY - mapY - offsetY + hexr/4);

    forEachCell(function(q, r, p){
      drawCell(ctx, q, r, p);
    });
    ctx.restore();
  };

  // onclick listener

  this.click = function(x, y){
    var clickHex = Hex.pixelToHex(x - mapX - offsetX,
                                  y - mapY - offsetY + hexr/4);
    console.log(clickHex.q, clickHex.r)
    setCell(clickHex.q, clickHex.r, {});
  };

  // hex drawing

  var hexPath = new Path2D();
  hexPath.moveTo(xw/2, 0);
  hexPath.lineTo(xw, xh/4);
  hexPath.lineTo(xw, 3*xh/4);
  hexPath.lineTo(xw/2, xh);
  hexPath.lineTo(0, 3*xh/4);
  hexPath.lineTo(0, xh/4);
  hexPath.lineTo(xw/2, 0);

  var borderL = new Path2D();
  borderL.moveTo(0, 3*xh/4);
  borderL.lineTo(0, xh/4);

  var borderTL = new Path2D();
  borderTL.moveTo(0, xh/4);
  borderTL.lineTo(xw/2, 0);

  var borderTR = new Path2D();
  borderTR.moveTo(xw/2, 0);
  borderTR.lineTo(xw, xh/4);

  var borderR = new Path2D();
  borderR.moveTo(xw, xh/4);
  borderR.lineTo(xw, 3*xh/4);

  var borderBR = new Path2D();
  borderBR.moveTo(xw, 3*xh/4);
  borderBR.lineTo(xw/2, xh);

  var borderBL = new Path2D();
  borderBL.moveTo(xw/2, xh);
  borderBL.lineTo(0, 3*xh/4);

  var hexOutsetRect = new Path2D();
  hexOutsetRect.rect(0, 0, xw, xh);

  function drawCell(ctx, q, r, p){
    ctx.save();
    ctx.translate(p.x, p.y);

    cell = getCell(q, r);
    drawCellStyle(ctx, cell, p)

    if (mouseHex.q === q && mouseHex.r === r) {
      ctx.fillStyle = R.cellHover;
      ctx.fill(hexPath);
    }

    if (cell && (cell.type==="path" || cell.type==="start" || cell.type==="end")) {
      var neighbors = getNeighbors(q, r);
      if (!neighbors.l) ctx.stroke(borderL);
      if (!neighbors.tl) ctx.stroke(borderTL);
      if (!neighbors.tr) ctx.stroke(borderTR);
      if (!neighbors.r) ctx.stroke(borderR);
      if (!neighbors.br) ctx.stroke(borderBR);
      if (!neighbors.bl) ctx.stroke(borderBL);
    } else {
      ctx.stroke(hexPath);
    }

    ctx.restore();
  }

  function drawCellStyle(ctx, cell, p){
    if (!cell) {
      ctx.save();
      ctx.fillStyle = R.crossPattern;
      ctx.fill(hexPath);
      ctx.restore();
    } else if (cell.type === "start") {
      ctx.save();
      ctx.fillStyle = R.cellPathBg;
      ctx.fill(hexPath);
      ctx.translate(0.25 * xw, 0.25 * xh)
      ctx.scale(0.5, 0.5);
      ctx.fillStyle = R.cellStart;
      ctx.fill(hexPath);
      ctx.restore();
    } else if (cell.type === "end") {
      ctx.save();
      ctx.fillStyle = R.cellPathBg;
      ctx.fill(hexPath);
      ctx.translate(0.25 * xw, 0.25 * xh)
      ctx.scale(0.5, 0.5);
      ctx.fillStyle = R.cellEnd;
      ctx.fill(hexPath);
      ctx.restore();
    } else if (cell.type === "path") {
      ctx.save();
      ctx.fillStyle = R.cellPathBg;
      ctx.fill(hexPath);
      ctx.restore();
    } else {
      ctx.fill(hexPath);
    }
  }

  // path finding
  this.getStartCells = function(){
    var matches = [];
    for (var q = 0; q < data.cells.length; ++q) {
      if (data.cells[q]) {
        for (var r = 0; r < data.cells[q].length; ++r) {
          if (data.cells[q][r] && data.cells[q][r].type === "start") {
            matches.push({q:q,r:r,cell:data.cells[q][r]});
          }
        }
      }
    }
    return matches;
  };
  this.getEndCells = function(){
    var matches = [];
    for (var q = 0; q < data.cells.length; ++q) {
      if (data.cells[q]) {
        for (var r = 0; r < data.cells[q].length; ++r) {
          if (data.cells[q][r] && data.cells[q][r].type === "end") {
            matches.push({q:q,r:r,cell:data.cells[q][r]});
          }
        }
      }
    }
    return matches;
  };
  this.getPath = function(startCell, endCell){
    var start = str(startCell);
    var goal = str(endCell);

    var pq = [];
    pqPut(pq, 0, start);

    var came_from = {}
    var cost_so_far = {}
    cost_so_far[str(startCell)] = 0
    var solved = false;

    while (!pqEmpty(pq)) {
      var current = pqNext(pq);

       if (current === goal) {
         solved = true;
         break;
       }

      var neighbors = getNeighborsStr(current);
      for (var dir in neighbors) {
        var next = neighbors[dir];
        var new_cost = cost_so_far[current] + (hexr * 2);
        if (!cost_so_far[next] || new_cost < cost_so_far[next]) {
          cost_so_far[next] = new_cost;
          priority = new_cost + distanceFromGoal(next);
          pqPut(pq, priority, next);
          came_from[next] = current;
        }
      }
    }

    if (!solved) return null;

    current = goal;
    var path = [current]
    while (current !== start) {
      current = came_from[current];
      path.unshift(current);
    }
    return path.map(strP);

    function str(cell){
      return cell.q+","+cell.r;
    }
    function strP(cellStr){
      var splt = cellStr.split(',');
      return {
        q: parseInt(splt[0], 10),
        r: parseInt(splt[1], 10)
      };
    }
    function pqPut(pq, priority, cell){
      var idx;
      for (idx = 0; idx < pq.length; ++idx) {
        if (pq[idx].priority > priority) break;
      }
      pq.splice(idx, 0, {priority:priority, cell:cell});
    }
    function pqEmpty(pq){
      return pq.length===0;
    }
    function pqNext(pq){
      return pq.shift().cell;
    }
    function getNeighborsStr(cellStr) {
      var cc = strP(cellStr);
      var neighbors = getNeighbors(cc.q, cc.r);
      var result = {};
      for (var k in neighbors) {
        if (neighbors[k]) {
          if (neighbors[k].cell.type==="path" || neighbors[k].cell.type==="end") {
            result[k] = str(neighbors[k]);
          }
        }
      }
      return result;
    }
    function distanceFromGoal(next) {
      var ncc = strP(next);
      var nc = Hex.getHexCenter(ncc.q, ncc.r);
      var gc = Hex.getHexCenter(endCell.q, endCell.r);
      return Math.abs(nc.x - gc.x) + Math.abs(nc.y + gc.y);
              // offset not necessary due to cancelling
    }
  };

  // data utilities

  this.getTowers = function(){
    var towers = [];
    forEachCell(function(q, r){
      var cell = getCell(q, r);
      if (cell && cell.type === 'tower') {
        towers.push({q:q, r:r, cell:cell});
      }
    });
    return towers;
  };

  function getCell(q, r) {
    return data.cells[q] && data.cells[q][r];
  }
  function setCell(q, r, value) {
    if (!data.cells[q]) {
      data.cells[q] = [];
    }
    data.cells[q][r] = value;
  }

  function getNeighbors(cq, cr) {
    var l = getCell(cq-1, cr);
    var tl = getCell(cq, cr-1);
    var tr = getCell(cq+1, cr-1);
    var r = getCell(cq+1, cr);
    var br = getCell(cq, cr+1);
    var bl = getCell(cq-1, cr+1);
    return {
      l: (l ? {q:cq-1, r:cr, cell:l} : null),
      tl: (tl ? {q:cq, r:cr-1, cell:tl} : null),
      tr: (tr ? {q:cq+1, r:cr-1, cell:tr} : null),
      r: (r ? {q:cq+1, r:cr, cell:r} : null),
      br: (br ? {q:cq, r:cr+1, cell:br} : null),
      bl: (bl ? {q:cq-1, r:cr+1, cell:bl} : null)
    };
  }

  function forEachCell(iter){
    var maxX = xw * (gridWidth - 1);
    var maxY = xh * gridHeight;
    for (var q = 0; q <= gridWidth+gridHeight; ++q) {
      for (var r = 0; r < gridHeight; ++r) {
        var p = Hex.getHexCenter(q, r);
        p.x += offsetX;
        p.y += offsetY;
        if (p.x >= 0 && p.y >= 0 &&
            p.x <= maxX && p.y <= maxY) {
          iter(q, r, p);
        }
      }
    }
  }
}
