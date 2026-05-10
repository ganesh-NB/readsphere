import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Upload, AlertCircle, CheckCircle, ArrowLeft, FileText, X, Image } from 'lucide-react';

const API_URL   = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const CATEGORIES = ['Fiction','Mystery','Romance','Sci-Fi','Horror','History','Classic','Adventure','Poetry','Self-Help','Productivity','Thriller','Other'];

const UploadBook = () => {
  const [fields, setFields] = useState({ title:'', author:'', description:'', category:'Fiction', pages:'', publishYear:'' });
  const [pdfFile,      setPdfFile]      = useState(null);
  const [coverFile,    setCoverFile]    = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [progress,     setProgress]    = useState(0);
  const [submitting,   setSubmitting]  = useState(false);
  const [error,        setError]       = useState('');
  const [success,      setSuccess]     = useState('');
  const pdfRef   = useRef(null);
  const coverRef = useRef(null);
  const token    = localStorage.getItem('token');

  const handleField = (e) => setFields(p => ({ ...p, [e.target.name]: e.target.value }));

  const handlePdf = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== 'application/pdf') { setError('Only PDF files are accepted.'); return; }
    if (f.size > 50 * 1024 * 1024)   { setError('PDF must be under 50 MB.'); return; }
    setError(''); setPdfFile(f);
  };

  const handleCover = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setCoverFile(f); setCoverPreview(URL.createObjectURL(f));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) { const dt = new DataTransfer(); dt.items.add(f); pdfRef.current.files = dt.files; handlePdf({ target: { files: dt.files } }); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!fields.title.trim())  { setError('Book title is required.'); return; }
    if (!fields.author.trim()) { setError('Author name is required.'); return; }
    if (!pdfFile)              { setError('Please select a PDF file.'); return; }

    setSubmitting(true); setProgress(0);
    try {
      const fd = new FormData();
      fd.append('bookFile', pdfFile);
      fd.append('title',       fields.title.trim());
      fd.append('author',      fields.author.trim());
      fd.append('description', fields.description.trim());
      fd.append('category',    fields.category);
      fd.append('pages',       fields.pages);
      fd.append('publishYear', fields.publishYear);
      if (coverFile) fd.append('coverImage', coverFile);

      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${API_URL}/api/uploads`);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.upload.onprogress = (ev) => { if (ev.lengthComputable) setProgress(Math.round((ev.loaded/ev.total)*100)); };
        xhr.onload = () => {
          try { resolve(JSON.parse(xhr.responseText)); }
          catch { reject(new Error('Upload failed.')); }
        };
        xhr.onerror = () => reject(new Error('Network error.'));
        xhr.send(fd);
      });

      setSuccess('Book uploaded! It will be reviewed by an admin before going live.');
      setFields({ title:'', author:'', description:'', category:'Fiction', pages:'', publishYear:'' });
      setPdfFile(null); setCoverFile(null); setCoverPreview(''); setProgress(0);
      if (pdfRef.current)   pdfRef.current.value   = '';
      if (coverRef.current) coverRef.current.value = '';
    } catch (err) { setError(err.message || 'Upload failed.'); }
    finally { setSubmitting(false); }
  };

  const inp = {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-default)',
    color: 'var(--text-primary)',
  };

  return (
    <div className="min-h-screen px-4 lg:px-8 py-10" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-2xl mx-auto">

        <Link to="/profile" className="inline-flex items-center gap-2 text-sm mb-8 transition-colors"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
          <ArrowLeft size={15} /> Back to Profile
        </Link>

        <div className="p-8 rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>

          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--accent)' }}>
              <Upload size={22} style={{ color: 'var(--accent-fg)' }} />
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Upload Your Book</h1>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Share your book with the ReadSphere community</p>
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-5 px-4 py-3 rounded-lg flex items-center gap-3 text-sm"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }}>
              <AlertCircle size={15} style={{ color: 'var(--text-muted)' }} className="shrink-0" /> {error}
            </div>
          )}
          {success && (
            <div className="mb-5 px-4 py-3 rounded-lg flex items-center gap-3 text-sm"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
              <CheckCircle size={15} className="shrink-0" /> {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Title + Author */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[['title','Book Title *','Enter book title'],['author','Author *','Enter author name']].map(([name,label,ph]) => (
                <div key={name}>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{label}</label>
                  <input name={name} type="text" required value={fields[name]} onChange={handleField}
                    placeholder={ph} className="input w-full" style={inp} />
                </div>
              ))}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Description</label>
              <textarea name="description" value={fields.description} onChange={handleField}
                placeholder="Brief description…" rows={3}
                className="input w-full resize-none" style={inp} />
            </div>

            {/* Category + Pages + Year */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Category</label>
                <select name="category" value={fields.category} onChange={handleField} className="input w-full" style={inp}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Pages</label>
                <input name="pages" type="number" value={fields.pages} onChange={handleField} placeholder="300" min="1" className="input w-full" style={inp} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Year</label>
                <input name="publishYear" value={fields.publishYear} onChange={handleField} placeholder="2020" className="input w-full" style={inp} />
              </div>
            </div>

            {/* PDF drop zone */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Book PDF *</label>
              <div onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}
                onClick={() => pdfRef.current?.click()}
                className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-150"
                style={{ borderColor: pdfFile ? 'var(--border-strong)' : 'var(--border-default)', background: pdfFile ? 'var(--bg-surface-elevated)' : 'transparent' }}>
                <input ref={pdfRef} type="file" accept="application/pdf" onChange={handlePdf} className="hidden" />
                {pdfFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileText size={20} style={{ color: 'var(--text-secondary)' }} />
                    <div className="text-left">
                      <p className="text-sm font-semibold truncate max-w-[200px]" style={{ color: 'var(--text-primary)' }}>{pdfFile.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{(pdfFile.size/1024/1024).toFixed(2)} MB</p>
                    </div>
                    <button type="button" onClick={(e) => { e.stopPropagation(); setPdfFile(null); if (pdfRef.current) pdfRef.current.value=''; }}
                      className="ml-auto" style={{ color: 'var(--text-muted)' }}>
                      <X size={15} />
                    </button>
                  </div>
                ) : (
                  <>
                    <FileText size={28} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Drop PDF here or click to browse</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Max 50 MB</p>
                  </>
                )}
              </div>

              {submitting && progress > 0 && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                    <span>Uploading…</span><span>{progress}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full" style={{ background: 'var(--bg-surface-elevated)' }}>
                    <div className="h-1.5 rounded-full transition-all" style={{ width: `${progress}%`, background: 'var(--accent)' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Cover image */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Cover Image <span style={{ color: 'var(--text-muted)' }}>(optional)</span>
              </label>
              <div className="flex items-start gap-4">
                {coverPreview && (
                  <div className="relative w-16 shrink-0">
                    <img src={coverPreview} alt="preview" className="w-16 aspect-[2/3] object-cover rounded-lg" style={{ border: '1px solid var(--border-subtle)' }} />
                    <button type="button" onClick={() => { setCoverFile(null); setCoverPreview(''); if (coverRef.current) coverRef.current.value=''; }}
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-xs"
                      style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}>
                      <X size={9} />
                    </button>
                  </div>
                )}
                <div onClick={() => coverRef.current?.click()}
                  className="flex-1 border border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors"
                  style={{ borderColor: 'var(--border-default)' }}>
                  <input ref={coverRef} type="file" accept="image/*" onChange={handleCover} className="hidden" />
                  <Image size={18} className="mx-auto mb-1.5" style={{ color: 'var(--text-muted)' }} />
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {coverFile ? coverFile.name : 'Click to upload cover (JPG, PNG, WebP)'}
                  </p>
                </div>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={submitting || !pdfFile}
              className="btn btn-primary w-full justify-center py-3 disabled:opacity-50 disabled:cursor-not-allowed">
              {submitting
                ? <><div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--accent-fg)', borderTopColor: 'transparent' }} /> Uploading… {progress > 0 && `${progress}%`}</>
                : <><Upload size={16} /> Upload Book</>
              }
            </button>
            <p className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
              Your book will be reviewed by an admin before it goes live.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadBook;
