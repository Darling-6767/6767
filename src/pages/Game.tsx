import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Language, Question } from '../types';
import { LANGUAGE_NAMES, MAX_HEARTS } from '../types';
import { getQuestions } from '../data/questions';
import { getProgress, updateProgress, addPoints, spendHeart, spendPoints, addHearts, getNextHeartMs } from '../utils/storage';
import { speak } from '../utils/speech';
import { useAuth } from '../contexts/AuthContext';

const LEVELS_TOTAL = 20;
const QUESTIONS_PER_LEVEL = 8;
const POINTS_NORMAL = 10;
const POINTS_HARD = 50;
const HINT_COST = 20;
const HEART_COST = 10;
const TIME_NORMAL = 120;
const TIME_HARD = 300;

export default function Game() {
  const { language } = useParams<{ language: Language }>();
  const navigate = useNavigate();
  const { refreshUser, user } = useAuth();
  const lang = language as Language;

  const [phase, setPhase] = useState<'menu' | 'playing' | 'result'>('menu');
  const [level, setLevel] = useState(() => getProgress(lang) + 1);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [timer, setTimer] = useState(0);
  const [hearts, setHearts] = useState(user?.hearts ?? 5);
  const [points, setPoints] = useState(user?.points ?? 0);
  const [heartCountdownMs, setHeartCountdownMs] = useState(() => getNextHeartMs());
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [passed, setPassed] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const isHard = level % 5 === 0;
  const timeLimit = isHard ? TIME_HARD : TIME_NORMAL;
  const reward = isHard ? POINTS_HARD : POINTS_NORMAL;

  const clearTimer = () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };

  const startLevel = useCallback(() => {
    const qs = getQuestions(lang, QUESTIONS_PER_LEVEL); setQuestions(qs); setCurrentQ(0);
    setSelectedAnswer(''); setFeedback(null); setShowHint(false); setTimer(timeLimit);
    setEarnedPoints(0); setGameOver(false); setPassed(false); setPhase('playing');
    clearTimer();
    timerRef.current = setInterval(() => { setTimer(t => { if (t <= 1) { clearTimer(); return 0; } return t - 1; }); }, 1000);
  }, [lang, timeLimit]);

  useEffect(() => { if (timer === 0 && phase === 'playing' && feedback === null) handleTimeout(); }, [timer]);
  useEffect(() => { return () => clearTimer(); }, []);
  useEffect(() => { const r = getNextHeartMs(); setHeartCountdownMs(r); if (r <= 0) return; const t = setInterval(() => { const r2 = getNextHeartMs(); if (r2 <= 0) setHeartCountdownMs(0); else setHeartCountdownMs(r2); }, 1000); return () => clearInterval(t); }, [phase, hearts]);

  const handleTimeout = () => {
    const ok = spendHeart(); setHearts(prev => (ok ? prev - 1 : prev)); setFeedback('wrong');
    setTimeout(() => { if (!ok) { setGameOver(true); setPhase('result'); refreshUser(); } else nextQuestion(); }, 1500);
  };

  const nextQuestion = () => {
    setFeedback(null); setSelectedAnswer(''); setShowHint(false);
    if (currentQ < questions.length - 1) { setCurrentQ(c => c + 1); setTimer(timeLimit); }
    else { clearTimer(); setPassed(true); setPhase('result'); const earned = reward; setEarnedPoints(earned);
      addPoints(earned); updateProgress(lang, level); setPoints(p => p + earned); refreshUser(); }
  };

  const handleAnswer = (ans: string) => {
    if (feedback) return; setSelectedAnswer(ans);
    if (ans === questions[currentQ].answer) {
      setFeedback('correct'); clearTimer(); setTimeout(nextQuestion, 1000);
    } else {
      const ok = spendHeart(); setHearts(prev => (ok ? prev - 1 : prev)); setFeedback('wrong');
      setTimeout(() => { if (!ok) { setGameOver(true); setPhase('result'); refreshUser(); } else nextQuestion(); }, 1500);
    }
  };

  const handleUseHint = () => { if (showHint) return; if (spendPoints(HINT_COST)) { setPoints(p => p - HINT_COST); setShowHint(true); refreshUser(); } };
  const handleBuyHeart = () => { if (spendPoints(HEART_COST)) { addHearts(1); setPoints(p => p - HEART_COST); setHearts(h => h + 1); refreshUser(); } };
  const handleSpeak = (word: string) => { speak(word, lang); };
  const formatCountdown = (ms: number): string | null => {
    if (ms <= 0) return null;
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
  };
  const heartCDValue = formatCountdown(heartCountdownMs);

  const formatTime = (s: number) => { const m = Math.floor(s / 60); const sec = s % 60; return `${m}:${sec.toString().padStart(2, '0')}`; };

  if (phase === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cartoon-yellow/20 via-white to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 flex flex-col items-center px-4 pt-10">
        <button onClick={() => navigate('/')} className="self-start text-gray-500 hover:text-gray-700 dark:text-gray-400 text-sm mb-6">← 返回</button>
        <div className="text-4xl mb-2">{isHard ? '💀' : level === 1 ? '🌱' : '🌟'}</div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">{LANGUAGE_NAMES[lang]} - 第 {level} 关</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{isHard ? '困难关卡！需答对全部题目' : '普通关卡'}</p>
        <div className="card-cartoon w-full max-w-sm p-6 text-center space-y-4">
          <div className="flex justify-around text-sm"><div className="flex flex-col items-center"><div className="flex items-center gap-1"><span className="text-red-500">❤️</span>{hearts}</div>{heartCDValue && hearts < MAX_HEARTS && <div className="text-xs text-gray-400">{heartCDValue}</div>}</div><div className="flex items-center gap-1"><span className="text-yellow-500">⭐</span>{points}</div><div>⏱️ {isHard ? '5分钟' : '2分钟'}</div></div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{QUESTIONS_PER_LEVEL} 道题 · 奖励 {reward} 积分</div>
          {hearts <= 0 && (<button onClick={handleBuyHeart} disabled={points < HEART_COST} className="btn-cartoon bg-cartoon-pink disabled:opacity-50 w-full text-sm">💰 {HEART_COST}积分 兑换 1滴血</button>)}
          <button onClick={startLevel} disabled={hearts <= 0} className="btn-cartoon bg-cartoon-blue disabled:opacity-50 w-full">{hearts <= 0 ? '血量不足，请兑换' : '开始挑战！'}</button>
        </div>
      </div>
    );
  }

  if (phase === 'result') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cartoon-yellow/20 via-white to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 flex flex-col items-center justify-center px-4">
        <div className="text-6xl mb-4">{gameOver ? '💔' : passed ? '🎉' : '😢'}</div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{gameOver ? '血量耗尽' : passed ? '闯关成功！' : '挑战失败'}</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-2">{passed ? `获得了 ${earnedPoints} 积分！` : ''}</p>
        <div className="flex items-center gap-3 text-lg mb-6"><span>❤️ {hearts}</span><span>⭐ {points}</span></div>
        <div className="flex gap-3">
          <button onClick={() => { setPhase('menu'); setLevel(getProgress(lang) + 1); refreshUser(); }} className="btn-cartoon bg-cartoon-blue">再试一次</button>
          <button onClick={() => navigate('/')} className="btn-cartoon bg-gray-400">返回首页</button>
        </div>
        {passed && level < LEVELS_TOTAL && (<button onClick={() => { setLevel(level + 1); startLevel(); }} className="btn-cartoon bg-cartoon-green mt-3">进入第 {level + 1} 关 →</button>)}
      </div>
    );
  }

  const q = questions[currentQ];
  if (!q) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-cartoon-yellow/20 via-white to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 flex flex-col px-4 pt-6">
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => { clearTimer(); navigate('/'); }} className="text-gray-500 dark:text-gray-400">✕ 退出</button>
          <div className="flex items-center gap-4 text-sm">
            <span className={`${timer <= 10 ? 'text-red-500 animate-heartbeat' : 'text-gray-600 dark:text-gray-300'}`}>⏱️ {formatTime(timer)}</span>
            <span className="text-red-500">❤️ {hearts}{heartCDValue && hearts < MAX_HEARTS ? <span className="text-xs text-gray-400 ml-1">{heartCDValue}</span> : null}</span>
            <span className="text-yellow-500">⭐ {points}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 mb-3">
          {Array.from({ length: QUESTIONS_PER_LEVEL }, (_, i) => (
            <div key={i} className={`flex-1 h-1.5 rounded-full ${i < currentQ ? 'bg-green-400' : i === currentQ ? 'bg-cartoon-blue' : 'bg-gray-200 dark:bg-gray-700'}`} />
          ))}
        </div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400">{isHard ? 'Hard' : `Lv.${level}`}</span>
          <span className="text-xs text-gray-400">{currentQ + 1}/{QUESTIONS_PER_LEVEL}</span>
        </div>
        <div className={`card-cartoon p-6 mb-4 ${feedback === 'correct' ? 'ring-4 ring-green-300' : feedback === 'wrong' ? 'ring-4 ring-red-300 animate-shake' : ''}`}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">选择正确的翻译</p>
            <button onClick={() => handleSpeak(q.word)} className="text-2xl active:scale-90 transition" title="点击播报发音">🔊</button>
          </div>
          <p className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{q.question}</p>
          <div className="space-y-2">
            {q.options.map(opt => (
              <button key={opt} onClick={() => handleAnswer(opt)} disabled={!!feedback}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all text-sm ${feedback && opt === q.answer ? 'border-green-400 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : feedback && opt === selectedAnswer && opt !== q.answer ? 'border-red-400 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300' : selectedAnswer === opt ? 'border-cartoon-blue bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-cartoon-blue'}`}>
                {opt}
              </button>
            ))}
          </div>
          {showHint && (<div className="mt-3 p-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 text-sm animate-float">💡 提示：{q.hint}</div>)}
        </div>
        <div className="flex gap-2 mt-auto mb-4">
          <button onClick={handleUseHint} disabled={showHint || points < HINT_COST} className="flex-1 py-2 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-sm disabled:opacity-40 active:scale-95 transition">💡 提示({HINT_COST}分)</button>
          <button onClick={handleBuyHeart} disabled={points < HEART_COST} className="flex-1 py-2 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm disabled:opacity-40 active:scale-95 transition">❤️ 买血({HEART_COST}分)</button>
        </div>
      </div>
    </div>
  );
}
