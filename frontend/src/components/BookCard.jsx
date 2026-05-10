import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, BookOpen, Lock } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const isAuthed = () => {
  try { return !!(localStorage.getItem('token') && localStorage.getItem('user')); }
  catch { return false; }
};

const resolveCover = (url) => {
  if (!url) return 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop';
  if (url.startsWith('http')) return url;
  return `${API_URL}${url}`;
};

const BookCard = ({ book }) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const navigate = useNavigate();
  const authed   = isAuthed();
  const bookId   = book._id || book.id;

  const handleReadClick = (e) => {
    if (!authed) { e.preventDefault(); navigate('/login', { state: { from: `/read/${bookId}`, message: 'Sign in to start reading' } }); }
  };
  const handleViewClick = (e) => {
    if (!authed) { e.preventDefault(); navigate('/login', { state: { from: `/book/${bookId}`, message: 'Sign in to view book details' } }); }
  };

  return (
    <div
      className="group relative rounded-xl overflow-hidden transition-all duration-300 flex flex-col h-full hover:-translate-y-1 cursor-pointer"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-border)'; e.currentTarget.style.boxShadow = '0 8px 32px var(--accent-glow)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* Cover */}
      <div className="relative aspect-[2/3] overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
        {!imgLoaded && <div className="absolute inset-0 skeleton" />}
        <img
          src={resolveCover(book.coverImage)}
          alt={book.title}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImgLoaded(true)}
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop'; setImgLoaded(true); }}
        />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex justify-between items-start z-10">
          {book.rating ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md"
              style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', color: 'var(--accent-light)', border: '1px solid var(--accent-border)' }}>
              <Star size={10} className="fill-current" />
              {typeof book.rating === 'number' ? book.rating.toFixed(1) : book.rating}
            </span>
          ) : <span />}
          {!authed && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-md"
              style={{ background: 'rgba(0,0,0,0.70)', backdropFilter: 'blur(8px)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
              <Lock size={9} /> Login
            </span>
          )}
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-all duration-300"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)' }}>
          {book.fileUrl ? (
            <Link
              to={authed ? `/read/${bookId}` : '/login'}
              state={authed ? { fileUrl: book.fileUrl } : { from: `/read/${bookId}`, message: 'Sign in to start reading' }}
              onClick={handleReadClick}
              className="btn btn-primary !px-4 !py-2 !text-xs !rounded-lg translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              {authed ? <><BookOpen size={12} /> Read Now</> : <><Lock size={11} /> Sign In</>}
            </Link>
          ) : (
            <Link
              to={authed ? `/book/${bookId}` : '/login'}
              state={!authed ? { from: `/book/${bookId}`, message: 'Sign in to view details' } : undefined}
              onClick={handleViewClick}
              className="btn btn-primary !px-4 !py-2 !text-xs !rounded-lg translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              {authed ? <><BookOpen size={12} /> View</> : <><Lock size={11} /> Sign In</>}
            </Link>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-3.5 flex-grow flex flex-col justify-between gap-2">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md"
            style={{ background: 'var(--accent-dim)', color: 'var(--accent-light)', border: '1px solid var(--accent-border)' }}>
            {book.category?.name || book.category || 'General'}
          </span>
          <h3 className="mt-2 text-sm font-semibold line-clamp-2 leading-snug"
            style={{ color: 'var(--text-primary)' }} title={book.title}>
            {book.title}
          </h3>
        </div>
        <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
          by <span style={{ color: 'var(--text-secondary)' }}>{book.author || 'Unknown'}</span>
        </p>
      </div>
    </div>
  );
};

export default BookCard;
