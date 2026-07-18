import type { Language } from '../types';
const LANG_CODES: Record<Language, string> = { english: 'en-US', german: 'de-DE', russian: 'ru-RU', french: 'fr-FR', japanese: 'ja-JP' };
export function speak(text: string, language: Language) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = LANG_CODES[language]; u.rate = 0.85; u.pitch = 1; u.volume = 1;
  window.speechSynthesis.speak(u);
}
export function speakWord(word: string, language?: Language) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(word);
  if (language) u.lang = LANG_CODES[language];
  u.rate = 0.75; u.pitch = 1; u.volume = 1;
  window.speechSynthesis.speak(u);
}
