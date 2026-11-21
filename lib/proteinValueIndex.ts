import type { Product } from "@/lib/products"

/**
 * The Protein Value Index: every product with a recorded price, ranked by
 * grams of protein per dollar (descending). Unlike /snacks/best-value (which
 * only lists products clearing the "Best Value" category threshold), this
 * ranks the entire catalogue so a reader can see exactly where any snack
 * sits, not just whether it qualifies for one label.
 *
 * Kept as pure, unit-tested functions (same split as lib/categorySort.ts and
 * lib/snackMatch.ts) so the page component stays a thin render layer.
 */

export type ValueIndexEntry = {
  product: Product
  rank: number
}

export function buildValueIndex(products: Product[]): ValueIndexEntry[] {
  return [...products]
    .filter((p) => p.pricePerServing > 0)
    .sort((a, b) => b.proteinPerDollar - a.proteinPerDollar)
    .map((product, i) => ({ product, rank: i + 1 }))
}

export type ValueIndexStats = {
  /** Products included in the index (priced products only). */
  count: number
  verifiedCount: number
  best: Product | null
  /** Lowest protein-per-dollar among priced products — priciest per gram of protein. */
  priciest: Product | null
  median: number
  average: number
  /** best.proteinPerDollar / priciest.proteinPerDollar, rounded to 1 decimal. */
  spreadMultiple: number | null
  bestBar: Product | null
  bestChips: Product | null
}

function bestByValue(products: Product[]): Product | null {
  if (products.length === 0) return null
  return [...products].sort((a, b) => b.proteinPerDollar - a.proteinPerDollar)[0]
}

export function computeValueIndexStats(entries: ValueIndexEntry[]): ValueIndexStats {
  const products = entries.map((e) => e.product)
  const count = products.length

  if (count === 0) {
    return {
      count: 0,
      verifiedCount: 0,
      best: null,
      priciest: null,
      median: 0,
      average: 0,
      spreadMultiple: null,
      bestBar: null,
      bestChips: null,
    }
  }

  const verifiedCount = products.filter((p) => p.verification.status === "verified").length
  // entries are already sorted protein-per-dollar descending.
  const best = products[0]
  const priciest = products[products.length - 1]

  const values = products.map((p) => p.proteinPerDollar).sort((a, b) => a - b)
  const mid = Math.floor(values.length / 2)
  const median =
    values.length % 2 === 0 ? Number(((values[mid - 1] + values[mid]) / 2).toFixed(2)) : values[mid]
  const average = Number((values.reduce((sum, v) => sum + v, 0) / values.length).toFixed(2))

  const spreadMultiple =
    priciest.proteinPerDollar > 0 ? Number((best.proteinPerDollar / priciest.proteinPerDollar).toFixed(1)) : null

  const bestBar = bestByValue(products.filter((p) => p.flags.bars))
  const bestChips = bestByValue(products.filter((p) => p.flags.chips))

  return { count, verifiedCount, best, priciest, median, average, spreadMultiple, bestBar, bestChips }
}
