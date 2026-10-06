import { CelestialMessage, Condolence, MemorialShrineState } from '../types/memorial';

const STORAGE_KEYS = {
  MESSAGES: 'jaw_celestial_messages_real',
  CONDOLENCES: 'jaw_condolences_real',
  SHRINE: 'jaw_shrine_state_real',
  THEME: 'jaw_theme_mode_v2',
};

const INITIAL_SHRINE: MemorialShrineState = {
  incenseLitCount: 0,
  candlesLitCount: 0,
  bellRungCount: 0,
  lanternsReleasedCount: 0,
  teaOfferedCount: 0,
};

export function getStoredMessages(): CelestialMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveMessage(msg: CelestialMessage): void {
  try {
    const current = getStoredMessages();
    const updated = [msg, ...current.filter(m => m.id !== msg.id)];
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save message', err);
  }
}

export function deleteStoredMessage(id: string): void {
  try {
    const current = getStoredMessages();
    const updated = current.filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to delete message', err);
  }
}

export function getStoredCondolences(): Condolence[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONDOLENCES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveCondolence(condolence: Condolence): void {
  try {
    const current = getStoredCondolences();
    const updated = [condolence, ...current.filter(c => c.id !== condolence.id)];
    localStorage.setItem(STORAGE_KEYS.CONDOLENCES, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save condolence', err);
  }
}

export function incrementCandle(condolenceId: string): void {
  try {
    const current = getStoredCondolences();
    const updated = current.map(c => {
      if (c.id === condolenceId) {
        return { ...c, candlesLit: (c.candlesLit || 0) + 1 };
      }
      return c;
    });
    localStorage.setItem(STORAGE_KEYS.CONDOLENCES, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to increment candle', err);
  }
}

export function getShrineState(): MemorialShrineState {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SHRINE);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SHRINE, JSON.stringify(INITIAL_SHRINE));
      return INITIAL_SHRINE;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SHRINE;
  }
}

export function updateShrineState(updater: (prev: MemorialShrineState) => MemorialShrineState): MemorialShrineState {
  const current = getShrineState();
  const next = updater(current);
  try {
    localStorage.setItem(STORAGE_KEYS.SHRINE, JSON.stringify(next));
  } catch {}
  return next;
}
