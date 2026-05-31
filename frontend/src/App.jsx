import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Discover from './pages/Discover';
import BookDetails from './pages/BookDetails';
import Reader from './pages/Reader';
import Admin from './pages/Admin';
import Profile from './pages/Profile';
import UploadBook from './pages/UploadBook';
import AuthCallback from './pages/AuthCallback';

const isAuthed = () => {
  try { return !!(localStorage.getItem('token') && localStorage.getItem('user')); }
  catch { return false; }
};

// ── Public layout — navbar always visible, no auth required ───────────────────
const PublicLayout = () => (
  <>
    <Navbar />
    <main className="flex-grow pt-[80px]">
      <Outlet />
    </main>
    <Footer />
  </>
);

// ── Protected layout — redirects to /login if not authed ──────────────────────
const ProtectedLayout = () => {
  if (!isAuthed()) return <Navigate to="/login" replace />;
  return (
    <>
      <Navbar />
      <main className="flex-grow pt-[80px]">
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

// ── Auth layout — no navbar, redirects away if already authed ─────────────────
const AuthLayout = () => {
  if (isAuthed()) return <Navigate to="/" replace />;
  return <main className="flex-grow"><Outlet /></main>;
};

const App = () => (
  <Router>
    <div className="flex flex-col min-h-screen">
      <Routes>

        {/* ── Fully public (visible to guests) ──────────────────────────── */}
        <Route element={<PublicLayout />}>
          <Route path="/"         element={<Home />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/book/:id" element={<BookDetails />} />
        </Route>

        {/* ── Auth pages ────────────────────────────────────────────────── */}
        <Route element={<AuthLayout />}>
          <Route path="/login"         element={<Login />} />
          <Route path="/register"      element={<Register />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Route>

        {/* ── Protected (login required) ────────────────────────────────── */}
        <Route element={<ProtectedLayout />}>
          <Route path="/read/:id" element={<Reader />} />
          <Route path="/profile"  element={<Profile />} />
          <Route path="/upload"   element={<UploadBook />} />
          <Route path="/admin/*"  element={<Admin />} />
        </Route>

        {/* ── Catch-all ─────────────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </div>
  </Router>
);
export default App;
