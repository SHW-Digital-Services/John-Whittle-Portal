import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2, CheckCircle2, AlertCircle, Volume2 } from 'lucide-react';

interface VoiceRecorderProps {
  onRecordingComplete: (audioUrl: string, durationSeconds: number) => void;
  onCancel: () => void;
  isDarkMode: boolean;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onRecordingComplete,
  onCancel,
  isDarkMode,
}) => {
  const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'preview'>('idle');
  const [duration, setDuration] = useState<number>(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState<boolean>(false);
  const [previewProgress, setPreviewProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [audioLevels, setAudioLevels] = useState<number[]>(new Array(24).fill(10));

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Start Voice Recording
  const startRecording = async () => {
    setErrorMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const mimeTypes = ['audio/webm', 'audio/mp4', 'audio/ogg', ''];
      const supportedType = mimeTypes.find(type => !type || MediaRecorder.isTypeSupported(type)) || '';
      const recorder = supportedType ? new MediaRecorder(stream, { mimeType: supportedType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64data = reader.result as string;
          setAudioUrl(base64data);
          setRecordingState('preview');
        };
      };

      recorder.start(250);
      setRecordingState('recording');
      setDuration(0);

      const startTime = Date.now();
      timerIntervalRef.current = window.setInterval(() => {
        setDuration(Math.floor((Date.now() - startTime) / 1000));
      }, 500);

      const updateVisualizer = () => {
        if (!analyserRef.current) return;
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);

        const step = Math.floor(dataArray.length / 24) || 1;
        const levels = [];
        for (let i = 0; i < 24; i++) {
          const val = dataArray[i * step] || 0;
          levels.push(Math.max(8, (val / 255) * 54));
        }
        setAudioLevels(levels);
        animFrameRef.current = requestAnimationFrame(updateVisualizer);
      };
      updateVisualizer();

    } catch (err: unknown) {
      console.error('Microphone error', err);
      const errObj = err as { name?: string };
      if (errObj.name === 'NotAllowedError' || errObj.name === 'PermissionDeniedError') {
        setErrorMessage('Microphone access was denied. Please allow microphone permissions in your browser to record a voice message for John.');
      } else {
        setErrorMessage('Could not initialize microphone. Please check your audio input settings.');
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recordingState === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const discardRecording = () => {
    stopRecording();
    setAudioUrl(null);
    setRecordingState('idle');
    setDuration(0);
    setPreviewProgress(0);
    setIsPlayingPreview(false);
  };

  const togglePlayPreview = () => {
    if (!previewAudioRef.current) return;
    if (isPlayingPreview) {
      previewAudioRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      previewAudioRef.current.play().then(() => {
        setIsPlayingPreview(true);
      }).catch((e) => console.warn('Preview play err', e));
    }
  };

  const handleConfirm = () => {
    if (audioUrl) {
      onRecordingComplete(audioUrl, duration || 1);
    }
  };

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      className={`rounded-xl border p-5 transition-all ${
        isDarkMode
          ? 'bg-neutral-900/90 border-neutral-800 text-neutral-100 shadow-xl'
          : 'bg-white/95 border-stone-200 text-neutral-900 shadow-md'
      }`}
    >
      {audioUrl && (
        <audio
          ref={previewAudioRef}
          src={audioUrl}
          onTimeUpdate={() => {
            if (previewAudioRef.current && duration > 0) {
              setPreviewProgress((previewAudioRef.current.currentTime / duration) * 100);
            }
          }}
          onEnded={() => {
            setIsPlayingPreview(false);
            setPreviewProgress(0);
          }}
        />
      )}

      {errorMessage && (
        <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-red-500/30 bg-red-950/20 p-3 text-xs text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* State 1: IDLE */}
      {recordingState === 'idle' && (
        <div className="text-center py-6 space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-purple-600/30 to-emerald-500/20 border border-purple-500/40 text-purple-400">
            <Mic className="h-8 w-8" />
          </div>

          <div>
            <h4 className="text-base font-serif font-semibold text-neutral-100 dark:text-neutral-100">
              Speak Directly to John
            </h4>
            <p className="text-xs text-neutral-400 mt-1 max-w-md mx-auto">
              Press record and talk to John as if he is sitting quietly right next to you.
              Take your time; your voice will be carried to his celestial resting place.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={startRecording}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium text-sm hover:from-purple-500 hover:to-purple-600 transition-all shadow-md shadow-purple-900/40"
            >
              <Mic className="h-4 w-4" />
              Begin Speaking
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 rounded-lg text-xs text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* State 2: RECORDING */}
      {recordingState === 'recording' && (
        <div className="text-center py-5 space-y-4">
          <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-500 opacity-30"></span>
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-purple-600 text-white shadow-lg shadow-purple-600/50">
              <Mic className="h-7 w-7 animate-pulse" />
            </div>
          </div>

          <div>
            <div className="font-mono text-2xl font-bold text-neutral-100 tracking-wider">
              {formatSeconds(duration)}
            </div>
            <p className="text-xs text-emerald-400 font-medium mt-0.5 flex items-center justify-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Recording your voice to John...
            </p>
          </div>

          <div className="flex items-end justify-center gap-1 h-14 max-w-sm mx-auto px-4 py-1 bg-neutral-950/40 rounded-lg border border-neutral-800">
            {audioLevels.map((lvl, idx) => (
              <span
                key={idx}
                className="w-1.5 rounded-full transition-all duration-75"
                style={{
                  height: `${lvl}px`,
                  backgroundColor: idx % 2 === 0 ? '#c084fc' : '#4ade80',
                  boxShadow: idx % 2 === 0 ? '0 0 6px rgba(192, 132, 252, 0.6)' : '0 0 6px rgba(74, 222, 128, 0.6)',
                }}
              />
            ))}
          </div>

          <div className="flex items-center justify-center gap-3 pt-1">
            <button
              type="button"
              onClick={stopRecording}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 text-white font-medium text-sm hover:bg-emerald-500 transition-colors shadow-md shadow-emerald-950/40"
            >
              <Square className="h-4 w-4 fill-white" />
              Done Speaking
            </button>
            <button
              type="button"
              onClick={discardRecording}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs text-neutral-400 hover:text-red-400 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Discard
            </button>
          </div>
        </div>
      )}

      {/* State 3: PREVIEW & CONFIRM */}
      {recordingState === 'preview' && (
        <div className="py-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-purple-400 font-medium">
              Voice Message Preview
            </span>
            <span className="font-mono text-xs text-neutral-400">
              Duration: {formatSeconds(duration)}
            </span>
          </div>

          <div className="rounded-lg bg-neutral-950/60 border border-neutral-800 p-3.5 flex items-center gap-3">
            <button
              type="button"
              onClick={togglePlayPreview}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-600 text-white hover:bg-purple-500 transition-colors shadow-md shadow-purple-900/40"
              aria-label={isPlayingPreview ? 'Pause preview' : 'Play preview'}
            >
              {isPlayingPreview ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
            </button>

            <div className="flex-1">
              <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 transition-all duration-100"
                  style={{ width: `${previewProgress}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-neutral-400 mt-1.5">
                <span>{isPlayingPreview ? 'Listening back...' : 'Ready to send'}</span>
                <span>{formatSeconds(duration)}</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-neutral-400 text-center italic">
            "Your voice will be safeguarded in John's heavenly sanctuary."
          </p>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={discardRecording}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs text-neutral-400 hover:text-red-400 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Re-record
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="px-3 py-2 text-xs text-neutral-400 hover:text-neutral-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-emerald-600 text-white font-medium text-xs sm:text-sm hover:opacity-95 transition-opacity shadow-md shadow-purple-950/40"
              >
                <CheckCircle2 className="h-4 w-4" />
                Attach to Celestial Offering
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
