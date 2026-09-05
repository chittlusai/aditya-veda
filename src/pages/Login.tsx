import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ShieldCheck, ShieldAlert, Eye, EyeOff, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const QUICK_DEMO_ACCOUNTS = [
  { email: 'chittlusai@gmail.com', label: 'Chittlu Sai (Lead Analyst)' },
  { email: 'sunandachilakala@gmail.com', label: 'Sunanda C. (SecOps)' },
  { email: 'analyst@phishguard.ai', label: 'PhishGuard Defense' },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');
  const { setPendingVerification } = useAuth();

  const handleDemoFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('CyberDefense#2026');
    setErrorMsg(null);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email address and password to continue.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    // Generate 6-digit email OTP verification code
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Prepare pending verification in context & session storage
    setPendingVerification({
      email: email.trim(),
      name: email.split('@')[0],
      code: generatedCode,
      redirect: redirect ? decodeURIComponent(redirect) : undefined,
      timestamp: Date.now(),
    });

    setTimeout(() => {
      setIsLoading(false);
      const redirectQuery = redirect ? `?redirect=${encodeURIComponent(redirect)}` : '';
      navigate(`/otp-verify${redirectQuery}`);
    }, 450);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24 relative overflow-hidden bg-slate-50 text-slate-900">
      {/* Ambient Radial Accent Gradients */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/30 group-hover:scale-105 transition-transform">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-slate-900">
              PHISHGUARD<span className="text-orange-600">AI</span>
            </span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Security Command Portal
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Authenticate identity to launch live threat inspection tools.
          </p>
        </div>

        {/* Security Alert if Intercepted from a Tool */}
        {redirect && (
          <div className="mb-6 p-4 rounded-xl bg-orange-50 border border-orange-200 text-orange-900 text-xs font-mono flex items-start gap-3 shadow-sm">
            <ShieldAlert size={18} className="text-orange-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-orange-700 uppercase tracking-wide">
                AUTHENTICATION REQUIRED:
              </span>{' '}
              Sign in or create an account to access the requested security scanner.
            </div>
          </div>
        )}

        {/* Main Clean Light Card */}
        <div className="rounded-3xl bg-white border border-slate-200/90 shadow-2xl shadow-slate-200/70 overflow-hidden p-6 sm:p-8">
          {/* Card Top Telemetry Bar */}
          <div className="flex items-center justify-between pb-5 mb-6 border-b border-slate-100 text-xs">
            <div className="flex items-center gap-2 font-mono">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-slate-600 text-[11px] font-bold uppercase tracking-wider">
                TLS 1.3 ENCRYPTED TUNNEL
              </span>
            </div>
            <span className="px-2 py-0.5 rounded bg-orange-50 border border-orange-200 font-mono text-[10px] text-orange-700 font-bold">
              DEFCON 2
            </span>
          </div>

          {/* Interactive Tab Switcher */}
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 mb-6">
            <button
              type="button"
              className="py-2 rounded-lg font-mono text-xs font-bold text-orange-700 bg-white shadow-sm transition cursor-default border border-slate-200/80"
            >
              Sign In
            </button>
            <Link
              to={`/signup${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
              className="py-2 rounded-lg font-mono text-xs font-bold text-slate-600 hover:text-slate-900 transition text-center"
            >
              Create Account
            </Link>
          </div>

          {/* Quick 1-Click Demo Accounts */}
          <div className="mb-6">
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 mb-2.5">
              <Sparkles size={13} className="text-orange-500" />
              <span>QUICK DEMO AUTOFILL:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {QUICK_DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleDemoFill(acc.email)}
                  className={`text-xs font-mono px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                    email === acc.email
                      ? 'bg-orange-50 border-orange-400 text-orange-800 font-bold shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  {acc.email}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-mono flex items-center gap-2">
              <ShieldAlert size={15} className="shrink-0 text-red-600" />
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                Email Address
              </label>
              <div className="relative">
                <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrorMsg(null); }}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all text-sm font-medium font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wide">
                  Password
                </label>
                <span className="text-[11px] font-mono text-slate-500 hover:text-orange-600 cursor-pointer transition-colors">
                  Forgot?
                </span>
              </div>
              <div className="relative">
                <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrorMsg(null); }}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-11 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all text-sm font-medium font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 select-none font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500 cursor-pointer accent-orange-500"
                />
                <span>Remember session on this device</span>
              </label>
              <span className="text-[11px] font-mono text-emerald-600 flex items-center gap-1 font-bold">
                <CheckCircle2 size={12} /> Auto-Save
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-mono font-bold text-sm tracking-wide shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span>INITIATING 2FA VERIFICATION...</span>
              ) : (
                <>
                  <span>Sign In & Verify Email Code</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>

            {/* On-screen code note */}
            <div className="p-3 rounded-xl bg-orange-50/80 border border-orange-200 text-center">
              <span className="text-[11px] font-mono text-slate-700">
                ⚡ <strong className="text-orange-700 font-bold">On-Screen Code:</strong> The 6-digit verification code will be displayed directly on the website.
              </span>
            </div>
          </form>

          {/* Footer Security Badges */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-center gap-4 text-[11px] font-mono text-slate-500">
            <span className="flex items-center gap-1">
              <ShieldCheck size={13} className="text-emerald-600" />
              256-Bit TLS Tunnel
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Lock size={13} className="text-cyan-600" />
              Email OTP Verified
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <CheckCircle2 size={13} className="text-orange-600" />
              Zero-Knowledge MFA
            </span>
          </div>
        </div>

        {/* Bottom Switch Link */}
        <p className="text-center text-xs font-mono text-slate-600 mt-6">
          New to PhishGuard AI?{' '}
          <Link
            to={`/signup${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
            className="text-orange-600 hover:text-orange-700 font-bold underline transition"
          >
            Create your account
          </Link>
        </p>
      </div>
    </div>
  );
}
