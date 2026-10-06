/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { TopBar, NavTab } from './components/TopBar';
import { LandingPage } from './components/LandingPage';
import { CelestialPortal } from './components/CelestialPortal';
import { SentJournal } from './components/SentJournal';
import { LegacyTimeline } from './components/LegacyTimeline';
import { CondolencesPage } from './components/CondolencesPage';
import { KungFuReikiHeritage } from './components/KungFuReikiHeritage';
import { MemorialAltar } from './components/MemorialAltar';
import { AudioPlayerBar } from './components/AudioPlayerBar';
import { CelestialSkyCanvas } from './components/CelestialSkyCanvas';
import { CalligraphyName } from './components/CalligraphyName';
import { JohnPortrait } from './components/JohnPortrait';
import { ImagePlus } from 'lucide-react';
import { MediaUploadModal } from './components/MediaUploadModal';
import { PictureGallery } from './components/PictureGallery';
import { canManageMedia } from './lib/mediaAccess';
import { approveMedia, deleteMedia, mediaError, MemorialMedia, rejectMedia, subscribeMedia } from './lib/media';
import { AuthModal } from './components/AuthModal';
import { OfferingType, ThemeMode, UserProfile } from './types/memorial';
import { auth, testConnection } from './lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { installSingleAudioPlayback } from './utils/audioPlayback';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('landing');
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    try {
      const stored = localStorage.getItem('jaw_theme_mode_v2');
      return (stored as ThemeMode) || 'dark';
    } catch {
      return 'dark';
    }
  });

  const [burstCount, setBurstCount] = useState<number>(0);
  const [burstOffering, setBurstOffering] = useState<OfferingType>('lantern');

  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);

  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const [mediaItems, setMediaItems] = useState<MemorialMedia[]>([]);
  const [pendingMediaItems, setPendingMediaItems] = useState<MemorialMedia[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaLoadError, setMediaLoadError] = useState('');
  const canManageUploads = canManageMedia(currentUser);
  const backgroundAudioTracks = useMemo(
    () => mediaItems.filter(item => item.kind === 'audio' && (item.audioPurpose || 'background') === 'background'),
    [mediaItems],
  );
  const meditationAudioTracks = useMemo(
    () => mediaItems.filter(item => item.kind === 'audio' && item.audioPurpose === 'meditation'),
    [mediaItems],
  );
  const openMedia = () => { if (auth.currentUser) setIsMediaOpen(true); else setIsAuthOpen(true); };
  const closeMedia = useCallback(() => setIsMediaOpen(false), []);

  useEffect(() => {
    setMediaItems([]); setPendingMediaItems([]); setMediaLoadError('');
    if (!currentUser) setIsMediaOpen(false);
    setMediaLoading(true);
    return subscribeMedia(
      items => { setMediaItems(items); setMediaLoading(false); },
      error => { setMediaLoadError(mediaError(error)); setMediaLoading(false); },
      items => setPendingMediaItems(items),
    );
  }, [currentUser?.uid]);

  const isDarkMode = themeMode === 'dark';

  useEffect(() => installSingleAudioPlayback(), []);

  // Test database connection & listen to Firebase auth
  useEffect(() => {
    testConnection().catch(() => {});

    const unsubscribe = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        let relationship: string | undefined;
        try {
          const saved = JSON.parse(localStorage.getItem('jaw_user_profile_v2') || 'null');
          if (saved?.uid === fbUser.uid) relationship = saved.relationship;
        } catch {}
        const profile: UserProfile = {
          uid: fbUser.uid,
          displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Family Member',
          email: fbUser.email || undefined,
          emailVerified: fbUser.emailVerified,
          photoURL: fbUser.photoURL || undefined,
          relationship,
        };
        setCurrentUser(profile);
        try {
          localStorage.setItem('jaw_user_profile_v2', JSON.stringify(profile));
        } catch {}
      } else {
        setCurrentUser(null);
        setActiveTab('landing');
        setIsMediaOpen(false);
        try { localStorage.removeItem('jaw_user_profile_v2'); } catch {}
      }
    });

    return () => unsubscribe();
  }, []);

  const handleUserChange = (profile: UserProfile | null) => {
    setCurrentUser(profile);
    try {
      if (profile) {
        localStorage.setItem('jaw_user_profile_v2', JSON.stringify(profile));
      } else {
        localStorage.removeItem('jaw_user_profile_v2');
        // When signing out, return to landing page
        setActiveTab('landing');
      }
    } catch {}
  };

  useEffect(() => {
    try {
      localStorage.setItem('jaw_theme_mode_v2', themeMode);
    } catch {}

    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.className = 'bg-neutral-950 text-neutral-100 antialiased selection:bg-purple-600/30 selection:text-green-300';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.className = 'bg-stone-50 text-neutral-900 antialiased selection:bg-purple-600/20 selection:text-purple-900';
    }
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleAscendOffering = (offering: OfferingType) => {
    setBurstOffering(offering);
    setBurstCount((prev) => prev + 1);
  };

  // Safe tab change handler: unauthenticated users can access home and condolences (read only)
  const handleTabChange = (tab: NavTab) => {
    if (!currentUser && tab !== 'landing' && tab !== 'condolences') {
      setIsAuthOpen(true);
      return;
    }
    setActiveTab(tab);
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans relative selection:bg-purple-500/30 ${isDarkMode ? 'dark bg-neutral-950 text-neutral-100' : 'bg-stone-50 text-neutral-900'}`}>
      {/* Background Celestial Star & Lantern Canvas */}
      <CelestialSkyCanvas
        burstTrigger={burstCount}
        burstOffering={burstOffering}
        isDarkMode={isDarkMode}
      />

      {/* 3-Zone Top Bar */}
      <TopBar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main Sanctuary Content */}
      <main className="flex-1 relative z-10 pb-24">
        {!currentUser ? (
          /* For a signed out user: can access home page or read-only condolences */
          <>
            {activeTab === 'condolences' ? (
              <CondolencesPage
                isDarkMode={isDarkMode}
                currentUser={currentUser}
                onTributeLit={() => handleAscendOffering('candle')}
                onOpenAuth={() => setIsAuthOpen(true)}
              />
            ) : (
              <LandingPage
                onNavigate={handleTabChange}
                onOpenAuth={() => setIsAuthOpen(true)}
                currentUser={currentUser}
                isDarkMode={isDarkMode}
              />
            )}
          </>
        ) : (
          /* Signed in user has access to all sanctuary portals */
          <>
            {activeTab === 'landing' && (
              <LandingPage
                onNavigate={handleTabChange}
                onOpenAuth={() => setIsAuthOpen(true)}
                currentUser={currentUser}
                isDarkMode={isDarkMode}
              />
            )}

            {activeTab === 'portal' && (
              <CelestialPortal
                isDarkMode={isDarkMode}
                currentUser={currentUser}
                onAscendOffering={handleAscendOffering}
                onViewJournal={() => setActiveTab('journal')}
                onOpenAuth={() => setIsAuthOpen(true)}
              />
            )}

            {activeTab === 'journal' && (
              <SentJournal
                onBackToPortal={() => setActiveTab('portal')}
                isDarkMode={isDarkMode}
                currentUser={currentUser}
              />
            )}

            {activeTab === 'timeline' && (
              <LegacyTimeline
                isDarkMode={isDarkMode}
                currentUser={currentUser}
                onOpenAuth={() => setIsAuthOpen(true)}
              />
            )}

            {activeTab === 'condolences' && (
              <CondolencesPage
                isDarkMode={isDarkMode}
                currentUser={currentUser}
                onTributeLit={() => handleAscendOffering('candle')}
                onOpenAuth={() => setIsAuthOpen(true)}
              />
            )}

            {activeTab === 'gallery' && (
              <PictureGallery
                items={mediaItems}
                pendingItems={pendingMediaItems}
                loading={mediaLoading}
                error={mediaLoadError}
                isDarkMode={isDarkMode}
                canManage={canManageUploads}
                onUpload={openMedia}
                onApprove={approveMedia}
                onReject={rejectMedia}
                onDelete={deleteMedia}
              />
            )}

            {activeTab === 'heritage' && (
              <KungFuReikiHeritage isDarkMode={isDarkMode} />
            )}

            {activeTab === 'altar' && (
              <MemorialAltar
                isDarkMode={isDarkMode}
                onOfferingAscended={() => handleAscendOffering('incense')}
                audioTracks={backgroundAudioTracks}
                meditationTracks={meditationAudioTracks}
              />
            )}
          </>
        )}
      </main>

      {/* Sacred Sanctuary Footer */}
      <footer
        className={`relative z-10 border-t py-12 px-4 sm:px-6 transition-colors ${
          isDarkMode
            ? 'bg-neutral-950/90 border-neutral-900 text-neutral-400'
            : 'bg-stone-100/90 border-stone-200 text-neutral-600'
        }`}
      >
        <div className="max-w-4xl mx-auto text-center space-y-4">
          {/* John Alan Whittle portrait on every page */}
          <div className="flex justify-center pb-1">
            <JohnPortrait size="md" showFrame={true} showSeal={true} />
          </div>

          <CalligraphyName
            size="md"
            subtitle="Forever in our hearts, our spirit, and our daily thoughts"
          />

          <p className="text-xs text-neutral-500 max-w-lg mx-auto leading-relaxed">
            A sacred memorial portal created with deep love and reverence.
            This sanctuary carries our voices to heaven and provides comfort in times of longing.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-[11px] text-neutral-500 font-sans">
            <span>Reiki Universal Peace (靈氣)</span>
            <span aria-hidden="true">·</span>
            <span>Wushu Martial Discipline (尚武)</span>
            <span aria-hidden="true">·</span>
            <span>Ancestral Remembrance (慎終追遠)</span>
          </div>

          <p className="text-[10px] text-neutral-600 pt-3">
            In Eternal Memory of John Alan Whittle · All communications, milestones, and condolences are preserved in the Firestore database.
          </p>
        </div>
      </footer>

      {/* Floating Background Music & Audio Sanctuary Dock */}
      <AudioPlayerBar key={currentUser?.uid || 'guest'} isDarkMode={isDarkMode} tracks={backgroundAudioTracks} mediaErrorMessage={mediaLoadError} canUpload={canManageUploads} onOpenUploads={openMedia} />

      {currentUser && <button type="button" onClick={openMedia} aria-label="Submit a photo or video" title="Share a memory" className="fixed bottom-4 left-4 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-purple-500/50 bg-neutral-900 text-purple-300 shadow-lg hover:bg-purple-900 focus-visible:outline-2 focus-visible:outline-purple-400"><ImagePlus className="h-6 w-6" /></button>}
      {currentUser && isMediaOpen && <MediaUploadModal onClose={closeMedia} isDarkMode={isDarkMode} onGallery={() => { setIsMediaOpen(false); handleTabChange('gallery'); }} />}

      {/* Auth Modal for Sign Up / Login and Identity Autofill */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onUserChange={handleUserChange}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
