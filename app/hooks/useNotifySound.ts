/**
 * useNotifySound
 *
 * Plays distinct Web Audio API tones for different order status events.
 * No external audio files needed — all sounds are synthesised in-browser.
 *
 * Usage:
 *   const play = useNotifySound();
 *   play("confirmed");   // pleasant upward chime
 *   play("declined");    // descending low tone
 *   play("preparing");   // gentle ping
 *   play("ready");       // bright double-ping
 *   play("served");      // warm single tone
 *   play("info");        // soft neutral click
 */

import { useCallback, useRef } from "react";

export type SoundType = "confirmed" | "declined" | "preparing" | "ready" | "served" | "info" | "warning";

interface Note { freq: number; duration: number; delay: number; type?: OscillatorType; gain?: number }

const SOUND_SEQUENCES: Record<SoundType, Note[]> = {
  // Confirmed
  confirmed: [
    { freq: 523.25, duration: 0.12, delay: 0,    type: "sine",     gain: 0.5 },
    { freq: 659.25, duration: 0.12, delay: 0.13, type: "sine",     gain: 0.5 },
    { freq: 783.99, duration: 0.22, delay: 0.26, type: "sine",     gain: 0.6 },
  ],
  // Declined
  declined: [
    { freq: 440,    duration: 0.18, delay: 0,    type: "triangle", gain: 0.45 },
    { freq: 349.23, duration: 0.18, delay: 0.2,  type: "triangle", gain: 0.45 },
    { freq: 261.63, duration: 0.3,  delay: 0.4,  type: "triangle", gain: 0.35 },
  ],
  // Preparing
  preparing: [
    { freq: 600,    duration: 0.15, delay: 0,    type: "sine",     gain: 0.35 },
  ],
  // Ready
  ready: [
    { freq: 880,    duration: 0.1,  delay: 0,    type: "sine",     gain: 0.5 },
    { freq: 1046.5, duration: 0.18, delay: 0.12, type: "sine",     gain: 0.55 },
  ],
  // Served
  served: [
    { freq: 528,    duration: 0.25, delay: 0,    type: "sine",     gain: 0.4 },
  ],
  // Info
  info: [
    { freq: 440,    duration: 0.1,  delay: 0,    type: "sine",     gain: 0.25 },
  ],
  // Warning
  warning: [
    { freq: 380,    duration: 0.12, delay: 0,    type: "triangle", gain: 0.4 },
    { freq: 340,    duration: 0.15, delay: 0.15, type: "triangle", gain: 0.35 },
  ],
};

export function useNotifySound() {
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = () => {
    if (!ctxRef.current || ctxRef.current.state === "closed") {
      ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    // Resume if suspended (browser autoplay policy)
    if (ctxRef.current.state === "suspended") ctxRef.current.resume();
    return ctxRef.current;
  };

  const play = useCallback((type: SoundType) => {
    try {
      const ctx = getCtx();
      const sequence = SOUND_SEQUENCES[type] ?? SOUND_SEQUENCES.info;
      const now = ctx.currentTime;

      sequence.forEach(({ freq, duration, delay, type: waveType = "sine", gain = 0.4 }) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = waveType;
        osc.frequency.setValueAtTime(freq, now + delay);

        // Soft attack + exponential release
        gainNode.gain.setValueAtTime(0, now + delay);
        gainNode.gain.linearRampToValueAtTime(gain, now + delay + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + delay + duration);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(now + delay);
        osc.stop(now + delay + duration + 0.05);
      });
    } catch {
      // Silently fail — audio is non-critical
    }
  }, []);

  return play;
}
