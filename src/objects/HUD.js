import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig.js';

const HUD_HEIGHT = 70;
const HUD_Y = GAME_HEIGHT - HUD_HEIGHT;
const BAR_WIDTH = 280;
const BAR_HEIGHT = 22;
const BAR_X = 80;
const BAR_Y = HUD_Y + 30;

export class HUD {
  constructor(scene, maxHP, level, totalFruits) {
    this.scene = scene;
    this.maxHP = maxHP;
    this.targetHP = maxHP;
    this.displayHP = maxHP;
    this.totalFruits = totalFruits;

    // HUD background panel
    const panel = scene.add.graphics();
    panel.fillStyle(0x000000, 0.5);
    panel.fillRoundedRect(0, HUD_Y, GAME_WIDTH, HUD_HEIGHT, { tl: 0, tr: 0, bl: 0, br: 0 });
    panel.lineStyle(2, 0x555555, 0.6);
    panel.lineBetween(0, HUD_Y, GAME_WIDTH, HUD_Y);

    // Heart icon before HP bar
    const heart = scene.add.graphics();
    heart.fillStyle(0xe74c3c, 1);
    // Simple heart shape
    heart.fillCircle(30, BAR_Y + BAR_HEIGHT / 2 - 3, 8);
    heart.fillCircle(42, BAR_Y + BAR_HEIGHT / 2 - 3, 8);
    heart.fillTriangle(22, BAR_Y + BAR_HEIGHT / 2, 50, BAR_Y + BAR_HEIGHT / 2, 36, BAR_Y + BAR_HEIGHT / 2 + 14);
    this.heart = heart;

    // HP label
    this.hpLabel = scene.add.text(BAR_X, BAR_Y - 18, 'HP', {
      fontFamily: 'Arial',
      fontSize: '12px',
      color: '#aaaaaa',
    });

    // Background bar with border
    this.barBg = scene.add.graphics();
    this.barBg.fillStyle(0x1a1a1a, 1);
    this.barBg.fillRoundedRect(BAR_X, BAR_Y, BAR_WIDTH, BAR_HEIGHT, 5);
    this.barBg.lineStyle(1, 0x555555, 0.8);
    this.barBg.strokeRoundedRect(BAR_X, BAR_Y, BAR_WIDTH, BAR_HEIGHT, 5);

    // Damage flash overlay (hidden initially)
    this.damageFlash = scene.add.graphics();
    this.damageFlash.fillStyle(0xff0000, 0.4);
    this.damageFlash.fillRoundedRect(BAR_X, BAR_Y, BAR_WIDTH, BAR_HEIGHT, 5);
    this.damageFlash.setAlpha(0);

    // Health bar
    this.bar = scene.add.graphics();
    this.drawBar();

    // HP text on bar
    this.hpText = scene.add.text(BAR_X + BAR_WIDTH / 2, BAR_Y + BAR_HEIGHT / 2, `${maxHP} / ${maxHP}`, {
      fontFamily: 'Arial',
      fontSize: '13px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    // Level text (center)
    this.levelText = scene.add.text(GAME_WIDTH / 2, HUD_Y + 8, `LEVEL ${level}`, {
      fontFamily: 'Arial Black, Arial',
      fontSize: '14px',
      color: '#ffd700',
      letterSpacing: 2,
    }).setOrigin(0.5, 0);

    // Fruit counter (right side)
    // Fruit icon
    const fruitIcon = scene.add.graphics();
    fruitIcon.fillStyle(0xe74c3c, 1);
    fruitIcon.fillCircle(GAME_WIDTH - 160, BAR_Y + BAR_HEIGHT / 2, 10);
    fruitIcon.fillStyle(0x27ae60, 1);
    fruitIcon.fillEllipse(GAME_WIDTH - 154, BAR_Y + BAR_HEIGHT / 2 - 10, 8, 4);

    this.counterText = scene.add.text(GAME_WIDTH - 140, BAR_Y + BAR_HEIGHT / 2, '0 / ' + totalFruits, {
      fontFamily: 'Arial Black, Arial',
      fontSize: '18px',
      color: '#ffffff',
    }).setOrigin(0, 0.5);

    // Slash counter label
    scene.add.text(GAME_WIDTH - 160, BAR_Y - 18, 'SLASHED', {
      fontFamily: 'Arial',
      fontSize: '12px',
      color: '#aaaaaa',
    });
  }

  setHP(hp) {
    this.targetHP = Math.max(0, hp);
  }

  setFruitCount(slashed) {
    this.counterText.setText(`${slashed} / ${this.totalFruits}`);

    // Brief scale pop on counter
    this.scene.tweens.add({
      targets: this.counterText,
      scale: 1.3,
      duration: 100,
      yoyo: true,
    });
  }

  update() {
    const diff = this.targetHP - this.displayHP;
    if (Math.abs(diff) < 0.01) {
      this.displayHP = this.targetHP;
    } else {
      this.displayHP += diff * 0.12;
    }
    this.drawBar();

    // Update HP text
    this.hpText.setText(`${Math.ceil(this.displayHP * 4) / 4} / ${this.maxHP}`);
  }

  drawBar() {
    this.bar.clear();
    const ratio = this.displayHP / this.maxHP;
    const width = BAR_WIDTH * ratio;

    if (width <= 0) return;

    const color = this.getBarColor(ratio);
    this.bar.fillStyle(color, 1);
    this.bar.fillRoundedRect(BAR_X, BAR_Y, Math.max(4, width), BAR_HEIGHT, 5);

    // Subtle inner highlight
    this.bar.fillStyle(0xffffff, 0.15);
    this.bar.fillRoundedRect(BAR_X + 2, BAR_Y + 2, Math.max(2, width - 4), BAR_HEIGHT / 2 - 2, 3);
  }

  getBarColor(ratio) {
    if (ratio > 0.6) {
      const t = (ratio - 0.6) / 0.4;
      return Phaser.Display.Color.GetColor(
        Math.round(255 * (1 - t)),
        Math.round(200 + 55 * t),
        50
      );
    } else if (ratio > 0.3) {
      const t = (ratio - 0.3) / 0.3;
      return Phaser.Display.Color.GetColor(
        255,
        Math.round(120 + 80 * t),
        50
      );
    } else {
      const t = ratio / 0.3;
      return Phaser.Display.Color.GetColor(
        255,
        Math.round(60 * t),
        Math.round(30 * t)
      );
    }
  }

  flashDamage() {
    // Flash the damage overlay on the bar
    this.damageFlash.setAlpha(1);
    this.scene.tweens.add({
      targets: this.damageFlash,
      alpha: 0,
      duration: 300,
    });

    // Shake the heart
    this.scene.tweens.add({
      targets: this.heart,
      x: 3,
      duration: 50,
      yoyo: true,
      repeat: 2,
    });

    // Subtle red edge vignette
    this.scene.cameras.main.flash(120, 200, 30, 30, false);
  }
}
