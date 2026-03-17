import { loadAssets } from './assets.js';
import { Background } from './Background.js';
import { MooFO } from './MooFO.js';
import { InputHandler } from './InputHandler.js';
import { Cow } from './Cow.js';
import { MIBCar } from './MIBCar.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

window.ctx = ctx;

// UI Elements
const uiElements = {
    startMenu: document.getElementById('start-menu'),
    pauseMenu: document.getElementById('pause-menu'),
    level2Popup: document.getElementById('level2-popup'),
    hud: document.getElementById('hud'),
    playBtn: document.getElementById('play-btn'),
    pauseBtn: document.getElementById('resume-btn'),
    hudPauseBtn: document.getElementById('pause-btn'),
    soundBtn: document.getElementById('sound-btn'),
    musicBtn: document.getElementById('music-btn'),
    scoreDisplay: document.getElementById('score-display')
};

// Game State
const gameState = {
    isRunning: false,
    isPaused: false,
    soundEnabled: true,
    musicEnabled: true,
    cowsAbducted: 0,
    level: 1
};

let images = null;
let bg = null;
let player = null;
let inputHandler = new InputHandler();
let cameraX = 0;

let cows = [];
let mibCars = [];
let explodedCowsCount = 0;
let totalExploded = 0;

function spawnCow() {
    let x = cameraX + (Math.random() * 3000 - 1000);
    const inMibZone = mibCars.some(car => {
        if (car.state === 'investigating') {
            return Math.abs(x - car.targetX) < 1000;
        }
        return false;
    });

    if (!inMibZone) {
        cows.push(new Cow(images, x, canvas.height));
    }
}

// Resize Handling
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (player) {
        player.canvasWidth = canvas.width;
        player.canvasHeight = canvas.height;
    }
}
window.addEventListener('resize', resize);
resize();

// Init
loadAssets().then(loaded => {
    images = loaded;
    uiElements.playBtn.innerText = "START ABDUCTION";
    uiElements.playBtn.disabled = false;
}).catch(err => {
    uiElements.playBtn.innerText = "ERROR LOADING";
});

// UI Interactions
uiElements.playBtn.addEventListener('click', () => {
    if (!images) return;
    uiElements.startMenu.classList.add('hidden');
    uiElements.hud.classList.remove('hidden');
    gameState.isRunning = true;
    gameState.isPaused = false;

    if (!bg) {
        bg = new Background(images);
        player = new MooFO(images, canvas.width, canvas.height);
        for (let i = 0; i < 8; i++) spawnCow();
    }
});

uiElements.hudPauseBtn.addEventListener('click', () => {
    uiElements.pauseMenu.classList.remove('hidden');
    gameState.isPaused = true;
});

uiElements.pauseBtn.addEventListener('click', () => {
    uiElements.pauseMenu.classList.add('hidden');
    gameState.isPaused = false;
    inputHandler.clearJustPressed(); // Reset inputs after pause
});

uiElements.soundBtn.addEventListener('change', (e) => {
    gameState.soundEnabled = e.target.checked;
});

uiElements.musicBtn.addEventListener('change', (e) => {
    gameState.musicEnabled = e.target.checked;
});

// Main Loop Setup
let lastTime = 0;
let cowSpawnTimer = 0;

function gameLoop(timestamp) {
    let dt = timestamp - lastTime;
    lastTime = timestamp;

    if (gameState.isRunning && !gameState.isPaused) {
        cowSpawnTimer += dt;
        if (cowSpawnTimer > 2000) {
            if (cows.length < 15) spawnCow();
            cowSpawnTimer = 0;
        }

        player.update(inputHandler, dt);

        cameraX = player.x - canvas.width / 2 + player.width / 2;
        if (cameraX < -5000) cameraX = -5000;
        if (cameraX > 5000) cameraX = 5000;

        bg.update(cameraX);

        mibCars.forEach(car => car.update(dt));

        cows.forEach(cow => {
            cow.update(player, dt);

            if (cow.justExploded) {
                cow.justExploded = false;
                explodedCowsCount++;
                totalExploded++;

                if (explodedCowsCount >= 2) {
                    explodedCowsCount = 0;
                    mibCars.push(new MIBCar(images, canvas.width, canvas.height, cow.x));
                }
            }

            if (cow.state === 'abducted') {
                gameState.cowsAbducted++;
                uiElements.scoreDisplay.innerText = `Cows: ${gameState.cowsAbducted}/5`;
                cow.state = 'processed';

                if (gameState.cowsAbducted >= 5) {
                    uiElements.level2Popup.classList.remove('hidden');
                    gameState.isRunning = false;
                }
            }
        });

        cows = cows.filter(c => c.state !== 'processed' && c.deadTimer < 150);
        mibCars = mibCars.filter(c => c.state !== 'leaving' || Math.abs(c.x - cameraX) < 3000);

        // Render loop
        ctx.fillStyle = "#0b0c10";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        bg.draw(ctx, canvas.width, canvas.height);

        ctx.save();
        ctx.translate(-cameraX, 0);

        mibCars.forEach(car => car.draw(ctx));
        cows.forEach(cow => cow.draw(ctx));
        player.draw(ctx);

        ctx.restore();
    }

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
