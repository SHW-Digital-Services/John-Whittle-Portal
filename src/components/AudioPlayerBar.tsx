import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause, Upload, Disc } from 'lucide-react';
import { loadMediaBlob, mediaError, MemorialMedia } from '../lib/media';

interface AudioPlayerBarProps {
  isDarkMode: boolean;
  tracks: MemorialMedia[];
  canUpload: boolean;
  mediaErrorMessage: string;
  onOpenUploads: () => void;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({ isDarkMode, tracks, canUpload, mediaErrorMessage, onOpenUploads }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.5);
  const [customTrackName, setCustomTrackName] = useState<string | null>(null);
  const [customAudioUrl, setCustomAudioUrl] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [mode, setMode] = useState<'no_track' | 'custom_track'>('no_track');
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const requestRef = useRef(0);
  const resumeAfterLoadRef = useRef(false);
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackError, setTrackError] = useState('');
  const [selectedTrackId, setSelectedTrackId] = useState('');

  const selectTrack = async (id: string, resume = isPlaying) => {
    const item = tracks.find(track => track.id === id);
    if (!item) return;
    const request = ++requestRef.current;
    setTrackLoading(true); setTrackError('');
    try {
      const blob = await loadMediaBlob(item);
      if (request !== requestRef.current) return;
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      const url = URL.createObjectURL(blob);
      objectUrlRef.current = url;
      audioElementRef.current?.pause();
      resumeAfterLoadRef.current = resume;
      setCustomAudioUrl(url); setCustomTrackName(item.title); setSelectedTrackId(id);
      setMode('custom_track'); setIsPlaying(false); setCurrentTime(0); setDuration(0);
    } catch (error) { if (request === requestRef.current) setTrackError(mediaError(error)); }
    finally { if (request === requestRef.current) setTrackLoading(false); }
  };

  useEffect(() => {
    if (tracks.length && !selectedTrackId && !trackLoading && !trackError) {
      void selectTrack(tracks[0].id, false);
    }
  }, [tracks, selectedTrackId, trackLoading, trackError]);

  const togglePlay = () => {
    if (mode === 'custom_track' && audioElementRef.current) {
      if (isPlaying) {
        audioElementRef.current.pause();
        setIsPlaying(false);
      } else {
        audioElementRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch((err) => {
          console.warn('Playback blocked', err);
        });
      }
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (audioElementRef.current) {
      audioElementRef.current.volume = newVol;
    }
    if (newVol > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      if (audioElementRef.current) {
        audioElementRef.current.volume = volume;
      }
    } else {
      setIsMuted(true);
      if (audioElementRef.current) {
        audioElementRef.current.volume = 0;
      }
    }
  };

  useEffect(() => {
    const audio = audioElementRef.current;
    if (audio) audio.volume = isMuted ? 0 : volume;
  }, [customAudioUrl, isMuted, volume]);

  useEffect(() => {
    const audio = audioElementRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
    };
  }, [customAudioUrl]);

  useEffect(() => {
    const audio = audioElementRef;
    return () => {
      audio.current?.pause();
      ++requestRef.current;
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const formatSeconds = (sec: number) => {
    if (isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <>
      {customAudioUrl && (
        <audio
          ref={audioElementRef}
          src={customAudioUrl}
          onCanPlay={() => {
            if (!resumeAfterLoadRef.current) return;
            resumeAfterLoadRef.current = false;
            audioElementRef.current?.play().catch(() => setIsPlaying(false));
          }}
          onEnded={() => {
            const index = tracks.findIndex(track => track.id === selectedTrackId);
            if (tracks.length > 1) {
              void selectTrack(tracks[(index + 1) % tracks.length].id, true);
            } else if (audioElementRef.current) {
              audioElementRef.current.currentTime = 0;
              audioElementRef.current.play().catch(() => setIsPlaying(false));
            }
          }}
          onError={() => { setTrackError("This track could not be played. Please try another audio format."); setIsPlaying(false); }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      )}

      {/* Persistent Sanctuary Audio Floating Dock */}
      <div className="fixed bottom-4 right-4 z-40 w-[calc(100vw-5.5rem)] max-w-sm">
        <div
          className={`relative rounded-xl border backdrop-blur-md shadow-lg transition-all duration-300 ${
            isDarkMode
              ? 'bg-neutral-900/90 border-neutral-800 text-neutral-200 shadow-purple-950/30'
              : 'bg-white/95 border-stone-200 text-neutral-800 shadow-stone-300/40'
          }`}
        >
          {/* Main Bar */}
          <div className="flex items-center gap-3 px-3.5 py-2.5">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-800/80 text-purple-400 hover:text-purple-300 transition-colors"
              title="Click to expand music settings & track loader"
              aria-label="Expand audio settings"
            >
              <Disc className={`h-5 w-5 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
              {isPlaying && (
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              )}
            </button>

            {/* Track Info */}
            <div
              className="flex-1 min-w-0 cursor-pointer"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium truncate">
                  {mode === 'custom_track' && customTrackName
                    ? customTrackName
                    : tracks.length ? 'Loading uploaded audio…' : 'No uploaded audio'}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 dark:text-neutral-500 truncate">
                {mode === 'custom_track'
                  ? `Background music · ${formatSeconds(currentTime)} / ${formatSeconds(duration)}`
                  : 'Uploaded background music will appear here'}
              </p>
            </div>

            {/* Quick Controls */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={togglePlay}
                disabled={!customAudioUrl}
                className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-600 text-white hover:bg-purple-500 transition-colors shadow-sm shadow-purple-600/30"
                title={isPlaying ? 'Pause Background Music' : 'Play Background Music'}
                aria-label={isPlaying ? 'Pause music' : 'Play music'}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
              </button>

              <button
                onClick={toggleMute}
                className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 hover:text-neutral-200 transition-colors"
                title={isMuted ? 'Unmute' : 'Mute'}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="h-4 w-4 text-red-400" /> : <Volume2 className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Expanded Configuration Drawer */}
          {isExpanded && (
            <div className="px-3.5 pb-3.5 pt-1 border-t border-neutral-800/60 dark:border-neutral-800/80 space-y-3">
              {/* Audio Visualizer Bars */}
              <div className="flex items-end justify-center gap-1 h-6 py-1">
                {[40, 75, 50, 90, 60, 30, 85, 45, 95, 70, 35, 80].map((h, i) => (
                  <span
                    key={i}
                    className={`w-1 rounded-full transition-all duration-150 ${
                      isPlaying
                        ? i % 2 === 0
                          ? 'bg-purple-500 shadow-sm shadow-purple-500/50'
                          : 'bg-emerald-400 shadow-sm shadow-emerald-400/50'
                        : 'bg-neutral-600/40 h-1.5'
                    }`}
                    style={{
                      height: isPlaying ? `${Math.max(6, Math.sin(Date.now() / 200 + i) * h * 0.25 + h * 0.2)}px` : '4px',
                    }}
                  />
                ))}
              </div>

              {/* Volume Slider */}
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <span className="text-[11px] uppercase tracking-wider">Volume</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer h-1.5 bg-neutral-700 rounded-lg"
                  aria-label="Volume slider"
                />
                <span className="font-mono text-[11px] w-8 text-right">
                  {Math.round((isMuted ? 0 : volume) * 100)}%
                </span>
              </div>

              {canUpload && <div>
                <button
                  onClick={onOpenUploads}
                  className="w-full px-2.5 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-colors font-medium bg-neutral-800/50 text-neutral-400 hover:text-neutral-200"
                >
                  <Upload className="h-3.5 w-3.5 text-emerald-400" />
                  Upload tracks
                </button>
              </div>}

              <div>
                <label htmlFor="shared-audio-track" className="block text-xs mb-1">Background music</label>
                <select id="shared-audio-track" value={selectedTrackId} disabled={trackLoading || tracks.length === 0} onChange={e => selectTrack(e.target.value)} className="w-full rounded-lg border border-neutral-600 bg-transparent p-2 text-sm">
                  <option value="" disabled className="text-neutral-900">{tracks.length ? 'Choose a track' : 'No tracks uploaded yet'}</option>
                  {tracks.map(track => <option key={track.id} value={track.id} className="text-neutral-900">{track.title}</option>)}
                </select>
                {trackLoading && <p role="status" className="text-xs mt-2">Loading track…</p>}
                {(trackError || mediaErrorMessage) && <p role="alert" className="text-xs text-red-500 mt-2">{trackError || mediaErrorMessage}</p>}
              </div>

              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-normal text-center">
                Only audio uploaded to the database is played. Press Play to start; the playlist repeats automatically.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
