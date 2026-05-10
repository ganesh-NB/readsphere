import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Moon, Sun, BookOpen, AlertCircle } from 'lucide-react';
import { getBookDetails } from '../services/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Reader = () => {
  const { id }       = useParams();
  const location     = useLocation();
  const navFileUrl   = location.state?.fileUrl;

  const [bookTitle,   setBookTitle]   = useState('Loading…');
  const [readerType,  setReaderType]  = useState('google');
  const [fileUrl,     setFileUrl]     = useState(null);
  const [isLoading,   setIsLoading]   = useState(true);
  const [hasError,    setHasError]    = useState(false);
  const [isDark,      setIsDark]      = useState(true);
  const viewerRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getBookDetails(id);
        if (data) {
          setBookTitle(data.title);
          const url = navFileUrl || data.fileUrl;
          if (url) {
            const resolved = url.startsWith('http') ? url : `${API_URL}${url}`;
            setFileUrl(resolved);
            setReaderType(url.endsWith('.epub') ? 'epub' : 'pdf');
          } else {
            setReaderType('google');
          }
        }
      } catch { setReaderType('google'); }
    };
    if (id) load();
  }, [id, navFileUrl]);

  useEffect(() => {
    if (readerType === 'pdf' || readerType === 'epub') { setIsLoading(false); return; }
    if (readerType !== 'google') return;

    let mounted = true;
    const init = () => {
      if (!mounted || !viewerRef.current) return;
      try {
        const v = new window.google.books.DefaultViewer(viewerRef.current);
        v.load(id, () => { if (mounted) { setIsLoading(false); setHasError(false); } },
                    () => { if (mounted) { setIsLoading(false); setHasError(true);  } });
      } catch { if (mounted) { setHasError(true); setIsLoading(false); } }
    };

    const loadApi = () => {
      if (window.google?.load) window.google.load('books', '0', { callback: init });
      else { setHasError(true); setIsLoading(false); }
    };

    let script = document.getElementById('google-books-api');
    if (!script) {
      script = document.createElement('script');
      script.id  = 'google-books-api';
      script.src = 'https://www.google.com/books/jsapi.js';
      script.onload = () => { if (mounted) loadApi(); };
      document.head.appendChild(script);
    } else { loadApi(); }

    return () => { mounted = false; };
  }, [id, readerType]);

  const headerBg = isDark ? 'var(--bg-surface)' : '#ffffff';
  const headerBorder = isDark ? 'var(--border-subtle)' : 'rgba(0,0,0,0.08)';

  return (
    <div className="min-h-screen flex flex-col" style={{ background: isDark ? 'var(--bg-primary)' : '#f8f8f8' }}>

      {/* Header */}
      <header className="flex-none z-50 flex items-center justify-between px-4 lg:px-8 py-3.5"
        style={{ background: headerBg, borderBottom: `1px solid ${headerBorder}` }}>
        <div className="flex items-center gap-3">
          <Link to={`/book/${id}`}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: 'var(--bg-surface-elevated)', color: 'var(--text-secondary)' }}>
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h3 className="text-sm font-semibold leading-tight" style={{ color: isDark ? 'var(--text-primary)' : '#111' }}>
              {bookTitle}
            </h3>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {readerType === 'pdf' ? 'PDF Viewer' : readerType === 'epub' ? 'EPUB Reader' : 'Google Books'}
            </span>
          </div>
        </div>

        <button onClick={() => setIsDark(d => !d)} aria-label="Toggle theme"
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
          style={{ background: 'var(--bg-surface-elevated)', color: 'var(--text-secondary)' }}>
          {isDark ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 relative" style={{ background: isDark ? '#000' : '#fff' }}>

        {/* Loading */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10"
            style={{ background: isDark ? 'var(--bg-primary)' : '#f8f8f8' }}>
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin mb-3"
              style={{ borderColor: 'var(--border-strong)', borderTopColor: 'var(--accent)' }} />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading reader…</p>
          </div>
        )}

        {/* Error */}
        {hasError && !isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 p-6 text-center"
            style={{ background: isDark ? 'var(--bg-primary)' : '#f8f8f8' }}>
            <AlertCircle size={48} className="mb-5" style={{ color: 'var(--text-muted)' }} />
            <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Preview Not Available</h2>
            <p className="text-sm max-w-md mb-6" style={{ color: 'var(--text-secondary)' }}>
              The publisher has not made this book available for embedded preview.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a href={`https://books.google.com/books?id=${id}`} target="_blank" rel="noopener noreferrer"
                className="btn btn-primary flex items-center gap-2">
                <BookOpen size={16} /> View on Google Books
              </a>
              <Link to={`/book/${id}`} className="btn btn-outline flex items-center gap-2">
                <ArrowLeft size={16} /> Back to Details
              </Link>
            </div>
          </div>
        )}

        {/* PDF */}
        {readerType === 'pdf' && fileUrl && (
          <iframe src={`${fileUrl}#toolbar=1`} className="w-full h-full absolute inset-0 border-none" title={bookTitle} />
        )}

        {/* EPUB */}
        {readerType === 'epub' && fileUrl && (
          <iframe src={fileUrl} className="w-full h-full absolute inset-0 border-none" title={bookTitle} />
        )}

        {/* Google Books */}
        {readerType === 'google' && (
          <div ref={viewerRef}
            className={`w-full h-full absolute inset-0 transition-opacity duration-500 ${isLoading || hasError ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} />
        )}
      </main>
    </div>
  );
};

export default Reader;
