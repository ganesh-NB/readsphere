import React, { useState, useEffect } from 'react';
import { Search, BookOpen } from 'lucide-react';
import BookCard from '../components/BookCard';
import './Home.css';

// Mock Data for UI presentation
const MOCK_BOOKS = [
  { id: '1', title: 'The Silent Patient', author: 'Alex Michaelides', category: 'Thriller', rating: 4.5, coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800' },
  { id: '2', title: 'Atomic Habits', author: 'James Clear', category: 'Self-Help', rating: 4.9, coverImage: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=800' },
  { id: '3', title: 'Dune', author: 'Frank Herbert', category: 'Sci-Fi', rating: 4.8, coverImage: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=800' },
  { id: '4', title: '1984', author: 'George Orwell', category: 'Classic', rating: 4.7, coverImage: 'https://images.unsplash.com/photo-1550399105-c4db5fb85c18?q=80&w=800' },
  { id: '5', title: 'Deep Work', author: 'Cal Newport', category: 'Productivity', rating: 4.6, coverImage: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=800' },
  { id: '6', title: 'Project Hail Mary', author: 'Andy Weir', category: 'Sci-Fi', rating: 4.8, coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800' },
];

const CATEGORIES = ['All', 'Fiction', 'Sci-Fi', 'Thriller', 'Self-Help', 'Classic', 'Productivity'];

const Home = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [books, setBooks] = useState([]);

  useEffect(() => {
    // In real app, fetch from API here. For now, filter mock data.
    let filtered = MOCK_BOOKS;
    if (activeCategory !== 'All') {
      filtered = filtered.filter(b => {
        const catName = typeof b.category === 'object' ? b.category.name : b.category;
        return catName === activeCategory;
      });
    }
    if (searchQuery) {
      filtered = filtered.filter(b => 
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        b.author.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setBooks(filtered);
  }, [activeCategory, searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is automatically handled by the useEffect on query change, 
    // but this could trigger an API redirect or fetch
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background"></div>
        <div className="container hero-container">
          <h1 className="hero-title">
            Discover Your Next <br />
            <span className="text-gradient">Great Adventure</span>
          </h1>
          <p className="hero-subtitle">
            Explore thousands of books with our AI-powered smart reader. Read online, get summaries, and find personalized recommendations.
          </p>
          
          <form className="hero-search" onSubmit={handleSearch}>
            <Search className="search-icon" size={24} />
            <input 
              type="text" 
              placeholder="Search by title, author, or keyword..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="btn btn-primary search-btn">Search</button>
          </form>
        </div>
      </section>

      {/* Categories & Catalog */}
      <section className="catalog-section container">
        <div className="section-header">
          <h2>Trending Collection</h2>
          
          <div className="category-filters">
            {CATEGORIES.map(cat => (
              <button 
                key={cat} 
                className={`category-pill ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {books.length > 0 ? (
          <div className="books-grid">
            {books.map(book => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        ) : (
          <div className="no-results">
            <BookOpen size={48} className="text-muted" />
            <h3>No books found</h3>
            <p>Try adjusting your search or category filter.</p>
          </div>
        )}
      </section>

      {/* AI Features Highlight */}
      <section className="features-section container">
        <div className="glass-panel feature-banner">
          <div className="feature-content">
            <h2>Experience <span className="text-gradient">AI-Powered</span> Reading</h2>
            <p>Don't have time to finish a 500-page book? Our AI summarizes chapters and extracts key insights for you instantly.</p>
            <button className="btn btn-outline" style={{marginTop: '1.5rem'}}>Learn More</button>
          </div>
          <div className="feature-visual">
            <div className="floating-card c1">Smart Summaries</div>
            <div className="floating-card c2 text-gradient">Personalized Picks</div>
            <div className="floating-card c3">Key Insights</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
