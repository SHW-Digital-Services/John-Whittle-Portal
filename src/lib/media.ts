import { collection, doc, onSnapshot, orderBy, query, serverTimestamp, setDoc } from 'firebase/firestore';
import { deleteObject, getBlob, ref, uploadBytesResumable } from 'firebase/storage';
import { canManageMedia } from './mediaAccess';
import { auth, db, mediaStorage } from './firebase';
import { AUDIO_LIMIT, IMAGE_LIMIT, validateMedia } from './mediaValidation';
export { AUDIO_TYPES, IMAGE_TYPES, AUDIO_LIMIT, IMAGE_LIMIT, validateMedia } from './mediaValidation';

export interface MemorialMedia {
  id: string;
  ownerId: string;
  title: string;
  kind: 'picture' | 'audio';
  path: string;
  contentType: string;
  size: number;
}

export async function uploadMedia(file: File, kind: MemorialMedia['kind'], title: string, onProgress: (value: number) => void) {
  const user = auth.currentUser;
  if (!user || !canManageMedia(user)) throw new Error('Only the verified portal owner can upload pictures or audio.');
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
    await setDoc(mediaDoc, { ownerId: user.uid, kind, title: title.trim().slice(0, 150) || file.name.slice(0, 150), path, contentType: file.type, size: file.size, createdAt: serverTimestamp() });
  } catch (error) {
    await deleteObject(objectRef).catch(() => {});
    throw error;
  }
}

export function subscribeMedia(onData: (items: MemorialMedia[]) => void, onError: (error: Error) => void) {
  if (!auth.currentUser) { onData([]); return () => {}; }
  return onSnapshot(query(collection(db, 'media'), orderBy('createdAt', 'desc')), snapshot => {
    onData(snapshot.docs.map(item => ({ ...item.data(), id: item.id } as MemorialMedia)));
  }, onError);
}

export async function loadMediaBlob(item: MemorialMedia) {
  if (!auth.currentUser) throw new Error('Please log in to view media.');
  if (!item.path.startsWith('memorial-media/')) throw new Error('Invalid media path.');
  return getBlob(ref(mediaStorage, item.path), item.kind === 'picture' ? IMAGE_LIMIT : AUDIO_LIMIT);
}

export function mediaError(error: unknown) {
  const code = (error as { code?: string }).code;
  if (code === 'storage/unauthorized' || code === 'permission-denied') return 'Media access was denied. Please sign in again. If this continues, the portal owner needs to check the media access rules.';
  if (code === 'storage/retry-limit-exceeded') return 'The upload timed out. Please check your connection and try again.';
  if (code === 'storage/bucket-not-found') return 'Media storage is not available yet. Please contact the portal owner.';
  return error instanceof Error ? error.message : 'Could not load media. Please try again.';
}
