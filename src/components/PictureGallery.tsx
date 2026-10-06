import React, { useEffect, useState } from 'react';
import { Check, Clock, ImagePlus, Music2, Trash2 } from 'lucide-react';
import { loadMediaBlob, mediaError, MemorialMedia } from '../lib/media';

function GalleryPicture({ item, isDarkMode }: { item: MemorialMedia; isDarkMode: boolean }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let disposed = false, objectUrl = '';
    setUrl(''); setError('');
    loadMediaBlob(item).then(blob => {
      if (disposed) return;
      objectUrl = URL.createObjectURL(blob); setUrl(objectUrl);
    }).catch(err => { if (!disposed) setError(mediaError(err)); });
    return () => { disposed = true; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [item.path, attempt]);
  return <figure className={`overflow-hidden rounded-2xl border ${isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-stone-200'}`}>
    {url ? item.kind === 'video'
      ? <video src={url} controls preload="metadata" aria-label={item.title} className="w-full aspect-video bg-black" />
      : <a href={url} target="_blank" rel="noreferrer" aria-label={`View ${item.title} at full size`}><img src={url} alt={item.title} className="w-full aspect-square object-cover" loading="lazy" /></a>
      : <div className="aspect-square flex items-center justify-center p-4 text-center text-sm" role="status">{error ? <div><p>{error}</p><button onClick={() => setAttempt(n => n + 1)} className="mt-2 text-purple-500 underline">Retry</button></div> : 'Loading media…'}</div>}
    <figcaption className="p-4 text-sm break-words">{item.title}</figcaption>
  </figure>;
}

function PendingSubmission({ item, isDarkMode, onApprove, onReject }: {
  item: MemorialMedia;
  isDarkMode: boolean;
  onApprove: (item: MemorialMedia) => Promise<void>;
  onReject: (item: MemorialMedia) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const act = async (action: (media: MemorialMedia) => Promise<void>) => {
    setBusy(true); setError('');
    try { await action(item); }
    catch (err) { setError(mediaError(err)); }
    finally { setBusy(false); }
  };
  return <article className={`rounded-xl border p-4 ${isDarkMode ? 'border-neutral-700 bg-neutral-900' : 'border-stone-200 bg-white'}`}>
    <GalleryPicture item={item} isDarkMode={isDarkMode} />
    <p className="text-xs opacity-70 mt-2 capitalize">{item.kind} · awaiting approval</p>
    {error && <p role="alert" className="text-xs text-red-500 mt-2">{error}</p>}
    <div className="flex gap-2 mt-3">
      <button type="button" disabled={busy} onClick={() => void act(onApprove)} className="inline-flex items-center gap-1 rounded-lg bg-emerald-700 px-3 py-2 text-xs text-white disabled:opacity-50"><Check className="h-3.5 w-3.5" /> Approve</button>
      <button type="button" disabled={busy} onClick={() => void act(onReject)} className="inline-flex items-center gap-1 rounded-lg border border-red-500/50 px-3 py-2 text-xs text-red-400 disabled:opacity-50"><Trash2 className="h-3.5 w-3.5" /> Reject</button>
    </div>
  </article>;
}

function AdminMediaRow({ item, isDarkMode, onDelete }: {
  item: MemorialMedia;
  isDarkMode: boolean;
  onDelete: (item: MemorialMedia) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const remove = async () => {
    if (!window.confirm(`Permanently delete "${item.title}"?`)) return;
    setBusy(true); setError('');
    try { await onDelete(item); }
    catch (err) { setError(mediaError(err)); }
    finally { setBusy(false); }
  };
  const purpose = item.kind === 'audio'
    ? item.audioPurpose === 'meditation' ? 'Meditation sound' : 'Background music'
    : item.kind === 'video' ? 'Published video' : 'Published photo';
  return <article className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3 ${isDarkMode ? 'border-neutral-700 bg-neutral-900' : 'border-stone-200 bg-white'}`}>
    <div className="min-w-0">
      <p className="break-words text-sm font-medium">{item.title}</p>
      <p className="mt-1 text-xs opacity-70">{purpose}</p>
      {error && <p role="alert" className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
    <button type="button" disabled={busy} onClick={() => void remove()} className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-red-500/50 px-3 py-2 text-xs text-red-400 disabled:opacity-50">
      <Trash2 className="h-3.5 w-3.5" /> {busy ? 'Deleting…' : 'Delete'}
    </button>
  </article>;
}

export function PictureGallery({ items, pendingItems, loading, error, isDarkMode, canManage, onUpload, onApprove, onReject, onDelete, adminMode = false }: {
  items: MemorialMedia[];
  pendingItems: MemorialMedia[];
  loading: boolean;
  error: string;
  isDarkMode: boolean;
  canManage: boolean;
  onUpload: () => void;
  onApprove: (item: MemorialMedia) => Promise<void>;
  onReject: (item: MemorialMedia) => Promise<void>;
  onDelete: (item: MemorialMedia) => Promise<void>;
  adminMode?: boolean;
}) {
  const memories = items.filter(item => item.kind === 'picture' || item.kind === 'video');
  const pending = pendingItems.filter(item => item.kind === 'picture' || item.kind === 'video');
  const audioTracks = items.filter(item => item.kind === 'audio');
  return <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-6">
    <div className="flex flex-wrap justify-between items-center gap-4"><div><h1 className="font-serif text-3xl">{adminMode ? 'Admin Portal' : 'Photo & Video Gallery'}</h1><p className="text-sm opacity-70 mt-2">{adminMode ? 'Review submissions, manage published media, and upload audio.' : <>Approved memories of <span className="text-red-700 dark:text-red-400">John Alan Whittle</span>, for logged-in members.</>}</p></div>
      <div className="flex flex-wrap gap-2">
        {adminMode && canManage && <button type="button" onClick={onUpload} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-white text-sm"><ImagePlus className="h-4 w-4" /> Upload media</button>}
        {!adminMode && !canManage && <button type="button" onClick={onUpload} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-white text-sm"><ImagePlus className="h-4 w-4" /> Submit a photo or video</button>}
      </div>
    </div>
    {adminMode && canManage && <section aria-labelledby="media-admin-title" className="space-y-5 rounded-2xl border border-amber-500/30 bg-amber-950/10 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 id="media-admin-title" className="font-serif text-2xl">Media admin</h2><p className="mt-1 text-sm opacity-70">Upload media, publish approved photos/videos, or remove media from the site.</p></div>
      </div>
      <section aria-labelledby="pending-submissions-title" className="space-y-3">
      <h2 id="pending-submissions-title" className="flex items-center gap-2 font-serif text-xl"><Clock className="h-5 w-5 text-amber-500" /> Pending submissions ({pending.length})</h2>
      {pending.length ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">{pending.map(item => <PendingSubmission key={item.id} item={item} isDarkMode={isDarkMode} onApprove={onApprove} onReject={onReject} />)}</div> : <p className="text-sm opacity-70">No submissions are waiting for approval.</p>}
      </section>
      <section aria-labelledby="published-media-title" className="space-y-3">
        <h2 id="published-media-title" className="font-serif text-xl">Published photos & videos ({memories.length})</h2>
        {memories.length ? <div className="grid gap-2">{memories.map(item => <AdminMediaRow key={item.id} item={item} isDarkMode={isDarkMode} onDelete={onDelete} />)}</div> : <p className="text-sm opacity-70">No photos or videos are published.</p>}
      </section>
      <section aria-labelledby="audio-library-title" className="space-y-3">
        <h2 id="audio-library-title" className="flex items-center gap-2 font-serif text-xl"><Music2 className="h-5 w-5 text-purple-400" /> Audio library ({audioTracks.length})</h2>
        {audioTracks.length ? <div className="grid gap-2">{audioTracks.map(item => <AdminMediaRow key={item.id} item={item} isDarkMode={isDarkMode} onDelete={onDelete} />)}</div> : <p className="text-sm opacity-70">No background, altar, or meditation tracks uploaded.</p>}
      </section>
    </section>}
    {!adminMode && (error ? <p role="alert" className="text-red-500">{error}</p> : loading ? <p role="status">Loading gallery…</p> : memories.length === 0 ? <div className="rounded-2xl border border-purple-500/30 p-10 text-center"><p>No approved photos or videos yet.</p><p className="text-sm opacity-70 mt-2">Submit a memory to share it with the portal owner for approval.</p></div> : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">{memories.map(item => <GalleryPicture key={item.id} item={item} isDarkMode={isDarkMode} />)}</div>)}
  </section>;
}
