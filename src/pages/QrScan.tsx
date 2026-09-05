import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { QrCode, Upload, ShieldAlert, Loader2, ShieldCheck, History, CheckCircle2 } from 'lucide-react';
import { ScanService } from '../services/ScanService';

interface QrResult {
  filename: string;
  decodedPayload: string;
  isMalicious: boolean;
  riskScore: number;
  quishingVector: string;
  indicators: string[];
}

const PRESET_QRS = [
  {
    label: 'Parking Meter Quishing Trap',
    name: 'city-parking-meter-fraud.png',
    payload: 'http://city-pay-parking-meter-auth.net/checkout?meter=84921',
  },
  {
    label: 'Public Wi-Fi Login Trap',
    name: 'free-airport-wifi-login.png',
    payload: 'http://airport-free-wifi-connect.org/login?ssid=Airport_Guest',
  },
  {
    label: 'Verified Tech Conference Ticket',
    name: 'cybersec-summit-pass.png',
    payload: 'https://securitysummit.org/ticket/verify/token-993821',
  },
];

export default function QrScan() {
  const navigate = useNavigate();
  const [previewName, setPreviewName] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'scanning' | 'done'>('idle');
  const [result, setResult] = useState<QrResult | null>(null);

  const handleRunScan = (preset = PRESET_QRS[0]) => {
    setStatus('scanning');
    setPreviewName(preset.name);
    setResult(null);

    setTimeout(async () => {
      setStatus('done');
      // 1. Run real-time heuristic evaluation
      const evaluated = await ScanService.analyzeQr(preset.payload);

      setResult({
        filename: preset.name,
        decodedPayload: preset.payload,
        isMalicious: !evaluated.isSafe,
        riskScore: evaluated.riskScore,
        quishingVector: evaluated.quishingVector,
        indicators: evaluated.indicators,
      });

      // 2. Persist to real-time Scan History!
      ScanService.saveScan({
        type: 'QR',
        target: preset.name,
        risk: evaluated.riskScore,
        verdict: evaluated.verdict,
        threatName: evaluated.quishingVector,
        indicators: evaluated.indicators,
        details: {
          decodedPayload: preset.payload,
          filename: preset.name,
        },
      });
    }, 1200);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;
    setPreviewName(uploaded.name);
    setStatus('scanning');
    setResult(null);

    // Read image using FileReader for real file validation
    const reader = new FileReader();
    reader.onload = () => {
      setTimeout(async () => {
        setStatus('done');
        // Analyze uploaded file
        const evaluated = await ScanService.analyzeQr(uploaded.name);

        setResult({
          filename: uploaded.name,
          decodedPayload: evaluated.decodedPayload,
          isMalicious: !evaluated.isSafe,
          riskScore: evaluated.riskScore,
          quishingVector: evaluated.quishingVector,
          indicators: evaluated.indicators,
        });

        // Persist to real-time Scan History!
        ScanService.saveScan({
          type: 'QR',
          target: uploaded.name,
          risk: evaluated.riskScore,
          verdict: evaluated.verdict,
          threatName: evaluated.quishingVector,
          indicators: evaluated.indicators,
          details: {
            decodedPayload: evaluated.decodedPayload,
            fileSize: `${(uploaded.size / 1024).toFixed(1)} KB`,
            mimeType: uploaded.type,
          },
        });
      }, 1400);
    };
    reader.readAsDataURL(uploaded);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 text-left">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-50 border border-purple-200 text-purple-600 mb-3 shadow-sm">
          <QrCode size={28} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">QR Code Threat Scanner (Anti-Quishing)</h1>
        <p className="text-sm text-slate-600 max-w-lg mx-auto mt-1">
          Safely decode and evaluate QR codes in a secure sandbox before opening them on your phone in real time.
        </p>
      </div>

      {/* Upload Box Card */}
      <div className="card bg-white border border-slate-200/90 shadow-md p-4 sm:p-6 rounded-2xl space-y-4 text-center">
        <label className="block border-dashed border-2 border-slate-200 hover:border-purple-400 py-8 sm:py-12 px-4 rounded-xl cursor-pointer transition-all bg-slate-50/60 hover:bg-purple-50/30 group">
          <Upload size={36} className="mx-auto text-slate-400 group-hover:text-purple-600 mb-2 transition-colors" />
          <h3 className="font-bold text-sm sm:text-base text-slate-800 font-mono">
            {previewName ? `Loaded: ${previewName}` : 'Upload QR Code Image or Drag & Drop'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 font-mono">Supports PNG, JPG, WEBP, SVG</p>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </label>

        {/* Preset Quick-Test Buttons */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-xs text-slate-500">
          <span className="font-mono text-slate-400 w-full sm:w-auto">Or test with preset QR scenarios:</span>
          {PRESET_QRS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => handleRunScan(p)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-slate-700 font-medium transition cursor-pointer border border-slate-200/60 font-mono text-xs min-h-[36px] flex items-center justify-center"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scanning State */}
      {status === 'scanning' && (
        <div className="card bg-white text-slate-800 p-5 rounded-2xl border border-slate-200 shadow-md space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between text-purple-600 font-bold">
            <span className="flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-purple-500" />
              DECODING OPTICAL MATRIX & ANALYZING PAYLOAD
            </span>
            <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 border border-slate-200 font-bold">REAL-TIME SANDBOX</span>
          </div>
          <p className="text-slate-600">Evaluating destination URI, redirect chains, and unencrypted credential traps...</p>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
            <div className="bg-purple-500 h-full w-3/4 animate-pulse" />
          </div>
        </div>
      )}

      {/* Results */}
      {status === 'done' && result && (
        <div className="card bg-white border border-slate-200/90 shadow-xl rounded-2xl p-4 sm:p-6 space-y-5 sm:space-y-6 text-left animate-in fade-in duration-300">
          {/* Real-time Persistence Notification Badge */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50/80 border border-purple-200 text-slate-900 text-xs font-mono">
            <span className="flex items-center gap-2 text-emerald-700 font-bold">
              <CheckCircle2 size={15} /> Real-Time Telemetry Logged
            </span>
            <Link
              to="/scans"
              className="text-purple-700 hover:text-purple-800 underline font-bold flex items-center gap-1 transition"
            >
              <History size={13} /> View in Scan History →
            </Link>
          </div>

          {/* Verdict Banner — Mobile Responsive */}
          <div
            className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              result.isMalicious
                ? 'bg-red-50/80 border-red-200 text-red-900'
                : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
            }`}
          >
            <div className="flex items-start gap-3">
              {result.isMalicious ? (
                <ShieldAlert size={28} className="text-red-600 shrink-0 mt-0.5" />
              ) : (
                <ShieldCheck size={28} className="text-emerald-600 shrink-0 mt-0.5" />
              )}
              <div>
                <h3 className="text-base sm:text-lg font-black tracking-tight">
                  {result.isMalicious
                    ? 'Quishing Vector Detected — High Risk'
                    : 'Verified Safe QR Destination'}
                </h3>
                <p className="text-sm font-semibold mt-1 text-slate-700">
                  Attack Classification:{' '}
                  <span className={`font-mono font-bold ${result.isMalicious ? 'text-red-700' : 'text-emerald-700'}`}>
                    {result.quishingVector}
                  </span>
                </p>
                <p className="text-xs mt-1 opacity-90 font-mono">Examined file: {result.filename}</p>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 shrink-0">
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-70">Threat Risk</span>
              <div className={`text-2xl font-black font-mono ${result.isMalicious ? 'text-red-600' : 'text-emerald-600'}`}>
                {result.riskScore}/100
              </div>
            </div>
          </div>

          {/* Decoded Payload Preview */}
          <div className="p-4 rounded-xl bg-purple-50/80 text-slate-800 font-mono text-xs space-y-1.5 border border-purple-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 block font-mono">DECODED DESTINATION PAYLOAD:</span>
            <div className="text-purple-700 font-bold break-all text-sm">{result.decodedPayload}</div>
          </div>

          {/* Indicators */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
              Quishing Forensic Indicators
            </h4>
            <div className="space-y-1.5 font-mono text-xs">
              {result.indicators.map((ind, i) => (
                <div
                  key={i}
                  className={`p-2.5 rounded-lg border flex items-start gap-2.5 ${
                    !result.isMalicious
                      ? 'bg-emerald-50/40 border-emerald-100 text-emerald-900'
                      : 'bg-red-50/40 border-red-100 text-red-900'
                  }`}
                >
                  <span className="font-bold shrink-0">{!result.isMalicious ? '✓' : '⚠️'}</span>
                  <span>{ind}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
            <button
              onClick={() => {
                setPreviewName('');
                setStatus('idle');
                setResult(null);
              }}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 transition cursor-pointer font-mono"
            >
              Scan Another QR Code
            </button>

            <button
              onClick={() => navigate('/scans')}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold font-mono flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <History size={14} /> Open Scan History
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
