import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig.js';

export class LevelCompleteScene extends Phaser.Scene {
  constructor() {
    super('LevelComplete');
  }

  create() {
    const completedLevel = this.registry.get('currentLevel') - 1;

    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0f3460, 0x0f3460, 0x16213e, 0x16213e, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Stars
    for (let i = 0; i < 30; i++) {
      const star = this.add.graphics();
      star.fillStyle(0xffd700, 0.6);
      const sx = Phaser.Math.Between(50, GAME_WIDTH - 50);
      const sy = Phaser.Math.Between(50, GAME_HEIGHT - 50);
      star.fillCircle(sx, sy, Phaser.Math.Between(2, 5));
      this.tweens.add({
        targets: star,
        alpha: 0.2,
        duration: Phaser.Math.Between(500, 1500),
        yoyo: true,
        repeat: -1,
      });
    }

    // Title
    const title = this.add.text(GAME_WIDTH / 2, 200, `Level ${completedLevel}\nComplete!`, {
      fontFamily: 'Arial Black, Arial',
      fontSize: '52px',
      color: '#2ecc71',
      stroke: '#000000',
      strokeThickness: 6,
      align: 'center',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: title,
      scale: 1.05,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Next level button
    const btnX = GAME_WIDTH / 2;
    const btnY = 430;
    const btnW = 240;
    const btnH = 55;

    const btn = this.add.graphics();
    btn.fillStyle(0x3498db, 1);
    btn.fillRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 12);

    this.add.text(btnX, btnY, 'NEXT LEVEL', {
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
      this.scene.start('PreLevel');
    });
  }
}
