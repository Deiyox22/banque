let ctx: AudioContext | null = null;
let muted = false;

export function setMuted(value: boolean) {
  muted = value;
}

export function isMuted(): boolean {
  return muted;
}

function getCtx(): AudioContext {
  if (!ctx) {
    const Ctor = window.AudioContext || (window as any).webkitAudioContext;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") {
    ctx.resume();
  }
  return ctx;
}

function tone(
  freq: number,
  startTime: number,
  duration: number,
  type: OscillatorType = "sine",
  gainValue = 0.2
) {
  const c = getCtx();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(gainValue, startTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  osc.connect(gain).connect(c.destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.02);
}

export function playDiceSound() {
  if (muted) return;
  const c = getCtx();
  const now = c.currentTime;

  const bufferSize = Math.floor(c.sampleRate * 0.15);
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
  }
  const noise = c.createBufferSource();
  noise.buffer = buffer;
  const filter = c.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 1400;
  const gain = c.createGain();
  gain.gain.setValueAtTime(0.35, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
  noise.connect(filter).connect(gain).connect(c.destination);
  noise.start(now);

  tone(900, now + 0.06, 0.05, "square", 0.06);
  tone(650, now + 0.12, 0.05, "square", 0.06);
}

export function playBuySound() {
  if (muted) return;
  const c = getCtx();
  const now = c.currentTime;
  tone(880, now, 0.12, "sine", 0.25);
  tone(1318.5, now + 0.09, 0.2, "sine", 0.25);
}

export function playVictorySound() {
  if (muted) return;
  const c = getCtx();
  const now = c.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((freq, i) => tone(freq, now + i * 0.15, 0.35, "triangle", 0.28));
}

export function playErrorSound() {
  const c = getCtx();
  const now = c.currentTime;
  tone(220, now, 0.18, "sawtooth", 0.15);
}
