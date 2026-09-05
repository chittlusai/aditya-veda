/* ═══════════════════════════════════════════════
   Atomic UI Component Library
   Following atomic design: atoms → molecules → organisms
   ═══════════════════════════════════════════════ */

import { type ReactNode } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Loader2 } from 'lucide-react';

/* ── Reveal — Scroll-triggered entrance ──────── */
export function Reveal({
  children,
  delay = 0,
  direction = 'up',
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  const offsets = {
    up:    { y: 50 },
    down:  { y: -50 },
    left:  { x: 50 },
    right: { x: -50 },
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...offsets[direction] }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── SectionHeader — Consistent section titles ── */
export function SectionHeader({
  label,
  title,
  titleAccent,
  description,
}: {
  label: string;
  title: string;
  titleAccent?: string;
  description?: string;
}) {
  return (
    <Reveal>
      <div className="text-center mb-16 md:mb-20">
        <p className="section-label mb-4">{label}</p>
        <h2 className="section-title">
          {title}
          {titleAccent && (
            <>
              {' '}<span className="gradient-text">{titleAccent}</span>
            </>
          )}
        </h2>
        {description && (
          <p className="text-[var(--color-foreground-muted)] mt-5 max-w-xl mx-auto text-lg leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </Reveal>
  );
}

/* ── GlowCard — Interactive card with glow ───── */
export function GlowCard({
  children,
  className = '',
  onClick,
  as = 'div',
  ariaLabel,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  as?: 'div' | 'button';
  ariaLabel?: string;
}) {
  const Comp = as === 'button' ? motion.button : motion.div;

  return (
    <Comp
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={`card ${onClick ? 'cursor-pointer' : ''} ${className}`}
      aria-label={ariaLabel}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </Comp>
  );
}

/* ── IconBox — Themed icon container ─────────── */
export function IconBox({
  children,
  size = 'md',
  variant = 'primary',
}: {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'glass';
}) {
  const sizes = { sm: 'w-10 h-10', md: 'w-12 h-12', lg: 'w-16 h-16' };
  const variants = {
    primary: 'bg-gradient-to-br from-[var(--color-primary)]/15 to-transparent',
    glass: 'glass',
  };

  return (
    <div className={`${sizes[size]} rounded-xl ${variants[variant]} flex items-center justify-center transition-transform group-hover:scale-110`}>
      {children}
    </div>
  );
}

/* ── AnimatedCounter ─────────────────────────── */
export function AnimatedCounter({ end, className = '' }: { end: string; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  // Simple: just show the final value with a fade-in
  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={className}
    >
      {end}
    </motion.span>
  );
}

/* ── Loading Spinner ─────────────────────────── */
export function Spinner({ size = 18 }: { size?: number }) {
  return <Loader2 size={size} className="animate-spin" aria-hidden="true" />;
}

/* ── SkeletonBlock — Loading placeholder ──────── */
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`shimmer rounded-lg bg-slate-200/70 ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

/* ── ScrollIndicator — Bouncing scroll hint ──── */
export function ScrollIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2 }}
      className="flex flex-col items-center gap-2"
      aria-hidden="true"
    >
      <span className="text-[10px] text-[var(--color-foreground-muted)] uppercase tracking-[0.2em] font-medium">
        Scroll to explore
      </span>
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        className="w-5 h-8 border border-[var(--color-border)] rounded-full flex items-start justify-center pt-2"
      >
        <div className="w-1 h-1.5 bg-[var(--color-primary)] rounded-full" />
      </motion.div>
    </motion.div>
  );
}
