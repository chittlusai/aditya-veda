import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Search, ShieldAlert, Loader2, ShieldCheck, ArrowRight, Lock, Server, Globe, History, CheckCircle2, AlertTriangle } from 'lucide-react';
import { ScanService } from '../services/ScanService';

interface UrlResult {
  url: string;
  isSafe: boolean;
  score: number;
  threatType: string;
  domainAge: string;
  sslStatus: string;
  redirects: number;
  indicators: string[];
}

const PRESET_URLS = [
  { label: 'PayPal Phishing Clone', url: 'http://secure-login-paypal.com/verify-account' },
  { label: 'Bank Wire Phish', url: 'http://secure-chase-auth-alert.net' },
  { label: 'Verified Google', url: 'https://google.com' },
];

export default function UrlScan() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [url, setUrl] = useState(searchParams.get('target') || '');
  const [status, setStatus] = useState<'idle' | 'scanning' | 'done' | 'invalid'>('idle');
  const [invalidReason, setInvalidReason] = useState('');
  const [scanStep, setScanStep] = useState('');
  const [result, setResult] = useState<UrlResult | null>(null);

  useEffect(() => {
    const target = searchParams.get('target');
    if (target) {
      setUrl(target);
      executeScan(target);
    }
  }, [searchParams]);

  const executeScan = (targetUrl: string) => {
    const trimmed = (targetUrl || '').trim();
    if (!trimmed) {
      setStatus('invalid');
      setInvalidReason('No URL or website was provided. Please enter a valid web address to scan.');
      setResult(null);
      return;
    }

    // 1. Real-time URL & Website Validation
    const validation = ScanService.validateUrl(trimmed);
    if (!validation.isValid) {
      setStatus('invalid');
      setInvalidReason(validation.reason || 'There is no valid URL or website provided. Please provide a valid, accessible web address.');
      setResult(null);
      return;
    }

    setStatus('scanning');
    setResult(null);
    setInvalidReason('');

    setScanStep('Executing DNS resolution and reverse IP mapping...');
    setTimeout(() => {
      setScanStep('Validating SSL/TLS certificate chain and transparency logs...');
      setTimeout(() => {
        setScanStep('Running real-time neural NLP heuristic threat model across DOM...');
        setTimeout(async () => {
          // 2. Run dynamic real-time heuristic evaluation & live DNS resolution
          const evaluated = await ScanService.analyzeUrl(targetUrl);

          if (!evaluated.isValid) {
            setStatus('invalid');
            setInvalidReason(evaluated.errorMessage || 'There is no valid URL or website found at this address.');
            return;
          }

          setStatus('done');
          setResult({
            url: targetUrl,
            isSafe: evaluated.isSafe,
            score: evaluated.score,
            threatType: evaluated.threatType,
            domainAge: evaluated.domainAge,
            sslStatus: evaluated.sslStatus,
            redirects: evaluated.redirects,
            indicators: evaluated.indicators,
          });

          // 3. Persist directly to real-time Scan History!
          ScanService.saveScan({
            type: 'URL',
            target: targetUrl,
            risk: evaluated.score,
            verdict: evaluated.verdict,
            threatName: evaluated.threatType,
            indicators: evaluated.indicators,
            details: {
              domainAge: evaluated.domainAge,
              sslStatus: evaluated.sslStatus,
              redirects: evaluated.redirects,
            },
          });
        }, 600);
      }, 600);
    }, 600);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 text-left">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-50 border border-orange-200 text-orange-600 mb-3 shadow-sm">
          <Search size={28} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">URL Scanner</h1>
        <p className="text-sm text-slate-600 max-w-lg mx-auto mt-1">
          Paste any URL to check for phishing, malware, typosquatting, and zero-day traps in real time.
        </p>
      </div>

      {/* Input Card */}
      <div className="card bg-white border border-slate-200/90 shadow-md p-5 rounded-2xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            executeScan(url);
          }}
          className="space-y-4"
        >
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Globe size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste suspicious URL (e.g. http://login-verify-account.com)..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={status === 'scanning'}
              className="btn-primary w-full sm:w-auto px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50 min-h-[44px]"
            >
              {status === 'scanning' ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  Scan URL
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>

          {/* Quick preset tests */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="font-mono text-slate-400">Quick tests:</span>
            {PRESET_URLS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  setUrl(p.url);
                  executeScan(p.url);
                }}
                className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-orange-50 hover:text-orange-700 text-slate-700 font-medium transition cursor-pointer border border-slate-200/60 font-mono"
              >
                {p.label}
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* Scanning Step Progress */}
      {status === 'scanning' && (
        <div className="card bg-white text-slate-800 p-5 rounded-2xl border border-slate-200 shadow-md space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between text-orange-600 font-bold">
            <span className="flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-orange-500" />
              REAL-TIME NEURAL URL HEURISTIC ENGINE RUNNING
            </span>
            <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 border border-slate-200 font-bold">STAGE 3/3</span>
          </div>
          <p className="text-slate-600">{scanStep}</p>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
            <div className="bg-orange-500 h-full w-4/5 animate-pulse" />
          </div>
        </div>
      )}

      {/* Invalid URL / No Website Provided State */}
      {status === 'invalid' && (
        <div className="card bg-amber-50/90 border-2 border-amber-300 shadow-md rounded-2xl p-6 text-left space-y-4 animate-in fade-in duration-200">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shrink-0">
              <AlertTriangle size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-amber-950 flex items-center gap-2">
                No Valid URL Provided
              </h3>
              <p className="text-sm text-amber-900 leading-relaxed">
                {invalidReason || 'There is no valid URL or website found at the address you entered. The security scanner requires an accessible, registered web address to conduct live heuristic analysis.'}
              </p>
            </div>
          </div>

          <div className="bg-white/90 rounded-xl p-4 border border-amber-200 text-xs text-slate-700 space-y-2 font-mono">
            <div className="font-bold text-slate-900 font-sans">Requirements for a real-time URL scan:</div>
            <div className="space-y-1 text-slate-600">
              <div>• Must include a valid domain name and extension (e.g., <code className="text-orange-600 font-bold">google.com</code>, <code className="text-orange-600 font-bold">https://paypal.com</code>)</div>
              <div>• Recognized top-level domains: <span className="text-slate-800 font-bold">.com, .org, .net, .io, .ai, .edu, .gov, .xyz, etc.</span></div>
              <div>• Must not contain illegal spaces or random unresolvable text</div>
            </div>
          </div>

          <div className="pt-1 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-amber-800 font-medium">Try one of the verified sample URLs above to test the real-time engine.</span>
            <button
              type="button"
              onClick={() => {
                const sample = 'https://google.com';
                setUrl(sample);
                executeScan(sample);
              }}
              className="btn-primary text-xs px-3.5 py-2 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              Try "google.com" <ArrowRight size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Result View */}
      {status === 'done' && result && (
        <div className="card bg-white border border-slate-200/90 shadow-xl rounded-2xl p-6 space-y-6 text-left animate-in fade-in duration-300">
          {/* Real-time Persistence Notification Badge */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-orange-50/80 border border-orange-200 text-slate-900 text-xs font-mono">
            <span className="flex items-center gap-2 text-emerald-700 font-bold">
              <CheckCircle2 size={15} /> Real-Time Telemetry Logged
            </span>
            <Link
              to="/scans"
              className="text-orange-600 hover:text-orange-700 underline font-bold flex items-center gap-1 transition"
            >
              <History size={13} /> View in Scan History →
            </Link>
          </div>

          {/* Top Verdict Banner — Mobile Responsive */}
          <div
            className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              result.isSafe
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                : 'bg-red-50/80 border-red-200 text-red-900'
            }`}
          >
            <div className="flex items-start gap-3">
              {result.isSafe ? (
                <ShieldCheck size={28} className="text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <ShieldAlert size={28} className="text-red-600 shrink-0 mt-0.5" />
              )}
              <div>
                <h3 className="text-base sm:text-lg font-black tracking-tight">
                  {result.isSafe
                    ? 'Safe — No threats detected'
                    : 'Critical Warning — Threat Vector Identified'}
                </h3>
                <p className="text-sm font-semibold mt-1 text-slate-700">
                  Threat Classification:{' '}
                  <span className={`font-mono font-bold ${result.isSafe ? 'text-emerald-700' : 'text-red-700'}`}>
                    {result.threatType}
                  </span>
                </p>
                <p className="text-xs mt-1 opacity-90 font-mono break-all">{result.url}</p>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 shrink-0">
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-70">Threat Risk</span>
              <div className={`text-2xl font-black font-mono ${result.isSafe ? 'text-emerald-600' : 'text-red-600'}`}>
                {result.score}/100
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  result.isSafe ? 'bg-emerald-200/60 text-emerald-800' : 'bg-red-200/60 text-red-800'
                }`}
              >
                {result.isSafe ? 'Low Risk' : 'High Risk'}
              </span>
            </div>
          </div>

          {/* Technical Telemetry Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
                <Server size={14} /> Domain Authority
              </div>
              <div className="text-xs font-mono font-bold text-slate-900">{result.domainAge}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
                <Lock size={14} /> SSL/TLS Protocol
              </div>
              <div className="text-xs font-mono font-bold text-slate-900 truncate">{result.sslStatus}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
                <Globe size={14} /> Redirect Hops
              </div>
              <div className="text-xs font-mono font-bold text-slate-900">{result.redirects} hops detected</div>
            </div>
          </div>

          {/* Indicators List */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
              Heuristic Forensic Findings
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
                setUrl('');
                setStatus('idle');
                setResult(null);
              }}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 transition cursor-pointer"
            >
              Scan Another Target
            </button>

            <button
              onClick={() => navigate('/scans')}
              className="btn-primary text-xs px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <History size={14} /> Open Scan History
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
