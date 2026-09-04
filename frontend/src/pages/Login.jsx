import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Mail, Lock, User, Eye, EyeOff, ArrowRight, Check, AlertCircle, ShieldCheck } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const COVERS = [
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=300',
  'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=300',
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=300',
  'https://images.unsplash.com/photo-1495640388908-05fa85288e61?q=80&w=300',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300',
];

const FEATURES = [
  'AI-powered summaries & insights',
  'Build your personal reading library',
  'Upload & share your own books',
];

const TABS = [
  { id: 'login',    label: 'Sign In'  },
  { id: 'register', label: 'Register' },
  { id: 'admin',    label: 'Admin'    },
];

const Field = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-medium uppercase tracking-wider text-[#1C1A17]" style={{ fontFamily: "'Inter', sans-serif" }}>
      {label}
    </label>
    {children}
  </div>
);

const InputIcon = ({ icon: Icon, children, right }) => (
  <div className="relative">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <Icon size={15} className="text-[#DAD4C8]" />
    </div>
    {React.cloneElement(children, {
      className: `w-full bg-transparent border border-[#DAD4C8] rounded-none py-2.5 pl-9 ${right ? 'pr-10' : ''} text-sm text-[#1C1A17] focus:outline-none focus:border-[#B8935F] focus:ring-1 focus:ring-[#B8935F] transition-colors`,
      style: { fontFamily: "'Inter', sans-serif" }
    })}
    {right && (
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
        {right}
      </div>
    )}
  </div>
);

const getStrength = (pwd) => {
  if (!pwd) return 0;
  let score = 0;
  if (pwd.length >= 6) score++;
  if (pwd.length >= 10) score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  if (/\d/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) score++;
  return Math.min(score, 4);
};

const STRENGTH_META = [
  { label: '',       color: 'transparent' },
  { label: 'Weak',   color: '#ef4444' },
  { label: 'Fair',   color: '#f59e0b' },
  { label: 'Good',   color: '#2E4034' },
  { label: 'Strong', color: '#2E4034' },
];

const Login = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const redirectMsg = location.state?.message || '';

  const [tab, setTab] = useState('login');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });

  const tabRefs = useRef({});
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  const handle = (e) => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setError(''); };
  const reset  = ()  => { setForm({ username: '', email: '', password: '', confirm: '' }); setError(''); setSuccess(''); setShowPass(false); setShowConfirm(false); };
  const switchTab = (t) => { setTab(t); reset(); };

  const isAdmin = tab === 'admin';
  const strength = getStrength(form.password);

  useEffect(() => {
    const el = tabRefs.current[tab];
    if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
  }, [tab]);

  const handleAdmin = async (e) => {
    e.preventDefault();
    setError('');
    const email = form.email.trim().toLowerCase();
    const pass  = form.password.trim();
    if (!email || !pass) { setError('Both fields are required.'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
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
      setError(err.message === 'Failed to fetch' ? 'Cannot reach the server.' : err.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex bg-[#FAF7F0] text-[#1C1A17]" style={{ fontFamily: "'Inter', sans-serif" }}>
      
      {/* ── LEFT: Visual panel (Book Jacket) ────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[50%] flex-col relative overflow-hidden border-r border-[#DAD4C8] bg-[#FAF7F0]">
        
        {/* Logo */}
        <div className="p-12 flex items-center gap-3 shrink-0">
          <BookOpen size={24} className="text-[#2E4034]" />
          <span className="text-xl font-bold tracking-tight text-[#1C1A17]" style={{ fontFamily: "'Fraunces', serif" }}>
            ReadSphere
          </span>
        </div>

        {/* Hero copy */}
        <div className="px-12 pb-12 flex-1 flex flex-col justify-center">
          <h1 className="text-5xl xl:text-6xl font-medium leading-[1.1] tracking-tight mb-8 text-[#1C1A17]" style={{ fontFamily: "'Fraunces', serif" }}>
            Read more.<br />Learn faster.<br />
            <span className="italic text-[#B8935F]">Think deeper.</span>
          </h1>

          <ul className="space-y-4 mb-14 border-l border-[#2E4034] pl-4">
            {FEATURES.map((f, i) => (
              <li key={f} className="flex items-center gap-3 text-sm text-[#1C1A17]">
                <Check size={14} className="text-[#B8935F]" />
                {f}
              </li>
            ))}
          </ul>

          {/* Book covers arranged as an offset "shelf" */}
          <div className="flex items-end gap-4 h-48 w-full max-w-lg">
            {COVERS.slice(0, 4).map((src, i) => (
              <div key={i} 
                   className="w-[22%] aspect-[2/3] shrink-0 border border-[#DAD4C8] bg-white relative grayscale-[20%]"
                   style={{
                     transform: `translateY(${i % 2 === 0 ? '0' : '1.5rem'})`,
                     zIndex: 4 - i,
                   }}>
                <img src={src} alt="" className="w-full h-full object-cover mix-blend-multiply opacity-90" loading="lazy" />
              </div>
            ))}
          </div>
        </div>

        {/* Bottom pull-quote */}
        <div className="px-12 py-10 border-t border-[#DAD4C8] bg-[#FAF7F0]">
          <p className="text-lg italic text-[#1C1A17]" style={{ fontFamily: "'Fraunces', serif" }}>
            “A reader lives a thousand lives before he dies.”
          </p>
          <p className="text-sm mt-3 tracking-wide uppercase text-[#1C1A17] opacity-70">
            — George R.R. Martin
          </p>
        </div>
      </div>

      {/* ── RIGHT: Auth form ─────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-12 justify-center border-b border-[#DAD4C8] pb-6">
            <BookOpen size={20} className="text-[#2E4034]" />
            <span className="text-xl font-bold text-[#1C1A17]" style={{ fontFamily: "'Fraunces', serif" }}>ReadSphere</span>
          </div>

          {/* Plain text tab switcher with underline indicator */}
          <div className="relative flex mb-10 border-b border-[#DAD4C8]">
            <div className="absolute bottom-[-1px] h-[2px]"
              style={{
                left: indicator.left, width: indicator.width, background: '#2E4034',
                transition: 'left 220ms ease, width 220ms ease',
              }} />
            {TABS.map(({ id, label }) => (
              <button key={id} ref={el => (tabRefs.current[id] = el)} type="button" onClick={() => switchTab(id)}
                className="relative z-10 flex-1 py-3 text-sm font-medium transition-colors uppercase tracking-wider"
                style={{ color: tab === id ? '#1C1A17' : '#9ca3af' }}>
                {label}
              </button>
            ))}
          </div>

          {/* Heading */}
          <div className="mb-8" key={`heading-${tab}`}>
            <h2 className="text-3xl mb-2 text-[#1C1A17]" style={{ fontFamily: "'Fraunces', serif" }}>
              {tab === 'login' ? 'Welcome back.' : tab === 'register' ? 'Create an account.' : 'Admin access.'}
            </h2>
            <p className="text-sm text-[#1C1A17] opacity-70">
              {tab === 'login' ? 'Sign in to continue your reading journey.' : tab === 'register' ? 'Join ReadSphere and start reading today.' : 'Restricted to authorised administrators.'}
            </p>
          </div>

          {/* Redirect & Messages */}
          {redirectMsg && (
            <div className="mb-6 p-4 border border-[#DAD4C8] text-sm flex items-center gap-3 bg-white">
              <BookOpen size={16} className="text-[#B8935F]" /> {redirectMsg}
            </div>
          )}
          {isAdmin && (
            <div className="mb-6 p-4 border border-[#DAD4C8] text-xs flex items-start gap-3 bg-white">
              <ShieldCheck size={16} className="shrink-0 mt-0.5 text-[#B8935F]" />
              <span className="opacity-80 leading-relaxed">Admin accounts are provisioned manually. Contact your workspace owner if you believe you should have access.</span>
            </div>
          )}
          {error && (
            <div className="mb-6 p-4 border border-[#ef4444] text-sm flex items-center gap-3 bg-[#fef2f2] text-[#b91c1c]">
              <AlertCircle size={16} className="shrink-0" /> {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 border border-[#2E4034] text-sm flex items-center gap-3 text-[#2E4034]" style={{ backgroundColor: 'rgba(46,64,52,0.05)' }}>
              <Check size={16} className="shrink-0" /> {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={isAdmin ? handleAdmin : handleUser} className="space-y-5">
            {tab === 'register' && (
              <Field label="Username">
                <InputIcon icon={User}><input name="username" type="text" value={form.username} onChange={handle} placeholder="John Doe" autoComplete="username" /></InputIcon>
              </Field>
            )}

            <Field label="Email address">
              <InputIcon icon={Mail}><input name="email" type="email" value={form.email} onChange={handle} placeholder={isAdmin ? 'admin@yourcompany.com' : 'you@example.com'} autoComplete="email" /></InputIcon>
            </Field>

            <Field label="Password">
              <InputIcon icon={Lock}
                right={<button type="button" onClick={() => setShowPass(p => !p)} className="text-[#9ca3af] hover:text-[#1C1A17] transition-colors">{showPass ? <EyeOff size={15} /> : <Eye size={15} />}</button>}>
                <input name="password" type={showPass ? 'text' : 'password'} value={form.password} onChange={handle} placeholder="••••••••" autoComplete={tab === 'register' ? 'new-password' : 'current-password'} />
              </InputIcon>

              {tab === 'register' && form.password && (
                <div className="pt-2">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map(i => (
                      <div key={i} className="h-[2px] flex-1" style={{ background: i < strength ? STRENGTH_META[strength].color : '#DAD4C8', transition: 'background 200ms ease' }} />
                    ))}
                  </div>
                  <p className="text-[10px] uppercase tracking-wider mt-1.5 font-bold" style={{ color: STRENGTH_META[strength].color || '#DAD4C8' }}>
                    {STRENGTH_META[strength].label}
                  </p>
                </div>
              )}
            </Field>

            {tab === 'register' && (
              <Field label="Confirm password">
                <InputIcon icon={Lock} right={<button type="button" onClick={() => setShowConfirm(p => !p)} className="text-[#9ca3af] hover:text-[#1C1A17] transition-colors">{showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}</button>}>
                  <input name="confirm" type={showConfirm ? 'text' : 'password'} value={form.confirm} onChange={handle} placeholder="••••••••" autoComplete="new-password" />
                </InputIcon>
              </Field>
            )}

            {tab === 'login' && (
              <div className="flex justify-end -mt-2">
                <button type="button" onClick={() => navigate('/forgot-password')} className="text-xs font-medium underline decoration-[#DAD4C8] underline-offset-4 hover:decoration-[#1C1A17] transition-colors text-[#1C1A17] opacity-70 hover:opacity-100">
                  Forgot password?
                </button>
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full flex justify-center py-3 mt-4 text-sm font-medium tracking-wide uppercase disabled:opacity-50 disabled:cursor-not-allowed bg-[#2E4034] text-[#FAF7F0] hover:bg-black transition-colors rounded-none">
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Processing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {tab === 'login' ? 'Sign In' : tab === 'register' ? 'Create Account' : 'Access Dashboard'}
                  <ArrowRight size={15} />
                </span>
              )}
            </button>
          </form>

          {!isAdmin && (
            <>
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#DAD4C8]" /></div>
                <div className="relative flex justify-center"><span className="px-4 text-xs uppercase tracking-widest bg-[#FAF7F0] text-[#9ca3af]">or</span></div>
              </div>

              <a href={`${API_URL}/api/auth/google`} className="flex items-center justify-center gap-3 w-full py-3 text-sm font-medium tracking-wide bg-transparent border border-[#DAD4C8] hover:border-[#1C1A17] transition-colors rounded-none text-[#1C1A17]">
                <svg width="16" height="16" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                Continue with Google
              </a>

              <p className="mt-8 text-center text-sm text-[#1C1A17] opacity-80">
                {tab === 'login' ? (
                  <>Don't have an account? <button onClick={() => switchTab('register')} className="font-medium underline decoration-[#DAD4C8] underline-offset-4 hover:decoration-[#1C1A17] transition-colors">Create one</button></>
                ) : (
                  <>Already have an account? <button onClick={() => switchTab('login')} className="font-medium underline decoration-[#DAD4C8] underline-offset-4 hover:decoration-[#1C1A17] transition-colors">Sign in</button></>
                )}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;