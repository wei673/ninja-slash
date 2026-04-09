import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig.js';
import { calculateStats } from '../utils/stats.js';
import { isTouchDevice } from '../utils/touchKeyboard.js';

const STORAGE_KEY = 'ninjaSlashLeaderboard';
const MAX_ENTRIES = 10;

export class LeaderboardScene extends Phaser.Scene {
  constructor() {
    super('Leaderboard');
  }

  create() {
    const stats = calculateStats(this.registry);
    const speed = stats.speed;
    const accuracy = stats.accuracy;

    this.playerSpeed = speed;
    this.playerAccuracy = accuracy;
    this.playerName = '';
    this.submitted = false;

    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0f3460, 0x0f3460, 0x1a1a2e, 0x1a1a2e, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Title
    this.add.text(GAME_WIDTH / 2, 30, 'LEADERBOARD', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '40px',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Your stats
    this.add.text(GAME_WIDTH / 2, 80, `Your Speed: ${speed} letters/min  •  Accuracy: ${accuracy}%`, {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#aaccff',
    }).setOrigin(0.5);

    // Name input area
    this.add.text(GAME_WIDTH / 2, 120, 'Enter your name:', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Name display box
    const nameBoxX = GAME_WIDTH / 2;
    const nameBoxY = 155;
    const nameBoxW = 300;
    const nameBoxH = 40;

    const nameBox = this.add.graphics();
    nameBox.fillStyle(0x1a1a3e, 1);
    nameBox.fillRoundedRect(nameBoxX - nameBoxW / 2, nameBoxY - nameBoxH / 2, nameBoxW, nameBoxH, 8);
    nameBox.lineStyle(2, 0x3498db, 1);
    nameBox.strokeRoundedRect(nameBoxX - nameBoxW / 2, nameBoxY - nameBoxH / 2, nameBoxW, nameBoxH, 8);

    this.nameText = this.add.text(nameBoxX, nameBoxY, '|', {
      fontFamily: 'Arial',
      fontSize: '22px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Blinking cursor
    this.tweens.add({
      targets: this.nameText,
      alpha: 0.5,
      duration: 500,
      yoyo: true,
      repeat: -1,
    });

    // Keyboard input for name
    this.input.keyboard.on('keydown', (event) => this.handleNameInput(event));

    // On touch devices, overlay a real DOM <input> so the native keyboard appears
    this.domInput = null;
    if (isTouchDevice()) {
      this.createDomInput(nameBoxX, nameBoxY, nameBoxW, nameBoxH);
    }

    // Submit button
    const btnX = GAME_WIDTH / 2;
    const btnY = 200;
    const btnW = 160;
    const btnH = 40;

    this.submitBtn = this.add.graphics();
    this.drawSubmitBtn(btnX, btnY, btnW, btnH, 0x2ecc71);

    this.submitText = this.add.text(btnX, btnY, 'SUBMIT', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '18px',
      color: '#ffffff',
    }).setOrigin(0.5);

    const submitHit = this.add.rectangle(btnX, btnY, btnW, btnH)
      .setInteractive({ useHandCursor: true })
      .setAlpha(0.001);

    submitHit.on('pointerover', () => this.drawSubmitBtn(btnX, btnY, btnW, btnH, 0x27ae60));
    submitHit.on('pointerout', () => this.drawSubmitBtn(btnX, btnY, btnW, btnH, 0x2ecc71));
    submitHit.on('pointerdown', () => this.submitScore());

    // Leaderboard table
    this.tableY = 250;
    this.drawTable();

    // Play Again button at bottom
    const playBtnY = GAME_HEIGHT - 50;
    const playBtn = this.add.graphics();
    playBtn.fillStyle(0x9b59b6, 1);
    playBtn.fillRoundedRect(GAME_WIDTH / 2 - 100, playBtnY - 22, 200, 44, 10);

    this.add.text(GAME_WIDTH / 2, playBtnY, 'PLAY AGAIN', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '20px',
      color: '#ffffff',
    }).setOrigin(0.5);

    const playHit = this.add.rectangle(GAME_WIDTH / 2, playBtnY, 200, 44)
      .setInteractive({ useHandCursor: true })
      .setAlpha(0.001);

    playHit.on('pointerover', () => {
      playBtn.clear();
      playBtn.fillStyle(0x8e44ad, 1);
      playBtn.fillRoundedRect(GAME_WIDTH / 2 - 100, playBtnY - 22, 200, 44, 10);
    });
    playHit.on('pointerout', () => {
      playBtn.clear();
      playBtn.fillStyle(0x9b59b6, 1);
      playBtn.fillRoundedRect(GAME_WIDTH / 2 - 100, playBtnY - 22, 200, 44, 10);
    });
    playHit.on('pointerdown', () => {
      this.destroyDomInput();
      this.registry.set('currentLevel', 1);
      this.scene.start('Title');
    });

    // Clean up DOM input if scene is shut down externally
    this.events.on('shutdown', () => this.destroyDomInput());
  }

  drawSubmitBtn(x, y, w, h, color) {
    this.submitBtn.clear();
    this.submitBtn.fillStyle(color, 1);
    this.submitBtn.fillRoundedRect(x - w / 2, y - h / 2, w, h, 8);
  }

  createDomInput(boxX, boxY, boxW, boxH) {
    const canvas = this.game.canvas;
    const canvasRect = canvas.getBoundingClientRect();
    const scaleX = canvasRect.width / GAME_WIDTH;
    const scaleY = canvasRect.height / GAME_HEIGHT;

    const input = document.createElement('input');
    input.type = 'text';
    input.maxLength = 15;
    input.autocomplete = 'off';
    input.autocapitalize = 'off';
    input.spellcheck = false;

    Object.assign(input.style, {
      position: 'absolute',
      left: `${canvasRect.left + (boxX - boxW / 2) * scaleX}px`,
      top: `${canvasRect.top + (boxY - boxH / 2) * scaleY}px`,
      width: `${boxW * scaleX}px`,
      height: `${boxH * scaleY}px`,
      fontSize: `${22 * scaleY}px`,
      fontFamily: 'Arial',
      color: 'transparent',
      caretColor: 'white',
      background: 'transparent',
      border: 'none',
      outline: 'none',
      textAlign: 'center',
      zIndex: '10',
    });

    input.addEventListener('input', () => {
      this.playerName = input.value;
      this.nameText.setText(this.playerName.length > 0 ? this.playerName : '|');
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        input.blur();
        this.submitScore();
      }
    });

    document.body.appendChild(input);
    this.domInput = input;
  }

  destroyDomInput() {
    if (this.domInput) {
      this.domInput.remove();
      this.domInput = null;
    }
  }

  handleNameInput(event) {
    if (this.submitted) return;

    if (event.key === 'Backspace') {
      this.playerName = this.playerName.slice(0, -1);
    } else if (event.key === 'Enter') {
      this.submitScore();
      return;
    } else if (event.key.length === 1 && this.playerName.length < 15) {
      this.playerName += event.key;
    }

    this.nameText.setText(this.playerName.length > 0 ? this.playerName : '|');
  }

  submitScore() {
    if (this.submitted) return;
    if (this.playerName.trim().length === 0) return;

    this.submitted = true;
    this.nameText.setText(this.playerName);
    this.tweens.killTweensOf(this.nameText);
    this.nameText.setAlpha(1);

    // Disable DOM input after submission
    if (this.domInput) {
      this.domInput.disabled = true;
      this.domInput.blur();
    }

    // Dim submit button
    this.submitBtn.clear();
    this.submitBtn.fillStyle(0x555555, 1);
    this.submitBtn.fillRoundedRect(
      GAME_WIDTH / 2 - 80, 200 - 20, 160, 40, 8
    );
    this.submitText.setColor('#999999');

    // Save to leaderboard
    const entry = {
      name: this.playerName.trim(),
      speed: this.playerSpeed,
      accuracy: this.playerAccuracy,
    };

    const leaderboard = this.getLeaderboard();
    leaderboard.push(entry);
    leaderboard.sort((a, b) => b.speed - a.speed);
    const trimmed = leaderboard.slice(0, MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));

    // Refresh table
    this.drawTable();
  }

  getLeaderboard() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  drawTable() {
    // Clear previous table graphics
    if (this.tableGroup) {
      this.tableGroup.forEach(obj => obj.destroy());
    }
    this.tableGroup = [];

    const y = this.tableY;
    const leaderboard = this.getLeaderboard();

    // Header
    const colRank = 180;
    const colName = 330;
    const colSpeed = 580;
    const colAcc = 770;

    const headerStyle = {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#888899',
      fontStyle: 'bold',
    };

    this.tableGroup.push(
      this.add.text(colRank, y, 'RANK', headerStyle).setOrigin(0.5),
      this.add.text(colName, y, 'NAME', headerStyle).setOrigin(0, 0),
      this.add.text(colSpeed, y, 'SPEED (letters/min)', headerStyle).setOrigin(0.5),
      this.add.text(colAcc, y, 'ACCURACY', headerStyle).setOrigin(0.5),
    );

    // Header line
    const headerLine = this.add.graphics();
    headerLine.lineStyle(1, 0x444466, 0.6);
    headerLine.lineBetween(140, y + 14, GAME_WIDTH - 140, y + 14);
    this.tableGroup.push(headerLine);

    // Rows
    const rowStyle = {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#ffffff',
    };

    const goldStyle = { ...rowStyle, color: '#ffd700' };
    const silverStyle = { ...rowStyle, color: '#c0c0c0' };
    const bronzeStyle = { ...rowStyle, color: '#cd7f32' };

    for (let i = 0; i < MAX_ENTRIES; i++) {
      const ry = y + 30 + i * 32;
      const entry = leaderboard[i];

      let style = rowStyle;
      if (i === 0) style = goldStyle;
      else if (i === 1) style = silverStyle;
      else if (i === 2) style = bronzeStyle;

      // Rank medal for top 3
      const rankText = i === 0 ? '1st' : i === 1 ? '2nd' : i === 2 ? '3rd' : `${i + 1}th`;

      if (entry) {
        // Highlight if this is the just-submitted entry
        const isNew = this.submitted && entry.name === this.playerName.trim()
          && entry.speed === this.playerSpeed && entry.accuracy === this.playerAccuracy;

        const entryStyle = isNew ? { ...style, backgroundColor: '#2a2a5a' } : style;

        // Row background for new entry
        if (isNew) {
          const rowBg = this.add.graphics();
          rowBg.fillStyle(0x2a2a5a, 0.5);
          rowBg.fillRoundedRect(140, ry - 10, GAME_WIDTH - 280, 28, 4);
          this.tableGroup.push(rowBg);
        }

        this.tableGroup.push(
          this.add.text(colRank, ry, rankText, style).setOrigin(0.5),
          this.add.text(colName, ry, entry.name, style).setOrigin(0, 0.5),
          this.add.text(colSpeed, ry, `${entry.speed}`, style).setOrigin(0.5),
          this.add.text(colAcc, ry, `${entry.accuracy}%`, style).setOrigin(0.5),
        );
      } else {
        // Empty row
        const emptyStyle = { ...rowStyle, color: '#333344' };
        this.tableGroup.push(
          this.add.text(colRank, ry, rankText, emptyStyle).setOrigin(0.5),
          this.add.text(colName, ry, '---', emptyStyle).setOrigin(0, 0.5),
          this.add.text(colSpeed, ry, '-', emptyStyle).setOrigin(0.5),
          this.add.text(colAcc, ry, '-', emptyStyle).setOrigin(0.5),
        );
      }
    }
  }
}
