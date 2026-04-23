import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Upload, BookOpen, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CATEGORIES = [
  'Fiction', 'Mystery', 'Romance', 'Sci-Fi', 'Horror', 
  'History', 'Classic', 'Adventure', 'Poetry', 'Self-Help', 
  'Productivity', 'Thriller', 'Other'
];

const UploadBook = () => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    category: 'Fiction',
    coverImage: '',
    fileUrl: '',
    pages: '',
    publishYear: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const token = localStorage.getItem('token');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`${API_URL}/api/uploads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Book uploaded successfully! It will be reviewed by an admin before being published.');
        setFormData({
          title: '', author: '', description: '', category: 'Fiction',
          coverImage: '', fileUrl: '', pages: '', publishYear: ''
        });
      } else {
        setError(data.message || 'Failed to upload book');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 lg:px-8 py-12 mt-20 min-h-[85vh]">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <Link to="/profile" className="inline-flex items-center gap-2 text-neutral-400 hover:text-red-400 transition-colors mb-8">
          <ArrowLeft size={18} /> Back to Profile
        </Link>

        <div className="bg-[#111111] rounded-2xl border border-red-500/10 p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
              <Upload className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Upload Your Book</h1>
              <p className="text-neutral-500">Share your book with the ReadSphere community</p>
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400">
              <AlertCircle size={20} /> {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3 text-green-400">
              <CheckCircle size={20} /> {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-neutral-400 mb-2">Book Title *</label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter book title"
                  className="w-full bg-[#0a0a0a] border border-red-500/20 rounded-xl px-4 py-3 text-white placeholder:text-neutral-600 focus:border-red-500 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-2">Author *</label>
                <input
                  type="text"
                  name="author"
                  required
                  value={formData.author}
                  onChange={handleChange}
                  placeholder="Enter author name"
                  className="w-full bg-[#0a0a0a] border border-red-500/20 rounded-xl px-4 py-3 text-white placeholder:text-neutral-600 focus:border-red-500 outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-neutral-400 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description of the book..."
                rows={4}
                className="w-full bg-[#0a0a0a] border border-red-500/20 rounded-xl px-4 py-3 text-white placeholder:text-neutral-600 focus:border-red-500 outline-none transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm text-neutral-400 mb-2">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full bg-[#0a0a0a] border border-red-500/20 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none transition-colors"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-2">Pages</label>
                <input
                  type="number"
                  name="pages"
                  value={formData.pages}
                  onChange={handleChange}
                  placeholder="e.g. 300"
                  className="w-full bg-[#0a0a0a] border border-red-500/20 rounded-xl px-4 py-3 text-white placeholder:text-neutral-600 focus:border-red-500 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-2">Publish Year</label>
                <input
                  type="text"
                  name="publishYear"
                  value={formData.publishYear}
                  onChange={handleChange}
                  placeholder="e.g. 2020"
                  className="w-full bg-[#0a0a0a] border border-red-500/20 rounded-xl px-4 py-3 text-white placeholder:text-neutral-600 focus:border-red-500 outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-neutral-400 mb-2">Cover Image URL</label>
              <input
                type="url"
                name="coverImage"
                value={formData.coverImage}
                onChange={handleChange}
                placeholder="https://example.com/cover.jpg"
                className="w-full bg-[#0a0a0a] border border-red-500/20 rounded-xl px-4 py-3 text-white placeholder:text-neutral-600 focus:border-red-500 outline-none transition-colors"
              />
              <p className="text-xs text-neutral-600 mt-1">Optional. Leave empty for default cover.</p>
            </div>

            <div>
              <label className="block text-sm text-neutral-400 mb-2">Book File URL (PDF) *</label>
              <input
                type="url"
                name="fileUrl"
                required
                value={formData.fileUrl}
                onChange={handleChange}
                placeholder="https://example.com/book.pdf"
                className="w-full bg-[#0a0a0a] border border-red-500/20 rounded-xl px-4 py-3 text-white placeholder:text-neutral-600 focus:border-red-500 outline-none transition-colors"
              />
              <p className="text-xs text-neutral-600 mt-1">Provide a direct link to the PDF file.</p>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-red-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={20} /> Upload Book
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadBook;
