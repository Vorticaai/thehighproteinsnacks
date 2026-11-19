import type { Product } from "@/lib/products"
import { categoryFilters } from "@/lib/categoryFilters"

/**
 * Deterministic matching/scoring engine behind the "Find My Match" and
 * "Upgrade My Snack" tools (components/quiz/*). No AI calls per visitor —
 * every result here is plain arithmetic over the same verified product data
 * and category rules used everywhere else on the site (lib/categoryFilters.ts
 * owns category membership; this file only adds goal-based ranking on top).
 */

export type MatchGoal = "lose-fat" | "build-muscle"

export type ProteinBand = 0 | 10 | 15 | 20 | 25

export type CalorieBand = "any" | "under150" | "150-220" | "220-280"

export type BudgetBand = "any" | "under150c" | "under250c"

export type DietTag = "vegan" | "keto" | "gluten-free" | "halal" | "low-sugar"

export const DIET_TAG_LABELS: Record<DietTag, string> = {
  vegan: "Vegan",
  keto: "Keto",
  "gluten-free": "Gluten-free",
  halal: "Halal",
  "low-sugar": "Low sugar",
}

export type MatchCriteria = {
  goal: MatchGoal
  minProtein: ProteinBand
  calorieBand: CalorieBand
  budgetBand: BudgetBand
  dietTags: DietTag[]
}

export const DEFAULT_CRITERIA: MatchCriteria = {
  goal: "build-muscle",
  minProtein: 0,
  calorieBand: "any",
  budgetBand: "any",
  dietTags: [],
}

function budgetMax(band: BudgetBand): number | null {
  switch (band) {
    case "under150c":
      return 1.5
    case "under250c":
      return 2.5
    default:
      return null
  }
}

function matchesCalorieBand(product: Product, band: CalorieBand): boolean {
  const c = product.caloriesPerServing
  switch (band) {
    case "under150":
      return c > 0 && c < 150
    case "150-220":
      return c >= 150 && c <= 220
    case "220-280":
      return c >= 220 && c <= 280
    default:
      return true
  }
}

function matchesDietTags(product: Product, tags: DietTag[]): boolean {
  return tags.every((tag) => categoryFilters[tag]?.(product) === true)
}

/**
 * How well a product serves a goal — higher is better. Both branches are
 * plain weighted arithmetic over fields every product already has.
 */
export function goalScore(product: Product, goal: MatchGoal): number {
  const protein = product.proteinPerServing
  const calories = Math.max(product.caloriesPerServing, 1)
  const fiber = product.fiberPerServing ?? 0
  const valueBonus = product.pricePerServing > 0 ? product.proteinPerDollar : 0

  if (goal === "build-muscle") {
    // Raw protein per serving matters most; value and low sugar break ties.
    return protein * 3 + valueBonus * 1.5 - product.sugarPerServing * 0.3
  }
  // lose-fat: reward protein density (protein per calorie) and fiber
  // (satiety), penalize sugar.
  return (protein / calories) * 300 + fiber * 2 - product.sugarPerServing * 0.5
}

/**
 * Top matches for a visitor's stated criteria. If the hard filters (calories,
 * budget) leave nothing, relaxes those two first before giving up — the diet
 * requirements and protein floor are the visitor's non-negotiable asks, so
 * those never get silently dropped.
 */
export function findMatches(
  products: Product[],
  criteria: MatchCriteria,
  limit = 5,
): { results: Product[]; relaxed: boolean } {
  const byDietAndProtein = (pool: Product[]) =>
    pool
      .filter((p) => p.proteinPerServing >= criteria.minProtein)
      .filter((p) => matchesDietTags(p, criteria.dietTags))

  const maxPrice = budgetMax(criteria.budgetBand)

  let pool = byDietAndProtein(products).filter((p) => matchesCalorieBand(p, criteria.calorieBand))
  if (maxPrice !== null) {
    pool = pool.filter((p) => p.pricePerServing > 0 && p.pricePerServing <= maxPrice)
  }

  let relaxed = false
  if (pool.length === 0) {
    pool = byDietAndProtein(products)
    relaxed = pool.length > 0
  }

  const results = [...pool].sort((a, b) => goalScore(b, criteria.goal) - goalScore(a, criteria.goal)).slice(0, limit)
  return { results, relaxed }
}

/** Short, deterministic, template-built reason a product made the list. */
export function explainMatch(product: Product, goal: MatchGoal): string {
  const bits: string[] = [`${product.proteinPerServing}g protein per serving`]
  if (goal === "lose-fat") {
    const ratio = (product.proteinPerServing / Math.max(product.caloriesPerServing, 1)) * 100
    bits.push(`${ratio.toFixed(0)}g protein per 100 calories`)
  } else {
    bits.push(`${product.caloriesPerServing} calories`)
  }
  if (product.pricePerServing > 0) {
    bits.push(`${product.proteinPerDollar.toFixed(1)}g protein per $`)
  }
  if (product.sugarPerServing <= 3) {
    bits.push(`only ${product.sugarPerServing}g sugar`)
  }
  return bits.join(" · ")
}

export type UpgradeDeltas = {
  protein: number
  calories: number
  sugar: number
  /** null when either product has no recorded price, so $/g can't be compared. */
  proteinPerDollar: number | null
}

export type Upgrade = {
  product: Product
  deltas: UpgradeDeltas
}

function deltasFrom(current: Product, candidate: Product): UpgradeDeltas {
  return {
    protein: candidate.proteinPerServing - current.proteinPerServing,
    calories: candidate.caloriesPerServing - current.caloriesPerServing,
    sugar: candidate.sugarPerServing - current.sugarPerServing,
    proteinPerDollar:
      candidate.pricePerServing > 0 && current.pricePerServing > 0
        ? Number((candidate.proteinPerDollar - current.proteinPerDollar).toFixed(1))
        : null,
  }
}

/**
 * Alternatives that genuinely score higher for this goal than the visitor's
 * current snack. Empty when their current pick is already at or near the top
 * — callers should treat that as a real, positive result, not an error.
 */
export function findUpgrades(current: Product, products: Product[], goal: MatchGoal, limit = 3): Upgrade[] {
  const currentScore = goalScore(current, goal)
  return products
    .filter((p) => p.id !== current.id)
    .map((p) => ({ product: p, score: goalScore(p, goal) }))
    .filter((entry) => entry.score > currentScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ product }) => ({ product, deltas: deltasFrom(current, product) }))
}

/** Simple in-memory name/brand search over the (small) live catalogue. */
export function searchProducts(products: Product[], query: string, limit = 8): Product[] {
  const q = query.trim().toLowerCase()
  if (q.length < 2) return []
  return products.filter((p) => `${p.brand} ${p.name}`.toLowerCase().includes(q)).slice(0, limit)
}

export const PROTEIN_BANDS: ProteinBand[] = [0, 10, 15, 20, 25]
export const CALORIE_BANDS: Array<{ value: CalorieBand; label: string }> = [
  { value: "any", label: "No preference" },
  { value: "under150", label: "Under 150 cal" },
  { value: "150-220", label: "150–220 cal" },
  { value: "220-280", label: "220–280 cal" },
]
export const BUDGET_BANDS: Array<{ value: BudgetBand; label: string }> = [
  { value: "any", label: "No budget limit" },
  { value: "under150c", label: "Under $1.50/serving" },
  { value: "under250c", label: "Under $2.50/serving" },
]
export const DIET_TAGS: DietTag[] = ["vegan", "keto", "gluten-free", "halal", "low-sugar"]

/**
 * Encodes/decodes MatchCriteria to/from URL query params so a "Find My
 * Match" result is a plain link (?mode=match&goal=...), not something that
 * needs a database row to "save". Revisiting it recomputes live against
 * current product data, so a saved link never goes stale the way a frozen
 * snapshot would.
 */
export function criteriaToSearchParams(criteria: MatchCriteria): URLSearchParams {
  const params = new URLSearchParams()
  params.set("mode", "match")
  params.set("goal", criteria.goal)
  params.set("protein", String(criteria.minProtein))
  params.set("calories", criteria.calorieBand)
  params.set("budget", criteria.budgetBand)
  if (criteria.dietTags.length > 0) params.set("diet", criteria.dietTags.join(","))
  return params
}

export function criteriaFromSearchParams(params: URLSearchParams): MatchCriteria | null {
  if (params.get("mode") !== "match") return null
  const goal = params.get("goal")
  if (goal !== "lose-fat" && goal !== "build-muscle") return null

  const proteinRaw = Number(params.get("protein"))
  const minProtein = PROTEIN_BANDS.includes(proteinRaw as ProteinBand) ? (proteinRaw as ProteinBand) : 0

  const calorieBand = params.get("calories")
  const validCalorieBand = CALORIE_BANDS.some((b) => b.value === calorieBand)
    ? (calorieBand as CalorieBand)
    : "any"

  const budgetBand = params.get("budget")
  const validBudgetBand = BUDGET_BANDS.some((b) => b.value === budgetBand) ? (budgetBand as BudgetBand) : "any"

  const dietTags = (params.get("diet")?.split(",").filter(Boolean) ?? []).filter((t): t is DietTag =>
    DIET_TAGS.includes(t as DietTag),
  )

  return { goal, minProtein, calorieBand: validCalorieBand, budgetBand: validBudgetBand, dietTags }
}
