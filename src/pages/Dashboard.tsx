import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, MessageSquare, QrCode, Image as ImageIcon, Globe, Users,
  TrendingUp, AlertTriangle, CheckCircle, ShieldAlert, ArrowRight,
  Zap, Filter, X, ChevronRight, History
} from 'lucide-react';
import { CountUp, SpotlightCard, DashboardThreatGlobe } from '../components/animations';
import { ScanService, type ScanRecord } from '../services/ScanService';

const TOOLS = [
  {
    icon: Search,
    title: 'URL Scanner',
    desc: 'Typosquats, zero-day redirects, credential harvesters',
    path: '/scan/url',
    color: 'text-orange-500',
    tag: 'Deep Heuristics',
    accent: '#f97316',
  },
  {
    icon: MessageSquare,
    title: 'Message Analyzer',
    desc: 'SMS smishing, executive wire BEC, urgency NLP',
    path: '/scan/message',
    color: 'text-sky-500',
    tag: 'NLP Sentiment',
    accent: '#0284c7',
  },
  {
    icon: QrCode,
    title: 'QR Scanner',
    desc: 'Quishing traps, malicious payment codes, hidden payloads',
    path: '/scan/qr',
    color: 'text-purple-500',
    tag: 'Camera / Upload',
    accent: '#a855f7',
  },
  {
    icon: ImageIcon,
    title: 'Screenshot Inspector',
    desc: 'Brand visual impersonation, OCR fake login forms',
    path: '/scan/screenshot',
    color: 'text-emerald-500',
    tag: 'Visual AI',
    accent: '#10b981',
  },
  {
    icon: Globe,
    title: 'Fake Website Detector',
    desc: 'Homograph traps, unicode punycode, clone interfaces',
    path: '/scan/website',
    color: 'text-cyan-500',
    tag: 'TLS & DOM Analysis',
    accent: '#06b6d4',
  },
  {
    icon: Users,
    title: 'Social Media Scanner',
    desc: 'Impersonation accounts, botnet velocity, crypto airdrop baits',
    path: '/scan/social',
    color: 'text-pink-500',
    tag: 'Account Forensics',
    accent: '#10b981',
  },
] as const;

export default function Dashboard() {
  const navigate = useNavigate();
  const [quickInput, setQuickInput] = useState('');
  const [scans, setScans] = useState<ScanRecord[]>(() => ScanService.getScans());
  const [stats, setStats] = useState(() => ScanService.getStats());
  const [selectedScan, setSelectedScan] = useState<ScanRecord | null>(null);
  const [filterType, setFilterType] = useState<string>('ALL');

  // Real-time synchronization with ScanService
  useEffect(() => {
    const handleSync = () => {
      setScans(ScanService.getScans());
      setStats(ScanService.getStats());
    };
    window.addEventListener('phishguard:scan-updated', handleSync);
    return () => window.removeEventListener('phishguard:scan-updated', handleSync);
  }, []);

  const [quickError, setQuickError] = useState('');

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    const input = quickInput.trim();
    const seemsUrl = input.startsWith('http://') || input.startsWith('https://') || (!input.includes(' ') && input.includes('.'));
    
    if (seemsUrl) {
      const validation = ScanService.validateUrl(input);
      if (!validation.isValid) {
        setQuickError(validation.reason || 'No valid URL or website provided. Please enter a valid, accessible web address.');
        return;
      }
      setQuickError('');
      navigate(`/scan/url?target=${encodeURIComponent(input)}`);
    } else {
      setQuickError('');
      navigate(`/scan/message?msg=${encodeURIComponent(input)}`);
    }
  };

  const filteredRecent = filterType === 'ALL'
    ? scans.slice(0, 8)
    : scans.filter((r) => r.type.toUpperCase() === filterType.toUpperCase()).slice(0, 8);

  const statsCards = [
    {
      icon: TrendingUp,
      label: 'Total Scans',
      to: stats.totalScans,
      sub: 'Real-time telemetry',
      color: 'text-orange-500',
      glow: 'hover:border-orange-400/50',
    },
    {
      icon: AlertTriangle,
      label: 'Threats Intercepted',
      to: stats.threatsIntercepted,
      sub: 'Confirmed defused',
      color: 'text-red-500',
      glow: 'hover:border-red-400/50',
    },
    {
      icon: CheckCircle,
      label: 'Verified Clean',
      to: stats.verifiedClean,
      sub: 'Legitimate entities',
      color: 'text-emerald-500',
      glow: 'hover:border-emerald-400/50',
    },
    {
      icon: ShieldAlert,
      label: 'Active Campaigns',
      to: stats.activeCampaigns,
      sub: 'Global live feed',
      color: 'text-amber-500',
      glow: 'hover:border-amber-400/50',
    },
  ];

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto text-left">
      {/* ── Top Cyber Command Header ──────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1.5 font-mono text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-emerald-400 font-bold uppercase tracking-wider">
              DEFENSE STATUS: ACTIVE • DEFCON 3
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">LATENCY: 14MS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            Cyber Threat Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Real-time neural telemetry, live scan logs, and autonomous defense scanners.
          </p>
        </div>

        {/* Universal Quick Scan Input */}
        <div className="w-full md:w-96">
          <form onSubmit={handleQuickSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center bg-white rounded-xl p-1.5 border border-slate-300 shadow-sm gap-1.5 sm:gap-0">
            <div className="flex items-center flex-1 min-w-0 px-2.5 py-1">
              <Search size={16} className="text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                value={quickInput}
                onChange={(e) => {
                  setQuickInput(e.target.value);
                  if (quickError) setQuickError('');
                }}
                placeholder="Scan URL, domain, or message..."
                className="w-full bg-transparent text-xs text-slate-900 placeholder-slate-400 outline-none font-mono"
              />
            </div>
            <button
              type="submit"
              className="btn-primary text-xs px-3.5 py-2.5 sm:py-2 rounded-lg shrink-0 font-bold cursor-pointer font-mono shadow-xs justify-center min-h-[38px]"
            >
              Scan Now
            </button>
          </form>
          {quickError && (
            <div className="mt-1.5 p-2 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center gap-1.5 animate-in fade-in">
              <span className="font-bold text-amber-700">⚠️</span>
              <span>{quickError}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── 3D Interactive Global Threat Telemetry ──── */}
      <div>
        <DashboardThreatGlobe />
      </div>

      {/* ── Real-Time Metrics Cards with CountUp ─────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {statsCards.map((s) => (
          <div
            key={s.label}
            className={`card bg-white border border-slate-200/90 shadow-sm p-3.5 sm:p-4 rounded-2xl transition-all ${s.glow}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">{s.label}</span>
              <div className={`p-1.5 rounded-lg bg-slate-100 ${s.color} shrink-0`}>
                <s.icon size={15} />
              </div>
            </div>
            <div className="text-xl sm:text-3xl font-black text-slate-900 font-mono">
              <CountUp to={s.to} duration={1.2} />
            </div>
            <div className="text-[10px] sm:text-[11px] font-medium text-slate-500 mt-1 flex items-center gap-1 font-mono truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="truncate">{s.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Active Scanners Grid (All 6 Working Tools) ─ */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-orange-500" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Active Defense Scanners</h2>
          </div>
          <span className="text-xs font-mono text-slate-500">6 Real-Time Engines Online</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {TOOLS.map((t) => (
            <Link
              key={t.title}
              to={t.path}
              className="block group"
            >
              <SpotlightCard
                spotlightColor="rgba(249, 115, 22, 0.15)"
                className="p-4 sm:p-5 h-full rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-orange-400/60 hover:shadow-md transition-all text-left flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-xl bg-slate-100 ${t.color}`}>
                      <t.icon size={20} />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/80">
                      {t.tag}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-orange-600 transition-colors">
                    {t.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {t.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-orange-600 group-hover:translate-x-0.5 transition-transform min-h-[32px]">
                  <span>Launch Engine</span>
                  <ChevronRight size={14} />
                </div>
              </SpotlightCard>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Recent Threat Activity & Real-Time Scan Logs ── */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <History size={18} className="text-orange-500" />
              Recent Threat Activity & Telemetry
            </h2>
            <p className="text-xs text-slate-500">Live feed updated in real time from all user investigations.</p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs font-mono overflow-x-auto no-scrollbar max-w-full">
              <Filter size={12} className="text-slate-400 ml-1.5 shrink-0" />
              {['ALL', 'URL', 'MESSAGE', 'QR', 'SCREENSHOT', 'WEBSITE', 'SOCIAL'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setFilterType(filter)}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer shrink-0 ${
                    filterType === filter ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <Link
              to="/scans"
              className="text-xs font-mono font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 shrink-0 ml-auto sm:ml-2"
            >
              Full History →
            </Link>
          </div>
        </div>

        <div className="card overflow-hidden p-0 bg-white border border-slate-200/90 shadow-sm rounded-2xl">
          {/* Mobile Card List (<md) */}
          <div className="md:hidden divide-y divide-slate-100 font-mono">
            {filteredRecent.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 font-sans">
                No recent scans match the selected filter.
              </div>
            ) : (
              filteredRecent.map((r) => (
                <div
                  key={r.id}
                  onClick={() => setSelectedScan(r)}
                  className="p-3.5 hover:bg-slate-50 transition-colors cursor-pointer active:bg-orange-50/50 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700">
                      {r.type}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      r.verdict === 'MALICIOUS'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : r.verdict === 'SUSPICIOUS'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {r.verdict === 'MALICIOUS' ? <AlertTriangle size={11} /> : <CheckCircle size={11} />}
                      {r.verdict}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {r.target}
                  </div>
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-slate-400">{r.date}</span>
                    <div className="flex items-center gap-2">
                      <span className={`font-black ${
                        r.risk > 70 ? 'text-red-600' : r.risk > 40 ? 'text-amber-600' : 'text-emerald-600'
                      }`}>
                        Risk {r.risk}/100
                      </span>
                      <ChevronRight size={14} className="text-orange-600" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table (>=md) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-500 font-mono text-[11px] uppercase tracking-wider">
                  <th className="text-left px-5 py-3 font-semibold">Engine</th>
                  <th className="text-left px-5 py-3 font-semibold">Target / Payload</th>
                  <th className="text-left px-5 py-3 font-semibold">Status</th>
                  <th className="text-left px-5 py-3 font-semibold">Risk Score</th>
                  <th className="text-left px-5 py-3 font-semibold hidden md:table-cell">Timestamp</th>
                  <th className="text-right px-5 py-3 font-semibold">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredRecent.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => setSelectedScan(r)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                        {r.type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-800 text-xs max-w-xs truncate font-medium">
                      {r.target}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md ${
                        r.verdict === 'MALICIOUS'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : r.verdict === 'SUSPICIOUS'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {r.verdict === 'MALICIOUS' ? <AlertTriangle size={11} /> : <CheckCircle size={11} />}
                        {r.verdict}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-black ${
                          r.risk > 70 ? 'text-red-600' : r.risk > 40 ? 'text-amber-600' : 'text-emerald-600'
                        }`}>
                          {r.risk}/100
                        </span>
                        <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                          <div
                            className={`h-full rounded-full ${
                              r.risk > 70 ? 'bg-red-500' : r.risk > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${r.risk}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs hidden md:table-cell">
                      {r.date}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="text-xs text-orange-600 font-bold group-hover:underline inline-flex items-center gap-1">
                        Details <ChevronRight size={14} />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Forensic Inspection Modal Drawer ─────────── */}
      {selectedScan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 text-left space-y-4 animate-in fade-in zoom-in-95 duration-200 font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl ${selectedScan.risk > 70 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-sans">Forensic Incident Report</h3>
                  <p className="text-xs text-slate-500">ID: {selectedScan.id} • {selectedScan.date}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedScan(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <div className="text-[11px] text-slate-500 uppercase font-semibold">Target Vector</div>
              <div className="text-xs font-bold text-slate-900 break-all">{selectedScan.target}</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl border border-slate-200 bg-white">
                <div className="text-[11px] font-medium text-slate-500 uppercase">Assessment</div>
                <div className="text-xs font-bold text-slate-900 mt-0.5">{selectedScan.threatName}</div>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 bg-white">
                <div className="text-[11px] font-medium text-slate-500 uppercase">Risk Level</div>
                <div className={`text-sm font-black mt-0.5 ${
                  selectedScan.risk > 70 ? 'text-red-600' : 'text-emerald-600'
                }`}>
                  {selectedScan.risk}/100 ({selectedScan.verdict})
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Triggered Threat Indicators ({selectedScan.indicators.length})
              </h4>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {selectedScan.indicators.map((ind, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    <span>{ind}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedScan(null)}
                className="btn-secondary text-xs px-4 py-2 rounded-xl cursor-pointer"
              >
                Close Report
              </button>
              <button
                onClick={() => {
                  navigate(`/scan/${selectedScan.type.toLowerCase()}?target=${encodeURIComponent(selectedScan.target)}`);
                }}
                className="btn-primary text-xs px-4 py-2 rounded-xl font-bold cursor-pointer flex items-center gap-1.5"
              >
                Run Deep Rescan
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
