import {
  runTransaction,
  increment,
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { CelestialMessage, Condolence, LegacyMilestone, MemorialShrineState } from '../types/memorial';
import {
  getStoredMessages,
  saveMessage as saveLocalMessage,
  deleteStoredMessage as deleteLocalMessage,
  getStoredCondolences,
  saveCondolence as saveLocalCondolence,
  incrementCandle as incrementLocalCandle,
  getShrineState as getLocalShrine,
  updateShrineState as updateLocalShrine,
} from '../utils/storage';

const MESSAGES_COL = 'messages';
const CONDOLENCES_COL = 'condolences';
const MILESTONES_COL = 'milestones';
const SHRINE_DOC = 'shrine';

// Save a message to Firestore & localStorage
export async function createCelestialMessage(msg: Omit<CelestialMessage, 'id'>): Promise<string> {
  try {
    const payload = Object.fromEntries(Object.entries(msg).filter(([, value]) => value !== undefined));
    const docRef = await addDoc(collection(db, MESSAGES_COL), payload);
    const fullMsg: CelestialMessage = { ...msg, id: docRef.id };
    saveLocalMessage(fullMsg);
    return docRef.id;
  } catch (err) {
    console.warn('Saving to local storage fallback due to Firestore error', err);
    const localId = `msg-${Date.now()}`;
    saveLocalMessage({ ...msg, id: localId });
    return localId;
  }
}

// Delete a message
export async function deleteCelestialMessage(id: string): Promise<void> {
  try {
    deleteLocalMessage(id);
    await deleteDoc(doc(db, MESSAGES_COL, id));
  } catch (err) {
    console.warn('Local delete completed; Firestore delete warning:', err);
  }
}

// Listen to messages in real-time
export function subscribeToMessages(onUpdate: (messages: CelestialMessage[]) => void): () => void {
  try {
    const q = query(collection(db, MESSAGES_COL), orderBy('createdAt', 'desc'), limit(100));
    return onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteMsgs: CelestialMessage[] = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<CelestialMessage, 'id'>),
          }));
          onUpdate(remoteMsgs);
        } else {
          onUpdate(getStoredMessages());
        }
      },
      (error) => {
        console.warn('Real-time message subscription error, using local storage', error);
        onUpdate(getStoredMessages());
      }
    );
  } catch {
    onUpdate(getStoredMessages());
    return () => {};
  }
}

// Save a condolence
export async function createCondolence(condolence: Omit<Condolence, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, CONDOLENCES_COL), condolence);
    const fullCondolence: Condolence = { ...condolence, id: docRef.id };
    saveLocalCondolence(fullCondolence);
    return docRef.id;
  } catch (err) {
    console.warn('Fallback to local condolence storage', err);
    const localId = `condolence-${Date.now()}`;
    saveLocalCondolence({ ...condolence, id: localId });
    return localId;
  }
}

// Increment candle count
export async function lightCandleForCondolence(condolenceId: string, currentCount: number): Promise<void> {
  try {
    incrementLocalCandle(condolenceId);
    const docRef = doc(db, CONDOLENCES_COL, condolenceId);
    await updateDoc(docRef, { candlesLit: increment(1) });
  } catch (err) {
    console.warn('Updated candle locally; remote sync deferred', err);
  }
}

// Listen to condolences in real-time
export function subscribeToCondolences(onUpdate: (condolences: Condolence[]) => void): () => void {
  try {
    const q = query(collection(db, CONDOLENCES_COL), orderBy('createdAt', 'desc'), limit(150));
    return onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteCondolences: Condolence[] = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<Condolence, 'id'>),
          }));
          onUpdate(remoteCondolences);
        } else {
          onUpdate(getStoredCondolences());
        }
      },
      (error) => {
        console.warn('Real-time condolence subscription error, using local storage', error);
        onUpdate(getStoredCondolences());
      }
    );
  } catch {
    onUpdate(getStoredCondolences());
    return () => {};
  }
}

// Legacy Milestones CRUD
export async function createLegacyMilestone(milestone: Omit<LegacyMilestone, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, MILESTONES_COL), milestone);
    return docRef.id;
  } catch (err) {
    console.warn('Failed to add milestone to Firestore', err);
    throw err;
  }
}

export async function deleteLegacyMilestone(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, MILESTONES_COL, id));
  } catch (err) {
    console.warn('Failed to delete milestone from Firestore', err);
    throw err;
  }
}

export function subscribeToMilestones(onUpdate: (milestones: LegacyMilestone[]) => void): () => void {
  try {
    const q = query(collection(db, MILESTONES_COL), orderBy('year', 'asc'), limit(100));
    return onSnapshot(
      q,
      (snapshot) => {
        const milestones: LegacyMilestone[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<LegacyMilestone, 'id'>),
        }));
        // Sort chronologically by year numeric or string comparison
        milestones.sort((a, b) => {
          const numA = parseInt(a.year, 10);
          const numB = parseInt(b.year, 10);
          if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB;
          }
          return a.year.localeCompare(b.year);
        });
        onUpdate(milestones);
      },
      (error) => {
        console.warn('Milestone subscription warning', error);
        onUpdate([]);
      }
    );
  } catch {
    onUpdate([]);
    return () => {};
  }
}

// Subscribe to global shrine counters
export function subscribeToShrineState(onUpdate: (shrine: MemorialShrineState) => void): () => void {
  try {
    const docRef = doc(db, SHRINE_DOC, 'global');
    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          onUpdate(snapshot.data() as MemorialShrineState);
        } else {
          onUpdate(getLocalShrine());
        }
      },
      () => {
        onUpdate(getLocalShrine());
      }
    );
  } catch {
    onUpdate(getLocalShrine());
    return () => {};
  }
}

// Use the current shared totals, so concurrent offerings cannot overwrite each other.
export async function updateRemoteShrine(updater: (prev: MemorialShrineState) => MemorialShrineState): Promise<MemorialShrineState> {
  if (!auth.currentUser) throw new Error('Please sign in to make an altar offering.');
  try {
    const next = await runTransaction(db, async transaction => {
      const docRef = doc(db, SHRINE_DOC, 'global');
      const snapshot = await transaction.get(docRef);
      const base: MemorialShrineState = {
        incenseLitCount: 0, candlesLitCount: 0, bellRungCount: 0,
        lanternsReleasedCount: 0, teaOfferedCount: 0, meditationsCompletedCount: 0,
        ...(snapshot.exists() ? snapshot.data() : {}),
      };
      const updated = updater({ ...base });
      const fields = Object.keys(base) as (keyof MemorialShrineState)[];
      const changed = fields.filter(field => updated[field] !== base[field]);
      if (!changed.length) return base;
      if (changed.length !== 1 || updated[changed[0]] !== (base[changed[0]] || 0) + 1) {
        throw new Error('An offering can only increase one altar counter by one.');
      }
      if (snapshot.exists()) transaction.update(docRef, { [changed[0]]: updated[changed[0]] });
      else transaction.set(docRef, updated);
      return updated;
    });
    updateLocalShrine(() => next);
    return next;
  } catch (err) {
    console.warn('Shrine updated locally; Firestore sync deferred', err);
    return updateLocalShrine(updater);
  }
}
