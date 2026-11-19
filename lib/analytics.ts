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
  });
}

/**
 * Snack Finder events (components/quiz/*). Kept deliberately simple — plain
 * GA4 custom events, same pattern as trackAmazonClick above — so "which
 * goals/diets/budgets people actually pick" shows up in existing GA4
 * reporting without any new analytics infrastructure. This is the signal
 * referenced in the decision log for future own-brand demand validation.
 */
export function trackSnackFinderCompleted(params: {
  mode: "match" | "upgrade";
  goal: string;
  dietTags?: string[];
  calorieBand?: string;
  budgetBand?: string;
  resultCount: number;
}) {
  if (typeof window === "undefined" || !window.gtag) return;

  window.gtag("event", "snack_finder_completed", {
    event_category: "SnackFinder",
    event_label: params.mode,
    mode: params.mode,
    goal: params.goal,
    diet_tags: params.dietTags?.join(",") || undefined,
    calorie_band: params.calorieBand,
    budget_band: params.budgetBand,
    result_count: params.resultCount,
  });
}

export function trackSnackEmailSignup(params: {
  mode: "match" | "upgrade";
  newsletterOptIn: boolean;
}) {
  if (typeof window === "undefined" || !window.gtag) return;

  window.gtag("event", "snack_email_signup", {
    event_category: "SnackFinder",
    event_label: params.mode,
    mode: params.mode,
    newsletter_opt_in: params.newsletterOptIn,
  });
}
