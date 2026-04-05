import Phaser from 'phaser';

const PARTICLE_COUNT = 8;

export class SlashEffect {
  static play(scene, x, y, color = 0xffffff) {
    // Two diagonal slash lines (X shape)
    const slash = scene.add.graphics();
    slash.lineStyle(4, 0xffffff, 1);
    slash.lineBetween(x - 35, y - 35, x + 35, y + 35);
    slash.lineBetween(x + 35, y - 35, x - 35, y + 35);

    // Inner glow line
    const glow = scene.add.graphics();
    glow.lineStyle(8, 0xffffff, 0.3);
    glow.lineBetween(x - 35, y - 35, x + 35, y + 35);
    glow.lineBetween(x + 35, y - 35, x - 35, y + 35);

    scene.tweens.add({
      targets: [slash, glow],
      alpha: 0,
      scale: 1.5,
      duration: 300,
      onComplete: () => {
        slash.destroy();
        glow.destroy();
      },
    });

    // Juice particles flying outward
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = (Math.PI * 2 * i) / PARTICLE_COUNT + Math.random() * 0.5;
      const speed = 80 + Math.random() * 60;
      const size = 3 + Math.random() * 5;

      const particle = scene.add.graphics();
      particle.fillStyle(color, 1);
      particle.fillCircle(0, 0, size);
      particle.setPosition(x, y);

      scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed,
        alpha: 0,
        scale: 0.3,
        duration: 350 + Math.random() * 200,
        onComplete: () => particle.destroy(),
      });
    }

    // Brief expanding ring
    const ring = scene.add.graphics();
    ring.lineStyle(3, 0xffffff, 0.6);
    ring.strokeCircle(x, y, 10);

    scene.tweens.add({
      targets: ring,
      scale: 4,
      alpha: 0,
      duration: 350,
      onComplete: () => ring.destroy(),
    });
  }
}
