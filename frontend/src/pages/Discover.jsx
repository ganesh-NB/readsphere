import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Grid3X3, List, ChevronDown, BookOpen, X } from 'lucide-react';
import BookCard from '../components/BookCard';
import { searchBooks, getBooksByCategory, getTrendingBooks } from '../services/api';

const CATEGORIES = [
  'All', 'Fiction', 'Mystery', 'Romance', 'Sci-Fi', 
  'Horror', 'History', 'Classic', 'Adventure', 'Poetry'
];

const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest First' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'title', label: 'Title A-Z' },
];

const Discover = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Initial load
  useEffect(() => {
    loadBooks();
  }, []);

  // Load books based on category
  const loadBooks = async (category = 'All', reset = true) => {
    setIsLoading(true);
    try {
      let results;
      if (category === 'All') {
        results = await getTrendingBooks(24);
      } else {
        results = await getBooksByCategory(category, 24);
      }
      
      if (reset) {
        setBooks(results);
        setFilteredBooks(results);
        setPage(1);
      } else {
        setBooks(prev => [...prev, ...results]);
        setFilteredBooks(prev => [...prev, ...results]);
      }
      setHasMore(results.length === 24);
    } catch (error) {
      console.error('Error loading books:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search
  const performSearch = useCallback(async (query) => {
    setIsLoading(true);
    
    if (!query.trim()) {
      // Reset to category view
      await loadBooks(selectedCategory, true);
      setIsLoading(false);
      return;
    }

    try {
      console.log('Searching for:', query);
      const results = await searchBooks(query, 24);
      console.log('Search results:', results.length);
      setBooks(results);
      setFilteredBooks(results);
      setHasMore(false);
    } catch (error) {
      console.error('Search error:', error);
      setBooks([]);
      setFilteredBooks([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory]);

  // Debounced search - only trigger when user stops typing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim() !== '') {
        performSearch(searchQuery);
      }
    }, 600);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, performSearch]);

  // Handle category change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSearchQuery('');
    loadBooks(category, true);
  };

  // Sort books
  useEffect(() => {
    let sorted = [...books];
    switch (sortBy) {
      case 'rating':
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'title':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'newest':
        sorted.sort((a, b) => (b.publishYear || 0) - (a.publishYear || 0));
        break;
      default:
        // Keep original order for popular
        break;
    }
    setFilteredBooks(sorted);
  }, [sortBy, books]);

  // Load more books
  const loadMore = async () => {
    if (isLoading || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    await loadBooks(selectedCategory, false);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSortBy('popular');
    loadBooks('All', true);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Hero Section with Search */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(220,38,38,0.15),transparent_50%)]"></div>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/5 rounded-full blur-[120px]"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-800/5 rounded-full blur-[120px]"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <h1 className="section-title text-5xl md:text-6xl lg:text-7xl mb-6">
            Discover <span className="text-gradient-shine">Books</span>
          </h1>
          <p className="text-neutral-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Explore thousands of classic books from Project Gutenberg. 
            Search by title, author, or browse by category.
          </p>

          {/* Main Search Bar */}
          <div className="max-w-3xl mx-auto">
            <form 
              onSubmit={(e) => { e.preventDefault(); performSearch(searchQuery); }}
              className="relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-red-800 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
              <div className="relative flex items-center bg-[#111111] rounded-2xl border border-red-500/20 shadow-2xl">
                <input
                  type="text"
                  placeholder="Search books by title, author, or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-neutral-600 text-lg px-6 py-5"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(''); performSearch(''); }}
                    className="mr-2 p-2 hover:bg-red-500/10 rounded-full transition-colors"
                  >
                    <X size={20} className="text-neutral-500" />
                  </button>
                )}
                <button
                  type="submit"
                  className="mr-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-red-500/25"
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="mr-2 p-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl transition-colors"
                >
                  <Filter size={20} className="text-red-500" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Filters & Categories Bar */}
      <section className="sticky top-0 z-40 bg-[var(--bg-primary)]/95 backdrop-blur-xl border-b border-red-500/10 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Categories */}
            <div className="flex-1 overflow-x-auto no-scrollbar">
              <div className="flex gap-2 pb-2 lg:pb-0">
                {CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 border ${
                      selectedCategory === category
                        ? 'bg-gradient-to-r from-red-600 to-red-700 border-red-500 text-white shadow-lg shadow-red-500/25'
                        : 'bg-[#111111] border-red-500/20 text-neutral-400 hover:border-red-500/50 hover:text-white'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort & View Options */}
            <div className="flex items-center gap-3">
              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-[#111111] border border-red-500/20 text-white px-4 py-2.5 pr-10 rounded-xl text-sm font-medium focus:outline-none focus:border-red-500/50 cursor-pointer"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 pointer-events-none" size={16} />
              </div>

              {/* View Mode Toggle */}
              <div className="flex bg-[#111111] border border-red-500/20 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-red-500/20 text-red-500' 
                      : 'text-neutral-500 hover:text-white'
                  }`}
                >
                  <Grid3X3 size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-red-500/20 text-red-500' 
                      : 'text-neutral-500 hover:text-white'
                  }`}
                >
                  <List size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {(selectedCategory !== 'All' || searchQuery || sortBy !== 'popular') && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-red-500/10">
              <span className="text-neutral-500 text-sm">Active filters:</span>
              {selectedCategory !== 'All' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-500/10 border border-red-500/30 rounded-full text-sm text-red-400">
                  {selectedCategory}
                  <button onClick={() => handleCategoryChange('All')} className="hover:text-white">
                    <X size={14} />
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-500/10 border border-red-500/30 rounded-full text-sm text-red-400">
                  &quot;{searchQuery}&quot;
                  <button onClick={() => { setSearchQuery(''); performSearch(''); }} className="hover:text-white">
                    <X size={14} />
                  </button>
                </span>
              )}
              {sortBy !== 'popular' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-500/10 border border-red-500/30 rounded-full text-sm text-red-400">
                  {SORT_OPTIONS.find(o => o.value === sortBy)?.label}
                  <button onClick={() => setSortBy('popular')} className="hover:text-white">
                    <X size={14} />
                  </button>
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-sm text-neutral-500 hover:text-red-400 ml-2 underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Books Grid/List */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Results Count */}
          <div className="flex items-center justify-between mb-8">
            <p className="text-neutral-400">
              Showing <span className="text-white font-semibold">{filteredBooks.length}</span> books
              {selectedCategory !== 'All' && (
                <span> in <span className="text-red-400">{selectedCategory}</span></span>
              )}
            </p>
          </div>

          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {isLoading && books.length === 0 ? (
                // Skeleton loading
                Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="bg-[#111111] rounded-2xl overflow-hidden border border-white/5">
                    <div className="aspect-[2/3] skeleton"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-3 w-16 skeleton rounded-full"></div>
                      <div className="h-4 w-full skeleton rounded"></div>
                      <div className="h-3 w-2/3 skeleton rounded"></div>
                    </div>
                  </div>
                ))
              ) : filteredBooks.length > 0 ? (
                filteredBooks.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-24">
                  <BookOpen size={80} className="text-red-900/30 mb-6" />
                  <h3 className="text-2xl font-bold text-white mb-3">No books found</h3>
                  <p className="text-neutral-500 text-center max-w-md">
                    Try adjusting your search or category filter to find what you&apos;re looking for.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="btn btn-primary mt-8"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="space-y-4">
              {isLoading && books.length === 0 ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-[#111111] rounded-2xl p-4 border border-white/5 flex gap-4">
                    <div className="w-24 h-36 skeleton rounded-lg flex-shrink-0"></div>
                    <div className="flex-1 space-y-3 py-2">
                      <div className="h-4 w-32 skeleton rounded"></div>
                      <div className="h-6 w-2/3 skeleton rounded"></div>
                      <div className="h-4 w-1/2 skeleton rounded"></div>
                    </div>
                  </div>
                ))
              ) : filteredBooks.length > 0 ? (
                filteredBooks.map((book) => (
                  <div
                    key={book.id}
                    className="group bg-[#111111] rounded-2xl p-4 border border-white/5 hover:border-red-500/30 transition-all duration-300 flex gap-6"
                  >
                    <div className="w-24 h-36 flex-shrink-0 rounded-lg overflow-hidden bg-[#0a0a0a]">
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex-1 py-2">
                      <span className="text-xs font-bold uppercase tracking-widest text-red-400 bg-red-500/10 px-3 py-1 rounded-full">
                        {book.category}
                      </span>
                      <h3 className="text-xl font-bold text-white mt-3 group-hover:text-red-400 transition-colors">
                        {book.title}
                      </h3>
                      <p className="text-neutral-400 mt-1">by <span className="text-neutral-300">{book.author}</span></p>
                      <p className="text-neutral-500 text-sm mt-3 line-clamp-2">{book.description}</p>
                      <div className="flex items-center gap-4 mt-4">
                        <span className="flex items-center gap-1 text-red-400">
                          <span className="text-lg font-bold">{book.rating}</span>
                          <span className="text-neutral-500 text-sm">/5</span>
                        </span>
                        <span className="text-neutral-600">|</span>
                        <span className="text-neutral-400 text-sm">{book.pages} pages</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-24">
                  <BookOpen size={80} className="text-red-900/30 mb-6" />
                  <h3 className="text-2xl font-bold text-white mb-3">No books found</h3>
                  <p className="text-neutral-500 text-center max-w-md">
                    Try adjusting your search or category filter to find what you&apos;re looking for.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="btn btn-primary mt-8"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Load More Button */}
          {hasMore && !isLoading && filteredBooks.length > 0 && (
            <div className="flex justify-center mt-12">
              <button
                onClick={loadMore}
                className="btn btn-outline px-12"
              >
                Load More Books
              </button>
            </div>
          )}

          {/* Loading Indicator */}
          {isLoading && books.length > 0 && (
            <div className="flex justify-center mt-8">
              <div className="w-8 h-8 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Discover;
