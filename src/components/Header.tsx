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

        {/* Mobile Hamburger (Min 44x44px touch target) */}
        <button
          className="md:hidden w-11 h-11 flex items-center justify-center rounded-xl bg-slate-100/90 hover:bg-orange-50 hover:text-orange-600 text-slate-700 border border-slate-200 transition-all cursor-pointer active:scale-95"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {open && (
        <nav className="md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-200 px-4 py-5 space-y-2 shadow-2xl animate-in slide-in-from-top-3 duration-200" aria-label="Mobile navigation">
          <a
            href="#cyber-attacks"
            className="flex items-center min-h-[44px] px-3.5 rounded-xl font-bold text-orange-600 bg-orange-50/70 border border-orange-200/50"
            onClick={() => setOpen(false)}
          >
            Cyber Attacks Portal
          </a>
          <a
            href="#tools"
            className="flex items-center min-h-[44px] px-3.5 rounded-xl text-slate-700 font-semibold hover:bg-slate-100 active:bg-slate-200 transition-colors"
            onClick={() => setOpen(false)}
          >
            Defense Tools
          </a>
          <a
            href="#features"
            className="flex items-center min-h-[44px] px-3.5 rounded-xl text-slate-700 font-semibold hover:bg-slate-100 active:bg-slate-200 transition-colors"
            onClick={() => setOpen(false)}
          >
            Features & AI Engine
          </a>
          <a
            href="#how-it-works"
            className="flex items-center min-h-[44px] px-3.5 rounded-xl text-slate-700 font-semibold hover:bg-slate-100 active:bg-slate-200 transition-colors"
            onClick={() => setOpen(false)}
          >
            How It Works
          </a>

          <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row gap-2.5">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="btn-primary min-h-[44px] text-sm flex-1 text-center font-bold flex items-center justify-center gap-2 shadow-sm"
                onClick={() => setOpen(false)}
              >
                <User size={16} /> Open Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="btn-secondary min-h-[44px] text-sm flex-1 text-center font-semibold flex items-center justify-center"
                  onClick={() => setOpen(false)}
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="btn-primary min-h-[44px] text-sm flex-1 text-center font-bold flex items-center justify-center shadow-sm"
                  onClick={() => setOpen(false)}
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
