var canvas = document.getElementById("canvas");

var context = canvas.getContext("2d");

var x = canvas.width / 2;
var y = canvas.height / 2;
var radius = 15;
var score = 0;

var mouseX = x;
var mouseY = y;
var velocity = 2;

var foodPositions = [[30, 20], [400, 90], [60, 317], [300, 268]];
var enemies = [];
var dead_enemies = [];
var bullets = [];
var hit_bullets = [];
var keys = [];

var GREEN = "green";
var BLUE = "cyan";
var RED = "red";
var color = BLUE;

var lost = false;
var pause = false;

class Enemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    
    this.damage = 0.1;
    this.health = 3;
    this.radius = 15;
  }
  
  update() {
  
  if (this.health <= 0) {
    dead_enemies.push(this);
    score += 10;
    spawn();
    // 50% chance of double-spawning,
    // thus increasing amount of monsters every three generations
    if (Math.floor(Math.random() * 2) == 0) {
      spawn();
    }
  }
  
  this.radius = 5 * this.health;
  
   var angleRadians = Math.atan2(this.x - x, this.y - y);
  
   var speed = 1;
  
   this.x -= Math.sin(angleRadians) * speed;
   this.y -= Math.cos(angleRadians) * speed;
   
   // check collision with user
   if (isCollision(x, y, radius, this.x, this.y, this.radius)) {
     radius -= this.damage;
     if (radius < 10) {
       lost = true;
     }
   }
   
  }
  
  getX() {
    return this.x;
  }
  
  getY() {
    return this.y;
  }
  
}

function distance(x1, y1, x2, y2) {
  return (Math.sqrt(Math.pow((x2-x1),2) + Math.pow((y2-y1, 2))));
}

function spawn() {
  var ex = Math.floor(Math.random() * canvas.width);
  var ey = Math.floor(Math.random() * canvas.height);
  if (!distance(ex, ey, x, y) < 100) {
    enemies.push(new Enemy(ex, ey));
  } else {
    // retry spawning
    spawn();
  }
}

class Bullet {
  constructor(x, y, xvelocity, yvelocity) {
    this.x = x;
    this.y = y;
    this.xVel = xvelocity;
    this.yVel = yvelocity;
    
    this.radius = 10;
  }
  
  update() {
    this.x += this.xVel;
    this.y += this.yVel;
    
    for (var i = 0; i < enemies.length; i++) {
      var enemy = enemies[i];
      if (isCollision(enemy.x, enemy.y, 15, this.x, this.y, this.radius)) {
        enemy.health--;
        hit_bullets.push(this);
      }
    }
    
  }
  
  getX() {
    return this.x;
  }
  
  getY() {
    return this.y;
  }
  
}

function clearCanvas() {
  context.beginPath();
  context.rect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "white";
  context.fill();
}

function drawScreen() {
  clearCanvas();
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  // UPDATE STUFF
  if (!lost && !pause) {
    calculatePosition();
    hasEaten();
    for (var a = 0; a < enemies.length; a++) {
      enemies[a].update();
    }
    for (var b = 0; b < bullets.length; b++) {
      bullets[b].update();
    }
  } else if (lost) {
    // game over
    context.beginPath();
    context.font = "30px Trebuchet";
    context.fillStyle = "red";
    context.fillText("You lose...", canvas.width / 2 - 75, canvas.height / 2);
    context.fill();
  } else if (pause) {
    // pause
    context.beginPath();
    context.font = "30px Trebuchet";
    context.fillStyle = "black";
    context.fillText("Game Paused", canvas.width / 2 - 75, canvas.height);
    context.fill();
  }
  
  // DRAW STUFF
  
  // draw food
  for (var i = 0; i<foodPositions.length;i++) {
    var food = foodPositions[i];
    color = BLUE;
    drawUserCell(food[0], food[1], 10);
  }
  // draw enemies
  for (var j = 0; j < enemies.length;j++) {
    var enemy = enemies[j];
    color = GREEN;
    drawUserCell(enemy.getX(), enemy.getY(), enemy.radius);
  }
  // remove dead enemies
  for (var d = 0; d < dead_enemies.length; d++) {
    var index = enemies.indexOf(dead_enemies[d]);
    enemies.splice(index, 1);
  }
  dead_enemies = [];
  // draw bullets
  for (var c = 0; c < bullets.length; c++) {
      var bullet = bullets[c];
      color = RED;
      drawUserCell(bullet.getX(), bullet.getY(), 5);
  }
  // remove used bullets
  for (var r = 0; r < hit_bullets.length; r++) {
    var index = bullets.indexOf(hit_bullets[r]);
    bullets.splice(index, 1);
  }
  
  // draw score
  context.beginPath();
  context.font = "30px Trebuchet";
  context.fillStyle = "black";
  context.fillText("Score: " + score, 0, 20);
  context.fill();
  
  hit_bullets = [];
  color = BLUE;
  drawUserCell(x, y, radius);
  setTimeout(drawScreen, 1000/60);
}

function calculatePosition() {
  
  //var angleRadians = Math.atan2(mouseX - x, mouseY - y);
  
  var speed = (40 / (radius/2));
  if (speed > 3) {
    speed = 3;
  }
  
  if (keys.indexOf(65) > -1) {
    x -= speed;
  } else if (keys.indexOf(68) > -1) {
    x += speed;
  }
  
  if (keys.indexOf(87) > -1) {
    //w
    y -= speed;
  } else if (keys.indexOf(83) > -1) {
    y += speed;
  }
  
  //x += Math.sin(angleRadians) * speed;
  //y += Math.cos(angleRadians) * speed;
}

function createFood() {
  var new_x = Math.floor(Math.random() * canvas.width);
  var new_y = Math.floor(Math.random() * canvas.height);
  
  foodPositions.push([new_x, new_y]);
}

function isCollision(x1, y1, r1, x2, y2, r2) {
    x_calc = Math.pow(x2 - x1, 2);
    y_calc = Math.pow(y2 - y1, 2);
    if (Math.sqrt(x_calc + y_calc) < r1 + r2) {
      return true;
    }
    return false;
}

function hasEaten() {
  var eatenIndices = [];
  for (var i = 0; i<foodPositions.length;i++) {
    x_calc = Math.pow(foodPositions[i][0] - x, 2);
    y_calc = Math.pow(foodPositions[i][1] - y, 2);
    if (isCollision(x,y,radius,foodPositions[i][0],foodPositions[i][1],10)) {
      eatenIndices.push(i);
      var curr_area = 3.14 * Math.pow(radius, 2);
      var new_area = curr_area + 200;
      radius = Math.sqrt(new_area / 3.14);
      createFood();
    }
  }
  for (var j = 0; j < eatenIndices.length; j++) {
    foodPositions.splice(eatenIndices[j], 1);
  }
}

function drawUserCell(x, y, radius) {
  context.beginPath();
  context.arc(x, y, radius, 0, 2*3.14159);

  context.fillStyle = color;

  context.fill();
}

function mouseMoved(mouse) {
  mouseX = mouse.clientX;
  mouseY = mouse.clientY;
}

function mousePressed() {
  if (radius < 10) {
    return;
  }
  var angleRadians = Math.atan2(mouseX - x, mouseY - y);
  var speed = 10;
  var xvel = Math.sin(angleRadians) * speed;
  var yvel = Math.cos(angleRadians) * speed;
  bullets.push(new Bullet(x, y, xvel, yvel));
  radius -= 0.5;
}

function keyUp(e) {
  e = e || window.event; 
  var charCode = e.charCode || e.keyCode, 
      character = String.fromCharCode(charCode);
  var index = keys.indexOf(charCode);
  if (index > -1) {
   keys.splice(index, 1);
  }
}

function keyDown(e) {
  e = e || window.event; 
  var charCode = e.charCode || e.keyCode, 
      character = String.fromCharCode(charCode);
  if (keys.indexOf(charCode) < 0) {
    keys.push(charCode);
  }
  if (charCode === 32) {
    pause = !pause;
  }
}

// setup
enemies.push(new Enemy(0, 0));

drawScreen();

canvas.addEventListener("mousemove", mouseMoved);
canvas.onmousedown = mousePressed;
document.addEventListener('keydown', keyDown, false);
document.addEventListener('keyup', keyUp, false);
