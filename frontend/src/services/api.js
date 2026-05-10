// Project Gutenberg API endpoints
const GUTENBERG_BASE_URL = 'https://gutendex.com';  // Unofficial but reliable JSON API
const GUTENBERG_DIRECT_URL = 'https://www.gutenberg.org';

// Default search term if none provided
const DEFAULT_QUERY = 'fiction';

// Fallback data - Popular public domain books from Project Gutenberg
const MOCK_BOOKS = [
  {
    id: "1342",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    category: "Fiction",
    rating: 4.6,
    pages: 432,
    publishYear: "1813",
    description: "Pride and Prejudice is an 1813 novel of manners by Jane Austen. The novel follows the character development of Elizabeth Bennet, the dynamic protagonist of the book who learns about the repercussions of hasty judgments.",
    coverImage: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800",
    fileUrl: "https://www.gutenberg.org/files/1342/1342-pdf.pdf",
    aiSummary: "A classic romance novel about Elizabeth Bennet and Mr. Darcy overcoming their pride and prejudice."
  },
  {
    id: "11",
    title: "Alice's Adventures in Wonderland",
    author: "Lewis Carroll",
    category: "Fiction",
    rating: 4.5,
    pages: 116,
    publishYear: "1865",
    description: "Alice's Adventures in Wonderland is an 1865 English novel by Lewis Carroll. It details the story of a young girl named Alice who falls through a rabbit hole into a fantasy world.",
    coverImage: "https://images.unsplash.com/photo-1535905557558-afc4877a26fc?q=80&w=800",
    fileUrl: "https://www.gutenberg.org/files/11/11-pdf.pdf",
    aiSummary: "A fantasy adventure about a girl who falls into a magical world filled with peculiar creatures."
  },
  {
    id: "1661",
    title: "The Adventures of Sherlock Holmes",
    author: "Arthur Conan Doyle",
    category: "Mystery",
    rating: 4.7,
    pages: 305,
    publishYear: "1892",
    description: "The Adventures of Sherlock Holmes is a collection of twelve short stories by Arthur Conan Doyle, first published on 14 October 1892.",
    coverImage: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?q=80&w=800",
    fileUrl: "https://www.gutenberg.org/files/1661/1661-pdf.pdf",
    aiSummary: "Twelve detective stories featuring the famous Sherlock Holmes and Dr. Watson."
  },
  {
    id: "84",
    title: "Frankenstein",
    author: "Mary Shelley",
    category: "Horror",
    rating: 4.4,
    pages: 280,
    publishYear: "1818",
    description: "Frankenstein; or, The Modern Prometheus is an 1818 novel written by English author Mary Shelley. It tells the story of Victor Frankenstein, a young scientist who creates a sapient creature.",
    coverImage: "https://images.unsplash.com/photo-1505664194779-8beaceb93744?q=80&w=800",
    fileUrl: "https://www.gutenberg.org/files/84/84-pdf.pdf",
    aiSummary: "A gothic novel about a scientist who creates a living creature from dead body parts."
  },
  {
    id: "64317",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    category: "Fiction",
    rating: 4.4,
    pages: 193,
    publishYear: "1925",
    description: "The Great Gatsby is a 1925 novel by American writer F. Scott Fitzgerald. Set in the Jazz Age on Long Island, the novel depicts narrator Nick Carraway's interactions with mysterious millionaire Jay Gatsby.",
    coverImage: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=800",
    fileUrl: "https://www.gutenberg.org/files/64317/64317-pdf.pdf",
    aiSummary: "A tragic story of Jay Gatsby's obsession with Daisy Buchanan in the Jazz Age."
  }
];

/**
 * Format Project Gutenberg book data into a standard Book object
 * required by our frontend components.
 */
const formatGutenbergBook = (book) => {
  // Get the PDF URL if available
  let fileUrl = null;
  if (book.formats) {
    // Prefer PDF, then HTML, then TXT
    fileUrl = book.formats['application/pdf'] || 
              book.formats['text/html'] ||
              book.formats['text/plain'];
  }
  
  // Construct PDF URL from book ID if not in formats
  if (!fileUrl && book.id) {
    fileUrl = `https://www.gutenberg.org/files/${book.id}/${book.id}-pdf.pdf`;
  }

  // Get subjects/categories
  const category = book.subjects && book.subjects.length > 0 
    ? book.subjects[0].split(' -- ')[0] 
    : 'Classic Literature';

  // Generate a random rating between 4.0 and 4.9 for classics
  const rating = (Math.random() * 0.9 + 4.0).toFixed(1);

  return {
    id: String(book.id),
    title: book.title || 'Unknown Title',
    author: book.authors && book.authors.length > 0 
      ? book.authors.map(a => a.name).join(', ') 
      : 'Unknown Author',
    category: category,
    rating: rating,
    pages: book.download_count ? Math.floor(book.download_count / 100) : 200, // Estimate pages from popularity
    publishYear: book.authors && book.authors[0] && book.authors[0].birth_year 
      ? String(book.authors[0].birth_year + 25) // Estimate publication year
      : 'Classic',
    description: book.subjects && book.subjects.length > 0
      ? `A classic work in the genre of ${category}. ${book.subjects.slice(0, 3).join(', ')}.`
      : 'A classic public domain book from Project Gutenberg.',
    coverImage: `https://www.gutenberg.org/cache/epub/${book.id}/pg${book.id}.cover.medium.jpg`,
    fileUrl: fileUrl,
    aiSummary: `A classic work by ${book.authors && book.authors[0] ? book.authors[0].name : 'a renowned author'}. This book is in the public domain and available for free reading.`,
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
