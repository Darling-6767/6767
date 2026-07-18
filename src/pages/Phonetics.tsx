import { useParams, useNavigate } from 'react-router-dom';
import { LANGUAGE_NAMES, type Language } from '../types';
import { phoneticsData } from '../data/phonetics';
import { speakWord } from '../utils/speech';

export default function Phonetics() {
  const { language } = useParams<{ language: Language }>();
  const navigate = useNavigate();
  const lang = language as Language;
  const data = phoneticsData[lang] || [];

  return (
    <div className="min-h-screen px-4 pt-6 pb-20 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6"><button onClick={() => navigate(-1)} className="text-gray-500 dark:text-gray-400 text-xl">←</button><h1 className="text-xl font-bold text-gray-800 dark:text-white">{LANGUAGE_NAMES[lang]} 音标表</h1></div>
      <div className="card-clean p-4">
        <div className="grid grid-cols-1 gap-2">
          {data.map((entry, i) => (
            <button key={i} onClick={() => speakWord(entry.char, lang === 'japanese' ? 'japanese' : lang)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition active:scale-95 text-left">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-lg flex-shrink-0">{entry.char.slice(0, 2)}</div>
              <div className="flex-1 min-w-0"><div className="flex items-center gap-2"><span className="text-sm font-medium text-gray-700 dark:text-gray-200">{entry.ipa}</span><span className="text-xs text-gray-400 truncate">{entry.example}</span></div><p className="text-xs text-gray-500 dark:text-gray-400">{entry.sound}</p></div>
              <div className="text-lg flex-shrink-0">🔊</div>
            </button>
          ))}
        </div>
        {data.length === 0 && (<p className="text-center text-gray-400 py-8">暂无音标数据</p>)}
      </div>
    </div>
  );
}
