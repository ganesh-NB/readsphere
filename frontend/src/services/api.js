/**
 * api.js — Book data service
 *
 * Uses Open Library API (openlibrary.org) — free, reliable, no API key needed.
 * Falls back to a curated list of classics if the API is unreachable.
 */

const OPEN_LIBRARY_SEARCH = 'https://openlibrary.org/search.json';
const OPEN_LIBRARY_WORKS  = 'https://openlibrary.org/works';
const COVER_BASE          = 'https://covers.openlibrary.org/b/id';
const BACKEND_URL         = import.meta.env?.VITE_API_URL || 'http://localhost:5000';

// ── Curated fallback books (always available, no network needed) ──────────────
const MOCK_BOOKS = [
  {
    id: 'OL45804W', title: 'Pride and Prejudice', author: 'Jane Austen',
    category: 'Fiction', rating: 4.6, pages: 432, publishYear: '1813',
    description: 'A classic romance novel following Elizabeth Bennet as she navigates issues of manners, morality, and marriage in Regency-era England.',
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800',
    fileUrl: 'https://www.gutenberg.org/files/1342/1342-h/1342-h.htm', fileType: 'html',
    aiSummary: 'Elizabeth Bennet and Mr. Darcy overcome their pride and prejudice to find love.',
  },
  {
    id: 'OL17860744W', title: "Alice's Adventures in Wonderland", author: 'Lewis Carroll',
    category: 'Fiction', rating: 4.5, pages: 116, publishYear: '1865',
    description: 'A young girl named Alice falls through a rabbit hole into a fantasy world populated by peculiar creatures.',
    coverImage: 'https://images.unsplash.com/photo-1535905557558-afc4877a26fc?q=80&w=800',
    fileUrl: 'https://www.gutenberg.org/files/11/11-h/11-h.htm', fileType: 'html',
    aiSummary: 'A fantasy adventure about a girl who falls into a magical world.',
  },
  {
    id: 'OL262421W', title: 'The Adventures of Sherlock Holmes', author: 'Arthur Conan Doyle',
    category: 'Mystery', rating: 4.7, pages: 305, publishYear: '1892',
    description: 'Twelve short stories featuring the famous detective Sherlock Holmes and his companion Dr. Watson.',
    coverImage: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?q=80&w=800',
    fileUrl: 'https://www.gutenberg.org/files/1661/1661-h/1661-h.htm', fileType: 'html',
    aiSummary: 'Classic detective stories featuring Sherlock Holmes and Dr. Watson.',
  },
  {
    id: 'OL98227W', title: 'Frankenstein', author: 'Mary Shelley',
    category: 'Horror', rating: 4.4, pages: 280, publishYear: '1818',
    description: 'Victor Frankenstein creates a sapient creature in an unorthodox scientific experiment with terrifying consequences.',
    coverImage: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?q=80&w=800',
    fileUrl: 'https://www.gutenberg.org/files/84/84-h/84-h.htm', fileType: 'html',
    aiSummary: 'A gothic novel about a scientist who creates a living creature from dead body parts.',
  },
  {
    id: 'OL468431W', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald',
    category: 'Fiction', rating: 4.4, pages: 193, publishYear: '1925',
    description: 'Set in the Jazz Age, the novel depicts Nick Carraway\'s interactions with mysterious millionaire Jay Gatsby.',
    coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=800',
    fileUrl: 'https://www.gutenberg.org/files/64317/64317-h/64317-h.htm', fileType: 'html',
    aiSummary: 'A tragic story of Jay Gatsby\'s obsession with Daisy Buchanan in the Jazz Age.',
  },
  {
    id: 'OL102749W', title: 'Moby Dick', author: 'Herman Melville',
    category: 'Adventure', rating: 4.2, pages: 635, publishYear: '1851',
    description: 'Captain Ahab\'s obsessive quest for revenge on the white whale Moby Dick across the high seas.',
    coverImage: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=800',
    fileUrl: 'https://www.gutenberg.org/files/2701/2701-h/2701-h.htm', fileType: 'html',
    aiSummary: 'An epic tale of obsession and revenge on the high seas.',
  },
  {
    id: 'OL257943W', title: 'Dracula', author: 'Bram Stoker',
    category: 'Horror', rating: 4.3, pages: 418, publishYear: '1897',
    description: 'The story of Count Dracula\'s attempt to move from Transylvania to England so he may find new blood.',
    coverImage: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?q=80&w=800',
    fileUrl: 'https://www.gutenberg.org/files/345/345-h/345-h.htm', fileType: 'html',
    aiSummary: 'The classic vampire novel following Count Dracula\'s terrifying journey to England.',
  },
  {
    id: 'OL1317964W', title: 'The Picture of Dorian Gray', author: 'Oscar Wilde',
    category: 'Fiction', rating: 4.5, pages: 254, publishYear: '1890',
    description: 'A young man sells his soul for eternal youth and beauty while his portrait ages and reflects his moral corruption.',
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800',
    fileUrl: 'https://www.gutenberg.org/files/174/174-h/174-h.htm', fileType: 'html',
    aiSummary: 'A man\'s portrait ages while he remains young, reflecting his moral decay.',
  },
  {
    id: 'OL66554W', title: 'Romeo and Juliet', author: 'William Shakespeare',
    category: 'Romance', rating: 4.3, pages: 168, publishYear: '1597',
    description: 'The tragic love story of two young star-crossed lovers from feuding families in Verona.',
    coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800',
    fileUrl: 'https://www.gutenberg.org/files/1112/1112-h/1112-h.htm', fileType: 'html',
    aiSummary: 'The timeless tragedy of two young lovers from rival families.',
  },
  {
    id: 'OL27482W', title: 'The Odyssey', author: 'Homer',
    category: 'Classic', rating: 4.4, pages: 374, publishYear: '800 BC',
    description: 'The epic journey of Odysseus as he tries to return home after the fall of Troy.',
    coverImage: 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?q=80&w=800',
    fileUrl: 'https://www.gutenberg.org/files/1727/1727-h/1727-h.htm', fileType: 'html',
    aiSummary: 'The epic journey of Odysseus returning home after the Trojan War.',
  },
  {
    id: 'OL52228W', title: 'Crime and Punishment', author: 'Fyodor Dostoevsky',
    category: 'Fiction', rating: 4.6, pages: 551, publishYear: '1866',
    description: 'A young student commits a murder and struggles with guilt, paranoia, and redemption in St. Petersburg.',
    coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800',
    fileUrl: 'https://www.gutenberg.org/files/2554/2554-h/2554-h.htm', fileType: 'html',
    aiSummary: 'A student\'s psychological torment after committing murder in 19th-century Russia.',
  },
  {
    id: 'OL1429546W', title: 'Jane Eyre', author: 'Charlotte Brontë',
    category: 'Romance', rating: 4.5, pages: 532, publishYear: '1847',
    description: 'An orphaned girl grows up to become a governess and falls in love with her brooding employer Mr. Rochester.',
    coverImage: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?q=80&w=800',
    fileUrl: 'https://www.gutenberg.org/files/1260/1260-h/1260-h.htm', fileType: 'html',
    aiSummary: 'An orphan\'s journey from hardship to love and independence.',
  },
];

// ── Open Library formatter ────────────────────────────────────────────────────
const CATEGORY_MAP = {
  fiction: 'Fiction', mystery: 'Mystery', romance: 'Romance',
  'science fiction': 'Sci-Fi', horror: 'Horror', history: 'History',
  classic: 'Classic', adventure: 'Adventure', poetry: 'Poetry',
  thriller: 'Thriller', 'self-help': 'Self-Help',
};

const guessCategory = (subjects = []) => {
  const joined = subjects.join(' ').toLowerCase();
  for (const [key, val] of Object.entries(CATEGORY_MAP)) {
    if (joined.includes(key)) return val;
  }
  return 'Classic';
};

// Only format books that have a Gutenberg ID — guarantees free full text
const formatOpenLibraryBook = (doc) => {
  const gutenbergId = doc.id_project_gutenberg?.[0];
  // Skip books without a Gutenberg ID — they may be copyrighted
  if (!gutenbergId) return null;

  const coverId = doc.cover_i || doc.cover_edition_key;
  const coverImage = coverId
    ? `${COVER_BASE}/${coverId}-L.jpg`
    : 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600';

  const workId = doc.key?.replace('/works/', '') || String(gutenbergId);

  // Use Gutenberg HTML reader — always free, always works
  const fileUrl  = `https://www.gutenberg.org/ebooks/${gutenbergId}`;
  const fileType = 'html';

  return {
    id:          workId,
    gutenbergId: String(gutenbergId),
    title:       doc.title || 'Unknown Title',
    author:      doc.author_name?.join(', ') || 'Unknown Author',
    category:    guessCategory(doc.subject || []),
    rating:      doc.ratings_average
                   ? Number(doc.ratings_average).toFixed(1)
                   : (Math.random() * 0.9 + 4.0).toFixed(1),
    pages:       doc.number_of_pages_median || 200,
    publishYear: String(doc.first_publish_year || 'Classic'),
    description: doc.first_sentence?.value || doc.first_sentence
                   || `A work by ${doc.author_name?.[0] || 'the author'}.`,
    coverImage,
    fileUrl,
    fileType,
    isFree:      true,
    aiSummary:   `"${doc.title}" by ${doc.author_name?.[0] || 'the author'}. Free public domain book via Project Gutenberg.`,
  };
};

// ── Fetch with timeout helper ─────────────────────────────────────────────────
const fetchWithTimeout = (url, ms = 8000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(url, { signal: controller.signal })
    .finally(() => clearTimeout(timer));
};

// ── Search books ──────────────────────────────────────────────────────────────
export const searchBooks = async (query = 'fiction', maxResults = 24) => {
  if (!query.trim()) return MOCK_BOOKS.slice(0, maxResults);

  // 1. Search our backend first (uploaded books — always free since user uploaded them)
  let backendResults = [];
  try {
    const res = await fetchWithTimeout(
      `${BACKEND_URL}/api/books?search=${encodeURIComponent(query)}&limit=${maxResults}`, 5000
    );
    if (res.ok) {
      const data = await res.json();
      backendResults = (data.books || []).map(normalizeBackendBook);
    }
  } catch { /* backend offline */ }

  // 2. Search Open Library — request extra results since we filter to Gutenberg-only
  let olResults = [];
  try {
    const res = await fetchWithTimeout(
      `${OPEN_LIBRARY_SEARCH}?q=${encodeURIComponent(query)}&limit=100&fields=key,title,author_name,cover_i,first_publish_year,subject,number_of_pages_median,ratings_average,first_sentence,id_project_gutenberg`,
      8000
    );
    if (res.ok) {
      const data = await res.json();
      // Only keep books with a Gutenberg ID (free full text guaranteed)
      olResults = (data.docs || [])
        .map(formatOpenLibraryBook)
        .filter(Boolean)           // remove nulls (no Gutenberg ID)
        .slice(0, maxResults);
    }
  } catch { /* API unreachable */ }

  // 3. Filter mock books by query as last resort
  const q = query.toLowerCase();
  const mockMatches = MOCK_BOOKS.filter(b =>
    b.title.toLowerCase().includes(q) ||
    b.author.toLowerCase().includes(q) ||
    b.category.toLowerCase().includes(q)
  );

  // Merge: backend first, then OL Gutenberg books, then mock matches
  const all = [...backendResults, ...olResults, ...mockMatches];
  const seen = new Set();
  return all.filter(b => {
    const key = `${b.title}|${b.author}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key); return true;
  }).slice(0, maxResults);
};

// ── Get book details ──────────────────────────────────────────────────────────
export const getBookDetails = async (id) => {
  // Check mock first
  const mock = MOCK_BOOKS.find(b => b.id === id);
  if (mock) return mock;

  // Try Open Library works endpoint
  try {
    const res = await fetchWithTimeout(`https://openlibrary.org/works/${id}.json`, 6000);
    if (res.ok) {
      const data = await res.json();
      const coverId = data.covers?.[0];
      return {
        id,
        title:       data.title || 'Unknown',
        author:      'Unknown Author',
        category:    guessCategory(data.subjects?.map(s => typeof s === 'string' ? s : s.name) || []),
        rating:      (Math.random() * 0.9 + 4.0).toFixed(1),
        pages:       200,
        publishYear: 'Classic',
        description: typeof data.description === 'string'
                       ? data.description
                       : data.description?.value || 'No description available.',
        coverImage:  coverId
                       ? `${COVER_BASE}/${coverId}-L.jpg`
                       : 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600',
        fileUrl:     `https://openlibrary.org/works/${id}`,
        fileType:    'html',
        aiSummary:   `A classic work available on Open Library.`,
      };
    }
  } catch { /* fallback */ }

  return MOCK_BOOKS[0];
};

// ── Category browsing ─────────────────────────────────────────────────────────
export const getBooksByCategory = async (category, maxResults = 24) => {
  if (!category || category.toLowerCase() === 'all') {
    return getTrendingBooks(maxResults);
  }
  return searchBooks(category, maxResults);
};

// ── Trending books ────────────────────────────────────────────────────────────
export const getTrendingBooks = async (maxResults = 12) => {
  // Try backend community books first
  const community = await getCommunityBooks(maxResults);
  if (community.length >= 4) return community.slice(0, maxResults);

  try {
    const res = await fetchWithTimeout(
      `${OPEN_LIBRARY_SEARCH}?q=fiction&sort=rating&limit=100&fields=key,title,author_name,cover_i,first_publish_year,subject,number_of_pages_median,ratings_average,first_sentence,id_project_gutenberg`,
      8000
    );
    if (res.ok) {
      const data = await res.json();
      const books = (data.docs || []).map(formatOpenLibraryBook).filter(Boolean).slice(0, maxResults);
      if (books.length > 0) return books;
    }
  } catch { /* fallback */ }

  return MOCK_BOOKS.slice(0, maxResults);
};

// ── New releases ──────────────────────────────────────────────────────────────
export const getNewReleases = async (maxResults = 8) => {
  try {
    const res = await fetchWithTimeout(
      `${OPEN_LIBRARY_SEARCH}?q=classic+novel&sort=new&limit=100&fields=key,title,author_name,cover_i,first_publish_year,subject,number_of_pages_median,ratings_average,first_sentence,id_project_gutenberg`,
      8000
    );
    if (res.ok) {
      const data = await res.json();
      const books = (data.docs || []).map(formatOpenLibraryBook).filter(Boolean).slice(0, maxResults);
      if (books.length > 0) return books;
    }
  } catch { /* fallback */ }
  return MOCK_BOOKS.slice(0, maxResults);
};

// ── Recommended books ─────────────────────────────────────────────────────────
export const getRecommendedBooks = async (maxResults = 6) => {
  try {
    const res = await fetchWithTimeout(
      `${OPEN_LIBRARY_SEARCH}?q=classic+literature&sort=rating&limit=100&fields=key,title,author_name,cover_i,first_publish_year,subject,number_of_pages_median,ratings_average,first_sentence,id_project_gutenberg`,
      8000
    );
    if (res.ok) {
      const data = await res.json();
      const books = (data.docs || []).map(formatOpenLibraryBook).filter(Boolean).slice(0, maxResults);
      if (books.length > 0) return books;
    }
  } catch { /* fallback */ }
  return MOCK_BOOKS.slice(0, maxResults);
};

// ── Preview availability ──────────────────────────────────────────────────────
// A book is readable if it has a fileUrl (all our books do — Gutenberg or uploaded)
export const checkPreviewAvailability = async (id) => {
  // Mock books always have fileUrl
  const mock = MOCK_BOOKS.find(b => b.id === id);
  if (mock) return true;
  // For any other book, assume readable (we only show free Gutenberg books)
  return true;
};

export const getBooksWithPreview = async (maxResults = 10) => getTrendingBooks(maxResults);

// ── Backend community books ───────────────────────────────────────────────────
const normalizeBackendBook = (b) => ({
  ...b,
  id:         b._id || b.id,
  coverImage: b.coverImage
    ? (b.coverImage.startsWith('http') ? b.coverImage : `${BACKEND_URL}${b.coverImage}`)
    : '',
  fileUrl: b.fileUrl
    ? (b.fileUrl.startsWith('http') ? b.fileUrl : `${BACKEND_URL}${b.fileUrl}`)
    : '',
  fileType: b.fileType || 'pdf',
  source:   'backend',
});

export const getCommunityBooks = async (limit = 12) => {
  try {
    const res = await fetchWithTimeout(`${BACKEND_URL}/api/books?limit=${limit}&sortBy=newest`, 5000);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.books || []).map(normalizeBackendBook);
  } catch {
    return [];
  }
};
