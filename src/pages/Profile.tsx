import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { LANGUAGE_NAMES, type Language } from '../types';
import { getProgress } from '../utils/storage';

const LANGUAGES: Language[] = ['english', 'german', 'russian', 'french', 'japanese'];
const AVATARS = ['😊', '😎', '🤓', '🦊', '🐱', '🐶', '🐼', '🐨', '🦄', '🐙', '👽', '🤖'];

export default function Profile() {
  const navigate = useNavigate(); const { user, updateProfile, logout, refreshUser } = useAuth(); const { dark, toggle } = useTheme();
  const [nickname, setNickname] = useState(user?.nickname || ''); const [editing, setEditing] = useState(false); const [avatarPicker, setAvatarPicker] = useState(false);
  const handleSaveNickname = () => { if (nickname.trim()) { updateProfile({ nickname: nickname.trim() }); setEditing(false); refreshUser(); } };
  const handleAvatar = (av: string) => { updateProfile({ avatar: av }); setAvatarPicker(false); refreshUser(); };
  const handleLogout = () => { if (confirm('确定退出登录？')) logout(); };

  return (<div className="min-h-screen px-4 pt-6 pb-20 max-w-lg mx-auto">
    <div className="flex items-center gap-3 mb-6"><button onClick={() => navigate(-1)} className="text-gray-500 dark:text-gray-400 text-xl">←</button><h1 className="text-xl font-bold text-gray-800 dark:text-white">个人中心</h1></div>
    <div className="card-clean p-6 mb-4 text-center">
      <button onClick={() => setAvatarPicker(!avatarPicker)} className="text-5xl mb-3 hover:scale-110 transition">{user?.avatar || '😊'}</button>
      {avatarPicker && (<div className="flex flex-wrap gap-2 justify-center mb-3">{AVATARS.map(av => (<button key={av} onClick={() => handleAvatar(av)} className={`text-2xl p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition ${user?.avatar === av ? 'ring-2 ring-blue-500' : ''}`}>{av}</button>))}</div>)}
      {editing ? (<div className="flex gap-2 justify-center"><input value={nickname} onChange={e => setNickname(e.target.value)} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-center text-sm" maxLength={12} /><button onClick={handleSaveNickname} className="text-sm text-blue-500 font-medium">保存</button><button onClick={() => setEditing(false)} className="text-sm text-gray-400">取消</button></div>) : (<div><h2 className="text-lg font-semibold text-gray-800 dark:text-white">{user?.nickname}</h2><button onClick={() => setEditing(true)} className="text-sm text-blue-500 mt-1">修改名称</button></div>)}
      <p className="text-sm text-gray-400 mt-1">{user?.email}</p>
    </div>
    <div className="card-clean p-4 mb-4"><h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">学习进度</h3>{LANGUAGES.map(lang => (<div key={lang} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0"><span className="text-sm text-gray-700 dark:text-gray-300">{LANGUAGE_NAMES[lang]}</span><span className="text-sm font-medium text-blue-500">{getProgress(lang)}/20 关</span></div>))}</div>
    <div className="card-clean p-4 mb-4 space-y-3">
      <div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="text-lg">🌙</span><span className="text-sm text-gray-700 dark:text-gray-300">夜间模式</span></div><button onClick={toggle} className={`w-12 h-7 rounded-full transition-colors ${dark ? 'bg-blue-500' : 'bg-gray-300'}`}><div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${dark ? 'translate-x-6' : 'translate-x-1'}`} /></button></div>
      <div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="text-lg">❤️</span><span className="text-sm text-gray-700 dark:text-gray-300">当前血量</span></div><span className="text-sm font-medium text-red-500">{user?.hearts ?? 5}</span></div>
      <div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="text-lg">⭐</span><span className="text-sm text-gray-700 dark:text-gray-300">当前积分</span></div><span className="text-sm font-medium text-yellow-500">{user?.points ?? 0}</span></div>
    </div>
    <button onClick={handleLogout} className="w-full py-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/40 transition">退出登录</button>
    <p className="text-center text-xs text-gray-400 mt-4">语聚 v1.0 · 数据保存于本地浏览器</p>
  </div>);
}
