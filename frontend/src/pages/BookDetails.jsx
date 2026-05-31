import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, BookOpen, Bookmark, Heart, ArrowLeft, Clock, Share2, AlertCircle, Check } from 'lucide-react';
import { getBookDetails } from '../services/api';
import { addFavorite, removeFavorite, isFavorited, saveBookmark, removeBookmark, isBookmarked } from '../services/userLibrary';

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

const resolveFile = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${API_URL}${url}`;
};

const BookDetails = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const authed   = isAuthed();

  const [book,         setBook]         = useState(null);
  const [isLoading,    setIsLoading]    = useState(true);
  const [error,        setError]        = useState(null);
  const [fav,          setFav]          = useState(false);
  const [bm,           setBm]           = useState(false);
  const [actionMsg,    setActionMsg]    = useState('');

  useEffect(() => {
    const load = async () => {
      setIsLoading(true); setError(null);
      try {
        const data = await getBookDetails(id);
        if (data) {
          setBook(data);
          const bookId = data._id || data.id;
          setFav(isFavorited(bookId));
          setBm(isBookmarked(bookId));
        } else {
          setError('Book not found.');
        }
      } catch {
        setError('Failed to load book details.');
      } finally {
        setIsLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  const showMsg = (msg) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(''), 2500);
  };

  const toggleFav = async () => {
    if (!book) return;
    const bookId = book._id || book.id;
    if (fav) {
      await removeFavorite(bookId);
      setFav(false);
      showMsg('Removed from favorites');
    } else {
      await addFavorite(book);
      setFav(true);
      showMsg('Added to favorites ♥');
    }
  };

  const toggleBm = async () => {
    if (!book) return;
    const bookId = book._id || book.id;
    if (bm) {
      await removeBookmark(bookId);
      setBm(false);
      showMsg('Bookmark removed');
    } else {
      await saveBookmark(book, 1);
      setBm(true);
      showMsg('Bookmarked!');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: book?.title, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      showMsg('Link copied!');
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: 'var(--border-strong)', borderTopColor: 'var(--accent)' }} />
    </div>
  );

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error || !book) return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-md w-full p-8 rounded-xl text-center"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
        <AlertCircle size={40} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
        <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Oops!</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>{error || 'Something went wrong.'}</p>
        <Link to="/" className="btn btn-primary">Return Home</Link>
      </div>
    </div>
  );

  const fileUrl = resolveFile(book.fileUrl);
  const readId  = book._id || book.id;

  return (
    <div className="min-h-screen pb-20" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-5xl mx-auto px-4 lg:px-8 pt-10">

        {/* Back */}
        <Link to="/" className="inline-flex items-center gap-2 text-sm mb-8 transition-colors"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
          <ArrowLeft size={15} /> Back
        </Link>

        {/* ── Hero card ──────────────────────────────────────────────────── */}
        <div className="p-6 md:p-8 rounded-xl mb-8"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <div className="flex flex-col md:flex-row gap-8 items-start">

            {/* Cover */}
            <div className="w-40 md:w-48 shrink-0 mx-auto md:mx-0">
              <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-xl"
                style={{ border: '1px solid var(--border-subtle)' }}>
                <img src={resolveCover(book.coverImage)} alt={book.title}
                  className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">

              {/* Badges */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-md text-xs font-semibold"
                  style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
                  {book.category}
                </span>
                {book.rating && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold"
                    style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}>
                    <Star size={11} className="fill-current" />
                    {typeof book.rating === 'number' ? book.rating.toFixed(1) : book.rating}
                  </span>
                )}
                {/* Free badge */}
                <span className="px-2.5 py-1 rounded-md text-xs font-semibold"
                  style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', color: '#4ade80' }}>
                  Free to Read
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2"
                style={{ color: 'var(--text-primary)' }}>{book.title}</h1>
              <p className="text-base mb-6" style={{ color: 'var(--text-secondary)' }}>
                by <span style={{ color: 'var(--text-primary)' }}>{book.author}</span>
              </p>

              {/* Meta */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 mb-7 text-sm"
                style={{ color: 'var(--text-muted)' }}>
                {book.pages > 0 && (
                  <span className="flex items-center gap-1.5">
                    <BookOpen size={14} /> {book.pages} pages
                  </span>
                )}
                {book.pages > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} /> ~{Math.ceil((book.pages * 250) / 200 / 60)}h read
                  </span>
                )}
                {book.publishYear && <span>{book.publishYear}</span>}
              </div>

              {/* ── Action buttons ──────────────────────────────────────── */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">

                {/* READ NOW — always shown, all our books are free */}
                {fileUrl ? (
                  authed ? (
                    <Link
                      to={`/read/${readId}`}
                      state={{ fileUrl, book }}
                      className="btn btn-primary !px-6 !py-2.5 flex items-center gap-2">
                      <BookOpen size={16} /> Read Now
                    </Link>
                  ) : (
                    <button
                      onClick={() => navigate('/login', {
                        state: { from: `/read/${readId}`, message: 'Sign in to start reading' }
                      })}
                      className="btn btn-primary !px-6 !py-2.5 flex items-center gap-2">
                      <BookOpen size={16} /> Sign In to Read
                    </button>
                  )
                ) : (
                  /* Fallback — open on Gutenberg directly */
                  <a
                    href={`https://www.gutenberg.org/ebooks/${id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary !px-6 !py-2.5 flex items-center gap-2">
                    <BookOpen size={16} /> Read on Gutenberg
                  </a>
                )}

                {/* Favorite / Bookmark / Share — logged-in only */}
                {authed && (
                  <div className="flex items-center gap-2">
                    <button onClick={toggleFav} aria-label="Favorite"
                      className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-150"
                      style={{
                        background: fav ? 'var(--accent)' : 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-default)',
                        color: fav ? 'var(--accent-fg)' : 'var(--text-secondary)',
                      }}>
                      <Heart size={16} className={fav ? 'fill-current' : ''} />
                    </button>
                    <button onClick={toggleBm} aria-label="Bookmark"
                      className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-150"
                      style={{
                        background: bm ? 'var(--accent)' : 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-default)',
                        color: bm ? 'var(--accent-fg)' : 'var(--text-secondary)',
                      }}>
                      <Bookmark size={16} className={bm ? 'fill-current' : ''} />
                    </button>
                    <button onClick={handleShare} aria-label="Share"
                      className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-150"
                      style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
                      <Share2 size={16} />
                    </button>
                  </div>
                )}

                {/* Toast feedback */}
                {actionMsg && (
                  <span className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg"
                    style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
                    <Check size={12} /> {actionMsg}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Content grid ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">

            {/* Synopsis */}
            <div className="p-6 rounded-xl"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
              <h2 className="text-base font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Synopsis</h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {book.description || 'No synopsis available.'}
              </p>
            </div>

            {/* AI Summary */}
            {book.aiSummary && (
              <div className="p-6 rounded-xl"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
                <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full inline-block mb-4"
                  style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
                  ✦ AI Summary
                </span>
                <p className="text-sm leading-relaxed italic"
                  style={{ color: 'var(--text-secondary)', borderLeft: '2px solid var(--border-strong)', paddingLeft: '1rem' }}>
                  {book.aiSummary}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="p-6 rounded-xl sticky top-24"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
              <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Book Info</h3>
              <div className="space-y-3 text-sm">
                {[
                  { label: 'Author',    value: book.author },
                  { label: 'Category',  value: book.category },
                  { label: 'Pages',     value: book.pages > 0 ? book.pages : '—' },
                  { label: 'Published', value: book.publishYear || '—' },
                  { label: 'License',   value: 'Public Domain' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between gap-4">
                    <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                    <span className="text-right font-medium" style={{ color: 'var(--text-primary)' }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;
