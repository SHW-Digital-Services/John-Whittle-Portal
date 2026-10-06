import React, { useState, useEffect, useRef } from 'react';
import { Flame, Bell, Coffee, Sparkles, Flower2, Heart, Award, Clock } from 'lucide-react';
import { CalligraphyName } from './CalligraphyName';
import { JohnPortrait } from './JohnPortrait';
import { MemorialShrineState } from '../types/memorial';
import { subscribeToShrineState, updateRemoteShrine } from '../services/dbService';
import { IncenseBurner } from './IncenseBurner';
import { GuidedMeditationTimer } from './GuidedMeditationTimer';
import { loadMediaBlob, mediaError, MemorialMedia } from '../lib/media';

function useAltarTrack(tracks: MemorialMedia[]) {
  const [selectedAudioId, setSelectedAudioId] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [audioError, setAudioError] = useState('');
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!selectedAudioId && tracks.length) setSelectedAudioId(tracks[0].id);
    if (selectedAudioId && !tracks.some(track => track.id === selectedAudioId)) setSelectedAudioId(tracks[0]?.id || '');
  }, [tracks, selectedAudioId]);

  useEffect(() => {
    const selectedTrack = tracks.find(track => track.id === selectedAudioId);
    if (!selectedTrack) { setAudioUrl(''); setAudioError(''); return; }
    let disposed = false;
    let objectUrl = '';
    setAudioUrl(''); setAudioError('');
    loadMediaBlob(selectedTrack).then(blob => {
      if (disposed) return;
      objectUrl = URL.createObjectURL(blob);
      setAudioUrl(objectUrl);
    }).catch(error => {
      if (!disposed) setAudioError(mediaError(error));
    });
    return () => { disposed = true; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [tracks, selectedAudioId]);

  const play = () => {
    const audio = audioRef.current;
    if (!tracks.length || !selectedAudioId) return;
    if (!audioUrl || !audio) {
      setAudioError('The selected audio is still loading. Please try again.');
      return;
    }
    audio.currentTime = 0;
    audio.play().catch(error => setAudioError(mediaError(error)));
  };

  return { selectedAudioId, setSelectedAudioId, audioUrl, audioError, setAudioError, audioRef, play };
}

interface MemorialAltarProps {
  isDarkMode: boolean;
  onOfferingAscended: () => void;
  audioTracks: MemorialMedia[];
  meditationTracks: MemorialMedia[];
}

export const MemorialAltar: React.FC<MemorialAltarProps> = ({ isDarkMode, onOfferingAscended, audioTracks, meditationTracks }) => {
  const [shrine, setShrine] = useState<MemorialShrineState>({
    incenseLitCount: 0,
    candlesLitCount: 0,
    bellRungCount: 0,
    lanternsReleasedCount: 0,
    teaOfferedCount: 0,
    meditationsCompletedCount: 0,
  });
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const altarAudio = useAltarTrack(audioTracks);
  const meditationAudio = useAltarTrack(meditationTracks);

  useEffect(() => {
    const unsubscribe = subscribeToShrineState((updated) => {
      setShrine(updated);
    });
    return () => unsubscribe();
  }, []);

  const handleLightIncense = async () => {
    await updateRemoteShrine((prev) => ({
      ...prev,
      incenseLitCount: (prev.incenseLitCount || 0) + 1,
    }));
    setActiveAction('incense');
    onOfferingAscended();
    setTimeout(() => setActiveAction(null), 3000);
  };

  const handleRingBell = async () => {
    altarAudio.play();
    await updateRemoteShrine((prev) => ({
      ...prev,
      bellRungCount: (prev.bellRungCount || 0) + 1,
    }));
    setActiveAction('bell');
    onOfferingAscended();
    setTimeout(() => setActiveAction(null), 3500);
  };

  const handleOfferTea = async () => {
    altarAudio.play();
    await updateRemoteShrine((prev) => ({
      ...prev,
      teaOfferedCount: (prev.teaOfferedCount || 0) + 1,
    }));
    setActiveAction('tea');
    onOfferingAscended();
    setTimeout(() => setActiveAction(null), 3000);
  };

  const handleLightCandle = async () => {
    altarAudio.play();
    await updateRemoteShrine((prev) => ({
      ...prev,
      candlesLitCount: (prev.candlesLitCount || 0) + 1,
    }));
    setActiveAction('candle');
    onOfferingAscended();
    setTimeout(() => setActiveAction(null), 3000);
  };

  const handleMeditationComplete = async (durationMinutes: number) => {
    await updateRemoteShrine((prev) => ({
      ...prev,
      meditationsCompletedCount: (prev.meditationsCompletedCount || 0) + 1,
    }));
    onOfferingAscended();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Altar Tablet Frame */}
      <div className="relative rounded-3xl border border-amber-900/40 bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-950 p-8 sm:p-12 shadow-2xl shadow-purple-950/20 text-center overflow-hidden">
        {/* Subtle decorative Chinese corner fretwork */}
        <div className="absolute top-3 left-3 text-amber-500/30 text-lg select-none font-serif">『</div>
        <div className="absolute top-3 right-3 text-amber-500/30 text-lg select-none font-serif">』</div>
        <div className="absolute bottom-3 left-3 text-amber-500/30 text-lg select-none font-serif">『</div>
        <div className="absolute bottom-3 right-3 text-amber-500/30 text-lg select-none font-serif">』</div>

        {/* Central Shrine Tablet */}
        <div className="relative z-10 space-y-4 max-w-xl mx-auto">
          {/* Central Portrait of John Alan Whittle */}
          <div className="flex justify-center pb-2">
            <JohnPortrait size="hero" showFrame={true} showSeal={true} />
          </div>

          {/* Incense Burner Urn Graphic */}
          <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
            {activeAction && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-30"></span>
            )}
            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-amber-600/50 bg-neutral-900/90 text-amber-400 shadow-xl shadow-amber-950/40">
              <span className="text-3xl select-none">🪔</span>
            </div>
          </div>

          {/* Name Tablet with Calligraphy */}
          <div className="pt-2">
            <CalligraphyName
              size="hero"
              honorific="Honored Spirit & Celestial Ancestor"
              subtitle="Master of Martial Harmony · Channel of Universal Reiki Healing"
            />
          </div>

          <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto leading-relaxed pt-2">
            The sacred memorial shrine of John Alan Whittle. Light a stick of sandalwood incense, ring the singing bowl, offer fresh tea, or enter into mindful silence below.
          </p>

          {/* Active Action Toast */}
          {activeAction && (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs animate-fade-in">
              <Sparkles className="h-3.5 w-3.5" />
              <span>
                {activeAction === 'incense' && 'Sandalwood incense lit. Sacred smoke ascends to John.'}
                {activeAction === 'bell' && 'Singing bowl resonated. Harmonic peace reverberates into heaven.'}
                {activeAction === 'tea' && 'Filial tea offered. Honoring John with deep gratitude.'}
                {activeAction === 'candle' && 'Eternal candle lit. Shining light on John’s path.'}
              </span>
            </div>
          )}
        </div>

        <div className="relative z-10 mx-auto mt-6 grid max-w-2xl grid-cols-1 gap-4 text-left sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="altar-audio-track" className="block text-xs text-neutral-300">Altar sound</label>
            <select id="altar-audio-track" value={altarAudio.selectedAudioId} disabled={!audioTracks.length} onChange={event => altarAudio.setSelectedAudioId(event.target.value)} className="w-full rounded-lg border border-neutral-700 bg-neutral-950 p-2 text-sm text-neutral-100">
              {audioTracks.length
                ? audioTracks.map(track => <option key={track.id} value={track.id}>{track.title}</option>)
                : <option value="">No altar audio uploaded yet</option>}
            </select>
            {altarAudio.audioError && <p role="alert" className="text-xs text-red-400">{altarAudio.audioError}</p>}
            {audioTracks.length === 0 && <p className="text-xs text-neutral-500">The portal owner can add altar audio from the upload button.</p>}
          </div>
          <div className="space-y-2">
            <label htmlFor="meditation-audio-track" className="block text-xs text-neutral-300">Meditation sound</label>
            <select id="meditation-audio-track" value={meditationAudio.selectedAudioId} disabled={!meditationTracks.length} onChange={event => meditationAudio.setSelectedAudioId(event.target.value)} className="w-full rounded-lg border border-neutral-700 bg-neutral-950 p-2 text-sm text-neutral-100">
              {meditationTracks.length
                ? meditationTracks.map(track => <option key={track.id} value={track.id}>{track.title}</option>)
                : <option value="">No meditation audio uploaded yet</option>}
            </select>
            {meditationAudio.audioError && <p role="alert" className="text-xs text-red-400">{meditationAudio.audioError}</p>}
            {meditationTracks.length === 0 && <p className="text-xs text-neutral-500">The portal owner can add meditation audio from the upload button.</p>}
          </div>
        </div>
        <audio ref={altarAudio.audioRef} src={altarAudio.audioUrl || undefined} preload="auto" onError={() => altarAudio.setAudioError('The selected altar audio could not be played.')} />
        <audio ref={meditationAudio.audioRef} src={meditationAudio.audioUrl || undefined} preload="auto" onError={() => meditationAudio.setAudioError('The selected meditation audio could not be played.')} />

        <IncenseBurner count={shrine.incenseLitCount || 0} onLight={handleLightIncense} onPlaySound={altarAudio.play} />

        {/* Interactive Altar Actions */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-10 max-w-2xl mx-auto">
          {/* Action 2: Bell */}
          <button
            onClick={handleRingBell}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-neutral-800 bg-neutral-950/70 hover:bg-neutral-900/90 hover:border-amber-500/60 transition-all text-neutral-200 group shadow-md"
          >
            <span className="text-2xl mb-1 transform group-hover:scale-110 transition-transform">🔔</span>
            <span className="text-xs font-semibold text-neutral-100">Ring Bell</span>
            <span className="text-[10px] text-neutral-400 mt-0.5 font-mono">{shrine.bellRungCount || 0} Rung</span>
          </button>

          {/* Action 3: Tea */}
          <button
            onClick={handleOfferTea}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-neutral-800 bg-neutral-950/70 hover:bg-neutral-900/90 hover:border-emerald-500/60 transition-all text-neutral-200 group shadow-md"
          >
            <span className="text-2xl mb-1 transform group-hover:scale-110 transition-transform">🍵</span>
            <span className="text-xs font-semibold text-neutral-100">Offer Tea</span>
            <span className="text-[10px] text-neutral-400 mt-0.5 font-mono">{shrine.teaOfferedCount || 0} Offered</span>
          </button>

          {/* Action 4: Candle */}
          <button
            onClick={handleLightCandle}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-neutral-800 bg-neutral-950/70 hover:bg-neutral-900/90 hover:border-amber-500/60 transition-all text-neutral-200 group shadow-md"
          >
            <span className="text-2xl mb-1 transform group-hover:scale-110 transition-transform">🔥</span>
            <span className="text-xs font-semibold text-neutral-100">Eternal Candle</span>
            <span className="text-[10px] text-neutral-400 mt-0.5 font-mono">{shrine.candlesLitCount || 0} Shining</span>
          </button>
        </div>

        {/* Traditional Couplet / Duilian (对联) */}
        <div className="relative z-10 mt-12 pt-8 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-center gap-6 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="font-calligraphy text-base text-emerald-400">武德流芳</span>
            <span className="text-neutral-500">· Martial Virtue Fragrance Resounds</span>
          </div>
          <span className="hidden sm:inline text-neutral-600">|</span>
          <div className="flex items-center gap-2">
            <span className="font-calligraphy text-base text-purple-400">靈氣永存</span>
            <span className="text-neutral-500">· Reiki Universal Energy Lives On</span>
          </div>
        </div>
      </div>

      {/* Guided Meditation Timer Section in the Altar */}
      <section aria-label="Guided Meditation Timer">
        <GuidedMeditationTimer
          isDarkMode={isDarkMode}
          onSessionComplete={handleMeditationComplete}
          onPlayAltarAudio={meditationAudio.play}
        />
      </section>
    </div>
  );
};
