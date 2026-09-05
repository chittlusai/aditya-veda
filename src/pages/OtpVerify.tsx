import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  MailCheck, ArrowRight, ShieldCheck, ShieldAlert, Sparkles, RefreshCw,
  CheckCircle2, ArrowLeft, Copy, Check, BellRing
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function OtpVerify() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(30);
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(true);

  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');
  const { pendingAuth, verifyOtp, resendOtp } = useAuth();

  // Active email to display
  const targetEmail = pendingAuth?.email || 'chittlusai@gmail.com';
  // Active OTP code
  const currentCode = pendingAuth?.code || '849201';

  // 30s countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Focus first input on mount
  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    setErrorMsg(null);

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }

    if (value && index === 5) {
      const fullCode = newCode.join('');
      if (fullCode.length === 6) {
        attemptVerification(fullCode);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasted)) {
      const digits = pasted.split('');
      setCode(digits);
      inputsRef.current[5]?.focus();
      attemptVerification(pasted);
    }
  };

  const handleAutoFill = () => {
    const digits = currentCode.split('');
    setCode(digits);
    inputsRef.current[5]?.focus();
    attemptVerification(currentCode);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResend = () => {
    if (countdown > 0) return;
    resendOtp();
    setCode(['', '', '', '', '', '']);
    setErrorMsg(null);
    setCountdown(30);
    setShowToast(true);
    inputsRef.current[0]?.focus();
  };

  const attemptVerification = (codeToVerify: string) => {
    setIsVerifying(true);
    setErrorMsg(null);

    setTimeout(() => {
      const success = verifyOtp(codeToVerify);
      if (success) {
        setIsVerified(true);
        setTimeout(() => {
          const dest = redirect ? decodeURIComponent(redirect) : pendingAuth?.redirect || '/dashboard';
          navigate(dest, { replace: true });
        }, 850);
      } else {
        setIsVerifying(false);
        setErrorMsg('Invalid verification code. Use the code shown on the screen.');
      }
    }, 600);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join('');
    if (fullCode.length < 6) {
      setErrorMsg('Please enter all 6 digits of the verification code.');
      return;
    }
    attemptVerification(fullCode);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24 relative overflow-hidden bg-slate-50 text-slate-900">
      {/* Ambient Accent Gradients */}
      <div className="absolute top-1/4 -right-32 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* ── Top-Right Floating Cyber Notification Toast ── */}
      {showToast && !isVerified && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 max-w-sm w-full animate-bounce sm:animate-none">
          <div className="p-4 rounded-2xl bg-white border-2 border-orange-500 shadow-2xl shadow-orange-500/20 text-slate-900">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <BellRing size={15} className="animate-pulse" />
                </div>
                <div>
                  <div className="text-xs font-mono font-black text-orange-600 uppercase tracking-wide">
                    ON-SCREEN DISPATCH NOTIFICATION
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">To: {targetEmail}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowToast(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-mono px-1.5 py-0.5 rounded cursor-pointer"
                title="Dismiss toast"
              >
                ✕
              </button>
            </div>

            <div className="p-2.5 rounded-xl bg-orange-50/80 border border-orange-200 flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-mono text-slate-600 font-medium">Security Passcode:</span>
              <span className="font-mono font-black text-xl text-orange-700 tracking-widest px-2.5 py-0.5 rounded bg-white border border-orange-300 shadow-xs">
                {currentCode}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAutoFill}
                className="flex-1 py-1.5 px-3 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-orange-500/20"
              >
                <Sparkles size={12} /> Auto-Fill Code
              </button>
              <button
                type="button"
                onClick={handleCopyCode}
                className="py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs font-semibold transition flex items-center gap-1 cursor-pointer border border-slate-200"
              >
                {copied ? <Check size={12} className="text-emerald-600 font-bold" /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Enclave Card ─────────────────────────── */}
      <div className="w-full max-w-lg relative z-10">
        <div className="rounded-3xl bg-white border border-slate-200/90 shadow-2xl shadow-slate-200/70 overflow-hidden p-6 sm:p-8 text-slate-900">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-50 border border-orange-200 text-orange-600 mb-4 shadow-sm">
              {isVerified ? (
                <ShieldCheck size={32} className="text-emerald-600 animate-bounce" />
              ) : (
                <MailCheck size={32} />
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {isVerified ? 'Identity Confirmed!' : 'Email Verification Code'}
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm mt-1.5 font-mono">
              Account targeted for authorization:
            </p>
            <div className="inline-block mt-1 px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 font-mono text-xs font-bold text-orange-700">
              {targetEmail}
            </div>
          </div>

          {/* ── High-Visibility On-Screen Code Display Enclave ── */}
          {!isVerified && (
            <div className="mb-6 p-4 rounded-2xl bg-orange-50/80 border-2 border-orange-400 shadow-md text-center">
              <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-orange-700 font-bold uppercase tracking-wider mb-2">
                <Sparkles size={13} />
                YOUR VERIFICATION CODE (SHOWN ON WEBSITE)
              </div>

              {/* Glowing Digit Display */}
              <div className="py-2.5 px-4 rounded-xl bg-white border border-orange-200 inline-flex items-center justify-center gap-2 mb-3 shadow-xs">
                {currentCode.split('').map((d, i) => (
                  <span
                    key={i}
                    className="w-8 h-10 sm:w-9 sm:h-11 rounded-lg bg-orange-50 border border-orange-300 text-orange-700 font-mono font-black text-xl sm:text-2xl flex items-center justify-center shadow-xs"
                  >
                    {d}
                  </span>
                ))}
              </div>

              <p className="text-[11px] font-mono text-slate-600 mb-3">
                No external email check needed — enter this code below or click Auto-Fill:
              </p>

              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={handleAutoFill}
                  className="py-2 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-mono text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-orange-500/25"
                >
                  <Sparkles size={13} /> Auto-Fill Code ({currentCode})
                </button>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="py-2 px-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-mono text-xs font-medium transition flex items-center gap-1.5 cursor-pointer border border-slate-300 shadow-xs"
                >
                  {copied ? <Check size={13} className="text-emerald-600 font-bold" /> : <Copy size={13} />}
                  {copied ? 'Copied' : 'Copy Code'}
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-mono flex items-center gap-2">
              <ShieldAlert size={15} className="shrink-0 text-red-600" />
              {errorMsg}
            </div>
          )}

          {/* Verification Form */}
          <form onSubmit={handleManualSubmit}>
            <div className="text-xs font-mono text-slate-600 text-center mb-2 font-bold uppercase tracking-wider">
              Enter 6-Digit Passcode
            </div>

            {/* 6 Digit Input Boxes */}
            <div className="flex justify-center gap-2 sm:gap-3 mb-6" onPaste={handlePaste}>
              {code.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputsRef.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  disabled={isVerifying || isVerified}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className={`w-11 h-14 sm:w-13 sm:h-16 rounded-xl border text-center text-xl sm:text-2xl font-black font-mono outline-none transition-all ${
                    isVerified
                      ? 'border-emerald-500 text-emerald-700 bg-emerald-50'
                      : digit
                      ? 'border-orange-500 text-orange-700 bg-orange-50/50 shadow-xs'
                      : 'border-slate-300 bg-slate-50 text-slate-900 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100'
                  }`}
                />
              ))}
            </div>

            {/* Verification Button */}
            <button
              type="submit"
              disabled={isVerifying || isVerified}
              className={`w-full py-3.5 px-4 rounded-xl font-mono font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 ${
                isVerified
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white shadow-lg shadow-orange-500/25'
              }`}
            >
              {isVerified ? (
                <>
                  <CheckCircle2 size={18} />
                  <span>IDENTITY CONFIRMED • LAUNCHING COMMAND CENTER...</span>
                </>
              ) : isVerifying ? (
                <>
                  <RefreshCw size={18} className="animate-spin text-amber-300" />
                  <span>VERIFYING CRYPTOGRAPHIC PASSCODE...</span>
                </>
              ) : (
                <>
                  <span>Verify Passcode & Enter Portal</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          {/* Resend & Navigation Controls */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-slate-600">
            <div>
              {countdown > 0 ? (
                <span>
                  Resend code in <strong className="text-orange-600">{countdown}s</strong>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-orange-600 hover:text-orange-700 font-bold underline transition flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw size={12} /> Generate New Passcode
                </button>
              )}
            </div>

            <Link
              to={`/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
              className="hover:text-slate-900 transition flex items-center gap-1 font-medium"
            >
              <ArrowLeft size={13} /> Change email / Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
