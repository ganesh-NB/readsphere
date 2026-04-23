import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, BookOpen, Bookmark, Heart, ArrowLeft, Clock, Share2, AlertCircle, ExternalLink } from 'lucide-react';
import { getBookDetails, checkPreviewAvailability } from '../services/api';

const BookDetails = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [hasPreview, setHasPreview] = useState(null);
  const [checkingPreview, setCheckingPreview] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getBookDetails(id);
        if (data) {
          setBook(data);
        } else {
          setError("Book not found. It may have been removed or the ID is invalid.");
        }
      } catch (err) {
        console.error("Failed to load book:", err);
        setError("Failed to fetch book details. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchDetails();
    }
  }, [id]);

  // Check preview availability separately
  useEffect(() => {
    const checkPreview = async () => {
      if (!id) return;
      setCheckingPreview(true);
      try {
        const available = await checkPreviewAvailability(id);
        setHasPreview(available);
      } catch (err) {
        console.error("Failed to check preview:", err);
        setHasPreview(false);
      } finally {
        setCheckingPreview(false);
      }
    };

    checkPreview();
  }, [id]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 lg:px-8 mt-24 min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400">Loading book details...</p>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="container mx-auto px-4 lg:px-8 mt-24 min-h-[60vh] flex flex-col items-center justify-center">
        <div className="bg-[#13192b]/80 border border-red-500/30 p-8 rounded-3xl max-w-lg text-center shadow-xl shadow-black/20">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-100 mb-2">Oops!</h2>
          <p className="text-slate-400 mb-6">{error || "Something went wrong."}</p>
          <Link to="/" className="btn btn-primary !py-2 !px-6 text-sm rounded-full">
            Return to Discover
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full relative min-h-screen pb-20">
      {/* Background Orbs & Effects */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-[#13192b] to-transparent pointer-events-none z-0"></div>
      <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      
      <div className="container mx-auto px-4 lg:px-8 mt-24 relative z-10">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-orange-400 transition-colors mb-8 group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back to Discover
        </Link>
        
        {/* Hero Section */}
        <div className="glass-panel p-6 md:p-10 rounded-3xl border border-white/5 bg-[#13192b]/60 mb-12 shadow-2xl shadow-black/20 relative overflow-hidden">
          {/* subtle glow behind book */}
          <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-orange-500/10 rounded-full blur-[80px] pointer-events-none"></div>

          <div className="flex flex-col lg:flex-row gap-10 items-start relative z-10">
            {/* Book Cover */}
            <div className="w-full sm:w-2/3 md:w-1/2 lg:w-1/3 xl:w-1/4 mx-auto lg:mx-0 flex-shrink-0">
              <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl shadow-orange-500/20 border border-white/10 group bg-[#0b0f19]">
                <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>
              </div>
            </div>
            
            {/* Book Info */}
            <div className="flex-grow flex flex-col items-center text-center lg:items-start lg:text-left w-full">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-4">
                <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-3 py-1 rounded-full text-sm font-semibold tracking-wide uppercase">
                  {book.category}
                </span>
                <div className="flex items-center gap-1 bg-black/40 px-3 py-1 rounded-full border border-white/5 backdrop-blur-md">
                  <Star size={16} className="fill-orange-400 text-orange-400" />
                  <span className="font-bold text-slate-200">{book.rating}</span>
                </div>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-2 text-slate-50 leading-tight">{book.title}</h1>
              <p className="text-xl text-slate-400 mb-8">by <span className="text-gradient font-medium">{book.author}</span></p>
              
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 md:gap-10 mb-10 p-4 rounded-2xl bg-black/20 border border-white/5 w-full lg:w-auto">
                <div className="flex items-center gap-2 text-slate-300">
                  <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-400"><BookOpen size={20} /></div>
                  <div className="flex flex-col"><span className="text-xs text-slate-500">Length</span><span className="font-semibold">{book.pages || 'Unknown'} Pages</span></div>
                </div>
                <div className="w-px h-10 bg-white/10 hidden sm:block"></div>
                <div className="flex items-center gap-2 text-slate-300">
                  <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-400"><Clock size={20} /></div>
                  <div className="flex flex-col"><span className="text-xs text-slate-500">Est. Time</span><span className="font-semibold">{book.pages ? `~${Math.ceil((book.pages * 250) / 200 / 60)}h Read` : 'Unknown'}</span></div>
                </div>
                <div className="w-px h-10 bg-white/10 hidden sm:block"></div>
                <div className="flex items-center gap-2 text-slate-300">
                  <div className="flex flex-col"><span className="text-xs text-slate-500">Released</span><span className="font-semibold text-lg">{book.publishYear}</span></div>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mt-auto">
                {book.fileUrl ? (
                  <Link 
                    to={`/read/${book.id}`} 
                    state={{ fileUrl: book.fileUrl }}
                    className="btn btn-primary !py-4 px-8 !text-lg rounded-xl shadow-xl shadow-orange-500/20 w-full sm:w-auto flex items-center justify-center gap-3"
                  >
                    <BookOpen size={22} /> Read Book Now
                  </Link>
                ) : checkingPreview ? (
                  <button disabled className="btn btn-primary !py-4 px-8 !text-lg rounded-xl shadow-xl shadow-orange-500/20 w-full sm:w-auto flex items-center justify-center gap-3 opacity-70 cursor-wait">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Checking Preview...
                  </button>
                ) : hasPreview ? (
                  <Link to={`/read/${book.id}`} className="btn btn-primary !py-4 px-8 !text-lg rounded-xl shadow-xl shadow-orange-500/20 w-full sm:w-auto flex items-center justify-center gap-3">
                    <BookOpen size={22} /> Read Book Now
                  </Link>
                ) : (
                  <a 
                    href={`https://books.google.com/books?id=${book.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary !py-4 px-8 !text-lg rounded-xl shadow-xl shadow-orange-500/20 w-full sm:w-auto flex items-center justify-center gap-3"
                  >
                    <ExternalLink size={22} /> View on Google Books
                  </a>
                )}
                <div className="flex items-center gap-3 w-full sm:w-auto justify-center">
                  <button 
                    className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 border ${isFavorite ? 'bg-orange-500/10 border-orange-500/30 text-orange-500 rotate-6 shadow-lg shadow-orange-500/10' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'}`} 
                    onClick={() => setIsFavorite(!isFavorite)}
                    aria-label="Favorite"
                  >
                    <Heart size={24} className={isFavorite ? "fill-orange-500 scale-110 transition-transform" : "transition-transform"} />
                  </button>
                  <button 
                    className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 border ${isBookmarked ? 'bg-orange-500/10 border-orange-500/30 text-orange-500 shadow-lg shadow-orange-500/10' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'}`} 
                    onClick={() => setIsBookmarked(!isBookmarked)}
                    aria-label="Bookmark"
                  >
                    <Bookmark size={24} className={isBookmarked ? "fill-orange-500 transform translate-y-1 transition-transform" : "transition-transform"} />
                  </button>
                  <button className="w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white" aria-label="Share">
                    <Share2 size={24} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Content Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-8">
            <div className="glass-panel p-8 rounded-3xl border border-white/5 bg-[#13192b]/40">
              <h2 className="text-2xl font-bold mb-4 text-slate-100 flex items-center gap-3">
                <div className="w-2 h-8 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full"></div>
                Synopsis
              </h2>
              <p className="text-slate-300 leading-relaxed text-lg whitespace-pre-line">{book.description || 'No synopsis available for this book.'}</p>
            </div>
            
            <div className="glass-panel p-8 rounded-3xl border border-orange-500/20 bg-gradient-to-br from-[#13192b] to-orange-900/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                <span>✨</span> AI Generated Summary
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-100">Quick Insights</h3>
              <p className="text-slate-300 leading-relaxed italic border-l-2 border-orange-500/50 pl-4">{book.aiSummary}</p>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="glass-panel p-8 rounded-3xl border border-white/5 bg-[#13192b]/40 sticky top-24">
              <h3 className="text-xl font-bold mb-6 text-slate-100 flex items-center gap-3">
                <div className="w-2 h-6 bg-gradient-to-b from-slate-500 to-slate-700 rounded-full"></div>
                Similar Books
              </h3>
              <div className="p-6 rounded-2xl bg-black/20 border border-white/5 border-dashed flex flex-col items-center justify-center text-center">
                <BookOpen size={32} className="text-slate-600 mb-3" />
                <p className="text-slate-400 font-medium">More books coming soon...</p>
                <p className="text-sm text-slate-500 mt-2">Check back later for personalized recommendations.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;
