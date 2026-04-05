import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig.js';
import { ROWS } from '../config/keyboardRows.js';

const KEY_SIZE = 58;
const KEY_GAP = 8;
const KEYBOARD_PADDING_BOTTOM = 75; // above HUD
const KEY_RADIUS = 10;
const KEY_COLOR = 0x3a3a5c;
const KEY_COLOR_PRESSED = 0x5a5a8c;
const KEY_TEXT_COLOR = '#ffffff';

export class TouchKeyboard {
  constructor(scene, rowKey, onKeyPress) {
    this.scene = scene;
    this.onKeyPress = onKeyPress;
    this.keys = [];
    this.container = scene.add.container(0, 0);

    const letters = ROWS[rowKey];
    this.buildKeys(letters);
  }

  buildKeys(letters) {
    const totalWidth = letters.length * KEY_SIZE + (letters.length - 1) * KEY_GAP;
    const startX = (GAME_WIDTH - totalWidth) / 2 + KEY_SIZE / 2;
    const y = GAME_HEIGHT - KEYBOARD_PADDING_BOTTOM - KEY_SIZE / 2;

    letters.forEach((letter, i) => {
      const x = startX + i * (KEY_SIZE + KEY_GAP);
      this.createKey(x, y, letter);
    });
  }

  createKey(x, y, letter) {
    const bg = this.scene.add.graphics();
    this.drawKey(bg, x, y, KEY_COLOR);

    const text = this.scene.add.text(x, y, letter, {
      fontFamily: 'Arial Black, Arial',
      fontSize: '22px',
      color: KEY_TEXT_COLOR,
    }).setOrigin(0.5);

    const hitArea = this.scene.add.rectangle(x, y, KEY_SIZE, KEY_SIZE)
      .setInteractive()
      .setAlpha(0.001);

    hitArea.on('pointerdown', () => {
      this.drawKey(bg, x, y, KEY_COLOR_PRESSED);
      this.onKeyPress(letter);
    });

    hitArea.on('pointerup', () => {
      this.drawKey(bg, x, y, KEY_COLOR);
    });

    hitArea.on('pointerout', () => {
      this.drawKey(bg, x, y, KEY_COLOR);
    });

    this.container.add([bg, text, hitArea]);
    this.keys.push({ bg, text, hitArea, letter });
  }

  drawKey(graphics, x, y, color) {
    graphics.clear();
    graphics.fillStyle(color, 1);
    graphics.fillRoundedRect(x - KEY_SIZE / 2, y - KEY_SIZE / 2, KEY_SIZE, KEY_SIZE, KEY_RADIUS);
    graphics.lineStyle(2, 0x5555777, 0.5);
    graphics.strokeRoundedRect(x - KEY_SIZE / 2, y - KEY_SIZE / 2, KEY_SIZE, KEY_SIZE, KEY_RADIUS);
  }

  /** Height consumed by the keyboard, for adjusting fruit spawn area */
  static getHeight() {
    return KEY_SIZE + 15;
  }

  destroy() {
    this.container.destroy(true);
  }
}

/** Returns true if the device is likely touch-only (no mouse/hover) */
export function isTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}
