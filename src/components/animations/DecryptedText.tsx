import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

interface DecryptedTextProps extends HTMLMotionProps<'span'> {
  text: string;
  speed?: number;
  maxIterations?: number;
  sequential?: boolean;
  revealDirection?: 'start' | 'end' | 'center';
  useOriginalCharsOnly?: boolean;
  characters?: string;
  className?: string;
  encryptedClassName?: string;
  parentClassName?: string;
  animateOn?: 'view' | 'hover' | 'inViewHover' | 'click';
  clickMode?: 'once' | 'toggle';
}

type Direction = 'forward' | 'reverse';

export default function DecryptedText({
  text,
  speed = 50,
  maxIterations = 10,
  sequential = false,
  revealDirection = 'start',
  useOriginalCharsOnly = false,
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+',
  className = '',
  parentClassName = '',
  encryptedClassName = '',
  animateOn = 'hover',
  clickMode = 'once',
  ...props
}: DecryptedTextProps) {
  const [displayText, setDisplayText] = useState<string>(text);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());
  const [hasAnimated, setHasAnimated] = useState<boolean>(false);
  const [isDecrypted, setIsDecrypted] = useState<boolean>(animateOn !== 'click');
  const [, setDirection] = useState<Direction>('forward');

  const containerRef = useRef<HTMLSpanElement>(null);
  const orderRef = useRef<number[]>([]);
  const pointerRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const availableChars = useMemo<string[]>(() => {
    return useOriginalCharsOnly
      ? Array.from(new Set(text.split(''))).filter(char => char !== ' ')
      : characters.split('');
  }, [useOriginalCharsOnly, text, characters]);

  const shuffleText = useCallback(
    (originalText: string, currentRevealed: Set<number>) => {
      return originalText
        .split('')
        .map((char, i) => {
          if (char === ' ') return ' ';
          if (currentRevealed.has(i)) return originalText[i];
          const randomIndex = Math.floor(Math.random() * availableChars.length);
          return availableChars[randomIndex];
        })
        .join('');
    },
    [availableChars]
  );

  const getNextIndex = useCallback(() => {
    const textLength = text.length;
    switch (revealDirection) {
      case 'start':
        return pointerRef.current++;
      case 'end':
        return textLength - 1 - pointerRef.current++;
      case 'center': {
        const middle = Math.floor(textLength / 2);
        const offset = Math.floor(pointerRef.current / 2);
        const nextIndex = pointerRef.current % 2 === 0 ? middle + offset : middle - offset;
        pointerRef.current++;
        return nextIndex;
      }
      default:
        return pointerRef.current++;
    }
  }, [revealDirection, text.length]);

  const generateRandomOrder = useCallback(() => {
    const indices = Array.from({ length: text.length }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  }, [text.length]);

  const startAnimation = useCallback(
    (dir: Direction = 'forward') => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsAnimating(true);
      setDirection(dir);

      if (dir === 'forward') {
        pointerRef.current = 0;
        orderRef.current = sequential ? [] : generateRandomOrder();
        setRevealedIndices(new Set());
      } else {
        pointerRef.current = 0;
        orderRef.current = sequential ? [] : generateRandomOrder();
        setRevealedIndices(new Set(Array.from({ length: text.length }, (_, i) => i)));
      }

      let iteration = 0;

      intervalRef.current = setInterval(() => {
        setRevealedIndices(prev => {
          const next = new Set(prev);

          if (dir === 'forward') {
            if (sequential) {
              const nextIndex = getNextIndex();
              if (nextIndex < text.length && nextIndex >= 0) {
                next.add(nextIndex);
              }
            } else {
              if (pointerRef.current < orderRef.current.length) {
                next.add(orderRef.current[pointerRef.current++]);
              }
            }

            if (next.size >= text.length) {
              clearInterval(intervalRef.current!);
              setIsAnimating(false);
              setDisplayText(text);
              setIsDecrypted(true);
              return next;
            }
          } else {
            if (sequential) {
              const nextIndex = getNextIndex();
              if (nextIndex < text.length && nextIndex >= 0) {
                next.delete(nextIndex);
              }
            } else {
              if (pointerRef.current < orderRef.current.length) {
                next.delete(orderRef.current[pointerRef.current++]);
              }
            }

            if (next.size === 0) {
              clearInterval(intervalRef.current!);
              setIsAnimating(false);
              setDisplayText(shuffleText(text, new Set()));
              setIsDecrypted(false);
              return next;
            }
          }

          setDisplayText(shuffleText(text, next));
          return next;
        });

        iteration++;
        if (iteration >= maxIterations && !sequential) {
          clearInterval(intervalRef.current!);
          setIsAnimating(false);
          setDisplayText(dir === 'forward' ? text : shuffleText(text, new Set()));
          setIsDecrypted(dir === 'forward');
        }
      }, speed);
    },
    [text, sequential, generateRandomOrder, getNextIndex, maxIterations, speed, shuffleText]
  );

  useEffect(() => {
    if (animateOn === 'view') {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !hasAnimated) {
            startAnimation('forward');
            setHasAnimated(true);
          }
        },
        { threshold: 0.1 }
      );

      if (containerRef.current) observer.observe(containerRef.current);
      return () => observer.disconnect();
    }
  }, [animateOn, hasAnimated, startAnimation]);

  const handleMouseEnter = () => {
    if (animateOn === 'hover' || animateOn === 'inViewHover') {
      startAnimation('forward');
    }
  };

  const handleClick = () => {
    if (animateOn === 'click') {
      if (clickMode === 'toggle') {
        startAnimation(isDecrypted ? 'reverse' : 'forward');
      } else if (!hasAnimated) {
        startAnimation('forward');
        setHasAnimated(true);
      }
    }
  };

  return (
    <motion.span
      ref={containerRef}
      className={`inline-block whitespace-pre-wrap ${parentClassName}`}
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
      {...props}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {displayText.split('').map((char, index) => {
          const isRevealed = revealedIndices.has(index);
          return (
            <span
              key={index}
              className={isRevealed || !isAnimating ? className : encryptedClassName}
            >
              {char}
            </span>
          );
        })}
      </span>
    </motion.span>
  );
}
