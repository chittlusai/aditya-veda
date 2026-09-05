import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Globe, ShieldAlert, Loader2, ShieldCheck, Lock, Server, Clock, ArrowRight, Shield, History, CheckCircle2, AlertTriangle } from 'lucide-react';
import { ScanService } from '../services/ScanService';

interface WebsiteResult {
  domain: string;
  isFake: boolean;
  riskScore: number;
  homographSpoof: boolean;
  punycode: string | null;
  domainAgeDays: number;
  sslValid: boolean;
  sslIssuer: string;
  cloneTarget: string | null;
  similarityScore: number;
  serverLocation: string;
  reasons: string[];
}

const PRESET_TARGETS = [
  { label: 'Punycode PayPal Clone', domain: 'http://pаypal-security-update.com' },
  { label: 'Fake Chase Bank Portal', domain: 'https://secure-chase-auth-login.net' },
  { label: 'Legitimate GitHub', domain: 'https://github.com' },
];

export default function WebsiteScan() {
  const navigate = useNavigate();
  const [domain, setDomain] = useState('');
  const [status, setStatus] = useState<'idle' | 'scanning' | 'done' | 'invalid'>('idle');
  const [invalidReason, setInvalidReason] = useState('');
  const [scanStep, setScanStep] = useState('');
  const [result, setResult] = useState<WebsiteResult | null>(null);

  const handleScan = (targetDomain: string) => {
    const trimmed = (targetDomain || '').trim();
    if (!trimmed) {
      setStatus('invalid');
      setInvalidReason('No website or domain was provided. Please enter a valid address to inspect.');
      setResult(null);
      return;
    }

    // 1. Real-time domain validation
    const validation = ScanService.validateUrl(trimmed);
    if (!validation.isValid) {
      setStatus('invalid');
      setInvalidReason(validation.reason || 'There is no valid URL or website provided. Please provide an active domain or URL.');
      setResult(null);
      return;
    }

    setStatus('scanning');
    setResult(null);
    setInvalidReason('');

    setScanStep('Resolving DNS records and registrar WHOIS...');
    setTimeout(() => {
      setScanStep('Inspecting SSL certificate transparency logs & cryptographic signatures...');
      setTimeout(() => {
        setScanStep('Auditing DOM structure & brand visual clone similarity in real time...');
        setTimeout(async () => {
          // 2. Run real-time heuristic evaluation & live DNS resolution
          const evaluated = await ScanService.analyzeWebsite(targetDomain);

          if (!evaluated.isValid) {
            setStatus('invalid');
            setInvalidReason(evaluated.errorMessage || 'There is no valid website found at this address.');
            return;
          }

          setStatus('done');
          setResult({
            domain: targetDomain,
            isFake: evaluated.isFake,
            riskScore: evaluated.riskScore,
            homographSpoof: evaluated.homographSpoof,
            punycode: evaluated.punycode,
            domainAgeDays: evaluated.domainAgeDays,
            sslValid: evaluated.sslValid,
            sslIssuer: evaluated.sslIssuer,
            cloneTarget: evaluated.cloneTarget,
            similarityScore: evaluated.similarityScore,
            serverLocation: evaluated.serverLocation,
            reasons: evaluated.reasons,
          });

          // 3. Persist to real-time Scan History!
          ScanService.saveScan({
            type: 'Website',
            target: targetDomain,
            risk: evaluated.riskScore,
            verdict: evaluated.verdict,
            threatName: evaluated.isFake
              ? evaluated.homographSpoof
                ? 'Homograph Punycode Domain Clone'
                : 'Counterfeit Website / Credential Harvester'
              : 'Verified Legitimate Web Destination',
            indicators: evaluated.reasons,
            details: {
              serverLocation: evaluated.serverLocation,
              sslIssuer: evaluated.sslIssuer,
              punycode: evaluated.punycode,
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
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-600 mb-3 shadow-sm">
          <Globe size={28} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Fake Website Detector</h1>
        <p className="text-sm text-slate-600 max-w-lg mx-auto mt-1">
          Expose counterfeit domains, homograph unicode traps, unauthorized brand clones, and deceptive SSL certs in real time.
        </p>
      </div>

      {/* Input Card */}
      <div className="card bg-white border border-slate-200/90 shadow-md p-5 rounded-2xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleScan(domain);
          }}
          className="space-y-4"
        >
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Globe size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="Enter suspicious domain (e.g. pаypal-security-update.com)..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-100 transition-all font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={status === 'scanning'}
              className="px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50 font-mono text-sm w-full sm:w-auto min-h-[44px]"
            >
              {status === 'scanning' ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Auditing...
                </>
              ) : (
                <>
                  Inspect Website
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>

          {/* Presets */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="font-mono text-slate-400">Quick tests:</span>
            {PRESET_TARGETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  setDomain(p.domain);
                  handleScan(p.domain);
                }}
                className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-cyan-50 hover:text-cyan-700 text-slate-700 font-medium transition cursor-pointer border border-slate-200/60 font-mono"
              >
                {p.label}
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* Progress */}
      {status === 'scanning' && (
        <div className="card bg-white text-slate-800 p-5 rounded-2xl border border-slate-200 shadow-md space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between text-cyan-600 font-bold">
            <span className="flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-cyan-500" />
              RUNNING CRYPTOGRAPHIC DOMAIN & HOMOGRAPH AUDIT
            </span>
            <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 border border-slate-200 font-bold">REAL-TIME TELEMETRY</span>
          </div>
          <p className="text-slate-600">{scanStep}</p>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
            <div className="bg-cyan-500 h-full w-4/5 animate-pulse" />
          </div>
        </div>
      )}

      {/* Invalid Website / No Website Provided State */}
      {status === 'invalid' && (
        <div className="card bg-amber-50/90 border-2 border-amber-300 shadow-md rounded-2xl p-6 text-left space-y-4 animate-in fade-in duration-200">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shrink-0">
              <AlertTriangle size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-amber-950 flex items-center gap-2">
                No Valid Website Provided
              </h3>
              <p className="text-sm text-amber-900 leading-relaxed">
                {invalidReason || 'There is no valid website or domain found for the address you entered. Please enter a valid, accessible domain name to inspect.'}
              </p>
            </div>
          </div>

          <div className="bg-white/90 rounded-xl p-4 border border-amber-200 text-xs text-slate-700 space-y-2 font-mono">
            <div className="font-bold text-slate-900 font-sans">Requirements for a real-time website audit:</div>
            <div className="space-y-1 text-slate-600">
              <div>• Enter a registered domain name (e.g., <code className="text-cyan-700 font-bold">github.com</code> or <code className="text-cyan-700 font-bold">chase-security-verify.net</code>)</div>
              <div>• Top-level domains supported: <span className="text-slate-800 font-bold">.com, .org, .net, .io, .xyz, .top, .edu, .gov, etc.</span></div>
              <div>• Cannot contain spaces or non-resolvable domain fragments</div>
            </div>
          </div>

          <div className="pt-1 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-amber-800 font-medium">Try one of the quick test targets above to test the real-time detector.</span>
            <button
              type="button"
              onClick={() => {
                const sample = 'https://github.com';
                setDomain(sample);
                handleScan(sample);
              }}
              className="px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs font-mono"
            >
              Try "github.com" <ArrowRight size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {status === 'done' && result && (
        <div className="card bg-white border border-slate-200/90 shadow-xl rounded-2xl p-6 space-y-6 text-left animate-in fade-in duration-300">
          {/* Real-time Persistence Notification Badge */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-cyan-50/80 border border-cyan-200 text-slate-900 text-xs font-mono">
            <span className="flex items-center gap-2 text-emerald-700 font-bold">
              <CheckCircle2 size={15} /> Real-Time Telemetry Logged
            </span>
            <Link
              to="/scans"
              className="text-cyan-700 hover:text-cyan-800 underline font-bold flex items-center gap-1 transition"
            >
              <History size={13} /> View in Scan History →
            </Link>
          </div>

          {/* Verdict Banner */}
          <div
            className={`p-4 rounded-xl border flex items-start justify-between gap-4 ${
              result.isFake
                ? 'bg-red-50/80 border-red-200 text-red-900'
                : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
            }`}
          >
            <div className="flex items-start gap-3">
              {result.isFake ? (
                <ShieldAlert size={28} className="text-red-600 shrink-0 mt-0.5" />
              ) : (
                <ShieldCheck size={28} className="text-emerald-600 shrink-0 mt-0.5" />
              )}
              <div>
                <h3 className="text-base sm:text-lg font-black tracking-tight">
                  {result.isFake
                    ? 'Deceptive / Counterfeit Website Detected'
                    : 'Legitimate Authoritative Website'}
                </h3>
                <p className="text-sm font-semibold mt-1 text-slate-700">
                  Audit Verdict:{' '}
                  <span className={`font-mono font-bold ${result.isFake ? 'text-red-700' : 'text-emerald-700'}`}>
                    {result.isFake ? 'FAKE / CLONE' : 'VERIFIED LEGITIMATE'}
                  </span>
                </p>
                <p className="text-xs mt-1 opacity-90 font-mono break-all">{result.domain}</p>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 shrink-0">
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-70">Threat Risk</span>
              <div className={`text-2xl font-black font-mono ${result.isFake ? 'text-red-600' : 'text-emerald-600'}`}>
                {result.riskScore}/100
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <Clock size={12} /> Domain Age
              </span>
              <p className="font-bold text-slate-900 mt-1">{result.domainAgeDays} Days</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <Lock size={12} /> SSL Authority
              </span>
              <p className={`font-bold mt-1 truncate ${result.sslValid ? 'text-emerald-600' : 'text-red-600'}`}>
                {result.sslValid ? 'Valid EV Root' : 'Untrusted / Insecure'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <Shield size={12} /> Homograph Glyphs
              </span>
              <p className={`font-bold mt-1 ${result.homographSpoof ? 'text-red-600' : 'text-emerald-600'}`}>
                {result.homographSpoof ? 'DETECTED' : 'CLEAN'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <Server size={12} /> Host Origin
              </span>
              <p className="font-bold text-slate-900 mt-1 truncate">{result.serverLocation}</p>
            </div>
          </div>

          {/* Punycode Banner if detected */}
          {result.punycode && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs font-mono">
              <span className="font-bold uppercase tracking-wider block mb-1 text-red-700">REAL PUNYCODE DNS RESOLUTION:</span>
              <div className="bg-white border border-red-200 p-2.5 rounded-lg font-black text-red-700 shadow-xs">{result.punycode}</div>
            </div>
          )}

          {/* Indicators */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
              Heuristic Forensic Indicators
            </h4>
            <div className="space-y-1.5 font-mono text-xs">
              {result.reasons.map((r, i) => (
                <div
                  key={i}
                  className={`p-2.5 rounded-lg border flex items-start gap-2.5 ${
                    !result.isFake
                      ? 'bg-emerald-50/40 border-emerald-100 text-emerald-900'
                      : 'bg-red-50/40 border-red-100 text-red-900'
                  }`}
                >
                  <span className="font-bold shrink-0">{!result.isFake ? '✓' : '⚠️'}</span>
                  <span>{r}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
            <button
              onClick={() => {
                setDomain('');
                setStatus('idle');
                setResult(null);
              }}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 transition cursor-pointer font-mono"
            >
              Inspect Another Website
            </button>

            <button
              onClick={() => navigate('/scans')}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold font-mono flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <History size={14} /> Open Scan History
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
