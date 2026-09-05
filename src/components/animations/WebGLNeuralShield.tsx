import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Activity, Zap, Play, Pause, ShieldCheck } from 'lucide-react';

interface WebGLNeuralShieldProps {
  className?: string;
}

export default function WebGLNeuralShield({ className = '' }: WebGLNeuralShieldProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeVector, setActiveVector] = useState<string>('Zero-Day Neural Threat');
  const [interceptCount, setInterceptCount] = useState<number>(142);
  const [confidence, setConfidence] = useState<number>(99.8);
  const [latency, setLatency] = useState<number>(14);
  const isPlayingRef = useRef(true);
  isPlayingRef.current = isPlaying;

  // External trigger for attack pulse
  const triggerAttackRef = useRef<((name?: string) => void) | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // ── Three.js Scene Setup ──────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 5.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      precision: 'mediump',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // ── Lighting ─────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0x1a2436, 1.5);
    scene.add(ambientLight);

    const shieldGlowLight = new THREE.PointLight(0xf97316, 3.0, 8);
    shieldGlowLight.position.set(0, 0, 1.5);
    scene.add(shieldGlowLight);

    const cyberBlueLight = new THREE.PointLight(0x06b6d4, 2.5, 10);
    cyberBlueLight.position.set(-3, 2, 2);
    scene.add(cyberBlueLight);

    // ── Shield Master Group ──────────────────────
    const shieldMaster = new THREE.Group();
    scene.add(shieldMaster);

    // Outer Polygonal Diamond/Shield Mesh (Ultra-fast MeshStandardMaterial, 0 extra passes)
    const shieldGeo = new THREE.IcosahedronGeometry(1.2, 1);
    const shieldMat = new THREE.MeshStandardMaterial({
      color: 0x0ea5e9,
      emissive: 0x0369a1,
      emissiveIntensity: 0.35,
      roughness: 0.15,
      metalness: 0.85,
      transparent: true,
      opacity: 0.75,
      wireframe: false,
    });
    const shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
    shieldMaster.add(shieldMesh);

    // Golden / Amber Inner Energy Core
    const coreGeo = new THREE.OctahedronGeometry(0.7, 0);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      roughness: 0.2,
      metalness: 0.9,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    shieldMaster.add(coreMesh);

    // Wireframe Shield Armor
    const wireGeo = new THREE.WireframeGeometry(shieldGeo);
    const wireMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const wireMesh = new THREE.LineSegments(wireGeo, wireMat);
    wireMesh.scale.setScalar(1.02);
    shieldMaster.add(wireMesh);

    // Outer Concentric Energy Rings
    const ringGeo1 = new THREE.TorusGeometry(1.65, 0.02, 16, 90);
    const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.5 });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI * 0.3;
    shieldMaster.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(1.4, 0.02, 16, 80);
    const ringMat2 = new THREE.MeshBasicMaterial({ color: 0xf97316, transparent: true, opacity: 0.6 });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.y = Math.PI * 0.4;
    shieldMaster.add(ring2);

    // ── Deflection Spark Particles (Optimized lightweight batch) ────
    const sparkCount = 50;
    const sparkGeo = new THREE.BufferGeometry();
    const sparkPos = new Float32Array(sparkCount * 3);
    const sparkVels: THREE.Vector3[] = [];
    const sparkColors = new Float32Array(sparkCount * 3);

    for (let i = 0; i < sparkCount; i++) {
      sparkPos[i * 3] = (Math.random() - 0.5) * 0.5;
      sparkPos[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
      sparkPos[i * 3 + 2] = (Math.random() - 0.5) * 0.5;

      sparkVels.push(new THREE.Vector3(
        (Math.random() * 0.06 + 0.02) * (Math.random() > 0.3 ? 1 : -0.5),
        (Math.random() - 0.5) * 0.06,
        (Math.random() - 0.5) * 0.06
      ));

      // Amber / cyan / white palette
      const isAmber = Math.random() > 0.4;
      sparkColors[i * 3] = isAmber ? 1.0 : 0.2;
      sparkColors[i * 3 + 1] = isAmber ? 0.6 : 0.8;
      sparkColors[i * 3 + 2] = isAmber ? 0.1 : 1.0;
    }

    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
    sparkGeo.setAttribute('color', new THREE.BufferAttribute(sparkColors, 3));

    const sparkMat = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const sparkPoints = new THREE.Points(sparkGeo, sparkMat);
    scene.add(sparkPoints);

    // ── Incoming Threat Laser Beams (Red Rays) ────
    const laserCount = 4;
    const lasers: THREE.Line[] = [];
    for (let i = 0; i < laserCount; i++) {
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-4.0, (i - 1.5) * 0.6, 0),
        new THREE.Vector3(-0.9, (i - 1.5) * 0.25, 0),
      ]);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0xef4444,
        linewidth: 2,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
      });
      const laserLine = new THREE.Line(lineGeo, lineMat);
      scene.add(laserLine);
      lasers.push(laserLine);
    }

    // ── Interactive Drag & Tilt Controls ──────────
    let isDown = false;
    let prevX = 0;
    let prevY = 0;
    let targetRotX = 0;
    let targetRotY = 0;
    let hoverTiltX = 0;
    let hoverTiltY = 0;

    const onPointerDown = (e: PointerEvent) => {
      isDown = true;
      prevX = e.clientX;
      prevY = e.clientY;
      container.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width - 0.5;
      const relY = (e.clientY - rect.top) / rect.height - 0.5;
      hoverTiltY = relX * 0.4;
      hoverTiltX = relY * 0.3;

      if (isDown) {
        const dx = e.clientX - prevX;
        const dy = e.clientY - prevY;
        targetRotY += dx * 0.01;
        targetRotX += dy * 0.01;
        prevX = e.clientX;
        prevY = e.clientY;
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (isDown) {
        isDown = false;
        try { container.releasePointerCapture(e.pointerId); } catch (_) {}
      }
    };

    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerup', onPointerUp);
    container.addEventListener('pointerleave', () => { hoverTiltX = 0; hoverTiltY = 0; });

    // Attack Trigger Function
    let pulseScale = 1.0;
    let pulseVel = 0;

    triggerAttackRef.current = (name = 'Zero-Day Injection Attack') => {
      pulseScale = 1.35;
      targetRotY += 0.4;
      setActiveVector(name);
      setInterceptCount((prev) => prev + 1);
      setConfidence(99.9);
      setLatency(Math.floor(Math.random() * 5) + 11);

      // Re-energize sparks
      const pos = sparkGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < sparkCount; i++) {
        pos[i * 3] = -0.9 + (Math.random() - 0.5) * 0.3;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 0.8;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 0.8;
        sparkVels[i].x = Math.random() * 0.12 + 0.04;
        sparkVels[i].y = (Math.random() - 0.5) * 0.1;
      }
      sparkGeo.attributes.position.needsUpdate = true;
    };

    // ── Animation Loop (Throttled & Paused when Offscreen) ───
    let clock = 0;
    let animId: number;
    let isVisible = true;

    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    }, { threshold: 0.05 });
    observer.observe(container);

    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (isVisible && isPlayingRef.current) {
        clock += 0.016;

        // Smooth rotation & hover tilt
        shieldMaster.rotation.y += (targetRotY + hoverTiltY - shieldMaster.rotation.y) * 0.08 + 0.005;
        shieldMaster.rotation.x += (targetRotX + hoverTiltX - shieldMaster.rotation.x) * 0.08;

        coreMesh.rotation.y -= 0.015;
        coreMesh.rotation.x += 0.01;

        ring1.rotation.z += 0.008;
        ring2.rotation.z -= 0.012;

        // Pulse spring physics
        pulseVel += (1.0 - pulseScale) * 0.15;
        pulseVel *= 0.75;
        pulseScale += pulseVel;

        const naturalBreathing = 1.0 + Math.sin(clock * 3) * 0.03;
        shieldMesh.scale.setScalar(pulseScale * naturalBreathing);
        wireMesh.scale.setScalar(pulseScale * naturalBreathing * 1.02);

        // Update deflection spark particles
        const pos = sparkGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < sparkCount; i++) {
          pos[i * 3] += sparkVels[i].x;
          pos[i * 3 + 1] += sparkVels[i].y;
          pos[i * 3 + 2] += sparkVels[i].z;

          // Recycle sparks that fly too far
          if (pos[i * 3] > 2.5) {
            pos[i * 3] = -0.9 + (Math.random() - 0.5) * 0.2;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 0.8;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 0.8;
            sparkVels[i].x = Math.random() * 0.07 + 0.02;
          }
        }
        sparkGeo.attributes.position.needsUpdate = true;

        // Laser pulsation
        lasers.forEach((l, idx) => {
          const mat = l.material as THREE.LineBasicMaterial;
          mat.opacity = 0.5 + Math.sin(clock * 12 + idx * 1.5) * 0.45;
        });

        // Floating shield drift
        shieldMaster.position.y = Math.sin(clock * 1.5) * 0.08;

        renderer.render(scene, camera);
      }
    };

    animate();

    // ── Resize Handler ────────────────────────────
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('pointerdown', onPointerDown);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerup', onPointerUp);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className={`relative aspect-video w-full overflow-hidden bg-slate-950 select-none ${className}`}>
      {/* 3D WebGL Canvas Mount */}
      <div
        ref={mountRef}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing z-0"
        title="Click and drag to rotate 3D Defense Shield"
      />

      {/* Cyber Grid Background Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,165,233,0.15)_0%,rgba(2,6,23,0.9)_75%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0ea5e90a_1px,transparent_1px),linear-gradient(to_bottom,#0ea5e90a_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Animated Scan Line */}
      {isPlaying && (
        <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_#38bdf8] animate-scan-line pointer-events-none z-10" />
      )}

      {/* Interactive HUD Overlay */}
      <div className="absolute inset-0 p-4 sm:p-6 flex flex-col justify-between pointer-events-none z-10">

        {/* Top Badges */}
        <div className="flex items-center justify-between pointer-events-auto">
          <div className="glass px-3 py-1.5 rounded-lg border border-cyan-500/30 bg-slate-900/80 shadow-lg flex items-center gap-2 backdrop-blur-md">
            <Activity size={14} className="text-cyan-400 animate-pulse" />
            <span className="text-xs font-mono font-bold text-cyan-300 tracking-wider">
              3D NEURAL DEFENSE CORE
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="glass px-3 py-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/70 text-emerald-300 font-mono text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <ShieldCheck size={14} className="text-emerald-400" />
              SHIELD: ACTIVE ({interceptCount} BLOCKED)
            </div>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-700/80 text-slate-300 hover:text-white hover:border-slate-500 transition cursor-pointer"
              title={isPlaying ? 'Pause simulation' : 'Resume simulation'}
            >
              {isPlaying ? <Pause size={13} /> : <Play size={13} />}
            </button>
          </div>
        </div>

        {/* Floating Right HUD Card */}
        <div className="hidden sm:flex self-end flex-col gap-2 pointer-events-auto max-w-xs">
          <div className="glass p-3.5 rounded-xl border border-white/10 bg-slate-900/85 backdrop-blur-md shadow-xl text-left space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 font-mono">Threat Neutralized</span>
              <span className="text-[10px] font-mono text-slate-400">Confidence: {confidence}%</span>
            </div>

            <div className="flex items-center gap-2 p-1.5 rounded bg-slate-800/60 border border-slate-700/50">
              <ShieldCheck size={14} className="text-cyan-400 shrink-0" />
              <div className="text-[11px] font-medium text-slate-200">SSL & Domain Integrity Verified</div>
            </div>

            <div className="flex items-center gap-2 p-1.5 rounded bg-slate-800/60 border border-slate-700/50">
              <Zap size={14} className="text-amber-400 shrink-0" />
              <div className="text-[11px] font-medium text-slate-200">Zero-Day Neural Heuristics Active</div>
            </div>

            {/* Audio / Data Waveform Simulator */}
            <div className="pt-1">
              <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider mb-1 flex justify-between">
                <span>Vector Spectrum</span>
                <span className="text-cyan-400">4.8 GHz</span>
              </div>
              <div className="flex items-end gap-1 h-6">
                {[40, 75, 55, 95, 60, 85, 45, 90, 65, 80, 50, 70, 100, 60].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-cyan-500 to-orange-400 rounded-t-xs"
                    style={{
                      height: isPlaying ? `${Math.max(15, (h + Math.sin(Date.now() / 200 + i) * 20)) % 100}%` : `${h}%`,
                      transition: 'height 0.15s ease',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Interactive Simulation Bar & Metric Badges */}
        <div className="space-y-2.5 pointer-events-auto">
          {/* Quick Threat Vector Trigger Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold mr-1">
              Simulate:
            </span>
            {[
              { label: 'Zero-Day Exploit', name: 'Zero-Day RCE Attack Vector' },
              { label: 'Quishing QR', name: 'Malicious QR Payment Redirect' },
              { label: 'Typosquat Domain', name: 'Homograph Punycode Spoof' },
              { label: 'Executive BEC', name: 'AI Persona Wire Scam' },
            ].map((v) => (
              <button
                key={v.label}
                type="button"
                onClick={() => triggerAttackRef.current?.(v.name)}
                className="px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold bg-slate-900/80 border border-slate-700/80 text-slate-300 hover:text-orange-400 hover:border-orange-500/50 hover:bg-orange-950/40 transition cursor-pointer flex items-center gap-1 shadow-sm backdrop-blur-md"
              >
                <Zap size={10} className="text-orange-400" />
                {v.label}
              </button>
            ))}
          </div>

          {/* Bottom Telemetry Bar */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="glass p-2.5 sm:p-3 rounded-xl border border-white/10 bg-slate-900/80 text-left backdrop-blur-md">
              <div className="text-[10px] sm:text-xs font-mono text-slate-400 uppercase">NEURAL CONFIDENCE</div>
              <div className="text-sm sm:text-lg font-black text-white font-mono mt-0.5">{confidence}%</div>
            </div>

            <div className="glass p-2.5 sm:p-3 rounded-xl border border-emerald-500/30 bg-emerald-950/40 text-left backdrop-blur-md">
              <div className="text-[10px] sm:text-xs font-mono text-emerald-400 uppercase truncate">THREAT INTERCEPTION</div>
              <div className="text-xs sm:text-sm font-bold text-emerald-300 font-mono mt-0.5 truncate">
                {activeVector}
              </div>
            </div>

            <div className="glass p-2.5 sm:p-3 rounded-xl border border-white/10 bg-slate-900/80 text-left backdrop-blur-md">
              <div className="text-[10px] sm:text-xs font-mono text-slate-400 uppercase">REACTION LATENCY</div>
              <div className="text-sm sm:text-lg font-black text-orange-400 font-mono mt-0.5">{latency}ms</div>
            </div>
          </div>
        </div>

      </div>

      {/* Interactive Helper Cue */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none z-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/70 border border-slate-700/60 text-[10px] font-mono text-slate-400 backdrop-blur-md">
          ✦ Drag to rotate 3D shield • Click to deflect
        </span>
      </div>
    </div>
  );
}
