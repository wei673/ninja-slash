import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create() {
    // No external assets to load for now — all placeholder graphics
    // Initialize registry defaults
    this.registry.set('currentLevel', 1);
    this.registry.set('selectedRow', 'middle');
    this.registry.set('selectedCharacter', 'cat');

    // Stats tracked across all levels
    this.registry.set('totalCorrect', 0);
    this.registry.set('totalWrong', 0);
    this.registry.set('totalBombHits', 0);
    this.registry.set('totalMisses', 0);
    this.registry.set('gameStartTime', 0);

    this.scene.start('Title');
  }
}
