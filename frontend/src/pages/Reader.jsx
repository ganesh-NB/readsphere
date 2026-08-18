import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Moon,
  Sun,
  Bookmark,
  BookOpen,
  ExternalLink,
  Maximize,
  Minimize,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Check
} from 'lucide-react';

import { Document, Page, pdfjs } from 'react-pdf';

import { getBookDetails } from '../services/api';

import {
  recordReading,
  saveBookmark,
  removeBookmark,
  isBookmarked
} from '../services/userLibrary';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';


// PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc =
  `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;


const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000';


const Reader = () => {

  const { id } = useParams();

  const location = useLocation();

  const navFileUrl = location.state?.fileUrl;

  const navBook = location.state?.book;


  // --------------------------------------------------
  // Book
  // --------------------------------------------------

  const [book, setBook] = useState(navBook || null);

  const [bookTitle, setBookTitle] = useState(
    navBook?.title || 'Loading...'
  );


  // --------------------------------------------------
  // File
  // --------------------------------------------------

  const [readUrl, setReadUrl] = useState(null);

  const [fileType, setFileType] = useState('html');


  // --------------------------------------------------
  // PDF
  // --------------------------------------------------

  const [numPages, setNumPages] = useState(null);

  const [pageNumber, setPageNumber] = useState(1);

  const [scale, setScale] = useState(1.1);


  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState(null);

  const [isDark, setIsDark] = useState(true);

  const [isFullscreen, setIsFullscreen] = useState(false);

  const [bookmarked, setBookmarked] = useState(false);

  const [message, setMessage] = useState('');


  const readerRef = useRef(null);


  // ==================================================
  // LOAD BOOK
  // ==================================================

  useEffect(() => {

    const loadBook = async () => {

      setIsLoading(true);

      setError(null);

      try {

        const data =
          navBook || await getBookDetails(id);


        if (!data) {

          setError('Book not found.');

          return;

        }


        setBook(data);

        setBookTitle(data.title);


        // ------------------------------------------
        // Reading history
        // ------------------------------------------

        recordReading(data, 1);


        // ------------------------------------------
        // Bookmark
        // ------------------------------------------

        const bookId = data._id || data.id;

        setBookmarked(isBookmarked(bookId));


        // ------------------------------------------
        // File URL
        // ------------------------------------------

        const rawUrl =
          navFileUrl || data.fileUrl;


        if (!rawUrl) {

          setReadUrl(
            `https://www.gutenberg.org/ebooks/${id}`
          );

          setFileType('html');

          return;

        }


        const resolved =
          rawUrl.startsWith('http')
            ? rawUrl
            : `${API_URL}${rawUrl}`;


        let type =
          data.fileType || 'html';


        const lowerUrl =
          resolved.toLowerCase();


        if (lowerUrl.includes('.pdf')) {

          type = 'pdf';

        } else if (lowerUrl.includes('.epub')) {

          type = 'epub';

        } else if (
          lowerUrl.includes('.html') ||
          lowerUrl.includes('.htm')
        ) {

          type = 'html';

        }


        setReadUrl(resolved);

        setFileType(type);


      } catch (err) {

        console.error(err);

        setError('Unable to load this book.');

      } finally {

        setIsLoading(false);

      }

    };


    if (id) {

      loadBook();

    }

  }, [id, navFileUrl, navBook]);


  // ==================================================
  // LOAD SAVED READING POSITION
  // ==================================================

  useEffect(() => {

    if (!id) return;


    try {

      const savedPage =
        localStorage.getItem(
          `readsphere-page-${id}`
        );


      if (savedPage) {

        const page =
          Number(savedPage);


        if (page > 0) {

          setPageNumber(page);

        }

      }

    } catch (err) {

      console.log(
        'Could not load saved page'
      );

    }

  }, [id]);


  // ==================================================
  // SAVE READING POSITION
  // ==================================================

  useEffect(() => {

    if (!id || fileType !== 'pdf') return;


    try {

      localStorage.setItem(
        `readsphere-page-${id}`,
        String(pageNumber)
      );

    } catch (err) {

      console.log(
        'Could not save reading position'
      );

    }

  }, [id, pageNumber, fileType]);


  // ==================================================
  // MESSAGE
  // ==================================================

  const showMessage = (text) => {

    setMessage(text);

    setTimeout(() => {

      setMessage('');

    }, 2500);

  };


  // ==================================================
  // PDF LOADED
  // ==================================================

  const onDocumentLoadSuccess = ({
    numPages
  }) => {

    setNumPages(numPages);

    setIsLoading(false);

  };


  // ==================================================
  // NEXT PAGE
  // ==================================================

  const nextPage = () => {

    if (!numPages) return;

    setPageNumber(
      current =>
        Math.min(
          current + 1,
          numPages
        )
    );

  };


  // ==================================================
  // PREVIOUS PAGE
  // ==================================================

  const previousPage = () => {

    setPageNumber(
      current =>
        Math.max(
          current - 1,
          1
        )
    );

  };


  // ==================================================
  // ZOOM
  // ==================================================

  const zoomIn = () => {

    setScale(
      current =>
        Math.min(
          current + 0.1,
          2
        )
    );

  };


  const zoomOut = () => {

    setScale(
      current =>
        Math.max(
          current - 0.1,
          0.6
        )
    );

  };


  // ==================================================
  // BOOKMARK
  // ==================================================

  const toggleBookmark = async () => {

    if (!book) return;


    const bookId =
      book._id || book.id;


    try {

      if (bookmarked) {

        await removeBookmark(bookId);

        setBookmarked(false);

        showMessage(
          'Bookmark removed'
        );

      } else {

        /*
         * We store the current page
         * inside the bookmark object.
         *
         * Your current userLibrary implementation
         * may need to be updated to support this.
         */

        await saveBookmark(
          {
            ...book,
            bookmarkPage: pageNumber
          },
          pageNumber
        );


        setBookmarked(true);

        showMessage(
          `Bookmarked page ${pageNumber}`
        );

      }

    } catch (err) {

      console.error(err);

      showMessage(
        'Unable to update bookmark'
      );

    }

  };


  // ==================================================
  // FULLSCREEN
  // ==================================================

  const toggleFullscreen = async () => {

    try {

      if (!document.fullscreenElement) {

        await readerRef.current?.requestFullscreen();

        setIsFullscreen(true);

      } else {

        await document.exitFullscreen();

        setIsFullscreen(false);

      }

    } catch (err) {

      console.error(
        'Fullscreen error:',
        err
      );

    }

  };


  // ==================================================
  // KEYBOARD CONTROLS
  // ==================================================

  useEffect(() => {

    const handleKeyDown = (event) => {

      if (fileType !== 'pdf') return;


      if (event.key === 'ArrowRight') {

        nextPage();

      }


      if (event.key === 'ArrowLeft') {

        previousPage();

      }


      if (
        event.key === '+' ||
        event.key === '='
      ) {

        zoomIn();

      }


      if (event.key === '-') {

        zoomOut();

      }

    };


    window.addEventListener(
      'keydown',
      handleKeyDown
    );


    return () => {

      window.removeEventListener(
        'keydown',
        handleKeyDown
      );

    };

  }, [
    fileType,
    numPages
  ]);


  // ==================================================
  // PROGRESS
  // ==================================================

  const progress =
    numPages
      ? Math.round(
          (pageNumber / numPages) * 100
        )
      : 0;


  // ==================================================
  // LOADING
  // ==================================================

  if (isLoading) {

    return (

      <div
        className="h-screen flex flex-col items-center justify-center"
        style={{
          background:
            'var(--bg-primary)'
        }}
      >

        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin mb-4"
          style={{
            borderColor:
              'var(--border-strong)',

            borderTopColor:
              'var(--accent)'
          }}
        />

        <p
          className="text-sm"
          style={{
            color:
              'var(--text-muted)'
          }}
        >
          Loading book...
        </p>

      </div>

    );

  }


  // ==================================================
  // ERROR
  // ==================================================

  if (error || !readUrl) {

    return (

      <div
        className="h-screen flex items-center justify-center p-6"
        style={{
          background:
            'var(--bg-primary)'
        }}
      >

        <div
          className="max-w-md w-full p-8 rounded-xl text-center"
          style={{
            background:
              'var(--bg-surface)',

            border:
              '1px solid var(--border-subtle)'
          }}
        >

          <AlertCircle
            size={42}
            className="mx-auto mb-4"
            style={{
              color:
                'var(--text-muted)'
            }}
          />

          <h2
            className="text-xl font-bold mb-2"
            style={{
              color:
                'var(--text-primary)'
            }}
          >
            Unable to open book
          </h2>

          <p
            className="text-sm mb-6"
            style={{
              color:
                'var(--text-secondary)'
            }}
          >
            {error ||
              'The book could not be loaded.'}
          </p>

          <Link
            to={`/book/${id}`}
            className="btn btn-primary"
          >
            Back to Book
          </Link>

        </div>

      </div>

    );

  }


  // ==================================================
  // READER
  // ==================================================

  return (

    <div
      ref={readerRef}
      className="h-screen flex flex-col overflow-hidden"
      style={{
        background:
          isDark
            ? '#111111'
            : '#e9e9e9'
      }}
    >


      {/* ==========================================
          HEADER
      =========================================== */}

      <header
        className="flex-none h-14 flex items-center justify-between px-4 lg:px-6"
        style={{
          background:
            isDark
              ? '#181818'
              : '#ffffff',

          borderBottom:
            `1px solid ${
              isDark
                ? '#2a2a2a'
                : '#dddddd'
            }`
        }}
      >


        {/* LEFT */}

        <div
          className="flex items-center gap-3 min-w-0"
        >

          <Link
            to={`/book/${id}`}
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{
              background:
                isDark
                  ? '#242424'
                  : '#f2f2f2',

              color:
                isDark
                  ? '#dddddd'
                  : '#333333'
            }}
          >

            <ArrowLeft size={17} />

          </Link>


          <div className="min-w-0">

            <h2
              className="text-sm font-semibold truncate max-w-[220px]"
              style={{
                color:
                  isDark
                    ? '#ffffff'
                    : '#111111'
              }}
            >
              {bookTitle}
            </h2>

            <span
              className="text-xs"
              style={{
                color:
                  isDark
                    ? '#888888'
                    : '#777777'
              }}
            >
              {fileType.toUpperCase()} Reader
            </span>

          </div>

        </div>


        {/* RIGHT */}

        <div
          className="flex items-center gap-2"
        >


          {/* Bookmark */}

          <button
            onClick={toggleBookmark}
            title="Bookmark current page"
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{
              background:
                bookmarked
                  ? 'var(--accent)'
                  : isDark
                    ? '#242424'
                    : '#f2f2f2',

              color:
                bookmarked
                  ? 'var(--accent-fg)'
                  : isDark
                    ? '#dddddd'
                    : '#333333'
            }}
          >

            <Bookmark
              size={16}
              className={
                bookmarked
                  ? 'fill-current'
                  : ''
              }
            />

          </button>


          {/* Open in tab */}

          <a
            href={readUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in new tab"
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{
              background:
                isDark
                  ? '#242424'
                  : '#f2f2f2',

              color:
                isDark
                  ? '#dddddd'
                  : '#333333'
            }}
          >

            <ExternalLink size={16} />

          </a>


          {/* Theme */}

          <button
            onClick={() =>
              setIsDark(
                current => !current
              )
            }
            title="Change theme"
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{
              background:
                isDark
                  ? '#242424'
                  : '#f2f2f2',

              color:
                isDark
                  ? '#dddddd'
                  : '#333333'
            }}
          >

            {isDark
              ? <Sun size={16} />
              : <Moon size={16} />
            }

          </button>


          {/* Fullscreen */}

          <button
            onClick={toggleFullscreen}
            title="Fullscreen"
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{
              background:
                isDark
                  ? '#242424'
                  : '#f2f2f2',

              color:
                isDark
                  ? '#dddddd'
                  : '#333333'
            }}
          >

            {isFullscreen
              ? <Minimize size={16} />
              : <Maximize size={16} />
            }

          </button>

        </div>

      </header>


      {/* ==========================================
          READER AREA
      =========================================== */}

      <main
        className="flex-1 overflow-auto"
        style={{
          background:
            isDark
              ? '#111111'
              : '#e9e9e9'
        }}
      >


        {/* ========================================
            PDF
        ========================================= */}

        {fileType === 'pdf' && (

          <div
            className="min-h-full flex justify-center py-8 px-4"
          >

            <Document
              file={readUrl}
              onLoadSuccess={
                onDocumentLoadSuccess
              }
              onLoadError={(err) => {

                console.error(err);

                setError(
                  'Unable to load PDF.'
                );

              }}
              loading={null}
            >

              <Page
                pageNumber={pageNumber}
                scale={scale}
                renderTextLayer={true}
                renderAnnotationLayer={true}
              />

            </Document>

          </div>

        )}


        {/* ========================================
            HTML / EPUB
        ========================================= */}

        {(fileType === 'html' ||
          fileType === 'epub') && (

          <iframe
            src={readUrl}
            title={bookTitle}
            className="w-full h-full border-none"
            style={{
              background:
                isDark
                  ? '#111111'
                  : '#ffffff'
            }}
          />

        )}

      </main>


      {/* ==========================================
          BOTTOM CONTROLS
      =========================================== */}

      {fileType === 'pdf' && (

        <footer
          className="flex-none px-4 py-3"
          style={{
            background:
              isDark
                ? '#181818'
                : '#ffffff',

            borderTop:
              `1px solid ${
                isDark
                  ? '#2a2a2a'
                  : '#dddddd'
              }`
          }}
        >


          {/* CONTROLS */}

          <div
            className="max-w-5xl mx-auto flex items-center justify-between gap-4"
          >


            {/* Previous */}

            <button
              onClick={previousPage}
              disabled={pageNumber <= 1}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm disabled:opacity-30"
              style={{
                background:
                  isDark
                    ? '#242424'
                    : '#f2f2f2',

                color:
                  isDark
                    ? '#dddddd'
                    : '#333333'
              }}
            >

              <ChevronLeft size={16} />

              <span className="hidden sm:inline">
                Previous
              </span>

            </button>


            {/* PAGE */}

            <div className="flex items-center gap-3">

              <span
                className="text-sm font-medium"
                style={{
                  color:
                    isDark
                      ? '#ffffff'
                      : '#111111'
                }}
              >

                Page {pageNumber}

                <span
                  style={{
                    color:
                      isDark
                        ? '#777777'
                        : '#777777'
                  }}
                >
                  {' '}
                  / {numPages || '—'}
                </span>

              </span>

            </div>


            {/* Next */}

            <button
              onClick={nextPage}
              disabled={
                !numPages ||
                pageNumber >= numPages
              }
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm disabled:opacity-30"
              style={{
                background:
                  isDark
                    ? '#242424'
                    : '#f2f2f2',

                color:
                  isDark
                    ? '#dddddd'
                    : '#333333'
              }}
            >

              <span className="hidden sm:inline">
                Next
              </span>

              <ChevronRight size={16} />

            </button>

          </div>


          {/* PROGRESS */}

          <div className="max-w-5xl mx-auto mt-3">

            <div
              className="h-1 rounded-full overflow-hidden"
              style={{
                background:
                  isDark
                    ? '#303030'
                    : '#dddddd'
              }}
            >

              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${progress}%`,
                  background:
                    'var(--accent)'
                }}
              />

            </div>


            <div className="flex justify-between mt-1">

              <span
                className="text-[11px]"
                style={{
                  color:
                    isDark
                      ? '#777777'
                      : '#888888'
                }}
              >
                {progress}% read
              </span>


              {/* ZOOM */}

              <div
                className="flex items-center gap-1"
              >

                <button
                  onClick={zoomOut}
                  title="Zoom out"
                  className="w-7 h-7 rounded flex items-center justify-center"
                  style={{
                    color:
                      isDark
                        ? '#bbbbbb'
                        : '#555555'
                  }}
                >

                  <ZoomOut size={14} />

                </button>


                <span
                  className="text-[11px] min-w-[40px] text-center"
                  style={{
                    color:
                      isDark
                        ? '#888888'
                        : '#777777'
                  }}
                >
                  {Math.round(
                    scale * 100
                  )}%
                </span>


                <button
                  onClick={zoomIn}
                  title="Zoom in"
                  className="w-7 h-7 rounded flex items-center justify-center"
                  style={{
                    color:
                      isDark
                        ? '#bbbbbb'
                        : '#555555'
                  }}
                >

                  <ZoomIn size={14} />

                </button>

              </div>

            </div>

          </div>

        </footer>

      )}


      {/* ==========================================
          TOAST
      =========================================== */}

      {message && (

        <div
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm shadow-lg"
          style={{
            background:
              isDark
                ? '#242424'
                : '#ffffff',

            color:
              isDark
                ? '#ffffff'
                : '#111111',

            border:
              '1px solid var(--border-default)'
          }}
        >

          <Check size={14} />

          {message}

        </div>

      )}

    </div>

  );

};


export default Reader;