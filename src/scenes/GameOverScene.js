import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig.js';
import { calculateStats } from '../utils/stats.js';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOver');
  }

  create() {
    const retryLevel = this.registry.get('currentLevel');
    const stats = calculateStats(this.registry);

    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x2c0b0b, 0x2c0b0b, 0x1a1a2e, 0x1a1a2e, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Game Over text
    const title = this.add.text(GAME_WIDTH / 2, 100, 'GAME OVER', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '60px',
      color: '#e74c3c',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5);

    // Shake effect
    this.tweens.add({
      targets: title,
      x: title.x + 3,
      duration: 80,
      yoyo: true,
      repeat: 5,
    });

    // Sad ninja
    const ninja = this.add.graphics();
    ninja.fillStyle(0x4a90d9, 0.5);
    ninja.fillRoundedRect(GAME_WIDTH / 2 - 25, 170, 50, 70, 10);
    ninja.fillCircle(GAME_WIDTH / 2, 155, 22);
    this.add.text(GAME_WIDTH / 2, 153, 'X  X', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Stats panel
    const panelX = GAME_WIDTH / 2;
    const panelY = 320;
    const panelW = 420;
    const panelH = 180;

    const panel = this.add.graphics();
    panel.fillStyle(0x111122, 0.7);
    panel.fillRoundedRect(panelX - panelW / 2, panelY - panelH / 2, panelW, panelH, 12);
    panel.lineStyle(1, 0x444466, 0.5);
    panel.strokeRoundedRect(panelX - panelW / 2, panelY - panelH / 2, panelW, panelH, 12);

    this.add.text(panelX, panelY - 75, 'YOUR STATS', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#888899',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Speed
    this.add.text(panelX - 90, panelY - 45, 'Speed', {
      fontFamily: 'Arial', fontSize: '14px', color: '#8899aa',
    }).setOrigin(0.5);
    this.add.text(panelX - 90, panelY - 20, `${stats.speed}`, {
      fontFamily: 'Arial Black, Arial', fontSize: '28px', color: '#ffffff',
    }).setOrigin(0.5);
    this.add.text(panelX - 90, panelY + 5, 'letters/min', {
      fontFamily: 'Arial', fontSize: '11px', color: '#666677',
    }).setOrigin(0.5);

    // Error rate
    this.add.text(panelX + 90, panelY - 45, 'Error Rate', {
      fontFamily: 'Arial', fontSize: '14px', color: '#8899aa',
    }).setOrigin(0.5);
    this.add.text(panelX + 90, panelY - 20, `${stats.errorRate}%`, {
      fontFamily: 'Arial Black, Arial', fontSize: '28px',
      color: stats.errorRate > 30 ? '#e74c3c' : stats.errorRate > 15 ? '#f39c12' : '#2ecc71',
    }).setOrigin(0.5);
    this.add.text(panelX + 90, panelY + 5, 'wrong presses', {
      fontFamily: 'Arial', fontSize: '11px', color: '#666677',
    }).setOrigin(0.5);

    // Percentile bar
    const barY = panelY + 40;
    this.add.text(panelX, barY - 10, `You're faster than ${stats.percentile}% of players!`, {
      fontFamily: 'Arial', fontSize: '15px', color: '#ffd700', fontStyle: 'bold',
    }).setOrigin(0.5);

    // Percentile bar visual
    const barW = 300;
    const barH = 12;
    const barStartX = panelX - barW / 2;
    const barBg = this.add.graphics();
    barBg.fillStyle(0x333344, 1);
    barBg.fillRoundedRect(barStartX, barY + 8, barW, barH, 4);

    const barFill = this.add.graphics();
    const fillW = barW * (stats.percentile / 100);
    const barColor = stats.percentile > 75 ? 0x2ecc71 : stats.percentile > 50 ? 0xf39c12 : 0xe74c3c;
    barFill.fillStyle(barColor, 1);
    barFill.fillRoundedRect(barStartX, barY + 8, Math.max(4, fillW), barH, 4);

    // Returning info
    this.add.text(GAME_WIDTH / 2, 440, `Returning to Level ${retryLevel}`, {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#aaaacc',
    }).setOrigin(0.5);

    // Retry button
    const btnX = GAME_WIDTH / 2;
    const btnY = 500;
    const btnW = 220;
    const btnH = 55;

    const btn = this.add.graphics();
    btn.fillStyle(0xe74c3c, 1);
    btn.fillRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 12);

    this.add.text(btnX, btnY, 'TRY AGAIN', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '26px',
      color: '#ffffff',
    }).setOrigin(0.5);

    const hit = this.add.rectangle(btnX, btnY, btnW, btnH)
      .setInteractive({ useHandCursor: true })
      .setAlpha(0.001);

    hit.on('pointerover', () => {
      btn.clear();
      btn.fillStyle(0xc0392b, 1);
      btn.fillRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 12);
    });
    hit.on('pointerout', () => {
      btn.clear();
      btn.fillStyle(0xe74c3c, 1);
      btn.fillRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 12);
    });
    hit.on('pointerdown', () => {
      this.scene.start('PreLevel');
    });
  }
}
