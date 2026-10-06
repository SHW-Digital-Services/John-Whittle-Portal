import React from 'react';
import { Sun, Moon, Send, Sparkles, Feather, User, LogIn, Lock, Clock } from 'lucide-react';
import { UserProfile } from '../types/memorial';
import { JohnPortrait } from './JohnPortrait';

export type NavTab = 'landing' | 'portal' | 'journal' | 'timeline' | 'condolences' | 'heritage' | 'altar' | 'gallery';

interface TopBarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onTabChange,
  isDarkMode,
  onToggleTheme,
  currentUser,
  onOpenAuth,
}) => {
  const handleNavClick = (tab: NavTab) => {
    // Unauthenticated users can access landing (Home) and condolences (Read Only)
    if (!currentUser) {
      if (tab === 'landing' || tab === 'condolences') {
        onTabChange(tab);
      } else {
        onOpenAuth();
      }
      return;
    }
    onTabChange(tab);
  };

  return (
    <header
      className={`sticky top-0 z-30 w-full border-b backdrop-blur-md transition-colors ${
        isDarkMode
          ? 'bg-neutral-950/85 border-neutral-800/80 text-neutral-100'
          : 'bg-stone-50/90 border-stone-200 text-neutral-900'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Title with Portrait Medallion */}
        <div
          onClick={() => onTabChange('landing')}
          className="cursor-pointer shrink-0 flex items-center gap-3 group"
          title="Return to Memorial Sanctuary Home"
        >
          <JohnPortrait size="avatar" showFrame={true} showSeal={false} />
          <div className="flex flex-col">
            <span className="font-serif text-base sm:text-lg font-semibold tracking-wide text-red-700 dark:text-red-400 group-hover:text-red-600 dark:group-hover:text-red-300 transition-colors">
              John Alan Whittle
            </span>
            <span className="font-calligraphy text-xs text-emerald-500 dark:text-emerald-400 -mt-0.5 tracking-wider">
              約翰 · 艾倫 · 惠特爾
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation links */}
        <nav className="hidden md:flex items-center gap-4 lg:gap-6 text-xs font-medium tracking-wide text-neutral-400">
          <button
            onClick={() => handleNavClick('landing')}
            className={`hover:text-purple-400 transition-colors whitespace-nowrap ${
              activeTab === 'landing' ? 'text-purple-400 font-semibold border-b-2 border-purple-500 pb-0.5' : ''
            }`}
          >
            Home
          </button>

          {/* For authenticated users: show all sanctuary portals */}
          {currentUser && (
            <>
              <button
                onClick={() => handleNavClick('portal')}
                className={`hover:text-purple-400 transition-colors whitespace-nowrap flex items-center gap-1 ${
                  activeTab === 'portal' ? 'text-purple-400 font-semibold border-b-2 border-purple-500 pb-0.5' : ''
                }`}
              >
                <span>Commune with John</span>
              </button>

              <button
                onClick={() => handleNavClick('journal')}
                className={`hover:text-purple-400 transition-colors whitespace-nowrap flex items-center gap-1 ${
                  activeTab === 'journal' ? 'text-purple-400 font-semibold border-b-2 border-purple-500 pb-0.5' : ''
                }`}
              >
                <span>Sent Messages</span>
              </button>

              <button
                onClick={() => handleNavClick('timeline')}
                className={`hover:text-purple-400 transition-colors whitespace-nowrap flex items-center gap-1 ${
                  activeTab === 'timeline' ? 'text-purple-400 font-semibold border-b-2 border-purple-500 pb-0.5' : ''
                }`}
              >
                <span>Legacy Timeline</span>
              </button>
            </>
          )}

          {/* Condolences is visible to both authenticated and unauthenticated visitors */}
          <button
            onClick={() => handleNavClick('condolences')}
            title={!currentUser ? 'View Condolences (Read Only)' : 'Condolences & Guestbook'}
            className={`hover:text-purple-400 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'condolences' ? 'text-purple-400 font-semibold border-b-2 border-purple-500 pb-0.5' : ''
            }`}
          >
            <span>Condolences</span>
            {!currentUser && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-800 text-neutral-300 font-normal">
                Read Only
              </span>
            )}
          </button>

          {currentUser && <button onClick={() => handleNavClick('gallery')} className={`hover:text-purple-400 transition-colors whitespace-nowrap ${activeTab === 'gallery' ? 'text-purple-400 font-semibold' : ''}`}>Gallery</button>}

          {/* For authenticated users: show Heritage and Altar */}
          {currentUser && (
            <>
              <button
                onClick={() => handleNavClick('heritage')}
                className={`hover:text-purple-400 transition-colors whitespace-nowrap flex items-center gap-1 ${
                  activeTab === 'heritage' ? 'text-purple-400 font-semibold border-b-2 border-purple-500 pb-0.5' : ''
                }`}
              >
                <span>Kung Fu & Reiki</span>
              </button>

              <button
                onClick={() => handleNavClick('altar')}
                className={`hover:text-purple-400 transition-colors whitespace-nowrap flex items-center gap-1 ${
                  activeTab === 'altar' ? 'text-purple-400 font-semibold border-b-2 border-purple-500 pb-0.5' : ''
                }`}
              >
                <span>Altar</span>
              </button>
            </>
          )}
        </nav>

        {/* Zone 3: Primary actions & Auth */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* User Sign In / Profile Button */}
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors text-xs font-medium"
            title={currentUser ? `Signed in as ${currentUser.displayName}` : 'Sign In / Register'}
          >
            {currentUser?.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt={currentUser.displayName}
                className="h-5 w-5 rounded-full border border-purple-400"
              />
            ) : (
              <User className="h-4 w-4 text-purple-400" />
            )}
            <span className="max-w-[90px] truncate hidden sm:inline">
              {currentUser ? currentUser.displayName : 'Login / Sign Up'}
            </span>
          </button>

          {/* Theme Toggle (Dark / Light) */}
          <button
            onClick={onToggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme mode"
          >
            {isDarkMode ? <Sun className="h-4 w-4 text-amber-300" /> : <Moon className="h-4 w-4 text-purple-600" />}
          </button>

          {/* Primary Action Button (for authenticated users) */}
          {currentUser && (
            <button
              onClick={() => handleNavClick('portal')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs font-medium hover:from-purple-500 hover:to-purple-600 transition-all shadow-sm shadow-purple-900/30 whitespace-nowrap"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Commune</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Navigation bar */}
      <div className="md:hidden flex items-center justify-around border-t border-neutral-800/80 px-2 py-2 text-[11px] overflow-x-auto gap-1">
        <button
          onClick={() => handleNavClick('landing')}
          className={`px-2 py-1 rounded whitespace-nowrap ${
            activeTab === 'landing' ? 'text-purple-400 font-semibold bg-neutral-900' : 'text-neutral-400'
          }`}
        >
          Home
        </button>

        {currentUser && (
          <>
            <button
              onClick={() => handleNavClick('portal')}
              className={`px-2 py-1 rounded whitespace-nowrap flex items-center gap-0.5 ${
                activeTab === 'portal' ? 'text-purple-400 font-semibold bg-neutral-900' : 'text-neutral-400'
              }`}
            >
              <span>Commune</span>
            </button>
            <button
              onClick={() => handleNavClick('timeline')}
              className={`px-2 py-1 rounded whitespace-nowrap flex items-center gap-0.5 ${
                activeTab === 'timeline' ? 'text-purple-400 font-semibold bg-neutral-900' : 'text-neutral-400'
              }`}
            >
              <span>Timeline</span>
            </button>
          </>
        )}

        {currentUser && <button onClick={() => handleNavClick('gallery')} className={`px-2 py-1 rounded whitespace-nowrap ${activeTab === 'gallery' ? 'text-purple-400 font-semibold bg-neutral-900' : 'text-neutral-400'}`}>Gallery</button>}

        {/* Condolences: visible to both authenticated and unauthenticated */}
        <button
          onClick={() => handleNavClick('condolences')}
          className={`px-2 py-1 rounded whitespace-nowrap flex items-center gap-0.5 ${
            activeTab === 'condolences' ? 'text-purple-400 font-semibold bg-neutral-900' : 'text-neutral-400'
          }`}
        >
          <span>Condolences</span>
        </button>

        {currentUser && (
          <>
            <button
              onClick={() => handleNavClick('heritage')}
              className={`px-2 py-1 rounded whitespace-nowrap flex items-center gap-0.5 ${
                activeTab === 'heritage' ? 'text-purple-400 font-semibold bg-neutral-900' : 'text-neutral-400'
              }`}
            >
              <span>Heritage</span>
            </button>
            <button
              onClick={() => handleNavClick('altar')}
              className={`px-2 py-1 rounded whitespace-nowrap flex items-center gap-0.5 ${
                activeTab === 'altar' ? 'text-purple-400 font-semibold bg-neutral-900' : 'text-neutral-400'
              }`}
            >
              <span>Altar</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
};
