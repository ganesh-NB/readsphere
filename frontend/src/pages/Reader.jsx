import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Moon, Sun, BookOpen, AlertCircle, FileText } from 'lucide-react';
import { getBookDetails } from '../services/api';

const Reader = () => {
  const { id } = useParams();
  const location = useLocation();
  const [bookTitle, setBookTitle] = useState('Loading Book...');
  const [book, setBook] = useState(null);
  const [theme, setTheme] = useState('dark');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [readerType, setReaderType] = useState('google'); // 'google' | 'pdf' | 'epub' | 'none'
  const [fileUrl, setFileUrl] = useState(null);
  const viewerRef = useRef(null);
  const isDark = theme === 'dark';

  // Check if we have a direct file URL from navigation state
  const navFileUrl = location.state?.fileUrl;

  // Fetch book details and determine reader type
  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const bookData = await getBookDetails(id);
        if (bookData) {
          setBook(bookData);
          setBookTitle(bookData.title);
          
          // Determine reader type based on available sources
          if (navFileUrl || bookData.fileUrl) {
            const url = navFileUrl || bookData.fileUrl;
            setFileUrl(url);
            
            // Determine type from URL extension
            if (url.endsWith('.pdf')) {
              setReaderType('pdf');
            } else if (url.endsWith('.epub')) {
              setReaderType('epub');
            } else {
              setReaderType('pdf'); // default to pdf viewer
            }
          } else {
            setReaderType('google');
          }
        }
      } catch (err) {
        console.error("Failed to load book:", err);
        setReaderType('google'); // fallback to google
      }
    };
    if (id) fetchBookDetails();
  }, [id, navFileUrl]);

  // Initialize appropriate viewer based on reader type
  useEffect(() => {
    // Skip if using direct file viewer (PDF/EPUB)
    if (readerType === 'pdf' || readerType === 'epub') {
      setIsLoading(false);
      setHasError(false);
      return;
    }

    // Skip if no google reader
    if (readerType !== 'google') {
      return;
    }

    let viewer = null;
    let isMounted = true;

    const initializeViewer = () => {
      if (!isMounted) return;
      if (!window.google || !window.google.books) return;

      try {
        if (!viewerRef.current) return;
        
        viewer = new window.google.books.DefaultViewer(viewerRef.current);
        viewer.load(
          id, 
          () => {
            if (isMounted) {
              setIsLoading(false);
              setHasError(false);
            }
          }, 
          () => {
            if (isMounted) {
              setIsLoading(false);
              setHasError(true);
            }
          }
        );
      } catch (error) {
        console.error("Error initializing viewer:", error);
        if (isMounted) {
          setHasError(true);
          setIsLoading(false);
        }
      }
    };

    const loadBooksApi = () => {
      if (window.google && window.google.load) {
        window.google.load("books", "0", {
          callback: initializeViewer
        });
      } else {
        if (isMounted) {
          setHasError(true);
          setIsLoading(false);
        }
      }
    };

    // Check if script is already present
    let script = document.getElementById('google-books-api');
    if (!script) {
      script = document.createElement('script');
      script.id = 'google-books-api';
      script.src = 'https://www.google.com/books/jsapi.js';
      script.type = 'text/javascript';
      script.onload = () => {
        if (isMounted) loadBooksApi();
      };
      document.head.appendChild(script);
    } else {
      // Script already exists, load module
      loadBooksApi();
    }

    return () => {
      isMounted = false;
    };
  }, [id, readerType]);

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${isDark ? 'bg-[#0b0f19] text-slate-300' : 'bg-orange-50/50 text-slate-800'}`}>
      
      {/* Header */}
      <header className={`flex-none z-50 flex items-center justify-between px-4 lg:px-8 py-4 border-b transition-colors duration-500 ${isDark ? 'bg-[#13192b] border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="flex items-center gap-4">
          <Link to={`/book/${id}`} className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/5 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`}>
            <ArrowLeft size={20} />
          </Link>
          <div className="flex flex-col">
            <h3 className={`font-semibold text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{bookTitle}</h3>
            <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
              {readerType === 'pdf' ? 'PDF Viewer' : readerType === 'epub' ? 'EPUB Reader' : 'Google Books Embedded Viewer'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10 text-orange-400' : 'hover:bg-slate-100 text-orange-500'}`} 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full relative bg-white">
        
        {isLoading && (
           <div className={`absolute inset-0 flex flex-col items-center justify-center z-10 ${isDark ? 'bg-[#0b0f19]' : 'bg-slate-50'}`}>
            <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mb-4"></div>
            <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>Loading electronic reader...</p>
          </div>
        )}

        {hasError && !isLoading && (
          <div className={`absolute inset-0 flex flex-col items-center justify-center z-20 p-6 text-center ${isDark ? 'bg-[#0b0f19]' : 'bg-slate-50'}`}>
            <AlertCircle size={64} className="text-orange-500 mb-6" />
            <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>Preview Not Available</h2>
            <p className={`max-w-md mx-auto mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Unfortunately, the publisher has not made this book available for embedded preview, or the requested volume could not be loaded.
            </p>
            <p className={`max-w-md mx-auto mb-8 text-sm ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
              This is a restriction set by the book's publisher or author. Not all books on Google Books support embedded reading.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href={`https://books.google.com/books?id=${id}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-primary inline-flex items-center justify-center gap-2 !py-3 !px-6 rounded-full"
              >
                <BookOpen size={20} /> View on Google Books
              </a>
              <Link 
                to={`/book/${id}`}
                className={`btn inline-flex items-center justify-center gap-2 !py-3 !px-6 rounded-full ${isDark ? 'bg-white/10 hover:bg-white/20 text-slate-200' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'}`}
              >
                <ArrowLeft size={20} /> Back to Book Details
              </Link>
            </div>
          </div>
        )}

        {/* PDF Viewer */}
        {readerType === 'pdf' && fileUrl && (
          <div className={`w-full h-full absolute inset-0 transition-opacity duration-1000 ${isLoading ? 'opacity-0 z-0' : 'opacity-100 z-30'}`}>
            <iframe
              src={`${fileUrl}#toolbar=1&navpanes=1`}
              className="w-full h-full border-none"
              title={bookTitle}
            />
          </div>
        )}

        {/* EPUB Viewer - Simple iframe fallback */}
        {readerType === 'epub' && fileUrl && (
          <div className={`w-full h-full absolute inset-0 transition-opacity duration-1000 ${isLoading ? 'opacity-0 z-0' : 'opacity-100 z-30'}`}>
            <iframe
              src={fileUrl}
              className="w-full h-full border-none"
              title={bookTitle}
            />
          </div>
        )}

        {/* Google Books Viewer Container */}
        {readerType === 'google' && (
          <div 
            ref={viewerRef} 
            className={`w-full h-full absolute inset-0 transition-opacity duration-1000 ${isLoading || hasError ? 'opacity-0 z-0' : 'opacity-100 z-30'}`}
          ></div>
        )}

      </main>
    </div>
  );
};

export default Reader;
