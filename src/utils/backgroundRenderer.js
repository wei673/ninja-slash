import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig.js';
import { BACKGROUNDS } from '../config/backgrounds.js';

export function renderBackground(scene, levelIndex) {
  const bg = BACKGROUNDS[levelIndex] || BACKGROUNDS[0];

  // Gradient fill
  const grad = scene.add.graphics();
  grad.fillGradientStyle(bg.topColor, bg.topColor, bg.bottomColor, bg.bottomColor, 1);
  grad.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  // Decorative elements based on theme
  switch (bg.elements) {
    case 'lanterns':
      drawLanterns(scene, bg.accentColor);
      break;
    case 'trees':
      drawTrees(scene, bg.accentColor);
      break;
    case 'clouds':
      drawClouds(scene, bg.accentColor);
      break;
    case 'waves':
      drawWaves(scene, bg.accentColor);
      break;
    case 'crystals':
      drawCrystals(scene, bg.accentColor);
      break;
    case 'snowflakes':
      drawSnowflakes(scene, bg.accentColor);
      break;
    case 'embers':
      drawEmbers(scene, bg.accentColor);
      break;
    case 'bubbles':
      drawBubbles(scene, bg.accentColor);
      break;
    case 'stars':
      drawStars(scene, bg.accentColor);
      break;
    case 'sparkles':
      drawSparkles(scene, bg.accentColor);
      break;
  }

  return bg;
}

function drawLanterns(scene, color) {
  for (let i = 0; i < 4; i++) {
    const x = 100 + i * 250;
    const g = scene.add.graphics();
    // String
    g.lineStyle(1, 0x888888, 0.4);
    g.lineBetween(x, 0, x, 40);
    // Lantern body
    g.fillStyle(color, 0.2);
    g.fillRoundedRect(x - 12, 40, 24, 30, 6);
    g.fillStyle(0xffaa00, 0.15);
    g.fillCircle(x, 55, 5);

    scene.tweens.add({
      targets: g,
      y: 3,
      duration: 2000 + i * 300,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }
}

function drawTrees(scene, color) {
  for (let i = 0; i < 8; i++) {
    const x = 30 + i * 130;
    const g = scene.add.graphics();
    // Bamboo stalk
    g.fillStyle(color, 0.15);
    g.fillRect(x - 3, 0, 6, GAME_HEIGHT);
    // Segments
    for (let j = 0; j < 8; j++) {
      g.lineStyle(1, 0x000000, 0.1);
      g.lineBetween(x - 3, j * 95, x + 3, j * 95);
    }
    // Leaves
    g.fillStyle(color, 0.1);
    g.fillEllipse(x + 15, 100 + i * 30, 30, 10);
    g.fillEllipse(x - 12, 200 + i * 20, 25, 8);
  }
}

function drawClouds(scene, color) {
  for (let i = 0; i < 5; i++) {
    const x = Phaser.Math.Between(50, GAME_WIDTH - 50);
    const y = Phaser.Math.Between(30, 250);
    const g = scene.add.graphics();
    g.fillStyle(color, 0.15);
    g.fillEllipse(0, 0, 80 + Math.random() * 40, 30 + Math.random() * 15);
    g.fillEllipse(-20, -8, 50, 25);
    g.fillEllipse(20, -5, 60, 28);
    g.setPosition(x, y);

    scene.tweens.add({
      targets: g,
      x: x + 30,
      duration: 4000 + i * 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }
}

function drawWaves(scene, color) {
  for (let i = 0; i < 3; i++) {
    const y = GAME_HEIGHT - 120 + i * 25;
    const g = scene.add.graphics();
    g.fillStyle(color, 0.08 + i * 0.04);

    g.beginPath();
    g.moveTo(0, y);
    for (let x = 0; x <= GAME_WIDTH; x += 20) {
      g.lineTo(x, y + Math.sin(x * 0.02 + i) * 10);
    }
    g.lineTo(GAME_WIDTH, GAME_HEIGHT);
    g.lineTo(0, GAME_HEIGHT);
    g.closePath();
    g.fillPath();

    scene.tweens.add({
      targets: g,
      x: 15,
      duration: 2000 + i * 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }
}

function drawCrystals(scene, color) {
  for (let i = 0; i < 6; i++) {
    const x = Phaser.Math.Between(30, GAME_WIDTH - 30);
    const y = Phaser.Math.Between(50, GAME_HEIGHT - 150);
    const g = scene.add.graphics();
    const size = 8 + Math.random() * 15;
    g.fillStyle(color, 0.15 + Math.random() * 0.1);
    g.fillTriangle(x, y - size * 2, x - size, y, x + size, y);

    scene.tweens.add({
      targets: g,
      alpha: 0.3,
      duration: 1500 + Math.random() * 1000,
      yoyo: true,
      repeat: -1,
    });
  }
}

function drawSnowflakes(scene, color) {
  for (let i = 0; i < 15; i++) {
    const g = scene.add.graphics();
    g.fillStyle(color, 0.2 + Math.random() * 0.15);
    g.fillCircle(0, 0, 2 + Math.random() * 3);
    g.setPosition(Phaser.Math.Between(0, GAME_WIDTH), Phaser.Math.Between(0, GAME_HEIGHT));

    scene.tweens.add({
      targets: g,
      y: g.y + 40,
      x: g.x + Phaser.Math.Between(-15, 15),
      duration: 3000 + Math.random() * 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }
}

function drawEmbers(scene, color) {
  scene.time.addEvent({
    delay: 400,
    loop: true,
    callback: () => {
      const g = scene.add.graphics();
      g.fillStyle(color, 0.4 + Math.random() * 0.3);
      g.fillCircle(0, 0, 1.5 + Math.random() * 2.5);
      g.setPosition(Phaser.Math.Between(0, GAME_WIDTH), GAME_HEIGHT);

      scene.tweens.add({
        targets: g,
        y: -20,
        x: g.x + Phaser.Math.Between(-40, 40),
        alpha: 0,
        duration: 3000 + Math.random() * 2000,
        onComplete: () => g.destroy(),
      });
    },
  });
}

function drawBubbles(scene, color) {
  scene.time.addEvent({
    delay: 600,
    loop: true,
    callback: () => {
      const g = scene.add.graphics();
      const r = 3 + Math.random() * 8;
      g.lineStyle(1.5, color, 0.25);
      g.strokeCircle(0, 0, r);
      g.fillStyle(color, 0.05);
      g.fillCircle(0, 0, r);
      g.setPosition(Phaser.Math.Between(0, GAME_WIDTH), GAME_HEIGHT + 10);

      scene.tweens.add({
        targets: g,
        y: -20,
        x: g.x + Phaser.Math.Between(-30, 30),
        alpha: 0,
        duration: 4000 + Math.random() * 2000,
        onComplete: () => g.destroy(),
      });
    },
  });
}

function drawStars(scene, color) {
  for (let i = 0; i < 40; i++) {
    const g = scene.add.graphics();
    const size = 1 + Math.random() * 2;
    g.fillStyle(color, 0.3 + Math.random() * 0.5);
    g.fillCircle(
      Phaser.Math.Between(0, GAME_WIDTH),
      Phaser.Math.Between(0, GAME_HEIGHT - 100),
      size
    );

    scene.tweens.add({
      targets: g,
      alpha: 0.1,
      duration: 800 + Math.random() * 1500,
      yoyo: true,
      repeat: -1,
    });
  }
}

function drawSparkles(scene, color) {
  scene.time.addEvent({
    delay: 300,
    loop: true,
    callback: () => {
      const g = scene.add.graphics();
      g.fillStyle(color, 0.4);
      const x = Phaser.Math.Between(0, GAME_WIDTH);
      const y = Phaser.Math.Between(0, GAME_HEIGHT - 100);
      // Small 4-pointed star
      g.fillTriangle(x, y - 5, x - 2, y, x + 2, y);
      g.fillTriangle(x, y + 5, x - 2, y, x + 2, y);
      g.fillTriangle(x - 5, y, x, y - 2, x, y + 2);
      g.fillTriangle(x + 5, y, x, y - 2, x, y + 2);

      scene.tweens.add({
        targets: g,
        alpha: 0,
        scale: 1.5,
        duration: 800 + Math.random() * 600,
        onComplete: () => g.destroy(),
      });
    },
  });
}
