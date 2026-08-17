const player = document.getElementById("player");
const enemy = document.getElementById("enemy");

const playerHealthBar = document.getElementById("playerHealth");
const enemyHealthBar = document.getElementById("enemyHealth");

const timerElement = document.getElementById("timer");
const message = document.getElementById("message");
const messageTitle = message.querySelector("h2");
const startBtn = document.getElementById("startBtn");

const arena = document.getElementById("arena");

let gameRunning = false;

let playerHealth = 100;
let enemyHealth = 100;

let playerX = 0;
let enemyX = 0;

let playerY = 0;
let enemyY = 0;

let timer = 60;

let keys = {};

let playerBusy = false;
let enemyBusy = false;

let lastPlayerAttack = 0;
let lastEnemyAttack = 0;

const attackCooldown = 450;

const attacks = {
  punch: {
    damage: 7,
    range: 125,
    cooldown: 350
  },

  kick: {
    damage: 11,
    range: 140,
    cooldown: 600
  },

  special: {
    damage: 20,
    range: 190,
    cooldown: 1200
  }
};


/* -------------------------
   START GAME
------------------------- */

startBtn.addEventListener("click", startGame);

function startGame() {

  gameRunning = true;

  playerHealth = 100;
  enemyHealth = 100;

  playerX = arena.clientWidth * 0.17;
  enemyX = arena.clientWidth * 0.75;

  playerY = 0;
  enemyY = 0;

  timer = 60;

  updateHealth();

  timerElement.textContent = timer;

  message.style.display = "none";

  player.className = "fighter player";
  enemy.className = "fighter enemy";

  clearInterval(window.gameTimer);

  window.gameTimer = setInterval(() => {

    if (!gameRunning) return;

    timer--;

    timerElement.textContent = timer;

    if (timer <= 0) {

      if (playerHealth > enemyHealth) {
        endGame("YOU WIN!");
      } else if (enemyHealth > playerHealth) {
        endGame("CPU WINS!");
      } else {
        endGame("DRAW!");
      }
    }

  }, 1000);
}


/* -------------------------
   KEYBOARD
------------------------- */

window.addEventListener("keydown", event => {

  const key = event.key.toLowerCase();

  keys[key] = true;

  if (!gameRunning) return;

  if (key === "j") {
    playerAttack("punch");
  }

  if (key === "k") {
    playerAttack("kick");
  }

  if (key === "l") {
    playerAttack("special");
  }

});


window.addEventListener("keyup", event => {

  keys[event.key.toLowerCase()] = false;

});


/* -------------------------
   PLAYER MOVEMENT
------------------------- */

function updatePlayer() {

  if (!gameRunning) return;

  const speed = 5;

  if (keys["a"]) {
    playerX -= speed;
  }

  if (keys["d"]) {
    playerX += speed;
  }

  if (keys["w"] && playerY === 0) {
    jumpPlayer();
  }

  keepInsideArena();

  player.style.left = playerX + "px";

  player.style.bottom = (120 + playerY) + "px";
}


function keepInsideArena() {

  const maxX = arena.clientWidth - 100;

  if (playerX < 10) {
    playerX = 10;
  }

  if (playerX > maxX) {
    playerX = maxX;
  }
}


/* -------------------------
   PLAYER JUMP
------------------------- */

function jumpPlayer() {

  let velocity = 15;

  const gravity = 0.8;

  const jumpInterval = setInterval(() => {

    if (!gameRunning) {
      clearInterval(jumpInterval);
      return;
    }

    playerY += velocity;

    velocity -= gravity;

    if (playerY <= 0) {

      playerY = 0;

      clearInterval(jumpInterval);
    }

  }, 30);
}


/* -------------------------
   PLAYER ATTACK
------------------------- */

function playerAttack(type) {

  if (!gameRunning || playerBusy) return;

  const now = Date.now();

  if (now - lastPlayerAttack < attacks[type].cooldown) {
    return;
  }

  lastPlayerAttack = now;

  playerBusy = true;

  player.classList.add("attack-" + type);

  setTimeout(() => {

    const distance = Math.abs(playerX - enemyX);

    if (distance <= attacks[type].range) {

      damageEnemy(attacks[type].damage);

    }

  }, 100);

  setTimeout(() => {

    player.classList.remove("attack-" + type);

    playerBusy = false;

  }, 350);
}


/* -------------------------
   ENEMY AI
------------------------- */

function enemyAI() {

  if (!gameRunning || enemyBusy) return;

  const distance = Math.abs(playerX - enemyX);

  if (distance > 135) {

    if (enemyX > playerX) {
      enemyX -= 2.2;
    } else {
      enemyX += 2.2;
    }

  } else {

    const random = Math.random();

    if (random < 0.025) {

      enemyAttack("special");

    } else if (random < 0.07) {

      enemyAttack("kick");

    } else if (random < 0.14) {

      enemyAttack("punch");

    }

  }

  enemy.style.left = enemyX + "px";
}


/* -------------------------
   ENEMY ATTACK
------------------------- */

function enemyAttack(type) {

  if (!gameRunning || enemyBusy) return;

  const now = Date.now();

  if (now - lastEnemyAttack < attacks[type].cooldown) {
    return;
  }

  lastEnemyAttack = now;

  enemyBusy = true;

  enemy.classList.add("attack-" + type);

  setTimeout(() => {

    const distance = Math.abs(enemyX - playerX);

    if (distance <= attacks[type].range) {

      damagePlayer(attacks[type].damage);

    }

  }, 120);

  setTimeout(() => {

    enemy.classList.remove("attack-" + type);

    enemyBusy = false;

  }, 400);
}


/* -------------------------
   DAMAGE
------------------------- */

function damageEnemy(amount) {

  if (!gameRunning) return;

  enemyHealth -= amount;

  if (enemyHealth < 0) {
    enemyHealth = 0;
  }

  enemy.classList.add("hit");

  setTimeout(() => {
    enemy.classList.remove("hit");
  }, 180);

  updateHealth();

  if (enemyHealth <= 0) {

    endGame("YOU WIN! 🏆");

  }
}


function damagePlayer(amount) {

  if (!gameRunning) return;

  playerHealth -= amount;

  if (playerHealth < 0) {
    playerHealth = 0;
  }

  player.classList.add("hit");

  setTimeout(() => {
    player.classList.remove("hit");
  }, 180);

  updateHealth();

  if (playerHealth <= 0) {

    endGame("CPU WINS! 🤖");

  }
}


/* -------------------------
   HEALTH BARS
------------------------- */

function updateHealth() {

  playerHealthBar.style.width = playerHealth + "%";

  enemyHealthBar.style.width = enemyHealth + "%";

}


/* -------------------------
   END GAME
------------------------- */

function endGame(text) {

  gameRunning = false;

  clearInterval(window.gameTimer);

  messageTitle.textContent = text;

  startBtn.textContent = "PLAY AGAIN";

  message.style.display = "block";

}


/* -------------------------
   GAME LOOP
------------------------- */

function gameLoop() {

  updatePlayer();

  enemyAI();

  requestAnimationFrame(gameLoop);

}

gameLoop();


/* -------------------------
   MOBILE BUTTONS
------------------------- */

document.querySelectorAll("[data-key]").forEach(button => {

  const key = button.dataset.key;

  button.addEventListener("pointerdown", event => {

    event.preventDefault();

    keys[key] = true;

  });

  button.addEventListener("pointerup", event => {

    event.preventDefault();

    keys[key] = false;

  });

  button.addEventListener("pointerleave", () => {

    keys[key] = false;

  });

});


document.querySelectorAll("[data-action]").forEach(button => {

  button.addEventListener("pointerdown", event => {

    event.preventDefault();

    const action = button.dataset.action;

    playerAttack(action);

  });

});


/* -------------------------
   PREVENT SPACE SCROLL
------------------------- */

window.addEventListener("keydown", event => {

  if (event.key === " ") {
    event.preventDefault();
  }

});


/* -------------------------
   INITIAL SCREEN
------------------------- */

messageTitle.textContent = "READY?";

message.style.display = "block";
