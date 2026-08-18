import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  BookOpen,
  Bookmark,
  Heart,
  ArrowLeft,
  Clock,
  Share2,
  AlertCircle,
  Check,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

import { getBookDetails } from '../services/api';

import {
  addFavorite,
  removeFavorite,
  isFavorited,
  saveBookmark,
  removeBookmark,
  isBookmarked
} from '../services/userLibrary';

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000';


// --------------------------------------------------
// Authentication
// --------------------------------------------------

const isAuthed = () => {
  try {
    return !!(
      localStorage.getItem('token') &&
      localStorage.getItem('user')
    );
  } catch {
    return false;
  }
};


// --------------------------------------------------
// Cover URL
// --------------------------------------------------

const resolveCover = (url) => {
  if (!url) {
    return 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600';
  }

  if (url.startsWith('http')) {
    return url;
  }

  return `${API_URL}${url}`;
};


// --------------------------------------------------
// File URL
// --------------------------------------------------

const resolveFile = (url) => {
  if (!url) return null;

  if (url.startsWith('http')) {
    return url;
  }

  return `${API_URL}${url}`;
};


// ==================================================
// BOOK DETAILS COMPONENT
// ==================================================

const BookDetails = () => {

  const { id } = useParams();
  const navigate = useNavigate();

  const authed = isAuthed();


  // ------------------------------------------------
  // State
  // ------------------------------------------------

  const [book, setBook] = useState(null);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState(null);

  const [fav, setFav] = useState(false);

  const [bm, setBm] = useState(false);

  const [actionMsg, setActionMsg] = useState('');

  const [showSynopsis, setShowSynopsis] = useState(false);


  // ------------------------------------------------
  // Load book
  // ------------------------------------------------

  useEffect(() => {

    const loadBook = async () => {

      setIsLoading(true);
      setError(null);

      try {

        const data = await getBookDetails(id);

        if (!data) {
          setError('Book not found.');
          return;
        }

        setBook(data);

        const bookId = data._id || data.id;

        if (authed) {

          setFav(isFavorited(bookId));

          setBm(isBookmarked(bookId));

        }

      } catch (err) {

        console.error(err);

        setError('Failed to load book details.');

      } finally {

        setIsLoading(false);

      }

    };

    if (id) {
      loadBook();
    }

  }, [id, authed]);


  // ------------------------------------------------
  // Toast message
  // ------------------------------------------------

  const showMsg = (message) => {

    setActionMsg(message);

    setTimeout(() => {
      setActionMsg('');
    }, 2500);

  };


  // ------------------------------------------------
  // Favorite
  // ------------------------------------------------

  const toggleFavorite = async () => {

    if (!book) return;

    const bookId = book._id || book.id;

    try {

      if (fav) {

        await removeFavorite(bookId);

        setFav(false);

        showMsg('Removed from favorites');

      } else {

        await addFavorite(book);

        setFav(true);

        showMsg('Added to favorites ❤️');

      }

    } catch (error) {

      console.error(error);

      showMsg('Something went wrong');

    }

  };


  // ------------------------------------------------
  // Bookmark
  // ------------------------------------------------

  const toggleBookmark = async () => {

    if (!book) return;

    const bookId = book._id || book.id;

    try {

      if (bm) {

        await removeBookmark(bookId);

        setBm(false);

        showMsg('Bookmark removed');

      } else {

        await saveBookmark(book, 1);

        setBm(true);

        showMsg('Bookmarked');

      }

    } catch (error) {

      console.error(error);

      showMsg('Something went wrong');

    }

  };


  // ------------------------------------------------
  // Share
  // ------------------------------------------------

  const handleShare = async () => {

    try {

      if (navigator.share) {

        await navigator.share({
          title: book?.title,
          text: `Check out "${book?.title}" on ReadSphere`,
          url: window.location.href
        });

      } else {

        await navigator.clipboard.writeText(
          window.location.href
        );

        showMsg('Link copied!');

      }

    } catch (error) {

      console.log('Share cancelled');

    }

  };


  // ------------------------------------------------
  // Loading
  // ------------------------------------------------

  if (isLoading) {

    return (

      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--bg-primary)' }}
      >

        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{
            borderColor: 'var(--border-strong)',
            borderTopColor: 'var(--accent)'
          }}
        />

      </div>

    );

  }


  // ------------------------------------------------
  // Error
  // ------------------------------------------------

  if (error || !book) {

    return (

      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: 'var(--bg-primary)' }}
      >

        <div
          className="max-w-md w-full p-8 rounded-xl text-center"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)'
          }}
        >

          <AlertCircle
            size={45}
            className="mx-auto mb-4"
            style={{ color: 'var(--text-muted)' }}
          />

          <h2
            className="text-xl font-bold mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            Oops!
          </h2>

          <p
            className="text-sm mb-6"
            style={{ color: 'var(--text-secondary)' }}
          >
            {error || 'Something went wrong.'}
          </p>

          <Link
            to="/"
            className="btn btn-primary"
          >
            Return Home
          </Link>

        </div>

      </div>

    );

  }


  // ------------------------------------------------
  // Book data
  // ------------------------------------------------

  const fileUrl = resolveFile(book.fileUrl);

  const readId = book._id || book.id;

  const description =
    book.description || 'No synopsis available.';


  // Estimated reading time

  const readingHours =
    book.pages > 0
      ? Math.ceil((book.pages * 250) / 200 / 60)
      : null;


  // ==================================================
  // UI
  // ==================================================

  return (

    <div
      className="min-h-screen pb-20"
      style={{ background: 'var(--bg-primary)' }}
    >

      <div className="max-w-6xl mx-auto px-4 lg:px-8 pt-10">


        {/* =========================================
            BACK
        ========================================== */}

        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm mb-8"
          style={{ color: 'var(--text-secondary)' }}
        >

          <ArrowLeft size={16} />

          Back

        </Link>


        {/* =========================================
            HERO SECTION
        ========================================== */}

        <div
          className="p-6 md:p-8 rounded-2xl mb-8"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)'
          }}
        >

          <div className="flex flex-col md:flex-row gap-8">


            {/* BOOK COVER */}

            <div className="w-44 md:w-52 shrink-0 mx-auto md:mx-0">

              <div
                className="aspect-[2/3] rounded-xl overflow-hidden shadow-xl"
                style={{
                  border: '1px solid var(--border-subtle)'
                }}
              >

                <img
                  src={resolveCover(book.coverImage)}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />

              </div>

            </div>


            {/* BOOK DETAILS */}

            <div className="flex-1">

              {/* Badges */}

              <div className="flex flex-wrap gap-2 mb-4">

                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{
                    background: 'var(--bg-surface-elevated)',
                    color: 'var(--text-secondary)'
                  }}
                >
                  {book.category}
                </span>


                {book.rating && (

                  <span
                    className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold"
                    style={{
                      background: 'var(--bg-surface-elevated)',
                      color: 'var(--text-primary)'
                    }}
                  >

                    <Star
                      size={12}
                      className="fill-current"
                    />

                    {Number(book.rating).toFixed(1)}

                  </span>

                )}


                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{
                    background: 'rgba(34,197,94,0.08)',
                    color: '#4ade80'
                  }}
                >
                  Free to Read
                </span>

              </div>


              {/* TITLE */}

              <h1
                className="text-3xl md:text-5xl font-black tracking-tight mb-3"
                style={{ color: 'var(--text-primary)' }}
              >
                {book.title}
              </h1>


              {/* AUTHOR */}

              <p
                className="text-lg mb-6"
                style={{ color: 'var(--text-secondary)' }}
              >

                by{' '}

                <span
                  className="font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {book.author}
                </span>

              </p>


              {/* META */}

              <div
                className="flex flex-wrap gap-6 mb-8 text-sm"
                style={{ color: 'var(--text-muted)' }}
              >

                {book.pages > 0 && (

                  <span className="flex items-center gap-2">

                    <BookOpen size={15} />

                    {book.pages} pages

                  </span>

                )}


                {readingHours && (

                  <span className="flex items-center gap-2">

                    <Clock size={15} />

                    ~{readingHours}h read

                  </span>

                )}


                {book.publishYear && (

                  <span>

                    {book.publishYear}

                  </span>

                )}

              </div>


              {/* ===================================
                  ACTION BUTTONS
              ==================================== */}

              <div className="flex flex-wrap gap-3">


                {/* READ */}

                {fileUrl ? (

                  authed ? (

                    <Link
                      to={`/read/${readId}`}
                      state={{
                        fileUrl,
                        book
                      }}
                      className="btn btn-primary flex items-center gap-2 px-6 py-3"
                    >

                      <BookOpen size={17} />

                      Read Now

                    </Link>

                  ) : (

                    <button
                      onClick={() =>
                        navigate('/login', {
                          state: {
                            from: `/read/${readId}`,
                            message: 'Sign in to start reading'
                          }
                        })
                      }
                      className="btn btn-primary flex items-center gap-2 px-6 py-3"
                    >

                      <BookOpen size={17} />

                      Sign In to Read

                    </button>

                  )

                ) : (

                  <a
                    href={`https://www.gutenberg.org/ebooks/${id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary flex items-center gap-2 px-6 py-3"
                  >

                    <BookOpen size={17} />

                    Read on Gutenberg

                  </a>

                )}


                {/* FAVORITE */}

                {authed && (

                  <button
                    onClick={toggleFavorite}
                    className="px-4 py-3 rounded-lg flex items-center gap-2 transition"
                    style={{
                      background: fav
                        ? 'var(--accent)'
                        : 'var(--bg-surface-elevated)',

                      color: fav
                        ? 'var(--accent-fg)'
                        : 'var(--text-secondary)',

                      border:
                        '1px solid var(--border-default)'
                    }}
                  >

                    <Heart
                      size={17}
                      className={
                        fav
                          ? 'fill-current'
                          : ''
                      }
                    />

                    {fav
                      ? 'Favorited'
                      : 'Favorite'}

                  </button>

                )}


                {/* BOOKMARK */}

                {authed && (

                  <button
                    onClick={toggleBookmark}
                    className="px-4 py-3 rounded-lg flex items-center gap-2 transition"
                    style={{
                      background: bm
                        ? 'var(--accent)'
                        : 'var(--bg-surface-elevated)',

                      color: bm
                        ? 'var(--accent-fg)'
                        : 'var(--text-secondary)',

                      border:
                        '1px solid var(--border-default)'
                    }}
                  >

                    <Bookmark
                      size={17}
                      className={
                        bm
                          ? 'fill-current'
                          : ''
                      }
                    />

                    {bm
                      ? 'Bookmarked'
                      : 'Bookmark'}

                  </button>

                )}


                {/* SHARE */}

                <button
                  onClick={handleShare}
                  className="px-4 py-3 rounded-lg flex items-center gap-2"
                  style={{
                    background:
                      'var(--bg-surface-elevated)',

                    color:
                      'var(--text-secondary)',

                    border:
                      '1px solid var(--border-default)'
                  }}
                >

                  <Share2 size={17} />

                  Share

                </button>


              </div>


              {/* TOAST */}

              {actionMsg && (

                <div
                  className="mt-4 inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
                  style={{
                    background:
                      'var(--bg-surface-elevated)',

                    color:
                      'var(--text-secondary)',

                    border:
                      '1px solid var(--border-default)'
                  }}
                >

                  <Check size={14} />

                  {actionMsg}

                </div>

              )}

            </div>

          </div>

        </div>


        {/* =========================================
            CONTENT
        ========================================== */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">


          {/* =======================================
              LEFT CONTENT
          ======================================== */}

          <div className="lg:col-span-2 space-y-6">


            {/* =====================================
                SYNOPSIS
            ====================================== */}

            <div
              className="p-6 rounded-xl"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)'
              }}
            >

              <h2
                className="text-xl font-bold mb-4"
                style={{
                  color: 'var(--text-primary)'
                }}
              >
                Synopsis
              </h2>


              <p
                className={`text-sm leading-7 ${
                  !showSynopsis
                    ? 'line-clamp-4'
                    : ''
                }`}
                style={{
                  color: 'var(--text-secondary)'
                }}
              >
                {description}
              </p>


              {description.length > 350 && (

                <button
                  onClick={() =>
                    setShowSynopsis(!showSynopsis)
                  }
                  className="mt-4 flex items-center gap-2 text-sm font-semibold"
                  style={{
                    color: 'var(--accent)'
                  }}
                >

                  {showSynopsis
                    ? 'Show Less'
                    : 'Read More'}

                  {showSynopsis
                    ? <ChevronUp size={15} />
                    : <ChevronDown size={15} />}

                </button>

              )}

            </div>


            {/* =====================================
                AI SUMMARY
            ====================================== */}

            <div
              className="p-6 rounded-xl"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)'
              }}
            >

              <div className="flex items-center gap-2 mb-4">

                <Sparkles
                  size={18}
                  style={{
                    color: 'var(--accent)'
                  }}
                />

                <h2
                  className="text-xl font-bold"
                  style={{
                    color: 'var(--text-primary)'
                  }}
                >
                  AI Summary
                </h2>

              </div>


              {book.aiSummary ? (

                <p
                  className="text-sm leading-7"
                  style={{
                    color: 'var(--text-secondary)'
                  }}
                >
                  {book.aiSummary}
                </p>

              ) : (

                <div>

                  <p
                    className="text-sm mb-5"
                    style={{
                      color: 'var(--text-secondary)'
                    }}
                  >
                    Get a quick overview of this book
                    using an AI-generated summary.
                  </p>


                  {/* AI button will be connected later */}

                  <button
                    disabled
                    className="px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-semibold opacity-60 cursor-not-allowed"
                    style={{
                      background: 'var(--accent)',
                      color: 'var(--accent-fg)'
                    }}
                  >

                    <Sparkles size={16} />

                    Generate Summary

                  </button>

                  <p
                    className="text-xs mt-3"
                    style={{
                      color: 'var(--text-muted)'
                    }}
                  >
                    AI summarization will be available
                    after the AI integration is added.
                  </p>

                </div>

              )}

            </div>

          </div>


          {/* =======================================
              BOOK INFO
          ======================================== */}

          <div>

            <div
              className="p-6 rounded-xl sticky top-24"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)'
              }}
            >

              <h2
                className="text-lg font-bold mb-5"
                style={{
                  color: 'var(--text-primary)'
                }}
              >
                Book Information
              </h2>


              <div className="space-y-4">

                {[
                  {
                    label: 'Author',
                    value: book.author
                  },

                  {
                    label: 'Category',
                    value: book.category
                  },

                  {
                    label: 'Pages',
                    value:
                      book.pages > 0
                        ? book.pages
                        : '—'
                  },

                  {
                    label: 'Published',
                    value:
                      book.publishYear || '—'
                  },

                  {
                    label: 'Language',
                    value:
                      book.language || 'English'
                  },

                  {
                    label: 'License',
                    value:
                      'Public Domain'
                  }

                ].map(({ label, value }) => (

                  <div
                    key={label}
                    className="flex justify-between gap-4 text-sm"
                  >

                    <span
                      style={{
                        color: 'var(--text-muted)'
                      }}
                    >
                      {label}
                    </span>

                    <span
                      className="text-right font-medium"
                      style={{
                        color: 'var(--text-primary)'
                      }}
                    >
                      {value}
                    </span>

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