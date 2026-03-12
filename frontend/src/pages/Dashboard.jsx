import React, { useState } from 'react';
import { BookOpen, Heart, Bookmark, Settings, LogOut } from 'lucide-react';
import BookCard from '../components/BookCard';
import './Dashboard.css';

const MOCK_FAVORITES = [
  { id: '1', title: 'The Silent Patient', author: 'Alex Michaelides', category: 'Thriller', rating: 4.5, coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800' },
  { id: '2', title: 'Atomic Habits', author: 'James Clear', category: 'Self-Help', rating: 4.9, coverImage: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=800' },
];

const MOCK_CURRENTLY_READING = [
  { id: '3', title: 'Dune', author: 'Frank Herbert', progress: 45, coverImage: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=800' }
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('reading');

  return (
    <div className="dashboard-page container">
      <div className="dashboard-layout">
        <aside className="dashboard-sidebar glass-panel">
          <div className="user-profile">
            <div className="user-avatar">JD</div>
            <h3>John Doe</h3>
            <p className="text-muted">john.doe@example.com</p>
          </div>
          
          <nav className="dashboard-nav">
            <button 
              className={`nav-item ${activeTab === 'reading' ? 'active' : ''}`}
              onClick={() => setActiveTab('reading')}
            >
              <BookOpen size={20} /> Currently Reading
            </button>
            <button 
              className={`nav-item ${activeTab === 'favorites' ? 'active' : ''}`}
              onClick={() => setActiveTab('favorites')}
            >
              <Heart size={20} /> My Favorites
            </button>
            <button 
              className={`nav-item ${activeTab === 'bookmarks' ? 'active' : ''}`}
              onClick={() => setActiveTab('bookmarks')}
            >
              <Bookmark size={20} /> Bookmarks
            </button>
            <button 
              className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <Settings size={20} /> Account Settings
            </button>
          </nav>
          
          <button className="nav-item logout-btn">
            <LogOut size={20} /> Sign Out
          </button>
        </aside>
        
        <main className="dashboard-content">
          {activeTab === 'reading' && (
            <div className="tab-section">
              <h2>Continue Reading</h2>
              <div className="reading-list">
                {MOCK_CURRENTLY_READING.map(book => (
                  <div key={book.id} className="reading-card glass-panel">
                    <img src={book.coverImage} alt={book.title} />
                    <div className="reading-info">
                      <h3>{book.title}</h3>
                      <p className="text-secondary">{book.author}</p>
                      
                      <div className="progress-container">
                        <div className="progress-header">
                          <span>Progress</span>
                          <span>{book.progress}%</span>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{width: `${book.progress}%`}}></div>
                        </div>
                      </div>
                      
                      <button className="btn btn-primary btn-sm mt-3">Resume</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className="tab-section">
              <h2>My Favorites</h2>
              <div className="books-grid-small">
                {MOCK_FAVORITES.map(book => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'bookmarks' && (
            <div className="tab-section">
              <h2>Saved Bookmarks</h2>
              <p className="text-muted mt-2">You haven't saved any highlights or bookmarks yet.</p>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="tab-section">
              <h2>Account Settings</h2>
              <div className="settings-form glass-panel mt-3">
                <p>Profile update options will go here.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
