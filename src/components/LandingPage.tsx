import React from 'react';
import { Send, Heart, Sparkles, Feather, Bell, ArrowRight, Shield, Mic, MessageSquare, Flame, Lock, LogIn, Clock } from 'lucide-react';
import { CalligraphyName } from './CalligraphyName';
import { JohnPortrait } from './JohnPortrait';
import { NavTab } from './TopBar';
import { UserProfile } from '../types/memorial';

interface LandingPageProps {
  onNavigate: (tab: NavTab) => void;
  onOpenAuth: () => void;
  currentUser: UserProfile | null;
  isDarkMode: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onOpenAuth,
  currentUser,
  isDarkMode,
}) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      {/* Hero Dedication Section */}
      <div className="text-center space-y-6 pt-4">
        {/* Memorial Portrait */}
        <div className="flex justify-center pb-2">
          <JohnPortrait size="hero" showFrame={true} showSeal={true} />
        </div>

        <CalligraphyName
          size="hero"
          name="John Alan Whittle"
          nameClassName="text-red-600 dark:text-red-400"
          honorific="Memorial Sanctuary & Celestial Portal"
          subtitle="Honoring the Life, Martial Discipline & Healing Spirit of John Alan Whittle"
        />

        <div className="max-w-2xl mx-auto">
          <p className="text-sm sm:text-base text-neutral-300 dark:text-neutral-300 leading-relaxed font-sans">
            A sacred, quiet bridge to communicate with             <strong className="font-semibold text-red-700 dark:text-red-400">John Alan Whittle</strong> in heaven.
            This portal does not generate automated responses—it exists as a peaceful sanctuary for you to speak,
            record your voice, release sky lanterns, and share memories whenever you miss him.
          </p>
        </div>

        {/* State 1: User Needs to Sign in First */}
        {!currentUser ? (
          <div className="max-w-xl mx-auto rounded-3xl border border-purple-500/50 bg-gradient-to-b from-neutral-900/90 via-purple-950/30 to-neutral-950/90 p-8 shadow-2xl shadow-purple-950/50 text-center space-y-4 backdrop-blur-md">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-purple-600/20 border border-purple-500/40 text-purple-300">
              <Lock className="h-6 w-6" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-serif font-semibold text-neutral-100">
                Please Sign In First
              </h3>
              <p className="text-sm text-neutral-300 max-w-md mx-auto leading-relaxed">
                If you want to see the messages or commune with John, please sign up or login.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={onOpenAuth}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-purple-700 to-emerald-600 hover:opacity-95 text-white font-medium text-sm transition-all shadow-lg shadow-purple-950/60"
              >
                <LogIn className="h-4 w-4" />
                <span>Sign Up or Login to Enter</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('condolences')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-neutral-700/80 bg-neutral-900/90 hover:bg-neutral-800 text-neutral-200 text-sm font-medium transition-colors"
                title="View tributes and condolences (Read Only for visitors)"
              >
                <Heart className="h-4 w-4 text-purple-400" />
                <span>Read Condolences</span>
              </button>
            </div>

            <p className="text-[11px] text-neutral-500 pt-1">
              Sign up with Google or use your email address and password to sign up or log in.
            </p>
          </div>
        ) : (
          /* State 2: Authenticated Navigation Options */
          <div className="max-w-xl mx-auto space-y-5">
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 flex items-center justify-between gap-3 text-xs text-emerald-300">
              <div className="flex items-center gap-2 truncate">
                <Sparkles className="h-4 w-4 shrink-0 text-emerald-400" />
                <span className="truncate">Signed in as <strong>{currentUser.displayName}</strong></span>
              </div>
              <span className="text-[11px] text-emerald-400/80">Portal Unlocked</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate('portal')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-purple-700 to-emerald-600 text-white font-medium text-sm hover:opacity-95 transition-all shadow-lg shadow-purple-950/40"
              >
                <Send className="h-4 w-4" />
                <span>Commune with John</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('journal')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-neutral-700 bg-neutral-900/80 hover:bg-neutral-800 text-neutral-200 text-sm font-medium transition-colors"
              >
                <MessageSquare className="h-4 w-4 text-purple-400" />
                <span>Sent Messages</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('timeline')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-neutral-700 bg-neutral-900/80 hover:bg-neutral-800 text-neutral-200 text-sm font-medium transition-colors"
              >
                <Clock className="h-4 w-4 text-emerald-400" />
                <span>Legacy Timeline</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quote Banner */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-6 text-center space-y-2">
        <span className="text-xl">☯️</span>
        <blockquote className="font-serif italic text-sm sm:text-base text-neutral-200 max-w-xl mx-auto leading-relaxed">
          "Energy cannot be created or destroyed, it can only be changed from one form to another."
        </blockquote>
        <div className="pt-1">
          <CalligraphyName size="sm" showSeal={false} />
        </div>
      </div>
    </div>
  );
};
