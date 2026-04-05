import { isMuted, setMuted } from './audio.js';

const BTN_SIZE = 32;
const PADDING = 12;

export function createMuteButton(scene) {
  const x = scene.scale.width - PADDING - BTN_SIZE / 2;
  const y = PADDING + BTN_SIZE / 2;

  const bg = scene.add.graphics();
  const icon = scene.add.text(x, y, isMuted() ? '🔇' : '🔊', {
    fontSize: '20px',
  }).setOrigin(0.5);

  drawBg(bg, x, y, false);

  const hitArea = scene.add.rectangle(x, y, BTN_SIZE, BTN_SIZE)
    .setInteractive({ useHandCursor: true })
    .setAlpha(0.001);

  hitArea.on('pointerover', () => drawBg(bg, x, y, true));
  hitArea.on('pointerout', () => drawBg(bg, x, y, false));
  hitArea.on('pointerdown', () => {
    setMuted(!isMuted());
    icon.setText(isMuted() ? '🔇' : '🔊');
  });

  // Bring to top so it's always clickable
  scene.children.bringToTop(bg);
  scene.children.bringToTop(icon);
  scene.children.bringToTop(hitArea);
}

function drawBg(g, x, y, hover) {
  g.clear();
  g.fillStyle(hover ? 0x444466 : 0x333344, 0.7);
  g.fillRoundedRect(x - BTN_SIZE / 2, y - BTN_SIZE / 2, BTN_SIZE, BTN_SIZE, 6);
}
