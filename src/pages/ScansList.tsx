import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History, Search, Trash2, ExternalLink, ShieldAlert, CheckCircle2,
  AlertTriangle, Filter, X, ArrowRight, Globe, MessageSquare, QrCode,
  Image as ImageIcon, Users, RefreshCw
} from 'lucide-react';
import { ScanService, type ScanRecord } from '../services/ScanService';

export default function ScansList() {
  const navigate = useNavigate();
  const [scans, setScans] = useState<ScanRecord[]>(() => ScanService.getScans());
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [verdictFilter, setVerdictFilter] = useState<string>('ALL');
  const [selectedScan, setSelectedScan] = useState<ScanRecord | null>(null);

  // Synchronize reactively with real-time scan updates from any tool
  useEffect(() => {
    const handleSync = () => {
      setScans(ScanService.getScans());
    };
    window.addEventListener('phishguard:scan-updated', handleSync);
    return () => window.removeEventListener('phishguard:scan-updated', handleSync);
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    ScanService.deleteScan(id);
    if (selectedScan?.id === id) {
      setSelectedScan(null);
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all scan history? This action cannot be undone.')) {
      ScanService.clearAllScans();
      setScans([]);
      setSelectedScan(null);
    }
  };

  const filteredScans = useMemo(() => {
    return scans.filter((s) => {
      const matchesSearch =
        s.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.threatName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = typeFilter === 'ALL' || s.type.toUpperCase() === typeFilter.toUpperCase();
      const matchesVerdict = verdictFilter === 'ALL' || s.verdict === verdictFilter;

      return matchesSearch && matchesType && matchesVerdict;
    });
  }, [scans, searchQuery, typeFilter, verdictFilter]);

  const getTypeIcon = (type: ScanRecord['type']) => {
    switch (type) {
      case 'URL': return <Globe size={14} className="text-orange-500" />;
      case 'Message': return <MessageSquare size={14} className="text-sky-500" />;
      case 'QR': return <QrCode size={14} className="text-purple-500" />;
      case 'Screenshot': return <ImageIcon size={14} className="text-emerald-500" />;
      case 'Website': return <Globe size={14} className="text-amber-500" />;
      case 'Social': return <Users size={14} className="text-pink-500" />;
      default: return <Globe size={14} />;
    }
  };

  const handleReScan = (scan: ScanRecord) => {
    switch (scan.type) {
      case 'URL':
        navigate(`/scan/url?target=${encodeURIComponent(scan.target)}`);
        break;
      case 'Message':
        navigate(`/scan/message?msg=${encodeURIComponent(scan.target)}`);
        break;
      case 'QR':
        navigate('/scan/qr');
        break;
      case 'Screenshot':
        navigate('/scan/screenshot');
        break;
      case 'Website':
        navigate('/scan/website');
        break;
      case 'Social':
        navigate('/scan/social');
        break;
      default:
        navigate('/scan/url');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 text-left">
      {/* ── Header & Telemetry Bar ──────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1.5 font-mono text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-emerald-400 font-bold uppercase tracking-wider">
              REAL-TIME SCAN TELEMETRY ACTIVE
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">{scans.length} TOTAL RECORDS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <History size={26} className="text-orange-500" />
            Scan History & Threat Logs
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time chronological archive of all URL, message, QR, and forensic investigations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {scans.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-red-950 text-slate-300 hover:text-red-400 border border-slate-700 hover:border-red-800 text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 size={13} /> Clear Log
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate('/scan/url')}
            className="btn-primary text-xs px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-orange-600/20"
          >
            New Real-Time Scan <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* ── Filters & Search Control Bar ────────────── */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search targets, threat types, or keywords in real time..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 transition-all font-medium font-mono"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Filters — Mobile Touch Scrollable */}
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold overflow-x-auto no-scrollbar max-w-full pb-1">
          <span className="text-slate-400 mr-1 flex items-center gap-1 shrink-0">
            <Filter size={13} /> TYPE:
          </span>
          {['ALL', 'URL', 'MESSAGE', 'QR', 'SCREENSHOT', 'WEBSITE', 'SOCIAL'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setTypeFilter(type)}
              className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer shrink-0 ${
                typeFilter === type
                  ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Verdict Filter Bar — Mobile Touch Scrollable */}
      <div className="flex items-center gap-2 text-xs font-mono px-1 overflow-x-auto no-scrollbar max-w-full pb-1">
        <span className="text-slate-500 font-bold shrink-0">VERDICT:</span>
        {(['ALL', 'MALICIOUS', 'SUSPICIOUS', 'CLEAN'] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setVerdictFilter(v)}
            className={`px-3 py-1 rounded-full border transition cursor-pointer font-bold shrink-0 ${
              verdictFilter === v
                ? v === 'MALICIOUS'
                  ? 'bg-red-600 text-white border-red-600 shadow-xs'
                  : v === 'SUSPICIOUS'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : v === 'CLEAN'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-orange-500 text-white border-orange-500 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {/* ── Main Scans View: Mobile Cards (<md) + Desktop Table (>=md) ── */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
        {filteredScans.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Search size={24} />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">No Scans Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4 font-mono">
              {searchQuery || typeFilter !== 'ALL' || verdictFilter !== 'ALL'
                ? 'Try adjusting your search criteria or filter tags.'
                : 'You have not executed any scans yet. Run a real-time scan using any of the tools below.'}
            </p>
            <button
              onClick={() => navigate('/scan/url')}
              className="btn-primary text-xs px-4 py-2.5 rounded-xl font-bold cursor-pointer"
            >
              Launch URL Scanner
            </button>
          </div>
        ) : (
          <>
            {/* Mobile Card List (<md) */}
            <div className="md:hidden divide-y divide-slate-100 font-mono">
              {filteredScans.map((scan) => {
                const isMal = scan.verdict === 'MALICIOUS';
                const isSus = scan.verdict === 'SUSPICIOUS';

                return (
                  <div
                    key={scan.id}
                    onClick={() => setSelectedScan(scan)}
                    className="p-4 space-y-2.5 hover:bg-orange-50/30 transition-colors cursor-pointer active:bg-orange-50/60"
                  >
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold">
                        {getTypeIcon(scan.type)}
                        {scan.type}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          isMal
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : isSus
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {isMal ? (
                          <ShieldAlert size={12} />
                        ) : isSus ? (
                          <AlertTriangle size={12} />
                        ) : (
                          <CheckCircle2 size={12} />
                        )}
                        {scan.risk}/100 • {scan.verdict}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-slate-900 truncate">
                      {scan.target}
                    </div>

                    <div className="text-[11px] text-slate-500 truncate">
                      {scan.threatName}
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                      <span className="text-slate-400 text-[10px]">{scan.date}</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedScan(scan);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition cursor-pointer flex items-center gap-1"
                        >
                          <ExternalLink size={12} />
                          Details
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDelete(scan.id, e)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-600 transition cursor-pointer"
                          title="Delete scan"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table (>=md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-mono text-slate-500 uppercase tracking-wider">
                    <th className="px-5 py-3.5 font-bold">Type</th>
                    <th className="px-5 py-3.5 font-bold">Investigated Target</th>
                    <th className="px-5 py-3.5 font-bold">Threat Classification</th>
                    <th className="px-5 py-3.5 font-bold">Risk Assessment</th>
                    <th className="px-5 py-3.5 font-bold hidden md:table-cell">Timestamp</th>
                    <th className="px-5 py-3.5 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {filteredScans.map((scan) => {
                    const isMal = scan.verdict === 'MALICIOUS';
                    const isSus = scan.verdict === 'SUSPICIOUS';

                    return (
                      <tr
                        key={scan.id}
                        onClick={() => setSelectedScan(scan)}
                        className="hover:bg-orange-50/40 transition-colors cursor-pointer group"
                      >
                        {/* Type Badge */}
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold">
                            {getTypeIcon(scan.type)}
                            {scan.type}
                          </span>
                        </td>

                        {/* Target String */}
                        <td className="px-5 py-3.5">
                          <div className="max-w-[240px] sm:max-w-[320px] truncate font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                            {scan.target}
                          </div>
                        </td>

                        {/* Threat Classification */}
                        <td className="px-5 py-3.5">
                          <span className="text-xs text-slate-600 truncate block max-w-[200px]">
                            {scan.threatName}
                          </span>
                        </td>

                        {/* Risk Score */}
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                              isMal
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : isSus
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {isMal ? (
                              <ShieldAlert size={12} />
                            ) : isSus ? (
                              <AlertTriangle size={12} />
                            ) : (
                              <CheckCircle2 size={12} />
                            )}
                            {scan.risk}/100 • {scan.verdict}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-5 py-3.5 text-slate-400 text-xs hidden md:table-cell">
                          {scan.date}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedScan(scan);
                              }}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition cursor-pointer"
                              title="Inspect Technical Telemetry"
                            >
                              <ExternalLink size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDelete(scan.id, e)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-600 transition cursor-pointer"
                              title="Delete scan from history"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* ── Forensic Threat Deep-Dive Inspection Modal ── */}
      {selectedScan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white border border-slate-200 shadow-2xl text-slate-900 p-6 sm:p-8 overflow-hidden font-sans">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4 mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-200 font-mono">
                    {selectedScan.type} INVESTIGATION
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded text-[11px] font-bold font-mono ${
                      selectedScan.verdict === 'MALICIOUS'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : selectedScan.verdict === 'SUSPICIOUS'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    RISK {selectedScan.risk}/100 • {selectedScan.verdict}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 truncate max-w-lg">
                  {selectedScan.threatName}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedScan(null)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Target Card */}
            <div className="mb-5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1 font-mono">
                EXAMINED TARGET PAYLOAD:
              </span>
              <div className="text-xs sm:text-sm text-orange-600 font-mono font-bold break-all">
                {selectedScan.target}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 font-mono">
                Logged: {selectedScan.date} • ID: {selectedScan.id}
              </div>
            </div>

            {/* Technical Indicators List */}
            <div className="mb-6 space-y-2">
              <span className="text-[11px] uppercase font-bold text-slate-600 block font-mono">
                CORROBORATED FORENSIC FINDINGS:
              </span>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {selectedScan.indicators.map((ind, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 flex items-start gap-2.5 font-mono"
                  >
                    <span className="mt-0.5 shrink-0">
                      {selectedScan.verdict === 'MALICIOUS' ? (
                        <ShieldAlert size={15} className="text-red-600" />
                      ) : selectedScan.verdict === 'SUSPICIOUS' ? (
                        <AlertTriangle size={15} className="text-amber-600" />
                      ) : (
                        <CheckCircle2 size={15} className="text-emerald-600" />
                      )}
                    </span>
                    <span>{ind}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100 font-mono">
              <button
                type="button"
                onClick={(e) => handleDelete(selectedScan.id, e)}
                className="text-xs text-red-600 hover:text-red-700 transition flex items-center gap-1.5 cursor-pointer font-bold"
              >
                <Trash2 size={14} /> Remove Record
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedScan(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handleReScan(selectedScan)}
                  className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm shadow-orange-500/20"
                >
                  <RefreshCw size={13} /> Re-Inspect Target
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
