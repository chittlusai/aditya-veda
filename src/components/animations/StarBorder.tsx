import React from 'react';

interface StarBorderProps {
  as?: 'button' | 'div';
  className?: string;
  children?: React.ReactNode;
  color?: string;
  speed?: string;
  thickness?: number;
  backgroundColor?: string;
  borderColor?: string;
  onClick?: () => void;
}

export default function StarBorder({
  as = 'div',
  className = '',
  color = '#f97316',
  speed = '5s',
  thickness = 2,
  backgroundColor = '#ffffff',
  borderColor = 'rgba(226, 232, 240, 0.9)',
  children,
  onClick,
}: StarBorderProps) {
  const Component = as === 'button' ? 'button' : 'div';

  return (
    <Component
      onClick={onClick}
      className={`relative inline-block overflow-hidden rounded-2xl shadow-lg shadow-slate-200/50 ${className}`}
      style={{
        padding: `${thickness}px`,
      }}
    >
      <style>{`
        @keyframes star-movement-bottom {
          0% { transform: translate(0%, 0%); opacity: 1; }
          100% { transform: translate(-100%, 0%); opacity: 0; }
        }
        @keyframes star-movement-top {
          0% { transform: translate(0%, 0%); opacity: 1; }
          100% { transform: translate(100%, 0%); opacity: 0; }
        }
        .star-border-glow-bottom {
          animation: star-movement-bottom ${speed} linear infinite alternate;
        }
        .star-border-glow-top {
          animation: star-movement-top ${speed} linear infinite alternate;
        }
      `}</style>
      <div
        className="absolute w-[250%] h-[100%] opacity-80 -bottom-6 -right-1/2 rounded-full star-border-glow-bottom pointer-events-none z-0"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 60%)`,
        }}
      />
      <div
        className="absolute w-[250%] h-[100%] opacity-80 -top-6 -left-1/2 rounded-full star-border-glow-top pointer-events-none z-0"
        style={{
          background: `radial-gradient(circle, #0284c7, transparent 60%)`,
        }}
      />
      <div
        className="relative z-10 rounded-2xl w-full h-full"
        style={{ background: backgroundColor, border: `1px solid ${borderColor}` }}
      >
        {children}
      </div>
    </Component>
  );
}
