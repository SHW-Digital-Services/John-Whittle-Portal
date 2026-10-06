import React, { useState } from 'react';
import { Send, Sparkles, Feather, User, Lock, Clock, ScrollText, Menu, X, MessageSquare, ImagePlus, LayoutDashboard } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { UserProfile } from '../types/memorial';
import { JohnPortrait } from './JohnPortrait';
import { canManageMedia } from '../lib/mediaAccess';

export type NavTab = 'landing' | 'portal' | 'journal' | 'timeline' | 'condolences' | 'eulogy' | 'heritage' | 'altar' | 'gallery' | 'admin';

interface TopBarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  isDarkMode: boolean;
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onTabChange,
  isDarkMode,
  currentUser,
  onOpenAuth,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const canManage = canManageMedia(currentUser);

  const handleNavClick = (tab: NavTab) => {
    setIsMobileMenuOpen(false);
    // Unauthenticated users can access public memorial pages.
    if (!currentUser) {
      if (tab === 'landing' || tab === 'condolences' || tab === 'eulogy') {
        onTabChange(tab);
      } else {
        onOpenAuth();
      }
      return;
    }
    onTabChange(tab);
  };

  const mobileNavItems: { tab: NavTab; label: string; Icon: LucideIcon }[] = [
    { tab: 'landing', label: 'Home', Icon: Sparkles },
    ...(currentUser ? [
      { tab: 'portal' as const, label: 'Commune with John', Icon: Send },
      { tab: 'journal' as const, label: 'Sent Messages', Icon: MessageSquare },
      { tab: 'timeline' as const, label: 'Legacy Timeline', Icon: Clock },
    ] : []),
    { tab: 'condolences', label: 'Condolences', Icon: Feather },
    { tab: 'eulogy', label: 'Eulogy', Icon: ScrollText },
    ...(currentUser ? [
      { tab: 'gallery' as const, label: 'Gallery', Icon: ImagePlus },
      { tab: 'heritage' as const, label: 'Kung Fu & Reiki', Icon: Sparkles },
      { tab: 'altar' as const, label: 'Altar', Icon: Lock },
    ] : []),
  ];

  return (
    <header
      className={`sticky top-0 z-30 w-full border-b backdrop-blur-md transition-colors ${
        isDarkMode
          ? 'bg-neutral-950/85 border-neutral-800/80 text-neutral-100'
          : 'bg-stone-50/90 border-stone-200 text-neutral-900'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Zone 1: Brand Title with Portrait Medallion */}
        <div className="flex min-w-0 shrink items-center gap-2 sm:gap-3">
          {canManage && (
            <button
              type="button"
              onClick={() => handleNavClick('admin')}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-neutral-500/70 transition-colors hover:bg-amber-950/40 hover:text-amber-300 focus-visible:outline-2 focus-visible:outline-amber-400"
              aria-label="Open Admin Portal"
              title="Admin Portal"
            >
              <LayoutDashboard className="h-4 w-4" />
            </button>
          )}
          <div
            onClick={() => onTabChange('landing')}
            className="cursor-pointer min-w-0 shrink flex items-center gap-2 sm:gap-3 group"
            title="Return to Memorial Sanctuary Home"
          >
            <JohnPortrait size="avatar" showFrame={true} showSeal={false} />
            <div className="min-w-0 flex flex-col">
              <span className="truncate font-serif text-sm sm:text-base lg:text-lg font-semibold tracking-wide text-red-700 dark:text-red-400 group-hover:text-red-600 dark:group-hover:text-red-300 transition-colors">
                John Alan Whittle
              </span>
              <span className="truncate font-calligraphy text-[10px] sm:text-xs text-emerald-500 dark:text-emerald-400 -mt-0.5 tracking-wider">
                約翰 · 艾倫 · 惠特爾
              </span>
            </div>
          </div>
        </div>

        {/* Zone 2: Navigation links */}
        <nav className="hidden xl:flex items-center gap-4 lg:gap-6 text-xs font-medium tracking-wide text-neutral-400">
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

          <button
            onClick={() => handleNavClick('eulogy')}
            className={`hover:text-purple-400 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'eulogy' ? 'text-purple-400 font-semibold border-b-2 border-purple-500 pb-0.5' : ''
            }`}
          >
            <ScrollText className="h-3.5 w-3.5" />
            <span>Eulogy</span>
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
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* User Sign In / Profile Button */}
          <button
            onClick={onOpenAuth}
            className="flex min-h-10 min-w-10 items-center justify-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors text-xs font-medium"
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

          {/* Primary Action Button (for authenticated users) */}
          {currentUser && (
            <button
              onClick={() => handleNavClick('portal')}
              className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs font-medium hover:from-purple-500 hover:to-purple-600 transition-all shadow-sm shadow-purple-900/30 whitespace-nowrap"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Commune</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(open => !open)}
            onKeyDown={event => {
              if (event.key === 'Escape') setIsMobileMenuOpen(false);
            }}
            className="flex xl:hidden min-h-10 min-w-10 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:bg-neutral-800 hover:text-white"
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation-menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <nav
          id="mobile-navigation-menu"
          aria-label="Mobile navigation"
          onKeyDown={event => {
            if (event.key === 'Escape') setIsMobileMenuOpen(false);
          }}
          className="absolute inset-x-0 top-full max-h-[calc(100dvh-5rem)] overflow-y-auto border-b border-neutral-800 bg-neutral-950/95 px-4 py-4 shadow-xl backdrop-blur-lg xl:hidden"
        >
          <div className="mx-auto grid max-w-3xl grid-cols-1 gap-2 sm:grid-cols-2">
            {mobileNavItems.map(({ tab, label, Icon }) => (
              <button
                key={tab}
                type="button"
                onClick={() => handleNavClick(tab)}
                className={`flex min-h-12 items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                  activeTab === tab
                    ? 'border-purple-500/50 bg-purple-950/50 text-purple-200'
                    : 'border-neutral-800 bg-neutral-900/70 text-neutral-300 hover:bg-neutral-800'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0 text-purple-400" aria-hidden="true" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
};
