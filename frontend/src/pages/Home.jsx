import React, { useState, useEffect, useRef } from 'react';
import { Search, BookOpen, TrendingUp, Sparkles, ChevronRight, ChevronLeft, Star, Clock, ArrowRight, Library, BookMarked, Users, Zap, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import BookCard from '../components/BookCard';
import { searchBooks, getBooksByCategory, getTrendingBooks, getNewReleases, getRecommendedBooks, getBooksWithPreview, getCommunityBooks } from '../services/api';

const CATEGORIES = ['All', 'Fiction', 'Sci-Fi', 'Thriller', 'Self-Help', 'Classic', 'Productivity', 'Romance', 'History'];

const STATS = [
  { icon: Library,  label: '50M+ Books'   },
  { icon: Users,    label: '10K+ Readers' },
  { icon: Zap,      label: 'AI Summaries' },
  { icon: BookOpen, label: 'Free to Read' },
];

const GridSkeleton = ({ count = 10 }) => (
  Array.from({ length: count }).map((_, i) => (
    <div key={i} className="bg-surface rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
      <div className="aspect-[2/3] skeleton" />
      <div className="p-4 space-y-2">
        <div className="h-3 w-16 skeleton rounded-full" />
        <div className="h-4 w-full skeleton rounded" />
        <div className="h-3 w-2/3 skeleton rounded" />
      </div>
    </div>
  ))
);

const Home = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [books, setBooks] = useState([]);
  const [trendingBooks, setTrendingBooks] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [previewBooks, setPreviewBooks] = useState([]);
  const [communityBooks, setCommunityBooks] = useState([]);
  const [featuredBook, setFeaturedBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTrendingLoading, setIsTrendingLoading] = useState(true);
  const [isNewReleasesLoading, setIsNewReleasesLoading] = useState(true);
  const [isPreviewLoading, setIsPreviewLoading] = useState(true);
  const [isCommunityLoading, setIsCommunityLoading] = useState(true);
  const trendingScrollRef = useRef(null);
  const previewScrollRef = useRef(null);
  const communityScrollRef = useRef(null);

  // Fetch trending, new releases, and featured on mount
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const results = await getTrendingBooks(10);
        setTrendingBooks(results);
      } catch (error) {
        console.error("Failed to fetch trending:", error);
      } finally {
        setIsTrendingLoading(false);
      }
    };

    const fetchNewReleases = async () => {
      try {
        const results = await getNewReleases(8);
        setNewReleases(results);
      } catch (error) {
        console.error("Failed to fetch new releases:", error);
      } finally {
        setIsNewReleasesLoading(false);
      }
    };

    const fetchFeatured = async () => {
      try {
        const results = await getRecommendedBooks(1);
        if (results.length > 0) setFeaturedBook(results[0]);
      } catch (error) {
        console.error("Failed to fetch featured:", error);
      }
    };

    const fetchPreviewBooks = async () => {
      try {
        const results = await getBooksWithPreview(10);
        setPreviewBooks(results);
      } catch (error) {
        console.error("Failed to fetch preview books:", error);
      } finally {
        setIsPreviewLoading(false);
      }
    };

    fetchTrending();
    fetchNewReleases();
    fetchFeatured();
    fetchPreviewBooks();

    // Fetch community books from backend
    getCommunityBooks(12).then((results) => {
      setCommunityBooks(results);
      setIsCommunityLoading(false);
    }).catch(() => setIsCommunityLoading(false));
  }, []);

  // Fetch books when category changes
  useEffect(() => {
    const fetchBooks = async () => {
      setIsLoading(true);
      try {
        const results = await getBooksByCategory(activeCategory);
        setBooks(results);
      } catch (error) {
        console.error("Failed to fetch books:", error);
        setBooks([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (!searchQuery) {
      fetchBooks();
    }
  }, [activeCategory]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    try {
      const results = await searchBooks(searchQuery);
      setBooks(results);
    } catch (error) {
      console.error("Search failed:", error);
      setBooks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollTrending = (direction) => {
    if (trendingScrollRef.current) {
      trendingScrollRef.current.scrollBy({ left: direction === 'left' ? -320 : 320, behavior: 'smooth' });
    }
  };

  const scrollPreview = (direction) => {
    if (previewScrollRef.current) {
      previewScrollRef.current.scrollBy({ left: direction === 'left' ? -320 : 320, behavior: 'smooth' });
    }
  };

  const scrollCommunity = (direction) => {
    if (communityScrollRef.current) {
      communityScrollRef.current.scrollBy({ left: direction === 'left' ? -320 : 320, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full">
      {/* ===== HERO ===== */}
      <section className="relative min-h-[88vh] flex items-center justify-center overflow-hidden"
        style={{ background: 'var(--bg-primary)' }}>

        {/* Subtle radial glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, var(--accent-dim), transparent 70%)' }} />

        <div className="relative z-10 max-w-4xl mx-auto px-4 lg:px-8 text-center pt-16">
          {/* Badge */}
          <div className="badge mb-8 animate-fade-up">
            <Sparkles size={12} />
            AI-Powered Reading Platform
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black mb-6 tracking-tight leading-[1.05] animate-fade-up"
            style={{ animationDelay: '0.1s', color: 'var(--text-primary)' }}>
            Discover Your<br />
            <span className="text-gradient-shine">Next Great Read</span>
          </h1>

          <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-up"
            style={{ animationDelay: '0.2s', color: 'var(--text-secondary)' }}>
            Explore millions of books, get AI-powered summaries, and find your next favourite read — all in one place.
          </p>

          {/* Search */}
          <form onSubmit={handleSearch}
            className="flex flex-col sm:flex-row items-center max-w-xl mx-auto gap-2 p-1.5 rounded-xl animate-fade-up"
            style={{ animationDelay: '0.3s', background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
            <div className="flex-1 flex items-center w-full px-3">
              <Search size={16} style={{ color: 'var(--text-muted)' }} className="shrink-0 mr-2" />
              <input
                type="text"
                placeholder="Search by title, author, or keyword…"
                className="w-full bg-transparent outline-none text-sm py-2"
                style={{ color: 'var(--text-primary)' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary w-full sm:w-auto !px-6 !py-2.5 !text-sm shrink-0">
              Search
            </button>
          </form>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mt-12 animate-fade-up"
            style={{ animationDelay: '0.4s' }}>
            {STATS.map((stat) => (
              <div key={stat.label} className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-border)' }}>
                  <stat.icon size={15} style={{ color: 'var(--accent-light)' }} />
                </div>
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
          style={{ background: 'linear-gradient(to top, var(--bg-primary), transparent)' }} />
      </section>

      {/* ===== TRENDING NOW ===== */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <TrendingUp size={20} style={{ color: 'var(--accent-light)' }} />
              <h2 className="section-title text-2xl md:text-3xl">Trending Now</h2>
            </div>
            <p className="section-subtitle text-sm ml-8">Most popular books this week</p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <button onClick={() => scrollTrending('left')} className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => scrollTrending('right')} className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        <div ref={trendingScrollRef} className="flex gap-5 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4">
          {isTrendingLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-[160px] md:w-[180px] rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
                  <div className="aspect-[2/3] skeleton" /><div className="p-3 space-y-2"><div className="h-3 w-12 skeleton rounded" /><div className="h-3 w-full skeleton rounded" /></div>
                </div>))
            : trendingBooks.map((book) => (
                <div key={book.id} className="flex-shrink-0 w-[160px] md:w-[180px]"><BookCard book={book} /></div>
              ))}
        </div>
      </section>

      {/* ===== AVAILABLE TO READ ===== */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <BookOpen size={20} style={{ color: 'var(--accent-light)' }} />
              <h2 className="section-title text-2xl md:text-3xl">Available to Read</h2>
            </div>
            <p className="section-subtitle text-sm ml-8">Books with free preview available</p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <button onClick={() => scrollPreview('left')} className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => scrollPreview('right')} className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        <div ref={previewScrollRef} className="flex gap-5 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4">
          {isPreviewLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-[160px] md:w-[180px] rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
                  <div className="aspect-[2/3] skeleton" /><div className="p-3 space-y-2"><div className="h-3 w-12 skeleton rounded" /><div className="h-3 w-full skeleton rounded" /></div>
                </div>))
            : previewBooks.map((book) => (
                <div key={book.id} className="flex-shrink-0 w-[160px] md:w-[180px]"><BookCard book={book} /></div>
              ))}
        </div>
      </section>

      {/* ===== EXPLORE CTA ===== */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-16">
        <div className="relative overflow-hidden rounded-2xl p-10 md:p-14 text-center"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, var(--accent-dim), transparent 70%)' }} />
          <div className="relative z-10">
            <div className="badge mx-auto mb-5"><BookMarked size={12} /> Browse Collection</div>
            <h2 className="section-title text-3xl md:text-4xl mb-4">
              Explore All <span className="text-gradient">Categories</span>
            </h2>
            <p className="section-subtitle max-w-xl mx-auto mb-8 text-sm">
              Browse our extensive collection of classic books. Filter by genre, search by title or author.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-8 max-w-2xl mx-auto">
              {CATEGORIES.slice(1, 8).map((cat) => (
                <span key={cat} className="px-4 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200"
                  style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
                  {cat}
                </span>
              ))}
            </div>
            <Link to="/discover" className="btn btn-primary inline-flex items-center gap-2">
              <BookOpen size={16} /> Explore All Books
            </Link>
          </div>
        </div>
      </section>

      {/* ===== EDITOR'S PICK ===== */}
      {featuredBook && (
        <section className="max-w-7xl mx-auto px-4 lg:px-8 py-16">
          <div className="relative overflow-hidden rounded-2xl p-8 md:p-10"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <div className="flex flex-col lg:flex-row items-center gap-8 relative z-10">
              <div className="w-40 md:w-48 shrink-0">
                <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-2xl" style={{ border: '1px solid var(--border-subtle)' }}>
                  <img src={featuredBook.coverImage} alt={featuredBook.title} className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="flex-1 text-center lg:text-left">
                <div className="badge mb-4 inline-flex"><Star size={11} className="fill-current" /> Editor's Pick</div>
                <h3 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight" style={{ color: 'var(--text-primary)' }}>{featuredBook.title}</h3>
                <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>by <span style={{ color: 'var(--text-primary)' }}>{featuredBook.author}</span></p>
                <div className="flex items-center justify-center lg:justify-start gap-4 mb-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                  <span className="flex items-center gap-1"><Star size={13} className="fill-current" style={{ color: 'var(--accent-light)' }} />{typeof featuredBook.rating === 'number' ? featuredBook.rating.toFixed(1) : featuredBook.rating}</span>
                  {featuredBook.pages > 0 && <span>{featuredBook.pages} pages</span>}
                  <span>{featuredBook.category}</span>
                </div>
                <p className="text-sm leading-relaxed mb-6 max-w-xl line-clamp-3" style={{ color: 'var(--text-secondary)' }}>{featuredBook.description}</p>
                <Link to={`/book/${featuredBook.id}`} className="btn btn-primary inline-flex items-center gap-2">
                  Start Reading <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ===== NEW RELEASES ===== */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-16">
        <div className="flex items-center gap-3 mb-6">
          <Clock size={18} style={{ color: 'var(--accent-light)' }} />
          <h2 className="section-title text-2xl md:text-3xl">New Releases</h2>
        </div>
        <p className="section-subtitle text-sm mb-8 ml-7">Recently published books you might enjoy</p>
        {isNewReleasesLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"><GridSkeleton count={8} /></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {newReleases.map(book => <BookCard key={book.id} book={book} />)}
          </div>
        )}
      </section>

      {/* ===== COMMUNITY BOOKS ===== */}
      {(isCommunityLoading || communityBooks.length > 0) && (
        <section className="max-w-7xl mx-auto px-4 lg:px-8 py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Upload size={18} style={{ color: 'var(--accent-light)' }} />
                <h2 className="section-title text-2xl md:text-3xl">Community Books</h2>
              </div>
              <p className="section-subtitle text-sm ml-8">Books shared by our readers &amp; curated by admins</p>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <button onClick={() => scrollCommunity('left')} className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
                <ChevronLeft size={18} />
              </button>
              <button onClick={() => scrollCommunity('right')} className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
          <div ref={communityScrollRef} className="flex gap-5 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4">
            {isCommunityLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-[160px] md:w-[180px] rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
                    <div className="aspect-[2/3] skeleton" /><div className="p-3 space-y-2"><div className="h-3 w-12 skeleton rounded" /><div className="h-3 w-full skeleton rounded" /></div>
                  </div>))
              : communityBooks.map((book) => (
                  <div key={book._id || book.id} className="flex-shrink-0 w-[160px] md:w-[180px]">
                    <BookCard book={book} />
                  </div>
                ))
            }
          </div>
        </section>
      )}

      {/* ===== AI FEATURES CTA ===== */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-16 pb-24">
        <div className="relative overflow-hidden rounded-2xl p-10 md:p-14"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 50% 60% at 80% 50%, var(--accent-dim), transparent 70%)' }} />
          <div className="flex flex-col lg:flex-row items-center gap-10 relative z-10">
            <div className="lg:w-1/2 text-center lg:text-left">
              <div className="badge mb-5 inline-flex"><Sparkles size={12} /> AI-Powered</div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Experience <span className="text-gradient">AI-Powered</span> Reading
              </h2>
              <p className="text-sm md:text-base mb-6 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Get instant chapter summaries, key insights extraction, and personalised recommendations powered by artificial intelligence.
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-7">
                {['Smart Summaries', 'Key Insights', 'Personalised Picks', 'Reading Analytics'].map(f => (
                  <span key={f} className="px-3 py-1.5 rounded-lg text-xs font-medium"
                    style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
                    {f}
                  </span>
                ))}
              </div>
              <Link to="/register" className="btn btn-primary inline-flex items-center gap-2">
                Get Started Free <ArrowRight size={15} />
              </Link>
            </div>
            <div className="lg:w-1/2 flex justify-center">
              <div className="relative w-64 h-64 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full flex items-center justify-center z-20 shadow-2xl"
                  style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-light))', boxShadow: '0 0 60px var(--accent-glow)' }}>
                  <Sparkles className="text-white" size={36} />
                </div>
                {[
                  { label: 'Smart Summaries', delay: '0s',  pos: 'top-4 left-0' },
                  { label: 'Personalised Picks', delay: '-2s', pos: 'bottom-8 right-0' },
                  { label: 'Key Insights', delay: '-4s', pos: 'top-1/2 left-0 -translate-y-1/2' },
                ].map(({ label, delay, pos }) => (
                  <div key={label} className={`absolute ${pos} animate-float px-3 py-2 rounded-lg text-xs font-medium shadow-lg`}
                    style={{ animationDelay: delay, background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
