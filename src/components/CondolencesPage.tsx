import React, { useState, useEffect, useRef } from 'react';
import {
  Flame,
  Heart,
  MessageSquare,
  Feather,
  Pencil,
  Sparkles,
  Send,
  CheckCircle2,
  User,
  Check,
  Play,
  Pause,
  RotateCcw,
  Film,
  ListFilter,
  Lock,
  LogIn,
  Sliders,
} from 'lucide-react';
import { Condolence, OfferingType, UserProfile } from '../types/memorial';
import { CalligraphyName } from './CalligraphyName';
import { JohnPortrait } from './JohnPortrait';
import { RelationshipSelect } from './RelationshipSelect';
import { FAMILY_RELATIONSHIPS } from '../constants/relationships';
import { playSingingBowlChime } from '../utils/audioSynthesis';
import {
  createCondolence,
  lightCandleForCondolence,
  subscribeToCondolences,
  updateCondolence,
} from '../services/dbService';

interface CondolencesPageProps {
  isDarkMode: boolean;
  currentUser: UserProfile | null;
  onTributeLit: () => void;
  onOpenAuth: () => void;
}

export const CondolencesPage: React.FC<CondolencesPageProps> = ({
  isDarkMode,
  currentUser,
  onTributeLit,
  onOpenAuth,
}) => {
  const [condolences, setCondolences] = useState<Condolence[]>([]);
  const [authorName, setAuthorName] = useState<string>('');
  const [relationship, setRelationship] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [selectedOffering, setSelectedOffering] = useState<OfferingType>('candle');
  const [isFamilyMember, setIsFamilyMember] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [editingCondolenceId, setEditingCondolenceId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);
  const [filterRole, setFilterRole] = useState<'all' | 'family' | 'friends_students'>('all');

  // Film Credits Scroll State
  const [viewMode, setViewMode] = useState<'credits' | 'feed'>('credits');
  const [isScrolling, setIsScrolling] = useState<boolean>(true);
  const [scrollSpeed, setScrollSpeed] = useState<number>(0.8); // 0.5 = slow, 0.8 = classic film, 1.5 = fast
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Real-time Firestore subscription
  useEffect(() => {
    const unsubscribe = subscribeToCondolences((updated) => {
      setCondolences(updated);
    });
    return () => unsubscribe();
  }, []);

  // Autofill name from signed-in user
  useEffect(() => {
    if (currentUser?.displayName && !authorName) {
      setAuthorName(currentUser.displayName);
    }
    if (currentUser?.relationship && !relationship) {
      setRelationship(currentUser.relationship);
    }
  }, [currentUser]);

  // Cinematic Film Credits smooth vertical scroll animation loop
  useEffect(() => {
    if (viewMode !== 'credits') return;
    const container = scrollContainerRef.current;
    if (!container) return;

    let animFrameId: number;
    let lastTime: number | null = null;

    const scrollStep = (timestamp: number) => {
      if (lastTime === null) lastTime = timestamp;
      const deltaTime = timestamp - lastTime;
      lastTime = timestamp;

      if (isScrolling && !isHovered && container) {
        // Base speed: 28px per second multiplied by user speed factor
        const pixelsToScroll = (28 * scrollSpeed * deltaTime) / 1000;
        container.scrollTop += pixelsToScroll;

        // Loop seamlessly back to top once reached the end
        if (container.scrollTop >= container.scrollHeight - container.clientHeight - 4) {
          container.scrollTop = 0;
        }
      }

      animFrameId = requestAnimationFrame(scrollStep);
    };

    animFrameId = requestAnimationFrame(scrollStep);
    return () => cancelAnimationFrame(animFrameId);
  }, [viewMode, isScrolling, isHovered, scrollSpeed, condolences.length]);

  const handleRestartCredits = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAddCondolence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !message.trim()) return;

    setIsSubmitting(true);
    setFormError('');
    try {
      if (editingCondolenceId) {
        const existing = condolences.find(condolence => condolence.id === editingCondolenceId);
        if (!existing || existing.authorId !== currentUser?.uid) {
          throw new Error('You can only edit your own condolence.');
        }
        await updateCondolence({
          ...existing,
          authorName: authorName.trim(),
          relationship: relationship.trim() || 'Visitor & Friend',
          message: message.trim(),
          offering: selectedOffering,
          isFamily: isFamilyMember,
        });
        setEditingCondolenceId(null);
      } else {
        const newEntry: Omit<Condolence, 'id'> = {
          authorId: currentUser?.uid || undefined,
          authorName: authorName.trim(),
          relationship: relationship.trim() || 'Visitor & Friend',
          message: message.trim(),
          offering: selectedOffering,
          createdAt: new Date().toISOString(),
          candlesLit: 1,
          isFamily: isFamilyMember,
        };
        await createCondolence(newEntry);
        playSingingBowlChime(261.6, 4.0, 0.25);
        onTributeLit();
      }

      setMessage('');
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 4500);
    } catch (error) {
      console.error('Could not save condolence', error);
      setFormError(error instanceof Error ? error.message : 'Could not save your condolence. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCondolence = (condolence: Condolence) => {
    setEditingCondolenceId(condolence.id);
    setAuthorName(condolence.authorName);
    setRelationship(condolence.relationship);
    setMessage(condolence.message);
    setSelectedOffering(condolence.offering);
    setIsFamilyMember(Boolean(condolence.isFamily));
    setFormError('');
    document.getElementById('condolence-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleCancelCondolenceEdit = () => {
    setEditingCondolenceId(null);
    setAuthorName(currentUser?.displayName || '');
    setRelationship(currentUser?.relationship || '');
    setMessage('');
    setSelectedOffering('candle');
    setIsFamilyMember(false);
    setFormError('');
  };

  const handleLightCandle = async (id: string, currentCount: number) => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    await lightCandleForCondolence(id, currentCount);
    playSingingBowlChime(432, 2.5, 0.15);
    onTributeLit();
  };

  const filteredCondolences = condolences.filter((c) => {
    if (filterRole === 'all') return true;
    if (filterRole === 'family') return c.isFamily;
    if (filterRole === 'friends_students') return !c.isFamily;
    return true;
  });

  const getTributeSymbol = (type: OfferingType) => {
    switch (type) {
      case 'candle':
        return { icon: '🕯️', name: 'Candle of Honor' };
      case 'incense':
        return { icon: '🪔', name: 'Joss Incense' };
      case 'reiki_qi':
        return { icon: '✨', name: 'Reiki Energy Light' };
      case 'tea':
        return { icon: '🍵', name: 'Respectful Tea' };
      case 'lotus':
        return { icon: '🪷', name: 'White Lotus' };
      default:
        return { icon: '🕊️', name: 'Memorial Tribute' };
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Dedication Header with Portrait */}
      <div className="text-center space-y-3">
        <div className="flex justify-center pb-2">
          <JohnPortrait size="lg" showFrame={true} showSeal={true} />
        </div>

        <CalligraphyName
          size="hero"
          honorific="The Memorial Guestbook & Condolences"
          subtitle="Honoring the Life, Martial Spirit, and Healing Heart of John Alan Whittle"
        />

        <p className="text-xs sm:text-sm text-neutral-400 max-w-xl mx-auto leading-relaxed font-sans">
          Welcome to the memorial visitors space for{' '}
          <strong className="text-neutral-200">John Alan Whittle</strong>. Family, martial arts
          brothers and sisters, reiki practitioners, and dear friends are invited to read all
          tributes, celebrate his life, and light eternal candles.
        </p>
      </div>

      {/* Read-Only Visitor Notification Banner for Logged-Out Users */}
      {!currentUser && (
        <div className="rounded-2xl border border-purple-500/40 bg-gradient-to-r from-purple-950/40 via-neutral-900/90 to-emerald-950/30 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-200 backdrop-blur-md shadow-lg shadow-purple-950/20">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="h-9 w-9 rounded-full bg-purple-600/20 border border-purple-500/40 flex items-center justify-center shrink-0 text-purple-300">
              <Lock className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-neutral-100 text-sm">
                Viewing in Read-Only Visitor Mode
              </p>
              <p className="text-neutral-400 text-xs mt-0.5">
                You can freely read all condolences and film credit tributes. Sign in to write your own condolence or light a candle.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenAuth}
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-emerald-600 hover:opacity-95 text-white font-medium text-xs transition-all shadow-md shadow-purple-950/40"
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>Sign In to Leave Condolence</span>
          </button>
        </div>
      )}

      {/* Mode Switcher Bar & Cinematic Scroll Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-2xl bg-neutral-900/70 border border-neutral-800 text-xs backdrop-blur-sm">
        {/* Left: View Mode Toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-950 border border-neutral-800 rounded-xl">
          <button
            onClick={() => setViewMode('credits')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              viewMode === 'credits'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Film className="h-3.5 w-3.5" />
            <span>🎬 Film Credits Roll</span>
          </button>

          <button
            onClick={() => setViewMode('feed')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              viewMode === 'feed'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <ListFilter className="h-3.5 w-3.5" />
            <span>📋 Traditional Feed</span>
          </button>
        </div>

        {/* Right: Controls when in Film Credits Mode */}
        {viewMode === 'credits' && (
          <div className="flex flex-wrap items-center gap-2 text-neutral-400 text-[11px]">
            {/* Play / Pause Toggle */}
            <button
              onClick={() => setIsScrolling(!isScrolling)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
              title={isScrolling ? 'Pause Credits Scroll' : 'Resume Credits Scroll'}
            >
              {isScrolling ? (
                <>
                  <Pause className="h-3 w-3 text-amber-400" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="h-3 w-3 text-emerald-400" />
                  <span>Resume</span>
                </>
              )}
            </button>

            {/* Speed Options */}
            <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-neutral-950 border border-neutral-800">
              <span className="text-[10px] text-neutral-500 pl-1">Speed:</span>
              <button
                onClick={() => setScrollSpeed(0.5)}
                className={`px-1.5 py-0.5 rounded text-[10px] ${
                  scrollSpeed === 0.5 ? 'bg-neutral-800 text-purple-300 font-bold' : 'hover:text-neutral-200'
                }`}
                title="Gentle slow pace"
              >
                0.5x
              </button>
              <button
                onClick={() => setScrollSpeed(0.8)}
                className={`px-1.5 py-0.5 rounded text-[10px] ${
                  scrollSpeed === 0.8 ? 'bg-neutral-800 text-purple-300 font-bold' : 'hover:text-neutral-200'
                }`}
                title="Classic film credits pace"
              >
                1x
              </button>
              <button
                onClick={() => setScrollSpeed(1.5)}
                className={`px-1.5 py-0.5 rounded text-[10px] ${
                  scrollSpeed === 1.5 ? 'bg-neutral-800 text-purple-300 font-bold' : 'hover:text-neutral-200'
                }`}
                title="Faster pace"
              >
                1.5x
              </button>
            </div>

            {/* Restart to Beginning */}
            <button
              onClick={handleRestartCredits}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
              title="Restart from beginning of credits"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Restart</span>
            </button>

            <span className="hidden sm:inline text-[10px] text-neutral-500 italic pl-1">
              (Hover pauses scroll)
            </span>
          </div>
        )}
      </div>

      {/* Main Grid: Condolence writing form on side (if logged in), Feed / Credits Roll on main */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form (for logged-in) OR Visitor Information Card (for logged-out) */}
        <div className="lg:col-span-5 space-y-6">
          {currentUser ? (
            /* Active Form for Authenticated Users */
            <div
              id="condolence-form"
              className={`rounded-2xl border p-6 backdrop-blur-md sticky top-20 transition-all shadow-lg ${
                isDarkMode
                  ? 'bg-neutral-900/90 border-neutral-800 text-neutral-100'
                  : 'bg-white/95 border-stone-200 text-neutral-900 shadow-stone-200/50'
              }`}
            >
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-neutral-800">
                <Feather className="h-4 w-4 text-purple-400" />
                <h3 className="text-base font-serif font-semibold text-neutral-100">
                  {editingCondolenceId ? 'Edit Your Condolence' : 'Leave Your Condolence'}
                </h3>
              </div>

              {showSuccessToast && (
                <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-950/30 p-3 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Your condolence has been recorded to the database and added to the film credits.</span>
                </div>
              )}

              <form onSubmit={handleAddCondolence} className="space-y-4">
                {formError && <p role="alert" className="text-xs text-red-400">{formError}</p>}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium uppercase tracking-wider text-neutral-400">
                      Your Full Name *
                    </label>
                    <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                      <Check className="h-3 w-3" /> Auto-filled ({currentUser.displayName})
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="e.g. Master David Liu, Emma Watson..."
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-lg border border-neutral-700/80 bg-neutral-950/60 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-neutral-400 mb-1">
                    Relationship to John
                  </label>
                  <RelationshipSelect
                    value={relationship || 'Close Friend'}
                    onChange={(val) => {
                      setRelationship(val);
                      setIsFamilyMember(FAMILY_RELATIONSHIPS.has(val));
                    }}
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isFamily"
                    checked={isFamilyMember}
                    onChange={(e) => setIsFamilyMember(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-neutral-700 bg-neutral-950 text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="isFamily" className="text-xs text-neutral-300 cursor-pointer">
                    I am a member of John's family
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-neutral-400 mb-1">
                    Tribute Offering
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { id: 'candle', label: '🕯️ Eternal Candle' },
                      { id: 'incense', label: '🪔 Sandalwood Incense' },
                      { id: 'lotus', label: '🪷 White Lotus' },
                      { id: 'reiki_qi', label: '✨ Reiki Light' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedOffering(item.id as OfferingType)}
                        className={`p-2 rounded-lg text-left transition-all border ${
                          selectedOffering === item.id
                            ? 'border-purple-500 bg-purple-950/40 text-purple-200'
                            : 'border-neutral-800 bg-neutral-950/40 text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-neutral-400 mb-1">
                    Your Tribute & Words of Condolence *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Share a treasured memory of John, his kindness, martial strength, or healing touch..."
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-lg border border-neutral-700/80 bg-neutral-950/60 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-purple-500 leading-relaxed resize-y"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !authorName.trim() || !message.trim()}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-emerald-600 text-white font-medium text-xs sm:text-sm hover:opacity-95 transition-opacity disabled:opacity-50 shadow-md shadow-purple-950/40"
                >
                  <Send className="h-4 w-4" />
                  <span>{isSubmitting ? 'Saving...' : editingCondolenceId ? 'Save Changes' : 'Post Condolence & Light Tribute'}</span>
                </button>
                {editingCondolenceId && <button
                  type="button"
                  onClick={handleCancelCondolenceEdit}
                  disabled={isSubmitting}
                  className="w-full text-xs text-neutral-400 hover:text-neutral-200"
                >
                  Cancel editing
                </button>}
              </form>
            </div>
          ) : (
            /* Visitor Read-Only Explanatory Card */
            <div
              className={`rounded-2xl border p-6 backdrop-blur-md sticky top-20 transition-all shadow-lg space-y-4 text-center ${
                isDarkMode
                  ? 'bg-neutral-900/90 border-neutral-800 text-neutral-100'
                  : 'bg-white/95 border-stone-200 text-neutral-900 shadow-stone-200/50'
              }`}
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-600/20 border border-purple-500/40 text-purple-300">
                <Feather className="h-5 w-5" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base font-serif font-semibold text-neutral-100">
                  Share Your Condolence
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed max-w-sm mx-auto">
                  All visitors are welcome to read the memorial tributes. If you knew John and wish to add your thoughts or condolences to this memorial, please sign in.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-emerald-600 text-white font-medium text-xs sm:text-sm hover:opacity-95 transition-all shadow-md shadow-purple-950/40"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Sign In to Leave a Condolence</span>
                </button>
              </div>

              <div className="pt-2 border-t border-neutral-800/80 text-[11px] text-neutral-500 space-y-1 text-left">
                <p className="flex items-center gap-1.5 text-neutral-400">
                  <span>🕯️</span> <span>Light an eternal tribute candle</span>
                </p>
                <p className="flex items-center gap-1.5 text-neutral-400">
                  <span>✨</span> <span>Autofill your name and identity</span>
                </p>
                <p className="flex items-center gap-1.5 text-neutral-400">
                  <span>🎬</span> <span>Your words will scroll in the film credits roll</span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Film Credits Roll OR Traditional Feed */}
        <div className="lg:col-span-7 space-y-4">
          {viewMode === 'credits' ? (
            /* =========================================================================
             * CINEMATIC FILM CREDITS SCROLL VIEW
             * ========================================================================= */
            <div className="relative rounded-3xl border border-neutral-800 bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 p-4 sm:p-6 shadow-2xl shadow-purple-950/30 overflow-hidden">
              {/* Subtle film grain & twilight stars glow */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-950/30 via-transparent to-neutral-950/80 pointer-events-none" />

              {/* Film Top Gradient Fade Mask */}
              <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-neutral-950 via-neutral-950/90 to-transparent z-10 pointer-events-none" />

              {/* Film Bottom Gradient Fade Mask */}
              <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-neutral-950 via-neutral-950/90 to-transparent z-10 pointer-events-none" />

              {/* Scrollable Container with RequestAnimationFrame Auto-Crawl */}
              <div
                ref={scrollContainerRef}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="relative h-[620px] overflow-y-auto pr-1 text-center select-text scroll-smooth focus:outline-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              >
                {/* Film Opening Title Card */}
                <div className="pt-16 pb-14 space-y-4 max-w-md mx-auto">
                  <div className="text-[11px] uppercase tracking-[0.3em] text-neutral-400 font-sans font-medium">
                    In Loving Honor & Memory of
                  </div>

                  <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-wide text-neutral-100">
                    John Alan Whittle
                  </h2>

                  <div className="font-calligraphy text-2xl text-emerald-400 tracking-widest py-1">
                    約翰 · 艾倫 · 惠特爾
                  </div>

                  <div className="text-xs text-purple-300 font-medium tracking-wide">
                    Martial Arts Discipline · Reiki Universal Peace · Ancestral Spirit
                  </div>

                  <div className="pt-2 flex items-center justify-center gap-3 text-neutral-600 text-sm">
                    <span>—</span>
                    <span className="text-amber-400">☯️</span>
                    <span>—</span>
                  </div>

                  <p className="text-xs text-neutral-400 leading-relaxed italic max-w-sm mx-auto">
                    A roll of heartfelt condolences, condolences, and memories shared by family, students, and companions around the world.
                  </p>
                </div>

                {/* The Crawl of Condolence Credits */}
                {filteredCondolences.length === 0 ? (
                  <div className="py-20 text-center space-y-3">
                    <Sparkles className="h-8 w-8 text-neutral-600 mx-auto" />
                    <p className="font-serif text-base text-neutral-300">
                      The memorial guestbook is open.
                    </p>
                    <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                      All heartfelt condolences recorded in the database will roll here continuously as an eternal tribute.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-14 py-6 max-w-lg mx-auto">
                    {filteredCondolences.map((c, index) => {
                      const tribute = getTributeSymbol(c.offering);
                      return (
                        <article
                          key={c.id || index}
                          className="space-y-3 px-4 py-2 transition-all hover:scale-[1.01]"
                        >
                          {/* Offering Symbol */}
                          <div className="text-2xl" title={tribute.name}>
                            {tribute.icon}
                          </div>

                          {/* Author & Relationship */}
                          <div className="space-y-0.5">
                            <h3 className="font-serif text-xl sm:text-2xl font-semibold tracking-wide text-neutral-100 text-balance">
                              {c.authorName}
                            </h3>
                            <div className="flex items-center justify-center gap-2 text-xs text-purple-300">
                              <span className="font-medium">{c.relationship}</span>
                              {c.isFamily && (
                                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-900/50 text-purple-200 border border-purple-700/60">
                                  Family
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Words of Condolence */}
                          <blockquote className="font-sans text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-md mx-auto italic px-4">
                            "{c.message}"
                          </blockquote>

                          {/* Date and Candle Action */}
                          <div className="flex items-center justify-center gap-4 text-[11px] text-neutral-500 pt-1">
                            <span>
                              {new Date(c.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                            <span>·</span>
                              {currentUser?.uid === c.authorId && (
                                <button
                                  type="button"
                                  onClick={() => handleEditCondolence(c)}
                                  className="inline-flex items-center gap-1 text-purple-300 hover:text-purple-200"
                                  title="Edit your condolence"
                                >
                                  <Pencil className="h-3 w-3" />
                                  Edit
                                </button>
                              )}
                              <button
                              onClick={() => handleLightCandle(c.id, c.candlesLit || 1)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-900 border border-amber-900/40 text-amber-300 hover:bg-amber-950/40 transition-colors"
                              title={currentUser ? 'Light a candle in memory' : 'Sign in to light a candle'}
                            >
                              <Flame className="h-3 w-3 text-amber-400 fill-amber-400" />
                              <span className="font-mono text-xs">{c.candlesLit || 1}</span>
                              <span className="text-[10px]">Candles Lit</span>
                            </button>
                          </div>

                          {/* Delicate separator between credits */}
                          <div className="pt-6 flex justify-center">
                            <div className="w-12 h-px bg-gradient-to-r from-transparent via-neutral-700 to-transparent" />
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}

                {/* Film Closing Title Card */}
                <div className="pt-16 pb-28 space-y-4 max-w-md mx-auto text-center border-t border-neutral-900">
                  <div className="text-3xl">☯️</div>
                  <blockquote className="font-serif italic text-sm text-neutral-300 leading-relaxed max-w-xs mx-auto">
                    "Energy cannot be created or destroyed, it can only be changed from one form to another."
                  </blockquote>

                  <div className="font-calligraphy text-lg text-amber-400 tracking-wider">
                    道氣長存 · 永垂不朽
                  </div>

                  <p className="text-[11px] text-neutral-500 font-sans">
                    In Everlasting Memory of John Alan Whittle
                  </p>

                  <div className="pt-4">
                    <button
                      onClick={handleRestartCredits}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-950 text-xs text-neutral-400 hover:text-white transition-colors"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Scroll to Beginning</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* =========================================================================
             * TRADITIONAL GUESTBOOK FEED VIEW
             * ========================================================================= */
            <div className="space-y-4">
              {/* Filter Tabs */}
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-neutral-800">
                <span className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
                  Condolences & Memories ({condolences.length})
                </span>

                <div className="flex items-center gap-1 p-0.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs">
                  <button
                    onClick={() => setFilterRole('all')}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      filterRole === 'all'
                        ? 'bg-neutral-800 text-white font-medium'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilterRole('family')}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      filterRole === 'family'
                        ? 'bg-purple-900/60 text-purple-300 font-medium'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    Family
                  </button>
                  <button
                    onClick={() => setFilterRole('friends_students')}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      filterRole === 'friends_students'
                        ? 'bg-emerald-900/60 text-emerald-300 font-medium'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    Martial Arts & Friends
                  </button>
                </div>
              </div>

              {/* Feed Cards */}
              <div className="space-y-4">
                {filteredCondolences.map((c) => {
                  const tribute = getTributeSymbol(c.offering);
                  return (
                    <div
                      key={c.id}
                      className={`rounded-xl border p-5 transition-all ${
                        isDarkMode
                          ? 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700 text-neutral-100'
                          : 'bg-white border-stone-200 text-neutral-900 shadow-sm'
                      }`}
                    >
                      {/* Top Bar of card */}
                      <div className="flex items-start justify-between gap-3 mb-2.5">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-serif text-base font-semibold text-neutral-100">
                              {c.authorName}
                            </span>
                            {c.isFamily && (
                              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-purple-900/40 text-purple-300 border border-purple-800/60">
                                Family
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-neutral-400 flex items-center gap-1.5 mt-0.5">
                            <span>{c.relationship}</span>
                            <span aria-hidden="true" className="text-neutral-600">·</span>
                            <span className="text-[11px] text-neutral-500">
                              {new Date(c.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {currentUser?.uid === c.authorId && (
                            <button
                              type="button"
                              onClick={() => handleEditCondolence(c)}
                              className="inline-flex items-center gap-1 text-xs text-purple-300 hover:text-purple-200"
                              title="Edit your condolence"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Edit
                            </button>
                          )}
                          <span className="text-xl" title={tribute.name}>
                            {tribute.icon}
                          </span>
                        </div>
                      </div>

                      {/* Message Prose */}
                      <p className="text-xs sm:text-sm font-sans text-neutral-200 leading-relaxed pt-1">
                        {c.message}
                      </p>

                      {/* Card Footer: Light a Candle action */}
                      <div className="mt-4 pt-3 border-t border-neutral-800/60 flex items-center justify-between text-xs">
                        <span className="text-neutral-500 text-[11px]">
                          Honoring{' '}
                          <span className="text-neutral-300 font-medium">John Alan Whittle</span>
                        </span>

                        <button
                          onClick={() => handleLightCandle(c.id, c.candlesLit || 1)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-neutral-950/80 border border-amber-900/40 text-amber-300 hover:bg-amber-950/30 hover:border-amber-700/60 transition-all shadow-sm"
                          title={currentUser ? 'Light a candle in memory' : 'Sign in to light a candle'}
                        >
                          <Flame className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                          <span className="font-mono text-xs">{c.candlesLit || 1}</span>
                          <span className="text-[11px]">Candles Lit</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
