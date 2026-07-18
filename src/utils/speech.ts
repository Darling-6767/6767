import type { Language } from '../types';

const LANG_CODES: Record<Language, string> = {
  english: 'en-US', german: 'de-DE', russian: 'ru-RU', french: 'fr-FR', japanese: 'ja-JP'
};

// 语音缓存，第一次用户点击时才加载
let voices: SpeechSynthesisVoice[] | null = null;
let voicesLoaded = false;

function ensureVoices(): SpeechSynthesisVoice[] {
  if (!voicesLoaded && 'speechSynthesis' in window) {
    voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) voicesLoaded = true;
  }
  return voices || [];
}

// 页面加载后异步拉取语音列表
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.addEventListener('voiceschanged', () => {
    voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) voicesLoaded = true;
  });
  // 部分浏览器需要主动触发
  window.speechSynthesis.getVoices();
}

function pickVoice(lang: Language): SpeechSynthesisVoice | null {
  const list = ensureVoices();
  if (list.length === 0) return null;
  const code = LANG_CODES[lang];
  return list.find(v => v.lang === code)
      || list.find(v => v.lang.startsWith(code))
      || list.find(v => v.lang.startsWith(code.split('-')[0]))
      || null;
}

export function speak(text: string, language: Language) {
  if (!('speechSynthesis' in window)) return;
  // 关键：永远不在 speak 前调 cancel。让浏览器自己管理队列
  const u = new SpeechSynthesisUtterance(text);
  u.lang = LANG_CODES[language];
  u.rate = 0.85;
  u.pitch = 1;
  u.volume = 1;
  const voice = pickVoice(language);
  if (voice) u.voice = voice;
  window.speechSynthesis.speak(u);
}

export function speakWord(word: string, language?: Language) {
  if (!('speechSynthesis' in window)) return;
  const u = new SpeechSynthesisUtterance(word);
  if (language) {
    u.lang = LANG_CODES[language];
    const voice = pickVoice(language);
    if (voice) u.voice = voice;
  }
  u.rate = 0.75;
  u.pitch = 1;
  u.volume = 1;
  window.speechSynthesis.speak(u);
}
