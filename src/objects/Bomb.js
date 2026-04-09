import Phaser from 'phaser';
import { SPAWN_AREA, GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig.js';

const FRUIT_TYPES = [
  { name: 'apple',      emoji: '\ud83c\udf4e' },
  { name: 'orange',     emoji: '\ud83c\udf4a' },
  { name: 'watermelon', emoji: '\ud83c\udf49' },
  { name: 'grape',      emoji: '\ud83c\udf47' },
  { name: 'mango',      emoji: '\ud83e\udd6d' },
  { name: 'banana',     emoji: '\ud83c\udf4c' },
  { name: 'strawberry', emoji: '\ud83c\udf53' },
  { name: 'lemon',      emoji: '\ud83c\udf4b' },
];

const FRUIT_RADIUS = 42;

export class Bomb extends Phaser.GameObjects.Container {
  constructor(scene, letter, spawnArea = SPAWN_AREA) {
    const x = Phaser.Math.Between(
      GAME_WIDTH * spawnArea.xMin,
      GAME_WIDTH * spawnArea.xMax
    );
    const y = Phaser.Math.Between(
      GAME_HEIGHT * spawnArea.yMin,
      GAME_HEIGHT * spawnArea.yMax
    );

    super(scene, x, y);
    this.letter = letter;
    this.scene = scene;
    this.exploded = false;

    const fruitType = Phaser.Utils.Array.GetRandom(FRUIT_TYPES);

    // Fruit emoji — looks exactly like a real fruit
    const emojiText = scene.add.text(0, 0, fruitType.emoji, {
      fontSize: `${FRUIT_RADIUS * 2}px`,
    }).setOrigin(0.5);
    this.add(emojiText);

    // Fuse poking out the top
    const fuse = scene.add.graphics();
    const fuseStartY = -FRUIT_RADIUS + 3;
    fuse.lineStyle(2.5, 0x555555, 0.85);
    fuse.beginPath();
    fuse.moveTo(0, fuseStartY);
    fuse.lineTo(-5, fuseStartY - 10);
    fuse.lineTo(4, fuseStartY - 18);
    fuse.lineTo(-3, fuseStartY - 26);
    fuse.lineTo(2, fuseStartY - 32);
    fuse.strokePath();

    // Spark at tip
    fuse.fillStyle(0xff8800, 0.7);
    fuse.fillCircle(2, fuseStartY - 32, 3);
    fuse.fillStyle(0xffcc00, 0.5);
    fuse.fillCircle(2, fuseStartY - 32, 5);
    this.add(fuse);

    // White circle behind letter — same as fruit
    const letterBg = scene.add.graphics();
    letterBg.fillStyle(0xffffff, 0.9);
    letterBg.fillCircle(0, 0, 20);
    this.add(letterBg);

    // Letter — same black as fruit
    const letterText = scene.add.text(0, 0, letter, {
      fontFamily: 'Arial Black, Arial',
      fontSize: '26px',
      color: '#000000',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.add(letterText);

    scene.add.existing(this);

    // Spawn animation — same as fruit
    this.setScale(0);
    this.setAlpha(0);
    scene.tweens.add({
      targets: this,
      scale: 1,
      alpha: 1,
      duration: 350,
      ease: 'Back.easeOut',
    });

    // Idle floating — same as fruit
    scene.tweens.add({
      targets: this,
      y: y - 10,
      duration: 900 + Math.random() * 300,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Gentle rotation — same as fruit
    scene.tweens.add({
      targets: this,
      angle: Phaser.Math.Between(-5, 5),
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  explode() {
    if (this.exploded) return;
    this.exploded = true;

    const x = this.x;
    const y = this.y;

    this.scene.tweens.killTweensOf(this);

    // Explosion — expanding fireball
    const fireball = this.scene.add.graphics();
    fireball.fillStyle(0xff4400, 1);
    fireball.fillCircle(x, y, 10);
    this.scene.tweens.add({
      targets: fireball,
      scale: 6,
      alpha: 0,
      duration: 400,
      onComplete: () => fireball.destroy(),
    });

    // Inner white flash
    const flash = this.scene.add.graphics();
    flash.fillStyle(0xffffff, 0.8);
    flash.fillCircle(x, y, 8);
    this.scene.tweens.add({
      targets: flash,
      scale: 4,
      alpha: 0,
      duration: 250,
      onComplete: () => flash.destroy(),
    });

    // Debris particles
    const debrisColors = [0xff4400, 0xff6600, 0xffaa00, 0x333333, 0x555555];
    for (let i = 0; i < 12; i++) {
      const debris = this.scene.add.graphics();
      const color = Phaser.Utils.Array.GetRandom(debrisColors);
      debris.fillStyle(color, 1);
      const size = 3 + Math.random() * 6;
      debris.fillRect(-size / 2, -size / 2, size, size);
      debris.setPosition(x, y);

      const angle = (Math.PI * 2 * i) / 12;
      const speed = 60 + Math.random() * 80;

      this.scene.tweens.add({
        targets: debris,
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed + 30,
        alpha: 0,
        rotation: Math.random() * 4,
        duration: 500 + Math.random() * 300,
        onComplete: () => debris.destroy(),
      });
    }

    // Smoke puffs
    for (let i = 0; i < 4; i++) {
      const smoke = this.scene.add.graphics();
      smoke.fillStyle(0x555555, 0.4);
      smoke.fillCircle(0, 0, 12 + Math.random() * 10);
      smoke.setPosition(
        x + Phaser.Math.Between(-15, 15),
        y + Phaser.Math.Between(-15, 15)
      );

      this.scene.tweens.add({
        targets: smoke,
        y: smoke.y - 40,
        scale: 2,
        alpha: 0,
        duration: 600 + Math.random() * 400,
        onComplete: () => smoke.destroy(),
      });
    }

    // Screen shake
    this.scene.cameras.main.shake(300, 0.015);

    this.destroy();
  }

  expire() {
    if (this.exploded) return;
    this.scene.tweens.killTweensOf(this);
    this.scene.tweens.add({
      targets: this,
      scale: 0,
      alpha: 0,
      duration: 200,
      ease: 'Power2',
      onComplete: () => this.destroy(),
    });
  }
}
