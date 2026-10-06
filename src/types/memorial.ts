export type OfferingType = 'incense' | 'lantern' | 'reiki_qi' | 'tea' | 'lotus' | 'candle';

export interface CelestialMessage {
  id: string;
  senderId?: string;
  senderName: string;
  senderRelationship: string;
  type: 'text' | 'voice';
  content?: string;
  audioBlobUrl?: string;
  audioDurationSeconds?: number;
  offering: OfferingType;
  category: 'daily' | 'wisdom' | 'reiki' | 'gratitude' | 'missing_john' | 'prayer';
  createdAt: string;
  starsCount?: number;
}

export interface Condolence {
  id: string;
  authorId?: string;
  authorName: string;
  relationship: string;
  message: string;
  offering: OfferingType;
  createdAt: string;
  candlesLit?: number;
  isFamily?: boolean;
}

export interface LegacyMilestone {
  id: string;
  year: string;
  date?: string;
  title: string;
  description: string;
  category: 'family' | 'friends' | 'life_journey';
  authorName?: string;
  authorId?: string;
  hanzi?: string;
  createdAt: string;
}

export interface MemorialShrineState {
  incenseLitCount: number;
  candlesLitCount: number;
  bellRungCount: number;
  lanternsReleasedCount: number;
  teaOfferedCount: number;
  meditationsCompletedCount?: number;
}

export type ThemeMode = 'dark' | 'light';

export interface UserProfile {
  uid: string;
  displayName: string;
  email?: string;
  emailVerified?: boolean;
  photoURL?: string;
  relationship?: string;
}
