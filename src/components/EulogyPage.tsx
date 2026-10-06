import React, { useEffect, useState } from 'react';
import { CalendarClock, ExternalLink, LockKeyhole, Play, ScrollText } from 'lucide-react';
import { UserProfile } from '../types/memorial';
import { canManageMedia } from '../lib/mediaAccess';
import { CalligraphyName } from './CalligraphyName';
import { JohnPortrait } from './JohnPortrait';

const EULOGY_VIDEO_ID = '4U8uAlzrNVU';
const PUBLIC_RELEASE_AT = new Date('2026-10-07T13:30:00.000Z');

interface EulogyPageProps {
  currentUser: UserProfile | null;
  isDarkMode: boolean;
}

function formatReleaseDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/London',
    timeZoneName: 'short',
  }).format(date);
}

export const EulogyPage: React.FC<EulogyPageProps> = ({ currentUser, isDarkMode }) => {
  const [now, setNow] = useState(() => Date.now());
  const isOwnerPreview = canManageMedia(currentUser);
  const isPublic = now >= PUBLIC_RELEASE_AT.getTime();
  const canViewFullEulogy = isPublic || isOwnerPreview;

  useEffect(() => {
    if (isPublic) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [isPublic]);

  const panelStyle = isDarkMode
    ? 'border-neutral-800 bg-neutral-900/80 text-neutral-100'
    : 'border-stone-200 bg-white text-neutral-900 shadow-sm';

  return (
    <main className="mx-auto max-w-5xl space-y-10 px-4 py-10 sm:px-6">
      <header className="space-y-5 text-center">
        <div className="flex justify-center">
          <JohnPortrait size="lg" showFrame showSeal />
        </div>
        <CalligraphyName
          size="hero"
          name="John Alan Whittle"
          nameClassName="text-red-700 dark:text-red-400"
          honorific="A Eulogy in Loving Memory"
          subtitle="Words spoken by his son, Scott, at the funeral"
        />
        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-neutral-400">
          Remembering John through the eulogy Scott read at the funeral and a recording of the speech.
        </p>
      </header>

      {!canViewFullEulogy ? (
        <section className={`mx-auto max-w-2xl rounded-3xl border p-8 text-center sm:p-12 ${panelStyle}`}>
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-purple-500/40 bg-purple-950/40 text-purple-300">
            <LockKeyhole className="h-6 w-6" />
          </div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-purple-300">Coming soon</p>
          <h1 className="font-serif text-2xl font-semibold sm:text-3xl">The eulogy will be available publicly soon</h1>
          <p className="mt-4 text-sm text-neutral-400">
            This page is scheduled to open on {formatReleaseDate(PUBLIC_RELEASE_AT)}.
          </p>
          <div className="mt-7 flex items-center justify-center gap-2 text-sm text-neutral-500">
            <CalendarClock className="h-4 w-4" />
            <time dateTime={PUBLIC_RELEASE_AT.toISOString()}>
              {new Intl.DateTimeFormat('en-GB', {
                timeZone: 'Europe/London',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZoneName: 'short',
              }).format(new Date(now))}
            </time>
          </div>
        </section>
      ) : (
        <div className="space-y-8">
          {isOwnerPreview && !isPublic && (
            <p role="status" className="rounded-xl border border-amber-500/40 bg-amber-950/30 px-4 py-3 text-center text-sm text-amber-200">
              Owner preview — the page becomes public on {formatReleaseDate(PUBLIC_RELEASE_AT)}.
            </p>
          )}

          <section className={`overflow-hidden rounded-3xl border p-5 sm:p-8 ${panelStyle}`}>
            <h1 className="mb-5 flex items-center justify-center gap-2 text-center font-serif text-xl font-semibold sm:text-2xl">
              <Play className="h-5 w-5 text-purple-400" />
              Scott’s eulogy
            </h1>
            <div className="aspect-video overflow-hidden rounded-2xl border border-neutral-700 bg-black">
              <iframe
                className="h-full w-full"
                src={`https://www.youtube-nocookie.com/embed/${EULOGY_VIDEO_ID}`}
                title="John Alan Whittle: A eulogy in loving memory, read by his son Scott"
                referrerPolicy="strict-origin-when-cross-origin"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
            <a
              href={`https://www.youtube.com/watch?v=${EULOGY_VIDEO_ID}`}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm text-purple-300 hover:text-purple-200"
            >
              Watch on YouTube <ExternalLink className="h-4 w-4" />
            </a>
          </section>

          <section className={`rounded-3xl border p-5 sm:p-8 ${panelStyle}`}>
            <h2 className="mb-5 flex items-center justify-center gap-2 text-center font-serif text-xl font-semibold sm:text-2xl">
              <ScrollText className="h-5 w-5 text-amber-400" />
              The words Scott read
            </h2>
            <a
              href="/images/John.jpg"
              target="_blank"
              rel="noreferrer"
              aria-label="Open a larger image of Scott's eulogy"
              className="mx-auto block max-w-3xl overflow-hidden rounded-xl border border-neutral-700 focus-visible:outline-2 focus-visible:outline-purple-400"
            >
              <img
                src="/images/John.jpg"
                alt="Image of the eulogy Scott read at John Alan Whittle’s funeral"
                className="h-auto w-full"
                loading="lazy"
              />
            </a>
            <p className="mt-3 text-center text-xs text-neutral-500">Select the image to open it at full size.</p>
          </section>
        </div>
      )}
    </main>
  );
};
