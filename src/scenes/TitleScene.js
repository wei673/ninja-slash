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

    // Title — split into NINJA / fruit / SLASH
    const titleStyle = {
      fontFamily: 'Arial Black, Arial',
      fontSize: '72px',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 8,
    };

    const ninjaText = this.add.text(GAME_WIDTH / 2, 120, 'NINJA', titleStyle).setOrigin(0.5);
    const slashText = this.add.text(GAME_WIDTH / 2, 280, 'SLASH', titleStyle).setOrigin(0.5);

    // Slashed fruit between the two words
    const fruits = ['\ud83c\udf4e', '\ud83c\udf4a', '\ud83c\udf49', '\ud83c\udf47', '\ud83e\udd6d', '\ud83c\udf4c', '\ud83c\udf53', '\ud83c\udf4b'];
    const fruit = Phaser.Utils.Array.GetRandom(fruits);
    const fruitContainer = this.add.container(GAME_WIDTH / 2, 200);

    const fruitEmoji = this.add.text(0, 0, fruit, { fontSize: '64px' }).setOrigin(0.5);
    fruitContainer.add(fruitEmoji);

    // Diagonal slash line across the fruit
    const slashLine = this.add.graphics();
    slashLine.lineStyle(4, 0xffffff, 0.9);
    slashLine.lineBetween(-40, 25, 40, -25);
    fruitContainer.add(slashLine);

    // Blade/katana — angled along the slash
    const blade = this.add.graphics();
    // Blade body
    blade.fillStyle(0xcccccc, 1);
    blade.beginPath();
    blade.moveTo(30, -18);
    blade.lineTo(70, -38);
    blade.lineTo(73, -35);
    blade.lineTo(33, -15);
    blade.closePath();
    blade.fillPath();
    // Blade edge highlight
    blade.lineStyle(1, 0xffffff, 0.6);
    blade.lineBetween(30, -18, 70, -38);
    // Handle
    blade.fillStyle(0x8B4513, 1);
    blade.fillRect(22, -14, 14, 6);
    // Guard
    blade.fillStyle(0xffd700, 1);
    blade.fillRect(20, -15, 4, 8);
    fruitContainer.add(blade);

    // Two halves separating — left half drifts down-left, right half drifts down-right
    const leftHalf = this.add.text(-8, 4, fruit, { fontSize: '64px' }).setOrigin(0.5);
    leftHalf.setCrop(0, 0, leftHalf.width / 2, leftHalf.height);
    leftHalf.setAlpha(0.5);
    fruitContainer.add(leftHalf);

    const rightHalf = this.add.text(8, -4, fruit, { fontSize: '64px' }).setOrigin(0.5);
    rightHalf.setCrop(rightHalf.width / 2, 0, rightHalf.width / 2, rightHalf.height);
    rightHalf.setAlpha(0.5);
    fruitContainer.add(rightHalf);

    // Animate the title group
    const titleGroup = this.add.container(0, 0, [ninjaText, fruitContainer, slashText]);
    this.tweens.add({
      targets: titleGroup,
      scale: 1.05,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Subtitle
    this.add.text(GAME_WIDTH / 2, 350, 'A Typing Adventure!', {
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

    // Creator credit
    this.add.text(GAME_WIDTH / 2, 710, 'Created by Alison Rainbow', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#8888aa',
    }).setOrigin(0.5);

    // Bookmark button
    const bmY = 740;
    const bmBtn = this.add.graphics();
    bmBtn.fillStyle(0x3498db, 1);
    bmBtn.fillRoundedRect(GAME_WIDTH / 2 - 70, bmY - 14, 140, 28, 6);

    const bmText = this.add.text(GAME_WIDTH / 2, bmY, '\ud83d\udd16 Bookmark', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#ffffff',
    }).setOrigin(0.5);

    const bmHit = this.add.rectangle(GAME_WIDTH / 2, bmY, 140, 28)
      .setInteractive({ useHandCursor: true })
      .setAlpha(0.001);

    bmHit.on('pointerover', () => {
      bmBtn.clear();
      bmBtn.fillStyle(0x2980b9, 1);
      bmBtn.fillRoundedRect(GAME_WIDTH / 2 - 70, bmY - 14, 140, 28, 6);
    });
    bmHit.on('pointerout', () => {
      bmBtn.clear();
      bmBtn.fillStyle(0x3498db, 1);
      bmBtn.fillRoundedRect(GAME_WIDTH / 2 - 70, bmY - 14, 140, 28, 6);
    });
    bmHit.on('pointerdown', () => {
      // Browsers don't allow programmatic bookmarking — show a helpful tip
      const isMac = /Mac|iPad|iPhone/.test(navigator.userAgent);
      const tip = isMac
        ? 'Press \u2318+D to bookmark this page!'
        : 'Press Ctrl+D to bookmark this page!';
      const msg = this.add.text(GAME_WIDTH / 2, bmY - 35, tip, {
        fontFamily: 'Arial',
        fontSize: '13px',
        color: '#ffffff',
        backgroundColor: '#333355',
        padding: { x: 10, y: 6 },
      }).setOrigin(0.5);
      this.tweens.add({
        targets: msg,
        alpha: 0,
        delay: 2500,
        duration: 500,
        onComplete: () => msg.destroy(),
      });
    });
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
