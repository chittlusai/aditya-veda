import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MessageSquare, QrCode, Image as ImageIcon, Globe, Users,
  ArrowRight, Shield, Lock, Eye, Zap, ShieldCheck, ChevronRight,
  CheckCircle, BarChart3, Cpu, Sparkles, Fingerprint,
  AlertTriangle, ShieldAlert, Terminal, Radio,
  Play, Pause, Volume2, VolumeX, Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Reveal, SectionHeader, ScrollIndicator } from '../components/ui';
import {
  CountUp,
  Magnet,
  StarBorder,
  BlurText,
  Tilted3DCard,
  WebGLWaveBackground,
  GlitchText,
  WebGLCyberRadar,
} from '../components/animations';

/* ═══════════════════════════════════════════════
   PHISHGUARD AI — 3D WebGL Cybersecurity Portal
   Features:
   - Fixed Headline with GlitchText (Zero character overlap)
   - Cyber Attacks & Fraud Detection Portal (#cyber-attacks)
   - 3D WebGL Cyber Radar (Live Three.js range scanner)
   - Real 3D Perspective Tilt Cards (Tilted3DCard)
   - WebGLWaveBackground (Interactive 3D particle ripples)
   - In-Hero Quick-Scan Bar & Veo 3 Video Player
   ═══════════════════════════════════════════════ */

/* ── Attack categories for hero headline ─────── */
const ATTACK_ROTATING_WORDS = [
  'Zero-Day Phishing',
  'Fake Banking Portals',
  'QR Code Quishing',
  'SMS Smishing Traps',
  'Executive Wire Fraud',
  'Typosquat Domains',
];

/* ── Cyber Frauds Portal Dataset ─────────────── */
interface CyberFraudAttack {
  id: string;
  name: string;
  category: string;
  severity: string;
  vector: string;
  desc: string;
  targetPath: string;
  accent: string;
}

const CYBER_FRAUD_ATTACKS: CyberFraudAttack[] = [
  {
    id: 'fake-portal',
    name: 'Fake Banking & Payment Gateways',
    category: 'Credential Harvesting',
    severity: 'CRITICAL',
    vector: 'https://secure-chase-auth.com/verify-identity',
    desc: 'Pixel-perfect clones of major banking and payment login interfaces equipped with keystroke loggers and OTP interceptors.',
    targetPath: '/scan/url?target=https%3A%2F%2Fsecure-chase-auth.com',
    accent: '#ef4444',
  },
  {
    id: 'quishing',
    name: 'Quishing & QR Code Hijacking',
    category: 'Physical-to-Digital Scam',
    severity: 'HIGH',
    vector: 'QR_MALICIOUS_PARKING_PAYMENT.PNG',
    desc: 'Fraudulent QR stickers pasted over parking meters, restaurant receipts, and utility bills leading to malicious credential traps.',
    targetPath: '/scan/qr',
    accent: '#f97316',
  },
  {
    id: 'bec',
    name: 'Business Email Compromise (BEC)',
    category: 'Executive Wire Fraud',
    severity: 'CRITICAL',
    vector: 'From: ceo-alert@executive-corp-urgent.net (Wire $48,000 to escrow)',
    desc: 'AI-generated executive persona spoofing requesting urgent vendor payment updates and international wire transfers.',
    targetPath: '/scan/message',
    accent: '#dc2626',
  },
  {
    id: 'typosquat',
    name: 'Typosquatting & Punycode Spoofs',
    category: 'Homograph Domain Spoof',
    severity: 'HIGH',
    vector: 'http://pаypal.com (Cyrillic unicode "а" U+0430)',
    desc: 'Visually indistinguishable domains substituting Latin glyphs with Cyrillic characters to trick victims into entering login credentials.',
    targetPath: '/scan/website',
    accent: '#ea580c',
  },
  {
    id: 'token-theft',
    name: 'Session Hijacking & Token Theft',
    category: 'Cookie Exfiltration',
    severity: 'SEVERE',
    vector: 'Invoice_Q3_Statement.pdf.exe [Infostealer Payload]',
    desc: 'Stealthy executable infostealers targeting browser SQLite cookie vaults to hijack active sessions and bypass multi-factor authentication (MFA).',
    targetPath: '/scan/screenshot',
    accent: '#b91c1c',
  },
  {
    id: 'smishing',
    name: 'Urgent SMS Delivery Scam (Smishing)',
    category: 'Mobile Social Engineering',
    severity: 'HIGH',
    vector: 'USPS: Package #49281 held due to $1.85 unpaid duty fee. Click here.',
    desc: 'High-frequency mass SMS campaigns capitalizing on fake package deliveries or blocked bank cards to extract credit card details.',
    targetPath: '/scan/message',
    accent: '#f59e0b',
  },
];

/* ── Tool data ───────────────────────────────── */
const TOOLS = [
  { icon: Search,        title: 'URL Scanner',          desc: 'Detect phishing, typosquatting, and malicious redirects in any URL.',       path: '/scan/url',        accent: '#f97316' },
  { icon: MessageSquare, title: 'Message Analyzer',     desc: 'Uncover social engineering, scam language, and hidden threats in text.',     path: '/scan/message',    accent: '#0284c7' },
  { icon: QrCode,        title: 'QR Code Scanner',      desc: 'Safely decode QR codes and inspect destinations before opening.',           path: '/scan/qr',         accent: '#8b5cf6' },
  { icon: ImageIcon,     title: 'Screenshot Inspector', desc: 'Extract text from screenshots and detect impersonation attempts.',          path: '/scan/screenshot', accent: '#ec4899' },
  { icon: Globe,         title: 'Fake Website Detector', desc: 'Analyze domain age, SSL certificates, and hosting to expose fraudulent sites.', path: '/scan/website',    accent: '#06b6d4' },
  { icon: Users,         title: 'Social Scanner',        desc: 'Check profiles for bot behavior, fake followers, and identity theft.',     path: '/scan/social',     accent: '#10b981' },
] as const;

const STATS = [
  { to: 2.4,  decimals: 1, prefix: '',  suffix: 'M+', label: 'Threats Deflected' },
  { to: 99.8, decimals: 1, prefix: '',  suffix: '%',  label: 'Neural Accuracy' },
  { to: 150,  decimals: 0, prefix: '',  suffix: '+',  label: 'Countries Monitored' },
  { to: 18,   decimals: 0, prefix: '<', suffix: 'ms', label: 'AI Reaction Time' },
] as const;

const FEATURES = [
  { icon: Zap,         title: 'Veo 3 Neural Synthesis', desc: 'Real-time visual and semantic threat modeling powered by Google Veo 3 generative AI telemetry.' },
  { icon: Lock,        title: 'Zero-Knowledge Privacy', desc: 'Every payload is analyzed ephemeral in-memory and permanently purged. Zero data storage or telemetry leaks.' },
  { icon: Eye,         title: 'Global Threat Telemetry', desc: 'Live multi-vector feeds continually cross-reference newly registered phishing domains worldwide.' },
  { icon: Fingerprint, title: 'Credential Shield',       desc: 'Detect brand typosquatting, lookalike unicode characters, and deceptive OAuth credential harvesters.' },
  { icon: Sparkles,    title: 'Explainable AI Verdicts', desc: 'Get transparent natural language risk breakdowns and actionable defensive guidance in plain language.' },
  { icon: Shield,      title: 'Enterprise SOC Ready',    desc: 'SOC 2 Type II compliant architecture, instant API webhooks, and team access controls.' },
] as const;

const STEPS = [
  { step: '01', icon: Search,    title: 'Provide the Target',   desc: 'Paste a suspicious URL, email text, upload a QR code image, or enter a questionable domain.' },
  { step: '02', icon: Cpu,       title: 'Deep Neural Inspection', desc: 'Our dual AI engine executes heuristic code analysis, SSL certificate validation, and threat matching.' },
  { step: '03', icon: BarChart3, title: 'Instant Verdict & Action', desc: 'Get a definitive safety score (0–100) with detailed indicator breakdowns and instant safe mitigation steps.' },
] as const;

const TRUST_BADGES = [
  { icon: Shield,      label: 'SOC 2 Type II Certified' },
  { icon: Lock,        label: 'Zero Data Retention Policy' },
  { icon: Eye,         label: '24/7 Real-Time Intel Feed' },
  { icon: CheckCircle, label: '99.99% Uptime SLA' },
] as const;

/* ═══════════════════════════════════════════════ */

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Hero interactive state
  const [quickScanUrl, setQuickScanUrl] = useState('');
  const [attackIndex, setAttackIndex] = useState(0);

  // Cyber attack simulation state
  const [selectedFraud, setSelectedFraud] = useState(CYBER_FRAUD_ATTACKS[0]);
  const [simulatingNeutralize, setSimulatingNeutralize] = useState(false);
  const [simulatedVerdict, setSimulatedVerdict] = useState<string | null>(null);

  // Clean, stable rotation of threat vectors (zero clumsy overlap)
  useEffect(() => {
    const timer = setInterval(() => {
      setAttackIndex(prev => (prev + 1) % ATTACK_ROTATING_WORDS.length);
    }, 3200);
    return () => clearInterval(timer);
  }, []);


  const handleToolClick = (path: string) => {
    if (isAuthenticated) {
      navigate(path);
    } else {
      navigate(`/login?redirect=${encodeURIComponent(path)}`);
    }
  };

  const handleQuickScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickScanUrl.trim()) return;
    const target = encodeURIComponent(quickScanUrl.trim());
    const toolPath = `/scan/url?target=${target}`;
    if (isAuthenticated) {
      navigate(toolPath);
    } else {
      navigate(`/login?redirect=${encodeURIComponent(toolPath)}`);
    }
  };

  const handleSimulateNeutralize = () => {
    setSimulatingNeutralize(true);
    setSimulatedVerdict(null);
    setTimeout(() => {
      setSimulatingNeutralize(false);
      setSimulatedVerdict(`NEUTRALIZED: 100% Threat Vector Disarmed [Risk Score: 98/100]. Attack signature logged in global threat feed.`);
    }, 1200);
  };

  // Video showcase controls
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [activeAttackSimulation, setActiveAttackSimulation] = useState<string | null>(null);

  const toggleVideoPlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsVideoPlaying(true);
    } else {
      videoRef.current.pause();
      setIsVideoPlaying(false);
    }
  };

  const toggleVideoMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsVideoMuted(videoRef.current.muted);
  };

  const handleSimulateAttack = (attackName: string) => {
    setActiveAttackSimulation(attackName);
    setTimeout(() => {
      setActiveAttackSimulation(null);
    }, 3500);
  };

  return (
    <main className="relative w-full overflow-x-hidden bg-[#f8fafc] text-slate-900" role="main">

      {/* ═══════════ REAL 3D WEBGL WAVE BACKGROUND ═══════════ */}
      <WebGLWaveBackground />

      {/* ═══════════ HERO SECTION ═══════════ */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-start overflow-hidden pt-28 md:pt-36 pb-20"
        aria-label="Hero section"
      >
        {/* Ambient subtle light glows */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-orange-200/40 via-amber-100/30 to-sky-100/40 blur-[100px] rounded-full pointer-events-none -z-10" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center w-full">

          {/* Hero Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/90 border border-slate-200 shadow-sm text-xs font-semibold text-slate-700 mb-6 backdrop-blur-md cursor-pointer group"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
            </span>
            <span className="text-orange-600 font-extrabold uppercase tracking-wider text-[11px]">
              VEO 3 NEURAL ENGINE
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-700 font-medium">
              Autonomous Threat Neutralization
            </span>
          </motion.div>

          {/* Headline — Zero overlap bug, with GlitchText effect */}
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-[clamp(2.5rem,6vw,5.25rem)] font-black tracking-tight leading-[1.12] mb-6 text-slate-900"
          >
            Check before you trust.
            <br />
            <span className="inline-flex items-center flex-wrap justify-center gap-2">
              Defend against{' '}
              <span className="inline-block min-w-[280px] sm:min-w-[360px] text-center">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={attackIndex}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -14 }}
                    transition={{ duration: 0.28, ease: 'easeInOut' }}
                    className="inline-block gradient-text font-black"
                  >
                    <GlitchText
                      text={ATTACK_ROTATING_WORDS[attackIndex]}
                      hoverOnly={false}
                      className="gradient-text font-black tracking-tight"
                    />
                  </motion.span>
                </AnimatePresence>
              </span>
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="text-base sm:text-lg md:text-xl text-slate-600 max-w-3xl mx-auto mb-8 leading-relaxed font-normal"
          >
            Instantly detect phishing traps, deceptive QR codes, credential stealers, and counterfeit websites.
            Trained on millions of live threat vectors with millisecond defense reactions.
          </motion.p>

          {/* In-Hero Quick-Scan Bar with StarBorder & Magnet */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="max-w-2xl mx-auto mb-8 w-full"
          >
            <StarBorder color="#f97316" speed="4.5s" className="w-full">
              <form
                onSubmit={handleQuickScanSubmit}
                className="relative flex items-center bg-white rounded-2xl p-2 transition-all"
              >
                <Search className="text-slate-400 ml-3 shrink-0" size={20} />
                <input
                  type="text"
                  value={quickScanUrl}
                  onChange={(e) => setQuickScanUrl(e.target.value)}
                  placeholder="Paste suspicious URL, domain, or message to inspect..."
                  className="w-full bg-transparent px-3 py-2.5 text-sm sm:text-base text-slate-800 placeholder-slate-400 outline-none"
                />
                <Magnet padding={40} magnetStrength={2.5}>
                  <button
                    type="submit"
                    className="btn-primary text-xs sm:text-sm px-5 py-3 rounded-xl shrink-0 font-semibold shadow-md cursor-pointer"
                  >
                    Inspect Threat
                    <ArrowRight size={16} />
                  </button>
                </Magnet>
              </form>
            </StarBorder>

            <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-xs text-slate-500">
              <span className="font-medium text-slate-400">Quick test:</span>
              <button
                type="button"
                onClick={() => setQuickScanUrl('http://apple-id-verify-alert.net')}
                className="text-orange-600 hover:text-orange-700 underline font-medium hover:bg-orange-50 px-1.5 py-0.5 rounded transition cursor-pointer"
              >
                apple-id-verify-alert.net
              </button>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={() => setQuickScanUrl('Your payroll direct deposit has failed. Click to verify.')}
                className="text-orange-600 hover:text-orange-700 underline font-medium hover:bg-orange-50 px-1.5 py-0.5 rounded transition cursor-pointer"
              >
                Sample SMS Scam
              </button>
            </div>
          </motion.div>

          {/* ═══════════ FUTURISTIC AI DEFENSE VIDEO SHOWCASE ═══════════ */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="max-w-5xl mx-auto"
          >
            <div className="relative rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-xl ring-1 ring-slate-200 group">

              {/* Showcase Window Top Bar */}
              <div className="flex items-center justify-between px-4 py-3 bg-slate-100 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-xs font-mono text-slate-600 hidden sm:inline font-medium">
                    veo3-neural-defense-stream.mp4
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-mono font-semibold border border-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    LIVE 60 FPS
                  </span>
                  <div className="flex items-center gap-1.5 border-l border-slate-200 pl-2">
                    <button
                      type="button"
                      onClick={toggleVideoPlay}
                      className="p-1 rounded-md bg-white hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 transition cursor-pointer"
                      title={isVideoPlaying ? 'Pause Video' : 'Play Video'}
                    >
                      {isVideoPlaying ? <Pause size={13} /> : <Play size={13} />}
                    </button>
                    <button
                      type="button"
                      onClick={toggleVideoMute}
                      className="p-1 rounded-md bg-white hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 transition cursor-pointer"
                      title={isVideoMuted ? 'Unmute Audio' : 'Mute Audio'}
                    >
                      {isVideoMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Video Player Display Container */}
              <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                >
                  <source src="/hero-defense-video.mp4" type="video/mp4" />
                  <source src="/Create_a_premium_futuristic_i.mp4" type="video/mp4" />
                </video>

                {/* Subtle Cinematic Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/30 pointer-events-none" />

                {/* Top Floating HUD Badges */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                  <div className="glass px-3 py-1.5 rounded-xl border border-white/10 bg-slate-900/75 text-orange-400 text-xs font-mono font-bold flex items-center gap-2 backdrop-blur-md shadow-md">
                    <Activity size={14} className="animate-pulse" />
                    NEURAL THREAT DETECTOR
                  </div>
                  <div className="glass px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-slate-900/75 text-emerald-400 text-xs font-mono font-bold flex items-center gap-2 backdrop-blur-md shadow-md">
                    <ShieldCheck size={14} />
                    SHIELD: ACTIVE
                  </div>
                </div>

                {/* Interactive Simulated Attack Alert Banner */}
                {activeAttackSimulation && (
                  <div className="absolute inset-x-4 top-16 bg-red-950/90 border border-red-500 text-red-100 p-3 rounded-xl backdrop-blur-md shadow-2xl flex items-center justify-between text-xs font-mono animate-in fade-in slide-in-from-top-2 duration-300 z-20">
                    <div className="flex items-center gap-2.5">
                      <ShieldAlert size={18} className="text-red-400 animate-bounce" />
                      <div>
                        <div className="font-bold text-red-200 uppercase tracking-wider">DEFENSE ENGAGED: {activeAttackSimulation}</div>
                        <div className="text-[11px] text-red-300">Neural defense matrix intercepted attack signature • Zero damage verified.</div>
                      </div>
                    </div>
                    <span className="bg-red-900/80 px-2 py-0.5 rounded text-emerald-300 font-bold border border-red-700/60">
                      NEUTRALIZED 100%
                    </span>
                  </div>
                )}

                {/* Bottom Telemetry HUD */}
                <div className="absolute bottom-4 inset-x-4 grid grid-cols-3 gap-2 sm:gap-3 pointer-events-none">
                  <div className="glass px-3 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-left backdrop-blur-md">
                    <div className="text-[10px] uppercase font-mono font-bold text-slate-400">Neural Confidence</div>
                    <div className="text-sm sm:text-base font-mono font-black text-white">99.8%</div>
                  </div>
                  <div className="glass px-3 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-left backdrop-blur-md">
                    <div className="text-[10px] uppercase font-mono font-bold text-slate-400">Threat Interception</div>
                    <div className="text-sm sm:text-base font-mono font-black text-emerald-400 truncate">Zero-Day Neutralized</div>
                  </div>
                  <div className="glass px-3 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-left backdrop-blur-md">
                    <div className="text-[10px] uppercase font-mono font-bold text-slate-400">Reaction Latency</div>
                    <div className="text-sm sm:text-base font-mono font-black text-orange-400">14ms</div>
                  </div>
                </div>
              </div>

              {/* Interactive Attack Simulation Trigger Bar */}
              <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-slate-600">
                  <Zap size={14} className="text-orange-500" />
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider">Simulate Attack Vectors:</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { label: 'Zero-Day Exploit', attack: 'Zero-Day Memory Hijack' },
                    { label: 'Quishing QR', attack: 'Municipal Meter Quishing Trap' },
                    { label: 'Typosquat Domain', attack: 'Homograph Punycode Deception' },
                    { label: 'Executive BEC', attack: 'CEO Wire Fraud Social Engineering' },
                  ].map((btn) => (
                    <button
                      key={btn.label}
                      type="button"
                      onClick={() => handleSimulateAttack(btn.attack)}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-orange-500 hover:text-white text-slate-700 font-mono text-[11px] font-semibold border border-slate-300 transition cursor-pointer shadow-xs"
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Showcase Footer Status */}
              <div className="px-4 py-2.5 bg-slate-100/90 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono text-[11px]">Veo 3 AI Defense Engine v2.8 • Autonomous Mode</span>
                </div>
                <div className="flex items-center gap-4 font-mono text-[11px]">
                  <span className="text-orange-600 font-bold">LATENCY: 14MS</span>
                  <span className="text-cyan-700 font-medium">ENCRYPTION: AES-256-GCM</span>
                </div>
              </div>

            </div>
          </motion.div>

          {/* Stats Badges with CountUp Springs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.65 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-16"
          >
            {STATS.map((s) => (
              <div key={s.label} className="bg-white rounded-2xl p-5 text-center border border-slate-200 shadow-sm hover:shadow-md transition">
                <div className="text-2xl sm:text-3xl md:text-4xl font-black gradient-text">
                  <CountUp
                    to={s.to}
                    decimals={s.decimals}
                    prefix={s.prefix}
                    suffix={s.suffix}
                    duration={2.2}
                  />
                </div>
                <div className="text-xs sm:text-sm text-slate-500 mt-1 font-semibold">{s.label}</div>
              </div>
            ))}
          </motion.div>

        </div>

        {/* Scroll indicator */}
        <div className="mt-16 z-10">
          <ScrollIndicator />
        </div>
      </section>

      {/* ═══════════ NEW: CYBER ATTACKS & FRAUD DETECTION PORTAL ═══════════ */}
      <section id="cyber-attacks" className="py-24 md:py-32 bg-slate-50 border-t border-slate-200 relative z-10" aria-label="Cyber Attacks Portal">
        <div className="max-w-7xl mx-auto px-4">
          
          {/* Live Attack Ticker */}
          <div className="mb-12 overflow-hidden rounded-xl bg-white text-slate-800 p-3.5 shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-red-600 text-white font-mono text-xs font-bold shrink-0 tracking-wider shadow-xs">
              <Radio size={14} className="animate-pulse" />
              LIVE THREAT FEED
            </div>
            <div className="text-xs font-mono text-slate-600 truncate">
              <span className="text-red-600 font-bold">[CRITICAL]</span> Phishing payload intercepted targeting Chase online banking •{' '}
              <span className="text-orange-600 font-bold">[BLOCKED]</span> Quishing QR attack in transit parking meters •{' '}
              <span className="text-amber-600 font-bold">[ALERT]</span> Typosquat domain <GlitchText text="pаypal-support.xyz" className="text-slate-900 font-bold" /> neutralized •{' '}
              <span className="text-cyan-600 font-bold">[DISARMED]</span> Executive BEC invoice wire request deflected
            </div>
          </div>

          <div className="text-center mb-16">
            <p className="section-label mb-3">Live Threat Intelligence</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
              Cyber Attacks & <span className="gradient-text">Fraud Detection</span> Portal
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-base sm:text-lg">
              Analyze live cyber fraud vectors in real time. Inspect attack mechanics, simulate AI neutralization, and test suspicious assets.
            </p>
          </div>

          {/* Side-by-Side: 3D WebGL Radar & Fraud Vectors Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">

            {/* Left 5 Cols: 3D WebGL Cyber Radar */}
            <div className="lg:col-span-5 space-y-4">
              <WebGLCyberRadar />
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm text-xs space-y-2">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-900 flex items-center gap-1.5">
                    <ShieldAlert size={16} className="text-orange-600" />
                    Autonomous Radar Protection
                  </span>
                  <span className="text-emerald-600">ACTIVE</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Real-time 3D spatial scanning correlates IP reputation, SSL validity, and domain homographs to deflect threats before payload delivery.
                </p>
              </div>
            </div>

            {/* Right 7 Cols: Interactive Cyber Frauds Grid */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {CYBER_FRAUD_ATTACKS.map((fraud) => {
                const isSelected = selectedFraud.id === fraud.id;
                return (
                  <div
                    key={fraud.id}
                    onClick={() => setSelectedFraud(fraud)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer text-left relative overflow-hidden ${
                      isSelected
                        ? 'bg-white border-orange-500 shadow-lg shadow-orange-500/10 ring-2 ring-orange-500/20'
                        : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2.5">
                      <span
                        className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider"
                        style={{ backgroundColor: `${fraud.accent}15`, color: fraud.accent }}
                      >
                        {fraud.severity}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {fraud.category}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 mb-1.5">
                      {fraud.name}
                    </h3>

                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 font-mono text-[11px] text-slate-700 truncate mb-2">
                      <GlitchText text={fraud.vector} hoverOnly={true} className="text-slate-800" />
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {fraud.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Live Threat Simulation Sandbox */}
          <div className="rounded-3xl bg-white border border-slate-200/90 p-6 md:p-10 shadow-xl max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
              <div>
                <span className="text-xs font-bold text-orange-600 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                  <Terminal size={14} />
                  Live AI Threat Sandbox
                </span>
                <h3 className="text-xl md:text-2xl font-black text-slate-900">
                  Simulate Defense: {selectedFraud.name}
                </h3>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={handleSimulateNeutralize}
                  disabled={simulatingNeutralize}
                  className="btn-primary text-xs sm:text-sm px-5 py-2.5 rounded-xl font-bold cursor-pointer"
                >
                  {simulatingNeutralize ? 'Analyzing Payload...' : 'Test AI Neutralization'}
                </button>
                <button
                  onClick={() => handleToolClick(selectedFraud.targetPath)}
                  className="btn-secondary text-xs sm:text-sm px-4 py-2.5 rounded-xl font-bold cursor-pointer flex items-center gap-1.5"
                >
                  Scan Target
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Sandbox Payload View with Glitch Text */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-mono text-xs shadow-xs">
                <div className="flex items-center justify-between text-slate-500 border-b border-slate-200 pb-2 mb-2 text-[11px] font-bold">
                  <span>INTERCEPTED PAYLOAD STREAM</span>
                  <span className="text-orange-600">STATUS: SANDBOX_ISOLATED</span>
                </div>
                <div className="space-y-1">
                  <p className="text-red-700 font-bold flex items-center gap-2">
                    <AlertTriangle size={13} className="text-red-600" />
                    VECTOR: <GlitchText text={selectedFraud.vector} className="text-slate-900 font-mono" />
                  </p>
                  <p className="text-slate-600">METHOD: Automated Multi-Stage Heuristic Inspection</p>
                  <p className="text-slate-600">DEFENSE PROTOCOL: Google Veo 3 Neural Defense Policy v2.8</p>
                </div>
              </div>

              {simulatedVerdict && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-bold flex items-center gap-2.5 shadow-sm"
                >
                  <CheckCircle size={18} className="text-emerald-600 shrink-0" />
                  <span>{simulatedVerdict}</span>
                </motion.div>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* ═══════════ TOOLS TOOLKIT WITH 3D TILT CARDS (STABLE CLEAN TEXT) ═══════════ */}
      <section id="tools" className="py-24 md:py-32 bg-white/80 backdrop-blur-sm border-y border-slate-200 relative z-10" aria-label="Scanning tools">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <p className="section-label mb-3">Complete Defense Suite</p>
            <BlurText
              text="Six AI Scanners. Total Protection."
              className="justify-center text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-4"
            />
            <p className="text-slate-600 max-w-xl mx-auto text-base">
              Move your mouse over any scanner to experience real 3D perspective depth and specular glare.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TOOLS.map((tool, i) => (
              <Reveal key={tool.title} delay={i * 0.07}>
                <Tilted3DCard
                  maxAngle={12}
                  scaleOnHover={1.03}
                  spotlightColor={`${tool.accent}30`}
                  onClick={() => handleToolClick(tool.path)}
                  ariaLabel={`Open ${tool.title}${!isAuthenticated ? ' (login required)' : ''}`}
                  className="p-6 group"
                >
                  <div className="flex items-center justify-between mb-5">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${tool.accent}15`, color: tool.accent }}
                    >
                      <tool.icon size={22} />
                    </div>
                    <span className="flex items-center gap-1 text-xs font-bold text-slate-400 group-hover:text-orange-600 transition">
                      Scan <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>

                  {/* Clean, stable readable text — ZERO scrambling */}
                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-orange-600 transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed font-normal">{tool.desc}</p>
                </Tilted3DCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <section id="features" className="py-24 md:py-32 bg-slate-50/90 relative z-10" aria-label="Features">
        <div className="max-w-6xl mx-auto px-4">
          <SectionHeader
            label="Why PHISHGUARD AI"
            title="Built for Speed."
            titleAccent="Engineered for Trust."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.08}>
                <Tilted3DCard
                  maxAngle={8}
                  scaleOnHover={1.02}
                  spotlightColor="rgba(249, 115, 22, 0.15)"
                  className="p-7"
                >
                  <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-5">
                    <f.icon size={22} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2.5">{f.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
                </Tilted3DCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS (CLEAN READABLE NUMBERS) ═══════════ */}
      <section id="how-it-works" className="py-24 md:py-32 bg-white border-t border-slate-200 relative z-10" aria-label="How it works">
        <div className="max-w-5xl mx-auto px-4">
          <SectionHeader
            label="Simple 3-Step Process"
            title="How PHISHGUARD"
            titleAccent="Protects You"
          />

          <div className="space-y-12 md:space-y-16">
            {STEPS.map((s, i) => (
              <Reveal key={s.step} delay={0.1} direction={i % 2 === 0 ? 'left' : 'right'}>
                <div className={`flex flex-col md:flex-row items-center gap-8 md:gap-14 ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex-shrink-0 w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-orange-50 border-2 border-orange-200/80 flex flex-col items-center justify-center shadow-md shadow-orange-500/10 cursor-pointer group"
                  >
                    <span className="text-2xl md:text-3xl font-black text-orange-600">
                      {s.step}
                    </span>
                    <s.icon size={20} className="text-orange-500 mt-1 group-hover:rotate-12 transition-transform" />
                  </motion.div>

                  <div className="text-center md:text-left flex-1">
                    <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-2.5">{s.title}</h3>
                    <p className="text-slate-600 text-base md:text-lg leading-relaxed max-w-lg font-normal">
                      {s.desc}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ TRUST BADGES ═══════════ */}
      <section className="py-16 bg-slate-50 border-y border-slate-200 relative z-10" aria-label="Trust badges">
        <div className="max-w-5xl mx-auto px-4">
          <Reveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {TRUST_BADGES.map((b) => (
                <div key={b.label} className="flex flex-col items-center gap-2.5">
                  <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-orange-600 shadow-sm hover:scale-110 transition-transform">
                    <b.icon size={22} aria-hidden="true" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-700">{b.label}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════ FINAL CALL TO ACTION WITH MAGNET ═══════════ */}
      <section className="py-24 md:py-32 bg-white relative z-10" aria-label="Call to action">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Reveal>
            <div className="rounded-3xl p-10 md:p-16 bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 text-white shadow-2xl shadow-orange-500/25 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="relative z-10">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 tracking-tight">
                  Stop phishing attacks before they begin.
                </h2>
                <p className="text-base md:text-lg text-orange-100 max-w-xl mx-auto mb-8 font-normal leading-relaxed">
                  Join millions of users defending their identity, accounts, and organizations with PHISHGUARD AI.
                </p>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                  <Magnet padding={50} magnetStrength={3}>
                    <button
                      onClick={() => navigate(isAuthenticated ? '/dashboard' : '/signup')}
                      className="bg-white text-orange-600 hover:bg-orange-50 text-base font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2 cursor-pointer"
                      aria-label="Create free account"
                    >
                      {isAuthenticated ? 'Open Dashboard' : 'Create Free Account'}
                      <ArrowRight size={18} />
                    </button>
                  </Magnet>
                  <button
                    onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
                    className="bg-orange-700/60 hover:bg-orange-700/80 text-white border border-white/20 text-base font-semibold px-8 py-4 rounded-xl transition cursor-pointer"
                    aria-label="Sign in"
                  >
                    {isAuthenticated ? 'Command Center' : 'Sign In to Portal'}
                  </button>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="border-t border-slate-200 bg-slate-50 py-12 relative z-10" role="contentinfo">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white font-bold">
              <ShieldCheck size={18} />
            </div>
            <span className="font-extrabold text-base tracking-tight text-slate-900">
              PHISHGUARD<span className="text-orange-600">AI</span>
            </span>
          </div>
          <nav className="flex flex-wrap justify-center gap-8 text-sm font-medium text-slate-600" aria-label="Footer navigation">
            <a href="#cyber-attacks" className="hover:text-orange-600 transition-colors">Cyber Attacks</a>
            <a href="#tools" className="hover:text-orange-600 transition-colors">Tools</a>
            <a href="#features" className="hover:text-orange-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-orange-600 transition-colors">How It Works</a>
            <button onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')} className="hover:text-orange-600 transition-colors cursor-pointer">
              {isAuthenticated ? 'Dashboard' : 'Login'}
            </button>
          </nav>
          <p className="text-xs text-slate-500 font-normal">
            &copy; 2026 PHISHGUARD AI. All rights reserved. Powered by Veo 3 Neural Defense.
          </p>
        </div>
      </footer>
    </main>
  );
}
