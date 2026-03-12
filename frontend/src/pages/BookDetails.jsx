import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, BookOpen, Bookmark, Heart, ArrowLeft, Clock, Share2 } from 'lucide-react';
import './BookDetails.css';

// Mock Data for UI presentation
const MOCK_BOOK = { 
  id: '1', 
  title: 'The Silent Patient', 
  author: 'Alex Michaelides', 
  category: 'Thriller', 
  rating: 4.5, 
  pages: 336,
  publishYear: 2019,
  coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800',
  description: "Alicia Berenson's life is seemingly perfect. A famous painter married to an in-demand fashion photographer, she lives in a grand house with big windows overlooking a park in one of London's most desirable areas. One evening her husband Gabriel returns home late from a fashion shoot, and Alicia shoots him five times in the face, and then never speaks another word.",
  aiSummary: "A psychological thriller about a woman who shoots her husband and then stops speaking, and the criminal psychotherapist obsessed with uncovering her motive. The story alternates between the therapist's investigation and the woman's past diary entries.",
};

const BookDetails = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    // In real app, fetch from API by ID. Currently using mock.
    setBook(MOCK_BOOK);
  }, [id]);

  if (!book) return <div className="container" style={{paddingTop: '120px'}}><p>Loading...</p></div>;

  return (
    <div className="book-details-page container">
      <Link to="/" className="back-link">
        <ArrowLeft size={20} /> Back to Discover
      </Link>
      
      <div className="book-hero glass-panel">
        <div className="book-hero-layout">
          <div className="book-cover-container">
            <img src={book.coverImage} alt={book.title} className="book-hero-cover" />
          </div>
          
          <div className="book-hero-info">
            <div className="book-meta-top">
              <span className="book-category-badge">{book.category}</span>
              <div className="book-rating-large">
                <Star size={20} fill="#fbbf24" color="#fbbf24" />
                <span>{book.rating.toFixed(1)}</span>
              </div>
            </div>
            
            <h1 className="book-hero-title">{book.title}</h1>
            <p className="book-hero-author">by <span className="text-gradient">{book.author}</span></p>
            
            <div className="book-stats">
              <div className="stat-item">
                <BookOpen size={18} />
                <span>{book.pages} Pages</span>
              </div>
              <div className="stat-item">
                <Clock size={18} />
                <span>~6h Read</span>
              </div>
              <div className="stat-item">
                <span style={{fontWeight: '600'}}>Released:</span> {book.publishYear}
              </div>
            </div>
            
            <div className="book-actions">
              <Link to={`/read/${book.id}`} className="btn btn-primary btn-large">
                <BookOpen size={20} /> Read Book
              </Link>
              <button 
                className={`icon-btn action-btn ${isFavorite ? 'active-fav' : ''}`} 
                onClick={() => setIsFavorite(!isFavorite)}
                aria-label="Favorite"
              >
                <Heart size={24} fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
              <button 
                className={`icon-btn action-btn ${isBookmarked ? 'active-book' : ''}`} 
                onClick={() => setIsBookmarked(!isBookmarked)}
                aria-label="Bookmark"
              >
                <Bookmark size={24} fill={isBookmarked ? 'currentColor' : 'none'} />
              </button>
              <button className="icon-btn action-btn" aria-label="Share">
                <Share2 size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="book-content-split">
        <div className="book-main-content">
          <div className="content-section">
            <h2>Synopsis</h2>
            <p className="book-description">{book.description}</p>
          </div>
          
          <div className="ai-summary-card glass-panel">
            <div className="ai-badge">✨ AI Generated Summary</div>
            <h3>Quick Insights</h3>
            <p>{book.aiSummary}</p>
          </div>
        </div>
        
        <div className="book-sidebar">
          <div className="related-books-widget glass-panel">
            <h3>Similar Books</h3>
            <div className="related-list">
              <p className="text-muted">More books coming soon...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;
