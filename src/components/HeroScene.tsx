import { useRef, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

/* ═══════════════════════════════════════════════
   PHISHGUARD AI — Interactive 3D Cyber Shield Core
   Real 3D WebGL experience:
   - Dynamic 3D perspective tracking with cursor
   - Multi-tier gyroscopic orbital rings
   - Light-adapted crystal amber material
   - Floating particle cyber clouds
   ═══════════════════════════════════════════════ */

/* ── Shield Core ─────────────────────────────── */
function ShieldCore({ scroll }: { scroll: number }) {
  const group = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const outerCage = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (group.current) {
      group.current.position.x = scroll * 3.2;
      group.current.position.y = -scroll * 1.4;
      group.current.rotation.y = scroll * Math.PI * 1.2 + t * 0.1;
    }

    if (core.current) {
      core.current.rotation.x = t * 0.16;
      core.current.rotation.z = t * 0.12;
      const s = 1 + Math.sin(t * 1.8) * 0.035;
      core.current.scale.setScalar(s * (1 - scroll * 0.2));
    }

    if (outerCage.current) {
      outerCage.current.rotation.y = -t * 0.09;
      outerCage.current.rotation.x = t * 0.06;
    }
  });

  return (
    <group ref={group}>
      <Float speed={1.4} rotationIntensity={0.4} floatIntensity={0.6}>
        {/* Crystal Amber Core */}
        <mesh ref={core}>
          <icosahedronGeometry args={[1.65, 1]} />
          <meshStandardMaterial
            color="#f97316"
            emissive="#ea580c"
            emissiveIntensity={0.55}
            metalness={0.8}
            roughness={0.1}
            transparent
            opacity={0.9}
          />
        </mesh>

        {/* Outer Protective Wireframe */}
        <mesh ref={outerCage}>
          <icosahedronGeometry args={[2.35, 1]} />
          <meshBasicMaterial color="#ea580c" wireframe transparent opacity={0.28} />
        </mesh>

        {/* Gyroscopic Orbital Rings */}
        {[3.1, 3.55, 4.0].map((r, i) => (
          <OrbitalRing key={i} radius={r} speed={0.22 - i * 0.06} scroll={scroll} index={i} />
        ))}

        {/* Inner Amber Point Light */}
        <pointLight color="#fb923c" intensity={3.5} distance={10} />
        <pointLight color="#0284c7" intensity={1.8} distance={7} position={[0, -1, 0]} />
      </Float>
    </group>
  );
}

/* ── Orbital Ring ────────────────────────────── */
function OrbitalRing({ radius, speed, scroll, index }: {
  radius: number; speed: number; scroll: number; index: number;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.rotation.z = t * speed * (index % 2 === 0 ? 1 : -1);
    ref.current.rotation.x = Math.PI / 2.2 + scroll * (0.35 + index * 0.2);
    ref.current.rotation.y = scroll * Math.PI * 0.45;
  });

  return (
    <mesh ref={ref}>
      <torusGeometry args={[radius, 0.016, 16, 100]} />
      <meshBasicMaterial
        color={index === 1 ? '#0284c7' : '#f97316'}
        transparent
        opacity={0.45 - index * 0.08}
      />
    </mesh>
  );
}

/* ── Light-Adapted Floating Cyber Particles ──── */
function DataParticles({ scroll }: { scroll: number }) {
  const ref = useRef<THREE.Points>(null);
  const count = 260;

  const positions = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3]     = (Math.random() - 0.5) * 24;
      p[i * 3 + 1] = (Math.random() - 0.5) * 20;
      p[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return p;
  }, []);

  useFrame(() => {
    if (!ref.current) return;
    ref.current.rotation.y += 0.0008;
    ref.current.rotation.x = scroll * 0.2;
    ref.current.scale.setScalar(1 + scroll * 0.35);
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.07} color="#ea580c" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

/* ── Interactive Camera Controller with Cursor Raycasting ──── */
function CameraRig({ scroll }: { scroll: number }) {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.targetX = (e.clientX / window.innerWidth - 0.5) * 2.2;
      mouse.current.targetY = -(e.clientY / window.innerHeight - 0.5) * 1.5;
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  useFrame(() => {
    mouse.current.x += (mouse.current.targetX - mouse.current.x) * 0.04;
    mouse.current.y += (mouse.current.targetY - mouse.current.y) * 0.04;

    camera.position.x = mouse.current.x * 1.8;
    camera.position.y = mouse.current.y * 1.2 + scroll * 1.4;
    camera.position.z = 7.6 + scroll * 3.2;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

/* ── Grid Floor ──────────────────────────────── */
function GridFloor({ scroll }: { scroll: number }) {
  const ref = useRef<THREE.GridHelper>(null);

  useFrame(() => {
    if (!ref.current) return;
    ref.current.position.y = -3.8 + scroll * 1.2;
    (ref.current.material as THREE.Material).opacity = Math.min(scroll * 1.2, 0.25);
  });

  return (
    <gridHelper
      ref={ref}
      args={[36, 36, '#cbd5e1', '#e2e8f0']}
      material-transparent={true}
      material-opacity={0}
    />
  );
}

/* ═══════════════════════════════════════════════
   EXPORTED SCENE
   ═══════════════════════════════════════════════ */
export default function HeroScene({ scrollProgress = 0 }: { scrollProgress: number }) {
  return (
    <div
      className="w-full h-full absolute inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
      role="presentation"
    >
      <Canvas
        camera={{ position: [0, 0, 7.6], fov: 48 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ pointerEvents: 'none' }}
      >
        <fog attach="fog" args={['#f8fafc', 8, 26]} />

        <ambientLight intensity={0.75} />
        <directionalLight position={[6, 8, 6]} intensity={1.2} color="#ffffff" />
        <directionalLight position={[-6, -4, -4]} intensity={0.45} color="#fed7aa" />

        <Suspense fallback={null}>
          <CameraRig scroll={scrollProgress} />
          <ShieldCore scroll={scrollProgress} />
          <DataParticles scroll={scrollProgress} />
          <GridFloor scroll={scrollProgress} />
        </Suspense>
      </Canvas>
    </div>
  );
}
