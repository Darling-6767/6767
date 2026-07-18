import type { Language } from '../types';

const LANG_CODES: Record<Language, string> = {
  english: 'en-US', german: 'de-DE', russian: 'ru-RU', french: 'fr-FR', japanese: 'ja-JP'
};

let voiceCache: SpeechSynthesisVoice[] = [];

function initVoices() {
  if (!('speechSynthesis' in window)) return;
  try {
    voiceCache = window.speechSynthesis.getVoices();
    if (voiceCache.length > 0) return;
    const dummy = new SpeechSynthesisUtterance('');
    dummy.volume = 0;
    window.speechSynthesis.speak(dummy);
  } catch {}
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.addEventListener('voiceschanged', () => {
    voiceCache = window.speechSynthesis.getVoices();
  });
}
initVoices();

export function speak(text: string, language: Language) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = LANG_CODES[language];
  u.rate = 0.85; u.pitch = 1; u.volume = 1;
  loadVoice(u, language);
  window.speechSynthesis.speak(u);
}

export function speakWord(word: string, language?: Language) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(word);
  if (language) { u.lang = LANG_CODES[language]; loadVoice(u, language); }
  u.rate = 0.75; u.pitch = 1; u.volume = 1;
  window.speechSynthesis.speak(u);
}

function loadVoice(utterance: SpeechSynthesisUtterance, language: Language) {
  if (voiceCache.length === 0 && 'speechSynthesis' in window) {
    voiceCache = window.speechSynthesis.getVoices();
  }
  if (voiceCache.length === 0) return;
  const code = LANG_CODES[language];
  const match = voiceCache.find(v => v.lang === code)
             || voiceCache.find(v => v.lang.startsWith(code))
             || voiceCache.find(v => v.lang.startsWith(code.split('-')[0]))
             || null;
  if (match) utterance.voice = match;
}
