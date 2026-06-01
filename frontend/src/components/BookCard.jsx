import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, BookOpen, Lock } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const isAuthed = () => {
  try { return !!(localStorage.getItem('token') && localStorage.getItem('user')); }
  catch { return false; }
};

const resolveCover = (url) => {
  if (!url) return 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600';
  if (url.startsWith('http')) return url;
  return `${API_URL}${url}`;
};

const BookCard = ({ book }) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const navigate = useNavigate();
  const authed   = isAuthed();
  const bookId   = book._id || book.id;

  const handleClick = () => {
    if (!authed) {
      navigate('/login', { state: { from: `/book/${bookId}`, message: 'Sign in to view book details' } });
    } else {
      navigate(`/book/${bookId}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="group relative rounded-xl overflow-hidden flex flex-col h-full cursor-pointer"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', transition: 'border-color 0.2s, transform 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {/* Cover image */}
      <div className="relative aspect-[2/3] overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
        {!imgLoaded && <div className="absolute inset-0 skeleton" />}
        <img
          src={resolveCover(book.coverImage)}
          alt={book.title}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImgLoaded(true)}
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600'; setImgLoaded(true); }}
        />

        {/* Rating badge */}
        {book.rating && (
          <div className="absolute top-2 left-2 z-10">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md"
              style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>
              <Star size={9} className="fill-current" />
              {typeof book.rating === 'number' ? book.rating.toFixed(1) : book.rating}
            </span>
          </div>
        )}

        {/* Login badge for guests */}
        {!authed && (
          <div className="absolute top-2 right-2 z-10">
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-md"
              style={{ background: 'rgba(0,0,0,0.70)', backdropFilter: 'blur(6px)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <Lock size={9} /> Login
            </span>
          </div>
        )}

        {/* Hover overlay with button */}
        <div
          className="absolute inset-0 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.25) 55%, transparent 100%)', transition: 'opacity 0.2s' }}
        >
          <div
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold"
            style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}
          >
            {authed
              ? <><BookOpen size={12} /> View Details</>
              : <><Lock size={11} /> Sign In</>
            }
          </div>
        </div>
      </div>

      {/* Book info */}
      <div className="p-3.5 flex-grow flex flex-col justify-between gap-2">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md"
            style={{ background: 'var(--bg-surface-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }}>
            {book.category?.name || book.category || 'Classic'}
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
