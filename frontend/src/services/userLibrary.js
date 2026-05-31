/**
 * userLibrary.js — Favorites, Bookmarks, Reading History
 *
 * Strategy:
 *  - ALL books (Gutenberg + Open Library + uploaded) are stored in localStorage
 *    for instant reads with no network dependency.
 *  - Uploaded/backend books (MongoDB ObjectIds) are ALSO synced to the backend
 *    so they persist across devices.
 *  - Gutenberg/Open Library books only live in localStorage (they're public
 *    domain — no need to store them server-side).
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getToken    = () => localStorage.getItem('token');
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
});

const isMongoId = (id) => /^[a-f\d]{24}$/i.test(String(id));

// ── localStorage helpers ──────────────────────────────────────────────────────
const LS = { FAV: 'rs_favorites', BM: 'rs_bookmarks', HIST: 'rs_history' };
const lsGet = (key) => { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; } };
const lsSet = (key, val) => localStorage.setItem(key, JSON.stringify(val));

// Normalize a book to a minimal storable shape
const minBook = (book) => ({
  id:          String(book._id || book.id),
  _id:         book._id ? String(book._id) : undefined,
  title:       book.title || '',
  author:      book.author || book.author_name || '',
  coverImage:  book.coverImage || '',
  category:    book.category || '',
  fileUrl:     book.fileUrl || '',
  fileType:    book.fileType || 'html',
  source:      book.source || 'gutenberg',
});

// ─────────────────────────────────────────────────────────────────────────────
// FAVORITES
// ─────────────────────────────────────────────────────────────────────────────

export const getFavorites = () => lsGet(LS.FAV);

export const isFavorited = (bookId) => {
  const id = String(bookId);
  return lsGet(LS.FAV).some(b => b.id === id);
};

export const addFavorite = async (book) => {
  const id = String(book._id || book.id);
  const favs = lsGet(LS.FAV);
  if (!favs.find(b => b.id === id)) {
    lsSet(LS.FAV, [...favs, minBook(book)]);
  }
  // Also sync to backend for MongoDB books
  if (isMongoId(id) && getToken()) {
    try {
      await fetch(`${API_URL}/api/users/favorites/${id}`, {
        method: 'POST', headers: authHeaders(),
      });
    } catch { /* non-critical — localStorage already saved */ }
  }
};

export const removeFavorite = async (bookId) => {
  const id = String(bookId);
  lsSet(LS.FAV, lsGet(LS.FAV).filter(b => b.id !== id));
  if (isMongoId(id) && getToken()) {
    try {
      await fetch(`${API_URL}/api/users/favorites/${id}`, {
        method: 'DELETE', headers: authHeaders(),
      });
    } catch { /* non-critical */ }
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// BOOKMARKS
// ─────────────────────────────────────────────────────────────────────────────

export const getBookmarks = () => lsGet(LS.BM);

export const getBookmark = (bookId) => {
  const id = String(bookId);
  const found = lsGet(LS.BM).find(b => b.book?.id === id);
  return found ? found.page : null;
};

export const isBookmarked = (bookId) => getBookmark(bookId) !== null;

export const saveBookmark = async (book, page) => {
  const id = String(book._id || book.id);
  const bms = lsGet(LS.BM).filter(b => b.book?.id !== id);
  lsSet(LS.BM, [...bms, {
    book: minBook(book),
    page,
    addedAt: new Date().toISOString(),
  }]);
  if (isMongoId(id) && getToken()) {
    try {
      await fetch(`${API_URL}/api/users/bookmarks`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ bookId: id, page }),
      });
    } catch { /* non-critical */ }
  }
};

export const removeBookmark = async (bookId) => {
  const id = String(bookId);
  lsSet(LS.BM, lsGet(LS.BM).filter(b => b.book?.id !== id));
  if (isMongoId(id) && getToken()) {
    try {
      await fetch(`${API_URL}/api/users/bookmarks/${id}`, {
        method: 'DELETE', headers: authHeaders(),
      });
    } catch { /* non-critical */ }
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// READING HISTORY
// ─────────────────────────────────────────────────────────────────────────────

export const getReadingHistory = () => lsGet(LS.HIST);

export const recordReading = async (book, lastPage = 1) => {
  const id = String(book._id || book.id);
  const hist = lsGet(LS.HIST).filter(h => h.book?.id !== id);
  lsSet(LS.HIST, [{
    book: minBook(book),
    lastPage,
    lastRead: new Date().toISOString(),
  }, ...hist].slice(0, 100));

  if (isMongoId(id) && getToken()) {
    try {
      await fetch(`${API_URL}/api/users/reading-history`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ bookId: id, lastPage }),
      });
    } catch { /* non-critical */ }
  }
};
