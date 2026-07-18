import type { Language } from '../types';

const LANG_CODES: Record<Language, string> = {
  english: 'en-US', german: 'de-DE', russian: 'ru-RU', french: 'fr-FR', japanese: 'ja-JP'
};

export function speak(text: string, language: Language) {
  if (!('speechSynthesis' in window)) return;
  // 只在正在播放时才取消，避免 Chrome 的 cancel+speak bug
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    // Chrome 需要在 cancel 后等一帧才能 speak
    setTimeout(() => doSpeak(text, language), 50);
  } else {
    doSpeak(text, language);
  }
}

export function speakWord(word: string, language?: Language) {
  if (!('speechSynthesis' in window)) return;
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    setTimeout(() => doSpeakWord(word, language), 50);
  } else {
    doSpeakWord(word, language);
  }
}

function doSpeak(text: string, language: Language) {
  const u = new SpeechSynthesisUtterance(text);
  u.lang = LANG_CODES[language];
  u.rate = 0.85;
  u.pitch = 1;
  u.volume = 1;
  loadVoice(u, language);
  window.speechSynthesis.speak(u);
}

function doSpeakWord(word: string, language?: Language) {
  const u = new SpeechSynthesisUtterance(word);
  if (language) {
    u.lang = LANG_CODES[language];
    loadVoice(u, language);
  }
  u.rate = 0.75;
  u.pitch = 1;
  u.volume = 1;
  window.speechSynthesis.speak(u);
}

// 尝试匹配对应语言的系统语音，找不到就用默认
function loadVoice(utterance: SpeechSynthesisUtterance, language: Language) {
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return;
  const code = LANG_CODES[language];
  const match = voices.find(v => v.lang.startsWith(code)) 
             || voices.find(v => v.lang.startsWith(code.split('-')[0]))
             || null;
  if (match) utterance.voice = match;
}
