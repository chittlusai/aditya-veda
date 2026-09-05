
interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
  shineColor?: string;
}

export default function ShinyText({
  text,
  disabled = false,
  speed = 3,
  className = '',
  shineColor = 'rgba(255, 255, 255, 0.95)',
}: ShinyTextProps) {
  if (disabled) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span
      className={`inline-block font-semibold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 via-amber-400 to-orange-600 bg-[length:200%_auto] ${className}`}
      style={{
        animation: `shimmer ${speed}s linear infinite`,
        backgroundImage: `linear-gradient(90deg, #ea580c 0%, ${shineColor} 50%, #ea580c 100%)`,
        backgroundSize: '200% 100%',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}
    >
      {text}
    </span>
  );
}
