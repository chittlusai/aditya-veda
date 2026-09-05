import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Radio, ShieldAlert } from 'lucide-react';

interface ThreatIncident {
  city: string;
  country: string;
  type: string;
  risk: number;
  lat: number;
  lon: number;
  time: string;
}

const GLOBAL_INCIDENTS: ThreatIncident[] = [
  { city: 'San Francisco', country: 'US', type: 'Zero-Day OAuth Phish', risk: 96, lat: 37.77, lon: -122.41, time: '2s ago' },
  { city: 'Frankfurt', country: 'DE', type: 'Quishing QR Hijack', risk: 88, lat: 50.11, lon: 8.68, time: '8s ago' },
  { city: 'London', country: 'UK', type: 'Punycode Typosquat', risk: 91, lat: 51.50, lon: -0.12, time: '14s ago' },
  { city: 'Singapore', country: 'SG', type: 'BEC Executive Wire', risk: 94, lat: 1.35, lon: 103.81, time: '22s ago' },
  { city: 'Tokyo', country: 'JP', type: 'SMS Smishing Trap', risk: 78, lat: 35.67, lon: 139.65, time: '35s ago' },
  { city: 'São Paulo', country: 'BR', type: 'Banking Credential Stealer', risk: 92, lat: -23.55, lon: -46.63, time: '41s ago' },
];

function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

export default function DashboardThreatGlobe() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedIncident, setSelectedIncident] = useState<ThreatIncident>(GLOBAL_INCIDENTS[0]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 1.2, 4.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Globe Master Group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // 1. Wireframe Outer Sphere
    const sphereRadius = 1.45;
    const sphereGeo = new THREE.SphereGeometry(sphereRadius, 24, 20);
    const wireGeo = new THREE.WireframeGeometry(sphereGeo);
    const wireMat = new THREE.LineBasicMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    });
    const wireSphere = new THREE.LineSegments(wireGeo, wireMat);
    globeGroup.add(wireSphere);

    // 2. Inner Atmospheric Glow Core
    const innerGeo = new THREE.SphereGeometry(sphereRadius * 0.98, 32, 32);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x0369a1,
      transparent: true,
      opacity: 0.15,
    });
    const innerSphere = new THREE.Mesh(innerGeo, innerMat);
    globeGroup.add(innerSphere);

    // 3. Latitude / Longitude Equator Ring
    const equatorGeo = new THREE.TorusGeometry(sphereRadius * 1.05, 0.015, 16, 90);
    const equatorMat = new THREE.MeshBasicMaterial({ color: 0xf97316, transparent: true, opacity: 0.5 });
    const equatorRing = new THREE.Mesh(equatorGeo, equatorMat);
    equatorRing.rotation.x = Math.PI / 2;
    globeGroup.add(equatorRing);

    // 4. Incident Pins & Beacons
    const beaconCount = GLOBAL_INCIDENTS.length;
    const beaconGeo = new THREE.BufferGeometry();
    const beaconPos = new Float32Array(beaconCount * 3);
    const beaconColors = new Float32Array(beaconCount * 3);

    GLOBAL_INCIDENTS.forEach((inc, idx) => {
      const v = latLonToVector3(inc.lat, inc.lon, sphereRadius * 1.02);
      beaconPos[idx * 3] = v.x;
      beaconPos[idx * 3 + 1] = v.y;
      beaconPos[idx * 3 + 2] = v.z;

      // Color by risk: red for >90, orange for >80
      if (inc.risk >= 90) {
        beaconColors[idx * 3] = 0.95;
        beaconColors[idx * 3 + 1] = 0.2;
        beaconColors[idx * 3 + 2] = 0.2;
      } else {
        beaconColors[idx * 3] = 0.98;
        beaconColors[idx * 3 + 1] = 0.55;
        beaconColors[idx * 3 + 2] = 0.1;
      }

      // Add small glowing beacon mesh
      const pinMeshGeo = new THREE.OctahedronGeometry(0.05, 0);
      const pinMat = new THREE.MeshBasicMaterial({
        color: inc.risk >= 90 ? 0xef4444 : 0xf97316,
      });
      const pinMesh = new THREE.Mesh(pinMeshGeo, pinMat);
      pinMesh.position.copy(v);
      globeGroup.add(pinMesh);
    });

    beaconGeo.setAttribute('position', new THREE.BufferAttribute(beaconPos, 3));
    beaconGeo.setAttribute('color', new THREE.BufferAttribute(beaconColors, 3));
    const beaconMat = new THREE.PointsMaterial({
      size: 0.16,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
    });
    const beaconPoints = new THREE.Points(beaconGeo, beaconMat);
    globeGroup.add(beaconPoints);

    // 5. Threat Attack Arcs (Curves connecting nodes)
    for (let i = 0; i < GLOBAL_INCIDENTS.length; i++) {
      const start = latLonToVector3(GLOBAL_INCIDENTS[i].lat, GLOBAL_INCIDENTS[i].lon, sphereRadius * 1.02);
      const nextIdx = (i + 2) % GLOBAL_INCIDENTS.length;
      const end = latLonToVector3(GLOBAL_INCIDENTS[nextIdx].lat, GLOBAL_INCIDENTS[nextIdx].lon, sphereRadius * 1.02);

      const mid = start.clone().add(end).multiplyScalar(0.5);
      const dist = start.distanceTo(end);
      mid.normalize().multiplyScalar(sphereRadius * 1.02 + dist * 0.35);

      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      const pts = curve.getPoints(30);
      const arcGeo = new THREE.BufferGeometry().setFromPoints(pts);
      const arcMat = new THREE.LineBasicMaterial({
        color: i % 2 === 0 ? 0xef4444 : 0x06b6d4,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
      });
      const arcLine = new THREE.Line(arcGeo, arcMat);
      globeGroup.add(arcLine);
    }

    // ── Drag & Touch Interactivity ────────────────
    let isDown = false;
    let prevX = 0;
    let prevY = 0;
    let targetRotY = 0;
    let targetRotX = 0.2;

    const onPointerDown = (e: PointerEvent) => {
      isDown = true;
      prevX = e.clientX;
      prevY = e.clientY;
      container.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (isDown) {
        const dx = e.clientX - prevX;
        const dy = e.clientY - prevY;
        targetRotY += dx * 0.008;
        targetRotX += dy * 0.008;
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

    // ── Render Loop ───────────────────────────────
    let animId: number;
    let isVisible = true;

    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    }, { threshold: 0.05 });
    observer.observe(container);

    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (isVisible) {
        // Continuous slow rotation if not dragging
        if (!isDown) {
          targetRotY += 0.002;
        }

        globeGroup.rotation.y += (targetRotY - globeGroup.rotation.y) * 0.08;
        globeGroup.rotation.x += (targetRotX - globeGroup.rotation.x) * 0.08;

        equatorRing.rotation.z += 0.004;

        renderer.render(scene, camera);
      }
    };

    animate();

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
    <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl flex flex-col lg:flex-row h-full min-h-[380px]">
      {/* 3D WebGL Globe Viewport */}
      <div className="relative flex-1 min-h-[260px] lg:min-h-full cursor-grab active:cursor-grabbing">
        <div ref={mountRef} className="absolute inset-0 w-full h-full" />

        {/* HUD Top Left Pill */}
        <div className="absolute top-3 left-3 pointer-events-none z-10 flex items-center gap-2">
          <div className="glass px-2.5 py-1 rounded-lg border border-cyan-500/30 bg-slate-900/80 text-cyan-300 font-mono text-[11px] font-bold flex items-center gap-1.5 shadow-sm">
            <Radio size={12} className="text-cyan-400 animate-pulse" />
            GLOBAL THREAT INTERCEPT MESH
          </div>
          <span className="hidden sm:inline-block text-[10px] font-mono text-slate-400 bg-slate-900/60 px-2 py-0.5 rounded border border-slate-700/50">
            ✦ Drag to orbit 3D globe
          </span>
        </div>

        {/* Selected Incident Indicator Pill */}
        <div className="absolute bottom-3 left-3 right-3 sm:right-auto pointer-events-auto z-10">
          <div className="glass px-3 py-2 rounded-xl border border-slate-700/80 bg-slate-900/90 text-left shadow-lg backdrop-blur-md max-w-sm">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[11px] font-mono text-slate-400">Live Focus:</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-950 text-red-400 border border-red-800/50 font-bold">
                RISK {selectedIncident.risk}/100
              </span>
            </div>
            <div className="text-xs font-bold text-white truncate">{selectedIncident.type}</div>
            <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
              <span>{selectedIncident.city}, {selectedIncident.country}</span>
              <span>•</span>
              <span className="text-orange-400">{selectedIncident.time}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Threat Stream Feed Panel */}
      <div className="w-full lg:w-80 bg-slate-900/95 border-t lg:border-t-0 lg:border-l border-slate-800 p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert size={16} className="text-orange-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                Live Attack Interceptions
              </h3>
            </div>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          </div>

          <div className="space-y-2">
            {GLOBAL_INCIDENTS.slice(0, 4).map((inc) => (
              <div
                key={inc.city}
                onClick={() => setSelectedIncident(inc)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer text-left ${
                  selectedIncident.city === inc.city
                    ? 'bg-slate-800 border-orange-500/50 shadow-md'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-bold text-slate-200 truncate">{inc.city}</span>
                  <span className="font-mono text-[10px] text-orange-400">{inc.time}</span>
                </div>
                <div className="text-[11px] text-slate-400 truncate mb-1.5">{inc.type}</div>
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-emerald-400 font-semibold">STATE: ISOLATED</span>
                  <span className="text-red-400 font-bold">{inc.risk}/100</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800/80 mt-3 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Interception Rate:</span>
          <span className="text-emerald-400 font-bold">99.8% Neural Block</span>
        </div>
      </div>
    </div>
  );
}
