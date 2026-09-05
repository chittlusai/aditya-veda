import { useState, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, ShieldCheck, ShieldAlert, Eye, EyeOff, Sparkles, CheckCircle2, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');
  const { setPendingVerification } = useAuth();

  // Password strength calculation
  const strength = useMemo(() => {
    let score = 0;
    const hasMinLen = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    if (hasMinLen) score++;
    if (hasUpper) score++;
    if (hasNumber) score++;
    if (hasSpecial) score++;

    return {
      score,
      hasMinLen,
      hasUpper,
      hasNumber,
      hasSpecial,
      label: score === 0 ? 'Enter Password' : score <= 2 ? 'Weak' : score === 3 ? 'Good' : 'Strong',
      color: score <= 1 ? 'bg-red-500' : score === 2 ? 'bg-orange-500' : score === 3 ? 'bg-amber-500' : 'bg-emerald-500',
      textColor: score <= 1 ? 'text-red-400' : score === 2 ? 'text-orange-400' : score === 3 ? 'text-amber-400' : 'text-emerald-400',
    };
  }, [password]);

  const handleDemoFill = () => {
    setName('Chittlu Sai');
    setEmail('chittlusai@gmail.com');
    setPassword('Shield#Ultra2026!');
    setErrorMsg(null);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    // Generate 6-digit email OTP verification code
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Prepare pending verification
    setPendingVerification({
      email: email.trim(),
      name: name.trim(),
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
    <div className="min-h-screen flex items-center justify-center px-3 sm:px-4 py-12 sm:py-24 relative overflow-hidden bg-slate-50 text-slate-900">
      {/* Ambient Accent Gradients */}
      <div className="absolute top-1/4 -right-32 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

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
            Create Defender Account
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Register to unlock real-time phishing intelligence & scanner tools.
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
              Create your account to unlock the requested security scanner.
            </div>
          </div>
        )}

        {/* Main Clean Light Card */}
        <div className="rounded-3xl bg-white border border-slate-200/90 shadow-2xl shadow-slate-200/70 overflow-hidden p-4 sm:p-8">
          {/* Card Top Telemetry Bar */}
          <div className="flex items-center justify-between pb-5 mb-6 border-b border-slate-100 text-xs">
            <div className="flex items-center gap-2 font-mono">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-slate-600 text-[11px] font-bold uppercase tracking-wider">
                ZERO-TRUST ENCLAVE
              </span>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 font-mono text-[10px] text-emerald-700 font-bold">
              FREE ACCESS
            </span>
          </div>

          {/* Interactive Tab Switcher */}
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 mb-6">
            <Link
              to={`/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
              className="py-2 rounded-lg font-mono text-xs font-bold text-slate-600 hover:text-slate-900 transition text-center"
            >
              Sign In
            </Link>
            <button
              type="button"
              className="py-2 rounded-lg font-mono text-xs font-bold text-orange-700 bg-white shadow-sm transition cursor-default border border-slate-200/80"
            >
              Create Account
            </button>
          </div>

          {/* Quick Demo Autofill */}
          <div className="mb-6 flex items-center justify-between p-2.5 rounded-xl bg-orange-50/80 border border-orange-200">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-700">
              <Sparkles size={14} className="text-orange-500 shrink-0" />
              <span>Want to test quickly?</span>
            </div>
            <button
              type="button"
              onClick={handleDemoFill}
              className="text-xs font-mono px-3 py-1 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition cursor-pointer font-bold shadow-xs"
            >
              Autofill Demo
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-mono flex items-center gap-2">
              <ShieldAlert size={15} className="shrink-0 text-red-600" />
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                Full Name
              </label>
              <div className="relative">
                <User size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setErrorMsg(null); }}
                  placeholder="e.g. Chittlu Sai"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all text-sm font-medium font-mono"
                />
              </div>
            </div>

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
              <label className="block text-xs font-mono font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrorMsg(null); }}
                  placeholder="Create strong password"
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

              {/* Live Password Strength Meter */}
              {password.length > 0 && (
                <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-600 font-medium">Security Strength:</span>
                    <span className={`font-bold ${strength.textColor}`}>{strength.label}</span>
                  </div>
                  {/* 4 Segment Progress Bar */}
                  <div className="grid grid-cols-4 gap-1.5 h-1.5">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-full rounded-full transition-all duration-300 ${
                          strength.score >= step ? strength.color : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  {/* Checklist */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px] font-mono text-slate-600">
                    <span className={`flex items-center gap-1 ${strength.hasMinLen ? 'text-emerald-600 font-bold' : ''}`}>
                      {strength.hasMinLen ? <Check size={11} /> : <X size={11} />} 8+ Characters
                    </span>
                    <span className={`flex items-center gap-1 ${strength.hasUpper ? 'text-emerald-600 font-bold' : ''}`}>
                      {strength.hasUpper ? <Check size={11} /> : <X size={11} />} Uppercase Letter
                    </span>
                    <span className={`flex items-center gap-1 ${strength.hasNumber ? 'text-emerald-600 font-bold' : ''}`}>
                      {strength.hasNumber ? <Check size={11} /> : <X size={11} />} Numeric Digit
                    </span>
                    <span className={`flex items-center gap-1 ${strength.hasSpecial ? 'text-emerald-600 font-bold' : ''}`}>
                      {strength.hasSpecial ? <Check size={11} /> : <X size={11} />} Symbol (!@#$)
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-mono font-bold text-sm tracking-wide shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span>CREATING CREDENTIAL ENCLAVE...</span>
              ) : (
                <>
                  <span>Create Account & Verify Email Code</span>
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
          Already have an account?{' '}
          <Link
            to={`/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
            className="text-orange-600 hover:text-orange-700 font-bold underline transition"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
