import { type ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ShieldCheck, LayoutDashboard, Search, LogOut,
  MessageSquare, QrCode, Image as ImageIcon, ShieldAlert,
  History, Globe, Users, Menu, X, BookOpen,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/* ── Nav group data ─────────────────────────── */
const MENU = [
  {
    label: 'Overview',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, text: 'Dashboard' },
      { to: '/scans',     icon: History,         text: 'Scan History' },
      { to: '/threats',   icon: ShieldAlert,     text: 'Threat Intel' },
      { to: '/safety',    icon: BookOpen,        text: 'Safety Center' },
    ],
  },
  {
    label: 'Scanners',
    items: [
      { to: '/scan/url',        icon: Search,        text: 'URL Scanner' },
      { to: '/scan/message',    icon: MessageSquare, text: 'Message Analyzer' },
      { to: '/scan/qr',         icon: QrCode,        text: 'QR Scanner' },
      { to: '/scan/screenshot', icon: ImageIcon,     text: 'Image Inspector' },
      { to: '/scan/website',    icon: Globe,         text: 'Fake Website' },
      { to: '/scan/social',     icon: Users,         text: 'Social Scanner' },
    ],
  },
] as const;

export default function SidebarLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  const linkClass = (path: string) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
      pathname === path
        ? 'bg-orange-50 text-orange-600 font-semibold shadow-xs'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  const sidebar = (
    <>
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--color-border)] shrink-0">
        <Link to="/" className="flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-[var(--color-primary)]" aria-hidden="true" />
          <span className="font-bold text-sm">PHISHGUARD<span className="gradient-text">AI</span></span>
        </Link>
        <button className="md:hidden btn-ghost p-1" onClick={() => setOpen(false)} aria-label="Close sidebar">
          <X size={18} />
        </button>
      </div>

      {/* Nav groups */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {MENU.map((group) => (
          <div key={group.label}>
            <div className="text-[10px] font-bold text-[var(--color-foreground-subtle)] uppercase tracking-[0.15em] mb-1.5 px-3">
              {group.label}
            </div>
            <nav className="space-y-0.5" aria-label={group.label}>
              {group.items.map((item) => (
                <Link key={item.to} to={item.to} className={linkClass(item.to)} onClick={() => setOpen(false)}>
                  <item.icon size={16} aria-hidden="true" />
                  {item.text}
                </Link>
              ))}
            </nav>
          </div>
        ))}
      </div>

      {/* Bottom */}
      <div className="p-3 border-t border-[var(--color-border)] space-y-1.5 shrink-0">
        <Link
          to="/profile"
          onClick={() => setOpen(false)}
          className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-all text-left group"
        >
          <div className="w-8 h-8 rounded-lg bg-orange-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
            {(user?.name || 'CS').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-slate-900 truncate group-hover:text-orange-600 transition-colors">
              {user?.name || 'Chittlu Sai'}
            </div>
            <div className="text-[10px] text-slate-500 truncate font-mono">
              {user?.email || 'chittlusai@gmail.com'}
            </div>
          </div>
        </Link>

        <button
          onClick={() => { logout(); window.location.href = '/'; }}
          className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
        >
          <LogOut size={14} aria-hidden="true" /> End Session
        </button>
      </div>
    </>
  );

  return (
    <div className="h-screen flex overflow-hidden bg-[var(--color-background)]">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 flex-col bg-[var(--color-background-elevated)] border-r border-[var(--color-border)] shrink-0">
        {sidebar}
      </aside>

      {/* Mobile sidebar overlay */}
      {open && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden" onClick={() => setOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-[82vw] max-w-xs flex flex-col bg-white border-r border-slate-200 z-50 md:hidden shadow-2xl animate-in slide-in-from-left duration-250">
            {sidebar}
          </aside>
        </>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Mobile top bar */}
        <div className="md:hidden h-14 border-b border-slate-200 flex items-center justify-between px-3 bg-white/95 backdrop-blur-md shrink-0 z-20">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOpen(true)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 transition cursor-pointer"
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </button>
            <span className="font-bold text-sm tracking-tight">PHISHGUARD<span className="gradient-text">AI</span></span>
          </div>

          <Link
            to="/profile"
            className="w-8 h-8 rounded-lg bg-orange-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs"
          >
            {(user?.name || 'CS').charAt(0).toUpperCase()}
          </Link>
        </div>

        {/* Content viewport with safe-area bottom offset */}
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-6 lg:p-8 pb-24 md:pb-8" role="main">
          {children}
        </main>

        {/* ── Mobile Bottom Navigation Bar (Thumb Friendly) ── */}
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-2 py-1.5 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.06)] flex items-center justify-around"
          aria-label="Mobile quick navigation"
        >
          <Link
            to="/dashboard"
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-w-[56px] min-h-[44px] ${
              pathname === '/dashboard'
                ? 'text-orange-600 font-bold bg-orange-50/70'
                : 'text-slate-600 hover:text-slate-900 active:bg-slate-100'
            }`}
          >
            <LayoutDashboard size={18} />
            <span className="text-[10px] mt-0.5 tracking-tight">Dashboard</span>
          </Link>

          <Link
            to="/scan/url"
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-w-[56px] min-h-[44px] ${
              pathname === '/scan/url'
                ? 'text-orange-600 font-bold bg-orange-50/70'
                : 'text-slate-600 hover:text-slate-900 active:bg-slate-100'
            }`}
          >
            <Search size={18} />
            <span className="text-[10px] mt-0.5 tracking-tight">Scan URL</span>
          </Link>

          <Link
            to="/threats"
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-w-[56px] min-h-[44px] ${
              pathname === '/threats'
                ? 'text-orange-600 font-bold bg-orange-50/70'
                : 'text-slate-600 hover:text-slate-900 active:bg-slate-100'
            }`}
          >
            <ShieldAlert size={18} />
            <span className="text-[10px] mt-0.5 tracking-tight">Intel</span>
          </Link>

          <Link
            to="/scans"
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-w-[56px] min-h-[44px] ${
              pathname === '/scans'
                ? 'text-orange-600 font-bold bg-orange-50/70'
                : 'text-slate-600 hover:text-slate-900 active:bg-slate-100'
            }`}
          >
            <History size={18} />
            <span className="text-[10px] mt-0.5 tracking-tight">History</span>
          </Link>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-slate-600 hover:text-slate-900 active:bg-slate-100 transition-all min-w-[56px] min-h-[44px] cursor-pointer"
            aria-label="Open all scanners drawer"
          >
            <Menu size={18} />
            <span className="text-[10px] mt-0.5 tracking-tight">Tools</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
