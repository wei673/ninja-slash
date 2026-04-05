import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig.js';
import { CHARACTERS } from '../config/characters.js';
import { playVictory } from '../utils/audio.js';
import { calculateStats } from '../utils/stats.js';

export class VictoryScene extends Phaser.Scene {
  constructor() {
    super('Victory');
  }

  create() {
    playVictory();

    // Background — dark to gold gradient
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a0a3e, 0x1a0a3e, 0x2a1a0a, 0x2a1a0a, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Twinkling stars in background
    for (let i = 0; i < 30; i++) {
      const star = this.add.graphics();
      star.fillStyle(0xffffff, 0.4 + Math.random() * 0.4);
      star.fillCircle(
        Phaser.Math.Between(0, GAME_WIDTH),
        Phaser.Math.Between(0, GAME_HEIGHT * 0.6),
        1 + Math.random() * 1.5
      );
      this.tweens.add({
        targets: star,
        alpha: 0.1,
        duration: 500 + Math.random() * 1000,
        yoyo: true,
        repeat: -1,
      });
    }

    // Confetti
    this.createConfetti();

    // Firework bursts
    this.createFireworks();

    // Title with rainbow shimmer
    const title = this.add.text(GAME_WIDTH / 2, 120, 'YOU WIN!', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '78px',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 8,
    }).setOrigin(0.5);

    this.tweens.add({
      targets: title,
      scale: 1.08,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Subtitle
    const sub = this.add.text(GAME_WIDTH / 2, 210, 'All 10 levels completed!', {
      fontFamily: 'Arial',
      fontSize: '22px',
      color: '#ccccee',
    }).setOrigin(0.5);
    sub.setAlpha(0);
    this.tweens.add({
      targets: sub,
      alpha: 1,
      y: 205,
      duration: 800,
      delay: 400,
    });

    // Stats panel
    const stats = calculateStats(this.registry);
    this.createStatsPanel(stats);

    // Dancing ninja
    const characterId = this.registry.get('selectedCharacter') || 'cat';
    this.createDancingNinja(GAME_WIDTH / 2 - 180, 500, characterId);
    this.createDancingNinja(GAME_WIDTH / 2 + 180, 500, characterId);

    // Leaderboard button
    const btnX = GAME_WIDTH / 2;
    const btnY = 640;
    const btnW = 280;
    const btnH = 50;

    const btn = this.add.graphics();
    btn.fillStyle(0x3498db, 1);
    btn.fillRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 12);

    this.add.text(btnX, btnY, 'LEADERBOARD', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '26px',
      color: '#ffffff',
    }).setOrigin(0.5);

    const hit = this.add.rectangle(btnX, btnY, btnW, btnH)
      .setInteractive({ useHandCursor: true })
      .setAlpha(0.001);

    hit.on('pointerover', () => {
      btn.clear();
      btn.fillStyle(0x2980b9, 1);
      btn.fillRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 12);
    });
    hit.on('pointerout', () => {
      btn.clear();
      btn.fillStyle(0x3498db, 1);
      btn.fillRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 12);
    });
    hit.on('pointerdown', () => {
      this.scene.start('Leaderboard');
    });
  }

  createStatsPanel(stats) {
    const panelX = GAME_WIDTH / 2;
    const panelY = 345;
    const panelW = 500;
    const panelH = 150;

    const panel = this.add.graphics();
    panel.fillStyle(0x000000, 0.4);
    panel.fillRoundedRect(panelX - panelW / 2, panelY - panelH / 2, panelW, panelH, 12);

    // Speed
    this.add.text(panelX - 150, panelY - 50, 'Speed', {
      fontFamily: 'Arial', fontSize: '13px', color: '#8899aa',
    }).setOrigin(0.5);
    this.add.text(panelX - 150, panelY - 25, `${stats.speed}`, {
      fontFamily: 'Arial Black, Arial', fontSize: '32px', color: '#ffffff',
    }).setOrigin(0.5);
    this.add.text(panelX - 150, panelY + 2, 'letters/min', {
      fontFamily: 'Arial', fontSize: '11px', color: '#666677',
    }).setOrigin(0.5);

    // Error rate
    this.add.text(panelX + 150, panelY - 50, 'Error Rate', {
      fontFamily: 'Arial', fontSize: '13px', color: '#8899aa',
    }).setOrigin(0.5);
    this.add.text(panelX + 150, panelY - 25, `${stats.errorRate}%`, {
      fontFamily: 'Arial Black, Arial', fontSize: '32px',
      color: stats.errorRate > 30 ? '#e74c3c' : stats.errorRate > 15 ? '#f39c12' : '#2ecc71',
    }).setOrigin(0.5);
    this.add.text(panelX + 150, panelY + 2, 'wrong presses', {
      fontFamily: 'Arial', fontSize: '11px', color: '#666677',
    }).setOrigin(0.5);

    // Percentile — center, larger
    const pctColor = stats.percentile > 75 ? '#2ecc71' : stats.percentile > 50 ? '#f39c12' : '#e74c3c';
    this.add.text(panelX, panelY + 30, `Faster than ${stats.percentile}% of players!`, {
      fontFamily: 'Arial', fontSize: '17px', color: '#ffd700', fontStyle: 'bold',
    }).setOrigin(0.5);

    // Percentile bar
    const barW = 350;
    const barH = 10;
    const barStartX = panelX - barW / 2;
    const barBgY = panelY + 52;

    const barBg = this.add.graphics();
    barBg.fillStyle(0x333344, 1);
    barBg.fillRoundedRect(barStartX, barBgY, barW, barH, 4);

    const fillW = barW * (stats.percentile / 100);
    const barFillColor = stats.percentile > 75 ? 0x2ecc71 : stats.percentile > 50 ? 0xf39c12 : 0xe74c3c;
    const barFill = this.add.graphics();
    barFill.fillStyle(barFillColor, 1);
    barFill.fillRoundedRect(barStartX, barBgY, Math.max(4, fillW), barH, 4);
  }

  createTrophy(x, y) {
    const g = this.add.graphics();

    // Cup body
    g.fillStyle(0xffd700, 1);
    g.fillRoundedRect(x - 25, y - 30, 50, 40, 8);

    // Cup rim
    g.fillStyle(0xffec8b, 1);
    g.fillRoundedRect(x - 30, y - 35, 60, 10, 4);

    // Handles
    g.lineStyle(5, 0xffd700, 1);
    g.beginPath();
    g.arc(x - 28, y - 15, 12, -Math.PI * 0.5, Math.PI * 0.5, false);
    g.strokePath();
    g.beginPath();
    g.arc(x + 28, y - 15, 12, Math.PI * 0.5, -Math.PI * 0.5, false);
    g.strokePath();

    // Base
    g.fillStyle(0xffd700, 1);
    g.fillRect(x - 8, y + 10, 16, 12);
    g.fillRoundedRect(x - 18, y + 20, 36, 8, 3);

    // Star on cup
    g.fillStyle(0xffffff, 0.6);
    const starX = x;
    const starY = y - 15;
    g.fillTriangle(starX, starY - 8, starX - 3, starY - 2, starX + 3, starY - 2);
    g.fillTriangle(starX, starY + 5, starX - 3, starY - 1, starX + 3, starY - 1);
    g.fillTriangle(starX - 7, starY - 3, starX - 1, starY - 1, starX - 2, starY + 3);
    g.fillTriangle(starX + 7, starY - 3, starX + 1, starY - 1, starX + 2, starY + 3);

    // Glow behind trophy
    const glow = this.add.graphics();
    glow.fillStyle(0xffd700, 0.1);
    glow.fillCircle(x, y, 55);
    this.children.moveBelow(glow, g);

    this.tweens.add({
      targets: glow,
      scale: 1.2,
      alpha: 0.05,
      duration: 1000,
      yoyo: true,
      repeat: -1,
    });

    // Shimmer on trophy
    this.tweens.add({
      targets: g,
      y: -3,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  createConfetti() {
    const colors = [0xe74c3c, 0xf39c12, 0x2ecc71, 0x3498db, 0x9b59b6, 0xffd700, 0xff69b4];

    this.time.addEvent({
      delay: 80,
      loop: true,
      callback: () => {
        const x = Phaser.Math.Between(0, GAME_WIDTH);
        const color = Phaser.Utils.Array.GetRandom(colors);
        const size = Phaser.Math.Between(4, 10);

        const piece = this.add.graphics();
        piece.fillStyle(color, 0.8);

        // Mix of shapes: squares, rectangles, circles
        const shape = Phaser.Math.Between(0, 2);
        if (shape === 0) {
          piece.fillRect(-size / 2, -size / 2, size, size);
        } else if (shape === 1) {
          piece.fillRect(-size / 2, -size / 4, size, size / 2);
        } else {
          piece.fillCircle(0, 0, size / 2);
        }

        piece.setPosition(x, -10);
        piece.setRotation(Math.random() * Math.PI);

        this.tweens.add({
          targets: piece,
          y: GAME_HEIGHT + 20,
          x: x + Phaser.Math.Between(-100, 100),
          rotation: piece.rotation + Phaser.Math.Between(-4, 4),
          duration: Phaser.Math.Between(2000, 4500),
          onComplete: () => piece.destroy(),
        });
      },
    });
  }

  createFireworks() {
    // Periodic firework bursts
    this.time.addEvent({
      delay: 1200,
      loop: true,
      callback: () => {
        const x = Phaser.Math.Between(100, GAME_WIDTH - 100);
        const y = Phaser.Math.Between(60, 280);
        this.fireworkBurst(x, y);
      },
    });

    // Initial burst
    this.time.delayedCall(300, () => this.fireworkBurst(GAME_WIDTH / 2, 150));
  }

  fireworkBurst(x, y) {
    const colors = [0xff4444, 0x44ff44, 0x4444ff, 0xffff44, 0xff44ff, 0x44ffff, 0xffd700];
    const color = Phaser.Utils.Array.GetRandom(colors);
    const count = 16 + Phaser.Math.Between(0, 8);

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = 50 + Math.random() * 60;
      const particle = this.add.graphics();
      particle.fillStyle(color, 1);
      particle.fillCircle(0, 0, 2 + Math.random() * 2);
      particle.setPosition(x, y);

      this.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed + 20, // gravity
        alpha: 0,
        scale: 0.2,
        duration: 600 + Math.random() * 400,
        onComplete: () => particle.destroy(),
      });
    }

    // Center flash
    const flash = this.add.graphics();
    flash.fillStyle(0xffffff, 0.6);
    flash.fillCircle(x, y, 8);
    this.tweens.add({
      targets: flash,
      scale: 3,
      alpha: 0,
      duration: 300,
      onComplete: () => flash.destroy(),
    });
  }

  createDancingNinja(x, y, characterId) {
    const charDef = CHARACTERS.find(c => c.id === characterId) || CHARACTERS[0];
    const container = this.add.container(x, y);

    // Body
    const body = this.add.graphics();
    body.fillStyle(charDef.color, 1);
    body.fillRoundedRect(-25, -35, 50, 60, 10);
    container.add(body);

    // Head
    const head = this.add.graphics();
    head.fillStyle(charDef.color, 1);
    head.fillCircle(0, -48, 20);
    container.add(head);

    // Ninja mask
    const mask = this.add.graphics();
    mask.fillStyle(0x222222, 0.85);
    mask.fillRect(-24, -53, 48, 11);
    container.add(mask);

    // Happy eyes
    const eyeL = this.add.text(-8, -50, '^', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#ffffff',
    }).setOrigin(0.5);
    container.add(eyeL);

    const eyeR = this.add.text(8, -50, '^', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#ffffff',
    }).setOrigin(0.5);
    container.add(eyeR);

    // Arms up in celebration
    const arms = this.add.graphics();
    arms.lineStyle(5, charDef.color, 1);
    arms.lineBetween(-25, -20, -40, -50);
    arms.lineBetween(25, -20, 40, -50);
    container.add(arms);

    // Label
    const label = this.add.text(0, 42, charDef.name, {
      fontFamily: 'Arial',
      fontSize: '13px',
      color: '#ffd700',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    container.add(label);

    // Dance: bounce + twist
    this.tweens.add({
      targets: container,
      angle: { from: -12, to: 12 },
      duration: 280,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.tweens.add({
      targets: container,
      y: y - 25,
      duration: 350,
      yoyo: true,
      repeat: -1,
      ease: 'Quad.easeOut',
    });

    // Scale pop entrance
    container.setScale(0);
    this.tweens.add({
      targets: container,
      scale: 1,
      duration: 500,
      delay: 300,
      ease: 'Back.easeOut',
    });
  }
}
