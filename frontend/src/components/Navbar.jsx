import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Compass, Upload, Shield, LogIn, Menu, X, Sun, Moon, User } from 'lucide-react';

// ── Theme hook ────────────────────────────────────────────────────────────────
export const useTheme = () => {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggle = () => setTheme(t => t === 'dark' ? 'light' : 'dark');
  return { theme, toggle };
};

const Navbar = () => {
  const [scrolled, setScrolled]             = useState(false);
  const [mobileOpen, setMobileOpen]         = useState(false);
  const [user, setUser]                     = useState(null);
  const { theme, toggle }                   = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const load = () => {
      const raw = localStorage.getItem('user');
      try { setUser(raw ? JSON.parse(raw) : null); } catch { setUser(null); }
    };
    load();
    window.addEventListener('storage', load);
    return () => window.removeEventListener('storage', load);
  }, [location]);

  const isActive = (path) => location.pathname === path;
  const close    = () => setMobileOpen(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isAdmin');
    setUser(null);
    navigate('/login');
  };

  const isLight = theme === 'light';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
      scrolled
        ? 'py-2.5 border-b'
        : 'py-4'
    }`}
      style={{
        background: scrolled ? 'var(--bg-glass)' : 'transparent',
        borderColor: scrolled ? 'var(--border-subtle)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
      }}>
      <div className="max-w-7xl mx-auto px-4 lg:px-8 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link to="/" onClick={close} className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--accent)' }}>
            <BookOpen size={18} style={{ color: 'var(--accent-fg)' }} />
          </div>
          <span className="text-base font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            ReadSphere
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {[
            { to: '/',         label: 'Home' },
            { to: '/discover', label: 'Discover' },
          ].map(({ to, label }) => (
            <Link key={to} to={to}
              className={`nav-link ${isActive(to) ? 'active' : ''}`}>
              {label}
            </Link>
          ))}
          {user && (
            <Link to="/upload" className={`nav-link ${isActive('/upload') ? 'active' : ''}`}>
              Upload
            </Link>
          )}
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-2">
          {/* Theme toggle */}
          <button onClick={toggle} aria-label="Toggle theme"
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
            {isLight ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              {user.role === 'admin' && (
                <Link to="/admin" title="Admin Panel"
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    location.pathname.startsWith('/admin') ? 'active' : ''
                  }`}
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                  <Shield size={16} />
                </Link>
              )}
              <Link to="/profile"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white font-bold"
                  style={{ background: 'var(--accent)' }}>
                  {user.displayName?.charAt(0) || user.username?.charAt(0) || 'U'}
                </div>
                <span className="hidden lg:inline" style={{ color: 'var(--text-primary)' }}>
                  {user.displayName || user.username}
                </span>
              </Link>
              <button onClick={handleLogout}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login"
              className="btn btn-primary !px-4 !py-2 !text-sm !rounded-lg">
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile right */}
        <div className="flex md:hidden items-center gap-2">
          <button onClick={toggle} aria-label="Toggle theme"
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
            {isLight ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          <button onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu"
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t mt-2 px-4 py-4 space-y-1"
          style={{ background: 'var(--bg-glass)', borderColor: 'var(--border-subtle)', backdropFilter: 'blur(20px)' }}>
          {[
            { to: '/',         label: 'Home' },
            { to: '/discover', label: 'Discover' },
            ...(user ? [{ to: '/upload', label: 'Upload' }] : []),
          ].map(({ to, label }) => (
            <Link key={to} to={to} onClick={close}
              className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(to) ? 'active' : ''}`}
              style={{ color: isActive(to) ? 'var(--accent-light)' : 'var(--text-secondary)' }}>
              {label}
            </Link>
          ))}
          <div className="pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link to="/admin" onClick={close}
                    className="block px-3 py-2 rounded-lg text-sm font-medium"
                    style={{ color: 'var(--text-secondary)' }}>
                    Admin Panel
                  </Link>
                )}
                <Link to="/profile" onClick={close}
                  className="block px-3 py-2 rounded-lg text-sm font-medium"
                  style={{ color: 'var(--text-secondary)' }}>
                  Profile
                </Link>
                <button onClick={() => { handleLogout(); close(); }}
                  className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium"
                  style={{ color: 'var(--text-muted)' }}>
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" onClick={close}
                className="btn btn-primary w-full justify-center !py-2.5 !text-sm !rounded-lg">
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
