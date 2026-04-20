let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function createOscillator(frequency: number, type: OscillatorType, duration: number, gain: number, startTime = 0) {
  const c = getCtx();
  const osc = c.createOscillator();
  const gainNode = c.createGain();
  osc.connect(gainNode);
  gainNode.connect(c.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, c.currentTime + startTime);
  gainNode.gain.setValueAtTime(gain, c.currentTime + startTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, c.currentTime + startTime + duration);
  osc.start(c.currentTime + startTime);
  osc.stop(c.currentTime + startTime + duration);
}

function noise(duration: number, gain: number, filterFreq = 800) {
  const c = getCtx();
  const bufSize = c.sampleRate * duration;
  const buf = c.createBuffer(1, bufSize, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
  const source = c.createBufferSource();
  source.buffer = buf;
  const filter = c.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = filterFreq;
  filter.Q.value = 0.8;
  const gainNode = c.createGain();
  gainNode.gain.setValueAtTime(gain, c.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
  source.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(c.destination);
  source.start();
  source.stop(c.currentTime + duration);
}

export function playShoot() {
  noise(0.12, 0.6, 300);
  createOscillator(180, "sawtooth", 0.08, 0.4);
  createOscillator(90, "square", 0.15, 0.2, 0.04);
}

export function playReload() {
  createOscillator(800, "square", 0.04, 0.15);
  createOscillator(600, "square", 0.04, 0.12, 0.08);
  createOscillator(1200, "sine", 0.06, 0.1, 0.16);
}

export function playHit() {
  noise(0.25, 0.5, 150);
  createOscillator(60, "sawtooth", 0.2, 0.5);
}

export function playKill() {
  createOscillator(523, "sine", 0.08, 0.2);
  createOscillator(659, "sine", 0.08, 0.2, 0.1);
  createOscillator(784, "sine", 0.15, 0.25, 0.2);
}

export function playClick() {
  createOscillator(1000, "square", 0.04, 0.08);
}

export function playBeep(freq = 440) {
  createOscillator(freq, "sine", 0.06, 0.1);
}

const musicNodes: AudioNode[] = [];
let musicRunning = false;

export function startMusic() {
  if (musicRunning) return;
  musicRunning = true;
  const c = getCtx();

  const playBeat = () => {
    if (!musicRunning) return;

    const bpm = 128;
    const step = 60 / bpm / 2;

    const pattern = [1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0];
    const bass   = [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0];
    const melody = [0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0];
    const melodyNotes = [220, 220, 247, 262, 247, 262, 294, 262];
    let melodyIdx = 0;

    pattern.forEach((hit, i) => {
      if (hit) {
        const t = c.currentTime + i * step;
        const o = c.createOscillator();
        const g = c.createGain();
        o.connect(g); g.connect(c.destination);
        o.type = "square";
        o.frequency.setValueAtTime(80, t);
        g.gain.setValueAtTime(0.06, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + step * 0.5);
        o.start(t); o.stop(t + step * 0.5);
      }
      if (bass[i]) {
        const t = c.currentTime + i * step;
        const o = c.createOscillator();
        const g = c.createGain();
        o.connect(g); g.connect(c.destination);
        o.type = "sawtooth";
        o.frequency.setValueAtTime(55, t);
        g.gain.setValueAtTime(0.04, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + step * 1.8);
        o.start(t); o.stop(t + step * 2);
      }
      if (melody[i]) {
        const t = c.currentTime + i * step;
        const freq = melodyNotes[melodyIdx % melodyNotes.length];
        melodyIdx++;
        const o = c.createOscillator();
        const g = c.createGain();
        const filter = c.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 1200;
        o.connect(filter); filter.connect(g); g.connect(c.destination);
        o.type = "triangle";
        o.frequency.setValueAtTime(freq, t);
        g.gain.setValueAtTime(0.07, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + step * 1.5);
        o.start(t); o.stop(t + step * 2);
      }
    });

    const loopTime = pattern.length * step * 1000;
    setTimeout(() => { if (musicRunning) playBeat(); }, loopTime - 80);
  };

  playBeat();
}

export function stopMusic() {
  musicRunning = false;
}

export function playMenuMusic() {
  if (musicRunning) return;
  musicRunning = true;
  const c = getCtx();

  const pad = () => {
    if (!musicRunning) return;
    const chords = [[110, 138, 165], [98, 123, 147], [104, 131, 156], [116, 146, 174]];
    chords.forEach((chord, ci) => {
      chord.forEach(freq => {
        const t = c.currentTime + ci * 2;
        const o = c.createOscillator();
        const g = c.createGain();
        o.connect(g); g.connect(c.destination);
        o.type = "sine";
        o.frequency.setValueAtTime(freq, t);
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.03, t + 0.3);
        g.gain.linearRampToValueAtTime(0.02, t + 1.5);
        g.gain.linearRampToValueAtTime(0, t + 2.2);
        o.start(t); o.stop(t + 2.3);
      });
    });
    setTimeout(() => { if (musicRunning) pad(); }, 8000);
  };

  pad();
}
