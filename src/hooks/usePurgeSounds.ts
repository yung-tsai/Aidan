import { useCallback, useRef } from "react";

const usePurgeSounds = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeNodesRef = useRef<AudioNode[]>([]);

  const getAudioContext = useCallback(async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    // Resume if suspended (browser autoplay policy)
    if (audioContextRef.current.state === "suspended") {
      await audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  const stopAll = useCallback(() => {
    activeNodesRef.current.forEach(node => {
      try {
        if (node instanceof OscillatorNode || node instanceof AudioBufferSourceNode) {
          node.stop();
        }
        node.disconnect();
      } catch (e) {
        // Node already stopped
      }
    });
    activeNodesRef.current = [];
  }, []);

  // Airlock: Swooshing vacuum whoosh with rising pitch
  const playAirlock = useCallback(async () => {
    const ctx = await getAudioContext();
    const duration = 1.8;

    // Create white noise for the whoosh
    const bufferSize = ctx.sampleRate * duration;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    // High-pass filter that sweeps up (sucking out effect)
    const highpass = ctx.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.setValueAtTime(200, ctx.currentTime);
    highpass.frequency.exponentialRampToValueAtTime(4000, ctx.currentTime + duration);

    // Gain envelope - starts loud, fades out
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    noise.connect(highpass);
    highpass.connect(gainNode);
    gainNode.connect(ctx.destination);

    noise.start();
    noise.stop(ctx.currentTime + duration);

    activeNodesRef.current.push(noise, highpass, gainNode);
  }, [getAudioContext]);

  // Degauss: Warbling electronic buzz with unstable frequencies
  const playDegauss = useCallback(async () => {
    const ctx = await getAudioContext();
    const duration = 2.0;

    // Main oscillator - sawtooth for that CRT buzz
    const osc1 = ctx.createOscillator();
    osc1.type = "sawtooth";
    osc1.frequency.setValueAtTime(60, ctx.currentTime);

    // Secondary oscillator - square wave for harmonics
    const osc2 = ctx.createOscillator();
    osc2.type = "square";
    osc2.frequency.setValueAtTime(120, ctx.currentTime);

    // LFO for frequency wobble
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(8, ctx.currentTime);
    lfo.frequency.linearRampToValueAtTime(25, ctx.currentTime + duration);

    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(30, ctx.currentTime);
    lfoGain.gain.linearRampToValueAtTime(100, ctx.currentTime + duration);

    lfo.connect(lfoGain);
    lfoGain.connect(osc1.frequency);
    lfoGain.connect(osc2.frequency);

    // Distortion
    const distortion = ctx.createWaveShaper();
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
      const x = (i / 128) - 1;
      curve[i] = Math.tanh(x * 3);
    }
    distortion.curve = curve;

    // Gain with warble
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.25, ctx.currentTime + duration * 0.5);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    // Mix oscillators
    const mixer = ctx.createGain();
    mixer.gain.setValueAtTime(0.5, ctx.currentTime);

    osc1.connect(mixer);
    osc2.connect(mixer);
    mixer.connect(distortion);
    distortion.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start();
    osc2.start();
    lfo.start();
    osc1.stop(ctx.currentTime + duration);
    osc2.stop(ctx.currentTime + duration);
    lfo.stop(ctx.currentTime + duration);

    activeNodesRef.current.push(osc1, osc2, lfo, mixer, distortion, gainNode);
  }, [getAudioContext]);

  // Incinerate: Crackling fire with pops and low rumble
  const playIncinerate = useCallback(async () => {
    const ctx = await getAudioContext();
    const duration = 2.5;

    // Low rumble
    const rumble = ctx.createOscillator();
    rumble.type = "sine";
    rumble.frequency.setValueAtTime(40, ctx.currentTime);
    rumble.frequency.linearRampToValueAtTime(60, ctx.currentTime + duration);

    const rumbleGain = ctx.createGain();
    rumbleGain.gain.setValueAtTime(0.1, ctx.currentTime);
    rumbleGain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + duration * 0.7);
    rumbleGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    rumble.connect(rumbleGain);
    rumbleGain.connect(ctx.destination);

    rumble.start();
    rumble.stop(ctx.currentTime + duration);

    activeNodesRef.current.push(rumble, rumbleGain);

    // Crackling noise bursts
    const createCrackle = (startTime: number) => {
      const bufferSize = ctx.sampleRate * 0.05; // 50ms burst
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      
      for (let i = 0; i < bufferSize; i++) {
        // Random noise with sharp attack
        const envelope = Math.exp(-i / (bufferSize * 0.1));
        data[i] = (Math.random() * 2 - 1) * envelope;
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;

      // Bandpass for crackle character
      const bandpass = ctx.createBiquadFilter();
      bandpass.type = "bandpass";
      bandpass.frequency.value = 2000 + Math.random() * 3000;
      bandpass.Q.value = 1;

      const crackleGain = ctx.createGain();
      crackleGain.gain.value = 0.2 + Math.random() * 0.2;

      source.connect(bandpass);
      bandpass.connect(crackleGain);
      crackleGain.connect(ctx.destination);

      source.start(startTime);
      activeNodesRef.current.push(source, bandpass, crackleGain);
    };

    // Schedule random crackles throughout the duration
    for (let t = 0; t < duration; t += 0.05 + Math.random() * 0.1) {
      if (Math.random() > 0.3) {
        createCrackle(ctx.currentTime + t);
      }
    }
  }, [getAudioContext]);

  return { playAirlock, playDegauss, playIncinerate, stopAll };
};

export default usePurgeSounds;
