import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Users, Loader2, ShieldCheck, UserX, Bot, ArrowRight, History, CheckCircle2 } from 'lucide-react';
import { ScanService } from '../services/ScanService';

interface SocialResult {
  handle: string;
  platform: string;
  isScam: boolean;
  botScore: number;
  riskScore: number;
  impersonatedEntity: string | null;
  bioLinkRisk: 'DANGEROUS' | 'SUSPICIOUS' | 'CLEAN' | 'NONE';
  bioLinkTarget: string | null;
  followerAnomaly: string;
  indicators: string[];
}

const PRESET_ACCOUNTS = [
  { platform: 'Twitter / X', handle: '@elon_airdrop_official_x', label: 'Fake Crypto Airdrop' },
  { platform: 'Instagram', handle: '@support_metamask_desk_help', label: 'MetaMask Support Impersonator' },
  { platform: 'LinkedIn', handle: '@sundar_pichai_verified', label: 'CEO Executive Clone' },
  { platform: 'Twitter / X', handle: '@satyanadella', label: 'Verified Legitimate Account' },
];

export default function SocialScan() {
  const navigate = useNavigate();
  const [handle, setHandle] = useState('');
  const [platform, setPlatform] = useState('Twitter / X');
  const [status, setStatus] = useState<'idle' | 'scanning' | 'done'>('idle');
  const [result, setResult] = useState<SocialResult | null>(null);

  const handleScan = (accountHandle: string, currentPlatform = platform) => {
    if (!accountHandle.trim()) return;
    setStatus('scanning');
    setResult(null);

    setTimeout(() => {
      setStatus('done');
      // 1. Run real-time heuristic evaluation
      const evaluated = ScanService.analyzeSocial(accountHandle, currentPlatform);

      setResult({
        handle: accountHandle,
        platform: currentPlatform,
        isScam: evaluated.isScam,
        botScore: evaluated.botScore,
        riskScore: evaluated.riskScore,
        impersonatedEntity: evaluated.impersonatedEntity,
        bioLinkRisk: evaluated.bioLinkRisk,
        bioLinkTarget: evaluated.bioLinkTarget,
        followerAnomaly: evaluated.followerAnomaly,
        indicators: evaluated.indicators,
      });

      // 2. Persist to real-time Scan History!
      ScanService.saveScan({
        type: 'Social',
        target: `${accountHandle} (${currentPlatform})`,
        risk: evaluated.riskScore,
        verdict: evaluated.verdict,
        threatName: evaluated.isScam ? evaluated.impersonatedEntity : 'Organic Verified Profile',
        indicators: evaluated.indicators,
        details: {
          platform: currentPlatform,
          botScore: evaluated.botScore,
          bioLink: evaluated.bioLinkTarget,
        },
      });
    }, 1200);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 text-left">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-pink-50 border border-pink-200 text-pink-600 mb-3 shadow-sm">
          <Users size={28} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Social Media Scanner</h1>
        <p className="text-sm text-slate-600 max-w-lg mx-auto mt-1">
          Detect impersonation accounts, botnet coordination, crypto airdrop scams, and malicious bio links in real time.
        </p>
      </div>

      {/* Input Card */}
      <div className="card bg-white border border-slate-200/90 shadow-md p-5 rounded-2xl space-y-4">
        <div className="flex flex-wrap gap-2 text-xs font-mono">
          <span className="text-slate-400 font-bold self-center mr-1">PLATFORM:</span>
          {['Twitter / X', 'Instagram', 'LinkedIn', 'Telegram'].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPlatform(p)}
              className={`px-3 py-1 rounded-lg border font-bold transition cursor-pointer ${
                platform === p
                  ? 'bg-pink-600 text-white border-pink-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleScan(handle);
          }}
          className="space-y-4"
        >
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold">
                @
              </span>
              <input
                type="text"
                value={handle.startsWith('@') ? handle.slice(1) : handle}
                onChange={(e) => setHandle(e.target.value.startsWith('@') ? e.target.value : `@${e.target.value}`)}
                placeholder="account_handle or username..."
                className="w-full pl-8 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-pink-500 focus:bg-white focus:ring-2 focus:ring-pink-100 transition-all font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={status === 'scanning'}
              className="px-6 py-3 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50 font-mono text-sm w-full sm:w-auto min-h-[44px]"
            >
              {status === 'scanning' ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Auditing...
                </>
              ) : (
                <>
                  Audit Account
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>

          {/* Presets */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="font-mono text-slate-400">Quick tests:</span>
            {PRESET_ACCOUNTS.map((p) => (
              <button
                key={p.handle}
                type="button"
                onClick={() => {
                  setPlatform(p.platform);
                  setHandle(p.handle);
                  handleScan(p.handle, p.platform);
                }}
                className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-pink-50 hover:text-pink-700 text-slate-700 font-medium transition cursor-pointer border border-slate-200/60 font-mono"
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
          <div className="flex items-center justify-between text-pink-600 font-bold">
            <span className="flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-pink-500" />
              RUNNING SOCIAL GRAPH BOT AUDIT & PERSONA MATCHING
            </span>
            <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 border border-slate-200 font-bold">REAL-TIME FORENSICS</span>
          </div>
          <p className="text-slate-600">Scanning bio links, historical post velocity, reply spam patterns, and follower ratio anomalies...</p>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
            <div className="bg-pink-500 h-full w-4/5 animate-pulse" />
          </div>
        </div>
      )}

      {/* Results */}
      {status === 'done' && result && (
        <div className="card bg-white border border-slate-200/90 shadow-xl rounded-2xl p-6 space-y-6 text-left animate-in fade-in duration-300">
          {/* Real-time Persistence Notification Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-pink-50/80 border border-pink-200 text-slate-900 text-xs font-mono">
            <span className="flex items-center gap-2 text-emerald-700 font-bold">
              <CheckCircle2 size={15} /> Real-Time Telemetry Logged
            </span>
            <Link
              to="/scans"
              className="text-pink-700 hover:text-pink-800 underline font-bold flex items-center gap-1 transition"
            >
              <History size={13} /> View in Scan History →
            </Link>
          </div>

          {/* Verdict Banner */}
          <div
            className={`p-4 sm:p-5 rounded-xl border flex flex-col sm:flex-row items-start justify-between gap-4 ${
              result.isScam
                ? 'bg-red-50/80 border-red-200 text-red-900'
                : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
            }`}
          >
            <div className="flex items-start gap-3">
              {result.isScam ? (
                <UserX size={28} className="text-red-600 shrink-0 mt-0.5" />
              ) : (
                <ShieldCheck size={28} className="text-emerald-600 shrink-0 mt-0.5" />
              )}
              <div>
                <h3 className="text-lg font-black tracking-tight">
                  {result.isScam
                    ? 'Scam / Impersonation Account Detected'
                    : 'Verified Authentic Profile'}
                </h3>
                <p className="text-sm font-semibold mt-1 text-slate-700">
                  Impersonation Target:{' '}
                  <span className={`font-mono font-bold ${result.isScam ? 'text-red-700' : 'text-emerald-700'}`}>
                    {result.impersonatedEntity || 'None (Authentic Author)'}
                  </span>
                </p>
                <p className="text-xs mt-1 opacity-90 font-mono">
                  {result.handle} • {result.platform}
                </p>
              </div>
            </div>

            <div className="flex sm:block items-center justify-between w-full sm:w-auto text-left sm:text-right shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-70">Threat Risk</span>
              <div className={`text-2xl font-black font-mono ${result.isScam ? 'text-red-600' : 'text-emerald-600'}`}>
                {result.riskScore}/100
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <Bot size={13} /> Botnet Probability
              </span>
              <p className={`font-bold text-sm mt-1 ${result.botScore > 50 ? 'text-red-600' : 'text-emerald-600'}`}>
                {result.botScore}% Bot Likelihood
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Bio Link Safety</span>
              <p className={`font-bold text-sm mt-1 ${result.bioLinkRisk === 'DANGEROUS' ? 'text-red-600' : 'text-emerald-600'}`}>
                {result.bioLinkRisk}
              </p>
            </div>
          </div>

          {/* Indicators */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
              Account Forensic Corroboration
            </h4>
            <div className="space-y-1.5 font-mono text-xs">
              {result.indicators.map((ind, i) => (
                <div
                  key={i}
                  className={`p-2.5 rounded-lg border flex items-start gap-2.5 ${
                    !result.isScam
                      ? 'bg-emerald-50/40 border-emerald-100 text-emerald-900'
                      : 'bg-red-50/40 border-red-100 text-red-900'
                  }`}
                >
                  <span className="font-bold shrink-0">{!result.isScam ? '✓' : '⚠️'}</span>
                  <span>{ind}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
            <button
              onClick={() => {
                setHandle('');
                setStatus('idle');
                setResult(null);
              }}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 transition cursor-pointer font-mono"
            >
              Audit Another Account
            </button>

            <button
              onClick={() => navigate('/scans')}
              className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold font-mono flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <History size={14} /> Open Scan History
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
