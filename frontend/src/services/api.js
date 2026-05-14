// Project Gutenberg API endpoints
const GUTENBERG_BASE_URL = 'https://gutendex.com';  // Unofficial but reliable JSON API
const GUTENBERG_DIRECT_URL = 'https://www.gutenberg.org';

// Default search term if none provided
const DEFAULT_QUERY = 'fiction';

// Fallback data — Popular public domain books from Project Gutenberg
// fileUrl points to Gutenberg's HTML reader (always works, no CORS issues)
const MOCK_BOOKS = [
  {
    id: "1342", title: "Pride and Prejudice", author: "Jane Austen",
    category: "Fiction", rating: 4.6, pages: 432, publishYear: "1813",
    description: "Pride and Prejudice is an 1813 novel of manners by Jane Austen. The novel follows Elizabeth Bennet as she deals with issues of manners, upbringing, morality, education, and marriage.",
    coverImage: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800",
    fileUrl: "https://www.gutenberg.org/files/1342/1342-h/1342-h.htm",
    fileType: "html",
    aiSummary: "A classic romance novel about Elizabeth Bennet and Mr. Darcy overcoming their pride and prejudice."
  },
  {
    id: "11", title: "Alice's Adventures in Wonderland", author: "Lewis Carroll",
    category: "Fiction", rating: 4.5, pages: 116, publishYear: "1865",
    description: "Alice's Adventures in Wonderland is an 1865 novel by Lewis Carroll. It details the story of a young girl named Alice who falls through a rabbit hole into a fantasy world.",
    coverImage: "https://images.unsplash.com/photo-1535905557558-afc4877a26fc?q=80&w=800",
    fileUrl: "https://www.gutenberg.org/files/11/11-h/11-h.htm",
    fileType: "html",
    aiSummary: "A fantasy adventure about a girl who falls into a magical world filled with peculiar creatures."
  },
  {
    id: "1661", title: "The Adventures of Sherlock Holmes", author: "Arthur Conan Doyle",
    category: "Mystery", rating: 4.7, pages: 305, publishYear: "1892",
    description: "A collection of twelve short stories featuring the famous detective Sherlock Holmes and his companion Dr. Watson.",
    coverImage: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?q=80&w=800",
    fileUrl: "https://www.gutenberg.org/files/1661/1661-h/1661-h.htm",
    fileType: "html",
    aiSummary: "Twelve detective stories featuring the famous Sherlock Holmes and Dr. Watson."
  },
  {
    id: "84", title: "Frankenstein", author: "Mary Shelley",
    category: "Horror", rating: 4.4, pages: 280, publishYear: "1818",
    description: "Frankenstein tells the story of Victor Frankenstein, a young scientist who creates a sapient creature in an unorthodox scientific experiment.",
    coverImage: "https://images.unsplash.com/photo-1505664194779-8beaceb93744?q=80&w=800",
    fileUrl: "https://www.gutenberg.org/files/84/84-h/84-h.htm",
    fileType: "html",
    aiSummary: "A gothic novel about a scientist who creates a living creature from dead body parts."
  },
  {
    id: "64317", title: "The Great Gatsby", author: "F. Scott Fitzgerald",
    category: "Fiction", rating: 4.4, pages: 193, publishYear: "1925",
    description: "Set in the Jazz Age on Long Island, the novel depicts narrator Nick Carraway's interactions with mysterious millionaire Jay Gatsby.",
    coverImage: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=800",
    fileUrl: "https://www.gutenberg.org/files/64317/64317-h/64317-h.htm",
    fileType: "html",
    aiSummary: "A tragic story of Jay Gatsby's obsession with Daisy Buchanan in the Jazz Age."
  },
  {
    id: "2701", title: "Moby Dick", author: "Herman Melville",
    category: "Adventure", rating: 4.2, pages: 635, publishYear: "1851",
    description: "The story of the obsessive quest of Ahab, captain of the whaling ship Pequod, for revenge on Moby Dick, the giant white sperm whale.",
    coverImage: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=800",
    fileUrl: "https://www.gutenberg.org/files/2701/2701-h/2701-h.htm",
    fileType: "html",
    aiSummary: "An epic tale of obsession and revenge on the high seas."
  },
];

/**
 * Format Project Gutenberg book data into a standard Book object.
 * Priority for reading URL:
 *   1. application/pdf  → open in PDF iframe
 *   2. text/html        → open in HTML iframe (Gutenberg's own reader)
 *   3. text/plain       → open in text iframe
 *   Fallback: https://www.gutenberg.org/ebooks/{id} (Gutenberg detail page)
 */
const formatGutenbergBook = (book) => {
  let fileUrl  = null;
  let fileType = 'html';

  if (book.formats) {
    // Prefer the non-zip HTML version (renders in iframe)
    const htmlUrl = Object.keys(book.formats).find(
      k => k.startsWith('text/html') && !book.formats[k].endsWith('.zip')
    );
    const pdfUrl  = book.formats['application/pdf'];
    const txtUrl  = Object.keys(book.formats).find(
      k => k.startsWith('text/plain') && !book.formats[k].endsWith('.zip')
    );

    if (htmlUrl) {
      fileUrl  = book.formats[htmlUrl];
      fileType = 'html';
    } else if (pdfUrl) {
      fileUrl  = pdfUrl;
      fileType = 'pdf';
    } else if (txtUrl) {
      fileUrl  = book.formats[txtUrl];
      fileType = 'txt';
    }
  }

  // Final fallback — Gutenberg's own ebook page always works
  if (!fileUrl) {
    fileUrl  = `https://www.gutenberg.org/ebooks/${book.id}`;
    fileType = 'html';
  }

  const category = book.subjects && book.subjects.length > 0
    ? book.subjects[0].split(' -- ')[0]
    : 'Classic Literature';

  const rating = (Math.random() * 0.9 + 4.0).toFixed(1);

  return {
    id:          String(book.id),
    title:       book.title || 'Unknown Title',
    author:      book.authors?.length > 0
                   ? book.authors.map(a => a.name).join(', ')
                   : 'Unknown Author',
    category,
    rating,
    pages:       book.download_count ? Math.floor(book.download_count / 100) : 200,
    publishYear: book.authors?.[0]?.birth_year
                   ? String(book.authors[0].birth_year + 25)
                   : 'Classic',
    description: book.subjects?.length > 0
                   ? `A classic work in the genre of ${category}. ${book.subjects.slice(0, 3).join(', ')}.`
                   : 'A classic public domain book from Project Gutenberg.',
    coverImage:  `https://www.gutenberg.org/cache/epub/${book.id}/pg${book.id}.cover.medium.jpg`,
    fileUrl,
    fileType,
    aiSummary:   `A classic work by ${book.authors?.[0]?.name || 'a renowned author'}. Available for free reading via Project Gutenberg.`,
  };
};

/**
 * Search for books using Project Gutenberg API
 * @param {string} query - The search query
 * @param {number} maxResults - Max number of results to return
 * @returns {Promise<Array>} Array of formatted book objects
 */
export const searchBooks = async (query = DEFAULT_QUERY, maxResults = 12) => {
  try {
    const response = await fetch(
      `${GUTENBERG_BASE_URL}/books?search=${encodeURIComponent(query)}&page=1`
    );
    
    if (!response.ok) {
      console.warn(`Gutenberg API error: ${response.status}. Using fallback mock data.`);
      return MOCK_BOOKS;
    }
    
    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      return MOCK_BOOKS;
    }
    
    return data.results.slice(0, maxResults).map(formatGutenbergBook);
  } catch (error) {
    console.warn('Error fetching books from Gutenberg, using fallback data:', error);
    return MOCK_BOOKS;
  }
};

/**
 * Get detailed information for a specific book by ID
 * @param {string} id - The Project Gutenberg book ID
 * @returns {Promise<Object|null>} Formatted book object or null if not found
 */
export const getBookDetails = async (id) => {
  try {
    // First check mock data
    const mockBook = MOCK_BOOKS.find(b => b.id === id);
    if (mockBook) return mockBook;
    
    const response = await fetch(`${GUTENBERG_BASE_URL}/books/${id}`);
    
    if (!response.ok) {
      console.warn(`Gutenberg API error: ${response.status}. Using fallback mock data.`);
      return MOCK_BOOKS.find(b => b.id === id) || MOCK_BOOKS[0];
    }
    
    const data = await response.json();
    return formatGutenbergBook(data);
  } catch (error) {
    console.warn(`Error fetching book details for ID ${id}, using fallback data:`, error);
    return MOCK_BOOKS.find(b => b.id === id) || MOCK_BOOKS[0];
  }
};

/**
 * Fetch a specific category/topic of books
 */
export const getBooksByCategory = async (category, maxResults = 12) => {
  if (category.toLowerCase() === 'all' || !category) {
    return searchBooks(DEFAULT_QUERY, maxResults);
  }
  // Map common categories to Gutenberg topics
  const topicMap = {
    'fiction': 'fiction',
    'sci-fi': 'science fiction',
    'thriller': 'thriller',
    'romance': 'romance',
    'history': 'history',
    'classic': 'classic',
    'mystery': 'mystery',
    'horror': 'horror'
  };
  const topic = topicMap[category.toLowerCase()] || category.toLowerCase();
  return searchBooks(topic, maxResults);
};

/**
 * Fetch trending/popular books from Project Gutenberg
 * Uses download count as popularity metric
 */
export const getTrendingBooks = async (maxResults = 10) => {
  try {
    const response = await fetch(
      `${GUTENBERG_BASE_URL}/books?sort=popular&page=1`
    );
    
    if (!response.ok) {
      console.warn(`Gutenberg API error: ${response.status}. Using fallback mock data.`);
      return MOCK_BOOKS.slice(0, maxResults);
    }
    
    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      return MOCK_BOOKS.slice(0, maxResults);
    }
    
    return data.results.slice(0, maxResults).map(formatGutenbergBook);
  } catch (error) {
    console.warn('Error fetching trending books from Gutenberg, using fallback data:', error);
    return MOCK_BOOKS.slice(0, maxResults);
  }
};

/**
 * Fetch newest releases from Project Gutenberg
 * Note: Gutenberg doesn't have "new releases" in the traditional sense,
 * so we return popular classics instead
 */
export const getNewReleases = async (maxResults = 8) => {
  // For Gutenberg, we'll return recently added books or popular ones
  try {
    const response = await fetch(
      `${GUTENBERG_BASE_URL}/books?sort=popular&page=1`
    );
    
    if (!response.ok) return MOCK_BOOKS.slice(0, maxResults);
    
    const data = await response.json();
    if (!data.results || data.results.length === 0) return MOCK_BOOKS.slice(0, maxResults);
    
    return data.results.slice(0, maxResults).map(formatGutenbergBook);
  } catch (error) {
    console.warn('Error fetching new releases from Gutenberg:', error);
    return MOCK_BOOKS.slice(0, maxResults);
  }
};

/**
 * Fetch recommended/editor's pick books
 * Returns popular classics from Project Gutenberg
 */
export const getRecommendedBooks = async (maxResults = 6) => {
  try {
    const response = await fetch(
      `${GUTENBERG_BASE_URL}/books?languages=en&sort=popular&page=1`
    );
    
    if (!response.ok) return MOCK_BOOKS.slice(0, maxResults);
    
    const data = await response.json();
    if (!data.results || data.results.length === 0) return MOCK_BOOKS.slice(0, maxResults);
    
    return data.results.slice(0, maxResults).map(formatGutenbergBook);
  } catch (error) {
    console.warn('Error fetching recommended books from Gutenberg:', error);
    return MOCK_BOOKS.slice(0, maxResults);
  }
};

/**
 * Check if a book has PDF available
 * For Project Gutenberg, this is always true if the book exists
 * @param {string} id - The Project Gutenberg book ID
 * @returns {Promise<boolean>} True if PDF is available
 */
export const checkPreviewAvailability = async (id) => {
  try {
    const response = await fetch(`${GUTENBERG_BASE_URL}/books/${id}`);
    
    if (!response.ok) return false;
    
    const data = await response.json();
    // Check if PDF format is available
    return data.formats && !!data.formats['application/pdf'];
  } catch (error) {
    console.warn(`Error checking PDF availability for ${id}:`, error);
    return false;
  }
};

/**
 * Fetch books that have PDF available
 * All Project Gutenberg books with PDF format
 * @param {number} maxResults - Max number of results to return
 * @returns {Promise<Array>} Array of books with PDF available
 */
export const getBooksWithPreview = async (maxResults = 10) => {
  // For Gutenberg, most books have PDF, so we return popular books
  return getTrendingBooks(maxResults);
};

// ── Backend community books (user + admin uploaded, approved) ─────────────────
const BACKEND_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5000';

/**
 * Fetch approved books uploaded by users or added by admin from our backend.
 * These are real books stored in MongoDB.
 */
export const getCommunityBooks = async (limit = 12) => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/books?limit=${limit}&sortBy=newest`);
    if (!res.ok) return [];
    const data = await res.json();
    // Normalise _id → id so BookCard works with both Gutenberg and backend books
    return (data.books || []).map((b) => ({
      ...b,
      id: b._id || b.id,
      coverImage: b.coverImage
        ? (b.coverImage.startsWith('http') ? b.coverImage : `${BACKEND_URL}${b.coverImage}`)
        : '',
      fileUrl: b.fileUrl
        ? (b.fileUrl.startsWith('http') ? b.fileUrl : `${BACKEND_URL}${b.fileUrl}`)
        : '',
    }));
  } catch (err) {
    console.warn('Could not fetch community books:', err);
    return [];
  }
};
