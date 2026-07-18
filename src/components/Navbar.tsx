import { useNavigate, useLocation } from 'react-router-dom';
const NAV_ITEMS = [
  { path: '/', icon: '🏠', label: '首页' },
  { path: '/profile', icon: '👤', label: '我的' },
];
export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <nav className="fixed bottom-3 left-0 right-0 flex justify-center z-50 px-4">
      <div className="glass-nav rounded-full px-2 py-1.5 flex items-center gap-1 shadow-lg">
        {NAV_ITEMS.map(item => {
          const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
          return (
            <button key={item.path} onClick={() => navigate(item.path)}
              className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm transition-all ${isActive ? 'bg-blue-500 text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'}`}>
              <span className="text-base">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
