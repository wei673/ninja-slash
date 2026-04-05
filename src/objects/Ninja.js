import Phaser from 'phaser';
import { CHARACTERS } from '../config/characters.js';

const BODY_W = 50;
const BODY_H = 65;
const HEAD_R = 22;
const EYE_R = 4;

export class Ninja {
  constructor(scene, characterId, x, y) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.state = 'idle';

    const charDef = CHARACTERS.find(c => c.id === characterId) || CHARACTERS[0];
    this.charDef = charDef;

    this.container = scene.add.container(x, y);
    this.buildSprite(charDef);
    this.startIdle();
  }

  buildSprite(charDef) {
    // Shadow
    const shadow = this.scene.add.graphics();
    shadow.fillStyle(0x000000, 0.2);
    shadow.fillEllipse(0, BODY_H / 2 + 10, BODY_W + 10, 14);
    this.container.add(shadow);

    // Body
    this.bodyGfx = this.scene.add.graphics();
    this.bodyGfx.fillStyle(charDef.color, 1);
    this.bodyGfx.fillRoundedRect(-BODY_W / 2, -BODY_H / 2, BODY_W, BODY_H, 12);
    this.container.add(this.bodyGfx);

    // Spots/stripes for certain animals
    if (charDef.id === 'tiger') {
      const stripes = this.scene.add.graphics();
      stripes.lineStyle(4, 0x222222, 0.6);
      for (let i = 0; i < 3; i++) {
        const sy = -BODY_H / 2 + 18 + i * 18;
        stripes.lineBetween(-12, sy, 12, sy);
      }
      this.container.add(stripes);
    } else if (charDef.id === 'cow') {
      const spots = this.scene.add.graphics();
      spots.fillStyle(0x333333, 0.6);
      spots.fillCircle(-8, -10, 7);
      spots.fillCircle(10, 5, 9);
      spots.fillCircle(-5, 15, 6);
      this.container.add(spots);
    } else if (charDef.id === 'cheetah') {
      const spots = this.scene.add.graphics();
      spots.fillStyle(0x8B6914, 0.5);
      spots.fillCircle(-10, -8, 4);
      spots.fillCircle(8, -12, 3);
      spots.fillCircle(-4, 8, 4);
      spots.fillCircle(12, 5, 3);
      spots.fillCircle(0, 18, 4);
      this.container.add(spots);
    }

    // Head
    this.headGfx = this.scene.add.graphics();
    this.headGfx.fillStyle(charDef.color, 1);
    this.headGfx.fillCircle(0, 0, HEAD_R);
    this.headGfx.setPosition(0, -BODY_H / 2 - HEAD_R + 5);
    this.container.add(this.headGfx);

    // Ears (different per animal)
    this.buildEars(charDef);

    // Ninja mask (black band across eyes)
    const mask = this.scene.add.graphics();
    const maskY = -BODY_H / 2 - HEAD_R + 3;
    mask.fillStyle(0x222222, 0.85);
    mask.fillRect(-HEAD_R - 4, maskY, HEAD_R * 2 + 8, 13);
    // Mask tails flowing right
    mask.fillStyle(0x222222, 0.7);
    mask.fillRect(HEAD_R + 2, maskY + 1, 16, 5);
    mask.fillRect(HEAD_R + 2, maskY + 7, 12, 4);
    this.container.add(mask);

    // Eyes (white on mask)
    this.eyeL = this.scene.add.graphics();
    this.eyeL.fillStyle(0xffffff, 1);
    this.eyeL.fillCircle(0, 0, EYE_R);
    this.eyeL.setPosition(-8, maskY + 6);
    this.container.add(this.eyeL);

    this.eyeR = this.scene.add.graphics();
    this.eyeR.fillStyle(0xffffff, 1);
    this.eyeR.fillCircle(0, 0, EYE_R);
    this.eyeR.setPosition(8, maskY + 6);
    this.container.add(this.eyeR);

    // Pupils
    this.pupilL = this.scene.add.graphics();
    this.pupilL.fillStyle(0x000000, 1);
    this.pupilL.fillCircle(0, 0, 2);
    this.pupilL.setPosition(-7, maskY + 6);
    this.container.add(this.pupilL);

    this.pupilR = this.scene.add.graphics();
    this.pupilR.fillStyle(0x000000, 1);
    this.pupilR.fillCircle(0, 0, 2);
    this.pupilR.setPosition(9, maskY + 6);
    this.container.add(this.pupilR);

    // Katana sword (on the back, angled diagonally)
    this.sword = this.scene.add.graphics();
    const swordX = 15;
    const swordTopY = -BODY_H / 2 - 55;
    const swordBottomY = -BODY_H / 2 + 15;
    // Blade (silver, slightly curved)
    this.sword.lineStyle(4, 0xcccccc, 1);
    this.sword.lineBetween(swordX - 2, swordTopY, swordX + 3, swordBottomY - 18);
    // Blade edge highlight
    this.sword.lineStyle(1.5, 0xffffff, 0.6);
    this.sword.lineBetween(swordX - 3, swordTopY + 2, swordX + 2, swordBottomY - 18);
    // Guard (cross piece)
    this.sword.lineStyle(3, 0xffd700, 1);
    this.sword.lineBetween(swordX - 6, swordBottomY - 18, swordX + 10, swordBottomY - 22);
    // Handle (wrapped brown)
    this.sword.lineStyle(5, 0x5C3317, 1);
    this.sword.lineBetween(swordX + 4, swordBottomY - 16, swordX + 6, swordBottomY);
    // Handle wrapping lines
    this.sword.lineStyle(1, 0x3a1f0d, 0.6);
    for (let w = 0; w < 3; w++) {
      const wy = swordBottomY - 14 + w * 5;
      this.sword.lineBetween(swordX + 2, wy, swordX + 8, wy + 1);
    }
    // Pommel (end cap)
    this.sword.fillStyle(0xffd700, 1);
    this.sword.fillCircle(swordX + 6, swordBottomY + 2, 3);
    this.container.add(this.sword);

    // Slash arm (hidden initially)
    this.slashArm = this.scene.add.graphics();
    this.slashArm.setVisible(false);
    this.container.add(this.slashArm);

    // Name tag
    this.scene.add.text(this.x, this.y + BODY_H / 2 + 25, charDef.name, {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Tail for animals that have one
    this.buildTail(charDef);
  }

  buildEars(charDef) {
    const ears = this.scene.add.graphics();
    const earY = -BODY_H / 2 - HEAD_R * 2 + 8;

    switch (charDef.id) {
      case 'cat':
      case 'cheetah':
      case 'tiger':
      case 'lion':
        // Pointed ears
        ears.fillStyle(charDef.color, 1);
        ears.fillTriangle(-HEAD_R + 4, earY + 14, -HEAD_R + 12, earY, -HEAD_R + 20, earY + 14);
        ears.fillTriangle(HEAD_R - 4, earY + 14, HEAD_R - 12, earY, HEAD_R - 20, earY + 14);
        if (charDef.id === 'lion') {
          // Mane
          const mane = this.scene.add.graphics();
          mane.fillStyle(0xB8860B, 0.6);
          mane.fillCircle(0, -BODY_H / 2 - HEAD_R + 5, HEAD_R + 8);
          this.container.addAt(mane, 2); // behind head
        }
        break;
      case 'dog':
        // Floppy ears
        ears.fillStyle(charDef.color, 0.8);
        ears.fillEllipse(-HEAD_R + 2, earY + 20, 12, 20);
        ears.fillEllipse(HEAD_R - 2, earY + 20, 12, 20);
        break;
      case 'cow':
      case 'sheep':
        // Small round ears
        ears.fillStyle(charDef.color, 0.8);
        ears.fillCircle(-HEAD_R + 4, earY + 14, 8);
        ears.fillCircle(HEAD_R - 4, earY + 14, 8);
        if (charDef.id === 'sheep') {
          // Fluffy wool on head
          const wool = this.scene.add.graphics();
          wool.fillStyle(0xe8e8e8, 0.7);
          for (let i = 0; i < 5; i++) {
            wool.fillCircle(
              Phaser.Math.Between(-12, 12),
              -BODY_H / 2 - HEAD_R * 2 + 12 + Phaser.Math.Between(0, 8),
              7
            );
          }
          this.container.add(wool);
        }
        break;
      case 'rat':
      case 'monkey':
        // Round ears
        ears.fillStyle(charDef.id === 'monkey' ? 0xDEB887 : 0xccaaaa, 1);
        ears.fillCircle(-HEAD_R, earY + 16, 10);
        ears.fillCircle(HEAD_R, earY + 16, 10);
        break;
      case 'alligator':
        // No visible ears, just bumps
        ears.fillStyle(0x1a6b3a, 0.8);
        ears.fillCircle(-10, earY + 12, 5);
        ears.fillCircle(10, earY + 12, 5);
        break;
    }

    this.container.add(ears);
  }

  buildTail(charDef) {
    const tail = this.scene.add.graphics();
    const tailX = BODY_W / 2;
    const tailY = BODY_H / 2 - 10;

    switch (charDef.id) {
      case 'cat':
      case 'cheetah':
      case 'tiger':
      case 'lion':
        tail.lineStyle(5, charDef.color, 0.8);
        tail.beginPath();
        tail.moveTo(tailX - 5, tailY - 15);
        tail.lineTo(tailX + 10, tailY - 25);
        tail.lineTo(tailX + 5, tailY - 35);
        tail.strokePath();
        break;
      case 'monkey':
        tail.lineStyle(4, charDef.color, 0.8);
        tail.beginPath();
        tail.moveTo(tailX - 5, tailY - 15);
        tail.lineTo(tailX + 12, tailY - 20);
        tail.lineTo(tailX + 8, tailY - 32);
        tail.lineTo(tailX + 14, tailY - 38);
        tail.strokePath();
        break;
      case 'alligator':
        tail.fillStyle(0x2e8b57, 0.8);
        tail.fillTriangle(tailX - 5, tailY - 10, tailX + 20, tailY - 18, tailX - 5, tailY - 25);
        break;
      case 'rat':
        tail.lineStyle(2, 0xccaaaa, 0.8);
        tail.beginPath();
        tail.moveTo(tailX - 5, tailY - 15);
        tail.lineTo(tailX + 15, tailY - 25);
        tail.strokePath();
        break;
      default:
        // Dog, cow, sheep — small stub
        tail.fillStyle(charDef.color, 0.6);
        tail.fillCircle(tailX, tailY - 18, 5);
        break;
    }

    this.container.add(tail);
  }

  startIdle() {
    // Gentle bobbing
    this.idleTween = this.scene.tweens.add({
      targets: this.container,
      y: this.y - 6,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Slow side-to-side walk
    this.walkTween = this.scene.tweens.add({
      targets: this.container,
      x: this.x + 15,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  stopIdle() {
    if (this.idleTween) this.idleTween.stop();
    if (this.walkTween) this.walkTween.stop();
  }

  playSlash(targetX, targetY) {
    if (this.state !== 'idle') return;
    this.state = 'slash';
    this.stopIdle();

    const startX = this.container.x;
    const startY = this.container.y;

    // Position near the fruit (offset slightly so ninja is beside it)
    const dx = targetX - startX;
    const dy = targetY - startY;
    const len = Math.sqrt(dx * dx + dy * dy);
    const arriveX = targetX - (dx / len) * 40;
    const arriveY = targetY - (dy / len) * 40;

    // Phase 1: Dash to the fruit (fast)
    this.scene.tweens.add({
      targets: this.container,
      x: arriveX,
      y: arriveY,
      duration: 120,
      ease: 'Power3.easeIn',
      onComplete: () => {
        // Phase 2: Slash arc — swing the sword
        this.drawSlashArc(targetX - arriveX, targetY - arriveY);

        // Spin the ninja slightly during slash
        this.scene.tweens.add({
          targets: this.container,
          angle: -30,
          duration: 80,
          yoyo: true,
          onComplete: () => {
            this.container.setAngle(0);
          },
        });

        // Phase 3: Dash back to home position
        this.scene.tweens.add({
          targets: this.container,
          x: this.x,
          y: this.y,
          duration: 180,
          delay: 100,
          ease: 'Power2.easeOut',
          onComplete: () => {
            this.slashArm.clear();
            this.slashArm.setVisible(false);
            this.state = 'idle';
            this.startIdle();
          },
        });
      },
    });
  }

  drawSlashArc(dirX, dirY) {
    this.slashArm.clear();
    this.slashArm.setVisible(true);

    // Sword blade slash arc
    const angle = Math.atan2(dirY, dirX);

    // Draw a curved slash line (arc from top-right to bottom-left)
    this.slashArm.lineStyle(5, 0xcccccc, 1);
    this.slashArm.beginPath();
    const arcRadius = 55;
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      const a = angle - Math.PI * 0.4 + t * Math.PI * 0.8;
      const px = Math.cos(a) * arcRadius;
      const py = Math.sin(a) * arcRadius;
      if (i === 0) {
        this.slashArm.moveTo(px, py);
      } else {
        this.slashArm.lineTo(px, py);
      }
    }
    this.slashArm.strokePath();

    // White blade edge highlight
    this.slashArm.lineStyle(2, 0xffffff, 0.7);
    this.slashArm.beginPath();
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      const a = angle - Math.PI * 0.4 + t * Math.PI * 0.8;
      const px = Math.cos(a) * (arcRadius - 3);
      const py = Math.sin(a) * (arcRadius - 3);
      if (i === 0) {
        this.slashArm.moveTo(px, py);
      } else {
        this.slashArm.lineTo(px, py);
      }
    }
    this.slashArm.strokePath();

    // Fade out the slash arc
    this.scene.tweens.add({
      targets: this.slashArm,
      alpha: 0,
      duration: 200,
      delay: 80,
      onComplete: () => {
        this.slashArm.setAlpha(1);
        this.slashArm.clear();
        this.slashArm.setVisible(false);
      },
    });
  }

  playHit() {
    if (this.state === 'hit') return;
    this.state = 'hit';
    this.stopIdle();

    // Knockback
    this.scene.tweens.add({
      targets: this.container,
      x: this.x + 20,
      duration: 100,
      yoyo: true,
      onComplete: () => {
        this.container.setPosition(this.x, this.y);
        this.state = 'idle';
        this.startIdle();
      },
    });

    // Red flash on the ninja
    const flash = this.scene.add.graphics();
    flash.fillStyle(0xff0000, 0.4);
    flash.fillRoundedRect(-BODY_W / 2 - 5, -BODY_H / 2 - HEAD_R - 5, BODY_W + 10, BODY_H + HEAD_R * 2 + 10, 12);
    this.container.add(flash);

    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 300,
      onComplete: () => flash.destroy(),
    });
  }

  playLightning() {
    if (this.state === 'lightning') return;
    this.state = 'lightning';

    // Yellow lightning bolt overlay
    const bolt = this.scene.add.graphics();
    bolt.fillStyle(0xffff00, 0.8);
    // Zigzag lightning shape
    bolt.fillTriangle(0, -BODY_H / 2 - HEAD_R - 30, -10, -15, 5, -18);
    bolt.fillTriangle(-10, -15, 8, -10, -5, 5);
    bolt.fillTriangle(8, -10, -3, 8, 12, 15);
    this.container.add(bolt);

    // Quick white flash
    const flash = this.scene.add.graphics();
    flash.fillStyle(0xffffff, 0.5);
    flash.fillRoundedRect(-BODY_W / 2 - 5, -BODY_H / 2 - HEAD_R - 5, BODY_W + 10, BODY_H + HEAD_R * 2 + 10, 12);
    this.container.add(flash);

    // Shake
    this.scene.tweens.add({
      targets: this.container,
      x: this.x + 4,
      duration: 40,
      yoyo: true,
      repeat: 3,
    });

    this.scene.tweens.add({
      targets: [bolt, flash],
      alpha: 0,
      duration: 300,
      delay: 100,
      onComplete: () => {
        bolt.destroy();
        flash.destroy();
        this.state = 'idle';
      },
    });
  }
}
