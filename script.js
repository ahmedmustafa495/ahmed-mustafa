const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const coinsEl = document.getElementById("coins");
const timerEl = document.getElementById("timer");
const bestEl = document.getElementById("best");
const overlay = document.getElementById("overlay");
const startButton = document.getElementById("startButton");

const groundY = 338;
const trialLength = 60;
const bestKey = "free-trial-runner-best";

let bestScore = Number(localStorage.getItem(bestKey) || 0);
let state;
let lastTime = 0;

function resetGame() {
  state = {
    status: "ready",
    timeLeft: trialLength,
    score: 0,
    coins: 0,
    speed: 360,
    gravity: 2100,
    spawnTimer: 0.7,
    coinTimer: 1.2,
    obstacles: [],
    coinsList: [],
    runner: { x: 118, y: groundY - 68, width: 46, height: 68, vy: 0, grounded: true, stride: 0 },
  };
  updateHud();
  drawScene(0);
}

function startGame() {
  resetGame();
  state.status = "running";
  overlay.classList.add("hidden");
  lastTime = performance.now();
  requestAnimationFrame(loop);
}

function endGame(title, message) {
  state.status = "ended";
  bestScore = Math.max(bestScore, Math.floor(state.score));
  localStorage.setItem(bestKey, bestScore);
  updateHud();
  overlay.querySelector("h2").textContent = title;
  overlay.querySelector("p").textContent = message;
  startButton.textContent = "Run again";
  overlay.classList.remove("hidden");
}

function updateHud() {
  scoreEl.textContent = Math.floor(state.score);
  coinsEl.textContent = state.coins;
  timerEl.textContent = Math.max(0, Math.ceil(state.timeLeft));
  bestEl.textContent = bestScore;
}

function jump() {
  if (state.status === "ready" || state.status === "ended") return startGame();
  if (state.status !== "running" || !state.runner.grounded) return;
  state.runner.vy = -760;
  state.runner.grounded = false;
}

function togglePause() {
  if (state.status === "running") {
    state.status = "paused";
    overlay.querySelector("h2").textContent = "Paused";
    overlay.querySelector("p").textContent = "Press P to resume the free trial.";
    startButton.textContent = "Resume";
    overlay.classList.remove("hidden");
  } else if (state.status === "paused") {
    state.status = "running";
    overlay.classList.add("hidden");
    lastTime = performance.now();
    requestAnimationFrame(loop);
  }
}

function spawnObstacle() {
  const height = 38 + Math.random() * 58;
  state.obstacles.push({ x: canvas.width + 20, y: groundY - height, width: 34 + Math.random() * 28, height });
  state.spawnTimer = Math.max(0.62, 1.25 - state.speed / 900) + Math.random() * 0.7;
}

function spawnCoin() {
  state.coinsList.push({ x: canvas.width + 20, y: 170 + Math.random() * 95, radius: 13, spin: 0 });
  state.coinTimer = 0.85 + Math.random() * 1.25;
}

function loop(now) {
  if (state.status !== "running") return;
  const dt = Math.min((now - lastTime) / 1000, 0.033);
  lastTime = now;
  update(dt);
  drawScene(dt);
  requestAnimationFrame(loop);
}

function update(dt) {
  state.timeLeft -= dt;
  state.score += dt * (state.speed / 10) + state.coins * 0.01;
  state.speed += dt * 7.5;
  state.runner.stride += dt * 12;
  state.runner.vy += state.gravity * dt;
  state.runner.y += state.runner.vy * dt;

  if (state.runner.y >= groundY - state.runner.height) {
    state.runner.y = groundY - state.runner.height;
    state.runner.vy = 0;
    state.runner.grounded = true;
  }

  state.spawnTimer -= dt;
  state.coinTimer -= dt;
  if (state.spawnTimer <= 0) spawnObstacle();
  if (state.coinTimer <= 0) spawnCoin();

  moveObjects(state.obstacles, dt);
  moveObjects(state.coinsList, dt);
  collectCoins();

  if (state.obstacles.some((obstacle) => intersects(state.runner, obstacle))) {
    endGame("Trial crashed!", `Final score: ${Math.floor(state.score)}. Press R or Run again to retry.`);
  } else if (state.timeLeft <= 0) {
    endGame("Trial complete!", `You scored ${Math.floor(state.score)} with ${state.coins} coins.`);
  }
  updateHud();
}

function moveObjects(objects, dt) {
  for (const object of objects) object.x -= state.speed * dt;
  while (objects.length && objects[0].x < -80) objects.shift();
}

function collectCoins() {
  state.coinsList = state.coinsList.filter((coin) => {
    coin.spin += 0.18;
    const box = { x: coin.x - coin.radius, y: coin.y - coin.radius, width: coin.radius * 2, height: coin.radius * 2 };
    if (intersects(state.runner, box)) {
      state.coins += 1;
      state.score += 75;
      return false;
    }
    return true;
  });
}

function intersects(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function drawScene(dt) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawSky();
  drawCity();
  drawGround(dt);
  drawRunner();
  drawObstacles();
  drawCoins();
}

function drawSky() {
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#13204a");
  gradient.addColorStop(1, "#101935");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(54, 241, 205, 0.8)";
  ctx.beginPath();
  ctx.arc(790, 84, 38, 0, Math.PI * 2);
  ctx.fill();
}

function drawCity() {
  ctx.fillStyle = "rgba(5, 10, 22, 0.45)";
  for (let x = 0; x < canvas.width; x += 72) {
    const height = 80 + ((x * 13) % 120);
    ctx.fillRect(x, groundY - height - 18, 52, height);
  }
}

function drawGround(dt) {
  ctx.fillStyle = "#101827";
  ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);
  ctx.strokeStyle = "#36f1cd";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(canvas.width, groundY);
  ctx.stroke();
  ctx.fillStyle = "rgba(255, 204, 77, 0.8)";
  const offset = ((performance.now() / 1000) * state.speed) % 80;
  for (let x = -offset; x < canvas.width; x += 80) ctx.fillRect(x, groundY + 38, 40, 6);
}

function drawRunner() {
  const r = state.runner;
  ctx.fillStyle = "#36f1cd";
  roundedRect(r.x, r.y, r.width, r.height, 12);
  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(r.x + 28, r.y + 16, 8, 8);
  ctx.strokeStyle = "#ffcc4d";
  ctx.lineWidth = 6;
  const leg = Math.sin(r.stride) * 9;
  ctx.beginPath();
  ctx.moveTo(r.x + 14, r.y + r.height);
  ctx.lineTo(r.x + 10 + leg, r.y + r.height + 18);
  ctx.moveTo(r.x + 32, r.y + r.height);
  ctx.lineTo(r.x + 36 - leg, r.y + r.height + 18);
  ctx.stroke();
}

function drawObstacles() {
  ctx.fillStyle = "#ff5c7a";
  for (const obstacle of state.obstacles) roundedRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height, 8);
}

function drawCoins() {
  for (const coin of state.coinsList) {
    ctx.fillStyle = "#ffcc4d";
    ctx.beginPath();
    ctx.ellipse(coin.x, coin.y, coin.radius * Math.abs(Math.cos(coin.spin)), coin.radius, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function roundedRect(x, y, width, height, radius) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  ctx.fill();
}

startButton.addEventListener("click", () => (state.status === "paused" ? togglePause() : startGame()));
canvas.addEventListener("pointerdown", jump);
document.addEventListener("keydown", (event) => {
  if (["Space", "ArrowUp", "KeyW"].includes(event.code)) {
    event.preventDefault();
    jump();
  } else if (event.code === "KeyP") {
    togglePause();
  } else if (event.code === "KeyR") {
    startGame();
  }
});

resetGame();
