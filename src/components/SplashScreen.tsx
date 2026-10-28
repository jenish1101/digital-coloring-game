"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const SPLASH_KEY = "cmw:splash-500-seen";

function rememberSplash() {
  try { window.sessionStorage.setItem(SPLASH_KEY, "1"); } catch { /* Storage is optional. */ }
}

/** Shared illustrated loading screen, also used by Next's route loading boundary. */
export function SplashVisual({ progress, onSkip }: { progress?: number; onSkip?: () => void }) {
  const message = progress === undefined ? "Opening your colouring book..." : progress < 35 ? "Gathering the crayons..." : progress < 70 ? "Mixing a little magic..." : progress < 100 ? "Unwrapping 500 pages..." : "Ready to make a masterpiece!";

  return (
    <div className={`splash-screen ${onSkip ? "splash-screen-intro" : ""}`} role="status" aria-live="polite" aria-label="Loading Color My World">
      <div className="splash-confetti" aria-hidden="true">
        <span className="splash-doodle splash-doodle-one">✦</span>
        <span className="splash-doodle splash-doodle-two">✿</span>
        <span className="splash-doodle splash-doodle-three">✳</span>
        <span className="splash-doodle splash-doodle-four">★</span>
        <span className="splash-blob splash-blob-one" />
        <span className="splash-blob splash-blob-two" />
        <span className="splash-blob splash-blob-three" />
        <span className="splash-blob splash-blob-four" />
      </div>

      <div className="splash-card">
        <div className="splash-card-stripe" />
        <div className="splash-card-inner">
          <div className="splash-brand" aria-label="Jenish JG presents">
            <span className="splash-monogram" aria-hidden="true">
              <span className="splash-monogram-ring" />
              <span className="splash-monogram-j">J</span>
              <span className="splash-monogram-g">G</span>
            </span>
            <span className="splash-brand-text" aria-hidden="true">
              <span className="splash-brand-name">
                {"Jenish".split("").map((letter, i) => (
                  <span key={i} style={{ animationDelay: `${380 + i * 75}ms` }}>{letter}</span>
                ))}
              </span>
              <span className="splash-brand-tag">presents</span>
            </span>
          </div>
          <div className="splash-eyebrow"><span>✦</span> A LITTLE WORLD OF BIG IDEAS <span>✦</span></div>
          <div className="splash-art" aria-hidden="true">
            <div className="splash-art-orbit splash-art-orbit-one" />
            <div className="splash-art-orbit splash-art-orbit-two" />
            <svg viewBox="0 0 250 215" className="splash-palette" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="121" cy="186" rx="86" ry="12" fill="#20263d" opacity=".12" />
              <path d="M41 101 C41 54 77 23 126 23 C173 23 209 51 210 93 C211 124 193 145 165 146 C149 147 143 153 141 166 C139 178 128 183 112 180 C73 175 41 146 41 101 Z" fill="#FFE7B3" stroke="#20263d" strokeWidth="5" strokeLinejoin="round" />
              <circle cx="77" cy="74" r="13" fill="#FF7187" stroke="#20263d" strokeWidth="3.5" />
              <circle cx="108" cy="53" r="13" fill="#FFBD3C" stroke="#20263d" strokeWidth="3.5" />
              <circle cx="145" cy="54" r="13" fill="#77D9B0" stroke="#20263d" strokeWidth="3.5" />
              <circle cx="178" cy="75" r="13" fill="#83C9FC" stroke="#20263d" strokeWidth="3.5" />
              <circle cx="184" cy="112" r="13" fill="#C4A1FF" stroke="#20263d" strokeWidth="3.5" />
              <ellipse cx="112" cy="151" rx="18" ry="13" fill="#FFF6E6" stroke="#20263d" strokeWidth="3.5" />
              <circle cx="94" cy="110" r="3.5" fill="#20263d" /><circle cx="131" cy="110" r="3.5" fill="#20263d" />
              <ellipse cx="82" cy="120" rx="6" ry="3.5" fill="#FF9BAA" /><ellipse cx="142" cy="120" rx="6" ry="3.5" fill="#FF9BAA" />
              <path d="M102 124 Q112 134 123 124" fill="none" stroke="#20263d" strokeWidth="3" strokeLinecap="round" />
              <g className="splash-brush">
                <path d="M158 155 L216 27 Q219 21 224 24 Q230 27 227 33 L176 165 Z" fill="#8B5CFF" stroke="#20263d" strokeWidth="4" strokeLinejoin="round" />
                <path d="M159 149 L178 157 L174 168 L155 160 Z" fill="#FFC93C" stroke="#20263d" strokeWidth="4" />
                <path d="M155 158 Q171 160 173 170 Q171 183 151 190 Q155 181 150 176 Q146 168 155 158 Z" fill="#FF6A7E" stroke="#20263d" strokeWidth="4" strokeLinejoin="round" />
              </g>
              <path d="M28 41 L31 48 L38 51 L31 54 L28 61 L25 54 L18 51 L25 48 Z" fill="#FFC93C" stroke="#20263d" strokeWidth="2.5" />
              <path d="M218 105 L221 112 L228 115 L221 118 L218 125 L215 118 L208 115 L215 112 Z" fill="#FF8FC7" stroke="#20263d" strokeWidth="2.5" />
            </svg>
            <span className="splash-mini-badge splash-mini-badge-left">500<br /><small>PAGES</small></span>
            <span className="splash-mini-badge splash-mini-badge-right">✦</span>
          </div>
          <h1 className="splash-title">Color My <span>World</span><span className="splash-title-dot">.</span></h1>
          <p className="splash-subtitle">A little colour makes everything brighter.</p>
          <div className="splash-progress" role="progressbar" aria-label="Preparing your coloring studio" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
            <div className={`splash-progress-fill ${progress === undefined ? "splash-progress-indeterminate" : ""}`} style={progress === undefined ? undefined : { width: `${progress}%` }} />
          </div>
          <div className="splash-loading-line"><span>{message}</span><span>{progress === undefined ? "✦" : `${progress}%`}</span></div>
          {onSkip ? <button type="button" className="splash-skip" onClick={onSkip}>Skip intro <span aria-hidden="true">→</span></button> : null}
        </div>
      </div>
      <p className="splash-footer">DEVELOPED &amp; MAINTAINED BY <strong>JENISH GONDALIYA</strong> <span>♥</span></p>
    </div>
  );
}

/** Display once per tab session; always allow a skip and cap the wait for slow assets. */
export function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(4);
  const timer = useRef<number | null>(null);
  const closeTimer = useRef<number | null>(null);

  const dismiss = useCallback(() => {
    if (timer.current !== null) window.clearInterval(timer.current);
    if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    rememberSplash();
    setVisible(false);
  }, []);

  /** Always fill the bar to 100% and let it be seen there before the splash closes. */
  const finish = useCallback((hold: number) => {
    if (timer.current !== null) window.clearInterval(timer.current);
    timer.current = null;
    if (closeTimer.current !== null) return;
    setProgress(100);
    closeTimer.current = window.setTimeout(dismiss, hold);
  }, [dismiss]);

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(SPLASH_KEY) === "1") {
        setVisible(false);
        return;
      }
    } catch { /* Show it when session storage is unavailable. */ }

    let loaded = document.readyState === "complete";
    const onLoad = () => { loaded = true; };
    window.addEventListener("load", onLoad);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const minimum = reduced ? 350 : 2100;
    const started = performance.now();
    timer.current = window.setInterval(() => {
      const elapsed = performance.now() - started;
      // Reach 90% by the minimum time, then keep creeping toward 99% while assets finish.
      const next = elapsed < minimum
        ? 4 + (elapsed / minimum) * 86
        : 90 + 9 * (1 - Math.exp(-(elapsed - minimum) / 1200));
      setProgress((prev) => Math.max(prev, Math.min(99, Math.round(next))));
      if ((loaded && elapsed >= minimum) || elapsed > 6000) finish(reduced ? 250 : 700);
    }, 65);
    return () => {
      window.removeEventListener("load", onLoad);
      if (timer.current !== null) window.clearInterval(timer.current);
      if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    };
  }, [finish]);

  useEffect(() => {
    if (!visible) return;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = old; };
  }, [visible]);

  return visible ? <SplashVisual progress={progress} onSkip={() => finish(350)} /> : null;
}
