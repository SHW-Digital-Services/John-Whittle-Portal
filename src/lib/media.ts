import { collection, deleteDoc, doc, onSnapshot, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { deleteObject, getBlob, ref, uploadBytesResumable } from 'firebase/storage';
import { canManageMedia } from './mediaAccess';
import { auth, db, mediaStorage } from './firebase';
import { validateMedia } from './mediaValidation';
import type { MediaKind } from './mediaValidation';
export { AUDIO_TYPES, IMAGE_TYPES, validateMedia } from './mediaValidation';
export type { MediaKind } from './mediaValidation';

export interface MemorialMedia {
  id: string;
  ownerId: string;
  title: string;
  kind: MediaKind;
  path: string;
  contentType: string;
  size: number;
  createdAt?: { seconds: number; nanoseconds: number };
  status?: 'pending' | 'approved';
  audioPurpose?: 'background' | 'altar';
  visibility?: 'public' | 'private';
}

export async function uploadMedia(
  file: File,
  kind: MediaKind,
  title: string,
  onProgress: (value: number) => void,
  audioPurpose: 'background' | 'altar' = 'background',
) {
  const user = auth.currentUser;
  if (!user) throw new Error('Please sign in before uploading media.');
  if (kind === 'audio' && !canManageMedia(user)) throw new Error('Only the verified portal owner can upload audio.');
  validateMedia(file, kind);
  const mediaDoc = doc(collection(db, 'media'));
  const path = `memorial-media/${user.uid}/${kind}/${mediaDoc.id}`;
  const objectRef = ref(mediaStorage, path);
  const task = uploadBytesResumable(objectRef, file, { contentType: file.type });
  await new Promise<void>((resolve, reject) => {
    task.on('state_changed', snapshot => onProgress(Math.round(snapshot.bytesTransferred / snapshot.totalBytes * 100)), reject, resolve);
  });
  try {
    if (auth.currentUser?.uid !== user.uid) throw new Error('Your session changed. Please log in and try again.');
    await setDoc(mediaDoc, {
      ownerId: user.uid,
      kind,
      title: title.trim().slice(0, 150) || file.name.slice(0, 150),
      path,
      contentType: file.type,
      size: file.size,
      status: kind === 'audio' ? 'approved' : 'pending',
      ...(kind === 'audio' ? {
        audioPurpose,
        visibility: audioPurpose === 'background' ? 'public' : 'private',
      } : {}),
      createdAt: serverTimestamp(),
      ...(kind === 'audio' ? { approvedAt: serverTimestamp() } : {}),
    });
  } catch (error) {
    try {
      await deleteObject(objectRef);
    } catch (cleanupError) {
      const cause = error instanceof Error ? error.message : String(error);
      const cleanup = cleanupError instanceof Error ? cleanupError.message : String(cleanupError);
      throw new Error(`Could not save the media record: ${cause}. The uploaded file could not be removed: ${cleanup}. Deploy the current Firestore and Storage rules, then retry.`);
    }
    if ((error as { code?: string }).code === 'permission-denied') {
      throw new Error('Firestore denied saving the media record. Deploy the current Firestore rules with "firebase deploy --only firestore:rules,storage --project john-whittle", then retry.');
    }
    throw error;
  }
}

export function subscribeMedia(
  onData: (items: MemorialMedia[]) => void,
  onError: (error: Error) => void,
  onPending: (items: MemorialMedia[]) => void,
) {
  const user = auth.currentUser;
  const manager = canManageMedia(user);
  const mediaQuery = !user
    ? query(collection(db, 'media'), where('visibility', '==', 'public'))
    : manager
      ? query(collection(db, 'media'))
      : query(collection(db, 'media'), where('status', '==', 'approved'));
  const migrating = new Set<string>();
  return onSnapshot(mediaQuery, snapshot => {
    const items = snapshot.docs.map(item => ({ ...item.data(), id: item.id } as MemorialMedia))
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
        || (b.createdAt?.nanoseconds || 0) - (a.createdAt?.nanoseconds || 0));
    const approved = items.filter(item => item.status === 'approved' || item.status === undefined);
    onData(approved);
    onPending(manager ? items.filter(item => item.status === 'pending') : []);
    if (manager) {
      items.filter(item => item.status === undefined
        || (item.kind === 'audio' && item.status === 'approved' && item.visibility === undefined)).forEach(item => {
        if (migrating.has(item.id)) return;
        migrating.add(item.id);
        void updateDoc(doc(db, 'media', item.id), {
          status: 'approved',
          approvedAt: serverTimestamp(),
          visibility: item.kind === 'audio' && item.audioPurpose !== 'altar' ? 'public' : 'private',
        })
          .catch(onError)
          .finally(() => migrating.delete(item.id));
      });
    }
  }, onError);
}

export async function loadMediaBlob(item: MemorialMedia) {
  if (!auth.currentUser && (
    item.kind !== 'audio'
    || item.audioPurpose !== 'background'
    || item.status !== 'approved'
    || item.visibility !== 'public'
  )) throw new Error('Please log in to view this media.');
  if (!item.path.startsWith('memorial-media/')) throw new Error('Invalid media path.');
  return getBlob(ref(mediaStorage, item.path));
}

export async function approveMedia(item: MemorialMedia) {
  const user = auth.currentUser;
  if (!user || !canManageMedia(user)) throw new Error('Only the verified portal owner can approve submissions.');
  if (item.status !== 'pending') throw new Error('This submission is no longer pending approval.');
  await updateDoc(doc(db, 'media', item.id), { status: 'approved', approvedAt: serverTimestamp() });
}

export async function rejectMedia(item: MemorialMedia) {
  const user = auth.currentUser;
  if (!user || !canManageMedia(user)) throw new Error('Only the verified portal owner can reject submissions.');
  if (item.status !== 'pending') throw new Error('This submission is no longer pending approval.');
  try {
    await deleteObject(ref(mediaStorage, item.path));
  } catch (error) {
    if ((error as { code?: string }).code !== 'storage/object-not-found') throw error;
  }
  await deleteDoc(doc(db, 'media', item.id));
}

export function mediaError(error: unknown) {
  const code = (error as { code?: string }).code;
  if (code === 'storage/unauthorized' || code === 'permission-denied') return 'Media access was denied. Please sign in again. If this continues, the portal owner needs to check the media access rules.';
  if (code === 'storage/retry-limit-exceeded') return 'The upload timed out. Please check your connection and try again.';
  if (code === 'storage/bucket-not-found') return 'Media storage is not available yet. Please contact the portal owner.';
  return error instanceof Error ? error.message : 'Could not load media. Please try again.';
}
