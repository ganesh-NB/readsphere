import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Github, Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#0f1422] border-t border-white/5 pt-16 pb-8 mt-auto">
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-12">
          
          {/* Brand Column */}
          <div className="flex flex-col gap-6 lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 w-fit group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="text-white" size={24} />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">Read<span className="text-gradient">Sphere</span></span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md">
              Your personalized smart e-book platform. Discover, read, and manage your favorite books with AI-powered insights.
            </p>
            <div className="flex items-center gap-4 mt-2">
              <a href="#" className="w-10 h-10 rounded-full bg-[#13192b] flex items-center justify-center text-slate-400 hover:text-orange-500 hover:bg-orange-500/10 transition-all duration-300" aria-label="Github"><Github size={18} /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-[#13192b] flex items-center justify-center text-slate-400 hover:text-orange-500 hover:bg-orange-500/10 transition-all duration-300" aria-label="Twitter"><Twitter size={18} /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-[#13192b] flex items-center justify-center text-slate-400 hover:text-orange-500 hover:bg-orange-500/10 transition-all duration-300" aria-label="LinkedIn"><Linkedin size={18} /></a>
            </div>
          </div>
          
          {/* Links Columns container */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 lg:col-span-3">
            <div className="flex flex-col gap-4">
              <h3 className="text-white font-semibold mb-2">Explore</h3>
              <ul className="flex flex-col gap-3">
                <li><Link to="/" className="text-slate-400 hover:text-orange-400 text-sm transition-colors duration-200">Home</Link></li>
                <li><Link to="/books" className="text-slate-400 hover:text-orange-400 text-sm transition-colors duration-200">Discover Books</Link></li>
                <li><Link to="/categories" className="text-slate-400 hover:text-orange-400 text-sm transition-colors duration-200">Categories</Link></li>
                <li><Link to="/authors" className="text-slate-400 hover:text-orange-400 text-sm transition-colors duration-200">Top Authors</Link></li>
              </ul>
            </div>
            
            <div className="flex flex-col gap-4">
              <h3 className="text-white font-semibold mb-2">Account</h3>
              <ul className="flex flex-col gap-3">
                <li><Link to="/login" className="text-slate-400 hover:text-orange-400 text-sm transition-colors duration-200">Sign In</Link></li>
                <li><Link to="/register" className="text-slate-400 hover:text-orange-400 text-sm transition-colors duration-200">Create Account</Link></li>
                <li><Link to="/dashboard" className="text-slate-400 hover:text-orange-400 text-sm transition-colors duration-200">My Library</Link></li>
                <li><Link to="/settings" className="text-slate-400 hover:text-orange-400 text-sm transition-colors duration-200">Settings</Link></li>
              </ul>
            </div>
            
            <div className="flex flex-col gap-4">
              <h3 className="text-white font-semibold mb-2">Legal</h3>
              <ul className="flex flex-col gap-3">
                <li><Link to="/terms" className="text-slate-400 hover:text-orange-400 text-sm transition-colors duration-200">Terms of Service</Link></li>
                <li><Link to="/privacy" className="text-slate-400 hover:text-orange-400 text-sm transition-colors duration-200">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>

        </div>
        
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">&copy; {new Date().getFullYear()} ReadSphere. All rights reserved.</p>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <span>Designed with &#10084;</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
