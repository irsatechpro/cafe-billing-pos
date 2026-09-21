import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export default function AmbientSoundPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef(null);
  const noiseNodeRef = useRef(null);
  const gainNodeRef = useRef(null);

  const toggleSound = () => {
    if (isPlaying) {
      if (audioCtxRef.current) {
        audioCtxRef.current.suspend();
      }
      setIsPlaying(false);
    } else {
      if (!audioCtxRef.current) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioContext();
        audioCtxRef.current = ctx;

        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.05;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(350, ctx.currentTime);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.15, ctx.currentTime);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        noise.start();
        noiseNodeRef.current = noise;
        gainNodeRef.current = gain;
      } else {
        audioCtxRef.current.resume();
      }
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  return (
    <button
      onClick={toggleSound}
      className={`inline-flex items-center space-x-2 px-5 py-2.5 rounded-full border text-xs font-sans tracking-widest uppercase transition-all duration-300 backdrop-blur-md ${
        isPlaying
          ? 'bg-gold text-parchment-50 border-gold font-bold shadow-md'
          : 'bg-parchment-50/90 text-espresso-950 border-gold/40 hover:border-gold shadow-sm'
      }`}
    >
      {isPlaying ? (
        <>
          <Volume2 className="w-4 h-4 text-parchment-50 animate-pulse" />
          <span>AMBIENCE PLAYING</span>
        </>
      ) : (
        <>
          <VolumeX className="w-4 h-4 text-gold-dark" />
          <span>PLAY CAFÉ AMBIENCE</span>
        </>
      )}
    </button>
  );
}
