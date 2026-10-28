"use client";

let ctx: AudioContext | null = null;
let muted = false;

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function setMuted(value: boolean) {
  muted = value;
  if (typeof window !== "undefined") window.localStorage.setItem("cmw:muted", value ? "1" : "0");
}

export function isMuted() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem("cmw:muted") === "1";
}

type ToneOpts = {
  freq: number;
  dur?: number;
  type?: OscillatorType;
  gain?: number;
  delay?: number;
  slideTo?: number;
};

function tone({ freq, dur = 0.16, type = "triangle", gain = 0.16, delay = 0, slideTo }: ToneOpts) {
  if (muted) return;
  const audio = ac();
  if (!audio) return;
  const t0 = audio.currentTime + delay;
  const osc = audio.createOscillator();
  const amp = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(40, slideTo), t0 + dur);
  amp.gain.setValueAtTime(0.0001, t0);
  amp.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(amp).connect(audio.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

function noise(dur = 0.18, gain = 0.08, delay = 0) {
  if (muted) return;
  const audio = ac();
  if (!audio) return;
  const frames = Math.floor(audio.sampleRate * dur);
  const buffer = audio.createBuffer(1, frames, audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
  const src = audio.createBufferSource();
  src.buffer = buffer;
  const filter = audio.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 1400;
  const amp = audio.createGain();
  amp.gain.value = gain;
  src.connect(filter).connect(amp).connect(audio.destination);
  src.start(audio.currentTime + delay);
}

const SCALE = [523.25, 587.33, 659.25, 698.46, 783.99, 880, 987.77, 1046.5, 1174.66, 1318.51];

export const sfx = {
  /** Rising pluck — pitch climbs with the combo counter. */
  splash(combo: number) {
    const freq = SCALE[Math.min(SCALE.length - 1, combo)];
    tone({ freq, dur: 0.14, type: "triangle", gain: 0.13 });
    tone({ freq: freq * 2, dur: 0.09, type: "sine", gain: 0.05, delay: 0.01 });
    noise(0.07, 0.03);
  },
  brush() {
    noise(0.06, 0.025);
  },
  click() {
    tone({ freq: 320, dur: 0.06, type: "square", gain: 0.05 });
  },
  tool() {
    tone({ freq: 620, dur: 0.07, type: "triangle", gain: 0.07, slideTo: 880 });
  },
  deny() {
    tone({ freq: 180, dur: 0.18, type: "sawtooth", gain: 0.07, slideTo: 110 });
  },
  undo() {
    tone({ freq: 480, dur: 0.1, type: "sine", gain: 0.07, slideTo: 300 });
  },
  /** Five note fanfare for a finished picture. */
  complete() {
    [0, 2, 4, 7, 9].forEach((step, i) => {
      tone({ freq: SCALE[step] / 2, dur: 0.34, type: "triangle", gain: 0.13, delay: i * 0.11 });
      tone({ freq: SCALE[step], dur: 0.28, type: "sine", gain: 0.07, delay: i * 0.11 });
    });
    noise(0.5, 0.03, 0.5);
  },
  unlock() {
    [0, 4, 7].forEach((step, i) => tone({ freq: SCALE[step] * 1.5, dur: 0.26, type: "sine", gain: 0.1, delay: i * 0.09 }));
  },
  save() {
    tone({ freq: 440, dur: 0.14, type: "sine", gain: 0.09, slideTo: 990 });
    noise(0.16, 0.03, 0.05);
  },
};

/** Unlock the audio context on the first gesture anywhere. */
export function primeAudio() {
  if (typeof window === "undefined") return;
  ac();
}
