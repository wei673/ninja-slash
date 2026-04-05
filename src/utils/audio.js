// Procedural sound effects using Web Audio API — no external audio files needed
let audioCtx = null;
let muted = false;

function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function ensureResumed() {
  const ctx = getCtx();
  if (ctx.state === 'suspended') ctx.resume();
}

export function setMuted(m) {
  muted = m;
}

export function isMuted() {
  return muted;
}

export function playSlash() {
  if (muted) return;
  ensureResumed();
  const ctx = getCtx();
  const t = ctx.currentTime;

  // Quick swoosh — noise burst + high frequency sweep
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(800, t);
  osc.frequency.exponentialRampToValueAtTime(200, t + 0.1);
  gain.gain.setValueAtTime(0.15, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.12);

  // Pop
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(600, t);
  osc2.frequency.exponentialRampToValueAtTime(100, t + 0.08);
  gain2.gain.setValueAtTime(0.2, t);
  gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
  osc2.connect(gain2).connect(ctx.destination);
  osc2.start(t);
  osc2.stop(t + 0.1);
}

export function playWrong() {
  if (muted) return;
  ensureResumed();
  const ctx = getCtx();
  const t = ctx.currentTime;

  // Buzzy error tone
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(150, t);
  osc.frequency.setValueAtTime(120, t + 0.08);
  gain.gain.setValueAtTime(0.12, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.2);

  // Crackle for lightning feel
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'sawtooth';
  osc2.frequency.setValueAtTime(2000, t);
  osc2.frequency.exponentialRampToValueAtTime(50, t + 0.05);
  gain2.gain.setValueAtTime(0.08, t);
  gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
  osc2.connect(gain2).connect(ctx.destination);
  osc2.start(t);
  osc2.stop(t + 0.06);
}

export function playMiss() {
  if (muted) return;
  ensureResumed();
  const ctx = getCtx();
  const t = ctx.currentTime;

  // Descending tone — sounds like something falling/failing
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(400, t);
  osc.frequency.exponentialRampToValueAtTime(80, t + 0.3);
  gain.gain.setValueAtTime(0.15, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.35);

  // Thud
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(80, t + 0.25);
  gain2.gain.setValueAtTime(0, t);
  gain2.gain.setValueAtTime(0.2, t + 0.25);
  gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
  osc2.connect(gain2).connect(ctx.destination);
  osc2.start(t + 0.25);
  osc2.stop(t + 0.4);
}

export function playLevelUp() {
  if (muted) return;
  ensureResumed();
  const ctx = getCtx();
  const t = ctx.currentTime;

  // Ascending arpeggio — cheerful
  const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t + i * 0.1);
    gain.gain.setValueAtTime(0.15, t + i * 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.3);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t + i * 0.1);
    osc.stop(t + i * 0.1 + 0.3);
  });
}

export function playGameOver() {
  if (muted) return;
  ensureResumed();
  const ctx = getCtx();
  const t = ctx.currentTime;

  // Descending sad tones
  const notes = [392, 349, 330, 262]; // G4, F4, E4, C4
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t + i * 0.2);
    gain.gain.setValueAtTime(0.15, t + i * 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.2 + 0.4);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t + i * 0.2);
    osc.stop(t + i * 0.2 + 0.4);
  });
}

export function playVictory() {
  if (muted) return;
  ensureResumed();
  const ctx = getCtx();
  const t = ctx.currentTime;

  // Triumphant fanfare
  const notes = [523, 659, 784, 1047, 1047, 784, 1047]; // C E G C C G C
  const durations = [0.15, 0.15, 0.15, 0.3, 0.1, 0.15, 0.5];
  let offset = 0;
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t + offset);
    gain.gain.setValueAtTime(0.15, t + offset);
    gain.gain.exponentialRampToValueAtTime(0.001, t + offset + durations[i]);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t + offset);
    osc.stop(t + offset + durations[i] + 0.05);
    offset += durations[i];
  });
}
