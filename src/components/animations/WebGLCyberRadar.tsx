import { useState, useEffect, useRef } from 'react';
import { Zap, ExternalLink, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ThreatTarget {
  id: string;
  name: string;
  type: string;
  angle: number; // in radians
  dist: number;  // 0.2 to 0.85 (normalized radius)
  risk: number;
  color: string;
  ip: string;
  origin: string;
  status: 'ACTIVE' | 'NEUTRALIZED';
}

const INITIAL_THREATS: ThreatTarget[] = [
  { id: '1', name: 'login-chase-security.xyz', type: 'Phishing Portal', angle: 0.85, dist: 0.65, risk: 96, color: '#ef4444', ip: '194.26.29.110', origin: 'Almaty, KZ', status: 'ACTIVE' },
  { id: '2', name: 'pаypal-security-update.com', type: 'Homograph Punycode', angle: 2.3, dist: 0.78, risk: 94, color: '#f97316', ip: '45.142.214.8', origin: 'Frankfurt, DE', status: 'ACTIVE' },
  { id: '3', name: 'parking-meter-fraud-qr.png', type: 'Quishing QR Payload', angle: 3.9, dist: 0.45, risk: 88, color: '#eab308', ip: '185.220.101.5', origin: 'Amsterdam, NL', status: 'ACTIVE' },
  { id: '4', name: 'wire-transfer-ceo-urgent.eml', type: 'Executive Wire BEC', angle: 5.1, dist: 0.82, risk: 92, color: '#ef4444', ip: '198.51.100.42', origin: 'Lagos, NG', status: 'ACTIVE' },
  { id: '5', name: 'apple-id-cloud-restore.net', type: 'Credential Stealer', angle: 1.6, dist: 0.52, risk: 91, color: '#a855f7', ip: '104.21.58.12', origin: 'San Jose, US', status: 'ACTIVE' },
];

export default function WebGLCyberRadar() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  const [threats, setThreats] = useState<ThreatTarget[]>(INITIAL_THREATS);
  const [selectedThreat, setSelectedThreat] = useState<ThreatTarget>(INITIAL_THREATS[0]);
  const [viewMode, setViewMode] = useState<'radar' | 'stream'>('radar');
  const [neutralizingId, setNeutralizingId] = useState<string | null>(null);
  const [azimuth, setAzimuth] = useState<number>(142);

  // Keep a ref to threats for canvas click detection
  const threatsRef = useRef(threats);
  threatsRef.current = threats;
  const selectedThreatRef = useRef(selectedThreat);
  selectedThreatRef.current = selectedThreat;

  const handleNeutralize = (threat: ThreatTarget) => {
    setNeutralizingId(threat.id);
    setTimeout(() => {
      setThreats((prev) =>
        prev.map((t) => (t.id === threat.id ? { ...t, status: 'NEUTRALIZED', risk: 0 } : t))
      );
      if (selectedThreat.id === threat.id) {
        setSelectedThreat((prev) => ({ ...prev, status: 'NEUTRALIZED', risk: 0 }));
      }
      setNeutralizingId(null);
    }, 900);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let sweepAngle = 0;
    let isVisible = true;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    const render = () => {
      animId = requestAnimationFrame(render);
      if (!isVisible) return;

      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = rect.width;
      const height = rect.height;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      const cx = width / 2;
      const cy = height / 2;
      const maxRadius = Math.min(cx, cy) - 24;

      // 1. Dark Tactical Obsidian Canvas Background
      ctx.clearRect(0, 0, width, height);
      const bgGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, maxRadius + 30);
      bgGrad.addColorStop(0, '#040d1a');
      bgGrad.addColorStop(0.7, '#020617');
      bgGrad.addColorStop(1, '#010409');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Subtle Cyber Grid Overlay
      ctx.strokeStyle = 'rgba(14, 165, 233, 0.04)';
      ctx.lineWidth = 1;
      const gridSize = 24;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Concentric Range Rings with Luminous Phosphor Glow
      const rings = [0.25, 0.5, 0.75, 1.0];
      const rangeLabels = ['1.2km', '2.5km', '3.8km', '5.0km'];

      rings.forEach((r, idx) => {
        const rad = maxRadius * r;
        ctx.beginPath();
        ctx.arc(cx, cy, rad, 0, Math.PI * 2);
        ctx.strokeStyle = idx === 3 ? 'rgba(249, 115, 22, 0.35)' : 'rgba(14, 165, 233, 0.22)';
        ctx.lineWidth = idx === 3 ? 1.5 : 1;
        ctx.setLineDash(idx === 1 ? [4, 4] : []);
        ctx.stroke();
        ctx.setLineDash([]);

        // Range text marks
        ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(rangeLabels[idx], cx + 4, cy - rad + 12);
      });

      // 3. Crosshair Axes & Degree Ticks
      ctx.strokeStyle = 'rgba(14, 165, 233, 0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - maxRadius - 10, cy);
      ctx.lineTo(cx + maxRadius + 10, cy);
      ctx.moveTo(cx, cy - maxRadius - 10);
      ctx.lineTo(cx, cy + maxRadius + 10);
      ctx.stroke();

      // Diagonal crosshairs (dimmer)
      ctx.strokeStyle = 'rgba(14, 165, 233, 0.1)';
      const diag = maxRadius * 0.707;
      ctx.beginPath();
      ctx.moveTo(cx - diag, cy - diag);
      ctx.lineTo(cx + diag, cy + diag);
      ctx.moveTo(cx - diag, cy + diag);
      ctx.lineTo(cx + diag, cy - diag);
      ctx.stroke();

      // Cardinal Labels (N, E, S, W)
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.fillStyle = '#0ea5e9';
      ctx.textAlign = 'center';
      ctx.fillText('N • 000°', cx, cy - maxRadius - 12);
      ctx.fillText('S • 180°', cx, cy + maxRadius + 18);
      ctx.textAlign = 'left';
      ctx.fillText('E • 090°', cx + maxRadius + 12, cy + 3);
      ctx.textAlign = 'right';
      ctx.fillText('W • 270°', cx - maxRadius - 12, cy + 3);

      // 4. Rotating Laser Sonar Sweep Beam with Phosphor Trail
      sweepAngle = (sweepAngle + 0.022) % (Math.PI * 2);

      // Draw sweeping arc gradient
      const sweepGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxRadius);
      sweepGradient.addColorStop(0, 'rgba(249, 115, 22, 0.35)');
      sweepGradient.addColorStop(0.8, 'rgba(249, 115, 22, 0.08)');
      sweepGradient.addColorStop(1, 'rgba(249, 115, 22, 0.0)');

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, maxRadius, sweepAngle - 0.45, sweepAngle, false);
      ctx.closePath();
      ctx.fillStyle = sweepGradient;
      ctx.fill();
      ctx.restore();

      // Leading Laser Sweep Line
      const sweepX = cx + Math.cos(sweepAngle) * maxRadius;
      const sweepY = cy + Math.sin(sweepAngle) * maxRadius;
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 1.8;
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(sweepX, sweepY);
      ctx.stroke();
      ctx.shadowBlur = 0; // Reset

      // Center Antenna Node
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#f97316';
      ctx.fill();

      // 5. Threat Targets Rendering
      const curThreats = threatsRef.current;
      const selected = selectedThreatRef.current;

      curThreats.forEach((t) => {
        const tx = cx + Math.cos(t.angle) * (maxRadius * t.dist);
        const ty = cy + Math.sin(t.angle) * (maxRadius * t.dist);
        const isSel = selected && selected.id === t.id;
        const isNeutral = t.status === 'NEUTRALIZED';

        // Calculate proximity to sweep beam for ping illumination
        let angleDiff = Math.abs(sweepAngle - t.angle);
        if (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff;
        const isPinged = angleDiff < 0.25;

        // Threat Blip Outer Glow
        ctx.beginPath();
        ctx.arc(tx, ty, isSel ? 10 : isPinged ? 8 : 6, 0, Math.PI * 2);
        ctx.fillStyle = isNeutral
          ? 'rgba(16, 185, 129, 0.25)'
          : isPinged
          ? `${t.color}66`
          : `${t.color}33`;
        ctx.fill();

        // Threat Blip Core
        ctx.beginPath();
        ctx.arc(tx, ty, isNeutral ? 3 : 4.5, 0, Math.PI * 2);
        ctx.fillStyle = isNeutral ? '#10b981' : t.color;
        ctx.shadowColor = isNeutral ? '#10b981' : t.color;
        ctx.shadowBlur = isPinged || isSel ? 10 : 4;
        ctx.fill();
        ctx.shadowBlur = 0;

        // If selected: Draw Tactical Reticle Brackets [ ]
        if (isSel) {
          ctx.strokeStyle = isNeutral ? '#10b981' : '#f97316';
          ctx.lineWidth = 1.5;
          const bSize = 14;
          // Top Left
          ctx.beginPath();
          ctx.moveTo(tx - bSize, ty - bSize + 5);
          ctx.lineTo(tx - bSize, ty - bSize);
          ctx.lineTo(tx - bSize + 5, ty - bSize);
          ctx.stroke();
          // Top Right
          ctx.beginPath();
          ctx.moveTo(tx + bSize - 5, ty - bSize);
          ctx.lineTo(tx + bSize, ty - bSize);
          ctx.lineTo(tx + bSize, ty - bSize + 5);
          ctx.stroke();
          // Bottom Left
          ctx.beginPath();
          ctx.moveTo(tx - bSize, ty + bSize - 5);
          ctx.lineTo(tx - bSize, ty + bSize);
          ctx.lineTo(tx - bSize + 5, ty + bSize);
          ctx.stroke();
          // Bottom Right
          ctx.beginPath();
          ctx.moveTo(tx + bSize - 5, ty + bSize);
          ctx.lineTo(tx + bSize, ty + bSize);
          ctx.lineTo(tx + bSize, ty + bSize - 5);
          ctx.stroke();

          // Target Name Label
          ctx.font = 'bold 9px "JetBrains Mono", monospace';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.fillText(t.name.slice(0, 18), tx, ty - bSize - 4);
        }
      });

      ctx.restore();
    };

    render();

    // Canvas Click Listener for Target Selection
    const handleCanvasClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const maxRadius = Math.min(cx, cy) - 24;

      // Find closest threat within threshold
      let found: ThreatTarget | null = null;
      let closestDist = 28; // Click radius

      threatsRef.current.forEach((t) => {
        const tx = cx + Math.cos(t.angle) * (maxRadius * t.dist);
        const ty = cy + Math.sin(t.angle) * (maxRadius * t.dist);
        const dist = Math.hypot(clickX - tx, clickY - ty);
        if (dist < closestDist) {
          closestDist = dist;
          found = t;
        }
      });

      if (found) {
        setSelectedThreat(found);
      }
    };

    canvas.addEventListener('click', handleCanvasClick);

    // Azimuth degree counter simulation
    const degInterval = setInterval(() => {
      setAzimuth(Math.floor((sweepAngle * 180) / Math.PI));
    }, 150);

    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
      canvas.removeEventListener('click', handleCanvasClick);
      clearInterval(degInterval);
    };
  }, []);

  return (
    <div className="relative w-full rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
      {/* ── Cockpit Header ───────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800/90 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500" />
          </span>
          <div className="flex flex-col text-left">
            <span className="font-mono font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              TACTICAL CYBER SONAR
              <span className="text-[9px] bg-red-950 text-red-400 px-1.5 py-0.2 rounded border border-red-800 font-mono font-bold">
                DEFCON 2
              </span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              AZIMUTH: {azimuth.toString().padStart(3, '0')}° • RANGE: 5.0KM
            </span>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => setViewMode('radar')}
            className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold transition cursor-pointer ${
              viewMode === 'radar'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            SONAR 360°
          </button>
          <button
            type="button"
            onClick={() => setViewMode('stream')}
            className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold transition cursor-pointer ${
              viewMode === 'stream'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            FEED ({threats.filter((t) => t.status === 'ACTIVE').length})
          </button>
        </div>
      </div>

      {/* ── Main Viewport Area ───────────────────── */}
      <div className="relative w-full h-[340px] sm:h-[380px] bg-slate-950 overflow-hidden">
        {viewMode === 'radar' ? (
          <>
            {/* Interactive 60fps Radar Canvas */}
            <canvas
              ref={canvasRef}
              className="w-full h-full block cursor-crosshair"
              title="Click any target blip to lock on"
            />

            {/* Floating Top Radar Status Overlay */}
            <div className="absolute top-2.5 left-3 flex items-center gap-2 pointer-events-none">
              <span className="px-2 py-0.5 rounded bg-slate-900/80 border border-slate-800 font-mono text-[10px] text-cyan-400">
                ACTIVE VECTORS: {threats.filter((t) => t.status === 'ACTIVE').length}
              </span>
            </div>
            <div className="absolute top-2.5 right-3 flex items-center gap-2 pointer-events-none">
              <span className="px-2 py-0.5 rounded bg-slate-900/80 border border-slate-800 font-mono text-[10px] text-emerald-400">
                AI INTERCEPT: 99.8%
              </span>
            </div>
          </>
        ) : (
          /* Live Threat Feed List */
          <div className="p-4 space-y-2 h-full overflow-y-auto text-left font-mono text-xs">
            <div className="text-[10px] uppercase font-bold text-slate-500 mb-2">
              REAL-TIME INTERCEPTION TELEMETRY
            </div>
            {threats.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedThreat(t)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedThreat.id === t.id
                    ? 'bg-slate-900 border-orange-500 text-white'
                    : 'bg-slate-900/50 border-slate-800/80 text-slate-300 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      t.status === 'NEUTRALIZED' ? 'bg-emerald-400' : 'bg-red-500 animate-pulse'
                    }`}
                  />
                  <div className="truncate">
                    <div className="font-bold truncate">{t.name}</div>
                    <div className="text-[10px] text-slate-400">
                      {t.type} • {t.origin}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  {t.status === 'NEUTRALIZED' ? (
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-bold border border-emerald-800">
                      DEFUSED
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-red-950 text-red-400 text-[10px] font-bold border border-red-800">
                      RISK {t.risk}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Selected Target Forensic Dock ────────── */}
      <div className="p-3.5 bg-slate-900 border-t border-slate-800/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left">
        <div className="space-y-0.5 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400">
              TARGET LOCKON:
            </span>
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                selectedThreat.status === 'NEUTRALIZED'
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-red-950 text-red-400 border border-red-800'
              }`}
            >
              {selectedThreat.status === 'NEUTRALIZED' ? 'SAFE / DEFUSED' : `CRITICAL • ${selectedThreat.risk}/100`}
            </span>
          </div>

          <div className="font-mono font-bold text-sm text-white truncate max-w-full">
            {selectedThreat.name}
          </div>

          <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-2 font-mono">
            <span>{selectedThreat.type}</span>
            <span>•</span>
            <span className="text-cyan-400">{selectedThreat.ip}</span>
            <span>•</span>
            <span>{selectedThreat.origin}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          {selectedThreat.status === 'NEUTRALIZED' ? (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono font-bold px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800">
              <CheckCircle2 size={14} />
              THREAT VECTOR DISARMED
            </div>
          ) : (
            <button
              type="button"
              disabled={neutralizingId === selectedThreat.id}
              onClick={() => handleNeutralize(selectedThreat)}
              className="btn-primary text-xs px-3.5 py-2 rounded-lg font-mono font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {neutralizingId === selectedThreat.id ? (
                <>
                  <Zap size={13} className="animate-spin text-amber-300" />
                  DISARMING...
                </>
              ) : (
                <>
                  <Zap size={13} />
                  NEUTRALIZE
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => navigate(`/scan/url?target=${encodeURIComponent(selectedThreat.name)}`)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer border border-slate-700"
            title="Inspect in Deep URL Scanner"
          >
            <ExternalLink size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
