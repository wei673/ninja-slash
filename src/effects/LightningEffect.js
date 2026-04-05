import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig.js';

export class LightningEffect {
  static play(scene, x, y) {
    // Full-screen white flash overlay to mimic lightning
    const screenFlash = scene.add.graphics();
    screenFlash.fillStyle(0xffffff, 0.5);
    screenFlash.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    screenFlash.setDepth(1000);

    // Flash on, then off, then on again (double-flash like real lightning)
    scene.tweens.add({
      targets: screenFlash,
      alpha: 0,
      duration: 120,
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        scene.tweens.add({
          targets: screenFlash,
          alpha: 0,
          duration: 300,
          onComplete: () => screenFlash.destroy(),
        });
      },
    });

    // Yellow tint on camera too
    scene.cameras.main.flash(300, 255, 255, 150, false);

    // Lightning bolt at position — bigger and thicker
    const bolt = scene.add.graphics();
    bolt.setPosition(x, y);
    bolt.setDepth(1001);

    // Main bolt — thick bright line
    bolt.lineStyle(7, 0xffff00, 1);
    bolt.beginPath();
    bolt.moveTo(0, -120);
    bolt.lineTo(-15, -75);
    bolt.lineTo(10, -65);
    bolt.lineTo(-12, -30);
    bolt.lineTo(14, -20);
    bolt.lineTo(-8, 15);
    bolt.lineTo(8, 25);
    bolt.lineTo(0, 50);
    bolt.strokePath();

    // Inner white core — makes it pop
    bolt.lineStyle(3, 0xffffff, 0.9);
    bolt.beginPath();
    bolt.moveTo(0, -120);
    bolt.lineTo(-15, -75);
    bolt.lineTo(10, -65);
    bolt.lineTo(-12, -30);
    bolt.lineTo(14, -20);
    bolt.lineTo(-8, 15);
    bolt.lineTo(8, 25);
    bolt.lineTo(0, 50);
    bolt.strokePath();

    // Wide outer glow
    const glow = scene.add.graphics();
    glow.setPosition(x, y);
    glow.setDepth(1000);
    glow.lineStyle(20, 0xffff00, 0.15);
    glow.beginPath();
    glow.moveTo(0, -120);
    glow.lineTo(-15, -75);
    glow.lineTo(10, -65);
    glow.lineTo(-12, -30);
    glow.lineTo(14, -20);
    glow.lineTo(-8, 15);
    glow.lineTo(8, 25);
    glow.lineTo(0, 50);
    glow.strokePath();

    // Branch bolts (smaller forks off the main bolt)
    const branch = scene.add.graphics();
    branch.setPosition(x, y);
    branch.setDepth(1001);
    branch.lineStyle(3, 0xffff44, 0.8);
    // Branch 1
    branch.beginPath();
    branch.moveTo(-15, -75);
    branch.lineTo(-35, -60);
    branch.lineTo(-28, -45);
    branch.strokePath();
    // Branch 2
    branch.beginPath();
    branch.moveTo(14, -20);
    branch.lineTo(32, -12);
    branch.lineTo(28, 2);
    branch.strokePath();

    // Sparks — more and bigger
    for (let i = 0; i < 10; i++) {
      const spark = scene.add.graphics();
      spark.setDepth(1001);
      spark.fillStyle(0xffff66, 1);
      spark.fillCircle(0, 0, 2 + Math.random() * 4);
      spark.setPosition(
        x + Phaser.Math.Between(-30, 30),
        y + Phaser.Math.Between(-60, 30)
      );

      scene.tweens.add({
        targets: spark,
        x: spark.x + Phaser.Math.Between(-50, 50),
        y: spark.y + Phaser.Math.Between(-50, 50),
        alpha: 0,
        duration: 400 + Math.random() * 300,
        onComplete: () => spark.destroy(),
      });
    }

    // Fade out bolt — slower so it's visible
    scene.tweens.add({
      targets: [bolt, glow, branch],
      alpha: 0,
      duration: 500,
      delay: 200,
      onComplete: () => {
        bolt.destroy();
        glow.destroy();
        branch.destroy();
      },
    });
  }
}
