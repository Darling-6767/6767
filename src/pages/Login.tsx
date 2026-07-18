import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (!email.includes('@') || !email.includes('.')) { setError('请输入正确的邮箱地址'); return; }
    if (password.length < 6) { setError('密码至少需要6个字符'); return; }
    if (isRegister && password !== confirmPw) { setError('两次输入的密码不一致'); return; }
    setLoading(true);
    setTimeout(() => {
      let result: string | null;
      if (isRegister) result = register(email.trim().toLowerCase(), password);
      else result = login(email.trim().toLowerCase(), password);
      if (result) setError(result); setLoading(false);
    }, 500);
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8"><div className="text-5xl mb-3">🗣️</div><h1 className="text-3xl font-bold text-gray-800 dark:text-white">语聚</h1><p className="text-gray-500 dark:text-gray-400 mt-1">多语种学习闯关之旅</p></div>
        <form onSubmit={handleSubmit} className="card-clean p-6 space-y-4">
          <h2 className="text-xl font-semibold text-center text-gray-700 dark:text-gray-200">{isRegister ? '注册新账号' : '登录账号'}</h2>
          {error && (<div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-xl px-4 py-3 animate-shake">{error}</div>)}
          <div><label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">邮箱地址</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="example@email.com" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition" required /></div>
          <div><label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">密码</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="至少6个字符" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition" required /></div>
          {isRegister && (<div><label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">确认密码</label><input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="再次输入密码" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition" required /></div>)}
          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold transition disabled:opacity-50">{loading ? '处理中...' : isRegister ? '注册' : '登录'}</button>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">{isRegister ? '已有账号？' : '没有账号？'}<button type="button" onClick={() => { setIsRegister(!isRegister); setError(''); }} className="ml-1 text-blue-500 hover:underline font-medium">{isRegister ? '去登录' : '去注册'}</button></p>
        </form>
      </div>
    </div>
  );
}
