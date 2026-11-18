/**
 * Picks the USDA FoodData Central record that best matches one of our
 * products. Pure functions; tested in tests/match.test.ts.
 */

export type FdcCandidate = {
  fdcId: number
  description: string
  brandOwner?: string
  brandName?: string
  gtinUpc?: string
  publishedDate?: string
}

const STOP = new Set([
  "protein", "bar", "bars", "snack", "snacks", "the", "with", "and", "of", "high", "per",
  "count", "pack", "ct", "oz", "g", "flavor", "flavored", "nutrition", "foods", "food",
  "inc", "llc", "co", "company", "brand", "brands", "original", "a", "in", "by",
])

export function tokens(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter((t) => t.length > 1)
}

const singular = (t: string) => (t.length > 3 && t.endsWith("s") ? t.slice(0, -1) : t)

function contains(haystack: Set<string>, token: string) {
  return haystack.has(token) || haystack.has(singular(token)) || haystack.has(`${token}s`)
}

/** Brand words that identify the maker, e.g. "Quest Nutrition" -> ["quest"]. */
export function brandTokens(brand: string): string[] {
  return tokens(brand).filter((t) => !STOP.has(t) && t.length >= 3)
}

/** The words that identify the specific product: flavour, format, size. */
export function productTokens(name: string, brand: string): string[] {
  const b = new Set(brandTokens(brand))
  return Array.from(new Set(tokens(name).filter((t) => !STOP.has(t) && !b.has(t))))
}

export function scoreCandidate(
  product: { name: string; brand: string },
  c: FdcCandidate,
): { score: number; brandOk: boolean } {
  const text = new Set(tokens(`${c.description} ${c.brandName ?? ""} ${c.brandOwner ?? ""}`))
  const brandText = new Set(tokens(`${c.brandName ?? ""} ${c.brandOwner ?? ""} ${c.description}`))
  const brandOk = brandTokens(product.brand).some((t) => contains(brandText, t))
  const want = productTokens(product.name, product.brand)
  if (want.length === 0) return { score: 0, brandOk }
  const found = want.filter((t) => contains(text, t)).length
  return { score: found / want.length, brandOk }
}

export type MatchResult = {
  best: FdcCandidate | null
  confident: boolean
  reason: string
  ranked: Array<FdcCandidate & { score: number; brandOk: boolean }>
}

export function pickBest(product: { name: string; brand: string }, candidates: FdcCandidate[]): MatchResult {
  const ranked = candidates
    .map((c) => ({ ...c, ...scoreCandidate(product, c) }))
    .filter((c) => c.brandOk)
    .sort(
      (a, b) =>
        b.score - a.score ||
        Number(Boolean(b.gtinUpc)) - Number(Boolean(a.gtinUpc)) ||
        (b.publishedDate ?? "").localeCompare(a.publishedDate ?? ""),
    )
  const best = ranked[0] ?? null
  if (!best) return { best: null, confident: false, reason: "No candidate from the same brand.", ranked }
  const confident = best.score >= 0.75
  return {
    best,
    confident,
    reason: confident
      ? `Brand matches and ${Math.round(best.score * 100)}% of product words found.`
      : `Only ${Math.round(best.score * 100)}% of product words found; needs a person to confirm.`,
    ranked,
  }
}

/** Barcode forms to try on Open Food Facts (12-digit UPC, 13-digit EAN). */
export function barcodeVariants(gtin: string): string[] {
  const digits = gtin.replace(/\D/g, "").replace(/^0+/, "")
  if (!digits) return []
  const out = new Set<string>()
  for (const len of [12, 13, 8, 14]) {
    if (digits.length <= len) out.add(digits.padStart(len, "0"))
  }
  out.add(digits)
  return Array.from(out)
}
