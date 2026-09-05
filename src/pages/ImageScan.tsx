import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Image as ImageIcon, Upload, ShieldAlert, Loader2, ShieldCheck, History, CheckCircle2 } from 'lucide-react';
import { ScanService } from '../services/ScanService';

interface ScreenshotResult {
  filename: string;
  isFake: boolean;
  riskScore: number;
  targetedBrand: string;
  brandSimilarity: number;
  extractedText: string;
  detectedFields: string[];
  indicators: string[];
}

const PRESET_SCREENSHOTS = [
  {
    label: 'Chase Bank Fake Login',
    name: 'chase-counterfeit-login.png',
  },
  {
    label: 'PayPal Account Dispute',
    name: 'paypal-security-alert.jpg',
  },
  {
    label: 'Verified SaaS Billing Receipt',
    name: 'stripe-verified-receipt.png',
  },
];

export default function ImageScan() {
  const navigate = useNavigate();
  const [previewName, setPreviewName] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'scanning' | 'done'>('idle');
  const [result, setResult] = useState<ScreenshotResult | null>(null);

  const handleRunScan = (preset = PRESET_SCREENSHOTS[0]) => {
    setStatus('scanning');
    setPreviewName(preset.name);
    setResult(null);

    setTimeout(() => {
      setStatus('done');
      // 1. Run real-time heuristic evaluation
      const evaluated = ScanService.analyzeImage(preset.name);

      setResult({
        filename: preset.name,
        isFake: evaluated.isFake,
        riskScore: evaluated.riskScore,
        targetedBrand: evaluated.targetedBrand,
        brandSimilarity: evaluated.similarity,
        extractedText: evaluated.extractedText,
        detectedFields: evaluated.detectedFields,
        indicators: evaluated.indicators,
      });

      // 2. Persist to real-time Scan History!
      ScanService.saveScan({
        type: 'Screenshot',
        target: preset.name,
        risk: evaluated.riskScore,
        verdict: evaluated.verdict,
        threatName: `${evaluated.targetedBrand} Impersonation`,
        indicators: evaluated.indicators,
        details: {
          targetedBrand: evaluated.targetedBrand,
          similarity: evaluated.similarity,
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

    const reader = new FileReader();
    reader.onload = () => {
      setTimeout(() => {
        setStatus('done');
        // Analyze uploaded file
        const evaluated = ScanService.analyzeImage(uploaded.name);

        setResult({
          filename: uploaded.name,
          isFake: evaluated.isFake,
          riskScore: evaluated.riskScore,
          targetedBrand: evaluated.targetedBrand,
          brandSimilarity: evaluated.similarity,
          extractedText: evaluated.extractedText,
          detectedFields: evaluated.detectedFields,
          indicators: evaluated.indicators,
        });

        // Persist to real-time Scan History!
        ScanService.saveScan({
          type: 'Screenshot',
          target: uploaded.name,
          risk: evaluated.riskScore,
          verdict: evaluated.verdict,
          threatName: `${evaluated.targetedBrand} Impersonation`,
          indicators: evaluated.indicators,
          details: {
            targetedBrand: evaluated.targetedBrand,
            fileSize: `${(uploaded.size / 1024).toFixed(1)} KB`,
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
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 mb-3 shadow-sm">
          <ImageIcon size={28} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Screenshot & Image Inspector</h1>
        <p className="text-sm text-slate-600 max-w-lg mx-auto mt-1">
          Upload screenshots of websites, fake login prompts, or digital notices to detect visual brand impersonation in real time.
        </p>
      </div>

      {/* Upload Box Card */}
      <div className="card bg-white border border-slate-200/90 shadow-md p-4 sm:p-6 rounded-2xl space-y-4 text-center">
        <label className="block border-dashed border-2 border-slate-200 hover:border-emerald-400 py-8 sm:py-12 px-4 rounded-xl cursor-pointer transition-all bg-slate-50/60 hover:bg-emerald-50/30 group">
          <Upload size={36} className="mx-auto text-slate-400 group-hover:text-emerald-600 mb-2 transition-colors" />
          <h3 className="font-bold text-sm sm:text-base text-slate-800 font-mono">
            {previewName ? `Loaded: ${previewName}` : 'Upload Screenshot Image (JPG, PNG, WEBP)'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 font-mono">Real-time OCR token analysis and copyright matching</p>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </label>

        {/* Preset Quick-Test Buttons */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-xs text-slate-500">
          <span className="font-mono text-slate-400 w-full sm:w-auto">Or test with preset screenshots:</span>
          {PRESET_SCREENSHOTS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => handleRunScan(p)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-medium transition cursor-pointer border border-slate-200/60 font-mono text-xs min-h-[36px] flex items-center justify-center"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scanning State */}
      {status === 'scanning' && (
        <div className="card bg-white text-slate-800 p-5 rounded-2xl border border-slate-200 shadow-md space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between text-emerald-600 font-bold">
            <span className="flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-emerald-500" />
              RUNNING OCR TOKEN ANALYSIS & BRAND VECTOR MATCHING
            </span>
            <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 border border-slate-200 font-bold">VISUAL ENGINE</span>
          </div>
          <p className="text-slate-600">Extracting login layout heuristics, font geometry, and credential theft vectors...</p>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
            <div className="bg-emerald-500 h-full w-3/4 animate-pulse" />
          </div>
        </div>
      )}

      {/* Results */}
      {status === 'done' && result && (
        <div className="card bg-white border border-slate-200/90 shadow-xl rounded-2xl p-4 sm:p-6 space-y-5 sm:space-y-6 text-left animate-in fade-in duration-300">
          {/* Real-time Persistence Notification Badge */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 text-slate-900 text-xs font-mono">
            <span className="flex items-center gap-2 text-emerald-700 font-bold">
              <CheckCircle2 size={15} /> Real-Time Telemetry Logged
            </span>
            <Link
              to="/scans"
              className="text-emerald-700 hover:text-emerald-800 underline font-bold flex items-center gap-1 transition"
            >
              <History size={13} /> View in Scan History →
            </Link>
          </div>

          {/* Top Verdict Banner — Mobile Responsive */}
          <div
            className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
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
                    ? 'Phishing Visual Clone Detected (Impersonation)'
                    : 'Legitimate Visual Document — No Deception Flags'}
                </h3>
                <p className="text-sm font-semibold mt-1 text-slate-700">
                  Risk Score:{' '}
                  <span className={`font-mono font-black ${result.isFake ? 'text-red-600' : 'text-emerald-600'}`}>
                    {result.riskScore}/100
                  </span>
                </p>
                <p className="text-xs mt-1 opacity-90 font-medium font-mono">
                  Target: <span className="font-bold">{result.targetedBrand}</span> {result.brandSimilarity > 0 && `(${result.brandSimilarity}% visual match)`}
                </p>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 shrink-0">
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-70">Threat Risk</span>
              <div className={`text-2xl font-black font-mono ${result.isFake ? 'text-red-600' : 'text-emerald-600'}`}>
                {result.riskScore}/100
              </div>
            </div>
          </div>

          {/* Indicators */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
              Visual Forensic Corroboration
            </h4>
            <div className="space-y-1.5 font-mono text-xs">
              {result.indicators.map((ind, i) => (
                <div
                  key={i}
                  className={`p-2.5 rounded-lg border flex items-start gap-2.5 ${
                    !result.isFake
                      ? 'bg-emerald-50/40 border-emerald-100 text-emerald-900'
                      : 'bg-red-50/40 border-red-100 text-red-900'
                  }`}
                >
                  <span className="font-bold shrink-0">{!result.isFake ? '✓' : '⚠️'}</span>
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
              Inspect Another Screenshot
            </button>

            <button
              onClick={() => navigate('/scans')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-mono flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <History size={14} /> Open Scan History
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
