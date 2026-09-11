import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

interface SoundContextValue {
  muted: boolean;
  toggleMute: () => void;
  playClick: () => void;
  ambient: boolean;
  toggleAmbient: () => void;
}

const SoundContext = createContext<SoundContextValue>({
  muted: false,
  toggleMute: () => {},
  playClick: () => {},
  ambient: false,
  toggleAmbient: () => {},
});

export const SoundProvider = ({ children }: PropsWithChildren) => {
  const [muted, setMuted] = useState<boolean>(() => {
    try {
      return localStorage.getItem("sfx-muted") === "1";
    } catch {
      return false;
    }
  });
  const mutedRef = useRef(muted);
  mutedRef.current = muted;
  const ctxRef = useRef<AudioContext | null>(null);

  const ensureCtx = () => {
    if (!ctxRef.current) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (AC) ctxRef.current = new AC();
    }
    if (ctxRef.current && ctxRef.current.state === "suspended") {
      ctxRef.current.resume().catch(() => {});
    }
    return ctxRef.current;
  };

  const beep = useCallback(
    (
      freq: number,
      dur: number,
      type: OscillatorType = "square",
      vol = 0.04
    ) => {
      if (mutedRef.current) return;
      const ctx = ensureCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + dur);
    },
    []
  );

  const playClick = useCallback(() => beep(820, 0.05, "square", 0.03), [beep]);

  const [ambient, setAmbient] = useState<boolean>(() => {
    try {
      return localStorage.getItem("ambient-on") === "1";
    } catch {
      return false;
    }
  });
  const ambientRef = useRef<{ stop: () => void } | null>(null);

  const startAmbient = (ctx: AudioContext) => {
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, ctx.currentTime);
    master.connect(ctx.destination);

    // low machine hum (two detuned drones, more audible harmonics)
    const humGain = ctx.createGain();
    humGain.gain.value = 0.5;
    const osc1 = ctx.createOscillator();
    osc1.type = "sine";
    osc1.frequency.value = 55;
    const osc2 = ctx.createOscillator();
    osc2.type = "sine";
    osc2.frequency.value = 110.5;
    const osc3 = ctx.createOscillator();
    osc3.type = "triangle";
    osc3.frequency.value = 165.3;
    const osc4 = ctx.createOscillator();
    osc4.type = "sine";
    osc4.frequency.value = 220.8;
    osc1.connect(humGain);
    osc2.connect(humGain);
    osc3.connect(humGain);
    osc4.connect(humGain);
    humGain.connect(master);

    // soft filtered noise bed
    const bufferSize = Math.floor(ctx.sampleRate * 2);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 400;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.03;
    noise.connect(lp);
    lp.connect(noiseGain);
    noiseGain.connect(master);

    master.gain.linearRampToValueAtTime(0.09, ctx.currentTime + 1.4);
    osc1.start();
    osc2.start();
    osc3.start();
    osc4.start();
    noise.start();

    ambientRef.current = {
      stop: () => {
        const t = ctx.currentTime;
        master.gain.cancelScheduledValues(t);
        master.gain.linearRampToValueAtTime(0.0001, t + 0.6);
        osc1.stop(t + 0.7);
        osc2.stop(t + 0.7);
        osc3.stop(t + 0.7);
        osc4.stop(t + 0.7);
        noise.stop(t + 0.7);
      },
    };
  };

  useEffect(() => {
    if (ambient) {
      const ctx = ensureCtx();
      if (ctx) startAmbient(ctx);
    } else if (ambientRef.current) {
      ambientRef.current.stop();
      ambientRef.current = null;
    }
  }, [ambient]);

  const toggleAmbient = useCallback(() => {
    setAmbient((prev) => {
      const next = !prev;
      if (next) ensureCtx();
      try {
        localStorage.setItem("ambient-on", next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const onKey = () => beep(1240, 0.03, "square", 0.025);
    const onClick = () => playClick();
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, [beep, playClick]);

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("sfx-muted", next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  return (
    <SoundContext.Provider
      value={{ muted, toggleMute, playClick, ambient, toggleAmbient }}
    >
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => useContext(SoundContext);