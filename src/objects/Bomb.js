import Phaser from 'phaser';
import { SPAWN_AREA, GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig.js';

// Reuse the same fruit types so bombs look like real fruits
const FRUIT_TYPES = [
  { name: 'apple',      color: 0xe74c3c, highlight: 0xff6b6b, leafColor: 0x27ae60 },
  { name: 'orange',     color: 0xf39c12, highlight: 0xf5b041, leafColor: 0x27ae60 },
  { name: 'watermelon', color: 0x2ecc71, highlight: 0x58d68d, leafColor: null },
  { name: 'grape',      color: 0x9b59b6, highlight: 0xbb8fce, leafColor: 0x27ae60 },
  { name: 'mango',      color: 0xe67e22, highlight: 0xf0b27a, leafColor: 0x27ae60 },
  { name: 'blueberry',  color: 0x3498db, highlight: 0x5dade2, leafColor: null },
  { name: 'strawberry', color: 0xc0392b, highlight: 0xe74c3c, leafColor: 0x27ae60 },
  { name: 'lemon',      color: 0xf1c40f, highlight: 0xf7dc6f, leafColor: 0x27ae60 },
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

    // Fruit body — looks exactly like a real fruit
    const body = scene.add.graphics();
    body.fillStyle(fruitType.color, 1);
    body.fillCircle(0, 0, FRUIT_RADIUS);
    this.add(body);

    // Highlight (same as real fruit)
    const highlight = scene.add.graphics();
    highlight.fillStyle(fruitType.highlight, 0.5);
    highlight.fillEllipse(-12, -14, 18, 12);
    this.add(highlight);

    // Leaf/stem — same as real fruit
    if (fruitType.leafColor) {
      const stem = scene.add.graphics();
      stem.lineStyle(3, 0x6B4226, 1);
      stem.lineBetween(0, -FRUIT_RADIUS + 5, 2, -FRUIT_RADIUS - 5);
      stem.fillStyle(fruitType.leafColor, 1);
      stem.fillEllipse(8, -FRUIT_RADIUS + 2, 14, 8);
      this.add(stem);
    }

    // The wire/fuse poking out the top — longer and more visible
    const fuse = scene.add.graphics();
    const fuseStartX = fruitType.leafColor ? -6 : 0;
    const fuseStartY = -FRUIT_RADIUS + 3;
    fuse.lineStyle(2.5, 0x555555, 0.85);
    fuse.beginPath();
    fuse.moveTo(fuseStartX, fuseStartY);
    fuse.lineTo(fuseStartX - 5, fuseStartY - 10);
    fuse.lineTo(fuseStartX + 4, fuseStartY - 18);
    fuse.lineTo(fuseStartX - 3, fuseStartY - 26);
    fuse.lineTo(fuseStartX + 2, fuseStartY - 32);
    fuse.strokePath();

    // Spark at tip
    fuse.fillStyle(0xff8800, 0.7);
    fuse.fillCircle(fuseStartX + 2, fuseStartY - 32, 3);
    fuse.fillStyle(0xffcc00, 0.5);
    fuse.fillCircle(fuseStartX + 2, fuseStartY - 32, 5);
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
