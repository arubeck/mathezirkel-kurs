function ChaosGame(xmax, ymax, numVertices, lambda) {
  this.trackLines  = false;
  this.lambda      = lambda;
  this.numVertices = numVertices;
  this.lastPos     = undefined;
  this.initPos     = undefined;
  this.stats       = undefined;

  this.xmax = xmax;
  this.ymax = ymax;

  this.backgroundColor = "lightblue";
  this.foregroundColor = "darkblue";
  this.hilightColor    = "black";
  this.vertexColors    = ["red", "green", "blue", "yellow", "magenta", "orange"];

  this.ptRadius        = 3;

  this.seed = Math.random();

  this.initVertices();
}

ChaosGame.prototype.initVertices = function () {
  this.vertices = [];
  this.stats    = [];

  var pad = 16;
  var xmax = this.xmax - pad;
  var ymax = this.ymax - pad;

  for(var i = 0; i < this.numVertices; i++) {
    this.vertices.push([
      pad/2 + xmax/2 + xmax/2 * Math.cos(Math.PI/2 + 2*Math.PI / this.numVertices * i),
      pad/2 + ymax/2 - ymax/2 * Math.sin(Math.PI/2 + 2*Math.PI / this.numVertices * i)
    ]);

    this.stats.push(0);
  }
}

ChaosGame.prototype.doReset = function (ctx) {
  for(var i = 0; i < this.numVertices; i++) this.stats[i] = 0;

  ctx.fillStyle   = this.backgroundColor;
  ctx.strokeStyle = this.foregroundColor;

  ctx.clearRect(0,0, this.xmax, this.ymax);

  ctx.beginPath();
  multiTo(ctx, this.vertices);
  ctx.fill();

  ctx.beginPath();
  multiTo(ctx, this.vertices);
  ctx.closePath();
  ctx.stroke();
};

ChaosGame.prototype.doStep = function (ctx, newVertex, colorIndex) {
  if(! this.lastPos) {
    if(this.initPos) Math.seedrandom(this.seed);
    this.lastPos = this.initPos ? this.initPos : randomConvexComb(this.vertices);
    drawDot(ctx, this.lastPos[0], this.lastPos[1], this.ptRadius, this.hilightColor);
  }

  var c = this.vertexColors[colorIndex];
  this.stats[colorIndex] = this.stats[colorIndex] + 1;

  var r = this.lastPos;
  var v = newVertex;
  var q = [ (1-this.lambda)*r[0] + this.lambda*v[0], (1-this.lambda)*r[1] + this.lambda*v[1] ];
  drawDot(ctx, q[0], q[1], this.ptRadius, c);

  if(this.trackLines) {
    ctx.beginPath();
    ctx.moveTo(r[0], r[1]);
    ctx.lineTo(q[0], q[1]);
    ctx.lineWidth = 0.3;
    ctx.stroke();
    ctx.lineWidth = 4;
  }

  this.lastPos = q;
};

ChaosGame.prototype.doFullGame = function (ctx, numIter) {
  this.lastPos = this.initPos ? this.initPos : randomConvexComb(this.vertices);

  if(this.initPos) Math.seedrandom(this.seed);

  drawDot(ctx, this.lastPos[0], this.lastPos[1], this.ptRadius, this.hilightColor);

  for(var i = 0; i < numIter - 1; i++) {
    var j = Math.floor(Math.random() * this.vertices.length);
    var p = this.vertices[j];

    this.doStep(ctx, p, j);
  }
};

function multiTo(ctx, points) {
  if(points.length == 0) return;
  ctx.moveTo(points[0][0], points[0][1]);
  for(var i = 1; i < points.length; i++) {
    ctx.lineTo(points[i][0], points[i][1]);
  }
}

function randomConvexComb(points) {
  var x = 0, y = 0;
  var sum = 0;
  for(var i = 0; i < points.length; i++) {
    var lambda = Math.random();
    x   = x + lambda * points[i][0];
    y   = y + lambda * points[i][1];
    sum = sum + lambda;
  }
  return [x / sum, y / sum];
}

function drawDot(ctx, x,y, radius, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2*Math.PI, true);
  ctx.fill();
}
