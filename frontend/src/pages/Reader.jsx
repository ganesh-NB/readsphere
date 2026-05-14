import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Moon, Sun, BookOpen, AlertCircle, ExternalLink } from 'lucide-react';
import { getBookDetails } from '../services/api';
import { recordReading } from '../services/userLibrary';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Reader = () => {
  const { id }     = useParams();
  const location   = useLocation();
  const navFileUrl = location.state?.fileUrl;
  const navBook    = location.state?.book;   // full book object passed from BookDetails

  const [bookTitle,  setBookTitle]  = useState('Loading…');
  const [readUrl,    setReadUrl]    = useState(null);   // final URL to load
  const [fileType,   setFileType]   = useState('html'); // 'html' | 'pdf' | 'epub'
  const [isLoading,  setIsLoading]  = useState(true);
  const [iframeErr,  setIframeErr]  = useState(false);  // iframe blocked by X-Frame-Options
  const [isDark,     setIsDark]     = useState(true);
  const iframeRef = useRef(null);

  // ── Resolve the URL to read ──────────────────────────────────────────────
  useEffect(() => {
    const resolve = async () => {
      setIsLoading(true);
      setIframeErr(false);

      try {
        const data = navBook || await getBookDetails(id);
        if (data) {
          setBookTitle(data.title);
          // Record reading history as soon as the book is opened
          recordReading(data, 1);
        }

        const rawUrl = navFileUrl || data?.fileUrl;

        if (!rawUrl) {
          setReadUrl(`https://www.gutenberg.org/ebooks/${id}`);
          setFileType('html');
          setIsLoading(false);
          return;
        }

        const resolved = rawUrl.startsWith('http') ? rawUrl : `${API_URL}${rawUrl}`;

        let type = data?.fileType || 'html';
        if (resolved.endsWith('.pdf'))  type = 'pdf';
        if (resolved.endsWith('.epub')) type = 'epub';
        if (resolved.endsWith('.htm') || resolved.endsWith('.html')) type = 'html';

        setReadUrl(resolved);
        setFileType(type);
      } catch {
        setReadUrl(`https://www.gutenberg.org/ebooks/${id}`);
        setFileType('html');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) resolve();
  }, [id, navFileUrl, navBook]);

  // ── Detect iframe X-Frame-Options block ──────────────────────────────────
  // We can't directly detect it, but we set a timeout — if the iframe never
  // fires onLoad within 8s for an HTML page, assume it's blocked.
  useEffect(() => {
    if (!readUrl || fileType !== 'html' || isLoading) return;
    const t = setTimeout(() => {
      // Check if iframe has content — if contentDocument is null it's blocked
      try {
        const doc = iframeRef.current?.contentDocument;
        if (!doc || doc.body === null) setIframeErr(true);
      } catch {
        setIframeErr(true); // cross-origin access denied = blocked
      }
    }, 6000);
    return () => clearTimeout(t);
  }, [readUrl, fileType, isLoading]);

  const handleIframeLoad = () => {
    setIsLoading(false);
    // Try to detect block
    try {
      const doc = iframeRef.current?.contentDocument;
      if (!doc || !doc.body) setIframeErr(true);
    } catch {
      setIframeErr(true);
    }
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setIframeErr(true);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden"
      style={{ background: isDark ? 'var(--bg-primary)' : '#f5f5f5' }}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="flex-none flex items-center justify-between px-4 lg:px-6 py-3 z-50"
        style={{
          background: isDark ? 'var(--bg-surface)' : '#ffffff',
          borderBottom: `1px solid ${isDark ? 'var(--border-subtle)' : 'rgba(0,0,0,0.08)'}`,
        }}>
        <div className="flex items-center gap-3 min-w-0">
          <Link to={`/book/${id}`}
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors"
            style={{ background: 'var(--bg-surface-elevated)', color: 'var(--text-secondary)' }}>
            <ArrowLeft size={16} />
          </Link>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold truncate max-w-[200px] sm:max-w-xs"
              style={{ color: isDark ? 'var(--text-primary)' : '#111' }}>
              {bookTitle}
            </h3>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {fileType === 'pdf' ? 'PDF' : fileType === 'epub' ? 'EPUB' : 'HTML'} · Project Gutenberg
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Open in new tab — always available */}
          {readUrl && (
            <a href={readUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
              <ExternalLink size={13} /> Open in tab
            </a>
          )}
          <button onClick={() => setIsDark(d => !d)} aria-label="Toggle theme"
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: 'var(--bg-surface-elevated)', color: 'var(--text-secondary)' }}>
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </header>

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <main className="flex-1 relative overflow-hidden">

        {/* Loading spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20"
            style={{ background: isDark ? 'var(--bg-primary)' : '#f5f5f5' }}>
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin mb-3"
              style={{ borderColor: 'var(--border-strong)', borderTopColor: 'var(--accent)' }} />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading book…</p>
          </div>
        )}

        {/* Iframe blocked — show fallback */}
        {iframeErr && !isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 p-6 text-center"
            style={{ background: isDark ? 'var(--bg-primary)' : '#f5f5f5' }}>
            <div className="max-w-md w-full p-8 rounded-xl"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
              <BookOpen size={40} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
              <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                Open in a new tab to read
              </h2>
              <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                This book can't be embedded directly due to browser security restrictions.
                Click below to read it on Project Gutenberg's website.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a href={readUrl} target="_blank" rel="noopener noreferrer"
                  className="btn btn-primary flex items-center justify-center gap-2">
                  <ExternalLink size={15} /> Read on Gutenberg
                </a>
                <Link to={`/book/${id}`} className="btn btn-outline flex items-center justify-center gap-2">
                  <ArrowLeft size={15} /> Back to Details
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* The iframe — used for HTML, PDF, and EPUB */}
        {readUrl && !isLoading && (
          <iframe
            ref={iframeRef}
            src={readUrl}
            title={bookTitle}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            className={`w-full h-full border-none transition-opacity duration-300 ${iframeErr ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            style={{ background: isDark ? '#111' : '#fff' }}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        )}
      </main>
    </div>
  );
};

export default Reader;
