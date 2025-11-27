// lib/analytics.ts

// Tell TypeScript about window.gtag so it doesn't complain
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export function trackAmazonClick(snackName: string, snackId: string) {
  if (typeof window === "undefined" || !window.gtag) return;

  window.gtag("event", "amazon_click", {
    event_category: "Affiliate",
    event_label: snackName,
    snack_id: snackId,
    debug_mode: true
  });
}
