import { stopSynthesizedAudio } from './audioSynthesis';

export function pauseAllAudio(except?: HTMLAudioElement): void {
  document.querySelectorAll('audio').forEach((audio) => {
    if (audio !== except) audio.pause();
  });
  stopSynthesizedAudio();
}

export function installSingleAudioPlayback(): () => void {
  const handlePlay = (event: Event) => {
    if (event.target instanceof HTMLAudioElement) pauseAllAudio(event.target);
  };

  document.addEventListener('play', handlePlay, true);
  return () => document.removeEventListener('play', handlePlay, true);
}
