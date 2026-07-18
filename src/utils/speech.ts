import type { Language } from '../types';

const LANG_CODES: Record<Language, string> = {
  english: 'en-US', german: 'de-DE', russian: 'ru-RU', french: 'fr-FR', japanese: 'ja-JP'
};

// 预先加载并缓存语音列表（手机端加载慢，需要提前准备好）
let voiceCache: SpeechSynthesisVoice[] = [];

function initVoices() {
  voiceCache = window.speechSynthesis.getVoices();
  if (voiceCache.length > 0) return;
  // 强制触发语音加载（某些浏览器需要先 speak 一个空内容来激活）
  const dummy = new SpeechSynthesisUtterance('');
  dummy.volume = 0;
  dummy.rate = 0.1;
  window.speechSynthesis.speak(dummy);
}
window.speechSynthesis?.addEventListener('voiceschanged', () => {
  voiceCache = window.speechSynthesis.getVoices();
});
initVoices();

export function speak(text: string, language: Language) {
  if (!('speechSynthesis' in window)) return;
  // 不检查 speaking 状态，直接 cancel + speak（避免 setTimeout 在手机上被拦截）
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

// 从缓存里匹配最优语音，找不到也不影响——浏览器会用 lang 码自己选
function loadVoice(utterance: SpeechSynthesisUtterance, language: Language) {
  if (voiceCache.length === 0) voiceCache = window.speechSynthesis.getVoices();
  if (voiceCache.length === 0) return; // 实在没加载到，让浏览器自己选
  const code = LANG_CODES[language];
  const match = voiceCache.find(v => v.lang === code)
             || voiceCache.find(v => v.lang.startsWith(code))
             || voiceCache.find(v => v.lang.startsWith(code.split('-')[0]))
             || null;
  if (match) utterance.voice = match;
}
