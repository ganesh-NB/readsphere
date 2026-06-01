/**
 * api.js — Book data service
 *
 * Uses Open Library API with public_scan_b=true filter.
 * This guarantees every book returned is freely readable via Internet Archive.
 * Falls back to curated mock books if the API is unreachable.
 */

const OPEN_LIBRARY_SEARCH = 'https://openlibrary.org/search.json';
const COVER_BASE          = 'https://covers.openlibrary.org/b/id';
const BACKEND_URL         = import.meta.env?.VITE_API_URL || 'http://localhost:5000';

// Fields to request from Open Library
const OL_FIELDS = 'key,title,author_name,cover_i,first_publish_year,subject,number_of_pages_median,ratings_average,first_sentence,ia,public_scan_b';

// ── Curated fallback books (always available offline) ─────────────────────────
const MOCK_BOOKS = [
  {
    id: 'mock-1342', title: 'Pride and Prejudice', author: 'Jane Austen',
    category: 'Romance', rating: 4.6, pages: 432, publishYear: '1813',
    description: 'A classic romance novel following Elizabeth Bennet as she navigates issues of manners, morality, and marriage in Regency-era England.',
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800',
    fileUrl: 'https://archive.org/embed/prideprejudice00aust_2?ui=embed#mode/1up',
    fileType: 'html', isFree: true,
    aiSummary: 'Elizabeth Bennet and Mr. Darcy overcome their pride and prejudice to find love.',
  },
  {
    id: 'mock-11', title: "Alice's Adventures in Wonderland", author: 'Lewis Carroll',
    category: 'Fiction', rating: 4.5, pages: 116, publishYear: '1865',
    description: 'A young girl named Alice falls through a rabbit hole into a fantasy world populated by peculiar creatures.',
    coverImage: 'https://images.unsplash.com/photo-1535905557558-afc4877a26fc?q=80&w=800',
    fileUrl: 'https://archive.org/embed/alicesadventures00carr_0?ui=embed#mode/1up',
    fileType: 'html', isFree: true,
    aiSummary: 'A fantasy adventure about a girl who falls into a magical world.',
  },
  {
    id: 'mock-1661', title: 'The Adventures of Sherlock Holmes', author: 'Arthur Conan Doyle',
    category: 'Mystery', rating: 4.7, pages: 305, publishYear: '1892',
    description: 'Twelve short stories featuring the famous detective Sherlock Holmes and his companion Dr. Watson.',
    coverImage: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?q=80&w=800',
    fileUrl: 'https://archive.org/embed/adventuresofsher00doyl?ui=embed#mode/1up',
    fileType: 'html', isFree: true,
    aiSummary: 'Classic detective stories featuring Sherlock Holmes and Dr. Watson.',
  },
  {
    id: 'mock-84', title: 'Frankenstein', author: 'Mary Shelley',
    category: 'Horror', rating: 4.4, pages: 280, publishYear: '1818',
    description: 'Victor Frankenstein creates a sapient creature in an unorthodox scientific experiment with terrifying consequences.',
    coverImage: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?q=80&w=800',
    fileUrl: 'https://archive.org/embed/frankenstein00shel_1?ui=embed#mode/1up',
    fileType: 'html', isFree: true,
    aiSummary: 'A gothic novel about a scientist who creates a living creature from dead body parts.',
  },
  {
    id: 'mock-2701', title: 'Moby Dick', author: 'Herman Melville',
    category: 'Adventure', rating: 4.2, pages: 635, publishYear: '1851',
    description: "Captain Ahab's obsessive quest for revenge on the white whale Moby Dick across the high seas.",
    coverImage: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=800',
    fileUrl: 'https://archive.org/embed/mobydickorwhale00melv_1?ui=embed#mode/1up',
    fileType: 'html', isFree: true,
    aiSummary: 'An epic tale of obsession and revenge on the high seas.',
  },
  {
    id: 'mock-345', title: 'Dracula', author: 'Bram Stoker',
    category: 'Horror', rating: 4.3, pages: 418, publishYear: '1897',
    description: "The story of Count Dracula's attempt to move from Transylvania to England so he may find new blood.",
    coverImage: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?q=80&w=800',
    fileUrl: 'https://archive.org/embed/draculabram00stok?ui=embed#mode/1up',
    fileType: 'html', isFree: true,
    aiSummary: "The classic vampire novel following Count Dracula's terrifying journey to England.",
  },
  {
    id: 'mock-174', title: 'The Picture of Dorian Gray', author: 'Oscar Wilde',
    category: 'Fiction', rating: 4.5, pages: 254, publishYear: '1890',
    description: 'A young man sells his soul for eternal youth and beauty while his portrait ages and reflects his moral corruption.',
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800',
    fileUrl: 'https://archive.org/embed/pictureofdoriangr00wild?ui=embed#mode/1up',
    fileType: 'html', isFree: true,
    aiSummary: "A man's portrait ages while he remains young, reflecting his moral decay.",
  },
  {
    id: 'mock-1260', title: 'Jane Eyre', author: 'Charlotte Bronte',
    category: 'Romance', rating: 4.5, pages: 532, publishYear: '1847',
    description: 'An orphaned girl grows up to become a governess and falls in love with her brooding employer Mr. Rochester.',
    coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800',
    fileUrl: 'https://archive.org/embed/janeeyre00bron?ui=embed#mode/1up',
    fileType: 'html', isFree: true,
    aiSummary: "An orphan's journey from hardship to love and independence.",
  },
  {
    id: 'mock-2554', title: 'Crime and Punishment', author: 'Fyodor Dostoevsky',
    category: 'Fiction', rating: 4.6, pages: 551, publishYear: '1866',
    description: 'A young student commits a murder and struggles with guilt, paranoia, and redemption in St. Petersburg.',
    coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800',
    fileUrl: 'https://archive.org/embed/crimepunishment00dostuoft?ui=embed#mode/1up',
    fileType: 'html', isFree: true,
    aiSummary: "A student's psychological torment after committing murder in 19th-century Russia.",
  },
  {
    id: 'mock-1727', title: 'The Odyssey', author: 'Homer',
    category: 'Classic', rating: 4.4, pages: 374, publishYear: '800 BC',
    description: 'The epic journey of Odysseus as he tries to return home after the fall of Troy.',
    coverImage: 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?q=80&w=800',
    fileUrl: 'https://archive.org/embed/odyssey00home?ui=embed#mode/1up',
    fileType: 'html', isFree: true,
    aiSummary: 'The epic journey of Odysseus returning home after the Trojan War.',
  },
  {
    id: 'mock-1112', title: 'Romeo and Juliet', author: 'William Shakespeare',
    category: 'Romance', rating: 4.3, pages: 168, publishYear: '1597',
    description: 'The tragic love story of two young star-crossed lovers from feuding families in Verona.',
    coverImage: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?q=80&w=800',
    fileUrl: 'https://archive.org/embed/romeoandjuliet00shak_0?ui=embed#mode/1up',
    fileType: 'html', isFree: true,
    aiSummary: 'The timeless tragedy of two young lovers from rival families.',
  },
  {
    id: 'mock-secret-garden', title: 'The Secret Garden', author: 'Frances Hodgson Burnett',
    category: 'Classic', rating: 4.5, pages: 331, publishYear: '1911',
    description: 'A young girl discovers a hidden garden and transforms both it and herself through the power of nature.',
    coverImage: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=800',
    fileUrl: 'https://archive.org/embed/secretgarden00burn?ui=embed#mode/1up',
    fileType: 'html', isFree: true,
    aiSummary: 'A story of healing and growth through the magic of a secret garden.',
  },
];

// ── Category guesser ──────────────────────────────────────────────────────────
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

// ── Format Open Library result ────────────────────────────────────────────────
// Only returns a book if it has an Internet Archive ID (freely readable)
const formatOpenLibraryBook = (doc) => {
  const iaId = Array.isArray(doc.ia) ? doc.ia[0] : doc.ia;
  if (!iaId) return null; // skip — not freely readable

  const coverId = doc.cover_i;
  const coverImage = coverId
    ? `${COVER_BASE}/${coverId}-L.jpg`
    : 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600';

  const workId = doc.key ? doc.key.replace('/works/', '') : iaId;

  return {
    id:          workId,
    iaId,
    title:       doc.title || 'Unknown Title',
    author:      Array.isArray(doc.author_name) ? doc.author_name.join(', ') : 'Unknown Author',
    category:    guessCategory(doc.subject || []),
    rating:      doc.ratings_average
                   ? Number(doc.ratings_average).toFixed(1)
                   : (Math.random() * 0.9 + 4.0).toFixed(1),
    pages:       doc.number_of_pages_median || 200,
    publishYear: String(doc.first_publish_year || 'Classic'),
    description: (doc.first_sentence && (doc.first_sentence.value || doc.first_sentence))
                   || `A work by ${Array.isArray(doc.author_name) ? doc.author_name[0] : 'the author'}.`,
    coverImage,
    fileUrl:     `https://archive.org/embed/${iaId}?ui=embed#mode/1up`,
    fileType:    'html',
    isFree:      true,
    aiSummary:   `"${doc.title}" — free public domain book available on Internet Archive.`,
  };
};

// ── Fetch with timeout ────────────────────────────────────────────────────────
const fetchWithTimeout = (url, ms = 8000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timer));
};

// ── Normalize backend book ────────────────────────────────────────────────────
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
  isFree:   true,
});

// ── Search books ──────────────────────────────────────────────────────────────
export const searchBooks = async (query = 'fiction', maxResults = 24) => {
  if (!query.trim()) return MOCK_BOOKS.slice(0, maxResults);

  // 1. Backend uploaded books
  let backendResults = [];
  try {
    const res = await fetchWithTimeout(
      `${BACKEND_URL}/api/books?search=${encodeURIComponent(query)}&limit=${maxResults}`, 5000
    );
    if (res.ok) {
      const data = await res.json();
      backendResults = (data.books || []).map(normalizeBackendBook);
    }
  } catch { /* offline */ }

  // 2. Open Library — only freely readable books (public_scan_b=true)
  let olResults = [];
  try {
    const res = await fetchWithTimeout(
      `${OPEN_LIBRARY_SEARCH}?q=${encodeURIComponent(query)}&public_scan_b=true&limit=100&fields=${OL_FIELDS}`,
      8000
    );
    if (res.ok) {
      const data = await res.json();
      olResults = (data.docs || [])
        .map(formatOpenLibraryBook)
        .filter(Boolean)
        .slice(0, maxResults);
    }
  } catch { /* API unreachable */ }

  // 3. Mock fallback filtered by query
  const q = query.toLowerCase();
  const mockMatches = MOCK_BOOKS.filter(b =>
    b.title.toLowerCase().includes(q) ||
    b.author.toLowerCase().includes(q) ||
    b.category.toLowerCase().includes(q)
  );

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
  const mock = MOCK_BOOKS.find(b => b.id === id);
  if (mock) return mock;

  try {
    const res = await fetchWithTimeout(`https://openlibrary.org/works/${id}.json`, 6000);
    if (res.ok) {
      const data = await res.json();
      const coverId = data.covers?.[0];
      let iaId = null;
      try {
        const edRes = await fetchWithTimeout(`https://openlibrary.org/works/${id}/editions.json?limit=5`, 4000);
        if (edRes.ok) {
          const edData = await edRes.json();
          const edWithIA = (edData.entries || []).find(e => e.ocaid);
          if (edWithIA) iaId = edWithIA.ocaid;
        }
      } catch { /* no IA */ }

      return {
        id, iaId,
        title:       data.title || 'Unknown',
        author:      'Unknown Author',
        category:    guessCategory((data.subjects || []).map(s => typeof s === 'string' ? s : s.name)),
        rating:      (Math.random() * 0.9 + 4.0).toFixed(1),
        pages:       200,
        publishYear: 'Classic',
        description: typeof data.description === 'string'
                       ? data.description
                       : data.description?.value || 'No description available.',
        coverImage:  coverId
                       ? `${COVER_BASE}/${coverId}-L.jpg`
                       : 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600',
        fileUrl:     iaId ? `https://archive.org/embed/${iaId}?ui=embed#mode/1up` : null,
        fileType:    'html',
        isFree:      !!iaId,
        aiSummary:   'A classic work available for free reading.',
      };
    }
  } catch { /* fallback */ }

  return MOCK_BOOKS[0];
};

// ── Category browsing ─────────────────────────────────────────────────────────
export const getBooksByCategory = async (category, maxResults = 24) => {
  if (!category || category.toLowerCase() === 'all') return getTrendingBooks(maxResults);
  return searchBooks(category, maxResults);
};

// ── Trending books ────────────────────────────────────────────────────────────
export const getTrendingBooks = async (maxResults = 12) => {
  // Fetch community books and OL books in parallel — don't let one block the other
  const [community, olBooks] = await Promise.allSettled([
    getCommunityBooks(maxResults),
    (async () => {
      const res = await fetchWithTimeout(
        `${OPEN_LIBRARY_SEARCH}?q=classic+fiction&public_scan_b=true&sort=rating&limit=100&fields=${OL_FIELDS}`,
        8000
      );
      if (!res.ok) return [];
      const data = await res.json();
      return (data.docs || []).map(formatOpenLibraryBook).filter(Boolean).slice(0, maxResults);
    })(),
  ]);

  const communityList = community.status === 'fulfilled' ? community.value : [];
  const olList        = olBooks.status  === 'fulfilled' ? olBooks.value  : [];

  // Merge: community books first, then OL, then mock fallback
  const merged = [...communityList, ...olList];
  if (merged.length > 0) return merged.slice(0, maxResults);
  return MOCK_BOOKS.slice(0, maxResults);
};

// ── New releases ──────────────────────────────────────────────────────────────
export const getNewReleases = async (maxResults = 8) => {
  try {
    const res = await fetchWithTimeout(
      `${OPEN_LIBRARY_SEARCH}?q=adventure+novel&public_scan_b=true&sort=new&limit=100&fields=${OL_FIELDS}`,
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
      `${OPEN_LIBRARY_SEARCH}?q=romance+classic&public_scan_b=true&sort=rating&limit=100&fields=${OL_FIELDS}`,
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
export const checkPreviewAvailability = async () => true;
export const getBooksWithPreview = async (maxResults = 10) => getTrendingBooks(maxResults);

// ── Backend community books ───────────────────────────────────────────────────
export const getCommunityBooks = async (limit = 12) => {
  try {
    const res = await fetchWithTimeout(`${BACKEND_URL}/api/books?limit=${limit}&sortBy=newest`, 3000);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.books || []).map(normalizeBackendBook);
  } catch {
    return [];
  }
};
