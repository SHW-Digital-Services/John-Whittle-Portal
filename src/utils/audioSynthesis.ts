/**
 * Ambient Eastern audio synthesis & custom track manager using Web Audio API.
 * Provides authentic Tibetan singing bowl chimes, pentatonic resonant bells,
 * and seamless playback for custom user-uploaded background music.
 */

let audioCtx: AudioContext | null = null;
let ambientGainNode: GainNode | null = null;
let ambientTimer: number | null = null;
let isAmbientRunning = false;
const activeAudioNodes = new Set<AudioScheduledSourceNode>();
const scheduledChimeTimers = new Set<number>();

function trackAudioNode<T extends AudioScheduledSourceNode>(node: T): void {
  activeAudioNodes.add(node);
  node.onended = () => activeAudioNodes.delete(node);
}

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Plays a resonant Tibetan singing bowl / temple bell harmonic chime.
 * Used when lighting incense, ringing the altar bell, or sending prayers to heaven.
 */
export function playSingingBowlChime(fundamental = 216, duration = 4.5, masterGainVal = 0.25): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Harmonic ratios for authentic singing bowl resonance
    const harmonics = [
      { freqMult: 1.0, gainMult: 0.5, decay: duration },
      { freqMult: 2.76, gainMult: 0.35, decay: duration * 0.8 },
      { freqMult: 5.4, gainMult: 0.15, decay: duration * 0.6 },
      { freqMult: 8.9, gainMult: 0.08, decay: duration * 0.4 },
    ];

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(masterGainVal, now);
    masterGain.connect(ctx.destination);

    harmonics.forEach(({ freqMult, gainMult, decay }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      trackAudioNode(osc);
      osc.frequency.setValueAtTime(fundamental * freqMult, now);

      // Subtle vibrato/detune beating
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      trackAudioNode(lfo);
      lfo.frequency.setValueAtTime(1.5, now);
      lfoGain.gain.setValueAtTime(1.2, now);
      lfo.connect(osc.frequency);
      lfo.start(now);
      lfo.stop(now + decay);

      gain.gain.setValueAtTime(gainMult, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + decay);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(now);
      osc.stop(now + decay);
    });
  } catch (err) {
    console.warn('Audio playback not allowed until user interaction', err);
  }
}

/**
 * Pentatonic Chinese scale frequencies for gentle wind chimes (Kung Fu & Zen heritage)
 * Gong 宫 (C4 ~261Hz), Shang 商 (D4 ~293Hz), Jiao 角 (E4 ~329Hz), Zhi 徵 (G4 ~392Hz), Yu 羽 (A4 ~440Hz)
 */
const PENTATONIC_SCALE = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25];

export function playPentatonicChime(volume = 0.2): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const note = PENTATONIC_SCALE[Math.floor(Math.random() * PENTATONIC_SCALE.length)];

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    trackAudioNode(osc);
    osc.frequency.setValueAtTime(note, now);

    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.0);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 3.0);
  } catch (err) {
    console.warn('Audio note play skipped', err);
  }
}

/**
 * Starts continuous meditative ambient temple soundscape
 */
export function startAmbientSoundscape(volume = 0.3): void {
  if (isAmbientRunning) return;
  try {
    const ctx = getAudioContext();
    ambientGainNode = ctx.createGain();
    ambientGainNode.gain.setValueAtTime(volume, ctx.currentTime);
    ambientGainNode.connect(ctx.destination);
    isAmbientRunning = true;

    // Periodic gentle chimes in pentatonic harmony
    const triggerChime = () => {
      if (!isAmbientRunning) return;
      playPentatonicChime(volume * 0.6);
      const nextDelay = 3500 + Math.random() * 5500;
      ambientTimer = window.setTimeout(triggerChime, nextDelay);
    };

    triggerChime();
  } catch (err) {
    console.warn('Ambient audio start deferred', err);
  }
}

export function stopAmbientSoundscape(): void {
  isAmbientRunning = false;
  if (ambientTimer) {
    clearTimeout(ambientTimer);
    ambientTimer = null;
  }
  if (ambientGainNode) {
    try {
      ambientGainNode.disconnect();
    } catch {}
    ambientGainNode = null;
  }
}

export function stopSynthesizedAudio(): void {
  activeAudioNodes.forEach((node) => {
    try {
      node.stop();
    } catch (error) {
      console.warn('Could not stop a synthesized audio node', error);
    }
  });
  activeAudioNodes.clear();
  scheduledChimeTimers.forEach(timer => window.clearTimeout(timer));
  scheduledChimeTimers.clear();
}

function scheduleChime(fundamental: number, delay: number, duration: number, gain: number): void {
  const timer = window.setTimeout(() => {
    scheduledChimeTimers.delete(timer);
    playSingingBowlChime(fundamental, duration, gain);
  }, delay);
  scheduledChimeTimers.add(timer);
}

/**
 * Resonant triple temple bell chime when meditation session finishes
 */
export function playMeditationEndBell(): void {
  playSingingBowlChime(216, 5.0, 0.28);
  scheduleChime(324, 1400, 5.5, 0.24);
  scheduleChime(432, 2800, 6.5, 0.22);
}

export function setAmbientVolume(volume: number): void {
  if (ambientGainNode && audioCtx) {
    ambientGainNode.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), audioCtx.currentTime);
  }
}
