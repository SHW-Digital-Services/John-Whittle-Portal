import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Heart,
  CheckCircle2,
  Clock,
  Feather,
} from 'lucide-react';
import type { MeditationDurationMinutes } from '../lib/media';

interface GuidedMeditationTimerProps {
  isDarkMode: boolean;
  onSessionComplete?: (durationMinutes: number) => void;
  onPlayAltarAudio: () => void;
  onDurationChange?: (durationMinutes: MeditationDurationMinutes) => void;
}

const DURATION_OPTIONS: { minutes: MeditationDurationMinutes; label: string; desc: string }[] = [
  { minutes: 5, label: '5 Minutes', desc: 'Short Mindful Breath' },
  { minutes: 10, label: '10 Minutes', desc: 'Deep Stillness & Peace' },
  { minutes: 15, label: '15 Minutes', desc: 'Sacred Mindful Connection' },
  { minutes: 3, label: '3 Minutes', desc: 'Gentle Pause' },
];

const MINDFUL_PROMPTS = [
  'Quiet the mind. Feel John’s enduring martial calm and gentle, loving presence.',
  'Energy cannot be created or destroyed. In peaceful silence, we remain forever connected.',
  'Inhale universal peace... Exhale grief, sorrow, and tension.',
  'Allow John’s strength, honor, and Reiki warmth to settle quietly in your heart.',
  'Breathe into your heart center. Send your love and thoughts across the heavens.',
  'Just for today, do not be angry. Do not worry. Be filled with gratitude.',
  'You are held in the eternal flow of Qi. John is at peace in heaven.',
  'Rest in this quiet sanctuary. There is nothing to achieve, only love to share.',
];

export const GuidedMeditationTimer: React.FC<GuidedMeditationTimerProps> = ({
  isDarkMode,
  onSessionComplete,
  onPlayAltarAudio,
  onDurationChange,
}) => {
  const [selectedMinutes, setSelectedMinutes] = useState<number>(5);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(5 * 60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [showBreathingGuide, setShowBreathingGuide] = useState<boolean>(true);
  const [currentPromptIndex, setCurrentPromptIndex] = useState<number>(0);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Rest'>('Inhale');

  const totalSeconds = selectedMinutes * 60;
  const progressPercent = ((totalSeconds - secondsRemaining) / totalSeconds) * 100;

  // Timer Countdown Effect
  useEffect(() => {
    let interval: number | null = null;

    if (isActive && secondsRemaining > 0) {
      interval = window.setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, secondsRemaining]);

  // Breathing Visualizer Loop (4s Inhale, 2s Hold, 4s Exhale, 2s Rest = 12s cycle)
  useEffect(() => {
    if (!isActive) return;

    let breathTimer: number;
    let cycleTime = 0;

    const runBreathCycle = () => {
      const remainder = cycleTime % 12;
      if (remainder < 4) {
        setBreathPhase('Inhale');
      } else if (remainder < 6) {
        setBreathPhase('Hold');
      } else if (remainder < 10) {
        setBreathPhase('Exhale');
      } else {
        setBreathPhase('Rest');
      }
      cycleTime += 1;
    };

    runBreathCycle();
    breathTimer = window.setInterval(runBreathCycle, 1000);

    return () => clearInterval(breathTimer);
  }, [isActive]);

  // Rotating Mindful Prompts every 25 seconds
  useEffect(() => {
    if (!isActive) return;

    const promptInterval = window.setInterval(() => {
      setCurrentPromptIndex((prev) => (prev + 1) % MINDFUL_PROMPTS.length);
    }, 25000);

    return () => clearInterval(promptInterval);
  }, [isActive]);

  const handleSelectDuration = (mins: MeditationDurationMinutes) => {
    if (isActive) return;
    setSelectedMinutes(mins);
    setSecondsRemaining(mins * 60);
    setIsCompleted(false);
    onDurationChange?.(mins);
  };

  const handleStart = () => {
    if (secondsRemaining === 0) {
      setSecondsRemaining(selectedMinutes * 60);
    }
    setIsActive(true);
    setIsCompleted(false);
    onPlayAltarAudio();
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setIsCompleted(false);
    setSecondsRemaining(selectedMinutes * 60);
  };

  const handleComplete = () => {
    setIsActive(false);
    setIsCompleted(true);
    onPlayAltarAudio();

    if (onSessionComplete) {
      onSessionComplete(selectedMinutes);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // SVG circular progress parameters
  const radius = 88;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div
      className={`rounded-3xl border p-6 sm:p-8 transition-all shadow-xl backdrop-blur-md ${
        isDarkMode
          ? 'bg-neutral-900/80 border-purple-500/30 text-neutral-100 shadow-purple-950/30'
          : 'bg-white/95 border-stone-200 text-neutral-900 shadow-stone-200/60'
      }`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800/80">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-purple-950/40 border border-purple-500/40 text-purple-300 text-xs mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Altar Mindfulness & Qi</span>
          </div>
          <h3 className="font-serif text-2xl font-semibold text-neutral-100 flex items-center gap-2">
            Guided Meditation & Mindful Connection
          </h3>
          <p className="text-xs text-neutral-400 mt-1 max-w-lg leading-relaxed">
            Enter a period of peaceful silence to connect with <span className="text-red-700 dark:text-red-400">John Alan Whittle</span> in spirit, still the
            mind, and recharge your inner Qi.
          </p>
        </div>

      </div>

      {/* Main Meditation Workspace */}
      <div className="py-8 flex flex-col items-center justify-center space-y-8">
        {/* State 1: Duration Selector (when not active) */}
        {!isActive && !isCompleted && (
          <div className="w-full max-w-md space-y-3 text-center">
            <span className="text-xs uppercase tracking-widest text-neutral-400 font-medium">
              Choose Stillness Duration
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt.minutes}
                  onClick={() => handleSelectDuration(opt.minutes)}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    selectedMinutes === opt.minutes
                      ? 'border-purple-500 bg-purple-950/40 text-purple-200 shadow-md shadow-purple-950/50 scale-[1.02]'
                      : 'border-neutral-800 bg-neutral-950/50 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                  }`}
                >
                  <div className="font-serif text-lg font-semibold text-neutral-100">
                    {opt.minutes}m
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* State 2: Circular Progress Timer & Breathing Circle */}
        <div className="relative flex items-center justify-center">
          {/* Subtle Ambient Halo */}
          <div
            className={`absolute -inset-4 rounded-full blur-xl transition-all duration-1000 -z-10 ${
              isActive
                ? breathPhase === 'Inhale'
                  ? 'bg-emerald-500/20 scale-110'
                  : breathPhase === 'Exhale'
                  ? 'bg-purple-600/20 scale-95'
                  : 'bg-amber-500/15 scale-100'
                : 'bg-neutral-800/10'
            }`}
          />

          {/* SVG Circular Ring */}
          <svg className="w-56 h-56 transform -rotate-90">
            {/* Background Track */}
            <circle
              cx="112"
              cy="112"
              r={radius}
              stroke="currentColor"
              strokeWidth="6"
              fill="transparent"
              className="text-neutral-800/60"
            />
            {/* Animated Progress Arc */}
            <circle
              cx="112"
              cy="112"
              r={radius}
              stroke="url(#meditationGradient)"
              strokeWidth="7"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-linear"
            />
            {/* Gradient definition */}
            <defs>
              <linearGradient id="meditationGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="50%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center Inner Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            {isCompleted ? (
              <div className="space-y-1 animate-fade-in">
                <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
                <span className="font-serif text-lg font-semibold text-neutral-100">
                  Peace Achieved
                </span>
                <span className="text-[11px] text-emerald-400 block font-calligraphy">
                  道氣長存
                </span>
              </div>
            ) : (
              <>
                <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-mono">
                  {isActive ? 'Mindful Silence' : 'Ready'}
                </span>

                <div className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-neutral-100 my-0.5 font-mono">
                  {formatTime(secondsRemaining)}
                </div>

                {isActive && showBreathingGuide && (
                  <div className="text-xs font-medium text-emerald-400 flex items-center gap-1 transition-all">
                    <span>{breathPhase}</span>
                    <span className="text-[10px] text-neutral-500">
                      {breathPhase === 'Inhale' && '↑ (expand)'}
                      {breathPhase === 'Hold' && '· (peace)'}
                      {breathPhase === 'Exhale' && '↓ (release)'}
                      {breathPhase === 'Rest' && '· (stillness)'}
                    </span>
                  </div>
                )}

                {!isActive && (
                  <span className="text-xs text-purple-400 font-medium">
                    {selectedMinutes} Min Session
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Guided Mindfulness Thought Prompt */}
        {isActive && (
          <div className="max-w-md mx-auto text-center px-4 min-h-[48px] flex items-center justify-center transition-all animate-fade-in">
            <blockquote className="font-serif italic text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-sm">
              "{MINDFUL_PROMPTS[currentPromptIndex]}"
            </blockquote>
          </div>
        )}

        {/* State 3: Session Complete Card */}
        {isCompleted && (
          <div className="max-w-md mx-auto rounded-2xl border border-emerald-500/40 bg-emerald-950/30 p-5 text-center space-y-3 shadow-lg">
            <div className="text-2xl">☯️</div>
            <h4 className="font-serif text-lg font-semibold text-neutral-100">
              Session Complete
            </h4>
            <p className="text-xs text-neutral-300 leading-relaxed">
              You dedicated {selectedMinutes} minutes of mindful silence to connect with <span className="text-red-700 dark:text-red-400">John Alan Whittle</span>.
              His martial spirit, Reiki wisdom, and love remain quietly with you always.
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-neutral-200 hover:text-white transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Begin Another Session</span>
              </button>
            </div>
          </div>
        )}

        {/* Control Buttons */}
        {!isCompleted && (
          <div className="flex items-center gap-3">
            {!isActive ? (
              <button
                onClick={handleStart}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-purple-700 to-emerald-600 hover:opacity-95 text-white font-medium text-sm transition-all shadow-lg shadow-purple-950/50"
              >
                <Play className="h-4 w-4 fill-white" />
                <span>Begin Meditation</span>
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-sm transition-colors border border-neutral-700"
              >
                <Pause className="h-4 w-4" />
                <span>Pause</span>
              </button>
            )}

            {(isActive || secondsRemaining !== selectedMinutes * 60) && (
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-4 py-3 rounded-2xl border border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900 transition-colors text-xs font-medium"
                title="End session or reset timer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer Info / Breathing Guide Toggle */}
      <div className="pt-4 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-400">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="breathToggle"
            checked={showBreathingGuide}
            onChange={(e) => setShowBreathingGuide(e.target.checked)}
            className="h-3.5 w-3.5 rounded border-neutral-700 bg-neutral-950 text-purple-600 focus:ring-purple-500"
          />
          <label htmlFor="breathToggle" className="cursor-pointer text-[11px] text-neutral-400">
            Show Gentle Breath Visualizer (4s-2s-4s-2s Zen Rhythm)
          </label>
        </div>

        <div className="text-[11px] text-neutral-500 font-sans">
          <span>In Memory of <span className="text-red-700 dark:text-red-400">John Alan Whittle</span> · </span>
          <span className="font-calligraphy text-amber-400/90">慎終追遠，民德歸厚矣</span>
        </div>
      </div>
    </div>
  );
};
