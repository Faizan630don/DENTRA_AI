import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Clock, GitCompare, User, LogOut } from 'lucide-react';
import { supabase } from '../../services/supabase';
import ModeToggle from '../ModeToggle';

export default function Navbar() {
  const { pathname } = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('supabase_token'));

  useEffect(() => {
    const handleAuthChange = () => {
      setIsLoggedIn(!!localStorage.getItem('supabase_token'));
    };
    window.addEventListener('storage', handleAuthChange);
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        localStorage.setItem('supabase_token', session.access_token);
        setIsLoggedIn(true);
      } else {
        localStorage.removeItem('supabase_token');
        setIsLoggedIn(false);
      }
    });

    return () => {
      window.removeEventListener('storage', handleAuthChange);
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut().catch(() => {});
    localStorage.removeItem('supabase_token');
    setIsLoggedIn(false);
    window.location.href = '/';
  };

  return (
    <header className="sticky top-0 z-50 border-b border-surface-border glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
        <Link to="/" className="flex items-center shrink-0 group py-2">
          <img
            src="/dentra-logo-transparent.png"
            alt="Dentra Logo"
            className="h-7 w-auto opacity-90 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:scale-105 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]"
          />
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/history" className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${pathname === '/history' ? 'text-brand-400' : 'text-gray-400 hover:text-white'}`}>
            <Clock className="w-3.5 h-3.5" /> History
          </Link>
          <Link to="/compare" className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${pathname === '/compare' ? 'text-brand-400' : 'text-gray-400 hover:text-white'}`}>
            <GitCompare className="w-3.5 h-3.5" /> Compare
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <ModeToggle />
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-surface-raised border border-surface-border text-gray-400 hover:text-red-400 transition-all"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          ) : (
            <Link
              to="/auth"
              className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-glow"
            >
              <User className="w-3.5 h-3.5" /> Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
