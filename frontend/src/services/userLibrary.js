/**
 * userLibrary.js
 * 
 * Unified service for favorites, bookmarks, and reading history.
 * 
 * - Gutenberg books (string IDs like "1342") → stored in localStorage
 * - Backend/uploaded books (MongoDB ObjectIds) → stored in backend API
 * 
 * All functions return consistent shapes so Profile.jsx doesn't need
 * to know where the data came from.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getToken = () => localStorage.getItem('token');
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
});

// ── Detect if an ID is a MongoDB ObjectId ────────────────────────────────────
const isMongoId = (id) => /^[a-f\d]{24}$/i.test(String(id));

// ── localStorage keys ─────────────────────────────────────────────────────────
const LS_FAVORITES = 'rs_favorites';
const LS_BOOKMARKS = 'rs_bookmarks';
const LS_HISTORY   = 'rs_history';

const lsGet  = (key) => { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; } };
const lsSet  = (key, val) => localStorage.setItem(key, JSON.stringify(val));

// ─────────────────────────────────────────────────────────────────────────────
// FAVORITES
// ─────────────────────────────────────────────────────────────────────────────

/** Returns array of book objects */
export const getFavorites = async () => {
  // Local (Gutenberg) favorites
  const local = lsGet(LS_FAVORITES);

  // Backend favorites (uploaded/admin books)
  let remote = [];
  try {
    const res = await fetch(`${API_URL}/api/users/profile`, { headers: authHeaders() });
    if (res.ok) {
      const data = await res.json();
      remote = (data.favorites || []).map(b => ({ ...b, _id: b._id?.toString(), source: 'backend' }));
    }
  } catch { /* offline — use local only */ }

  // Merge, deduplicate by id
  const seen = new Set();
  return [...remote, ...local].filter(b => {
    const id = b._id || b.id;
    if (seen.has(id)) return false;
    seen.add(id); return true;
  });
};

/** Add a book to favorites */
export const addFavorite = async (book) => {
  const id = book._id || book.id;

  if (isMongoId(id)) {
    // Backend book
    const res = await fetch(`${API_URL}/api/users/favorites/${id}`, {
      method: 'POST', headers: authHeaders(),
    });
    if (!res.ok) {
      const d = await res.json();
      throw new Error(d.message || 'Failed to add favorite');
    }
    return;
  }

  // Gutenberg book → localStorage
  const favs = lsGet(LS_FAVORITES);
  if (!favs.find(b => (b._id || b.id) === id)) {
    lsSet(LS_FAVORITES, [...favs, { ...book, id: String(id), source: 'gutenberg' }]);
  }
};

/** Remove a book from favorites */
export const removeFavorite = async (bookId) => {
  const id = String(bookId);

  if (isMongoId(id)) {
    const res = await fetch(`${API_URL}/api/users/favorites/${id}`, {
      method: 'DELETE', headers: authHeaders(),
    });
    if (!res.ok) throw new Error('Failed to remove favorite');
    return;
  }

  lsSet(LS_FAVORITES, lsGet(LS_FAVORITES).filter(b => (b._id || b.id) !== id));
};

/** Check if a book is favorited */
export const isFavorited = async (bookId) => {
  const id = String(bookId);
  const favs = await getFavorites();
  return favs.some(b => (b._id || b.id) === id);
};

// ─────────────────────────────────────────────────────────────────────────────
// BOOKMARKS
// ─────────────────────────────────────────────────────────────────────────────

/** Returns array of { book, page, addedAt } */
export const getBookmarks = async () => {
  const local = lsGet(LS_BOOKMARKS); // [{ book: {...}, page, addedAt }]

  let remote = [];
  try {
    const res = await fetch(`${API_URL}/api/users/profile`, { headers: authHeaders() });
    if (res.ok) {
      const data = await res.json();
      remote = (data.bookmarks || []).map(b => ({
        book: { ...b.book, _id: b.book?._id?.toString(), source: 'backend' },
        page: b.page,
        addedAt: b.addedAt,
      }));
    }
  } catch { /* offline */ }

  const seen = new Set();
  return [...remote, ...local].filter(item => {
    const id = item.book?._id || item.book?.id;
    if (seen.has(id)) return false;
    seen.add(id); return true;
  });
};

/** Save or update a bookmark */
export const saveBookmark = async (book, page) => {
  const id = book._id || book.id;

  if (isMongoId(id)) {
    const res = await fetch(`${API_URL}/api/users/bookmarks`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ bookId: id, page }),
    });
    if (!res.ok) throw new Error('Failed to save bookmark');
    return;
  }

  // localStorage
  const bms = lsGet(LS_BOOKMARKS).filter(b => (b.book?._id || b.book?.id) !== String(id));
  lsSet(LS_BOOKMARKS, [...bms, {
    book: { ...book, id: String(id), source: 'gutenberg' },
    page,
    addedAt: new Date().toISOString(),
  }]);
};

/** Remove a bookmark */
export const removeBookmark = async (bookId) => {
  const id = String(bookId);

  if (isMongoId(id)) {
    const res = await fetch(`${API_URL}/api/users/bookmarks/${id}`, {
      method: 'DELETE', headers: authHeaders(),
    });
    if (!res.ok) throw new Error('Failed to remove bookmark');
    return;
  }

  lsSet(LS_BOOKMARKS, lsGet(LS_BOOKMARKS).filter(b => (b.book?._id || b.book?.id) !== id));
};

/** Check if a book is bookmarked, returns page number or null */
export const getBookmark = (bookId) => {
  const id = String(bookId);
  const bms = lsGet(LS_BOOKMARKS);
  const found = bms.find(b => (b.book?._id || b.book?.id) === id);
  return found ? found.page : null;
};

// ─────────────────────────────────────────────────────────────────────────────
// READING HISTORY
// ─────────────────────────────────────────────────────────────────────────────

/** Returns array of { book, lastPage, lastRead } */
export const getReadingHistory = async () => {
  const local = lsGet(LS_HISTORY);

  let remote = [];
  try {
    const res = await fetch(`${API_URL}/api/users/profile`, { headers: authHeaders() });
    if (res.ok) {
      const data = await res.json();
      remote = (data.readingHistory || []).map(h => ({
        book: { ...h.book, _id: h.book?._id?.toString(), source: 'backend' },
        lastPage: h.lastPage,
        lastRead: h.lastRead,
      }));
    }
  } catch { /* offline */ }

  const seen = new Set();
  return [...remote, ...local].filter(item => {
    const id = item.book?._id || item.book?.id;
    if (seen.has(id)) return false;
    seen.add(id); return true;
  });
};

/** Record that a book was read (call from Reader) */
export const recordReading = async (book, lastPage = 1) => {
  const id = book._id || book.id;

  if (isMongoId(id)) {
    try {
      await fetch(`${API_URL}/api/users/reading-history`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ bookId: id, lastPage }),
      });
    } catch { /* non-critical */ }
    return;
  }

  // localStorage
  const hist = lsGet(LS_HISTORY).filter(h => (h.book?._id || h.book?.id) !== String(id));
  lsSet(LS_HISTORY, [{
    book: { ...book, id: String(id), source: 'gutenberg' },
    lastPage,
    lastRead: new Date().toISOString(),
  }, ...hist].slice(0, 50)); // keep last 50
};
