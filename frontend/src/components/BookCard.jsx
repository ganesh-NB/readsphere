import React from 'react';
import { Link } from 'react-router-dom';
import { Star, BookOpen } from 'lucide-react';
import './BookCard.css';

const BookCard = ({ book }) => {
  return (
    <div className="book-card glass-panel">
      <div className="book-cover-wrapper">
        <img 
          src={book.coverImage || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop'} 
          alt={book.title} 
          className="book-cover"
        />
        <div className="book-badges">
          {book.rating > 0 && (
            <span className="badge rating-badge">
              <Star size={14} className="star-icon" fill="currentColor" />
              {book.rating.toFixed(1)}
            </span>
          )}
        </div>
        <div className="book-hover-overlay">
          <Link to={`/book/${book._id || book.id}`} className="btn btn-primary btn-sm">
            <BookOpen size={16} /> Read Now
          </Link>
        </div>
      </div>
      
      <div className="book-info">
        <div className="book-meta">
          <span className="book-category">{book.category?.name || book.category || 'General'}</span>
        </div>
        <h3 className="book-title" title={book.title}>{book.title}</h3>
        <p className="book-author">by {book.author}</p>
      </div>
    </div>
  );
};

export default BookCard;
