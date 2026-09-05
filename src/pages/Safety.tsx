import { BookOpen, CheckSquare, AlertTriangle } from 'lucide-react';

export default function Safety() {
  return (
    <div className="space-y-8">
      <div className="text-center py-4">
        <h1 className="text-2xl font-bold mb-2">Safety Center</h1>
        <p className="text-[var(--color-text-muted)]">Learn how to protect yourself from digital threats.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen size={20} className="text-[var(--color-primary)]" />
            <h2 className="font-bold text-lg">Educational Guides</h2>
          </div>
          <ul className="space-y-4">
            <li>
              <h3 className="font-bold text-sm hover:text-[var(--color-primary)] cursor-pointer transition-colors">How to spot a phishing email</h3>
              <p className="text-xs text-[var(--color-text-muted)]">Learn the 5 signs that an email is trying to steal your credentials.</p>
            </li>
            <li>
              <h3 className="font-bold text-sm hover:text-[var(--color-primary)] cursor-pointer transition-colors">The danger of QR codes</h3>
              <p className="text-xs text-[var(--color-text-muted)]">Why you shouldn't scan random QR codes on the street.</p>
            </li>
          </ul>
        </div>

        <div className="card border-[var(--color-primary)]/20">
          <div className="flex items-center gap-3 mb-4">
            <CheckSquare size={20} className="text-[var(--color-primary)]" />
            <h2 className="font-bold text-lg">Response Checklist</h2>
          </div>
          <p className="text-sm font-medium mb-3">If you clicked a suspicious link:</p>
          <ol className="space-y-2 text-sm text-[var(--color-text-muted)] list-decimal pl-4">
            <li>Disconnect your device from the internet.</li>
            <li>Do not enter any passwords or info.</li>
            <li>Change your passwords from a safe device.</li>
            <li>Monitor your accounts for suspicious activity.</li>
          </ol>
        </div>
      </div>

      <div className="card flex flex-col sm:flex-row items-center justify-between gap-4 bg-[var(--color-primary)]/5 border-[var(--color-primary)]/20">
        <div className="flex items-center gap-4">
          <AlertTriangle size={28} className="text-amber-400" />
          <div>
            <h2 className="font-bold">Report a Scam</h2>
            <p className="text-sm text-[var(--color-text-muted)]">Help protect others by reporting a new threat.</p>
          </div>
        </div>
        <button className="btn-primary px-6 py-2">Submit Report</button>
      </div>
    </div>
  );
}
