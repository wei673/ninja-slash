import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig.js';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOver');
  }

  create() {
    const retryLevel = this.registry.get('currentLevel');

    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x2c0b0b, 0x2c0b0b, 0x1a1a2e, 0x1a1a2e, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Game Over text
    const title = this.add.text(GAME_WIDTH / 2, 180, 'GAME OVER', {
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

    // Sad ninja placeholder
    const ninja = this.add.graphics();
    ninja.fillStyle(0x4a90d9, 0.5);
    ninja.fillRoundedRect(GAME_WIDTH / 2 - 25, 270, 50, 70, 10);
    ninja.fillCircle(GAME_WIDTH / 2, 255, 22);
    // Sad eyes (X X)
    const sadText = this.add.text(GAME_WIDTH / 2, 253, 'X  X', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Info
    this.add.text(GAME_WIDTH / 2, 380, `Returning to Level ${retryLevel}`, {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#aaaacc',
    }).setOrigin(0.5);

    // Retry button
    const btnX = GAME_WIDTH / 2;
    const btnY = 450;
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
