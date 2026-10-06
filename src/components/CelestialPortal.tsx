import React, { useState, useEffect } from 'react';
import { Send, Mic, PenLine, Flame, Sparkles, Coffee, Heart, Feather, BookOpen, Volume2, Calendar, ShieldCheck, Check, User } from 'lucide-react';
import { CalligraphyName } from './CalligraphyName';
import { JohnPortrait } from './JohnPortrait';
import { VoiceRecorder } from './VoiceRecorder';
import { RelationshipSelect } from './RelationshipSelect';
import { CelestialMessage, OfferingType, UserProfile } from '../types/memorial';
import { playSingingBowlChime } from '../utils/audioSynthesis';
import { createCelestialMessage, updateRemoteShrine } from '../services/dbService';

interface CelestialPortalProps {
  isDarkMode: boolean;
  currentUser: UserProfile | null;
  onAscendOffering: (offering: OfferingType) => void;
  onViewJournal: () => void;
  onOpenAuth: () => void;
}

export const CelestialPortal: React.FC<CelestialPortalProps> = ({
  isDarkMode,
  currentUser,
  onAscendOffering,
  onViewJournal,
  onOpenAuth,
}) => {
  const [inputMode, setInputMode] = useState<'text' | 'voice'>('text');
  const [senderName, setSenderName] = useState<string>('');
  const [senderRelationship, setSenderRelationship] = useState<string>('');
  const [textContent, setTextContent] = useState<string>('');
  const [selectedOffering, setSelectedOffering] = useState<OfferingType>('lantern');
  const [selectedCategory, setSelectedCategory] = useState<CelestialMessage['category']>('daily');
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordedDuration, setRecordedDuration] = useState<number>(0);
  const [showVoiceRecorderModal, setShowVoiceRecorderModal] = useState<boolean>(false);
  const [hasSentConfirmation, setHasSentConfirmation] = useState<boolean>(false);
  const [lastSentOffering, setLastSentOffering] = useState<OfferingType>('lantern');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Auto-complete name from signed-in user
  useEffect(() => {
    if (currentUser?.displayName && !senderName) {
      setSenderName(currentUser.displayName);
    }
    if (currentUser?.relationship && !senderRelationship) {
      setSenderRelationship(currentUser.relationship);
    }
  }, [currentUser]);

  const offeringOptions: { id: OfferingType; label: string; icon: string; desc: string; hanzi: string }[] = [
    {
      id: 'lantern',
      label: 'Sky Lantern',
      icon: '🏮',
      desc: 'Floating gently upward with your words into the starlit sky',
      hanzi: '天燈祈福',
    },
    {
      id: 'incense',
      label: 'Sandalwood Incense',
      icon: '🕯️',
      desc: 'Sacred smoke carrying your thoughts to heaven',
      hanzi: '沉香裊裊',
    },
    {
      id: 'reiki_qi',
      label: 'Reiki Qi Blessing',
      icon: '✨',
      desc: 'Universal life energy radiating violet and emerald healing',
      hanzi: '靈氣傳心',
    },
    {
      id: 'tea',
      label: 'Filial Tea Offering',
      icon: '🍵',
      desc: 'Honoring John with traditional reverence and quiet peace',
      hanzi: '敬茶懷德',
    },
    {
      id: 'lotus',
      label: 'Pure White Lotus',
      icon: '🪷',
      desc: 'Symbol of eternal love, resilience, and spiritual harmony',
      hanzi: '蓮花清心',
    },
  ];

  const thoughtStarters = [
    'John, just checking in to tell you about my day...',
    'I was thinking about the martial arts lessons you shared...',
    'I miss your presence so much today...',
    'Thank you for always protecting and inspiring everyone...',
    'Sending you calm Reiki peace and love up there...',
  ];

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMode === 'text' && !textContent.trim()) return;
    if (inputMode === 'voice' && !recordedAudioUrl) return;

    setIsSubmitting(true);
    const newMsgData: Omit<CelestialMessage, 'id'> = {
      senderId: currentUser?.uid || undefined,
      senderName: senderName.trim() || (currentUser?.displayName ? currentUser.displayName : 'Loving Family'),
      senderRelationship: senderRelationship.trim() || 'Family & Friend',
      type: inputMode,
      content: inputMode === 'text' ? textContent.trim() : undefined,
      audioBlobUrl: inputMode === 'voice' && recordedAudioUrl ? recordedAudioUrl : undefined,
      audioDurationSeconds: inputMode === 'voice' ? recordedDuration : undefined,
      offering: selectedOffering,
      category: selectedCategory,
      createdAt: new Date().toISOString(),
    };

    // Save to Firestore database & local backup
    await createCelestialMessage(newMsgData);

    // Update remote shrine counters
    updateRemoteShrine((prev) => {
      const next = { ...prev };
      if (selectedOffering === 'lantern') next.lanternsReleasedCount += 1;
      if (selectedOffering === 'incense') next.incenseLitCount += 1;
      if (selectedOffering === 'tea') next.teaOfferedCount += 1;
      return next;
    });

    // Audio chime & canvas trigger
    playSingingBowlChime(216, 5.0, 0.3);
    onAscendOffering(selectedOffering);

    setLastSentOffering(selectedOffering);
    setHasSentConfirmation(true);
    setIsSubmitting(false);

    // Reset inputs
    setTextContent('');
    setRecordedAudioUrl(null);
    setRecordedDuration(0);
  };

  const handleVoiceCompleted = (audioUrl: string, durationSeconds: number) => {
    setRecordedAudioUrl(audioUrl);
    setRecordedDuration(durationSeconds);
    setShowVoiceRecorderModal(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Sacred Memorial Header */}
      <div className="text-center space-y-3 mb-10">
        <div className="flex justify-center pb-2">
          <JohnPortrait size="lg" showFrame={true} showSeal={true} />
        </div>

        <CalligraphyName
          size="hero"
          honorific="The Celestial Portal to Heaven"
          subtitle="A sacred sanctuary to speak with John, share your daily thoughts, and send prayers"
        />

        <div className="max-w-xl mx-auto pt-2">
          <p className="text-xs sm:text-sm text-neutral-400 dark:text-neutral-400 leading-relaxed font-sans">
            In times when grief feels heavy or when you simply want to tell him about your day,
            speak or write to him here. <strong className="font-semibold text-neutral-200">This portal does not respond</strong>—it
            is your private, sacred bridge to John in heaven. Energy is never destroyed, only transformed.
          </p>
        </div>

        {/* Eastern / Reiki / Kung Fu Heritage Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs text-neutral-400 font-sans">
          <span className="flex items-center gap-1.5 text-purple-400 font-medium">
            <Sparkles className="h-3.5 w-3.5" />
            Reiki Energy Healing (靈氣)
          </span>
          <span aria-hidden="true" className="text-neutral-600">·</span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <Feather className="h-3.5 w-3.5" />
            Wushu & Martial Spirit (尚武)
          </span>
          <span aria-hidden="true" className="text-neutral-600">·</span>
          <span className="flex items-center gap-1.5 text-amber-400 font-medium">
            <Heart className="h-3.5 w-3.5" />
            Eternal Ancestral Love (思親)
          </span>
        </div>
      </div>

      {/* Confirmation State after Ascension */}
      {hasSentConfirmation ? (
        <div
          className={`rounded-2xl border p-8 text-center space-y-6 max-w-2xl mx-auto backdrop-blur-md transition-all ${
            isDarkMode
              ? 'bg-neutral-900/90 border-purple-500/30 shadow-2xl shadow-purple-950/40 text-neutral-100'
              : 'bg-white border-purple-200 shadow-xl text-neutral-800'
          }`}
        >
          <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-20"></span>
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-purple-600 to-emerald-500 text-white shadow-lg">
              <Sparkles className="h-8 w-8" />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-serif font-semibold text-neutral-100 dark:text-neutral-100">
              Your Words Have Ascended to Heaven
            </h3>
            <div className="flex justify-center my-2">
              <CalligraphyName size="sm" showSeal={false} />
            </div>
            <p className="text-sm text-neutral-400 max-w-lg mx-auto leading-relaxed">
              Your heartfelt words and the <span className="text-amber-400 font-medium">{offeringOptions.find(o => o.id === lastSentOffering)?.label}</span> have been safely recorded in the database and ascended to the celestial realm.
              John hears you in the stillness of your heart and the gentle breeze.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setHasSentConfirmation(false)}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium text-sm hover:from-purple-500 hover:to-purple-600 transition-all shadow-md shadow-purple-900/30"
            >
              Commune with John Again
            </button>
            <button
              onClick={onViewJournal}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg border border-neutral-700 bg-neutral-800/60 text-neutral-200 text-sm hover:bg-neutral-800 transition-colors"
            >
              <BookOpen className="h-4 w-4 text-emerald-400" />
              View Messages Sent
            </button>
          </div>
        </div>
      ) : (
        /* The Sacred Communication Form */
        <div
          className={`rounded-2xl border p-4 sm:p-8 backdrop-blur-md transition-all shadow-xl ${
            isDarkMode
              ? 'bg-neutral-900/80 border-neutral-800 text-neutral-100'
              : 'bg-white/95 border-stone-200 text-neutral-800 shadow-stone-200/50'
          }`}
        >
          {/* Mode Switch: Text vs Voice */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-neutral-800/80 mb-6">
            <div>
              <h3 className="text-lg font-serif font-semibold flex items-center gap-2 text-neutral-100">
                <PenLine className="h-5 w-5 text-purple-400" />
                Commune with John
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Choose how you wish to speak with him today
              </p>
            </div>

            {/* Segmented Mode Control */}
            <div className="flex self-start sm:self-auto items-center gap-1 p-1 bg-neutral-950/80 border border-neutral-800 rounded-lg">
              <button
                type="button"
                onClick={() => setInputMode('text')}
                className={`flex items-center gap-1.5 px-2 sm:px-3.5 py-2 text-xs font-medium rounded-md transition-all ${
                  inputMode === 'text'
                    ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <PenLine className="h-3.5 w-3.5" />
                Written Letter
              </button>
              <button
                type="button"
                onClick={() => {
                  setInputMode('voice');
                  setShowVoiceRecorderModal(true);
                }}
                className={`flex items-center gap-1.5 px-2 sm:px-3.5 py-2 text-xs font-medium rounded-md transition-all ${
                  inputMode === 'voice'
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Mic className="h-3.5 w-3.5" />
                Spoken Voice
              </button>
            </div>
          </div>

          <form onSubmit={handleSend} className="space-y-6">
            {/* Sender Metadata with Auto-Completion */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium uppercase tracking-wider text-neutral-400">
                    Your Name / Identity *
                  </label>
                  {currentUser ? (
                    <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                      <Check className="h-3 w-3" /> Auto-filled ({currentUser.displayName})
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={onOpenAuth}
                      className="text-[11px] text-purple-400 hover:text-purple-300 underline"
                    >
                      Sign In to autofill
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  required
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="e.g. Scott, Liam, Sarah, Master Chen..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-neutral-700/80 bg-neutral-950/60 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-neutral-400 mb-1.5">
                  Relationship to John
                </label>
                <RelationshipSelect
                  value={senderRelationship || 'Close Friend'}
                  onChange={setSenderRelationship}
                />
              </div>
            </div>

            {/* Input Content: Text vs Voice */}
            {inputMode === 'text' ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium uppercase tracking-wider text-neutral-400">
                    Your Words to <span className="text-red-700 dark:text-red-400">John Alan Whittle</span>
                  </label>
                  <span className="text-[11px] text-neutral-500">
                    {textContent.length} characters
                  </span>
                </div>

                <textarea
                  rows={6}
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="John, it's hard without you here today. I just wanted to tell you..."
                  className="w-full px-4 py-3 text-sm rounded-xl border border-neutral-700/80 bg-neutral-950/70 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 font-sans leading-relaxed resize-y"
                  required={inputMode === 'text'}
                />

                {/* Helpful thought starter chips */}
                <div className="pt-1">
                  <p className="text-[11px] text-neutral-500 mb-1.5">
                    Click to begin a thought if words feel hard to find:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {thoughtStarters.map((starter, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setTextContent((prev) => (prev ? `${prev} ${starter}` : starter))}
                        className="text-[11px] px-2.5 py-1 rounded bg-neutral-800/60 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700/60 transition-colors text-left"
                      >
                        "{starter}"
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Spoken Voice Mode Display */
              <div className="space-y-4">
                <label className="block text-xs font-medium uppercase tracking-wider text-neutral-400">
                  Your Spoken Voice Recording
                </label>

                {recordedAudioUrl ? (
                  <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                        <Check className="h-4 w-4" />
                        Voice message recorded ({Math.floor(recordedDuration / 60)}:{(recordedDuration % 60).toString().padStart(2, '0')})
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowVoiceRecorderModal(true)}
                        className="text-xs text-purple-400 hover:text-purple-300 underline"
                      >
                        Re-record voice
                      </button>
                    </div>

                    <audio
                      src={recordedAudioUrl}
                      controls
                      className="w-full h-9 rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-neutral-700 p-6 text-center space-y-3">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                      <Mic className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-200">
                        No voice recording attached yet
                      </p>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        Click below to open the recorder and speak directly to John
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowVoiceRecorderModal(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-500 transition-colors"
                    >
                      <Mic className="h-3.5 w-3.5" />
                      Open Voice Recorder
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Sacred Offering Selection */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium uppercase tracking-wider text-neutral-400">
                  Select a Celestial Offering to Accompany Your Words
                </label>
                <span className="text-[11px] text-purple-400">
                  Eastern & Reiki Memorial Offerings
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {offeringOptions.map((off) => {
                  const isSelected = selectedOffering === off.id;
                  return (
                    <div
                      key={off.id}
                      onClick={() => setSelectedOffering(off.id)}
                      className={`cursor-pointer rounded-xl border p-3.5 transition-all text-left flex flex-col justify-between ${
                        isSelected
                          ? 'border-purple-500 bg-purple-950/30 shadow-md shadow-purple-950/40 ring-1 ring-purple-500/60'
                          : 'border-neutral-800 bg-neutral-950/40 hover:border-neutral-700 hover:bg-neutral-900/60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xl">{off.icon}</span>
                        <span className="font-calligraphy text-xs text-emerald-400 tracking-wider">
                          {off.hanzi}
                        </span>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-neutral-100">
                          {off.label}
                        </div>
                        <div className="text-[11px] text-neutral-400 mt-0.5 leading-normal">
                          {off.desc}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-neutral-500 italic">
                "Energy is neither created nor destroyed; it merely transforms."
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onViewJournal}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-lg border border-neutral-700 bg-neutral-800/40 hover:bg-neutral-800 text-neutral-300 text-xs font-medium transition-colors"
                >
                  Past Messages Sent
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || (inputMode === 'text' ? !textContent.trim() : !recordedAudioUrl)}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 via-purple-700 to-emerald-600 text-white font-medium text-sm hover:opacity-95 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-purple-950/40"
                >
                  <Send className="h-4 w-4" />
                  <span>{isSubmitting ? 'Transmitting...' : 'Send to John in Heaven'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Voice Recorder Modal */}
      {showVoiceRecorderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="max-w-md w-full">
            <VoiceRecorder
              onRecordingComplete={handleVoiceCompleted}
              onCancel={() => setShowVoiceRecorderModal(false)}
              isDarkMode={isDarkMode}
            />
          </div>
        </div>
      )}
    </div>
  );
};
