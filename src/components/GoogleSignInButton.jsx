import { useEffect, useRef, memo } from 'react';
import { initGoogleButtonInto } from '../lib/adminAuth';

// Isolated Google Sign-In button.
// Renders a container div that React never reconciles the children of —
// Google's GIS injects its own iframe/DOM into a child created via the DOM API,
// so React doesn't know about it and won't try to remove it on re-render.
function GoogleSignInButton({ onLogin, onError }) {
  const containerRef = useRef(null);
  // Keep latest callbacks in a ref so the effect runs only once.
  const cbRef = useRef({ onLogin, onError });
  cbRef.current = { onLogin, onError };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    // Create a child div via the DOM API — React never sees this, so it won't reconcile it.
    const host = document.createElement('div');
    container.appendChild(host);
    let cancelled = false;
    initGoogleButtonInto(
      host,
      (session) => { if (!cancelled) cbRef.current.onLogin(session); },
      (msg) => { if (!cancelled) cbRef.current.onError(msg); }
    );
    return () => {
      cancelled = true;
      if (container.contains(host)) container.removeChild(host);
    };
  }, []);

  return <div ref={containerRef} className="flex justify-center min-h-[44px]" />;
}

export default memo(GoogleSignInButton);
