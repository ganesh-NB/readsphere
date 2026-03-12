import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Bookmark, Settings, ZoomIn, ZoomOut, Moon, Sun, Search } from 'lucide-react';
import './Reader.css';

const Reader = () => {
  const { id } = useParams();
  const [fontSize, setFontSize] = useState(1.1);
  const [theme, setTheme] = useState('dark');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={`reader-container theme-${theme}`}>
      <header className="reader-header">
        <div className="reader-header-left">
          <Link to={`/book/${id}`} className="reader-back">
            <ArrowLeft size={20} />
          </Link>
          <div className="reader-title">
            <h3>The Silent Patient</h3>
            <span className="text-muted">Chapter 4 - The Investigation</span>
          </div>
        </div>
        
        <div className="reader-controls">
          <button className="icon-btn" onClick={() => setFontSize(f => Math.max(0.8, f - 0.1))}><ZoomOut size={18} /></button>
          <span className="font-size-label">{Math.round(fontSize * 100)}%</span>
          <button className="icon-btn" onClick={() => setFontSize(f => Math.min(2.0, f + 0.1))}><ZoomIn size={18} /></button>
          <div className="divider"></div>
          <button className="icon-btn" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="icon-btn"><Bookmark size={18} /></button>
        </div>
      </header>

      <main className="reader-content" style={{ fontSize: `${fontSize}rem` }}>
        <div className="reader-page">
          <h2>Chapter 4</h2>
          <p>
            Alicia Berenson was thirty-three years old when she killed her husband.
          </p>
          <p>
            They had been married for seven years. They were both artists—Alicia was a painter, and Gabriel was a well-known fashion photographer. He had a distinctive style, shooting half-starved, semi-naked women in strange, unflattering angles. Since his death, the price of his photographs has increased astronomically. I find his work rather slick and shallow, to be honest. It has none of the visceral quality of Alicia’s best paintings. I don’t know enough about art to say whether Alicia Berenson will stand the test of time as a painter. Her talent will always be overshadowed by her notoriety, so it’s hard to be objective. And you might well accuse me of being biased. All I can offer is my opinion, for what it’s worth. And to me, Alicia was a genius. Much more than ordinary skill is evident in her work. Her paintings hold a strange, hypnotic power; they draw your attention almost like a physical force. 
          </p>
          <p>
            Especially the last one.
          </p>
          <p>
            Gabriel was murdered six years ago. He was forty-four years old. He was killed on the twenty-fifth of August—perhaps it’s unusually hot, but I remember that summer as one of the hottest on record. Every day the sun was beating down, the sky uniformly blue and cloudless. The heat was inescapable.
          </p>
          <p>
            It was the kind of heat that makes you do crazy things.
          </p>
        </div>
      </main>

      <footer className="reader-footer">
        <button className="btn btn-outline btn-sm">Previous Chapter</button>
        <div className="page-indicator">45 / 336 (13%)</div>
        <button className="btn btn-outline btn-sm">Next Chapter</button>
      </footer>
    </div>
  );
};

export default Reader;
