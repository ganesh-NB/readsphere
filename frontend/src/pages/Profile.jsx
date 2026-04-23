import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, Heart, Bookmark, Clock, BookOpen, Upload, 
  Settings, LogOut, Star, AlertCircle, X, CheckCircle
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('favorites');
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [readingHistory, setReadingHistory] = useState([]);
  const [myUploads, setMyUploads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/api/users/profile`, { headers });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        setFavorites(data.favorites || []);
        setBookmarks(data.bookmarks || []);
        setReadingHistory(data.readingHistory || []);
      }
    } catch (error) {
      setError('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMyUploads = async () => {
    try {
      const res = await fetch(`${API_URL}/api/uploads/my-uploads`, { headers });
      if (res.ok) {
        const data = await res.json();
        setMyUploads(data);
      }
    } catch (error) {
      console.error('Error fetching uploads:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'uploads') {
      fetchMyUploads();
    }
  }, [activeTab]);

  const removeFavorite = async (bookId) => {
    try {
      const res = await fetch(`${API_URL}/api/users/favorites/${bookId}`, {
        method: 'DELETE',
        headers
      });
      if (res.ok) {
        setFavorites(favorites.filter(b => b._id !== bookId));
        setSuccess('Removed from favorites');
      }
    } catch (error) {
      setError('Failed to remove favorite');
    }
  };

  const removeBookmark = async (bookId) => {
    try {
      const res = await fetch(`${API_URL}/api/users/bookmarks/${bookId}`, {
        method: 'DELETE',
        headers
      });
      if (res.ok) {
        setBookmarks(bookmarks.filter(b => b.book._id !== bookId));
        setSuccess('Bookmark removed');
      }
    } catch (error) {
      setError('Failed to remove bookmark');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const tabs = [
    { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
    { id: 'history', label: 'Reading History', icon: Clock },
    { id: 'uploads', label: 'My Uploads', icon: Upload },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-12 mt-20 min-h-[85vh]">
      {/* Alerts */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400">
          <AlertCircle size={20} /> {error}
          <button onClick={() => setError('')} className="ml-auto"><X size={16} /></button>
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3 text-green-400">
          <CheckCircle size={20} /> {success}
          <button onClick={() => setSuccess('')} className="ml-auto"><X size={16} /></button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Profile Sidebar */}
        <div className="w-full lg:w-72 flex-shrink-0">
          <div className="bg-[#111111] rounded-2xl border border-red-500/10 p-6 mb-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-2xl font-bold text-white mb-4">
                {user?.displayName?.charAt(0) || user?.username?.charAt(0) || 'U'}
              </div>
              <h2 className="text-xl font-bold text-white">{user?.displayName || user?.username}</h2>
              <p className="text-neutral-500 text-sm mt-1">{user?.email}</p>
              <span className="mt-3 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-xs font-semibold text-red-400 uppercase">
                {user?.role}
              </span>
            </div>

            <div className="mt-6 pt-6 border-t border-red-500/10 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Favorites</span>
                <span className="text-white font-semibold">{favorites.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Bookmarks</span>
                <span className="text-white font-semibold">{bookmarks.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Books Read</span>
                <span className="text-white font-semibold">{readingHistory.length}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#111111] rounded-2xl border border-red-500/10 overflow-hidden">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-6 py-4 text-red-400 hover:bg-red-500/5 transition-colors"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-grow">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                    : 'bg-[#111111] text-neutral-400 border border-red-500/10 hover:border-red-500/30'
                }`}
              >
                <tab.icon size={16} /> {tab.label}
              </button>
            ))}
          </div>

          {/* Favorites */}
          {activeTab === 'favorites' && (
            <div className="bg-[#111111] rounded-2xl border border-red-500/10 p-6">
              <h2 className="text-xl font-bold text-white mb-6">My Favorites</h2>
              {favorites.length === 0 ? (
                <div className="text-center py-12">
                  <Heart size={48} className="text-red-900/30 mx-auto mb-4" />
                  <p className="text-neutral-500">No favorites yet. Start adding books you love!</p>
                  <Link to="/discover" className="btn btn-primary mt-4 inline-block">Explore Books</Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favorites.map(book => (
                    <div key={book._id} className="flex gap-4 p-4 bg-[#0a0a0a] rounded-xl border border-red-500/10 hover:border-red-500/30 transition-all group">
                      <img src={book.coverImage} alt={book.title} className="w-16 h-24 object-cover rounded-lg" />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold truncate">{book.title}</h3>
                        <p className="text-neutral-500 text-sm">{book.author}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Link to={`/read/${book._id}`} className="text-xs text-red-400 hover:text-red-300">Read Now</Link>
                          <button onClick={() => removeFavorite(book._id)} className="text-xs text-neutral-600 hover:text-red-400">Remove</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Bookmarks */}
          {activeTab === 'bookmarks' && (
            <div className="bg-[#111111] rounded-2xl border border-red-500/10 p-6">
              <h2 className="text-xl font-bold text-white mb-6">My Bookmarks</h2>
              {bookmarks.length === 0 ? (
                <div className="text-center py-12">
                  <Bookmark size={48} className="text-red-900/30 mx-auto mb-4" />
                  <p className="text-neutral-500">No bookmarks yet. Bookmark pages while reading!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookmarks.map(item => (
                    <div key={item.book._id} className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-xl border border-red-500/10">
                      <div className="flex items-center gap-4">
                        <img src={item.book.coverImage} alt={item.book.title} className="w-12 h-16 object-cover rounded-lg" />
                        <div>
                          <h3 className="text-white font-semibold">{item.book.title}</h3>
                          <p className="text-neutral-500 text-sm">Page {item.page}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Link to={`/read/${item.book._id}`} state={{ page: item.page }} className="btn btn-primary !py-2 !px-4 !text-xs">
                          Continue
                        </Link>
                        <button onClick={() => removeBookmark(item.book._id)} className="p-2 hover:bg-red-500/10 rounded-lg text-neutral-500 hover:text-red-400">
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Reading History */}
          {activeTab === 'history' && (
            <div className="bg-[#111111] rounded-2xl border border-red-500/10 p-6">
              <h2 className="text-xl font-bold text-white mb-6">Reading History</h2>
              {readingHistory.length === 0 ? (
                <div className="text-center py-12">
                  <Clock size={48} className="text-red-900/30 mx-auto mb-4" />
                  <p className="text-neutral-500">No reading history yet. Start reading!</p>
                  <Link to="/discover" className="btn btn-primary mt-4 inline-block">Explore Books</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {readingHistory.map(item => (
                    <div key={item.book._id} className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-xl border border-red-500/10">
                      <div className="flex items-center gap-4">
                        <img src={item.book.coverImage} alt={item.book.title} className="w-12 h-16 object-cover rounded-lg" />
                        <div>
                          <h3 className="text-white font-semibold">{item.book.title}</h3>
                          <p className="text-neutral-500 text-sm">Last read page {item.lastPage}</p>
                          <p className="text-neutral-600 text-xs">{new Date(item.lastRead).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <Link to={`/read/${item.book._id}`} state={{ page: item.lastPage }} className="btn btn-primary !py-2 !px-4 !text-xs">
                        Continue
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* My Uploads */}
          {activeTab === 'uploads' && (
            <div className="bg-[#111111] rounded-2xl border border-red-500/10 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">My Uploads</h2>
                <Link to="/upload" className="btn btn-primary !py-2 !px-4 !text-sm">
                  <Upload size={16} className="mr-2 inline" /> Upload Book
                </Link>
              </div>
              {myUploads.length === 0 ? (
                <div className="text-center py-12">
                  <Upload size={48} className="text-red-900/30 mx-auto mb-4" />
                  <p className="text-neutral-500">No uploads yet. Share your books!</p>
                  <Link to="/upload" className="btn btn-primary mt-4 inline-block">Upload Book</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {myUploads.map(book => (
                    <div key={book._id} className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-xl border border-red-500/10">
                      <div>
                        <h3 className="text-white font-semibold">{book.title}</h3>
                        <p className="text-neutral-500 text-sm">{book.author}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        book.uploadStatus === 'approved' ? 'bg-green-500/10 text-green-400' :
                        book.uploadStatus === 'pending' ? 'bg-orange-500/10 text-orange-400' :
                        'bg-red-500/10 text-red-400'
                      }`}>
                        {book.uploadStatus}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
