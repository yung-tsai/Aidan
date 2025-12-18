import { useState, useEffect, useRef, useCallback } from "react";

type SoundType = "off" | "whitenoise" | "rain" | "nature";

interface AmbientSoundPlayerProps {
  isPlaying: boolean;
}

const AmbientSoundPlayer = ({ isPlaying }: AmbientSoundPlayerProps) => {
  const [activeSound, setActiveSound] = useState<SoundType>("off");
  const [volume, setVolume] = useState(0.3);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const noiseBufferRef = useRef<AudioBuffer | null>(null);

  const sounds: { id: SoundType; label: string; icon: string }[] = [
    { id: "off", label: "OFF", icon: "○" },
    { id: "whitenoise", label: "WHITE", icon: "◇" },
    { id: "rain", label: "RAIN", icon: "◆" },
    { id: "nature", label: "FOREST", icon: "△" },
  ];

  // Create noise buffer
  const createNoiseBuffer = useCallback((ctx: AudioContext, type: SoundType): AudioBuffer => {
    const bufferSize = ctx.sampleRate * 2; // 2 seconds of audio
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      if (type === "whitenoise") {
        // Pure white noise
        data[i] = Math.random() * 2 - 1;
      } else if (type === "rain") {
        // Rain-like noise (filtered white noise with occasional "drops")
        const noise = Math.random() * 2 - 1;
        const drop = Math.random() > 0.997 ? (Math.random() * 0.5) : 0;
        data[i] = noise * 0.4 + drop;
      } else if (type === "nature") {
        // Nature-like noise (layered with subtle modulation)
        const t = i / ctx.sampleRate;
        const noise = Math.random() * 2 - 1;
        const windMod = Math.sin(t * 0.5) * 0.3 + 0.7;
        const birdChirp = Math.random() > 0.9995 
          ? Math.sin(t * 2000 + Math.random() * 1000) * 0.2 
          : 0;
        data[i] = noise * 0.25 * windMod + birdChirp;
      }
    }

    return buffer;
  }, []);

  // Start playing
  const startSound = useCallback((type: SoundType) => {
    if (type === "off") {
      stopSound();
      return;
    }

    // Stop existing sound
    stopSound();

    // Create or resume audio context
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }

    const ctx = audioContextRef.current;
    
    // Create gain node for volume
    const gainNode = ctx.createGain();
    gainNode.gain.value = volume;
    gainNode.connect(ctx.destination);
    gainNodeRef.current = gainNode;

    // Create noise buffer and source
    const buffer = createNoiseBuffer(ctx, type);
    noiseBufferRef.current = buffer;

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(gainNode);
    source.start();
    sourceNodeRef.current = source;
  }, [volume, createNoiseBuffer]);

  // Stop playing
  const stopSound = useCallback(() => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
      } catch {
        // Ignore if already stopped
      }
      sourceNodeRef.current = null;
    }
  }, []);

  // Handle sound type change
  const handleSoundChange = (type: SoundType) => {
    setActiveSound(type);
    if (isPlaying) {
      startSound(type);
    }
  };

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = newVolume;
    }
  };

  // Start/stop based on isPlaying prop
  useEffect(() => {
    if (isPlaying && activeSound !== "off") {
      startSound(activeSound);
    } else {
      stopSound();
    }

    return () => {
      stopSound();
    };
  }, [isPlaying, activeSound, startSound, stopSound]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSound();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stopSound]);

  return (
    <div className="w-full">
      {/* Sound type selector */}
      <div className="flex items-center justify-center gap-2 mb-4">
        {sounds.map((sound) => (
          <button
            key={sound.id}
            onClick={() => handleSoundChange(sound.id)}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
              activeSound === sound.id
                ? "bg-braun-orange text-white"
                : "bg-device-inset text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="text-lg">{sound.icon}</span>
            <span className="text-[9px] font-semibold tracking-wider">{sound.label}</span>
          </button>
        ))}
      </div>

      {/* Volume slider */}
      {activeSound !== "off" && (
        <div className="flex items-center gap-3 px-4">
          <span className="text-xs text-muted-foreground">VOL</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={handleVolumeChange}
            className="flex-1 h-1 bg-device-inset rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-4
              [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-braun-orange
              [&::-webkit-slider-thumb]:cursor-pointer"
          />
          <span className="text-xs text-muted-foreground w-8 text-right">
            {Math.round(volume * 100)}%
          </span>
        </div>
      )}
    </div>
  );
};

export default AmbientSoundPlayer;
