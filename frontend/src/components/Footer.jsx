import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Github, Twitter, Linkedin } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <BookOpen className="logo-icon" size={24} />
            <span>Read<span className="text-gradient">Sphere</span></span>
          </Link>
          <p className="footer-description">
            Your personalized smart e-book platform. Discover, read, and manage your favorite books with AI-powered insights.
          </p>
          <div className="social-links">
            <a href="#" aria-label="Github"><Github size={20} /></a>
            <a href="#" aria-label="Twitter"><Twitter size={20} /></a>
            <a href="#" aria-label="LinkedIn"><Linkedin size={20} /></a>
          </div>
        </div>
        
        <div className="footer-links">
          <div className="link-group">
            <h3>Explore</h3>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/books">Discover Books</Link></li>
              <li><Link to="/categories">Categories</Link></li>
              <li><Link to="/authors">Top Authors</Link></li>
            </ul>
          </div>
          
          <div className="link-group">
            <h3>Account</h3>
            <ul>
              <li><Link to="/login">Sign In</Link></li>
              <li><Link to="/register">Create Account</Link></li>
              <li><Link to="/dashboard">My Library</Link></li>
              <li><Link to="/settings">Settings</Link></li>
            </ul>
          </div>
          
          <div className="link-group">
            <h3>Legal</h3>
            <ul>
              <li><Link to="/terms">Terms of Service</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} ReadSphere. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
