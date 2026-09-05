import { type ReactNode } from 'react';
import Header from './Header';

export default function TopNavLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
}
