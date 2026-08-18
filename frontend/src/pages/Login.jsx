import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Mail, Lock, User, Eye, EyeOff, ArrowRight, Check, Shield } from 'lucide-react';

const ADMIN_EMAIL    = 'ganesh@readsphere.com';
const ADMIN_PASSWORD = 'Ganesh@123';
const API_URL        = import.meta.env.VITE_API_URL;

/* ── Book covers shown on the left panel ──────────────────────────────────── */
const COVERS = [
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=300',
  'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=300',
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=300',
  'https://images.unsplash.com/photo-1495640388908-05fa85288e61?q=80&w=300',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300',
  'https://images.unsplash.com/photo-1519682337058-a94d519337bc?q=80&w=300',
  'https://images.unsplash.com/photo-1476275466078-4007374efbbe?q=80&w=300',
  'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=300',
  'https://images.unsplash.com/photo-1535905557558-afc4877a26fc?q=80&w=300',
];

const FEATURES = [
  'AI-powered summaries & insights',
  'Build your personal reading library',
  'Upload & share your own books',
];

/* ── Shared input wrapper ─────────────────────────────────────────────────── */
const Field = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
      {label}
    </label>
    {children}
  </div>
);

const InputIcon = ({ icon: Icon, children, right }) => (
  <div className="relative">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <Icon size={15} style={{ color: 'var(--text-muted)' }} />
    </div>
    {React.cloneElement(children, {
      className: `${children.props.className || ''} pl-9 ${right ? 'pr-10' : ''}`,
    })}
    {right && (
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
        {right}
      </div>
    )}
  </div>
);

/* ── Main component ───────────────────────────────────────────────────────── */
const Login = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const redirectMsg = location.state?.message || '';

  const [tab,             setTab]             = useState('login');   // 'login' | 'register' | 'admin'
  const [showPass,        setShowPass]        = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState('');
  const [success,         setSuccess]         = useState('');
  const [form,            setForm]            = useState({ username: '', email: '', password: '', confirm: '' });

  const handle = (e) => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setError(''); };
  const reset  = ()  => { setForm({ username: '', email: '', password: '', confirm: '' }); setError(''); setSuccess(''); setShowPass(false); setShowConfirm(false); };
  const switchTab = (t) => { setTab(t); reset(); };

  /* ── Admin login ──────────────────────────────────────────────────────── */
  const handleAdmin = async (e) => {
    e.preventDefault();
    setError('');
    const email = form.email.trim().toLowerCase();
    const pass  = form.password.trim();
    if (!email || !pass) { setError('Both fields are required.'); return; }
    setLoading(true);
    try {

      const res = await fetch(`${API_URL}/api/auth/login`, {
     method: 'POST',
     credentials: 'include',
      headers: {
    'Content-Type': 'application/json'
      },
      body: JSON.stringify({
    email,
    password: pass
     }),
   });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid credentials.');
      if (data.user?.role !== 'admin') throw new Error('This account does not have admin access.');
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = '/admin';
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  /* ── User login / register ────────────────────────────────────────────── */
  const handleUser = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (tab === 'register' && !form.username.trim()) { setError('Username is required.'); return; }
    if (!form.email.trim())  { setError('Email is required.'); return; }
    if (!form.password)      { setError('Password is required.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (tab === 'register' && form.password !== form.confirm) { setError('Passwords do not match.'); return; }

    setLoading(true);
    try {
      if (tab === 'login') {
        const res  = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: form.email.trim(), password: form.password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Login failed.');
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/';
      } else {
        const regRes  = await fetch(`${API_URL}/api/auth/register`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: form.username.trim(), email: form.email.trim(), password: form.password }),
        });
        const regData = await regRes.json();
        if (!regRes.ok) throw new Error(regData.message || 'Registration failed.');
        setSuccess('Account created! Signing you in…');
        const loginRes  = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: form.email.trim(), password: form.password }),
        });
        const loginData = await loginRes.json();
        if (loginRes.ok) {
          localStorage.setItem('token', loginData.token);
          localStorage.setItem('user', JSON.stringify(loginData.user));
          setTimeout(() => { window.location.href = '/'; }, 700);
        } else {
          setSuccess('Account created! Please sign in.');
          setTimeout(() => switchTab('login'), 1200);
        }
      }
    } catch (err) {
      setError(err.message === 'Failed to fetch'
        ? 'Cannot reach the server. Make sure the backend is running.'
        : err.message);
    } finally { setLoading(false); }
  };

  const isAdmin = tab === 'admin';

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>

      {/* ── LEFT: Visual panel ──────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] flex-col relative overflow-hidden"
        style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-subtle)' }}>

        {/* Logo */}
        <div className="p-10 flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--accent)' }}>
            <BookOpen size={17} style={{ color: 'var(--accent-fg)' }} />
          </div>
          <span className="text-base font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            ReadSphere
          </span>
        </div>

        {/* Hero copy */}
        <div className="px-10 pb-8 flex-1 flex flex-col justify-center">
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
            Your reading companion
          </p>
          <h1 className="text-4xl xl:text-5xl font-black leading-tight mb-6 tracking-tight"
            style={{ color: 'var(--text-primary)' }}>
            Read more.<br />Learn faster.<br />
            <span className="text-gradient">Think deeper.</span>
          </h1>
          <ul className="space-y-3 mb-10">
            {FEATURES.map(f => (
              <li key={f} className="flex items-center gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: 'var(--bg-surface-elevated)' }}>
                  <Check size={11} style={{ color: 'var(--text-primary)' }} />
                </div>
                {f}
              </li>
            ))}
          </ul>

          {/* Book cover grid */}
          <div className="grid grid-cols-3 gap-2.5 max-w-xs">
            {COVERS.slice(0, 9).map((src, i) => (
              <div key={i} className="aspect-[2/3] rounded-lg overflow-hidden"
                style={{ border: '1px solid var(--border-subtle)', opacity: 0.7 + (i % 3) * 0.1 }}>
                <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div className="px-10 py-8 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
          <p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>
            "A reader lives a thousand lives before he dies."
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>— George R.R. Martin</p>
        </div>
      </div>

      {/* ── RIGHT: Auth form ─────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2.5 mb-10 justify-center">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--accent)' }}>
              <BookOpen size={17} style={{ color: 'var(--accent-fg)' }} />
            </div>
            <span className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>ReadSphere</span>
          </div>

          {/* Tab switcher */}
          <div className="flex rounded-lg p-1 mb-8"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            {[
              { id: 'login',    label: 'Sign In'  },
              { id: 'register', label: 'Register' },
              { id: 'admin',    label: 'Admin'    },
            ].map(({ id, label }) => (
              <button key={id} onClick={() => switchTab(id)}
                className="flex-1 py-2 rounded-md text-xs font-semibold transition-all duration-150"
                style={{
                  background: tab === id ? 'var(--accent)' : 'transparent',
                  color:      tab === id ? 'var(--accent-fg)' : 'var(--text-muted)',
                }}>
                {label}
              </button>
            ))}
          </div>

          {/* Heading */}
          <div className="mb-7">
            <h2 className="text-2xl font-bold tracking-tight mb-1" style={{ color: 'var(--text-primary)' }}>
              {tab === 'login'    ? 'Welcome back'       :
               tab === 'register' ? 'Create an account'  :
                                    'Admin access'}
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {tab === 'login'    ? 'Sign in to continue your reading journey.' :
               tab === 'register' ? 'Join ReadSphere and start reading today.'  :
                                    'Restricted to authorised administrators.'}
            </p>
          </div>

          {/* Redirect message */}
          {redirectMsg && (
            <div className="mb-5 px-4 py-3 rounded-lg text-sm flex items-center gap-2"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
              <BookOpen size={14} style={{ color: 'var(--text-muted)' }} />
              {redirectMsg}
            </div>
          )}

          {/* Admin hint */}
          {isAdmin && (
            <div className="mb-5 px-4 py-3 rounded-lg text-xs space-y-0.5"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
              <p className="font-semibold text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
              </p>
            </div>
          )}

          {/* Error / Success */}
          {error && (
            <div className="mb-5 px-4 py-3 rounded-lg text-sm"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }}>
              {error}
            </div>
          )}
          {success && (
            <div className="mb-5 px-4 py-3 rounded-lg text-sm flex items-center gap-2"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
              <Check size={14} /> {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={isAdmin ? handleAdmin : handleUser} className="space-y-4">

            {/* Username — register only */}
            {tab === 'register' && (
              <Field label="Username">
                <InputIcon icon={User}>
                  <input name="username" type="text" value={form.username} onChange={handle}
                    placeholder="John Doe" autoComplete="username" className="input" />
                </InputIcon>
              </Field>
            )}

            {/* Email */}
            <Field label="Email address">
              <InputIcon icon={Mail}>
                <input name="email" type="email" value={form.email} onChange={handle}
                  placeholder={isAdmin ? ADMIN_EMAIL : 'you@example.com'}
                  autoComplete="email" className="input" />
              </InputIcon>
            </Field>

            {/* Password */}
            <Field label="Password">
              <InputIcon icon={Lock}
                right={
                  <button type="button" onClick={() => setShowPass(p => !p)}
                    style={{ color: 'var(--text-muted)' }}
                    className="hover:opacity-70 transition-opacity">
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                }>
                <input name="password" type={showPass ? 'text' : 'password'} value={form.password} onChange={handle}
                  placeholder="••••••••" autoComplete={tab === 'register' ? 'new-password' : 'current-password'}
                  className="input" />
              </InputIcon>
            </Field>

            {/* Confirm password — register only */}
            {tab === 'register' && (
              <Field label="Confirm password">
                <InputIcon icon={Lock}
                  right={
                    <button type="button" onClick={() => setShowConfirm(p => !p)}
                      style={{ color: 'var(--text-muted)' }}
                      className="hover:opacity-70 transition-opacity">
                      {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  }>
                  <input name="confirm" type={showConfirm ? 'text' : 'password'} value={form.confirm} onChange={handle}
                    placeholder="••••••••" autoComplete="new-password" className="input" />
                </InputIcon>
              </Field>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="btn btn-primary w-full justify-center py-2.5 mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {tab === 'login' ? 'Signing in…' : tab === 'register' ? 'Creating account…' : 'Verifying…'}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {tab === 'login'    ? 'Sign In'          :
                   tab === 'register' ? 'Create Account'   :
                                        'Access Dashboard'}
                  <ArrowRight size={15} />
                </span>
              )}
            </button>
          </form>

          {/* Google OAuth — user tabs only */}
          {!isAdmin && (
            <>
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full" style={{ borderTop: '1px solid var(--border-subtle)' }} />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 text-xs" style={{ background: 'var(--bg-primary)', color: 'var(--text-muted)' }}>
                    or continue with
                  </span>
                </div>
              </div>

              <a href={`${API_URL}/api/auth/google`}
                className="flex items-center justify-center gap-3 w-full py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-strong)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-default)'}>
                {/* Google G icon */}
                <svg width="16" height="16" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                Continue with Google
              </a>
            </>
          )}

          {/* Switch tab hint */}
          {!isAdmin && (
            <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
              {tab === 'login' ? (
                <>Don't have an account?{' '}
                  <button onClick={() => switchTab('register')}
                    className="font-semibold transition-colors"
                    style={{ color: 'var(--text-primary)' }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                    Create one
                  </button>
                </>
              ) : (
                <>Already have an account?{' '}
                  <button onClick={() => switchTab('login')}
                    className="font-semibold transition-colors"
                    style={{ color: 'var(--text-primary)' }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                    Sign in
                  </button>
                </>
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
