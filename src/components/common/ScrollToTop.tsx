'use client';

import { useEffect, useRef, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function forceScrollTop() {
  if (typeof window === 'undefined') return;

  // Instant scroll on multiple layers
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'instant' as ScrollBehavior,
  });
  if (document.documentElement) {
    document.documentElement.scrollTop = 0;
  }
  if (document.body) {
    document.body.scrollTop = 0;
  }
}

function ScrollHandler() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prevPathRef = useRef<string | null>(null);

  // Set history scrollRestoration to manual on mount to prevent browser retaining previous scroll offsets
  useEffect(() => {
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // Handle route change
  useEffect(() => {
    const hash = window.location.hash;

    if (hash) {
      const targetElement = document.querySelector(hash);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }

    const currentUrl = `${pathname}${searchParams ? `?${searchParams.toString()}` : ''}`;

    if (prevPathRef.current !== currentUrl) {
      prevPathRef.current = currentUrl;

      // 1. Instant execution
      forceScrollTop();

      // 2. Next animation frame (after React commit)
      requestAnimationFrame(() => {
        forceScrollTop();
      });

      // 3. Short timeout fallback (after asynchronous layout shifts / image slots mount)
      const t1 = setTimeout(forceScrollTop, 20);
      const t2 = setTimeout(forceScrollTop, 100);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [pathname, searchParams]);

  // Global listener on link clicks
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (
        !href ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        target.target === '_blank' ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey
      ) {
        return;
      }

      try {
        const url = new URL(href, window.location.origin);
        if (url.origin === window.location.origin) {
          // If navigating to different page or query, trigger scroll top immediately
          forceScrollTop();
        }
      } catch {
        // Ignore invalid URLs
      }
    };

    document.addEventListener('click', handleLinkClick, { capture: true, passive: true });
    return () => {
      document.removeEventListener('click', handleLinkClick, { capture: true });
    };
  }, []);

  return null;
}

export function ScrollToTop() {
  return (
    <Suspense fallback={null}>
      <ScrollHandler />
    </Suspense>
  );
}

