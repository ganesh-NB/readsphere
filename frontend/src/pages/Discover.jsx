import React, { useState, useEffect, useCallback } from 'react';
import { Search, Grid3X3, List, ChevronDown, BookOpen, X, SlidersHorizontal } from 'lucide-react';
import BookCard from '../components/BookCard';
import { searchBooks, getBooksByCategory, getTrendingBooks } from '../services/api';

const CATEGORIES = ['All','Fiction','Mystery','Romance','Sci-Fi','Horror','History','Classic','Adventure','Poetry'];
const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest',  label: 'Newest First'  },
  { value: 'rating',  label: 'Highest Rated' },
  { value: 'title',   label: 'Title A–Z'     },
];

const S = { // inline style helpers
  surface:  { background: 'var(--bg-surface)',   border: '1px solid var(--border-subtle)' },
  input:    { background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' },
  pill:     { background: 'var(--bg-surface)',   border: '1px solid var(--border-default)', color: 'var(--text-secondary)' },
  pillActive:{ background: 'var(--accent)',      border: '1px solid var(--accent)',         color: 'var(--accent-fg)' },
};

const SkeletonCard = () => (
  <div className="rounded-xl overflow-hidden" style={S.surface}>
    <div className="aspect-[2/3] skeleton" />
    <div className="p-3 space-y-2">
      <div className="h-3 w-14 skeleton rounded" />
      <div className="h-3 w-full skeleton rounded" />
      <div className="h-3 w-2/3 skeleton rounded" />
    </div>
  </div>
);

const Discover = () => {
  const [books,            setBooks]            = useState([]);
  const [filteredBooks,    setFilteredBooks]    = useState([]);
  const [isLoading,        setIsLoading]        = useState(true);
  const [searchQuery,      setSearchQuery]      = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy,           setSortBy]           = useState('popular');
  const [viewMode,         setViewMode]         = useState('grid');
  const [hasMore,          setHasMore]          = useState(true);

  const loadBooks = async (category = 'All', reset = true) => {
    setIsLoading(true);
    try {
      const results = category === 'All'
        ? await getTrendingBooks(24)
        : await getBooksByCategory(category, 24);
      if (reset) { setBooks(results); setFilteredBooks(results); }
      else        { setBooks(p => [...p, ...results]); setFilteredBooks(p => [...p, ...results]); }
      setHasMore(results.length === 24);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { loadBooks(); }, []);

  const performSearch = useCallback(async (query) => {
    if (!query.trim()) { await loadBooks(selectedCategory, true); return; }
    setIsLoading(true);
    try {
      const results = await searchBooks(query, 24);
      // results may be empty — that's fine, the empty state shows "not found"
      setBooks(results);
      setFilteredBooks(results);
      setHasMore(false);
    } catch {
      setBooks([]);
      setFilteredBooks([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (!searchQuery.trim()) return;
    const t = setTimeout(() => performSearch(searchQuery), 600);
    return () => clearTimeout(t);
  }, [searchQuery, performSearch]);

  useEffect(() => {
    let sorted = [...books];
    if (sortBy === 'rating') sorted.sort((a,b) => (b.rating||0)-(a.rating||0));
    else if (sortBy === 'title') sorted.sort((a,b) => a.title.localeCompare(b.title));
    else if (sortBy === 'newest') sorted.sort((a,b) => (b.publishYear||0)-(a.publishYear||0));
    setFilteredBooks(sorted);
  }, [sortBy, books]);

  const handleCategory = (cat) => { setSelectedCategory(cat); setSearchQuery(''); loadBooks(cat, true); };
  const clearFilters   = ()    => { setSearchQuery(''); setSelectedCategory('All'); setSortBy('popular'); loadBooks('All', true); };

  const hasFilters = selectedCategory !== 'All' || searchQuery || sortBy !== 'popular';

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>

      {/* ── Hero / Search ─────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 lg:px-8 pt-16 pb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3" style={{ color: 'var(--text-primary)' }}>
          Discover Books
        </h1>
        <p className="text-base mb-8" style={{ color: 'var(--text-secondary)' }}>
          Search thousands of classic books by title, author, or keyword.
        </p>

        <form onSubmit={(e) => { e.preventDefault(); performSearch(searchQuery); }}
          className="flex items-center gap-2 p-1.5 rounded-xl max-w-2xl mx-auto"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
          <div className="flex-1 flex items-center px-3 gap-2">
            <Search size={15} style={{ color: 'var(--text-muted)' }} className="shrink-0" />
            <input
              type="text" value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search books…"
              className="w-full bg-transparent outline-none text-sm py-2"
              style={{ color: 'var(--text-primary)' }}
            />
            {searchQuery && (
              <button type="button" onClick={() => { setSearchQuery(''); performSearch(''); }}
                style={{ color: 'var(--text-muted)' }}>
                <X size={14} />
              </button>
            )}
          </div>
          <button type="submit" className="btn btn-primary !px-5 !py-2 !text-sm shrink-0">Search</button>
        </form>
      </section>

      {/* ── Sticky filter bar ─────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 py-3 px-4 lg:px-8"
        style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-subtle)', backdropFilter: 'blur(16px)' }}>
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center gap-3">

          {/* Category pills */}
          <div className="flex-1 overflow-x-auto no-scrollbar">
            <div className="flex gap-1.5 pb-1 lg:pb-0">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => handleCategory(cat)}
                  className="flex-shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150"
                  style={selectedCategory === cat ? S.pillActive : S.pill}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Sort + view */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none text-xs font-medium pl-3 pr-8 py-2 rounded-lg outline-none cursor-pointer"
                style={S.input}>
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--text-muted)' }} />
            </div>

            <div className="flex rounded-lg p-0.5" style={S.surface}>
              {[['grid', Grid3X3], ['list', List]].map(([mode, Icon]) => (
                <button key={mode} onClick={() => setViewMode(mode)}
                  className="p-1.5 rounded-md transition-colors"
                  style={{ background: viewMode === mode ? 'var(--accent)' : 'transparent', color: viewMode === mode ? 'var(--accent-fg)' : 'var(--text-muted)' }}>
                  <Icon size={15} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Active filter chips */}
        {hasFilters && (
          <div className="max-w-7xl mx-auto flex items-center gap-2 mt-2 pt-2"
            style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Filters:</span>
            {selectedCategory !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs"
                style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
                {selectedCategory}
                <button onClick={() => handleCategory('All')}><X size={11} /></button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs"
                style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
                "{searchQuery}"
                <button onClick={() => { setSearchQuery(''); performSearch(''); }}><X size={11} /></button>
              </span>
            )}
            <button onClick={clearFilters} className="text-xs underline ml-1" style={{ color: 'var(--text-muted)' }}>
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* ── Books ─────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>
          Showing <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{filteredBooks.length}</span> books
          {selectedCategory !== 'All' && <> in <span style={{ color: 'var(--text-primary)' }}>{selectedCategory}</span></>}
        </p>

        {/* Grid */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {isLoading && books.length === 0
              ? Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)
              : filteredBooks.length > 0
                ? filteredBooks.map(book => <BookCard key={book.id || book._id} book={book} />)
                : (
                  <div className="col-span-full py-24 text-center">
                    <BookOpen size={48} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                    <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                      {searchQuery ? `No books found for "${searchQuery}"` : 'No books found'}
                    </h3>
                    <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                      {searchQuery ? 'Try a different search term or browse by category.' : 'Try adjusting your filters.'}
                    </p>
                    <button onClick={clearFilters} className="btn btn-outline">Clear Filters</button>
                  </div>
                )
            }
          </div>
        )}

        {/* List */}
        {viewMode === 'list' && (
          <div className="space-y-3">
            {isLoading && books.length === 0
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-xl" style={S.surface}>
                    <div className="w-16 h-24 skeleton rounded-lg shrink-0" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-3 w-24 skeleton rounded" />
                      <div className="h-4 w-2/3 skeleton rounded" />
                      <div className="h-3 w-1/2 skeleton rounded" />
                    </div>
                  </div>
                ))
              : filteredBooks.length > 0
                ? filteredBooks.map(book => (
                    <div key={book.id || book._id} className="flex gap-5 p-4 rounded-xl transition-all duration-200 group"
                      style={S.surface}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-strong)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}>
                      <div className="w-16 h-24 shrink-0 rounded-lg overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
                        <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                      <div className="flex-1 py-1 min-w-0">
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md"
                          style={{ background: 'var(--bg-surface-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }}>
                          {book.category}
                        </span>
                        <h3 className="text-sm font-semibold mt-2 truncate" style={{ color: 'var(--text-primary)' }}>{book.title}</h3>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>by {book.author}</p>
                        <p className="text-xs mt-2 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{book.description}</p>
                      </div>
                    </div>
                  ))
                : (
                  <div className="py-24 text-center">
                    <BookOpen size={48} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                    <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                      {searchQuery ? `No books found for "${searchQuery}"` : 'No books found'}
                    </h3>
                    <button onClick={clearFilters} className="btn btn-outline mt-4">Clear Filters</button>
                  </div>
                )
            }
          </div>
        )}

        {/* Load more */}
        {hasMore && !isLoading && filteredBooks.length > 0 && (
          <div className="flex justify-center mt-10">
            <button onClick={() => loadBooks(selectedCategory, false)} className="btn btn-outline !px-10">
              Load More
            </button>
          </div>
        )}

        {isLoading && books.length > 0 && (
          <div className="flex justify-center mt-8">
            <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: 'var(--border-strong)', borderTopColor: 'var(--accent)' }} />
          </div>
        )}
      </section>
    </div>
  );
};

export default Discover;
