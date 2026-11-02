'use client';

import React, { useEffect, useState, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function NavigationProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // When pathname or searchParams change, complete the progress bar
  useEffect(() => {
    if (loading) {
      setProgress(100);
      const timer = setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  // Intercept all internal anchor clicks for instant 0ms user feedback
  useEffect(() => {
    const handleAnchorClick = (event: MouseEvent) => {
      const target = (event.target as HTMLElement).closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      const isExternal = target.getAttribute('target') === '_blank' || target.getAttribute('rel')?.includes('external');
      const isAnchorOnly = href?.startsWith('#') || href?.startsWith('mailto:') || href?.startsWith('tel:');

      if (href && !isExternal && !isAnchorOnly) {
        const currentUrl = window.location.pathname + window.location.search;
        if (href !== currentUrl) {
          // Trigger immediate visual progress bar
          setLoading(true);
          setProgress(25);

          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = setInterval(() => {
            setProgress((prev) => {
              if (prev >= 85) {
                if (timerRef.current) clearInterval(timerRef.current);
                return 85;
              }
              return prev + Math.random() * 18;
            });
          }, 120);
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => {
      document.removeEventListener('click', handleAnchorClick);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (!loading && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999999] pointer-events-none transition-all duration-200"
      style={{
        opacity: loading || progress > 0 ? 1 : 0,
      }}
    >
      <div
        className="h-[3px] bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-300 transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          boxShadow: '0 0 12px rgba(16, 185, 129, 0.9), 0 0 6px rgba(13, 148, 136, 0.7)',
        }}
      />
    </div>
  );
}

