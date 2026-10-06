import React, { useEffect, useRef, useState } from 'react';
import { Settings, Upload, X } from 'lucide-react';
import { AUDIO_TYPES, IMAGE_TYPES, mediaError, uploadMedia, validateMedia } from '../lib/media';

interface Props { onClose: () => void; onGallery: () => void; isDarkMode: boolean }

export function MediaUploadModal({ onClose, onGallery, isDarkMode }: Props) {
  const [kind, setKind] = useState<'picture' | 'audio'>('picture');
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const busyRef = useRef(false);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    dialog?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busyRef.current) onClose();
      if (event.key !== 'Tab' || !dialog) return;
      const controls = Array.from(dialog.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), [tabindex="0"]'));
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) { event.preventDefault(); last?.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', keydown);
    return () => { document.removeEventListener('keydown', keydown); previous?.focus(); };
  }, [onClose]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file || busyRef.current) return;
    busyRef.current = true; setBusy(true); setError(''); setMessage(''); setProgress(0);
    try {
      await uploadMedia(file, kind, title, setProgress);
      setMessage(kind === 'picture' ? 'Picture uploaded to the gallery.' : 'Audio track uploaded to the background music playlist.');
      setFile(null); setTitle('');
      if (inputRef.current) inputRef.current.value = '';
    } catch (err) { setError(mediaError(err)); }
    finally { busyRef.current = false; setBusy(false); }
  };

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="media-upload-title" tabIndex={-1} className={`w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border p-6 shadow-2xl ${isDarkMode ? 'bg-neutral-900 border-neutral-700 text-neutral-100' : 'bg-white border-stone-200 text-neutral-900'}`}>
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 id="media-upload-title" className="flex items-center gap-2 font-serif text-xl"><Settings className="h-5 w-5 text-purple-500" /> Pictures & Audio</h2>
        <button type="button" onClick={onClose} disabled={busy} aria-label="Close media settings" className="p-2 rounded-lg hover:bg-purple-500/20 disabled:opacity-40"><X className="h-5 w-5" /></button>
      </div>
      <p className="text-sm opacity-75 mb-5">Add pictures to the gallery and audio tracks to John’s background music playlist.</p>
      <form onSubmit={submit} className="space-y-4">
        <div><label htmlFor="media-kind" className="block text-sm mb-1">Upload type</label>
          <select id="media-kind" disabled={busy} value={kind} onChange={e => { setKind(e.target.value as 'picture' | 'audio'); setFile(null); setError(''); setMessage(''); if (inputRef.current) inputRef.current.value = ''; }} className="w-full rounded-lg border border-neutral-500 bg-transparent p-2">
            <option value="picture" className="text-neutral-900">Picture</option><option value="audio" className="text-neutral-900">Audio track</option>
          </select></div>
        <div><label htmlFor="media-title" className="block text-sm mb-1">{kind === 'picture' ? 'Caption' : 'Track title'} (optional)</label>
          <input id="media-title" value={title} onChange={e => setTitle(e.target.value)} maxLength={150} disabled={busy} className="w-full rounded-lg border border-neutral-500 bg-transparent p-2" /></div>
        <div><label htmlFor="media-file" className="block text-sm mb-1">{kind === 'picture' ? 'Choose a picture' : 'Choose an audio track'}</label>
          <input ref={inputRef} id="media-file" type="file" required disabled={busy} accept={(kind === 'picture' ? IMAGE_TYPES : AUDIO_TYPES).join(',')} onChange={e => {
            setError(''); setMessage(''); const selected = e.target.files?.[0]; setFile(null);
            if (selected) { try { validateMedia(selected, kind); setFile(selected); } catch (err) { setError(mediaError(err)); e.target.value = ''; } }
          }} className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-purple-600 file:px-3 file:py-2 file:text-white" />
          <p className="text-xs opacity-70 mt-2">{kind === 'picture' ? 'JPEG, PNG, WebP or GIF. Maximum 10 MB.' : 'MP3, M4A, WAV, OGG, WebM or FLAC. Maximum 50 MB.'}</p></div>
        {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
        {message && <p role="status" className="text-sm text-emerald-500">{message}</p>}
        {busy && <div role="status"><progress value={progress} max={100} aria-label="Upload progress" className="w-full accent-purple-500" /><p className="text-xs">Uploading… {progress}%</p></div>}
        <button type="submit" disabled={!file || busy} className="w-full flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-3 text-white disabled:opacity-40"><Upload className="h-4 w-4" />{busy ? 'Uploading…' : 'Upload'}</button>
      </form>
      <button type="button" onClick={onGallery} disabled={busy} className="mt-4 w-full text-sm text-purple-500 underline">Open picture gallery</button>
    </div>
  </div>;
}
