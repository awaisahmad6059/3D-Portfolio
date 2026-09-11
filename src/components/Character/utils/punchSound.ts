let ctx: AudioContext | null = null;

const getCtx = () => {
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    ctx = new AC();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
};

const noiseBuffer = (ac: AudioContext) => {
  const length = ac.sampleRate * 0.15;
  const buffer = ac.createBuffer(1, length, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
};

/** Short synthesized punch/slap — no audio files needed. */
export const playPunchSound = (power = 1) => {
  try {
    const ac = getCtx();
    const now = ac.currentTime;

    // low thump
    const osc = ac.createOscillator();
    const oscGain = ac.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(160 + Math.random() * 40, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.18);
    oscGain.gain.setValueAtTime(0.0001, now);
    oscGain.gain.exponentialRampToValueAtTime(0.6 * power, now + 0.012);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
    osc.connect(oscGain).connect(ac.destination);
    osc.start(now);
    osc.stop(now + 0.3);

    // "thwack" noise burst
    const noise = ac.createBufferSource();
    noise.buffer = noiseBuffer(ac);
    const filter = ac.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 900 + Math.random() * 300;
    const noiseGain = ac.createGain();
    noiseGain.gain.setValueAtTime(0.4 * power, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
    noise.connect(filter).connect(noiseGain).connect(ac.destination);
    noise.start(now);
    noise.stop(now + 0.12);
  } catch {
    /* audio unavailable — ignore */
  }
};