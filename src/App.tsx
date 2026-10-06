/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { TopBar, NavTab } from './components/TopBar';
import { LandingPage } from './components/LandingPage';
import { CelestialPortal } from './components/CelestialPortal';
import { SentJournal } from './components/SentJournal';
import { EulogyPage } from './components/EulogyPage';
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
import { OfferingType, UserProfile } from './types/memorial';
import { auth, testConnection } from './lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { installSingleAudioPlayback } from './utils/audioPlayback';

const serviceWindowStart = new Date('2026-10-07T14:00:00+01:00').getTime();
const serviceWindowEnd = new Date('2026-10-07T14:30:00+01:00').getTime();

export default function App() {
  const [isServiceInProgress, setIsServiceInProgress] = useState(
    () => Date.now() >= serviceWindowStart && Date.now() < serviceWindowEnd,
  );
  const [activeTab, setActiveTab] = useState<NavTab>('landing');

  const [burstCount, setBurstCount] = useState<number>(0);
  const [burstOffering, setBurstOffering] = useState<OfferingType>('lantern');

  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);

  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const [mediaItems, setMediaItems] = useState<MemorialMedia[]>([]);
  const [pendingMediaItems, setPendingMediaItems] = useState<MemorialMedia[]>([]);
  const [mediaLoading, setMediaLoading] = useState(true);
  const [mediaLoadError, setMediaLoadError] = useState('');
  const canManageUploads = canManageMedia(currentUser);
  const backgroundAudioTracks = useMemo(
    () => mediaItems.filter(item => item.kind === 'audio' && ['background', 'altar'].includes(item.audioPurpose || 'background')),
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

  const isDarkMode = true;

  useEffect(() => installSingleAudioPlayback(), []);

  useEffect(() => {
    const now = Date.now();
    const nextBoundary = now < serviceWindowStart
      ? serviceWindowStart
      : now < serviceWindowEnd
        ? serviceWindowEnd
        : null;

    if (nextBoundary === null) return;

    const timeoutId = window.setTimeout(() => {
      const currentTime = Date.now();
      setIsServiceInProgress(currentTime >= serviceWindowStart && currentTime < serviceWindowEnd);
    }, Math.max(0, nextBoundary - now));

    return () => window.clearTimeout(timeoutId);
  }, [isServiceInProgress]);

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
    document.documentElement.classList.add('dark');
    document.body.className = 'bg-neutral-950 text-neutral-100 antialiased selection:bg-purple-600/30 selection:text-green-300';
  }, []);

  const handleAscendOffering = (offering: OfferingType) => {
    setBurstOffering(offering);
    setBurstCount((prev) => prev + 1);
  };

  if (isServiceInProgress) {
    return (
      <>
        <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 text-neutral-100">
          <section
            aria-labelledby="service-progress-heading"
            className="w-full max-w-xl space-y-5 rounded-3xl border border-amber-500/30 bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-950 p-8 text-center shadow-2xl shadow-amber-950/20 sm:p-12"
          >
            <div className="flex justify-center">
              <JohnPortrait size="lg" showFrame showSeal />
            </div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-300">
              John Alan Whittle
            </p>
            <p lang="zh-Hant" className="font-calligraphy text-2xl tracking-widest text-amber-200/90">
              道氣長存
            </p>
            <h1 id="service-progress-heading" className="font-serif text-3xl font-semibold text-amber-100 sm:text-4xl">
              Service in Progress
            </h1>
            <p className="text-base leading-relaxed text-neutral-300 sm:text-lg">
              The service for John is in progress. Out of respect for John, his family and friends, this site is temporarily unavailable and will reopen at{' '}
              <time dateTime="2026-10-07T14:30:00+01:00">2:30 pm today</time> when the service finishes.
            </p>
          </section>
        </main>
        <AudioPlayerBar
          isDarkMode
          tracks={backgroundAudioTracks}
          mediaErrorMessage={mediaLoadError}
          isLoading={mediaLoading}
        />
      </>
    );
  }

  // Unauthenticated visitors can access public pages; all other portals require login.
  const handleTabChange = (tab: NavTab) => {
    if (tab === 'admin' && !canManageUploads) {
      if (!currentUser) setIsAuthOpen(true);
      return;
    }
    if (!currentUser && tab !== 'landing' && tab !== 'condolences' && tab !== 'eulogy') {
      setIsAuthOpen(true);
      return;
    }
    setActiveTab(tab);
  };

  return (
    <>
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
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main Sanctuary Content */}
      <main className="flex-1 relative z-10 pb-32 sm:pb-24">
        {!currentUser ? (
          /* Signed-out visitors can access home, condolences, and the eulogy page. */
          <>
            {activeTab === 'condolences' ? (
              <CondolencesPage
                isDarkMode={isDarkMode}
                currentUser={currentUser}
                onTributeLit={() => handleAscendOffering('candle')}
                onOpenAuth={() => setIsAuthOpen(true)}
              />
            ) : activeTab === 'eulogy' ? (
              <EulogyPage currentUser={currentUser} isDarkMode={isDarkMode} />
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

            {activeTab === 'eulogy' && (
              <EulogyPage currentUser={currentUser} isDarkMode={isDarkMode} />
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

            {activeTab === 'admin' && canManageUploads && (
              <PictureGallery
                items={mediaItems}
                pendingItems={pendingMediaItems}
                loading={mediaLoading}
                error={mediaLoadError}
                isDarkMode={isDarkMode}
                canManage
                onUpload={openMedia}
                onApprove={approveMedia}
                onReject={rejectMedia}
                onDelete={deleteMedia}
                adminMode
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
            In Eternal Memory of <span className="text-red-700 dark:text-red-400">John Alan Whittle</span> · All communications, milestones, and condolences are preserved in the Firestore database.
          </p>
        </div>
      </footer>

      {currentUser && !canManageUploads && <button type="button" onClick={openMedia} aria-label="Submit a photo or video" title="Share a memory" className="fixed bottom-4 left-4 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-purple-500/50 bg-neutral-900 text-purple-300 shadow-lg hover:bg-purple-900 focus-visible:outline-2 focus-visible:outline-purple-400"><ImagePlus className="h-6 w-6" /></button>}
      {currentUser && isMediaOpen && <MediaUploadModal onClose={closeMedia} isDarkMode={isDarkMode} onGallery={() => { setIsMediaOpen(false); handleTabChange(canManageUploads ? 'admin' : 'gallery'); }} />}

      {/* Auth Modal for Sign Up / Login and Identity Autofill */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onUserChange={handleUserChange}
        isDarkMode={isDarkMode}
      />
    </div>
    <AudioPlayerBar
      isDarkMode={isDarkMode}
      tracks={backgroundAudioTracks}
      mediaErrorMessage={mediaLoadError}
      isLoading={mediaLoading}
    />
    </>
  );
}
