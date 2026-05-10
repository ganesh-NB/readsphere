import { useEffect } from 'react';

const AuthCallback = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token  = params.get('token');
    const error  = params.get('error');

    if (error || !token) { window.location.href = '/login?error=google_failed'; return; }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => r.json())
        .then(data => {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(data.user || { id: payload.userId, role: payload.role }));
          window.location.href = '/';
        })
        .catch(() => {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify({ id: payload.userId, role: payload.role || 'user' }));
          window.location.href = '/';
        });
    } catch { window.location.href = '/login?error=google_failed'; }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="text-center">
        <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin mx-auto mb-4"
          style={{ borderColor: 'var(--border-strong)', borderTopColor: 'var(--accent)' }} />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Signing you in with Google…</p>
      </div>
    </div>
  );
};

export default AuthCallback;
