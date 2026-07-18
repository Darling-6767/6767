import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { regenHearts } from './utils/storage';
import Login from './pages/Login';
import Home from './pages/Home';
import Game from './pages/Game';
import Phonetics from './pages/Phonetics';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';

export default function App() {
  const { user, refreshUser } = useAuth();

  useEffect(() => {
    if (!user) return;
    const doRegen = () => { const gained = regenHearts(); if (gained > 0) refreshUser(); };
    doRegen();
    const interval = setInterval(doRegen, 30000);
    const onVisible = () => { if (document.visibilityState === 'visible') doRegen(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { clearInterval(interval); document.removeEventListener('visibilitychange', onVisible); };
  }, [user]);

  if (!user) return <Login />;
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20 transition-colors duration-300">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game/:language" element={<Game />} />
        <Route path="/phonetics/:language" element={<Phonetics />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Navbar />
    </div>
  );
}
