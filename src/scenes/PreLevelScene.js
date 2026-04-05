import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, LEVELS } from '../config/gameConfig.js';
import { ROW_LABELS } from '../config/keyboardRows.js';
import { CHARACTERS } from '../config/characters.js';
import { BACKGROUNDS } from '../config/backgrounds.js';

export class PreLevelScene extends Phaser.Scene {
  constructor() {
    super('PreLevel');
  }

  create() {
    const currentLevel = this.registry.get('currentLevel');
    this.selectedRow = this.registry.get('selectedRow') || 'middle';
    this.selectedCharacter = this.registry.get('selectedCharacter') || 'cat';

    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x16213e, 0x16213e, 0x0f3460, 0x0f3460, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Level header
    const levelConfig = LEVELS[currentLevel - 1];
    this.add.text(GAME_WIDTH / 2, 30, `Level ${currentLevel}`, {
      fontFamily: 'Arial Black, Arial',
      fontSize: '36px',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    const bgTheme = BACKGROUNDS[currentLevel - 1];
    this.add.text(GAME_WIDTH / 2, 72, `${bgTheme.name}  •  ${levelConfig.timePerFruit}s per fruit  •  ${levelConfig.fruitsPerLevel} fruits`, {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#8899aa',
    }).setOrigin(0.5);

    // Row selection
    this.add.text(GAME_WIDTH / 2, 115, 'Choose Your Row', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.rowButtons = [];
    const rowKeys = Object.keys(ROW_LABELS);
    const rowStartX = GAME_WIDTH / 2 - (rowKeys.length * 130 - 20) / 2;

    rowKeys.forEach((key, i) => {
      const x = rowStartX + i * 130 + 55;
      const y = 160;
      this.createRowButton(x, y, key, ROW_LABELS[key]);
    });

    // Animal selection
    this.add.text(GAME_WIDTH / 2, 225, 'Choose Your Ninja', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.animalCards = [];
    const cols = 5;
    const cardW = 130;
    const cardH = 100;
    const gridW = cols * cardW + (cols - 1) * 15;
    const startX = (GAME_WIDTH - gridW) / 2 + cardW / 2;

    CHARACTERS.forEach((char, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (cardW + 15);
      const y = 290 + row * (cardH + 15);
      this.createAnimalCard(x, y, cardW, cardH, char);
    });

    // Start button
    const btnWidth = 200;
    const btnHeight = 55;
    const btnX = GAME_WIDTH / 2;
    const btnY = 550;

    this.startBtn = this.add.graphics();
    this.drawStartButton(btnX, btnY, btnWidth, btnHeight, 0x2ecc71);

    this.add.text(btnX, btnY, 'START', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '28px',
      color: '#ffffff',
    }).setOrigin(0.5);

    const startHit = this.add.rectangle(btnX, btnY, btnWidth, btnHeight)
      .setInteractive({ useHandCursor: true })
      .setAlpha(0.001);

    startHit.on('pointerover', () => this.drawStartButton(btnX, btnY, btnWidth, btnHeight, 0x27ae60));
    startHit.on('pointerout', () => this.drawStartButton(btnX, btnY, btnWidth, btnHeight, 0x2ecc71));
    startHit.on('pointerdown', () => {
      this.registry.set('selectedRow', this.selectedRow);
      this.registry.set('selectedCharacter', this.selectedCharacter);
      this.scene.start('Gameplay');
    });

    // Update visual selection
    this.updateRowSelection();
    this.updateAnimalSelection();
  }

  drawStartButton(x, y, w, h, color) {
    this.startBtn.clear();
    this.startBtn.fillStyle(color, 1);
    this.startBtn.fillRoundedRect(x - w / 2, y - h / 2, w, h, 12);
  }

  createRowButton(x, y, rowKey, label) {
    const w = 120;
    const h = 42;

    const bg = this.add.graphics();
    const text = this.add.text(x, y, label, {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#ffffff',
    }).setOrigin(0.5);

    const hitArea = this.add.rectangle(x, y, w, h)
      .setInteractive({ useHandCursor: true })
      .setAlpha(0.001);

    hitArea.on('pointerdown', () => {
      this.selectedRow = rowKey;
      this.updateRowSelection();
    });

    this.rowButtons.push({ bg, text, hitArea, rowKey, x, y, w, h });
  }

  updateRowSelection() {
    this.rowButtons.forEach(({ bg, rowKey, x, y, w, h }) => {
      bg.clear();
      if (rowKey === this.selectedRow) {
        bg.fillStyle(0x3498db, 1);
      } else {
        bg.fillStyle(0x2c3e50, 1);
      }
      bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, 8);
    });
  }

  createAnimalCard(x, y, w, h, character) {
    const bg = this.add.graphics();

    // Animal color swatch
    const swatch = this.add.graphics();
    swatch.fillStyle(character.color, 1);
    swatch.fillCircle(x, y - 12, 22);

    // Ninja mask on the animal
    const mask = this.add.graphics();
    mask.fillStyle(0x333333, 1);
    mask.fillRect(x - 22, y - 18, 44, 12);

    // Eyes
    const eyeL = this.add.graphics();
    eyeL.fillStyle(0xffffff, 1);
    eyeL.fillCircle(x - 8, y - 14, 4);
    const eyeR = this.add.graphics();
    eyeR.fillStyle(0xffffff, 1);
    eyeR.fillCircle(x + 8, y - 14, 4);

    // Name
    const name = this.add.text(x, y + 28, character.name, {
      fontFamily: 'Arial',
      fontSize: '13px',
      color: '#ffffff',
    }).setOrigin(0.5);

    const hitArea = this.add.rectangle(x, y, w, h)
      .setInteractive({ useHandCursor: true })
      .setAlpha(0.001);

    hitArea.on('pointerdown', () => {
      this.selectedCharacter = character.id;
      this.updateAnimalSelection();
    });

    this.animalCards.push({ bg, character, x, y, w, h });
  }

  updateAnimalSelection() {
    this.animalCards.forEach(({ bg, character, x, y, w, h }) => {
      bg.clear();
      if (character.id === this.selectedCharacter) {
        bg.lineStyle(3, 0xffd700, 1);
        bg.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 10);
        bg.fillStyle(0xffd700, 0.1);
        bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, 10);
      } else {
        bg.fillStyle(0x2c3e50, 0.6);
        bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, 10);
      }
    });
  }
}
