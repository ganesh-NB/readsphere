import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, BookOpen, Bookmark, Heart, ArrowLeft, Clock, Share2, AlertCircle, ExternalLink, Check } from 'lucide-react';
import { getBookDetails, checkPreviewAvailability } from '../services/api';
import { addFavorite, removeFavorite, isFavorited, saveBookmark, removeBookmark, getBookmark } from '../services/userLibrary';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const resolveCover = (url) => {
  if (!url) return 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600';
  if (url.startsWith('http')) return url;
  return `${API_URL}${url}`;
};

const BookDetails = () => {
  const { id } = useParams();
  const [book,            setBook]            = useState(null);
  const [isLoading,       setIsLoading]       = useState(true);
  const [error,           setError]           = useState(null);
  const [isFavorite,      setIsFavorite]      = useState(false);
  const [isBookmarked,    setIsBookmarked]    = useState(false);
  const [actionMsg,       setActionMsg]       = useState('');
  const [hasPreview,      setHasPreview]      = useState(null);
  const [checkingPreview, setCheckingPreview] = useState(true);

  useEffect(() => {
    const fetch_ = async () => {
      setIsLoading(true); setError(null);
      try {
        const data = await getBookDetails(id);
        if (data) {
          setBook(data);
          // Load saved state
          const [fav, bm] = await Promise.all([
            isFavorited(data._id || data.id),
            Promise.resolve(getBookmark(data._id || data.id)),
          ]);
          setIsFavorite(fav);
          setIsBookmarked(bm !== null);
        } else setError('Book not found.');
      } catch { setError('Failed to load book details.'); }
      finally { setIsLoading(false); }
    };
    if (id) fetch_();
  }, [id]);

  useEffect(() => {
    const check = async () => {
      if (!id) return;
      try { setHasPreview(await checkPreviewAvailability(id)); }
      catch { setHasPreview(false); }
      finally { setCheckingPreview(false); }
    };
    check();
  }, [id]);

  const showMsg = (msg) => { setActionMsg(msg); setTimeout(() => setActionMsg(''), 2500); };

  const toggleFavorite = async () => {
    if (!book) return;
    try {
      if (isFavorite) {
        await removeFavorite(book._id || book.id);
        setIsFavorite(false);
        showMsg('Removed from favorites');
      } else {
        await addFavorite(book);
        setIsFavorite(true);
        showMsg('Added to favorites ♥');
      }
    } catch (e) { showMsg(e.message); }
  };

  const toggleBookmark = async () => {
    if (!book) return;
    try {
      if (isBookmarked) {
        await removeBookmark(book._id || book.id);
        setIsBookmarked(false);
        showMsg('Bookmark removed');
      } else {
        await saveBookmark(book, 1);
        setIsBookmarked(true);
        showMsg('Bookmarked!');
      }
    } catch (e) { showMsg(e.message); }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: book?.title, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      showMsg('Link copied!');
    }
  };
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: 'var(--border-strong)', borderTopColor: 'var(--accent)' }} />
    </div>

  if (error || !book) return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-md w-full p-8 rounded-xl text-center" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
        <AlertCircle size={40} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
        <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Oops!</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>{error || 'Something went wrong.'}</p>
        <Link to="/" className="btn btn-primary">Return Home</Link>
      </div>
    </div>
  );

  const fileUrl = book.fileUrl?.startsWith('http') ? book.fileUrl : book.fileUrl ? `${API_URL}${book.fileUrl}` : null;

  return (
    <div className="min-h-screen pb-20" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-5xl mx-auto px-4 lg:px-8 pt-10">

        <Link to="/" className="inline-flex items-center gap-2 text-sm mb-8 transition-colors"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
          <ArrowLeft size={15} /> Back
        </Link>

        {/* Hero */}
        <div className="p-6 md:p-8 rounded-xl mb-8" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Cover */}
            <div className="w-40 md:w-48 shrink-0 mx-auto md:mx-0">
              <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-xl" style={{ border: '1px solid var(--border-subtle)' }}>
                <img src={resolveCover(book.coverImage)} alt={book.title} className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-md text-xs font-semibold"
                  style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
                  {book.category}
                </span>
                {book.rating && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold"
                    style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}>
                    <Star size={11} className="fill-current" /> {typeof book.rating === 'number' ? book.rating.toFixed(1) : book.rating}
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>{book.title}</h1>
              <p className="text-base mb-6" style={{ color: 'var(--text-secondary)' }}>by <span style={{ color: 'var(--text-primary)' }}>{book.author}</span></p>

              {/* Meta */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 mb-7 text-sm" style={{ color: 'var(--text-muted)' }}>
                {book.pages > 0 && (
                  <span className="flex items-center gap-1.5"><BookOpen size={14} /> {book.pages} pages</span>
                )}
                {book.pages > 0 && (
                  <span className="flex items-center gap-1.5"><Clock size={14} /> ~{Math.ceil((book.pages * 250) / 200 / 60)}h read</span>
                )}
                {book.publishYear && <span>{book.publishYear}</span>}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                {fileUrl ? (
                  <Link to={`/read/${book._id || book.id}`} state={{ fileUrl, book }}
                    className="btn btn-primary !px-6 !py-2.5 flex items-center gap-2">
                    <BookOpen size={16} /> Read Now
                  </Link>
                ) : checkingPreview ? (
                  <button disabled className="btn btn-primary !px-6 !py-2.5 opacity-60 cursor-wait flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--accent-fg)', borderTopColor: 'transparent' }} />
                    Checking…
                  </button>
                ) : hasPreview ? (
                  <Link to={`/read/${book._id || book.id}`} state={{ book }} className="btn btn-primary !px-6 !py-2.5 flex items-center gap-2">
                    <BookOpen size={16} /> Read Now
                  </Link>
                ) : (
                  <a href={`https://www.gutenberg.org/ebooks/${id}`} target="_blank" rel="noopener noreferrer"
                    className="btn btn-primary !px-6 !py-2.5 flex items-center gap-2">
                    <ExternalLink size={16} /> Read on Gutenberg
                  </a>
                )}

                <div className="flex items-center gap-2">
                  <button onClick={toggleFavorite} aria-label="Favorite"
                    className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-150"
                    style={{
                      background: isFavorite ? 'var(--accent)' : 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-default)',
                      color: isFavorite ? 'var(--accent-fg)' : 'var(--text-secondary)',
                    }}>
                    <Heart size={16} className={isFavorite ? 'fill-current' : ''} />
                  </button>
                  <button onClick={toggleBookmark} aria-label="Bookmark"
                    className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-150"
                    style={{
                      background: isBookmarked ? 'var(--accent)' : 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-default)',
                      color: isBookmarked ? 'var(--accent-fg)' : 'var(--text-secondary)',
                    }}>
                    <Bookmark size={16} className={isBookmarked ? 'fill-current' : ''} />
                  </button>
                  <button onClick={handleShare} aria-label="Share"
                    className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-150"
                    style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
                    <Share2 size={16} />
                  </button>
                </div>

                {/* Action feedback */}
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

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            {/* Synopsis */}
            <div className="p-6 rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
              <h2 className="text-base font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Synopsis</h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {book.description || 'No synopsis available.'}
              </p>
            </div>

            {/* AI Summary */}
            {book.aiSummary && (
              <div className="p-6 rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full"
                    style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
                    ✦ AI Summary
                  </span>
                </div>
                <p className="text-sm leading-relaxed italic" style={{ color: 'var(--text-secondary)', borderLeft: '2px solid var(--border-strong)', paddingLeft: '1rem' }}>
                  {book.aiSummary}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="p-6 rounded-xl sticky top-24" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
              <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Similar Books</h3>
              <div className="py-10 text-center rounded-lg" style={{ background: 'var(--bg-secondary)', border: '1px dashed var(--border-default)' }}>
                <BookOpen size={28} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Coming soon</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;
