import { useState, useEffect } from 'react';

interface GlitchTextProps {
  text: string;
  className?: string;
  glitchInterval?: number;
  hoverOnly?: boolean;
}

export default function GlitchText({
  text,
  className = '',
  glitchInterval = 3000,
  hoverOnly = false,
}: GlitchTextProps) {
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    if (hoverOnly) return;
    const interval = setInterval(() => {
      setIsGlitching(true);
      const timer = setTimeout(() => setIsGlitching(false), 350);
      return () => clearTimeout(timer);
    }, glitchInterval);

    return () => clearInterval(interval);
  }, [glitchInterval, hoverOnly]);

  return (
    <span
      onMouseEnter={() => setIsGlitching(true)}
      onMouseLeave={() => !hoverOnly && setIsGlitching(false)}
      className={`relative inline-block select-none font-bold ${className}`}
    >
      <span
        data-text={text}
        className={`inline-block transition-transform duration-150 ${isGlitching ? 'cyber-glitch-active' : ''}`}
      >
        {text}
      </span>
    </span>
  );
}
