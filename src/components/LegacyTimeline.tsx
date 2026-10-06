import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Shield, Sparkles, Heart, Feather, BookOpen, Trash2, CheckCircle2, Clock } from 'lucide-react';
import { CalligraphyName } from './CalligraphyName';
import { JohnPortrait } from './JohnPortrait';
import { LegacyMilestone, UserProfile } from '../types/memorial';
import { subscribeToMilestones, createLegacyMilestone, deleteLegacyMilestone } from '../services/dbService';

interface LegacyTimelineProps {
  isDarkMode: boolean;
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
}

export const LegacyTimeline: React.FC<LegacyTimelineProps> = ({
  isDarkMode,
  currentUser,
  onOpenAuth,
}) => {
  const [milestones, setMilestones] = useState<LegacyMilestone[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form fields
  const [year, setYear] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<LegacyMilestone['category']>('martial_arts');
  const [hanzi, setHanzi] = useState<string>('武');

  // Real-time Firestore subscription
  useEffect(() => {
    const unsubscribe = subscribeToMilestones((list) => {
      setMilestones(list);
    });
    return () => unsubscribe();
  }, []);

  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!year.trim() || !title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      await createLegacyMilestone({
        year: year.trim(),
        date: date.trim() || undefined,
        title: title.trim(),
        description: description.trim(),
        category,
        hanzi: hanzi.trim() || undefined,
        authorName: currentUser?.displayName || 'Family & Friends',
        authorId: currentUser?.uid || undefined,
        createdAt: new Date().toISOString(),
      });

      // Reset form
      setYear('');
      setDate('');
      setTitle('');
      setDescription('');
      setIsAddingNew(false);
    } catch (err) {
      console.error('Failed to create milestone', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this milestone memory from the timeline?')) {
      await deleteLegacyMilestone(id);
    }
  };

  const filteredMilestones = milestones.filter((m) => {
    if (selectedCategory === 'all') return true;
    return m.category === selectedCategory;
  });

  const getCategoryDetails = (cat: LegacyMilestone['category']) => {
    switch (cat) {
      case 'martial_arts':
        return { label: 'Martial Arts & Kung Fu', icon: '🥋', color: 'text-emerald-400', border: 'border-emerald-500/40', bg: 'bg-emerald-950/20' };
      case 'reiki_healing':
        return { label: 'Reiki Energy Healing', icon: '✨', color: 'text-purple-400', border: 'border-purple-500/40', bg: 'bg-purple-950/20' };
      case 'family':
        return { label: 'Family & Loved Ones', icon: '🏮', color: 'text-amber-400', border: 'border-amber-500/40', bg: 'bg-amber-950/20' };
      case 'wisdom':
        return { label: 'Philosophy & Teachings', icon: '📜', color: 'text-teal-400', border: 'border-teal-500/40', bg: 'bg-teal-950/20' };
      default:
        return { label: 'Life Journey', icon: '🌱', color: 'text-neutral-400', border: 'border-neutral-700', bg: 'bg-neutral-900/40' };
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Title & Memorial Calligraphy */}
      <div className="text-center space-y-3 mb-10">
        <div className="flex justify-center pb-2">
          <JohnPortrait size="lg" showFrame={true} showSeal={true} />
        </div>

        <CalligraphyName
          size="hero"
          honorific="Chronological Legacy Timeline"
          subtitle="Documenting the milestones, martial journey, and healing memories of John Alan Whittle"
        />

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          {currentUser ? (
            <button
              onClick={() => setIsAddingNew(!isAddingNew)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-emerald-600 text-white text-xs sm:text-sm font-medium hover:opacity-95 transition-opacity shadow-md shadow-purple-950/30"
            >
              <Plus className="h-4 w-4" />
              <span>{isAddingNew ? 'Close Form' : 'Add Milestone Memory'}</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-purple-500/40 bg-purple-950/30 text-purple-300 text-xs sm:text-sm font-medium hover:bg-purple-900/40 transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              <span>Sign In to Record a Milestone</span>
            </button>
          )}
        </div>
      </div>

      {/* Add Milestone Modal / Collapsible Form */}
      {isAddingNew && (
        <div
          className={`mb-10 rounded-2xl border p-6 backdrop-blur-md shadow-xl transition-all ${
            isDarkMode
              ? 'bg-neutral-900/95 border-purple-500/40 text-neutral-100 shadow-purple-950/40'
              : 'bg-white border-stone-200 text-neutral-900 shadow-md'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
            <h3 className="text-base font-serif font-semibold text-neutral-100 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-400" />
              Record a Significant Milestone or Memory
            </h3>
            <span className="text-xs text-emerald-400 font-mono">Live Firestore Sync</span>
          </div>

          <form onSubmit={handleCreateMilestone} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-neutral-400 mb-1">
                  Year / Era *
                </label>
                <input
                  type="text"
                  required
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="e.g. 1985, 2004, 2018..."
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-neutral-700 bg-neutral-950 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-neutral-400 mb-1">
                  Season / Date
                </label>
                <input
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="e.g. Autumn Equinox, May 14..."
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-neutral-700 bg-neutral-950 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-neutral-400 mb-1">
                  Calligraphy Character
                </label>
                <select
                  value={hanzi}
                  onChange={(e) => setHanzi(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-neutral-700 bg-neutral-950 text-neutral-100 focus:outline-none focus:ring-1 focus:ring-purple-500 font-calligraphy text-base"
                >
                  <option value="武">武 (Martial Spirit)</option>
                  <option value="氣">氣 (Vital Qi Energy)</option>
                  <option value="道">道 (The Harmonious Way)</option>
                  <option value="德">德 (Virtue & Integrity)</option>
                  <option value="仁">仁 (Benevolence)</option>
                  <option value="愛">愛 (Eternal Love)</option>
                  <option value="光">光 (Master Reiki Light)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-neutral-400 mb-1">
                  Milestone Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Earning the Kung Fu Master Sash, First Reiki Attunement..."
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-neutral-700 bg-neutral-950 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-neutral-400 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as LegacyMilestone['category'])}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-neutral-700 bg-neutral-950 text-neutral-100 focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value="martial_arts">Martial Arts & Kung Fu</option>
                  <option value="reiki_healing">Reiki Energy Healing</option>
                  <option value="family">Family & Loved Ones</option>
                  <option value="wisdom">Philosophy & Teachings</option>
                  <option value="life_journey">Life Journey</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-neutral-400 mb-1">
                Story & Significance *
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what occurred, John's dedication, words of wisdom, or the memory created on this day..."
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-neutral-700 bg-neutral-950 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-purple-500 leading-relaxed resize-y"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="px-4 py-2 rounded-lg text-xs text-neutral-400 hover:text-neutral-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !year.trim() || !title.trim() || !description.trim()}
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors disabled:opacity-40 shadow-sm"
              >
                {isSubmitting ? 'Recording...' : 'Save Milestone'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8 pb-3 border-b border-neutral-800">
        <span className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
          Life Milestones ({filteredMilestones.length})
        </span>

        <div className="flex flex-wrap items-center gap-1 p-0.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs">
          {[
            { id: 'all', label: 'All' },
            { id: 'martial_arts', label: 'Kung Fu' },
            { id: 'reiki_healing', label: 'Reiki' },
            { id: 'family', label: 'Family' },
            { id: 'wisdom', label: 'Wisdom' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3 py-1 rounded transition-colors ${
                selectedCategory === tab.id
                  ? 'bg-purple-900/60 text-purple-300 font-medium'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Stream */}
      {filteredMilestones.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-neutral-800 rounded-2xl p-8 bg-neutral-950/40 space-y-3">
          <Clock className="h-10 w-10 text-neutral-600 mx-auto" />
          <h4 className="text-base font-serif font-medium text-neutral-300">
            No Milestones Recorded in Database Yet
          </h4>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Click "Add Milestone Memory" above to document significant moments, Kung Fu achievements, and memories of John Alan Whittle.
          </p>
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 border-l-2 border-purple-500/30 space-y-8 my-6">
          {filteredMilestones.map((m, index) => {
            const cat = getCategoryDetails(m.category);
            return (
              <div key={m.id} className="relative group">
                {/* Timeline node */}
                <div className="absolute -left-[31px] sm:-left-[39px] top-1 flex h-7 w-7 items-center justify-center rounded-full bg-neutral-950 border-2 border-purple-500 text-purple-400 font-calligraphy text-xs shadow-md shadow-purple-950/60 select-none">
                  {m.hanzi || '道'}
                </div>

                {/* Milestone Card */}
                <div
                  className={`rounded-2xl border p-5 transition-all ${
                    isDarkMode
                      ? 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700 text-neutral-100'
                      : 'bg-white border-stone-200 text-neutral-900 shadow-sm'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm sm:text-base font-bold text-amber-400">
                          {m.year}
                        </span>
                        {m.date && (
                          <span className="text-xs text-neutral-400 font-sans">
                            · {m.date}
                          </span>
                        )}
                      </div>
                      <h4 className="text-base sm:text-lg font-serif font-semibold text-neutral-100 mt-0.5">
                        {m.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${cat.border} ${cat.bg} ${cat.color}`}>
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                      </span>

                      {currentUser && (
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="text-neutral-500 hover:text-red-400 p-1 transition-colors"
                          title="Delete milestone"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans pt-1">
                    {m.description}
                  </p>

                  <div className="mt-4 pt-2 border-t border-neutral-800/60 flex items-center justify-between text-[11px] text-neutral-500">
                    <span>
                      Preserved in honor of <strong className="text-neutral-300">John Alan Whittle</strong>
                    </span>
                    {m.authorName && (
                      <span>Shared by {m.authorName}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
