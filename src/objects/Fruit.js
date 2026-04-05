import Phaser from 'phaser';
import { SPAWN_AREA, GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig.js';

const FRUIT_TYPES = [
  { name: 'apple',      color: 0xe74c3c, highlight: 0xff6b6b, leafColor: 0x27ae60, juiceColor: 0xff4444 },
  { name: 'orange',     color: 0xf39c12, highlight: 0xf5b041, leafColor: 0x27ae60, juiceColor: 0xffa500 },
  { name: 'watermelon', color: 0x2ecc71, highlight: 0x58d68d, leafColor: null,      juiceColor: 0xff6b6b },
  { name: 'grape',      color: 0x9b59b6, highlight: 0xbb8fce, leafColor: 0x27ae60, juiceColor: 0xc39bd3 },
  { name: 'mango',      color: 0xe67e22, highlight: 0xf0b27a, leafColor: 0x27ae60, juiceColor: 0xffc04d },
  { name: 'blueberry',  color: 0x3498db, highlight: 0x5dade2, leafColor: null,      juiceColor: 0x5dade2 },
  { name: 'strawberry', color: 0xc0392b, highlight: 0xe74c3c, leafColor: 0x27ae60, juiceColor: 0xff4444 },
  { name: 'lemon',      color: 0xf1c40f, highlight: 0xf7dc6f, leafColor: 0x27ae60, juiceColor: 0xfff44d },
];

const FRUIT_RADIUS = 42;

export class Fruit extends Phaser.GameObjects.Container {
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

    const fruitType = Phaser.Utils.Array.GetRandom(FRUIT_TYPES);
    this.fruitType = fruitType;

    // Fruit body
    const body = scene.add.graphics();
    body.fillStyle(fruitType.color, 1);
    body.fillCircle(0, 0, FRUIT_RADIUS);
    this.add(body);

    // Highlight (shine effect)
    const highlight = scene.add.graphics();
    highlight.fillStyle(fruitType.highlight, 0.5);
    highlight.fillEllipse(-12, -14, 18, 12);
    this.add(highlight);

    // Leaf/stem on top (if applicable)
    if (fruitType.leafColor) {
      const stem = scene.add.graphics();
      stem.lineStyle(3, 0x6B4226, 1);
      stem.lineBetween(0, -FRUIT_RADIUS + 5, 2, -FRUIT_RADIUS - 5);
      stem.fillStyle(fruitType.leafColor, 1);
      stem.fillEllipse(8, -FRUIT_RADIUS + 2, 14, 8);
      this.add(stem);
    }

    // Watermelon stripes
    if (fruitType.name === 'watermelon') {
      const stripes = scene.add.graphics();
      stripes.lineStyle(3, 0x1a9c54, 0.5);
      for (let i = -2; i <= 2; i++) {
        const sx = i * 14;
        stripes.beginPath();
        stripes.moveTo(sx, -FRUIT_RADIUS + 10);
        stripes.lineTo(sx + 3, FRUIT_RADIUS - 10);
        stripes.strokePath();
      }
      this.add(stripes);
    }

    // Strawberry seeds
    if (fruitType.name === 'strawberry') {
      const seeds = scene.add.graphics();
      seeds.fillStyle(0xf1c40f, 0.7);
      const seedPositions = [[-8, -8], [8, -5], [-5, 8], [10, 10], [0, 0], [-12, 5]];
      seedPositions.forEach(([sx, sy]) => {
        seeds.fillEllipse(sx, sy, 3, 4);
      });
      this.add(seeds);
    }

    // White circle behind letter
    const letterBg = scene.add.graphics();
    letterBg.fillStyle(0xffffff, 0.9);
    letterBg.fillCircle(0, 0, 20);
    this.add(letterBg);

    // Letter text
    const letterText = scene.add.text(0, 0, letter, {
      fontFamily: 'Arial Black, Arial',
      fontSize: '26px',
      color: '#000000',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.add(letterText);

    scene.add.existing(this);

    // Spawn animation — bounce in
    this.setScale(0);
    this.setAlpha(0);
    scene.tweens.add({
      targets: this,
      scale: 1,
      alpha: 1,
      duration: 350,
      ease: 'Back.easeOut',
    });

    // Idle floating
    scene.tweens.add({
      targets: this,
      y: y - 10,
      duration: 900 + Math.random() * 300,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Gentle rotation
    scene.tweens.add({
      targets: this,
      angle: Phaser.Math.Between(-5, 5),
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  slash() {
    const x = this.x;
    const y = this.y;
    const color = this.fruitType.juiceColor;

    this.scene.tweens.killTweensOf(this);

    // Split into two halves flying apart
    const leftHalf = this.scene.add.graphics();
    leftHalf.fillStyle(this.fruitType.color, 1);
    leftHalf.beginPath();
    leftHalf.arc(0, 0, FRUIT_RADIUS, Math.PI * 0.5, Math.PI * 1.5, false);
    leftHalf.closePath();
    leftHalf.fillPath();
    // Inner flesh
    leftHalf.fillStyle(color, 0.6);
    leftHalf.beginPath();
    leftHalf.arc(0, 0, FRUIT_RADIUS - 6, Math.PI * 0.5, Math.PI * 1.5, false);
    leftHalf.closePath();
    leftHalf.fillPath();
    leftHalf.setPosition(x, y);

    const rightHalf = this.scene.add.graphics();
    rightHalf.fillStyle(this.fruitType.color, 1);
    rightHalf.beginPath();
    rightHalf.arc(0, 0, FRUIT_RADIUS, -Math.PI * 0.5, Math.PI * 0.5, false);
    rightHalf.closePath();
    rightHalf.fillPath();
    rightHalf.fillStyle(color, 0.6);
    rightHalf.beginPath();
    rightHalf.arc(0, 0, FRUIT_RADIUS - 6, -Math.PI * 0.5, Math.PI * 0.5, false);
    rightHalf.closePath();
    rightHalf.fillPath();
    rightHalf.setPosition(x, y);

    // Animate halves flying apart
    this.scene.tweens.add({
      targets: leftHalf,
      x: x - 60,
      y: y + 80,
      angle: -30,
      alpha: 0,
      scale: 0.5,
      duration: 450,
      ease: 'Power2',
      onComplete: () => leftHalf.destroy(),
    });

    this.scene.tweens.add({
      targets: rightHalf,
      x: x + 60,
      y: y + 80,
      angle: 30,
      alpha: 0,
      scale: 0.5,
      duration: 450,
      ease: 'Power2',
      onComplete: () => rightHalf.destroy(),
    });

    // Juice droplets
    for (let i = 0; i < 6; i++) {
      const drop = this.scene.add.graphics();
      drop.fillStyle(color, 0.8);
      drop.fillCircle(0, 0, 2 + Math.random() * 4);
      drop.setPosition(x, y);

      const angle = Math.random() * Math.PI * 2;
      const dist = 40 + Math.random() * 50;

      this.scene.tweens.add({
        targets: drop,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist + 30,
        alpha: 0,
        duration: 300 + Math.random() * 200,
        onComplete: () => drop.destroy(),
      });
    }

    this.destroy();
  }

  miss(ninjaX, ninjaY) {
    this.scene.tweens.killTweensOf(this);

    const startX = this.x;
    const startY = this.y;

    // Arc trajectory toward ninja
    this.scene.tweens.add({
      targets: this,
      x: ninjaX,
      y: ninjaY,
      scale: 0.6,
      angle: 360,
      duration: 450,
      ease: 'Power2.easeIn',
      onComplete: () => {
        // Splat effect at ninja position
        this.createSplat(ninjaX, ninjaY);
        this.destroy();
      },
    });
  }

  createSplat(x, y) {
    const color = this.fruitType.juiceColor;

    // Central splat
    const splat = this.scene.add.graphics();
    splat.fillStyle(color, 0.7);
    splat.fillCircle(x, y, 15);

    // Splatter drops
    for (let i = 0; i < 5; i++) {
      const dx = Phaser.Math.Between(-25, 25);
      const dy = Phaser.Math.Between(-25, 25);
      splat.fillCircle(x + dx, y + dy, 3 + Math.random() * 5);
    }

    this.scene.tweens.add({
      targets: splat,
      alpha: 0,
      duration: 600,
      delay: 200,
      onComplete: () => splat.destroy(),
    });
  }
}
