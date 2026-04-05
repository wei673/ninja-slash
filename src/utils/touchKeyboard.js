import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig.js';
import { ROWS } from '../config/keyboardRows.js';

const KEY_SIZE = 58;
const KEY_SIZE_SMALL = 48;
const KEY_GAP = 6;
const KEYBOARD_PADDING_BOTTOM = 75; // above HUD
const KEY_RADIUS = 10;
const KEY_COLOR = 0x3a3a5c;
const KEY_COLOR_PRESSED = 0x5a5a8c;
const KEY_TEXT_COLOR = '#ffffff';
const ROW_GAP = 6;

export class TouchKeyboard {
  constructor(scene, rowKey, onKeyPress) {
    this.scene = scene;
    this.onKeyPress = onKeyPress;
    this.keys = [];
    this.container = scene.add.container(0, 0);
    this.rowKey = rowKey;

    if (rowKey === 'all') {
      this.buildMultiRowKeys();
    } else {
      this.buildSingleRowKeys(ROWS[rowKey]);
    }
  }

  buildSingleRowKeys(letters) {
    const totalWidth = letters.length * KEY_SIZE + (letters.length - 1) * KEY_GAP;
    const startX = (GAME_WIDTH - totalWidth) / 2 + KEY_SIZE / 2;
    const y = GAME_HEIGHT - KEYBOARD_PADDING_BOTTOM - KEY_SIZE / 2;

    letters.forEach((letter, i) => {
      const x = startX + i * (KEY_SIZE + KEY_GAP);
      this.createKey(x, y, letter, KEY_SIZE);
    });
  }

  buildMultiRowKeys() {
    const rows = [ROWS.top, ROWS.middle, ROWS.bottom];
    const size = KEY_SIZE_SMALL;
    const totalHeight = rows.length * size + (rows.length - 1) * ROW_GAP;
    const bottomY = GAME_HEIGHT - KEYBOARD_PADDING_BOTTOM;
    const topY = bottomY - totalHeight;

    rows.forEach((letters, rowIndex) => {
      const y = topY + rowIndex * (size + ROW_GAP) + size / 2;
      const totalWidth = letters.length * size + (letters.length - 1) * KEY_GAP;
      const startX = (GAME_WIDTH - totalWidth) / 2 + size / 2;

      letters.forEach((letter, i) => {
        const x = startX + i * (size + KEY_GAP);
        this.createKey(x, y, letter, size);
      });
    });
  }

  createKey(x, y, letter, size) {
    const bg = this.scene.add.graphics();
    this.drawKey(bg, x, y, KEY_COLOR, size);

    const fontSize = size === KEY_SIZE ? '22px' : '18px';
    const text = this.scene.add.text(x, y, letter, {
      fontFamily: 'Arial Black, Arial',
      fontSize: fontSize,
      color: KEY_TEXT_COLOR,
    }).setOrigin(0.5);

    const hitArea = this.scene.add.rectangle(x, y, size, size)
      .setInteractive()
      .setAlpha(0.001);

    hitArea.on('pointerdown', () => {
      this.drawKey(bg, x, y, KEY_COLOR_PRESSED, size);
      this.onKeyPress(letter);
    });

    hitArea.on('pointerup', () => {
      this.drawKey(bg, x, y, KEY_COLOR, size);
    });

    hitArea.on('pointerout', () => {
      this.drawKey(bg, x, y, KEY_COLOR, size);
    });

    this.container.add([bg, text, hitArea]);
    this.keys.push({ bg, text, hitArea, letter, size });
  }

  drawKey(graphics, x, y, color, size) {
    graphics.clear();
    graphics.fillStyle(color, 1);
    graphics.fillRoundedRect(x - size / 2, y - size / 2, size, size, KEY_RADIUS);
    graphics.lineStyle(2, 0x555577, 0.5);
    graphics.strokeRoundedRect(x - size / 2, y - size / 2, size, size, KEY_RADIUS);
  }

  /** Height consumed by the keyboard, for adjusting fruit spawn area */
  static getHeight(rowKey) {
    if (rowKey === 'all') {
      return KEY_SIZE_SMALL * 3 + ROW_GAP * 2 + 15;
    }
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
