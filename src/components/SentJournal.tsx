import React, { useState, useEffect } from 'react';
import { Volume2, Play, Pause, Trash2, ArrowLeft, Calendar, User, Sparkles, Feather, Heart } from 'lucide-react';
import { CelestialMessage } from '../types/memorial';
import { CalligraphyName } from './CalligraphyName';
import { JohnPortrait } from './JohnPortrait';
import { subscribeToMessages, deleteCelestialMessage } from '../services/dbService';

interface SentJournalProps {
  onBackToPortal: () => void;
  isDarkMode: boolean;
}

export const SentJournal: React.FC<SentJournalProps> = ({ onBackToPortal, isDarkMode }) => {
  const [messages, setMessages] = useState<CelestialMessage[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'text' | 'voice'>('all');

  useEffect(() => {
    const unsubscribe = subscribeToMessages((updated) => {
      setMessages(updated);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Remove this message from the journal?')) {
      await deleteCelestialMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
    }
  };

  const filteredMessages = messages.filter((m) => {
    if (filterType === 'all') return true;
    return m.type === filterType;
  });

  const getOfferingBadge = (offering: string) => {
    switch (offering) {
      case 'lantern':
        return { label: 'Sky Lantern', icon: '🏮', color: 'text-amber-400' };
      case 'incense':
        return { label: 'Incense Smoke', icon: '🕯️', color: 'text-purple-400' };
      case 'reiki_qi':
        return { label: 'Reiki Qi Pulse', icon: '✨', color: 'text-emerald-400' };
      case 'tea':
        return { label: 'Filial Tea', icon: '🍵', color: 'text-emerald-300' };
      case 'lotus':
        return { label: 'Pure Lotus', icon: '🪷', color: 'text-pink-300' };
      default:
        return { label: 'Offering', icon: '🕊️', color: 'text-neutral-400' };
    }
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-neutral-800">
        <div>
          <button
            onClick={onBackToPortal}
            className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Return to Celestial Portal
          </button>
          <h2 className="text-2xl font-serif font-semibold text-neutral-100 flex items-center gap-2">
            Messages & Voice Sent to Heaven
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            A sacred archive of every word, prayer, and voice recording sent to{' '}
            <span className="font-semibold text-neutral-200">John Alan Whittle</span>
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 p-1 bg-neutral-950 border border-neutral-800 rounded-lg shrink-0">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterType === 'all'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            All ({messages.length})
          </button>
          <button
            onClick={() => setFilterType('text')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterType === 'text'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Letters ({messages.filter((m) => m.type === 'text').length})
          </button>
          <button
            onClick={() => setFilterType('voice')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterType === 'voice'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Voice Notes ({messages.filter((m) => m.type === 'voice').length})
          </button>
        </div>
      </div>

      {/* Recipient Dedication */}
      <div className="my-6 text-center space-y-2">
        <div className="flex justify-center pb-1">
          <JohnPortrait size="md" showFrame={true} showSeal={true} />
        </div>
        <CalligraphyName size="md" subtitle="Transmitted to the heavenly realm" />
      </div>

      {/* Message List */}
      {filteredMessages.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-neutral-800 rounded-2xl p-8 bg-neutral-950/40">
          <Sparkles className="h-10 w-10 text-neutral-600 mx-auto mb-3" />
          <h3 className="text-base font-serif font-medium text-neutral-300">
            No Messages Sent Yet
          </h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            Whenever grief feels heavy or you just want to talk with John, use the Celestial Portal to send a letter or voice recording.
          </p>
          <button
            onClick={onBackToPortal}
            className="mt-4 px-5 py-2 text-xs font-medium rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-colors"
          >
            Commune with John Now
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMessages.map((msg) => {
            const badge = getOfferingBadge(msg.offering);
            return (
              <div
                key={msg.id}
                className={`rounded-xl border p-5 transition-all ${
                  isDarkMode
                    ? 'bg-neutral-900/80 border-neutral-800 text-neutral-100 hover:border-neutral-700'
                    : 'bg-white border-stone-200 text-neutral-800 shadow-sm'
                }`}
              >
                {/* Meta row */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-neutral-800/60 text-xs">
                  <div className="flex items-center gap-2 text-neutral-400">
                    <span className="font-semibold text-neutral-200">
                      {msg.senderName}
                    </span>
                    <span aria-hidden="true" className="text-neutral-600">·</span>
                    <span>{msg.senderRelationship}</span>
                    <span aria-hidden="true" className="text-neutral-600">·</span>
                    <span className="flex items-center gap-1 text-[11px] text-neutral-500">
                      <Calendar className="h-3 w-3" />
                      {formatDate(msg.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium ${badge.color}`}>
                      <span>{badge.icon}</span>
                      <span>{badge.label}</span>
                    </span>

                    <button
                      onClick={() => handleDelete(msg.id)}
                      className="text-neutral-500 hover:text-red-400 p-1 transition-colors"
                      title="Remove from journal"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Body Content */}
                <div className="pt-3">
                  {msg.type === 'text' ? (
                    <p className="text-sm font-sans leading-relaxed whitespace-pre-wrap text-neutral-200">
                      {msg.content}
                    </p>
                  ) : (
                    <div className="rounded-lg bg-neutral-950/60 border border-neutral-800 p-3 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                          <Volume2 className="h-4 w-4" />
                          Voice Recording to John
                        </span>
                        {msg.audioDurationSeconds && (
                          <span className="font-mono text-[11px] text-neutral-400">
                            {Math.floor(msg.audioDurationSeconds / 60)}:{(msg.audioDurationSeconds % 60).toString().padStart(2, '0')}
                          </span>
                        )}
                      </div>

                      {msg.audioBlobUrl && (
                        <audio
                          src={msg.audioBlobUrl}
                          controls
                          className="w-full h-8 rounded mt-1"
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* Footer status */}
                <div className="mt-3 pt-2 text-[11px] text-neutral-500 flex items-center justify-between">
                  <span>Ascended to the heavens</span>
                  <span className="italic font-serif text-purple-400/80">
                    "Forever listening in peace"
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
