import { useState, useEffect, useRef } from 'react';

/**
 * useCountUp
 * Smoothly animates a numeric value from its previous value to a target value.
 * Respects prefers-reduced-motion and finishes within 500-800ms.
 *
 * @param {number} targetValue - Authoritative numerical target
 * @param {number} duration - Animation duration in ms (default 650ms)
 * @returns {number} Current animated value
 */
export function useCountUp(targetValue, duration = 650) {
  const target = Number.isFinite(Number(targetValue)) ? Number(targetValue) : 0;
  const [displayValue, setDisplayValue] = useState(target);
  const prevTargetRef = useRef(target);
  const animRef = useRef(null);

  useEffect(() => {
    // Check for prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setDisplayValue(target);
      prevTargetRef.current = target;
      return;
    }

    const startValue = prevTargetRef.current;
    if (startValue === target) {
      setDisplayValue(target);
      return;
    }

    const startTime = performance.now();
    const change = target - startValue;

    // Ease-out cubic easing
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);

      const current = Math.round(startValue + change * easedProgress);
      setDisplayValue(current);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(step);
      } else {
        setDisplayValue(target);
        prevTargetRef.current = target;
      }
    };

    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
    }
    animRef.current = requestAnimationFrame(step);

    return () => {
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
      }
    };
  }, [target, duration]);

  return displayValue;
}

export default useCountUp;
