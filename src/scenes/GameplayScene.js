import Phaser from 'phaser';
import { LEVELS, HP_PENALTY, INPUT_LOCK_MS, SPAWN_AREA, BOMB_CONFIG, GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig.js';
import { ROWS } from '../config/keyboardRows.js';
import { Fruit } from '../objects/Fruit.js';
import { Bomb } from '../objects/Bomb.js';
import { HUD } from '../objects/HUD.js';
import { Ninja } from '../objects/Ninja.js';
import { SlashEffect } from '../effects/SlashEffect.js';
import { LightningEffect } from '../effects/LightningEffect.js';
import { TouchKeyboard, isTouchDevice } from '../utils/touchKeyboard.js';
import { renderBackground } from '../utils/backgroundRenderer.js';
import { playSlash, playWrong, playMiss, playLevelUp, playGameOver } from '../utils/audio.js';
import { createMuteButton } from '../utils/muteButton.js';

export class GameplayScene extends Phaser.Scene {
  constructor() {
    super('Gameplay');
  }

  create() {
    const levelIndex = this.registry.get('currentLevel') - 1;
    const levelConfig = LEVELS[levelIndex];
    const selectedRow = this.registry.get('selectedRow');
    const selectedCharacter = this.registry.get('selectedCharacter');

    this.levelConfig = levelConfig;
    this.bombConfig = BOMB_CONFIG[levelIndex];
    this.letters = ROWS[selectedRow];
    this.hp = levelConfig.maxHP;
    this.fruitsSlashed = 0;
    this.fruitsSpawned = 0;
    this.currentFruit = null;
    this.inputLocked = false;
    this.fruitTimer = null;
    this.levelComplete = false;
    this.currentBomb = null;
    this.bombTimer = null;
    this.lastBombTime = 0;

    // Start timer on first level
    if (this.registry.get('currentLevel') === 1 || this.registry.get('gameStartTime') === 0) {
      this.registry.set('gameStartTime', Date.now());
    }

    // Background
    renderBackground(this, levelIndex);

    // HUD
    this.hud = new HUD(this, levelConfig.maxHP, levelConfig.level, levelConfig.fruitsPerLevel);

    // Ninja character (right side)
    this.ninja = new Ninja(this, selectedCharacter, 900, 380);

    // Mute button
    createMuteButton(this);

    // Home button (top-left, for testing)
    this.createHomeButton();

    // Keyboard input (physical)
    this.input.keyboard.on('keydown', (event) => this.handleKeyPress(event));

    // Touch keyboard (for iPad / touch devices)
    this.touchKeyboard = null;
    if (isTouchDevice()) {
      this.touchKeyboard = new TouchKeyboard(this, selectedRow, (letter) => {
        this.handleTouchKey(letter);
      });
    }

    // Pause game when tab loses focus
    this.game.events.on('blur', () => {
      if (!this.levelComplete) {
        this.scene.pause();
        this.showPauseOverlay();
      }
    });

    this.game.events.on('focus', () => {
      // Don't auto-resume — let the overlay handle it
    });

    // Timer bar for current fruit
    this.timerBar = this.add.graphics();
    this.timerBarBg = this.add.graphics();
    this.fruitStartTime = 0;

    // Start spawning
    this.spawnNextFruit();
  }

  showPauseOverlay() {
    const pauseScene = this.scene.get('Gameplay');
    if (!pauseScene) return;

    // Create a simple overlay — we add it then resume on click
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.6);
    overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    const pauseText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 30, 'PAUSED', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '48px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    const resumeText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 30, 'Click to Resume', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#aaaaaa',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: resumeText,
      alpha: 0.4,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    // Resume on click
    const hitArea = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT)
      .setInteractive()
      .setAlpha(0.001);

    hitArea.once('pointerdown', () => {
      overlay.destroy();
      pauseText.destroy();
      resumeText.destroy();
      hitArea.destroy();
      this.scene.resume();
    });
  }

  createHomeButton() {
    const x = 12 + 16;
    const y = 12 + 16;
    const size = 32;

    const bg = this.add.graphics();
    bg.fillStyle(0x333344, 0.7);
    bg.fillRoundedRect(x - size / 2, y - size / 2, size, size, 6);

    const icon = this.add.text(x, y, '⌂', {
      fontSize: '20px',
      color: '#ffffff',
    }).setOrigin(0.5);

    const hit = this.add.rectangle(x, y, size, size)
      .setInteractive({ useHandCursor: true })
      .setAlpha(0.001);

    hit.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x444466, 0.7);
      bg.fillRoundedRect(x - size / 2, y - size / 2, size, size, 6);
    });
    hit.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x333344, 0.7);
      bg.fillRoundedRect(x - size / 2, y - size / 2, size, size, 6);
    });
    hit.on('pointerdown', () => {
      if (this.fruitTimer) {
        this.fruitTimer.remove(false);
        this.fruitTimer = null;
      }
      if (this.bombTimer) {
        this.bombTimer.remove(false);
        this.bombTimer = null;
      }
      this.levelComplete = true;
      this.scene.start('Title');
    });
  }

  getSpawnArea() {
    if (!this.touchKeyboard) return SPAWN_AREA;
    const selectedRow = this.registry.get('selectedRow');
    return { ...SPAWN_AREA, yMax: selectedRow === 'all' ? 0.35 : 0.48 };
  }

  spawnNextFruit() {
    if (this.levelComplete) return;

    if (this.fruitsSlashed >= this.levelConfig.fruitsPerLevel) {
      this.onLevelComplete();
      return;
    }

    const letter = Phaser.Utils.Array.GetRandom(this.letters);
    const spawnArea = this.getSpawnArea();
    this.currentFruit = new Fruit(this, letter, spawnArea);
    this.fruitsSpawned++;

    this.fruitStartTime = this.time.now;

    this.fruitTimer = this.time.delayedCall(
      this.levelConfig.timePerFruit * 1000,
      () => this.onFruitMissed()
    );
  }

  shouldSpawnBomb() {
    if (this.currentBomb) return false;
    if (this.levelComplete) return false;

    const timeSinceLastBomb = this.time.now - this.lastBombTime;
    if (timeSinceLastBomb < this.bombConfig.minSpawnDelay) return false;

    return Math.random() <= this.bombConfig.chance;
  }

  spawnBomb() {
    const letter = Phaser.Utils.Array.GetRandom(this.letters);
    const spawnArea = this.getSpawnArea();
    this.currentBomb = new Bomb(this, letter, spawnArea);
    this.lastBombTime = this.time.now;

    // Bomb expires after its duration, then spawn next fruit
    this.bombTimer = this.time.delayedCall(
      this.bombConfig.duration,
      () => {
        this.onBombExpire();
        // After bomb is gone, pause briefly then spawn next fruit
        this.time.delayedCall(500, () => {
          this.spawnNextFruit();
        });
      }
    );
  }

  onBombExpire() {
    if (this.currentBomb && !this.currentBomb.exploded) {
      this.currentBomb.expire();
      this.currentBomb = null;
    }
    this.bombTimer = null;
  }

  onBombHit() {
    this.inputLocked = true;

    // Bomb explodes
    this.currentBomb.explode();
    this.currentBomb = null;
    if (this.bombTimer) {
      this.bombTimer.remove(false);
      this.bombTimer = null;
    }
    playWrong();

    this.hp -= HP_PENALTY.bomb;
    this.hud.setHP(this.hp);
    this.hud.flashDamage();
    this.registry.set('totalBombHits', this.registry.get('totalBombHits') + 1);

    if (this.hp <= 0) {
      this.onGameOver();
      return;
    }

    this.time.delayedCall(INPUT_LOCK_MS, () => {
      this.inputLocked = false;
    });

    // After bomb hit, spawn next fruit after a pause
    this.time.delayedCall(this.levelConfig.pauseBetweenFruits, () => {
      this.spawnNextFruit();
    });
  }

  handleKeyPress(event) {
    if (this.inputLocked || this.levelComplete) return;
    if (event.repeat) return;

    const key = event.key.toUpperCase();
    if (key.length !== 1 || key < 'A' || key > 'Z') return;

    this.processInput(key);
  }

  handleTouchKey(letter) {
    if (this.inputLocked || this.levelComplete) return;

    this.processInput(letter);
  }

  processInput(key) {
    // Check bomb first — if the key matches the bomb, it explodes
    if (this.currentBomb && !this.currentBomb.exploded && key === this.currentBomb.letter) {
      this.onBombHit();
      return;
    }

    // If no fruit on screen (bomb-only phase), ignore other keys
    if (!this.currentFruit) return;

    if (key === this.currentFruit.letter) {
      this.onCorrectKey();
    } else {
      this.onWrongKey();
    }
  }

  onCorrectKey() {
    this.inputLocked = true;

    if (this.fruitTimer) {
      this.fruitTimer.remove(false);
      this.fruitTimer = null;
    }

    // Ninja slashes toward the fruit
    const fruitX = this.currentFruit.x;
    const fruitY = this.currentFruit.y;
    const juiceColor = this.currentFruit.fruitType.juiceColor;
    this.ninja.playSlash(fruitX, fruitY);

    // Slash effect at fruit position
    SlashEffect.play(this, fruitX, fruitY, juiceColor);
    playSlash();

    this.currentFruit.slash();
    this.currentFruit = null;
    this.fruitsSlashed++;
    this.hud.setFruitCount(this.fruitsSlashed);
    this.registry.set('totalCorrect', this.registry.get('totalCorrect') + 1);

    this.time.delayedCall(INPUT_LOCK_MS, () => {
      this.inputLocked = false;
    });

    // During the pause, maybe spawn a bomb — if so, delay next fruit until bomb is done
    this.time.delayedCall(200, () => {
      if (this.shouldSpawnBomb()) {
        this.spawnBomb();
      } else {
        this.time.delayedCall(this.levelConfig.pauseBetweenFruits - 200, () => {
          this.spawnNextFruit();
        });
      }
    });
  }

  onWrongKey() {
    this.inputLocked = true;
    this.hp -= HP_PENALTY.wrongKey;
    this.hud.setHP(this.hp);
    this.hud.flashDamage();
    this.registry.set('totalWrong', this.registry.get('totalWrong') + 1);

    // Lightning strike on ninja
    LightningEffect.play(this, this.ninja.x, this.ninja.y - 30);
    this.ninja.playLightning();
    playWrong();

    if (this.hp <= 0) {
      this.onGameOver();
      return;
    }

    this.time.delayedCall(INPUT_LOCK_MS, () => {
      this.inputLocked = false;
    });
  }

  onFruitMissed() {
    if (!this.currentFruit || this.levelComplete) return;

    this.inputLocked = true;
    this.fruitTimer = null;

    // Fruit flies toward ninja and hits it
    playMiss();
    this.currentFruit.miss(this.ninja.x, this.ninja.y - 30);
    this.currentFruit = null;

    // Ninja gets hit after fruit arrives
    this.time.delayedCall(400, () => {
      this.ninja.playHit();
    });

    this.hp -= HP_PENALTY.miss;
    this.hud.setHP(this.hp);
    this.registry.set('totalMisses', this.registry.get('totalMisses') + 1);
    this.hud.flashDamage();

    if (this.hp <= 0) {
      this.time.delayedCall(500, () => this.onGameOver());
      return;
    }

    // During the pause, maybe spawn a bomb — if so, delay next fruit
    this.time.delayedCall(200, () => {
      this.inputLocked = false;
      if (this.shouldSpawnBomb()) {
        this.spawnBomb();
      } else {
        this.time.delayedCall(this.levelConfig.pauseBetweenFruits - 200, () => {
          this.spawnNextFruit();
        });
      }
    });
  }

  onLevelComplete() {
    this.levelComplete = true;
    const currentLevel = this.registry.get('currentLevel');
    playLevelUp();

    if (currentLevel >= 10) {
      this.scene.start('Victory');
    } else {
      this.registry.set('currentLevel', currentLevel + 1);
      this.scene.start('LevelComplete');
    }
  }

  onGameOver() {
    this.levelComplete = true;
    playGameOver();

    if (this.fruitTimer) {
      this.fruitTimer.remove(false);
      this.fruitTimer = null;
    }

    if (this.bombTimer) {
      this.bombTimer.remove(false);
      this.bombTimer = null;
    }

    const currentLevel = this.registry.get('currentLevel');
    const prevLevel = Math.max(1, currentLevel - 1);
    this.registry.set('currentLevel', prevLevel);

    this.scene.start('GameOver');
  }

  update() {
    this.hud.update();
    this.updateTimerBar();
  }

  updateTimerBar() {
    this.timerBarBg.clear();
    this.timerBar.clear();

    if (!this.currentFruit || this.levelComplete) return;

    const elapsed = this.time.now - this.fruitStartTime;
    const total = this.levelConfig.timePerFruit * 1000;
    const remaining = Math.max(0, 1 - elapsed / total);

    const barWidth = 80;
    const barHeight = 6;
    const x = this.currentFruit.x - barWidth / 2;
    const y = this.currentFruit.y + 52;

    // Background
    this.timerBarBg.fillStyle(0x000000, 0.4);
    this.timerBarBg.fillRoundedRect(x, y, barWidth, barHeight, 3);

    // Remaining time bar — green to red
    const color = remaining > 0.5
      ? Phaser.Display.Color.GetColor(Math.round(255 * (1 - remaining) * 2), 255, 50)
      : Phaser.Display.Color.GetColor(255, Math.round(255 * remaining * 2), 50);

    this.timerBar.fillStyle(color, 0.9);
    this.timerBar.fillRoundedRect(x, y, barWidth * remaining, barHeight, 3);
  }

  shutdown() {
    this.game.events.off('blur');
    this.game.events.off('focus');
  }
}
