import React, { useRef, useState, useCallback } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

interface Tilted3DCardProps {
  children: React.ReactNode;
  className?: string;
  maxAngle?: number;
  scaleOnHover?: number;
  spotlightColor?: string;
  onClick?: () => void;
  ariaLabel?: string;
}

export default function Tilted3DCard({
  children,
  className = '',
  maxAngle = 12,
  scaleOnHover = 1.02,
  spotlightColor = 'rgba(249, 115, 22, 0.15)',
  onClick,
  ariaLabel,
}: Tilted3DCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const springConfig = { damping: 20, stiffness: 200, mass: 0.5 };
  const rawRotateX = useMotionValue(0);
  const rawRotateY = useMotionValue(0);
  const rotateX = useSpring(rawRotateX, springConfig);
  const rotateY = useSpring(rawRotateY, springConfig);
  const scale = useSpring(1, springConfig);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calculate tilt angles (-maxAngle to +maxAngle)
      const rX = -((y - centerY) / centerY) * maxAngle;
      const rY = ((x - centerX) / centerX) * maxAngle;

      rawRotateX.set(rX);
      rawRotateY.set(rY);

      // Fast zero-re-render glare positioning via CSS variable
      cardRef.current.style.setProperty('--glare-x', `${(x / rect.width) * 100}%`);
      cardRef.current.style.setProperty('--glare-y', `${(y / rect.height) * 100}%`);
    },
    [maxAngle, rawRotateX, rawRotateY]
  );

  const handleMouseEnter = () => {
    setIsHovered(true);
    scale.set(scaleOnHover);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    rawRotateX.set(0);
    rawRotateY.set(0);
    scale.set(1);
  };

  return (
    <div
      style={{ perspective: 1000 }}
      className="w-full h-full"
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        aria-label={ariaLabel}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        style={{
          rotateX,
          rotateY,
          scale,
          transformStyle: 'preserve-3d',
        }}
        className={`relative w-full h-full rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-2xl hover:shadow-orange-500/10 transition-shadow duration-300 overflow-hidden select-none cursor-pointer ${className}`}
      >
        {/* Dynamic 3D Specular Glare */}
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-300 ease-out z-20 rounded-2xl"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(circle at var(--glare-x, 50%) var(--glare-y, 50%), ${spotlightColor} 0%, rgba(255,255,255,0) 65%)`,
          }}
        />

        {/* 3D Content Container with Z-Depth */}
        <div
          style={{ transform: 'translateZ(20px)' }}
          className="relative z-10 w-full h-full"
        >
          {children}
        </div>
      </motion.div>
    </div>
  );
}
