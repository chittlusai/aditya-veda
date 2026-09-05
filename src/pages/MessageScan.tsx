import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { MessageSquare, ShieldAlert, Loader2, ShieldCheck, ArrowRight, History, CheckCircle2 } from 'lucide-react';
import { ScanService } from '../services/ScanService';

interface MessageResult {
  message: string;
  isSafe: boolean;
  riskScore: number;
  urgencyLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  attackVector: string;
  extractedLinks: string[];
  indicators: string[];
}

const PRESET_MESSAGES = [
  {
    label: 'Executive Wire Scam (BEC)',
    text: 'URGENT: I am in a board meeting and cannot take calls. Please immediately wire $48,500 to the attached vendor escrow account before 4 PM today. Confirm once sent. — CEO',
  },
  {
    label: 'SMS Delivery Duty Fee Trap',
    text: 'USPS Notice: Your package #94821 is on hold at customs due to an unpaid $1.85 handling charge. Pay immediately here: http://usps-tracking-fee-portal.net or package will be returned.',
  },
  {
    label: 'Bank Account Suspension Alert',
    text: 'Chase Alert: Your online banking account has been temporarily restricted due to unauthorized login attempts. Verify identity to restore access: http://chase-auth-security.com/login',
  },
  {
    label: 'Legitimate Calendar Invite',
    text: 'Hi Alex, quick update regarding tomorrow’s sprint review. Let’s shift our call from 2 PM to 3 PM so marketing can join. Let me know if that works for you!',
  },
];

export default function MessageScan() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState(searchParams.get('msg') || '');
  const [status, setStatus] = useState<'idle' | 'scanning' | 'done'>('idle');
  const [result, setResult] = useState<MessageResult | null>(null);

  useEffect(() => {
    const msg = searchParams.get('msg');
    if (msg) {
      setMessage(msg);
      handleAnalyze(msg);
    }
  }, [searchParams]);

  const handleAnalyze = (textToScan: string) => {
    if (!textToScan.trim()) return;
    setStatus('scanning');
    setResult(null);

    setTimeout(() => {
      setStatus('done');
      // 1. Run dynamic real-time NLP heuristic analysis
      const evaluated = ScanService.analyzeMessage(textToScan);

      setResult({
        message: textToScan,
        isSafe: evaluated.isSafe,
        riskScore: evaluated.riskScore,
        urgencyLevel: evaluated.urgencyLevel,
        attackVector: evaluated.attackVector,
        extractedLinks: evaluated.extractedLinks,
        indicators: evaluated.indicators,
      });

      // 2. Persist to real-time Scan History!
      ScanService.saveScan({
        type: 'Message',
        target: textToScan.length > 60 ? `${textToScan.slice(0, 57)}...` : textToScan,
        risk: evaluated.riskScore,
        verdict: evaluated.verdict,
        threatName: evaluated.attackVector,
        indicators: evaluated.indicators,
        details: {
          urgencyLevel: evaluated.urgencyLevel,
          extractedLinks: evaluated.extractedLinks,
          fullMessage: textToScan,
        },
      });
    }, 1200);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 text-left">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-sky-50 border border-sky-200 text-sky-600 mb-3 shadow-sm">
          <MessageSquare size={28} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Message & Email Threat Analyzer</h1>
        <p className="text-sm text-slate-600 max-w-lg mx-auto mt-1">
          Inspect suspicious SMS, executive emails, WhatsApp notifications, and customer service impersonations in real time.
        </p>
      </div>

      {/* Input Card */}
      <div className="card bg-white border border-slate-200/90 shadow-md p-5 rounded-2xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAnalyze(message);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-2">
              Message Content / Email Body
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Paste suspicious email text, SMS alert, direct message, or wire instruction..."
              className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100 transition-all font-mono"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            {/* Presets */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-mono text-slate-400">Quick tests:</span>
              {PRESET_MESSAGES.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    setMessage(p.text);
                    handleAnalyze(p.text);
                  }}
                  className="px-2 py-1 rounded-md bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-700 font-medium transition cursor-pointer border border-slate-200/60 font-mono"
                >
                  {p.label}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={status === 'scanning'}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50 font-mono text-sm min-h-[44px]"
            >
              {status === 'scanning' ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Analyzing NLP...
                </>
              ) : (
                <>
                  Analyze Message
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Progress */}
      {status === 'scanning' && (
        <div className="card bg-white text-slate-800 p-5 rounded-2xl border border-slate-200 shadow-md space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between text-sky-600 font-bold">
            <span className="flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-sky-500" />
              EXECUTING NATURAL LANGUAGE HEURISTIC & URGENCY DECONSTRUCTION
            </span>
            <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 border border-slate-200 font-bold">LIVE TELEMETRY</span>
          </div>
          <p className="text-slate-600">Cross-referencing psychological coercion vectors, domain spoofing, and wire fraud templates...</p>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
            <div className="bg-sky-500 h-full w-4/5 animate-pulse" />
          </div>
        </div>
      )}

      {/* Results */}
      {status === 'done' && result && (
        <div className="card bg-white border border-slate-200/90 shadow-xl rounded-2xl p-6 space-y-6 text-left animate-in fade-in duration-300">
          {/* Real-time Persistence Notification Badge */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-sky-50/80 border border-sky-200 text-slate-900 text-xs font-mono">
            <span className="flex items-center gap-2 text-emerald-700 font-bold">
              <CheckCircle2 size={15} /> Real-Time Telemetry Logged
            </span>
            <Link
              to="/scans"
              className="text-sky-700 hover:text-sky-800 underline font-bold flex items-center gap-1 transition"
            >
              <History size={13} /> View in Scan History →
            </Link>
          </div>

          {/* Top Verdict Banner — Mobile Responsive */}
          <div
            className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              !result.isSafe
                ? 'bg-red-50/80 border-red-200 text-red-900'
                : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
            }`}
          >
            <div className="flex items-start gap-3">
              {!result.isSafe ? (
                <ShieldAlert size={28} className="text-red-600 shrink-0 mt-0.5" />
              ) : (
                <ShieldCheck size={28} className="text-emerald-600 shrink-0 mt-0.5" />
              )}
              <div>
                <h3 className="text-base sm:text-lg font-black tracking-tight">
                  {!result.isSafe
                    ? 'Social Engineering & Scam Tactics Detected'
                    : 'Clean Message — No Coercive Patterns Detected'}
                </h3>
                <p className="text-sm font-semibold mt-1 text-slate-700">
                  Risk Score:{' '}
                  <span className={`font-mono font-black ${!result.isSafe ? 'text-red-600' : 'text-emerald-600'}`}>
                    {result.riskScore}/100
                  </span>
                </p>
                <p className="text-xs mt-1 opacity-90 font-medium font-mono">{result.attackVector}</p>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 shrink-0">
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-70">Threat Risk</span>
              <div className={`text-2xl font-black font-mono ${!result.isSafe ? 'text-red-600' : 'text-emerald-600'}`}>
                {result.riskScore}/100
              </div>
            </div>
          </div>

          {/* Quick Metric Badges */}
          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Urgency Pressure</span>
              <p className={`font-bold text-sm mt-0.5 font-mono ${result.urgencyLevel === 'CRITICAL' ? 'text-red-600' : result.urgencyLevel === 'HIGH' ? 'text-amber-600' : 'text-emerald-600'}`}>
                {result.urgencyLevel}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Embedded Hyperlinks</span>
              <p className="font-bold text-sm text-slate-900 mt-0.5 font-mono">
                {result.extractedLinks.length} Links Extracted
              </p>
            </div>
          </div>

          {/* Indicators */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
              NLP Forensic Corroboration
            </h4>
            <div className="space-y-1.5 font-mono text-xs">
              {result.indicators.map((ind, i) => (
                <div
                  key={i}
                  className={`p-2.5 rounded-lg border flex items-start gap-2.5 ${
                    result.isSafe
                      ? 'bg-emerald-50/40 border-emerald-100 text-emerald-900'
                      : 'bg-red-50/40 border-red-100 text-red-900'
                  }`}
                >
                  <span className="font-bold shrink-0">{result.isSafe ? '✓' : '⚠️'}</span>
                  <span>{ind}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
            <button
              onClick={() => {
                setMessage('');
                setStatus('idle');
                setResult(null);
              }}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 transition cursor-pointer font-mono"
            >
              Analyze Another Message
            </button>

            <button
              onClick={() => navigate('/scans')}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold font-mono flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <History size={14} /> Open Scan History
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
