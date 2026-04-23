import React, { useState, useEffect } from 'react';
import { 
  Users, BookOpen, Plus, Edit2, Trash2, CheckCircle, XCircle, 
  Upload, TrendingUp, Clock, Star, BarChart3, X, AlertCircle
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({ totalBooks: 0, activeBooks: 0, pendingUploads: 0, totalReads: 0 });
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [pendingUploads, setPendingUploads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    title: '', author: '', description: '', category: 'Fiction',
    coverImage: '', fileUrl: '', pages: '', publishYear: '', rating: ''
  });

  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/api/books/stats/overview`, { headers });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Fetch books
  const fetchBooks = async () => {
    try {
      const res = await fetch(`${API_URL}/api/books?limit=100`, { headers });
      if (res.ok) {
        const data = await res.json();
        setBooks(data.books || []);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  // Fetch pending uploads
  const fetchPendingUploads = async () => {
    try {
      const res = await fetch(`${API_URL}/api/uploads/pending`, { headers });
      if (res.ok) {
        const data = await res.json();
        setPendingUploads(data || []);
      }
    } catch (error) {
      console.error('Error fetching pending uploads:', error);
    }
  };

  // Load data
  useEffect(() => {
    if (activeTab === 'dashboard') fetchStats();
    if (activeTab === 'books') fetchBooks();
    if (activeTab === 'uploads') fetchPendingUploads();
    setIsLoading(false);
  }, [activeTab]);

  // Handle add book
  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/books`, {
        method: 'POST',
        headers,
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setSuccess('Book added successfully!');
        setShowAddModal(false);
        setFormData({ title: '', author: '', description: '', category: 'Fiction', coverImage: '', fileUrl: '', pages: '', publishYear: '', rating: '' });
        fetchBooks();
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to add book');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  // Handle edit book
  const handleEditBook = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/books/${selectedBook._id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setSuccess('Book updated successfully!');
        setShowEditModal(false);
        fetchBooks();
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to update book');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  // Handle delete book
  const handleDeleteBook = async (bookId) => {
    if (!confirm('Are you sure you want to delete this book?')) return;
    try {
      const res = await fetch(`${API_URL}/api/books/${bookId}`, {
        method: 'DELETE',
        headers
      });

      if (res.ok) {
        setSuccess('Book deleted successfully!');
        fetchBooks();
      } else {
        setError('Failed to delete book');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  // Handle approve/reject upload
  const handleUploadAction = async (bookId, action) => {
    try {
      const res = await fetch(`${API_URL}/api/uploads/${bookId}/${action}`, {
        method: 'PUT',
        headers
      });

      if (res.ok) {
        setSuccess(`Book ${action}ed successfully!`);
        fetchPendingUploads();
        fetchStats();
      } else {
        setError(`Failed to ${action} book`);
      }
    } catch (err) {
      setError('Network error');
    }
  };

  // Open edit modal
  const openEditModal = (book) => {
    setSelectedBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      description: book.description || '',
      category: book.category,
      coverImage: book.coverImage || '',
      fileUrl: book.fileUrl,
      pages: book.pages || '',
      publishYear: book.publishYear || '',
      rating: book.rating || ''
    });
    setShowEditModal(true);
  };

  // Dashboard Stats Card
  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-[#111111] rounded-2xl p-6 border border-red-500/10 hover:border-red-500/30 transition-all">
      <div className={`w-12 h-12 rounded-xl ${color} bg-opacity-10 flex items-center justify-center mb-4`}>
        <Icon size={24} className={color.replace('bg-', 'text-')} />
      </div>
      <h3 className="text-3xl font-black text-white mb-1">{value}</h3>
      <p className="text-neutral-500 text-sm">{label}</p>
    </div>
  );

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'books', label: 'Manage Books', icon: BookOpen },
    { id: 'uploads', label: 'Pending Uploads', icon: Upload },
  ];

  return (
    <div className="container mx-auto px-4 lg:px-8 py-12 mt-20 min-h-[85vh]">
      {/* Alerts */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400">
          <AlertCircle size={20} />
          {error}
          <button onClick={() => setError('')} className="ml-auto"><X size={16} /></button>
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3 text-green-400">
          <CheckCircle size={20} />
          {success}
          <button onClick={() => setSuccess('')} className="ml-auto"><X size={16} /></button>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">Admin Control Panel</h1>
          <p className="text-neutral-500">Manage the ReadSphere platform resources</p>
        </div>
        {activeTab === 'books' && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary flex items-center gap-2 !py-2.5 !px-5 !rounded-xl shadow-lg shadow-red-500/20"
          >
            <Plus size={18} /> Add New Book
          </button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full lg:w-56 flex-shrink-0 flex lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0">
          {tabs.map(tab => (
            <button 
              key={tab.id}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-red-500/10 text-red-400 border border-red-500/30' 
                  : 'bg-[#111111] text-neutral-400 hover:bg-red-500/5 hover:text-neutral-200 border border-red-500/10'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon size={18} className={activeTab === tab.id ? 'text-red-500' : ''} /> 
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-grow min-w-0">
          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={BookOpen} label="Total Books" value={stats.totalBooks} color="bg-red-500" />
                <StatCard icon={CheckCircle} label="Active Books" value={stats.activeBooks} color="bg-green-500" />
                <StatCard icon={Upload} label="Pending Uploads" value={stats.pendingUploads} color="bg-orange-500" />
                <StatCard icon={TrendingUp} label="Total Reads" value={stats.totalReads.toLocaleString()} color="bg-blue-500" />
              </div>
              
              <div className="bg-[#111111] rounded-2xl p-8 border border-red-500/10">
                <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button onClick={() => setActiveTab('books')} className="p-4 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 rounded-xl text-left transition-all">
                    <BookOpen className="text-red-500 mb-3" size={24} />
                    <h3 className="text-white font-semibold">Manage Books</h3>
                    <p className="text-neutral-500 text-sm mt-1">Add, edit, or delete books</p>
                  </button>
                  <button onClick={() => setActiveTab('uploads')} className="p-4 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 rounded-xl text-left transition-all">
                    <Upload className="text-red-500 mb-3" size={24} />
                    <h3 className="text-white font-semibold">Review Uploads</h3>
                    <p className="text-neutral-500 text-sm mt-1">Approve or reject user uploads</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Books Management */}
          {activeTab === 'books' && (
            <div className="bg-[#111111] rounded-2xl border border-red-500/10 overflow-hidden">
              <div className="p-6 border-b border-red-500/10">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <BookOpen className="text-red-500" size={24}/> Books Repository
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-black/30 text-neutral-400 text-sm border-b border-red-500/10">
                      <th className="font-medium p-4 pl-6">Title</th>
                      <th className="font-medium p-4">Author</th>
                      <th className="font-medium p-4">Category</th>
                      <th className="font-medium p-4">Status</th>
                      <th className="font-medium p-4 text-right pr-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-red-500/5">
                    {books.map(book => (
                      <tr key={book._id} className="hover:bg-red-500/5 transition-colors group">
                        <td className="p-4 pl-6">
                          <span className="font-bold text-white group-hover:text-red-400 transition-colors">{book.title}</span>
                        </td>
                        <td className="p-4 text-neutral-400">{book.author}</td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                            {book.category}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                            book.isActive 
                              ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}>
                            {book.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="p-4 text-right pr-6">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEditModal(book)} className="p-2 rounded-lg hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition-colors">
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDeleteBook(book._id)} className="p-2 rounded-lg hover:bg-red-500/20 text-neutral-400 hover:text-red-500 transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {books.length === 0 && (
                  <div className="p-12 text-center">
                    <BookOpen size={48} className="text-red-900/30 mx-auto mb-4" />
                    <p className="text-neutral-500">No books found. Add your first book!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pending Uploads */}
          {activeTab === 'uploads' && (
            <div className="bg-[#111111] rounded-2xl border border-red-500/10 overflow-hidden">
              <div className="p-6 border-b border-red-500/10">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Upload className="text-red-500" size={24}/> Pending Uploads
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-black/30 text-neutral-400 text-sm border-b border-red-500/10">
                      <th className="font-medium p-4 pl-6">Title</th>
                      <th className="font-medium p-4">Author</th>
                      <th className="font-medium p-4">Uploaded By</th>
                      <th className="font-medium p-4">Date</th>
                      <th className="font-medium p-4 text-right pr-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-red-500/5">
                    {pendingUploads.map(book => (
                      <tr key={book._id} className="hover:bg-red-500/5 transition-colors">
                        <td className="p-4 pl-6 font-bold text-white">{book.title}</td>
                        <td className="p-4 text-neutral-400">{book.author}</td>
                        <td className="p-4 text-neutral-400">{book.uploadedBy?.username || 'Unknown'}</td>
                        <td className="p-4 text-neutral-500 text-sm">{new Date(book.createdAt).toLocaleDateString()}</td>
                        <td className="p-4 text-right pr-6">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleUploadAction(book._id, 'approve')} className="p-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 transition-colors" title="Approve">
                              <CheckCircle size={18} />
                            </button>
                            <button onClick={() => handleUploadAction(book._id, 'reject')} className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors" title="Reject">
                              <XCircle size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {pendingUploads.length === 0 && (
                  <div className="p-12 text-center">
                    <CheckCircle size={48} className="text-green-900/30 mx-auto mb-4" />
                    <p className="text-neutral-500">No pending uploads!</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Book Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111111] rounded-2xl border border-red-500/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-red-500/10 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Add New Book</h2>
              <button onClick={() => setShowAddModal(false)} className="text-neutral-400 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddBook} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-neutral-400 mb-2">Title *</label>
                  <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-[#0a0a0a] border border-red-500/20 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-neutral-400 mb-2">Author *</label>
                  <input type="text" required value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} className="w-full bg-[#0a0a0a] border border-red-500/20 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-2">Description</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-[#0a0a0a] border border-red-500/20 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none h-24" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-neutral-400 mb-2">Category</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-[#0a0a0a] border border-red-500/20 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none">
                    {['Fiction', 'Mystery', 'Romance', 'Sci-Fi', 'Horror', 'History', 'Classic', 'Adventure', 'Poetry', 'Self-Help', 'Thriller'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-neutral-400 mb-2">Pages</label>
                  <input type="number" value={formData.pages} onChange={e => setFormData({...formData, pages: e.target.value})} className="w-full bg-[#0a0a0a] border border-red-500/20 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-neutral-400 mb-2">Year</label>
                  <input type="text" value={formData.publishYear} onChange={e => setFormData({...formData, publishYear: e.target.value})} className="w-full bg-[#0a0a0a] border border-red-500/20 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-2">Cover Image URL</label>
                <input type="url" value={formData.coverImage} onChange={e => setFormData({...formData, coverImage: e.target.value})} className="w-full bg-[#0a0a0a] border border-red-500/20 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-2">File URL (PDF) *</label>
                <input type="url" required value={formData.fileUrl} onChange={e => setFormData({...formData, fileUrl: e.target.value})} className="w-full bg-[#0a0a0a] border border-red-500/20 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none" />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 border border-red-500/30 text-neutral-400 rounded-xl hover:bg-red-500/10 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold hover:from-red-500 hover:to-red-600 transition-all">Add Book</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Book Modal */}
      {showEditModal && selectedBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111111] rounded-2xl border border-red-500/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-red-500/10 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Edit Book</h2>
              <button onClick={() => setShowEditModal(false)} className="text-neutral-400 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleEditBook} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-neutral-400 mb-2">Title *</label>
                  <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-[#0a0a0a] border border-red-500/20 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-neutral-400 mb-2">Author *</label>
                  <input type="text" required value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} className="w-full bg-[#0a0a0a] border border-red-500/20 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-2">Description</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-[#0a0a0a] border border-red-500/20 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none h-24" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-neutral-400 mb-2">Category</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-[#0a0a0a] border border-red-500/20 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none">
                    {['Fiction', 'Mystery', 'Romance', 'Sci-Fi', 'Horror', 'History', 'Classic', 'Adventure', 'Poetry', 'Self-Help', 'Thriller'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-neutral-400 mb-2">Pages</label>
                  <input type="number" value={formData.pages} onChange={e => setFormData({...formData, pages: e.target.value})} className="w-full bg-[#0a0a0a] border border-red-500/20 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-neutral-400 mb-2">Year</label>
                  <input type="text" value={formData.publishYear} onChange={e => setFormData({...formData, publishYear: e.target.value})} className="w-full bg-[#0a0a0a] border border-red-500/20 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-2">Cover Image URL</label>
                <input type="url" value={formData.coverImage} onChange={e => setFormData({...formData, coverImage: e.target.value})} className="w-full bg-[#0a0a0a] border border-red-500/20 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-2">File URL (PDF) *</label>
                <input type="url" required value={formData.fileUrl} onChange={e => setFormData({...formData, fileUrl: e.target.value})} className="w-full bg-[#0a0a0a] border border-red-500/20 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none" />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 py-3 border border-red-500/30 text-neutral-400 rounded-xl hover:bg-red-500/10 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold hover:from-red-500 hover:to-red-600 transition-all">Update Book</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
