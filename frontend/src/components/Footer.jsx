import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Github, Twitter, Linkedin } from 'lucide-react';

const Footer = () => (
  <footer className="mt-auto pt-14 pb-8" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-subtle)' }}>
    <div className="max-w-7xl mx-auto px-4 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">

        {/* Brand */}
        <div className="lg:col-span-1 flex flex-col gap-5">
          <Link to="/" className="flex items-center gap-2.5 w-fit">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--accent)' }}>
              <BookOpen size={17} style={{ color: 'var(--accent-fg)' }} />
            </div>
            <span className="text-base font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              ReadSphere
            </span>
          </Link>
          <p className="text-sm leading-relaxed max-w-xs" style={{ color: 'var(--text-secondary)' }}>
            Your personalised smart e-book platform. Discover, read, and manage your favourite books with AI-powered insights.
          </p>
          <div className="flex items-center gap-3">
            {[
              { Icon: Github,   href: '#', label: 'GitHub'   },
              { Icon: Twitter,  href: '#', label: 'Twitter'  },
              { Icon: Linkedin, href: '#', label: 'LinkedIn' },
            ].map(({ Icon, href, label }) => (
              <a key={label} href={href} aria-label={label}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent-light)'; e.currentTarget.style.borderColor = 'var(--accent-border)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}>
                <Icon size={15} />
              </a>
            ))}
          </div>
        </div>

        {/* Links */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 lg:col-span-3">
          {[
            { title: 'Explore', links: [{ to: '/', label: 'Home' }, { to: '/discover', label: 'Discover Books' }] },
            { title: 'Account', links: [{ to: '/login', label: 'Sign In' }, { to: '/register', label: 'Create Account' }, { to: '/profile', label: 'My Library' }] },
            { title: 'Legal',   links: [{ to: '/terms', label: 'Terms of Service' }, { to: '/privacy', label: 'Privacy Policy' }] },
          ].map(({ title, links }) => (
            <div key={title}>
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-primary)' }}>{title}</h3>
              <ul className="flex flex-col gap-2.5">
                {links.map(({ to, label }) => (
                  <li key={label}>
                    <Link to={to} className="text-sm transition-colors duration-150"
                      style={{ color: 'var(--text-secondary)' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-light)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-6"
        style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          &copy; {new Date().getFullYear()} ReadSphere. All rights reserved.
        </p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Designed with ♥</p>
      </div>
    </div>
  </footer>
);

export default Footer;
