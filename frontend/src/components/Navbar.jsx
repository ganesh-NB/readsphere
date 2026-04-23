import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, User, Menu, X, Compass, Upload, Shield } from 'lucide-react';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Check for logged in user
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        setUser(null);
      }
    }

    // Listen for storage changes
    const handleStorage = () => {
      const u = localStorage.getItem('user');
      setUser(u ? JSON.parse(u) : null);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [location]);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'py-3 bg-[#050505]/90 backdrop-blur-xl shadow-2xl shadow-black/50 border-b border-red-500/10' 
        : 'py-5 bg-transparent'
    }`}>
      <div className="container mx-auto px-4 lg:px-8 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 z-50 group" onClick={() => setMobileMenuOpen(false)}>
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-lg shadow-red-500/30 group-hover:scale-110 group-hover:shadow-red-500/50 transition-all duration-300">
            <BookOpen className="text-white" size={24} />
          </div>
          <span className="text-xl font-black tracking-tight uppercase">
            Read<span className="text-gradient">Sphere</span>
          </span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className={`fixed inset-0 bg-[#050505]/98 backdrop-blur-xl flex flex-col items-center justify-center gap-8 transition-transform duration-300 md:static md:bg-transparent md:flex-row md:translate-x-0 md:justify-end md:gap-1 lg:gap-2 ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          
          <Link 
            to="/" 
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold uppercase tracking-wider transition-all duration-300 ${
              isActive('/') 
                ? 'bg-red-500/10 text-red-500 border border-red-500/30' 
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`} 
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
          
          <Link 
            to="/discover" 
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
              isActive('/discover') 
                ? 'bg-red-500/10 text-red-500 border border-red-500/30' 
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`} 
            onClick={() => setMobileMenuOpen(false)}
          >
            <Compass size={16} />
            Discover
          </Link>

          {user && (
            <Link 
              to="/upload" 
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
                isActive('/upload') 
                  ? 'bg-red-500/10 text-red-500 border border-red-500/30' 
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`} 
              onClick={() => setMobileMenuOpen(false)}
            >
              <Upload size={16} />
              Upload
            </Link>
          )}
          
          <div className="flex items-center gap-3 mt-4 md:mt-0 md:ml-4 pl-4 md:border-l border-red-500/20">
            {user ? (
              <div className="flex items-center gap-3">
                {user.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    className={`p-2.5 rounded-xl transition-all duration-300 ${
                      isActive('/admin') 
                        ? 'bg-red-500/10 text-red-500 border border-red-500/30' 
                        : 'text-neutral-400 hover:text-red-500 hover:bg-red-500/10'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                    title="Admin Panel"
                  >
                    <Shield size={20} />
                  </Link>
                )}
                <Link 
                  to="/profile" 
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    isActive('/profile') 
                      ? 'bg-red-500/10 text-red-500 border border-red-500/30' 
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-xs text-white font-bold">
                    {user.displayName?.charAt(0) || user.username?.charAt(0) || 'U'}
                  </div>
                  <span className="hidden lg:inline">{user.displayName || user.username}</span>
                </Link>
                <button 
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="text-xs text-neutral-500 hover:text-red-400 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="btn btn-primary !py-2.5 !px-6 !text-xs" 
                onClick={() => setMobileMenuOpen(false)}
              >
                <User size={16} /> Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden z-50 p-2.5 text-neutral-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all duration-300" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
