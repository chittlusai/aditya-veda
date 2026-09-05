import { Link } from 'react-router-dom';
import { ShieldCheck, User, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function Header() {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass" role="banner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group" aria-label="PHISHGUARD AI Home">
          <ShieldCheck className="h-6 w-6 text-[var(--color-primary)] group-hover:scale-110 transition-transform" aria-hidden="true" />
          <span className="font-extrabold text-base tracking-tight text-slate-900">
            PHISHGUARD<span className="gradient-text">AI</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
          <a href="#cyber-attacks" className="btn-ghost text-xs font-semibold text-orange-600">Cyber Attacks</a>
          <a href="#tools" className="btn-ghost text-xs">Tools</a>
          <a href="#features" className="btn-ghost text-xs">Features</a>
          <a href="#how-it-works" className="btn-ghost text-xs">How it works</a>
        </nav>

        {/* Desktop Auth */}
        <div className="hidden md:flex gap-3 items-center">
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn-primary text-sm">
              <User size={15} aria-hidden="true" /> Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn-ghost text-sm">Log in</Link>
              <Link to="/signup" className="btn-primary text-sm">Get Started</Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden btn-ghost"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <nav className="md:hidden glass border-t border-[var(--color-border)] px-4 py-4 space-y-2" aria-label="Mobile navigation">
          <a href="#cyber-attacks" className="block btn-ghost w-full text-left font-semibold text-orange-600" onClick={() => setOpen(false)}>Cyber Attacks Portal</a>
          <a href="#tools" className="block btn-ghost w-full text-left" onClick={() => setOpen(false)}>Tools</a>
          <a href="#features" className="block btn-ghost w-full text-left" onClick={() => setOpen(false)}>Features</a>
          <a href="#how-it-works" className="block btn-ghost w-full text-left" onClick={() => setOpen(false)}>How it works</a>
          <div className="flex gap-3 pt-3 border-t border-[var(--color-border)]">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn-primary text-sm flex-1 text-center" onClick={() => setOpen(false)}>Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-sm flex-1 text-center" onClick={() => setOpen(false)}>Log in</Link>
                <Link to="/signup" className="btn-primary text-sm flex-1 text-center" onClick={() => setOpen(false)}>Get Started</Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
