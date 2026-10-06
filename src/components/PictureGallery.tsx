import React, { useEffect, useState } from 'react';
import { ImagePlus } from 'lucide-react';
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
    {url ? <a href={url} target="_blank" rel="noreferrer" aria-label={`View ${item.title} at full size`}><img src={url} alt={item.title} className="w-full aspect-square object-cover" loading="lazy" /></a>
      : <div className="aspect-square flex items-center justify-center p-4 text-center text-sm" role="status">{error ? <div><p>{error}</p><button onClick={() => setAttempt(n => n + 1)} className="mt-2 text-purple-500 underline">Retry</button></div> : 'Loading picture…'}</div>}
    <figcaption className="p-4 text-sm break-words">{item.title}</figcaption>
  </figure>;
}

export function PictureGallery({ items, loading, error, isDarkMode, canUpload, onUpload }: { items: MemorialMedia[]; loading: boolean; error: string; isDarkMode: boolean; canUpload: boolean; onUpload: () => void }) {
  const pictures = items.filter(item => item.kind === 'picture');
  return <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-6">
    <div className="flex flex-wrap justify-between items-center gap-4"><div><h1 className="font-serif text-3xl">Picture Gallery</h1><p className="text-sm opacity-70 mt-2">Shared memories of John Alan Whittle, for logged-in members.</p></div>
      {canUpload && <button onClick={onUpload} className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-white text-sm"><ImagePlus className="h-4 w-4" /> Add a picture</button>}</div>
    {error ? <p role="alert" className="text-red-500">{error}</p> : loading ? <p role="status">Loading gallery…</p> : pictures.length === 0 ? <div className="rounded-2xl border border-purple-500/30 p-10 text-center"><p>No pictures have been uploaded yet.</p>{canUpload && <p className="text-sm opacity-70 mt-2">Use the cog or “Add a picture” to share a memory.</p>}</div> : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">{pictures.map(item => <GalleryPicture key={item.id} item={item} isDarkMode={isDarkMode} />)}</div>}
  </section>;
}
