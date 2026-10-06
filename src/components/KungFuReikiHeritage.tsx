import React, { useState } from 'react';
import { Sparkles, Shield, Heart, Feather, Sun, Moon, Compass, Flower2, Zap } from 'lucide-react';
import { CalligraphyName } from './CalligraphyName';
import { JohnPortrait } from './JohnPortrait';
import { playSingingBowlChime } from '../utils/audioSynthesis';

interface KungFuReikiHeritageProps {
  isDarkMode: boolean;
}

export const KungFuReikiHeritage: React.FC<KungFuReikiHeritageProps> = ({ isDarkMode }) => {
  const [activeTab, setActiveTab] = useState<'kungfu' | 'reiki' | 'chinese_heritage'>('kungfu');
  const [isChannellingReiki, setIsChannellingReiki] = useState<boolean>(false);
  const [reikiMessage, setReikiMessage] = useState<string | null>(null);

  const triggerReikiPalm = () => {
    setIsChannellingReiki(true);
    playSingingBowlChime(432, 4.0, 0.25);
    setReikiMessage('Universal Life Energy (Reiki) is channelling through your palms. Feel the gentle warmth of John’s love and peace enveloping your spirit.');

    setTimeout(() => {
      setIsChannellingReiki(false);
    }, 4000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Title & Memorial Calligraphy */}
      <div className="text-center space-y-3 mb-8">
        <div className="flex justify-center pb-2">
          <JohnPortrait size="lg" showFrame={true} showSeal={true} />
        </div>

        <CalligraphyName
          size="hero"
          honorific="Martial Spirit, Reiki Healing & Cultural Heritage"
          subtitle="Honoring the philosophies and practices that shaped John's extraordinary life"
        />
      </div>

      {/* Segmented Pillar Navigation */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex p-1 rounded-xl bg-neutral-900 border border-neutral-800 shadow-lg">
          <button
            onClick={() => setActiveTab('kungfu')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'kungfu'
                ? 'bg-neutral-800 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            🥋 Kung Fu & Wushu (武德)
          </button>
          <button
            onClick={() => setActiveTab('reiki')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'reiki'
                ? 'bg-neutral-800 text-purple-400 border border-purple-500/40 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            ✨ Reiki Healing (靈氣)
          </button>
          <button
            onClick={() => setActiveTab('chinese_heritage')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'chinese_heritage'
                ? 'bg-neutral-800 text-amber-400 border border-amber-500/40 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            🏮 Eastern Heritage (中華傳承)
          </button>
        </div>
      </div>

      {/* Tab 1: KUNG FU & MARTIAL ARTS */}
      {activeTab === 'kungfu' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-6 sm:p-8 backdrop-blur-md">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div>
                <span className="text-xs uppercase tracking-widest text-emerald-400 font-medium">
                  The Martial Virtues (武德)
                </span>
                <h3 className="text-xl font-serif font-semibold text-neutral-100 mt-1">
                  Strength Tempered by Gentleness
                </h3>
              </div>
              <span className="font-calligraphy text-2xl text-emerald-400">尚武崇德</span>
            </div>

            <p className="text-sm text-neutral-300 leading-relaxed mt-4">
              Kung Fu (Gongfu 功夫) translates to supreme skill acquired through patient, devoted effort over time.
              For <span className="font-medium text-neutral-100">John Alan Whittle</span>, martial arts was not about conflict, but about the mastery of self,
              the cultivation of internal vitality (Qi 气), and the solemn duty to shield and nurture loved ones.
            </p>

            {/* Five Virtues Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {[
                { title: 'Ren (仁) · Benevolence', desc: 'Courage guided by compassionate kindness and protection of the gentle.' },
                { title: 'Yi (义) · Righteousness', desc: 'Steadfast loyalty, standing up for what is moral and just without wavering.' },
                { title: 'Li (礼) · Etiquette & Respect', desc: 'Humility toward mentors, peers, students, and life itself.' },
                { title: 'Zhi (智) · Wisdom', desc: 'Understanding that true power is knowing when to yield and when to act.' },
                { title: 'Xin (信) · Trust & Integrity', desc: 'A word given is an unbreakable vow; absolute sincerity in spirit.' },
                { title: 'Qi (气) · Vital Life Breath', desc: 'The circulating flow of energy uniting body, mind, and the cosmos.' },
              ].map((v, i) => (
                <div key={i} className="p-4 rounded-xl border border-neutral-800 bg-neutral-950/60">
                  <h4 className="text-xs font-semibold text-emerald-400">{v.title}</h4>
                  <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>

            {/* Yin-Yang Balance Quote */}
            <div className="mt-8 p-5 rounded-xl border border-emerald-900/30 bg-emerald-950/20 text-center space-y-2">
              <span className="text-2xl">☯️</span>
              <p className="text-sm font-serif italic text-emerald-200">
                "Like bamboo in the wind, bending without breaking; like water flowing through stone, gentle yet carving the earth."
              </p>
              <p className="text-xs text-neutral-400 font-sans">
                The eternal martial legacy of John Alan Whittle
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: REIKI ENERGY HEALING */}
      {activeTab === 'reiki' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-6 sm:p-8 backdrop-blur-md">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div>
                <span className="text-xs uppercase tracking-widest text-purple-400 font-medium">
                  Universal Life Energy (靈氣)
                </span>
                <h3 className="text-xl font-serif font-semibold text-neutral-100 mt-1">
                  The Healing Touch of John Alan Whittle
                </h3>
              </div>
              <span className="font-calligraphy text-2xl text-purple-400">大光明</span>
            </div>

            <p className="text-sm text-neutral-300 leading-relaxed mt-4">
              Reiki (Rei = Spiritual Wisdom, Ki = Life Force Energy) is the practice of channeling unconditional universal harmony.
              John utilized this quiet power to soothe pain, bring stillness to anxious minds, and emanate love.
              In the energetic realm, his healing frequency has not ceased; it surrounds you with every breath.
            </p>

            {/* The 5 Gokai Principles */}
            <div className="mt-6 p-5 rounded-xl border border-purple-900/40 bg-purple-950/20">
              <h4 className="text-xs font-semibold text-purple-300 uppercase tracking-wider mb-3">
                The Five Reiki Principles (五戒 · Gokai)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-neutral-300 font-sans">
                <div className="flex items-start gap-2">
                  <span className="text-purple-400 font-mono">1.</span>
                  <span><strong>Just for today, do not anger</strong> (Ikari-na)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-400 font-mono">2.</span>
                  <span><strong>Just for today, do not worry</strong> (Shinpai-suna)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-400 font-mono">3.</span>
                  <span><strong>Be filled with gratitude</strong> (Kansha-shite)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-400 font-mono">4.</span>
                  <span><strong>Devote yourself with diligence</strong> (Gyo o hage-me)</span>
                </div>
                <div className="flex items-start gap-2 sm:col-span-2">
                  <span className="text-purple-400 font-mono">5.</span>
                  <span><strong>Be kind to all living beings</strong> (Hito ni shinsetsu ni)</span>
                </div>
              </div>
            </div>

            {/* Sacred Reiki Symbols */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              {[
                { name: 'Cho Ku Rei', label: 'The Power Symbol', kanji: '超空靈', desc: 'Focusing universal light instantly, amplifying protective shields and vital energy.' },
                { name: 'Sei He Ki', label: 'Mental & Emotional Harmony', kanji: '聖平氣', desc: 'Cleansing sorrow, releasing grief, and restoring peaceful equilibrium to the heart.' },
                { name: 'Dai Ko Myo', label: 'The Master Light Symbol', kanji: '大光明', desc: 'Enlightenment, supreme wisdom, and eternal spiritual oneness across celestial planes.' },
              ].map((s, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-neutral-800 bg-neutral-950/60 text-center">
                  <span className="font-calligraphy text-2xl text-purple-300 block mb-1">{s.kanji}</span>
                  <h4 className="text-xs font-semibold text-neutral-100">{s.name}</h4>
                  <span className="text-[11px] text-purple-400 block mb-1">{s.label}</span>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>

            {/* Interactive Reiki Channeling Palms */}
            <div className="mt-8 text-center p-6 rounded-2xl border border-purple-500/40 bg-gradient-to-b from-purple-950/30 to-emerald-950/20 space-y-4">
              <div className="relative mx-auto flex h-16 w-16 items-center justify-center">
                {isChannellingReiki && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-60"></span>
                )}
                <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-purple-700/80 text-white shadow-lg">
                  <Sparkles className={`h-7 w-7 ${isChannellingReiki ? 'animate-spin' : ''}`} />
                </div>
              </div>

              <div>
                <h4 className="text-base font-serif font-semibold text-neutral-100">
                  Channel a Reiki Touch of Peace
                </h4>
                <p className="text-xs text-neutral-400 max-w-md mx-auto mt-1">
                  Place your hand gently on your chest or screen and press below to receive universal comfort.
                </p>
              </div>

              <button
                type="button"
                onClick={triggerReikiPalm}
                disabled={isChannellingReiki}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-emerald-600 text-white font-medium text-xs sm:text-sm hover:opacity-95 transition-opacity shadow-md shadow-purple-950/40"
              >
                <Zap className="h-4 w-4" />
                {isChannellingReiki ? 'Channeling Healing Energy...' : 'Receive Reiki Attunement'}
              </button>

              {reikiMessage && (
                <p className="text-xs text-emerald-300 italic pt-2 max-w-lg mx-auto leading-relaxed">
                  "{reikiMessage}"
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: CHINESE HERITAGE & TRADITIONS */}
      {activeTab === 'chinese_heritage' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-6 sm:p-8 backdrop-blur-md">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div>
                <span className="text-xs uppercase tracking-widest text-amber-400 font-medium">
                  Eastern Customs of Memorial (慎終追遠)
                </span>
                <h3 className="text-xl font-serif font-semibold text-neutral-100 mt-1">
                  Reverence for Ancestors & Enduring Spirit
                </h3>
              </div>
              <span className="font-calligraphy text-2xl text-amber-400">福壽永昌</span>
            </div>

            <p className="text-sm text-neutral-300 leading-relaxed mt-4">
              In traditional Eastern thought, passing from the mortal plane does not sever the bond; rather,
              it elevates a noble soul to an honored ancestor whose virtues and wisdom continue to guide family,
              students, and friends across time and space.
            </p>

            {/* Sacred Eastern Memorial Elements */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              {[
                {
                  icon: '🏮',
                  title: 'Kongming Deng (孔明灯) · Sky Lanterns',
                  desc: 'Crafted from rice paper and bamboo, sky lanterns are released into the night sky to carry prayers directly to ancestors residing in the celestial heavens.',
                },
                {
                  icon: '🕯️',
                  title: 'Incense Offerings (敬香) · Sandalwood Pillars',
                  desc: 'The rising plume of sacred smoke acts as an unbroken communication wire between earth and heaven, carrying the fragrance of sincere love.',
                },
                {
                  icon: '🍵',
                  title: 'Serving Tea (敬茶) · Timeless Respect',
                  desc: 'Pouring fine tea before the memorial tablet embodies timeless gratitude for the life, loyalty, and teachings John gave.',
                },
                {
                  icon: '🪷',
                  title: 'White Lotus (白莲花) · Pure Transmutation',
                  desc: 'Rising pristine from muddy waters into radiant blossom, symbolizing the soul’s liberation from physical pain into timeless grace.',
                },
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-xl border border-neutral-800 bg-neutral-950/60 flex items-start gap-3">
                  <span className="text-2xl shrink-0">{item.icon}</span>
                  <div>
                    <h4 className="text-xs font-semibold text-amber-300">{item.title}</h4>
                    <p className="text-xs text-neutral-400 mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center pt-4 border-t border-neutral-800">
              <CalligraphyName size="md" subtitle="Honored in our hearts across all realms" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
