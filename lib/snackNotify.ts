import type { Product } from "@/lib/products"
import {
  findMatches,
  findUpgrades,
  deltasFrom,
  PROTEIN_BANDS,
  CALORIE_BANDS,
  BUDGET_BANDS,
  DIET_TAGS,
  type MatchCriteria,
  type MatchGoal,
  type ProteinBand,
  type CalorieBand,
  type BudgetBand,
  type DietTag,
} from "@/lib/snackMatch"

/**
 * "Notify me when you find a better snack for me" — a standing subscription,
 * as distinct from the one-off "Email My Results" in EmailResultsCapture.tsx.
 *
 * There's no database in this project. The subscriber record lives entirely
 * in a Resend contact's flat `properties` bag (confirmed against the
 * installed SDK: string/number values only, no nesting) — the one piece of
 * external infrastructure this app already has a reason to use. Every field
 * below is namespaced `notify*` so it can't collide with other uses of the
 * same contact record (e.g. the separate newsletter opt-in in
 * EmailResultsCapture.tsx, which uses its own segment and never touches
 * these fields).
 *
 * This only covers what's asked for now: goal + dietary tags (reusing the
 * same categoryFilters-backed DietTag the rest of the matching engine uses)
 * and, for "upgrade" mode, which product. Ingredient-avoid lists, sweetener
 * preference, and format preference are deliberately NOT built here — the
 * product data isn't reliable enough yet. When they are: add a `notify*`
 * field to NotifySubscription + its two encode/decode functions and a
 * filter step in computeNotifyPick, same shape as dietTags below. Nothing
 * else needs to change.
 */

export type NotifyMode = "match" | "upgrade"

export type NotifySubscription = {
  mode: NotifyMode
  goal: MatchGoal
  dietTags: DietTag[]
  // match mode
  minProtein: ProteinBand
  calorieBand: CalorieBand
  budgetBand: BudgetBand
  // upgrade mode
  productId: string | null
  // bookkeeping
  lastNotifiedProductId: string | null
  notifyActive: boolean
  manageToken: string
}

/** Minimal shape of what we actually read back from Resend's properties. */
type ResendPropertyBag = Record<string, { type: "string" | "number"; value: string | number }>

// A property written as `null` (see subscriptionToProperties) may come back
// either omitted entirely or present with a null-ish value, depending on how
// Resend stores it — handled the same way either way, so a missing
// productId/lastNotifiedProductId never gets stringified into the literal
// text "null".
function readString(props: ResendPropertyBag, key: string): string | null {
  const p = props[key]
  if (!p || p.value === null || p.value === undefined) return null
  return String(p.value)
}

function readNumber(props: ResendPropertyBag, key: string): number | null {
  const p = props[key]
  if (!p || p.value === null || p.value === undefined) return null
  return typeof p.value === "number" ? p.value : Number(p.value)
}

/** Flat string/number/null map, exactly what Resend's contacts API accepts. */
export function subscriptionToProperties(sub: NotifySubscription): Record<string, string | number | null> {
  return {
    notifyMode: sub.mode,
    notifyGoal: sub.goal,
    notifyDietTags: sub.dietTags.join(","),
    notifyMinProtein: sub.minProtein,
    notifyCalorieBand: sub.calorieBand,
    notifyBudgetBand: sub.budgetBand,
    notifyProductId: sub.productId,
    notifyLastNotifiedProductId: sub.lastNotifiedProductId,
    notifyActive: sub.notifyActive ? "true" : "false",
    notifyManageToken: sub.manageToken,
  }
}

/** Inverse of subscriptionToProperties, tolerant of missing/invalid fields. */
export function propertiesToSubscription(props: ResendPropertyBag): NotifySubscription | null {
  const mode = readString(props, "notifyMode")
  if (mode !== "match" && mode !== "upgrade") return null

  const goal = readString(props, "notifyGoal")
  if (goal !== "lose-fat" && goal !== "build-muscle") return null

  const dietTags = (readString(props, "notifyDietTags") ?? "")
    .split(",")
    .filter((t): t is DietTag => DIET_TAGS.includes(t as DietTag))

  const minProteinRaw = readNumber(props, "notifyMinProtein")
  const minProtein = PROTEIN_BANDS.includes(minProteinRaw as ProteinBand) ? (minProteinRaw as ProteinBand) : 0

  const calorieBandRaw = readString(props, "notifyCalorieBand")
  const calorieBand = CALORIE_BANDS.some((b) => b.value === calorieBandRaw) ? (calorieBandRaw as CalorieBand) : "any"

  const budgetBandRaw = readString(props, "notifyBudgetBand")
  const budgetBand = BUDGET_BANDS.some((b) => b.value === budgetBandRaw) ? (budgetBandRaw as BudgetBand) : "any"

  const productId = readString(props, "notifyProductId")
  const manageToken = readString(props, "notifyManageToken") ?? ""
  const notifyActive = readString(props, "notifyActive") === "true"
  const lastNotifiedProductId = readString(props, "notifyLastNotifiedProductId")

  if (mode === "upgrade" && !productId) return null

  return {
    mode,
    goal,
    dietTags,
    minProtein,
    calorieBand,
    budgetBand,
    productId,
    lastNotifiedProductId,
    notifyActive,
    manageToken,
  }
}

export type NotifyPick = {
  product: Product | null
  /** Why there's no pick right now — not an error, just nothing to say yet. */
  skippedReason: "relaxed" | "no-candidates" | "missing-current-product" | null
}

/** The single best current pick for a subscription, reusing the same engine Find My Match / Upgrade My Snack use on-page. */
export function computeNotifyPick(sub: NotifySubscription, products: Product[]): NotifyPick {
  if (sub.mode === "match") {
    const criteria: MatchCriteria = {
      goal: sub.goal,
      minProtein: sub.minProtein,
      calorieBand: sub.calorieBand,
      budgetBand: sub.budgetBand,
      dietTags: sub.dietTags,
    }
    const { results, relaxed } = findMatches(products, criteria, 1)
    if (relaxed) return { product: null, skippedReason: "relaxed" }
    if (results.length === 0) return { product: null, skippedReason: "no-candidates" }
    return { product: results[0], skippedReason: null }
  }

  const current = sub.productId ? products.find((p) => p.id === sub.productId) : undefined
  if (!current) return { product: null, skippedReason: "missing-current-product" }

  const upgrades = findUpgrades(current, products, sub.goal, 1, sub.dietTags)
  if (upgrades.length === 0) return { product: null, skippedReason: null }
  return { product: upgrades[0].product, skippedReason: null }
}

/**
 * What to compare a new pick against: whatever we last told them about (if
 * it's still in the catalogue), or — for "upgrade" mode, before we've ever
 * notified them — their own current snack. Match mode has no such fallback;
 * a first-ever pick there just becomes the silent baseline (see subscribe
 * route), never gated.
 */
export function getBaselineProduct(sub: NotifySubscription, products: Product[]): Product | null {
  if (sub.lastNotifiedProductId) {
    const p = products.find((p) => p.id === sub.lastNotifiedProductId)
    if (p) return p
  }
  if (sub.mode === "upgrade" && sub.productId) {
    return products.find((p) => p.id === sub.productId) ?? null
  }
  return null
}

// Tunable without touching any call site. Deliberately expressed as the same
// kind of real, explainable deltas used elsewhere (category thresholds,
// Upgrade My Snack's own comparison cards) rather than an opaque score gap.
export const NOTIFY_MIN_PROTEIN_DELTA_G = 3
export const NOTIFY_MIN_PROTEIN_PER_DOLLAR_DELTA = 1.5

/**
 * Is `candidate` a real, meaningful step up from `baseline` — not just a
 * fractional scoring difference? No baseline (e.g. it was later removed from
 * the catalogue) always counts as meaningful: we have nothing to compare
 * against, and withholding forever would be worse than one notification.
 */
export function isMeaningfulImprovement(candidate: Product, baseline: Product | null): boolean {
  if (!baseline) return true
  const deltas = deltasFrom(baseline, candidate)
  if (deltas.protein >= NOTIFY_MIN_PROTEIN_DELTA_G) return true
  if (deltas.proteinPerDollar !== null && deltas.proteinPerDollar >= NOTIFY_MIN_PROTEIN_PER_DOLLAR_DELTA) return true
  return false
}
