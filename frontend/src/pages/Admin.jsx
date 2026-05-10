import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  BarChart3, BookOpen, Upload, Users, Plus, Edit2, Trash2,
  CheckCircle, XCircle, X, AlertCircle, Search, Eye,
  TrendingUp, FileText, Calendar, User, Image, Link as LinkIcon,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CATEGORIES = [
  'Fiction', 'Mystery', 'Romance', 'Sci-Fi', 'Horror',
  'History', 'Classic', 'Adventure', 'Poetry', 'Self-Help',
  'Productivity', 'Thriller', 'Other',
];

const EMPTY_FORM = {
  title: '', author: '', description: '', category: 'Fiction',
  pages: '', publishYear: '', coverImage: '', fileUrl: '', rating: '',
};

const inp = 'input w-full';

// ─── Toast ─────────────────────────────────────────────────────────────────────
const Toast = ({ toasts }) => (
  <div className="fixed top-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
    {toasts.map((t) => (
      <div key={t.id}
        className="flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl text-sm font-medium pointer-events-auto"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }}>
        {t.type === 'success' ? <CheckCircle size={15} style={{ color: 'var(--text-secondary)' }} /> : <AlertCircle size={15} style={{ color: 'var(--text-secondary)' }} />}
        {t.message}
      </div>
    ))}
  </div>
);

// ─── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, iconBg, iconColor }) => (
  <div className="bg-surface rounded-xl border border-[var(--border-subtle)] p-6 flex items-center gap-5">
    <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
      <Icon size={26} className={iconColor} />
    </div>
    <div>
      <p className="text-[var(--text-muted)] text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
      <p className="text-3xl font-black text-[var(--text-primary)]">{value ?? '—'}</p>
    </div>
  </div>
);

// ─── Book Form Modal (supports PDF upload + URL, same as user upload page) ─────
const BookModal = ({ open, onClose, onSave, onSaveWithFile, initial, loading }) => {
  const [form,         setForm]         = useState(EMPTY_FORM);
  const [pdfFile,      setPdfFile]      = useState(null);
  const [coverFile,    setCoverFile]    = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [uploadMode,   setUploadMode]   = useState('url'); // 'url' | 'file'
  const [progress,     setProgress]     = useState(0);
  const pdfRef   = useRef(null);
  const coverRef = useRef(null);

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...EMPTY_FORM, ...initial } : EMPTY_FORM);
      setPdfFile(null); setCoverFile(null); setCoverPreview('');
      setUploadMode('url'); setProgress(0);
    }
  }, [open, initial]);

  if (!open) return null;

  const handle = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handlePdf = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== 'application/pdf') { alert('Only PDF files allowed.'); return; }
    if (f.size > 50 * 1024 * 1024)   { alert('PDF must be under 50 MB.'); return; }
    setPdfFile(f);
  };

  const handleCover = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setCoverFile(f);
    setCoverPreview(URL.createObjectURL(f));
  };

  const canSave = form.title.trim() && form.author.trim() &&
    (uploadMode === 'url' ? form.fileUrl.trim() : !!pdfFile || !!initial);

  const handleSave = () => {
    if (uploadMode === 'file' && pdfFile) {
      onSaveWithFile(form, pdfFile, coverFile, setProgress);
    } else {
      onSave(form);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface border border-[var(--border-default)] rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-[var(--border-subtle)]">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">{initial ? 'Edit Book' : 'Add New Book'}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"><X size={20} /></button>
        </div>

        <div className="px-7 py-6 space-y-5">
          {/* Title + Author */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[var(--text-secondary)] mb-1.5 font-medium">Title *</label>
              <input name="title" value={form.title} onChange={handle} placeholder="Book title" className={inp} />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-secondary)] mb-1.5 font-medium">Author *</label>
              <input name="author" value={form.author} onChange={handle} placeholder="Author name" className={inp} />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1.5 font-medium">Description</label>
            <textarea name="description" value={form.description} onChange={handle}
              placeholder="Brief description…" rows={3} className={`${inp} resize-none`} />
          </div>

          {/* Category + Pages + Year + Rating */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs text-[var(--text-secondary)] mb-1.5 font-medium">Category</label>
              <select name="category" value={form.category} onChange={handle} className={inp}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[var(--text-secondary)] mb-1.5 font-medium">Pages</label>
              <input name="pages" type="number" value={form.pages} onChange={handle} placeholder="300" min="1" className={inp} />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-secondary)] mb-1.5 font-medium">Year</label>
              <input name="publishYear" value={form.publishYear} onChange={handle} placeholder="2020" className={inp} />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-secondary)] mb-1.5 font-medium">Rating</label>
              <input name="rating" type="number" value={form.rating} onChange={handle} placeholder="4.5" min="0" max="5" step="0.1" className={inp} />
            </div>
          </div>

          {/* Cover image */}
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1.5 font-medium">Cover Image</label>
            <div className="flex items-start gap-3">
              {coverPreview && (
                <div className="relative w-16 shrink-0">
                  <img src={coverPreview} alt="preview" className="w-16 aspect-[2/3] object-cover rounded-lg border border-[var(--border-default)]" />
                  <button type="button" onClick={() => { setCoverFile(null); setCoverPreview(''); if (coverRef.current) coverRef.current.value = ''; }}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[var(--accent)] rounded-full flex items-center justify-center text-[var(--text-primary)]">
                    <X size={8} />
                  </button>
                </div>
              )}
              <div className="flex-1 space-y-2">
                <input name="coverImage" value={form.coverImage} onChange={handle} placeholder="https://… (image URL)" className={inp} />
                <div className="flex items-center gap-2">
                  <span className="text-[var(--text-muted)] text-xs">or</span>
                  <button type="button" onClick={() => coverRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-default)] rounded-lg text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                    <Image size={12} /> Upload image
                  </button>
                  {coverFile && <span className="text-xs text-[var(--text-secondary)] truncate max-w-[120px]">{coverFile.name}</span>}
                </div>
                <input ref={coverRef} type="file" accept="image/*" onChange={handleCover} className="hidden" />
              </div>
            </div>
          </div>

          {/* PDF — toggle between URL and file upload */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs text-[var(--text-secondary)] font-medium">Book File (PDF) *</label>
              <div className="flex bg-secondary border border-[var(--border-default)] rounded-lg p-0.5">
                <button type="button" onClick={() => setUploadMode('url')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-colors ${uploadMode === 'url' ? 'bg-[var(--accent)] text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}>
                  <LinkIcon size={11} /> URL
                </button>
                <button type="button" onClick={() => setUploadMode('file')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-colors ${uploadMode === 'file' ? 'bg-[var(--accent)] text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}>
                  <Upload size={11} /> Upload PDF
                </button>
              </div>
            </div>

            {uploadMode === 'url' ? (
              <input name="fileUrl" value={form.fileUrl} onChange={handle} placeholder="https://… (PDF link)" className={inp} />
            ) : (
              <div
                onClick={() => pdfRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                  pdfFile ? 'border-[var(--border-strong)] bg-[var(--bg-surface)]' : 'border-[var(--border-default)] hover:border-red-500/40 hover:bg-[var(--bg-surface)]'
                }`}>
                <input ref={pdfRef} type="file" accept="application/pdf" onChange={handlePdf} className="hidden" />
                {pdfFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileText size={20} className="text-[var(--text-secondary)]" />
                    <div className="text-left">
                      <p className="text-[var(--text-primary)] text-sm font-semibold truncate max-w-[200px]">{pdfFile.name}</p>
                      <p className="text-[var(--text-muted)] text-xs">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button type="button" onClick={(e) => { e.stopPropagation(); setPdfFile(null); if (pdfRef.current) pdfRef.current.value = ''; }}
                      className="ml-auto p-1 rounded hover:bg-[var(--bg-surface-elevated)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <FileText size={24} className="text-[var(--text-muted)] mx-auto mb-2" />
                    <p className="text-[var(--text-secondary)] text-sm">Click to select PDF <span className="text-[var(--text-muted)]">(max 50 MB)</span></p>
                  </>
                )}
              </div>
            )}

            {/* Upload progress */}
            {loading && progress > 0 && (
              <div className="mt-2">
                <div className="flex justify-between text-xs text-[var(--text-muted)] mb-1"><span>Uploading…</span><span>{progress}%</span></div>
                <div className="w-full bg-secondary rounded-full h-1.5">
                  <div className="bg-[var(--accent)] h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-7 py-5 border-t border-[var(--border-subtle)]">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={loading || !canSave}
            className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--text-primary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
            {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {initial ? 'Save Changes' : 'Add Book'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Delete Confirm Modal ──────────────────────────────────────────────────────
const DeleteModal = ({ open, book, onClose, onConfirm, loading }) => {
  if (!open || !book) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface border border-[var(--border-strong)] rounded-xl w-full max-w-md shadow-2xl p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-[var(--bg-surface-elevated)] flex items-center justify-center mx-auto mb-5">
          <Trash2 size={28} className="text-[var(--text-primary)]" />
        </div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Delete Book?</h2>
        <p className="text-[var(--text-secondary)] text-sm mb-6">
          <span className="text-[var(--text-primary)] font-semibold">"{book.title}"</span> will be permanently removed. This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] text-sm font-semibold transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 py-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--text-primary)] text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Upload Preview Modal ──────────────────────────────────────────────────────
const UploadPreviewModal = ({ open, book, onClose, onApprove, onReject, loading }) => {
  if (!open || !book) return null;
  const fileUrl = book.fileUrl?.startsWith('http') ? book.fileUrl : `${API_URL}${book.fileUrl}`;
  const coverUrl = book.coverImage
    ? (book.coverImage.startsWith('http') ? book.coverImage : `${API_URL}${book.coverImage}`)
    : null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface border border-[var(--border-default)] rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-7 py-5 border-b border-[var(--border-subtle)]">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Review Upload</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"><X size={20} /></button>
        </div>

        <div className="px-7 py-6">
          <div className="flex gap-6 mb-6">
            {/* Cover */}
            <div className="w-28 shrink-0">
              {coverUrl
                ? <img src={coverUrl} alt={book.title} className="w-28 aspect-[2/3] object-cover rounded-xl border border-[var(--border-default)]" />
                : <div className="w-28 aspect-[2/3] rounded-xl bg-secondary border border-[var(--border-default)] flex items-center justify-center"><BookOpen size={32} className="text-neutral-700" /></div>
              }
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-black text-[var(--text-primary)] mb-1">{book.title}</h3>
              <p className="text-[var(--text-secondary)] text-sm mb-3">by <span className="text-[var(--text-primary)]">{book.author}</span></p>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-lg bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] text-xs font-semibold border border-[var(--border-default)]">{book.category}</span>
                {book.pages > 0 && <span className="px-2.5 py-1 rounded-lg bg-[var(--bg-surface)] text-[var(--text-secondary)] text-xs">{book.pages} pages</span>}
                {book.publishYear && <span className="px-2.5 py-1 rounded-lg bg-[var(--bg-surface)] text-[var(--text-secondary)] text-xs">{book.publishYear}</span>}
              </div>
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <User size={12} />
                <span>Uploaded by <span className="text-neutral-300">{book.uploadedBy?.username || book.uploadedBy?.displayName || 'Unknown'}</span></span>
                <Calendar size={12} className="ml-2" />
                <span>{new Date(book.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          {book.description && (
            <div className="mb-5 p-4 bg-secondary rounded-xl border border-[var(--border-subtle)]">
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2 font-semibold">Description</p>
              <p className="text-neutral-300 text-sm leading-relaxed">{book.description}</p>
            </div>
          )}

          {/* PDF link */}
          <a href={fileUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 bg-secondary rounded-xl border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-colors mb-6 group">
            <div className="w-10 h-10 rounded-lg bg-[var(--bg-surface-elevated)] flex items-center justify-center">
              <FileText size={18} className="text-[var(--text-secondary)]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[var(--text-primary)] text-sm font-semibold group-hover:text-[var(--text-secondary)] transition-colors">View PDF File</p>
              <p className="text-[var(--text-muted)] text-xs truncate">{fileUrl}</p>
            </div>
            <Eye size={16} className="text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors" />
          </a>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={onReject} disabled={loading}
              className="flex-1 py-3.5 rounded-xl bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-strong)] text-[var(--text-secondary)] font-bold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              <XCircle size={18} /> Reject
            </button>
            <button onClick={onApprove} disabled={loading}
              className="flex-1 py-3.5 rounded-xl bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-default)] text-[var(--text-secondary)] font-bold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <div className="w-4 h-4 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin" /> : <CheckCircle size={18} />}
              Approve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Inline Add Book Form (used in Manage Books tab) ──────────────────────────
const AddBookForm = ({ token, headers, onSuccess, toast }) => {
  const EMPTY = {
    title: '', author: '', description: '', category: 'Fiction',
    pages: '', publishYear: '', coverImage: '', fileUrl: '', rating: '',
  };
  const [form,         setForm]         = useState(EMPTY);
  const [pdfFile,      setPdfFile]      = useState(null);
  const [coverFile,    setCoverFile]    = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [uploadMode,   setUploadMode]   = useState('url');
  const [progress,     setProgress]     = useState(0);
  const [saving,       setSaving]       = useState(false);
  const pdfRef   = useRef(null);
  const coverRef = useRef(null);

  const handle = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handlePdf = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== 'application/pdf') { toast('Only PDF files allowed.', 'error'); return; }
    if (f.size > 50 * 1024 * 1024)   { toast('PDF must be under 50 MB.', 'error'); return; }
    setPdfFile(f);
  };

  const handleCover = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setCoverFile(f);
    setCoverPreview(URL.createObjectURL(f));
  };

  const reset = () => {
    setForm(EMPTY); setPdfFile(null); setCoverFile(null);
    setCoverPreview(''); setProgress(0);
    if (pdfRef.current)   pdfRef.current.value   = '';
    if (coverRef.current) coverRef.current.value = '';
  };

  const canSave = form.title.trim() && form.author.trim() &&
    (uploadMode === 'url' ? form.fileUrl.trim() : !!pdfFile);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (uploadMode === 'file') {
        // Upload PDF via /api/uploads then auto-approve
        const fd = new FormData();
        fd.append('bookFile',    pdfFile);
        fd.append('title',       form.title.trim());
        fd.append('author',      form.author.trim());
        fd.append('description', form.description || '');
        fd.append('category',    form.category);
        fd.append('pages',       form.pages || '');
        fd.append('publishYear', form.publishYear || '');
        if (coverFile) fd.append('coverImage', coverFile);

        const uploadRes = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', `${API_URL}/api/uploads`);
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
          xhr.upload.onprogress = (ev) => {
            if (ev.lengthComputable) setProgress(Math.round((ev.loaded / ev.total) * 100));
          };
          xhr.onload = () => {
            try { resolve(JSON.parse(xhr.responseText)); }
            catch { reject(new Error('Upload failed')); }
          };
          xhr.onerror = () => reject(new Error('Network error'));
          xhr.send(fd);
        });

        if (!uploadRes.success) throw new Error(uploadRes.message || 'Upload failed');
        await fetch(`${API_URL}/api/uploads/${uploadRes.book._id}/approve`, { method: 'PUT', headers });
      } else {
        // Add via JSON
        const res  = await fetch(`${API_URL}/api/books`, {
          method: 'POST', headers,
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to add book');
      }
      reset();
      onSuccess();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="px-7 py-6 space-y-5">
      {/* Title + Author */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-[var(--text-secondary)] mb-1.5 font-medium">Title *</label>
          <input name="title" value={form.title} onChange={handle} placeholder="Book title" required className={inp} />
        </div>
        <div>
          <label className="block text-xs text-[var(--text-secondary)] mb-1.5 font-medium">Author *</label>
          <input name="author" value={form.author} onChange={handle} placeholder="Author name" required className={inp} />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs text-[var(--text-secondary)] mb-1.5 font-medium">Description</label>
        <textarea name="description" value={form.description} onChange={handle}
          placeholder="Brief description…" rows={3} className={`${inp} resize-none`} />
      </div>

      {/* Category + Pages + Year + Rating */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-xs text-[var(--text-secondary)] mb-1.5 font-medium">Category</label>
          <select name="category" value={form.category} onChange={handle} className={inp}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-[var(--text-secondary)] mb-1.5 font-medium">Pages</label>
          <input name="pages" type="number" value={form.pages} onChange={handle} placeholder="300" min="1" className={inp} />
        </div>
        <div>
          <label className="block text-xs text-[var(--text-secondary)] mb-1.5 font-medium">Year</label>
          <input name="publishYear" value={form.publishYear} onChange={handle} placeholder="2020" className={inp} />
        </div>
        <div>
          <label className="block text-xs text-[var(--text-secondary)] mb-1.5 font-medium">Rating</label>
          <input name="rating" type="number" value={form.rating} onChange={handle} placeholder="4.5" min="0" max="5" step="0.1" className={inp} />
        </div>
      </div>

      {/* Cover image */}
      <div>
        <label className="block text-xs text-[var(--text-secondary)] mb-1.5 font-medium">Cover Image</label>
        <div className="flex items-start gap-3">
          {coverPreview && (
            <div className="relative w-16 shrink-0">
              <img src={coverPreview} alt="preview" className="w-16 aspect-[2/3] object-cover rounded-lg border border-[var(--border-default)]" />
              <button type="button" onClick={() => { setCoverFile(null); setCoverPreview(''); if (coverRef.current) coverRef.current.value = ''; }}
                className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[var(--accent)] rounded-full flex items-center justify-center text-[var(--text-primary)]">
                <X size={8} />
              </button>
            </div>
          )}
          <div className="flex-1 space-y-2">
            <input name="coverImage" value={form.coverImage} onChange={handle} placeholder="https://… (image URL)" className={inp} />
            <div className="flex items-center gap-2">
              <span className="text-[var(--text-muted)] text-xs">or</span>
              <button type="button" onClick={() => coverRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-default)] rounded-lg text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                <Image size={12} /> Upload image
              </button>
              {coverFile && <span className="text-xs text-[var(--text-secondary)] truncate max-w-[140px]">{coverFile.name}</span>}
            </div>
            <input ref={coverRef} type="file" accept="image/*" onChange={handleCover} className="hidden" />
          </div>
        </div>
      </div>

      {/* PDF — URL or file upload toggle */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs text-[var(--text-secondary)] font-medium">Book File (PDF) *</label>
          <div className="flex bg-secondary border border-[var(--border-default)] rounded-lg p-0.5">
            <button type="button" onClick={() => setUploadMode('url')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-colors ${uploadMode === 'url' ? 'bg-[var(--accent)] text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}>
              <LinkIcon size={11} /> URL
            </button>
            <button type="button" onClick={() => setUploadMode('file')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-colors ${uploadMode === 'file' ? 'bg-[var(--accent)] text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}>
              <Upload size={11} /> Upload PDF
            </button>
          </div>
        </div>

        {uploadMode === 'url' ? (
          <input name="fileUrl" value={form.fileUrl} onChange={handle} placeholder="https://… (PDF link)" className={inp} />
        ) : (
          <div onClick={() => pdfRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
              pdfFile ? 'border-[var(--border-strong)] bg-[var(--bg-surface)]' : 'border-[var(--border-default)] hover:border-red-500/40 hover:bg-[var(--bg-surface)]'
            }`}>
            <input ref={pdfRef} type="file" accept="application/pdf" onChange={handlePdf} className="hidden" />
            {pdfFile ? (
              <div className="flex items-center justify-center gap-3">
                <FileText size={20} className="text-[var(--text-secondary)]" />
                <div className="text-left">
                  <p className="text-[var(--text-primary)] text-sm font-semibold truncate max-w-[220px]">{pdfFile.name}</p>
                  <p className="text-[var(--text-muted)] text-xs">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button type="button" onClick={(e) => { e.stopPropagation(); setPdfFile(null); if (pdfRef.current) pdfRef.current.value = ''; }}
                  className="ml-auto p-1 rounded hover:bg-[var(--bg-surface-elevated)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <>
                <FileText size={24} className="text-[var(--text-muted)] mx-auto mb-2" />
                <p className="text-[var(--text-secondary)] text-sm">Click to select PDF <span className="text-[var(--text-muted)]">(max 50 MB)</span></p>
              </>
            )}
          </div>
        )}

        {saving && progress > 0 && (
          <div className="mt-2">
            <div className="flex justify-between text-xs text-[var(--text-muted)] mb-1"><span>Uploading…</span><span>{progress}%</span></div>
            <div className="w-full bg-secondary rounded-full h-1.5">
              <div className="bg-[var(--accent)] h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={saving || !canSave}
          className="flex items-center gap-2 px-7 py-3 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--text-primary)] rounded-xl text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/20">
          {saving
            ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Adding…</>
            : <><Plus size={16} /> Add Book</>
          }
        </button>
        <button type="button" onClick={reset}
          className="px-5 py-3 rounded-xl text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors">
          Clear
        </button>
      </div>
    </form>
  );
};

// ─── Main Admin Component ──────────────────────────────────────────────────────
const Admin = () => {
  const [activeTab, setActiveTab]           = useState('dashboard');
  const [stats, setStats]                   = useState({ totalBooks: 0, activeBooks: 0, pendingUploads: 0, totalReads: 0 });
  const [books, setBooks]                   = useState([]);
  const [communityBooks, setCommunityBooks] = useState([]);
  const [pendingUploads, setPendingUploads] = useState([]);
  const [search, setSearch]                 = useState('');
  const [toasts, setToasts]                 = useState([]);
  const [modalOpen, setModalOpen]           = useState(false);
  const [editBook, setEditBook]             = useState(null);
  const [deleteModal, setDeleteModal]       = useState({ open: false, book: null });
  const [previewModal, setPreviewModal]     = useState({ open: false, book: null });
  const [saving, setSaving]                 = useState(false);
  const [deleting, setDeleting]             = useState(false);
  const [actioning, setActioning]           = useState(false);

  const token   = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  // ── Toast helper ──────────────────────────────────────────────────────────
  const toast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  }, []);

  // ── Fetchers ──────────────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/books/stats/overview`, { headers });
      if (res.ok) setStats(await res.json());
    } catch (_) {}
  }, []);

  const fetchBooks = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/books?limit=200&source=admin`, { headers });
      if (res.ok) { const d = await res.json(); setBooks(d.books || []); }
    } catch (_) {}
  }, []);

  const fetchCommunityBooks = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/books?limit=200&source=uploaded`, { headers });
      if (res.ok) { const d = await res.json(); setCommunityBooks(d.books || []); }
    } catch (_) {}
  }, []);

  const fetchPending = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/uploads/pending`, { headers });
      if (res.ok) setPendingUploads(await res.json());
    } catch (_) {}
  }, []);

  useEffect(() => {
    fetchStats();
    if (activeTab === 'books')     fetchBooks();
    if (activeTab === 'community') fetchCommunityBooks();
    if (activeTab === 'uploads')   fetchPending();
  }, [activeTab]);

  // ── CRUD handlers ─────────────────────────────────────────────────────────
  // Save via JSON (URL mode or edit)
  const handleSave = async (form) => {
    setSaving(true);
    try {
      const url    = editBook ? `${API_URL}/api/books/${editBook._id}` : `${API_URL}/api/books`;
      const method = editBook ? 'PUT' : 'POST';
      const res    = await fetch(url, { method, headers, body: JSON.stringify(form) });
      const data   = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed');
      toast(editBook ? 'Book updated!' : 'Book added!');
      setModalOpen(false); setEditBook(null);
      fetchBooks(); fetchStats();
    } catch (err) { toast(err.message, 'error'); }
    finally { setSaving(false); }
  };

  // Save via FormData (file upload mode — admin uploads then auto-approves)
  const handleSaveWithFile = async (form, pdfFile, coverFile, setProgress) => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('bookFile',    pdfFile);
      fd.append('title',       form.title.trim());
      fd.append('author',      form.author.trim());
      fd.append('description', form.description || '');
      fd.append('category',    form.category);
      fd.append('pages',       form.pages || '');
      fd.append('publishYear', form.publishYear || '');
      if (coverFile) fd.append('coverImage', coverFile);

      const uploadRes = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${API_URL}/api/uploads`);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) setProgress(Math.round((ev.loaded / ev.total) * 100));
        };
        xhr.onload = () => {
          try { resolve(JSON.parse(xhr.responseText)); }
          catch { reject(new Error('Upload failed')); }
        };
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.send(fd);
      });

      if (!uploadRes.success) throw new Error(uploadRes.message || 'Upload failed');
      // Auto-approve since admin uploaded it
      await fetch(`${API_URL}/api/uploads/${uploadRes.book._id}/approve`, { method: 'PUT', headers });
      toast('Book uploaded and published!');
      setModalOpen(false); setEditBook(null);
      fetchBooks(); fetchStats();
    } catch (err) { toast(err.message, 'error'); }
    finally { setSaving(false); }
  };
  const handleDelete = async () => {
    if (!deleteModal.book) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_URL}/api/books/${deleteModal.book._id}`, { method: 'DELETE', headers });
      if (!res.ok) throw new Error('Failed to delete');
      toast('Book deleted successfully!');
      setDeleteModal({ open: false, book: null });
      if (activeTab === 'books')     fetchBooks();
      if (activeTab === 'community') fetchCommunityBooks();
      fetchStats();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleUploadAction = async (bookId, action) => {
    setActioning(true);
    try {
      const res = await fetch(`${API_URL}/api/uploads/${bookId}/${action}`, { method: 'PUT', headers });
      if (!res.ok) throw new Error(`Failed to ${action}`);
      toast(`Book ${action}d successfully!`);
      setPreviewModal({ open: false, book: null });
      fetchPending();
      fetchStats();
      if (action === 'approve') fetchCommunityBooks();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setActioning(false);
    }
  };

  const openAdd  = () => { setEditBook(null); setModalOpen(true); };
  const openEdit = (book) => { setEditBook(book); setModalOpen(true); };
  const openDel  = (book) => setDeleteModal({ open: true, book });

  // ── Filtered books ────────────────────────────────────────────────────────
  const filtered = (list) => {
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter((b) =>
      b.title?.toLowerCase().includes(q) ||
      b.author?.toLowerCase().includes(q) ||
      b.category?.toLowerCase().includes(q)
    );
  };

  // ── Books table (reused for both admin books and community books) ──────────
  const BooksTable = ({ list, showUploader = false }) => (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--border-subtle)] text-[var(--text-muted)] text-xs uppercase tracking-wider">
            <th className="px-5 py-4 font-semibold">Book</th>
            <th className="px-4 py-4 font-semibold">Category</th>
            {showUploader && <th className="px-4 py-4 font-semibold">Uploader</th>}
            <th className="px-4 py-4 font-semibold">Status</th>
            <th className="px-4 py-4 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04]">
          {filtered(list).map((book) => (
            <tr key={book._id} className="hover:bg-white/[0.02] transition-colors group">
              {/* Book info */}
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  {book.coverImage
                    ? <img src={book.coverImage.startsWith('http') ? book.coverImage : `${API_URL}${book.coverImage}`}
                        alt={book.title} className="w-9 h-12 object-cover rounded-lg border border-[var(--border-default)] flex-shrink-0" />
                    : <div className="w-9 h-12 rounded-lg bg-secondary border border-[var(--border-default)] flex items-center justify-center flex-shrink-0">
                        <BookOpen size={14} className="text-neutral-700" />
                      </div>
                  }
                  <div className="min-w-0">
                    <p className="text-[var(--text-primary)] font-semibold truncate max-w-[200px]">{book.title}</p>
                    <p className="text-[var(--text-muted)] text-xs truncate">{book.author}</p>
                  </div>
                </div>
              </td>
              {/* Category */}
              <td className="px-4 py-4">
                <span className="px-2.5 py-1 rounded-lg bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] text-xs font-semibold border border-[var(--border-default)]">
                  {book.category}
                </span>
              </td>
              {/* Uploader */}
              {showUploader && (
                <td className="px-4 py-4 text-[var(--text-secondary)] text-xs">
                  {book.uploadedBy?.username || book.uploadedBy?.displayName || '—'}
                </td>
              )}
              {/* Status */}
              <td className="px-4 py-4">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                  book.isActive
                    ? 'bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] border-[var(--border-default)]'
                    : 'bg-neutral-500/10 text-[var(--text-secondary)] border-neutral-500/20'
                }`}>
                  {book.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              {/* Actions */}
              <td className="px-4 py-4">
                <div className="flex items-center justify-end gap-1">
                  <button onClick={() => openEdit(book)}
                    className="p-2 rounded-lg bg-[var(--bg-surface-elevated)] hover:bg-blue-500/20 text-[var(--text-secondary)] transition-colors" title="Edit">
                    <Edit2 size={15} />
                  </button>
                  <button onClick={() => openDel(book)}
                    className="p-2 rounded-lg bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] transition-colors" title="Delete">
                    <Trash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {filtered(list).length === 0 && (
        <div className="py-16 text-center">
          <BookOpen size={40} className="text-neutral-800 mx-auto mb-3" />
          <p className="text-[var(--text-muted)] text-sm">{search ? 'No books match your search.' : 'No books found.'}</p>
        </div>
      )}
    </div>
  );

  const tabs = [
    { id: 'dashboard', label: 'Dashboard',       icon: BarChart3 },
    { id: 'books',     label: 'Manage Books',     icon: BookOpen  },
    { id: 'uploads',   label: `Pending (${stats.pendingUploads})`, icon: Upload },
    { id: 'community', label: 'Community Books',  icon: Users     },
  ];

  return (
    <div className="min-h-screen bg-[#050505]">
      <Toast toasts={toasts} />
      <BookModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditBook(null); }}
        onSave={handleSave}
        onSaveWithFile={handleSaveWithFile}
        initial={editBook}
        loading={saving}
      />
      <DeleteModal
        open={deleteModal.open}
        book={deleteModal.book}
        onClose={() => setDeleteModal({ open: false, book: null })}
        onConfirm={handleDelete}
        loading={deleting}
      />
      <UploadPreviewModal
        open={previewModal.open}
        book={previewModal.book}
        onClose={() => setPreviewModal({ open: false, book: null })}
        onApprove={() => handleUploadAction(previewModal.book._id, 'approve')}
        onReject={() => handleUploadAction(previewModal.book._id, 'reject')}
        loading={actioning}
      />

      <div className="container mx-auto px-4 lg:px-8 py-10">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-[var(--text-primary)] uppercase tracking-tight">Admin Panel</h1>
            <p className="text-[var(--text-muted)] text-sm mt-1">Manage ReadSphere platform resources</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full lg:w-52 flex-shrink-0">
            <div className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0">
              {tabs.map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] border border-[var(--border-strong)]'
                      : 'bg-surface text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--border-default)]'
                  }`}>
                  <tab.icon size={17} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-6">

            {/* ── DASHBOARD ─────────────────────────────────────────────── */}
            {activeTab === 'dashboard' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                  <StatCard icon={BookOpen}    label="Total Books"     value={stats.totalBooks}               iconBg="bg-[var(--bg-surface-elevated)]"    iconColor="text-[var(--text-secondary)]" />
                  <StatCard icon={CheckCircle} label="Active Books"    value={stats.activeBooks}              iconBg="bg-[var(--bg-surface-elevated)]"  iconColor="text-[var(--text-secondary)]" />
                  <StatCard icon={Upload}      label="Pending Uploads" value={stats.pendingUploads}           iconBg="bg-[var(--bg-surface-elevated)]" iconColor="text-[var(--text-secondary)]" />
                  <StatCard icon={TrendingUp}  label="Total Reads"     value={stats.totalReads?.toLocaleString()} iconBg="bg-[var(--bg-surface-elevated)]"   iconColor="text-[var(--text-secondary)]" />
                </div>

                <div className="bg-surface rounded-xl border border-[var(--border-subtle)] p-7">
                  <h2 className="text-base font-bold text-[var(--text-primary)] mb-5">Quick Actions</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { id: 'books',     icon: BookOpen, title: 'Manage Books',    desc: 'Add, edit or delete books' },
                      { id: 'uploads',   icon: Upload,   title: 'Review Uploads',  desc: 'Approve or reject user uploads' },
                      { id: 'community', icon: Users,    title: 'Community Books', desc: 'View approved user books' },
                    ].map((a) => (
                      <button key={a.id} onClick={() => setActiveTab(a.id)}
                        className="p-5 bg-secondary hover:bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] rounded-xl text-left transition-all group">
                        <a.icon size={22} className="text-[var(--text-primary)] mb-3" />
                        <p className="text-[var(--text-primary)] font-semibold text-sm group-hover:text-[var(--text-secondary)] transition-colors">{a.title}</p>
                        <p className="text-[var(--text-muted)] text-xs mt-1">{a.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ── MANAGE BOOKS — Add New Book only ─────────────────────── */}
            {activeTab === 'books' && (
              <div className="max-w-2xl">
                <div className="bg-surface rounded-xl border border-[var(--border-subtle)] overflow-hidden">
                  <div className="flex items-center gap-3 px-7 py-5 border-b border-[var(--border-subtle)]">
                    <div className="w-10 h-10 rounded-xl bg-[var(--bg-surface-elevated)] flex items-center justify-center">
                      <Plus size={20} className="text-[var(--text-secondary)]" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-[var(--text-primary)]">Add New Book</h2>
                      <p className="text-[var(--text-muted)] text-xs mt-0.5">Add a book by URL or upload a PDF directly</p>
                    </div>
                  </div>
                  <AddBookForm
                    token={token}
                    headers={headers}
                    onSuccess={() => { fetchStats(); fetchBooks(); toast('Book added and published!'); }}
                    toast={toast}
                  />
                </div>
              </div>
            )}

            {/* ── PENDING UPLOADS ───────────────────────────────────────── */}
            {activeTab === 'uploads' && (
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                    <Upload size={20} className="text-[var(--text-secondary)]" /> Pending Uploads
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] text-xs font-semibold border border-[var(--border-default)]">
                    {pendingUploads.length} waiting
                  </span>
                </div>

                {pendingUploads.length === 0 ? (
                  <div className="bg-surface rounded-xl border border-[var(--border-subtle)] py-20 text-center">
                    <CheckCircle size={44} className="text-green-900/40 mx-auto mb-3" />
                    <p className="text-[var(--text-muted)]">All caught up — no pending uploads!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {pendingUploads.map((book) => {
                      const cover = book.coverImage
                        ? (book.coverImage.startsWith('http') ? book.coverImage : `${API_URL}${book.coverImage}`)
                        : null;
                      return (
                        <div key={book._id} className="bg-surface border border-[var(--border-subtle)] rounded-xl overflow-hidden hover:border-[var(--border-default)] transition-all group">
                          {/* Cover strip */}
                          <div className="h-36 bg-secondary relative overflow-hidden">
                            {cover
                              ? <img src={cover} alt={book.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                              : <div className="w-full h-full flex items-center justify-center"><BookOpen size={36} className="text-neutral-800" /></div>
                            }
                            <div className="absolute inset-0 bg-gradient-to-t from-[#111111] to-transparent" />
                            <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-orange-500/20 text-[var(--text-secondary)] text-xs font-bold border border-[var(--border-default)]">
                              Pending
                            </span>
                          </div>

                          {/* Info */}
                          <div className="p-5">
                            <h3 className="text-[var(--text-primary)] font-bold text-sm mb-0.5 truncate">{book.title}</h3>
                            <p className="text-[var(--text-muted)] text-xs mb-3">by {book.author}</p>
                            <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] mb-4">
                              <span className="flex items-center gap-1"><User size={11} />{book.uploadedBy?.username || 'Unknown'}</span>
                              <span className="flex items-center gap-1"><Calendar size={11} />{new Date(book.createdAt).toLocaleDateString()}</span>
                            </div>
                            {book.description && (
                              <p className="text-[var(--text-muted)] text-xs line-clamp-2 mb-4">{book.description}</p>
                            )}

                            {/* Action buttons */}
                            <div className="flex gap-2">
                              <button onClick={() => setPreviewModal({ open: true, book })}
                                className="flex-1 py-2 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-elevated)] text-neutral-300 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5">
                                <Eye size={13} /> Preview
                              </button>
                              <button onClick={() => handleUploadAction(book._id, 'reject')} disabled={actioning}
                                className="py-2 px-3 rounded-xl bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] text-xs font-semibold transition-colors disabled:opacity-50">
                                <XCircle size={15} />
                              </button>
                              <button onClick={() => handleUploadAction(book._id, 'approve')} disabled={actioning}
                                className="py-2 px-3 rounded-xl bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] text-xs font-semibold transition-colors disabled:opacity-50">
                                <CheckCircle size={15} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── COMMUNITY BOOKS ───────────────────────────────────────── */}
            {activeTab === 'community' && (
              <div className="bg-surface rounded-xl border border-[var(--border-subtle)] overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 border-b border-[var(--border-subtle)]">
                  <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                    <Users size={20} className="text-[var(--text-secondary)]" /> Community Books
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] text-xs">{communityBooks.length}</span>
                  </h2>
                  <div className="relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search…"
                      className="pl-9 pr-4 py-2 bg-secondary border border-[var(--border-default)] rounded-xl text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-red-500 outline-none w-56" />
                  </div>
                </div>
                <BooksTable list={communityBooks} showUploader />
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;

