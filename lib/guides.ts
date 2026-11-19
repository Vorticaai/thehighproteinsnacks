import { getAllProducts, type Product } from "@/lib/products"

/**
 * Shared helpers for /guides pages. Kept here (not in data/guides.ts, which
 * is pure content) so both the guides index and the guide detail page use
 * the same logic instead of two copies that can drift.
 */

/** Resolves a guide's recommendedSnackIds to real, current products, in order. */
export function resolveGuideProducts(ids: string[]): Product[] {
  const byId = new Map(getAllProducts().map((p) => [p.id, p]))
  return ids.map((id) => byId.get(id)).filter((p): p is Product => Boolean(p))
}

// Two data/guides.ts slugs permanently redirect to the standalone
// "best-high-protein-snacks-for-*" pages (see next.config.mjs) because they
// duplicated those pages' search intent under a second URL. Link straight to
// the real destination instead of sending the visitor through the redirect.
const REDIRECTED_GUIDE_HREFS: Record<string, string> = {
  "best-high-protein-snacks-for-weight-loss": "/best-high-protein-snacks-for-weight-loss",
  "best-keto-snacks": "/best-high-protein-snacks-for-keto",
}

export function guideHref(slug: string): string {
  return REDIRECTED_GUIDE_HREFS[slug] ?? `/guides/${slug}`
}
