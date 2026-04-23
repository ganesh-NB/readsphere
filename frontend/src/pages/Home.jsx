import React, { useState, useEffect, useRef } from 'react';
import { Search, BookOpen, TrendingUp, Sparkles, ChevronRight, ChevronLeft, Star, Clock, ArrowRight, Library, BookMarked, Users, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import BookCard from '../components/BookCard';
import { searchBooks, getBooksByCategory, getTrendingBooks, getNewReleases, getRecommendedBooks, getBooksWithPreview } from '../services/api';

const CATEGORIES = ['All', 'Fiction', 'Sci-Fi', 'Thriller', 'Self-Help', 'Classic', 'Productivity', 'Romance', 'History'];

const STATS = [
  { icon: Library, label: '50M+ Books', color: 'text-red-500' },
  { icon: Users, label: '10K+ Readers', color: 'text-red-400' },
  { icon: Zap, label: 'AI Summaries', color: 'text-red-300' },
  { icon: BookOpen, label: 'Free to Read', color: 'text-red-200' },
];

const GridSkeleton = ({ count = 10 }) => (
  Array.from({ length: count }).map((_, i) => (
    <div key={i} className="bg-[#111111] rounded-2xl overflow-hidden border border-white/5">
      <div className="aspect-[2/3] skeleton"></div>
      <div className="p-4 space-y-3">
        <div className="h-3 w-16 skeleton rounded-full"></div>
        <div className="h-4 w-full skeleton rounded"></div>
        <div className="h-3 w-2/3 skeleton rounded"></div>
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
  const [featuredBook, setFeaturedBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTrendingLoading, setIsTrendingLoading] = useState(true);
  const [isNewReleasesLoading, setIsNewReleasesLoading] = useState(true);
  const [isPreviewLoading, setIsPreviewLoading] = useState(true);
  const trendingScrollRef = useRef(null);
  const previewScrollRef = useRef(null);

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
      trendingScrollRef.current.scrollBy({
        left: direction === 'left' ? -320 : 320,
        behavior: 'smooth'
      });
    }
  };

  const scrollPreview = (direction) => {
    if (previewScrollRef.current) {
      previewScrollRef.current.scrollBy({
        left: direction === 'left' ? -320 : 320,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="w-full">
      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-[var(--bg-primary)]">
          {/* Radial gradients for depth */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,rgba(220,38,38,0.2),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(185,28,28,0.15),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(127,29,29,0.2),transparent_50%)]"></div>
          
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'linear-gradient(rgba(220,38,38,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(220,38,38,0.5) 1px, transparent 1px)',
              backgroundSize: '80px 80px'
            }}
          ></div>
          
          {/* Diagonal lines */}
          <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(220,38,38,0.3) 35px, rgba(220,38,38,0.3) 36px)'
          }}></div>
        </div>

        {/* Floating glow orbs - Red theme */}
        <div className="absolute top-1/4 left-[5%] w-96 h-96 bg-red-600/10 rounded-full blur-[100px] animate-pulse-glow"></div>
        <div className="absolute bottom-1/4 right-[5%] w-[500px] h-[500px] bg-red-800/10 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '-2s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-900/5 rounded-full blur-[150px]"></div>

        <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center max-w-5xl pt-12">
          {/* Platform badge */}
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 px-5 py-2 rounded-full text-sm font-semibold mb-10 animate-fade-up backdrop-blur-sm">
            <Sparkles size={16} className="animate-pulse" />
            <span className="uppercase tracking-widest text-xs">AI-Powered Reading Platform</span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-8 tracking-tight leading-[1.05] animate-fade-up uppercase" style={{ animationDelay: '0.1s' }}>
            Discover Your
            <br />
            <span className="text-gradient-shine">Next Great Read</span>
          </h1>

          <p className="text-lg md:text-xl text-neutral-400 mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-up font-light" style={{ animationDelay: '0.2s' }}>
            Explore millions of books, get AI-powered summaries, and find your next favorite read — all in one place.
          </p>

          {/* Search bar - Red theme */}
          <form
            className="flex flex-col sm:flex-row items-center justify-center max-w-2xl mx-auto gap-3 p-2 bg-[#111111]/90 backdrop-blur-strong rounded-2xl sm:rounded-full border border-red-500/20 shadow-2xl shadow-red-900/20 animate-fade-up"
            style={{ animationDelay: '0.3s' }}
            onSubmit={handleSearch}
          >
            <div className="flex-grow flex items-center w-full sm:w-auto px-5 py-3">
              <input
                type="text"
                placeholder="Search by title, author, or keyword..."
                className="w-full bg-transparent border-none outline-none text-white placeholder:text-neutral-600 text-base md:text-lg !py-0 !shadow-none !ring-0 focus:!bg-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary w-full sm:w-auto !px-10 !py-4 text-base rounded-xl sm:rounded-full shrink-0 uppercase tracking-wider text-sm">
              Search
            </button>
          </form>

          {/* Quick stats */}
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14 mt-14 animate-fade-up" style={{ animationDelay: '0.4s' }}>
            {STATS.map((stat) => (
              <div key={stat.label} className="flex items-center gap-3 text-neutral-400 text-sm">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <stat.icon size={18} className="text-red-500" />
                </div>
                <span className="font-medium">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--bg-primary)] to-transparent"></div>
      </section>

      {/* ===== TRENDING NOW ===== */}
      <section className="container mx-auto px-4 lg:px-8 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-900/20 border border-red-500/30 flex items-center justify-center">
                <TrendingUp className="text-red-500" size={24} />
              </div>
              <h2 className="section-title text-3xl md:text-4xl">Trending Now</h2>
            </div>
            <p className="section-subtitle ml-16">Most popular books this week</p>
          </div>
          <div className="hidden md:flex items-center gap-3 shrink-0 ml-4">
            <button onClick={() => scrollTrending('left')} className="w-12 h-12 rounded-full bg-[#111111] border border-red-500/30 flex items-center justify-center text-neutral-400 hover:text-red-500 hover:border-red-500 hover:bg-red-500/10 transition-all duration-300">
              <ChevronLeft size={24} />
            </button>
            <button onClick={() => scrollTrending('right')} className="w-12 h-12 rounded-full bg-[#111111] border border-red-500/30 flex items-center justify-center text-neutral-400 hover:text-red-500 hover:border-red-500 hover:bg-red-500/10 transition-all duration-300">
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

        <div ref={trendingScrollRef} className="flex gap-6 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4">
          {isTrendingLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-[180px] md:w-[200px] bg-[#111111] rounded-2xl overflow-hidden border border-white/5">
                  <div className="aspect-[2/3] skeleton"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-3 w-16 skeleton rounded-full"></div>
                    <div className="h-4 w-full skeleton rounded"></div>
                    <div className="h-3 w-2/3 skeleton rounded"></div>
                  </div>
                </div>
              ))
            : trendingBooks.map((book) => (
                <div key={book.id} className="flex-shrink-0 w-[180px] md:w-[200px]">
                  <BookCard book={book} />
                </div>
              ))}
        </div>
      </section>

      {/* ===== AVAILABLE TO READ (Preview Available) ===== */}
      <section className="container mx-auto px-4 lg:px-8 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600/20 to-red-800/20 border border-red-500/30 flex items-center justify-center">
                <BookOpen className="text-red-500" size={24} />
              </div>
              <h2 className="section-title text-3xl md:text-4xl">Available to Read</h2>
            </div>
            <p className="section-subtitle ml-16">Books with free preview available</p>
          </div>
          <div className="hidden md:flex items-center gap-3 shrink-0 ml-4">
            <button onClick={() => scrollPreview('left')} className="w-12 h-12 rounded-full bg-[#111111] border border-red-500/30 flex items-center justify-center text-neutral-400 hover:text-red-500 hover:border-red-500 hover:bg-red-500/10 transition-all duration-300">
              <ChevronLeft size={24} />
            </button>
            <button onClick={() => scrollPreview('right')} className="w-12 h-12 rounded-full bg-[#111111] border border-red-500/30 flex items-center justify-center text-neutral-400 hover:text-red-500 hover:border-red-500 hover:bg-red-500/10 transition-all duration-300">
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

        <div ref={previewScrollRef} className="flex gap-6 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4">
          {isPreviewLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-[180px] md:w-[200px] bg-[#111111] rounded-2xl overflow-hidden border border-white/5">
                  <div className="aspect-[2/3] skeleton"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-3 w-16 skeleton rounded-full"></div>
                    <div className="h-4 w-full skeleton rounded"></div>
                    <div className="h-3 w-2/3 skeleton rounded"></div>
                  </div>
                </div>
              ))
            : previewBooks.map((book) => (
                <div key={book.id} className="flex-shrink-0 w-[180px] md:w-[200px]">
                  <BookCard book={book} />
                </div>
              ))}
        </div>
      </section>

      {/* ===== EXPLORE ALL BOOKS CTA ===== */}
      <section className="container mx-auto px-4 lg:px-8 py-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-red-500/20 p-12 md:p-16 text-center">
          {/* Background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[150px] pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 px-5 py-2 rounded-full text-sm font-semibold mb-6">
              <BookMarked size={18} />
              <span className="uppercase tracking-widest text-xs">Browse Collection</span>
            </div>
            
            <h2 className="section-title text-4xl md:text-5xl mb-6">
              Explore All <span className="text-gradient">Categories</span>
            </h2>
            <p className="text-neutral-400 text-lg max-w-2xl mx-auto mb-10">
              Browse through our extensive collection of classic books. 
              Filter by genre, search by title or author, and find your next great read.
            </p>
            
            {/* Category Preview Pills */}
            <div className="flex flex-wrap justify-center gap-3 mb-10 max-w-3xl mx-auto">
              {CATEGORIES.slice(1, 8).map((cat) => (
                <span 
                  key={cat}
                  className="px-5 py-2.5 bg-[#1a1a1a] border border-red-500/20 rounded-xl text-neutral-400 text-sm font-medium hover:border-red-500/50 hover:text-white transition-all duration-300 cursor-pointer"
                >
                  {cat}
                </span>
              ))}
              <span className="px-5 py-2.5 text-neutral-500 text-sm">+ more</span>
            </div>
            
            <Link to="/discover" className="btn btn-primary inline-flex items-center gap-3 !px-10">
              <BookOpen size={20} />
              Explore All Books
            </Link>
          </div>
        </div>
      </section>

      {/* ===== EDITOR'S PICK ===== */}
      {featuredBook && (
        <section className="container mx-auto px-4 lg:px-8 py-16">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#13192b] to-[#0f1422] border border-white/5 p-8 md:p-12">
            {/* Background glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

            <div className="flex flex-col lg:flex-row items-center gap-10 relative z-10">
              {/* Book cover */}
              <div className="w-48 md:w-56 shrink-0">
                <div className="aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl shadow-black/40 border border-white/10 transform hover:scale-105 transition-transform duration-500">
                  <img src={featuredBook.coverImage} alt={featuredBook.title} className="w-full h-full object-cover" />
                </div>
              </div>

              {/* Book details */}
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                  <Star size={12} className="fill-orange-400" />
                  Editor's Pick
                </div>
                <h3 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">{featuredBook.title}</h3>
                <p className="text-slate-400 mb-2">by <span className="text-slate-200">{featuredBook.author}</span></p>
                <div className="flex items-center justify-center lg:justify-start gap-4 mb-5 text-sm text-slate-400">
                  <span className="flex items-center gap-1">
                    <Star size={14} className="text-orange-400 fill-orange-400" />
                    {typeof featuredBook.rating === 'number' ? featuredBook.rating.toFixed(1) : featuredBook.rating}
                  </span>
                  {featuredBook.pages > 0 && <span>{featuredBook.pages} pages</span>}
                  <span>{featuredBook.category}</span>
                </div>
                <p className="text-slate-400 leading-relaxed mb-8 max-w-2xl line-clamp-3">{featuredBook.description}</p>
                <Link to={`/book/${featuredBook.id}`} className="btn btn-primary !px-8">
                  Start Reading <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ===== NEW RELEASES ===== */}
      <section className="container mx-auto px-4 lg:px-8 py-16">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Clock className="text-orange-500" size={18} />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">New Releases</h2>
          </div>
          <p className="text-slate-400 text-sm md:text-base ml-11">Recently published books you might enjoy</p>
        </div>

        {isNewReleasesLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 gap-y-8">
            <GridSkeleton count={8} />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 gap-y-8">
            {newReleases.map(book => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </section>

      {/* ===== AI FEATURES CTA ===== */}
      <section className="container mx-auto px-4 lg:px-8 py-16 pb-24">
        <div className="glass-panel p-8 md:p-12 lg:p-16 border border-orange-500/20 rounded-3xl relative overflow-hidden bg-gradient-to-br from-[#13192b] to-[#0f1422]">
          {/* Background glow */}
          <div className="absolute top-0 right-0 -mt-32 -mr-32 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -mb-32 -ml-32 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col lg:flex-row items-center gap-12 relative z-10">
            <div className="lg:w-1/2 text-center lg:text-left">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 tracking-tight leading-tight">
                Experience <span className="text-gradient">AI-Powered</span>
                <br className="hidden lg:block" /> Reading
              </h2>
              <p className="text-base md:text-lg text-slate-400 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Get instant chapter summaries, key insights extraction, and personalized recommendations powered by artificial intelligence.
              </p>

              <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-8">
                {['Smart Summaries', 'Key Insights', 'Personalized Picks', 'Reading Analytics'].map(feature => (
                  <span key={feature} className="px-4 py-2 rounded-full bg-[#0b0f19] border border-white/5 text-sm text-slate-300">
                    {feature}
                  </span>
                ))}
              </div>

              <Link to="/register" className="btn btn-primary !px-8">
                Get Started Free <ArrowRight size={18} />
              </Link>
            </div>

            <div className="lg:w-1/2 relative w-full flex justify-center">
              <div className="relative w-full max-w-sm aspect-square flex items-center justify-center">
                <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-orange-600 to-orange-400 shadow-2xl shadow-orange-500/30 flex items-center justify-center z-20">
                  <Sparkles className="text-white" size={40} />
                </div>

                <div className="absolute top-[10%] left-[5%] glass-panel px-5 py-3 rounded-xl border border-white/10 animate-float" style={{ animationDelay: '0s' }}>
                  <span className="font-medium text-sm text-slate-200 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span>
                    Smart Summaries
                  </span>
                </div>
                <div className="absolute bottom-[15%] right-[0%] glass-panel px-5 py-3 rounded-xl border border-orange-500/30 bg-orange-500/5 animate-float" style={{ animationDelay: '-2s' }}>
                  <span className="font-bold text-sm text-gradient flex items-center gap-2">Personalized Picks</span>
                </div>
                <div className="absolute top-[60%] left-[-5%] glass-panel px-5 py-3 rounded-xl border border-white/10 animate-float" style={{ animationDelay: '-4s' }}>
                  <span className="font-medium text-sm text-slate-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400 inline-block"></span>
                    Key Insights
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
