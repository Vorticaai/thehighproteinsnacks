"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

type AdSlotProps = {
  /** The slot ID you get from AdSense for a specific ad unit */
  slot: string;
  className?: string;
  /** e.g. "auto" – AdSense usually recommends auto-responsive */
  format?: string;
  /** Keep responsive true by default */
  fullWidthResponsive?: boolean;
};

const ADSENSE_CLIENT = "ca-pub-4595892489334854";
const ADSENSE_ENABLED =
  process.env.NEXT_PUBLIC_ADSENSE_ENABLED === "true";


export function AdSlot({
  slot,
  className,
  format = "auto",
  fullWidthResponsive = true,
}: AdSlotProps) {
  const adRef = useRef<HTMLDivElement | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    // Don’t do anything on the server or without a client/slot
    if (typeof window === "undefined") return;
    if (!ADSENSE_CLIENT || !slot) return;
    if (!adRef.current) return;

    // In dev, React StrictMode runs effects twice. Avoid double-initializing.
    if (initializedRef.current) return;

    // If AdSense already marked this element as done, skip.
    const status = adRef.current.getAttribute("data-adsbygoogle-status");
    if (status === "done") {
      initializedRef.current = true;
      return;
    }

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      initializedRef.current = true;
    } catch (e) {
      // Swallow TagError in dev so the app doesn’t crash
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.warn("adsbygoogle push error", e);
      }
    }
  }, [slot]);

  // Before AdSense is configured or if slot is missing, render nothing
  if (!ADSENSE_ENABLED || !ADSENSE_CLIENT || !slot) return null;


  return (
    <ins
      // TypeScript doesn’t love HTMLInsElement, so cast is fine here
      ref={adRef as any}
      className={`adsbygoogle ${className ?? ""}`}
      style={{ display: "block" }}
      data-ad-client={ADSENSE_CLIENT}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={fullWidthResponsive ? "true" : "false"}
    />
  );
}
