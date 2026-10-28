"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { InstallIcon } from "./Icons";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/* The browser fires beforeinstallprompt once, often before the header mounts, so keep it at module level. */
let deferred: InstallPromptEvent | null = null;
let installed = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((fn) => fn());

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferred = event as InstallPromptEvent;
    emit();
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    installed = true;
    emit();
  });
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

type InstallState = "hidden" | "prompt" | "ios";

function snapshot(): InstallState {
  const standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  if (installed || standalone) return "hidden";
  if (deferred) return "prompt";
  const ua = navigator.userAgent;
  const ios = /iphone|ipad|ipod/i.test(ua) || (ua.includes("Macintosh") && navigator.maxTouchPoints > 1);
  return ios ? "ios" : "hidden";
}

/** Register the offline service worker in production builds. */
export function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => { /* Offline support is optional. */ });
  }, []);
  return null;
}

/** Header button: native install prompt on Chromium, Add-to-Home-Screen tip on iOS. */
export function InstallButton({ compact = false }: { compact?: boolean }) {
  const state = useSyncExternalStore(subscribe, snapshot, () => "hidden" as InstallState);
  const [tipOpen, setTipOpen] = useState(false);

  if (state === "hidden") return null;

  const install = async () => {
    if (state === "ios") {
      setTipOpen((open) => !open);
      return;
    }
    const event = deferred;
    if (!event) return;
    await event.prompt();
    const { outcome } = await event.userChoice;
    deferred = null;
    if (outcome === "accepted") installed = true;
    emit();
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={install}
        className={`btn flex items-center gap-1.5 bg-grape text-white ${compact ? "p-2" : "px-3 py-1.5 text-sm"}`}
        title="Install Color My World"
        aria-label="Install app"
        aria-expanded={state === "ios" ? tipOpen : undefined}
      >
        <InstallIcon width={compact ? 18 : 16} height={compact ? 18 : 16} />
        {compact ? null : <span className="hidden sm:inline">Install</span>}
      </button>
      {tipOpen ? (
        <div className="panel absolute right-0 top-full z-50 mt-2 w-60 bg-[#fffdf7] p-3 text-sm font-semibold" role="dialog" aria-label="How to install">
          <p className="font-display font-bold">Install on iPhone / iPad</p>
          <p className="mt-1 text-ink-soft">
            Tap <strong className="text-ink">Share</strong> in Safari, then choose{" "}
            <strong className="text-ink">Add to Home Screen</strong>.
          </p>
          <button type="button" className="mt-2 text-xs font-bold underline" onClick={() => setTipOpen(false)}>
            Got it
          </button>
        </div>
      ) : null}
    </div>
  );
}
