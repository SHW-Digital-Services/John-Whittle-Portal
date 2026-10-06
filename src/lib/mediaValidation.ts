export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const AUDIO_TYPES = ['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/x-wav', 'audio/ogg', 'audio/webm', 'audio/flac'];
export const IMAGE_LIMIT = 10 * 1024 * 1024;
export const AUDIO_LIMIT = 50 * 1024 * 1024;

export function validateMedia(file: File, kind: 'picture' | 'audio') {
  const types = kind === 'picture' ? IMAGE_TYPES : AUDIO_TYPES;
  const limit = kind === 'picture' ? IMAGE_LIMIT : AUDIO_LIMIT;
  if (!types.includes(file.type)) throw new Error('Please choose a supported ' + kind + ' file.');
  if (!file.size || file.size > limit) throw new Error(kind === 'picture' ? 'Pictures must be between 1 byte and 10 MB.' : 'Audio tracks must be between 1 byte and 50 MB.');
}

