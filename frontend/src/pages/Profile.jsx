import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Bookmark, Clock, Upload, LogOut, AlertCircle, X, CheckCircle, BookOpen } from 'lucide-react';
import { getFavorites, getBookmarks, getReadingHistory, removeFavorite, removeBookmark } from '../services/userLibrary';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const S = {
  card:  { background: 'var(--bg-surface)',   border: '1px solid var(--border-subtle)' },
  inner: { background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' },
};

const cover = (url) => {
  if (!url) return 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=300';
  if (url.startsWith('http')) return url;
  return `${API_URL}${url}`;
};

const statusStyle = (s) => {
  if (s === 'approved') return { background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', color: '#4ade80' };
  if (s === 'rejected') return { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' };
  return { background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' };
};

const Profile = () => {
  const [activeTab,      setActiveTab]      = useState('favorites');
  const [user,           setUser]           = useState(null);
  const [favorites,      setFavorites]      = useState([]);
  const [bookmarks,      setBookmarks]      = useState([]);
  const [readingHistory, setReadingHistory] = useState([]);
  const [myUploads,      setMyUploads]      = useState([]);
  const [isLoading,      setIsLoading]      = useState(true);
  const [success,        setSuccess]        = useState('');

  const token   = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  useEffect(() => {
    // Load library data instantly from localStorage
    setFavorites(getFavorites());
    setBookmarks(getBookmarks());
    setReadingHistory(getReadingHistory());

    // Load user profile from backend
    fetch(`${API_URL}/api/users/profile`, { headers })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setUser(data); })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (activeTab !== 'uploads') return;
    fetch(`${API_URL}/api/uploads/my-uploads`, { headers })
      .then(r => r.ok ? r.json() : [])
      .then(data => setMyUploads(data))
      .catch(() => {});
  }, [activeTab]);

  const handleRemoveFavorite = async (bookId) => {
    await removeFavorite(bookId);
    setFavorites(getFavorites());
    setSuccess('Removed from favorites');
    setTimeout(() => setSuccess(''), 2000);
  };

  const handleRemoveBookmark = async (bookId) => {
    await removeBookmark(bookId);
    setBookmarks(getBookmarks());
    setSuccess('Bookmark removed');
    setTimeout(() => setSuccess(''), 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const tabs = [
    { id: 'favorites', label: 'Favorites',      icon: Heart    },
    { id: 'bookmarks', label: 'Bookmarks',       icon: Bookmark },
    { id: 'history',   label: 'Reading History', icon: Clock    },
    { id: 'uploads',   label: 'My Uploads',      icon: Upload   },
  ];

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: 'var(--border-strong)', borderTopColor: 'var(--accent)' }} />
    </div>
  );

  const displayName = user?.displayName || user?.username || 'User';
  const initial     = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen px-4 lg:px-8 py-10" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-6xl mx-auto">

        {/* Success toast */}
        {success && (
          <div className="mb-5 px-4 py-3 rounded-lg flex items-center gap-3 text-sm"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
            <CheckCircle size={15} /> {success}
            <button onClick={() => setSuccess('')} className="ml-auto" style={{ color: 'var(--text-muted)' }}><X size={14} /></button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Sidebar ─────────────────────────────────────────────────── */}
          <div className="w-full lg:w-64 shrink-0 space-y-4">

            {/* User card */}
            <div className="p-6 rounded-xl" style={S.card}>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold mb-3"
                  style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}>
                  {initial}
                </div>
                <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{displayName}</h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
                <span className="mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase"
                  style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
                  {user?.role || 'user'}
                </span>
              </div>

              <div className="mt-5 pt-5 space-y-2.5" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                {[
                  { label: 'Favorites',  val: favorites.length      },
                  { label: 'Bookmarks',  val: bookmarks.length      },
                  { label: 'Books Read', val: readingHistory.length  },
                ].map(({ label, val }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                    <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Logout */}
            <div className="rounded-xl overflow-hidden" style={S.card}>
              <button onClick={handleLogout}
                className="w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface-elevated)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <LogOut size={16} /> Logout
              </button>
            </div>
          </div>

          {/* ── Main content ─────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* Tab bar */}
            <div className="flex gap-1.5 mb-5 overflow-x-auto no-scrollbar pb-1">
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150"
                  style={activeTab === tab.id
                    ? { background: 'var(--accent)', color: 'var(--accent-fg)' }
                    : { background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                  <tab.icon size={14} /> {tab.label}
                </button>
              ))}
            </div>

            {/* ── FAVORITES ──────────────────────────────────────────────── */}
            {activeTab === 'favorites' && (
              <div className="p-6 rounded-xl" style={S.card}>
                <h2 className="text-base font-bold mb-5" style={{ color: 'var(--text-primary)' }}>My Favorites</h2>
                {favorites.length === 0 ? (
                  <div className="py-16 text-center">
                    <Heart size={40} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
                    <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>No favorites yet. Start adding books you love!</p>
                    <Link to="/discover" className="btn btn-primary !text-sm">Explore Books</Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {favorites.map(book => {
                      const bookId = book._id || book.id;
                      return (
                        <div key={bookId} className="flex gap-3 p-3 rounded-lg" style={S.inner}>
                          <img src={cover(book.coverImage)} alt={book.title}
                            className="w-12 h-16 object-cover rounded-md shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{book.title}</h3>
                            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{book.author}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <Link to={`/book/${bookId}`} className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>View</Link>
                              <button onClick={() => handleRemoveFavorite(bookId)} className="text-xs" style={{ color: 'var(--text-muted)' }}>Remove</button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── BOOKMARKS ──────────────────────────────────────────────── */}
            {activeTab === 'bookmarks' && (
              <div className="p-6 rounded-xl" style={S.card}>
                <h2 className="text-base font-bold mb-5" style={{ color: 'var(--text-primary)' }}>My Bookmarks</h2>
                {bookmarks.length === 0 ? (
                  <div className="py-16 text-center">
                    <Bookmark size={40} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No bookmarks yet. Bookmark a book while reading!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {bookmarks.map(item => {
                      const bookId = item.book?._id || item.book?.id;
                      return (
                        <div key={bookId} className="flex items-center justify-between p-3 rounded-lg" style={S.inner}>
                          <div className="flex items-center gap-3">
                            <img src={cover(item.book?.coverImage)} alt={item.book?.title}
                              className="w-10 h-14 object-cover rounded-md shrink-0" />
                            <div>
                              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{item.book?.title}</h3>
                              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Page {item.page}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Link to={`/read/${bookId}`} state={{ page: item.page }}
                              className="btn btn-primary !py-1.5 !px-3 !text-xs">Continue</Link>
                            <button onClick={() => handleRemoveBookmark(bookId)} style={{ color: 'var(--text-muted)' }}>
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── READING HISTORY ────────────────────────────────────────── */}
            {activeTab === 'history' && (
              <div className="p-6 rounded-xl" style={S.card}>
                <h2 className="text-base font-bold mb-5" style={{ color: 'var(--text-primary)' }}>Reading History</h2>
                {readingHistory.length === 0 ? (
                  <div className="py-16 text-center">
                    <Clock size={40} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
                    <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>No reading history yet. Start reading!</p>
                    <Link to="/discover" className="btn btn-primary !text-sm">Explore Books</Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {readingHistory.map(item => {
                      const bookId = item.book?._id || item.book?.id;
                      return (
                        <div key={bookId} className="flex items-center justify-between p-3 rounded-lg" style={S.inner}>
                          <div className="flex items-center gap-3">
                            <img src={cover(item.book?.coverImage)} alt={item.book?.title}
                              className="w-10 h-14 object-cover rounded-md shrink-0" />
                            <div>
                              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{item.book?.title}</h3>
                              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                {item.lastPage > 1 ? `Page ${item.lastPage} · ` : ''}
                                {new Date(item.lastRead).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Link to={`/read/${bookId}`} state={{ page: item.lastPage }}
                            className="btn btn-primary !py-1.5 !px-3 !text-xs">Continue</Link>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── MY UPLOADS ─────────────────────────────────────────────── */}
            {activeTab === 'uploads' && (
              <div className="p-6 rounded-xl" style={S.card}>
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>My Uploads</h2>
                  <Link to="/upload" className="btn btn-primary !py-1.5 !px-3 !text-xs flex items-center gap-1.5">
                    <Upload size={13} /> Upload Book
                  </Link>
                </div>
                {myUploads.length === 0 ? (
                  <div className="py-16 text-center">
                    <Upload size={40} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
                    <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>No uploads yet. Share your books!</p>
                    <Link to="/upload" className="btn btn-primary !text-sm">Upload Book</Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {myUploads.map(book => (
                      <div key={book._id} className="flex items-center justify-between p-3 rounded-lg" style={S.inner}>
                        <div className="flex items-center gap-3">
                          {book.coverImage && (
                            <img src={cover(book.coverImage)} alt={book.title}
                              className="w-10 h-14 object-cover rounded-md shrink-0" />
                          )}
                          <div>
                            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{book.title}</h3>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{book.author}</p>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase"
                          style={statusStyle(book.uploadStatus)}>
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
    </div>
  );
};

export default Profile;
