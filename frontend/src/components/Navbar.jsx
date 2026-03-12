import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Search, User, Menu, X } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container nav-container">
        <Link to="/" className="nav-logo" onClick={() => setMobileMenuOpen(false)}>
          <div className="logo-icon-wrapper">
            <BookOpen className="logo-icon" size={28} />
          </div>
          <span>Read<span className="text-gradient">Sphere</span></span>
        </Link>
        
        <div className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
          <Link to="/" className={location.pathname === '/' ? 'active-link' : ''} onClick={() => setMobileMenuOpen(false)}>Home</Link>
          <Link to="/books" className={location.pathname === '/books' ? 'active-link' : ''} onClick={() => setMobileMenuOpen(false)}>Discover</Link>
          <Link to="/categories" className={location.pathname === '/categories' ? 'active-link' : ''} onClick={() => setMobileMenuOpen(false)}>Categories</Link>
          
          <div className="nav-actions">
            <button className="icon-btn search-btn" aria-label="Search">
              <Search size={20} />
            </button>
            <Link to="/login" className="btn btn-primary btn-sm login-btn" onClick={() => setMobileMenuOpen(false)}>
              <User size={18} /> Sign In
            </Link>
          </div>
        </div>

        <button 
          className="mobile-toggle" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
