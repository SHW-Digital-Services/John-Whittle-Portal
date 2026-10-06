export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const AUDIO_TYPES = ['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/x-wav', 'audio/ogg', 'audio/webm', 'audio/flac'];

export type MediaKind = 'picture' | 'video' | 'audio';

export function validateMedia(file: File, kind: MediaKind) {
  const validType = kind === 'picture'
    ? file.type.startsWith('image/') && file.type !== 'image/svg+xml'
    : kind === 'video'
      ? file.type.startsWith('video/')
      : AUDIO_TYPES.includes(file.type);
  if (!validType) throw new Error('Please choose a supported ' + kind + ' file.');
  if (!file.size) throw new Error('The selected file is empty.');
}
