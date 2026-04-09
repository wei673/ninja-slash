import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig.js';
import { createMuteButton } from '../utils/muteButton.js';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  create() {
    // Background gradient
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Title
    const title = this.add.text(GAME_WIDTH / 2, 200, 'NINJA SLASH', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '72px',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 8,
    }).setOrigin(0.5);

    this.tweens.add({
      targets: title,
      scale: 1.05,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Subtitle
    this.add.text(GAME_WIDTH / 2, 290, 'A Typing Adventure!', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#aaaacc',
    }).setOrigin(0.5);

    // Play button
    const btnWidth = 220;
    const btnHeight = 60;
    const btnX = GAME_WIDTH / 2;
    const btnY = 430;

    const btn = this.add.graphics();
    btn.fillStyle(0x2ecc71, 1);
    btn.fillRoundedRect(btnX - btnWidth / 2, btnY - btnHeight / 2, btnWidth, btnHeight, 15);

    const btnText = this.add.text(btnX, btnY, 'PLAY', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '32px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Make button interactive
    const hitArea = this.add.rectangle(btnX, btnY, btnWidth, btnHeight).setInteractive({ useHandCursor: true });
    hitArea.setAlpha(0.001);

    hitArea.on('pointerover', () => {
      btn.clear();
      btn.fillStyle(0x27ae60, 1);
      btn.fillRoundedRect(btnX - btnWidth / 2, btnY - btnHeight / 2, btnWidth, btnHeight, 15);
    });

    hitArea.on('pointerout', () => {
      btn.clear();
      btn.fillStyle(0x2ecc71, 1);
      btn.fillRoundedRect(btnX - btnWidth / 2, btnY - btnHeight / 2, btnWidth, btnHeight, 15);
    });

    hitArea.on('pointerdown', () => {
      this.resetStats();
      this.scene.start('PreLevel');
    });

    // Mute button
    createMuteButton(this);

    // Level select (for testing)
    this.add.text(GAME_WIDTH / 2, 500, 'Jump to Level (testing)', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#666688',
    }).setOrigin(0.5);

    const levelBtnStartX = GAME_WIDTH / 2 - (10 * 40 + 9 * 6) / 2 + 20;
    for (let i = 1; i <= 10; i++) {
      const lx = levelBtnStartX + (i - 1) * 46;
      const ly = 530;

      const lbg = this.add.graphics();
      lbg.fillStyle(0x2c3e50, 1);
      lbg.fillRoundedRect(lx - 18, ly - 15, 36, 30, 6);

      this.add.text(lx, ly, `${i}`, {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#ffffff',
      }).setOrigin(0.5);

      const lhit = this.add.rectangle(lx, ly, 36, 30)
        .setInteractive({ useHandCursor: true })
        .setAlpha(0.001);

      lhit.on('pointerover', () => {
        lbg.clear();
        lbg.fillStyle(0x3498db, 1);
        lbg.fillRoundedRect(lx - 18, ly - 15, 36, 30, 6);
      });
      lhit.on('pointerout', () => {
        lbg.clear();
        lbg.fillStyle(0x2c3e50, 1);
        lbg.fillRoundedRect(lx - 18, ly - 15, 36, 30, 6);
      });
      lhit.on('pointerdown', () => {
        this.resetStats();
        this.registry.set('currentLevel', i);
        this.scene.start('PreLevel');
      });
    }

    // Decorative ninja silhouettes
    this.createDecoNinja(180, 620, 0xe74c3c);
    this.createDecoNinja(512, 650, 0x3498db);
    this.createDecoNinja(844, 620, 0xf39c12);
  }

  resetStats() {
    this.registry.set('totalCorrect', 0);
    this.registry.set('totalWrong', 0);
    this.registry.set('totalBombHits', 0);
    this.registry.set('totalMisses', 0);
    this.registry.set('gameStartTime', 0);
    this.registry.set('activeTypingMs', 0);
  }

  createDecoNinja(x, y, color) {
    const g = this.add.graphics();
    // Body
    g.fillStyle(color, 0.3);
    g.fillRoundedRect(x - 20, y - 35, 40, 55, 8);
    // Head
    g.fillCircle(x, y - 48, 18);

    this.tweens.add({
      targets: g,
      y: -5,
      duration: 1500 + Math.random() * 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }
}
