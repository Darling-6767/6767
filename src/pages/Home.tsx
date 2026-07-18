import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getNextHeartMs } from '../utils/storage';
import { MAX_HEARTS } from '../types';
import { LANGUAGE_NAMES, LANGUAGE_FLAGS, type Language } from '../types';
import { getProgress } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';
const LANGUAGES: Language[] = ['english', 'german', 'russian', 'french', 'japanese'];
const LANG_COLORS: Record<Language, string> = { english: 'from-blue-500 to-blue-400', german: 'from-orange-500 to-orange-400', russian: 'from-red-500 to-red-400', french: 'from-indigo-500 to-indigo-400', japanese: 'from-pink-500 to-pink-400' };
const LANG_TOTAL = 20;

function HeartCountdown() {
  const [ms, setMs] = useState(() => getNextHeartMs());
  useEffect(() => {
    if (ms <= 0) return;
    const timer = setInterval(() => { const r = getNextHeartMs(); if (r <= 0) setMs(0); else setMs(r); }, 1000);
    return () => clearInterval(timer);
  }, []);
  // Re-check when user data refreshes
  useEffect(() => {
    const r = getNextHeartMs(); setMs(r);
  }, []);
  if (ms <= 0) return null;
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return <div className="text-xs text-gray-400 mt-0.5">❤️ +1 {String(min).padStart(2,'0')}:{String(sec).padStart(2,'0')}</div>;
}
export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  return (
    <div className="px-4 pt-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
  <div>
    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">👋 你好，{user?.nickname || '同学'}</h1>
    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">选择一门语言开始学习吧</p>
  </div>
  <div className="text-right text-sm">
    <div className="flex items-center gap-2 justify-end"><span className="text-red-500">❤️ {user?.hearts ?? 5}</span><span className="text-yellow-500">⭐ {user?.points ?? 0}</span></div>
    <HeartCountdown />
  </div>
</div>
      <div className="space-y-3">
        {LANGUAGES.map(lang => { const progress = getProgress(lang); const pct = Math.min((progress / LANG_TOTAL) * 100, 100); return (<div key={lang} onClick={() => navigate(`/game/${lang}`)} className="card-clean p-4 cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"><div className="flex items-center gap-4"><div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${LANG_COLORS[lang]} flex items-center justify-center text-white text-xl`}>{LANGUAGE_FLAGS[lang]}</div><div className="flex-1 min-w-0"><div className="flex items-center justify-between"><h3 className="font-semibold text-gray-800 dark:text-white">{LANGUAGE_NAMES[lang]}</h3><span className="text-xs text-gray-500 dark:text-gray-400">{progress}/{LANG_TOTAL} 关</span></div><div className="mt-2 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"><div className={`h-full bg-gradient-to-r ${LANG_COLORS[lang]} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} /></div></div></div></div>); })}
      </div>
      <div className="mt-8 grid grid-cols-2 gap-3">
        <button onClick={() => navigate('/profile')} className="card-clean p-4 text-center hover:shadow-md transition-all active:scale-95"><div className="text-2xl mb-1">👤</div><div className="text-sm text-gray-600 dark:text-gray-300">个人中心</div></button>
        {LANGUAGES.map(lang => (<button key={`phon-${lang}`} onClick={() => navigate(`/phonetics/${lang}`)} className="card-clean p-4 text-center hover:shadow-md transition-all active:scale-95"><div className="text-2xl mb-1">🔤</div><div className="text-sm text-gray-600 dark:text-gray-300">{LANGUAGE_NAMES[lang]}音标</div></button>))}
      </div>
    </div>
  );
}
