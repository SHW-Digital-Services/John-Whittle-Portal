import React, { useState } from 'react';

interface IncenseBurnerProps {
  count: number;
  onLight: () => Promise<void>;
  onPlaySound: () => void;
}

export function IncenseBurner({ count, onLight, onPlaySound }: IncenseBurnerProps) {
  const [lit, setLit] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  const light = async () => {
    if (pending) return;
    const previouslyLit = lit;
    setLit(true); setPending(true); setError('');
    onPlaySound();
    try { await onLight(); }
    catch { setLit(previouslyLit); setError('Could not record your incense offering. Please try again.'); }
    finally { setPending(false); }
  };

  return <div className="relative z-10 mx-auto mt-8 max-w-sm text-center">
    <button type="button" onClick={light} disabled={pending} aria-label="Light incense" aria-pressed={lit} className="incense-burner group w-full rounded-2xl border border-amber-700/40 bg-neutral-950/60 px-5 pb-5 pt-2 text-neutral-100 shadow-lg transition-colors hover:border-amber-400/70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-400 disabled:cursor-wait" data-lit={lit}>
      <span className="incense-scene" aria-hidden="true">
        <span className="incense-smoke-area">
          {lit && [0, 1, 2, 3, 4].map(i => <span key={i} className="incense-smoke" style={{ animationDelay: `${i * -1.1}s`, left: `${44 + i * 3}%` }} />)}
        </span>
        <span className="incense-stick"><span className="incense-ember" /></span>
        <span className="incense-bowl-rim" />
        <span className="incense-bowl"><span className="incense-bowl-mark">✦</span></span>
        <span className="incense-bowl-foot" />
      </span>
      <span className="block font-serif text-lg text-amber-200">Sandalwood Incense</span>
      <span className="mt-1 block text-xs text-neutral-400">{pending ? 'Offering incense…' : lit ? 'Smoke rises gently. Click to offer another stick.' : 'Click to light incense for John.'}</span>
      <span className="mt-2 block text-xs font-mono text-amber-300/80">{count} lit</span>
    </button>
    <p role="status" className="sr-only">{lit ? 'Incense is lit. Gentle smoke is rising.' : 'Incense is unlit.'}</p>
    {error && <p role="alert" className="mt-2 text-sm text-red-400">{error}</p>}
  </div>;
}
