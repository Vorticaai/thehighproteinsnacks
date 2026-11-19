/**
 * Pure verification rules. No network, no file access, so they are easy to
 * test (tests/verify.test.ts). The pipeline (pipeline/run.ts) feeds them data.
 */
import type { NutritionValues } from "../lib/productRecord"

export type CoreField = "protein" | "calories" | "carbs" | "fiber" | "sugar" | "fat"
export const CORE_FIELDS: CoreField[] = ["protein", "calories", "carbs", "fiber", "sugar", "fat"]

export type PerServing = Partial<Pick<NutritionValues, CoreField>> & {
  servingSize?: string | null
  servingSizeG?: number | null
}

/**
 * Round the way a US Nutrition Facts label does (21 CFR 101.9), so values
 * computed from per-100 g data read like the printed label:
 * calories to 5 (≤50) or 10 (>50); fat to 0.5 g below 5 g, else 1 g;
 * other grams to 1 g; anything under 0.5 g shows as 0.
 */
export function labelRound(field: CoreField, x: number): number {
  if (!Number.isFinite(x)) return x
  if (field === "calories") return x < 5 ? 0 : x <= 50 ? Math.round(x / 5) * 5 : Math.round(x / 10) * 10
  if (x < 0.5) return 0
  if (field === "fat" && x < 5) return Math.round(x * 2) / 2
  return Math.round(x)
}

export function labelRoundAll(v: PerServing): PerServing {
  const out: PerServing = { ...v }
  for (const f of CORE_FIELDS) {
    const x = v[f]
    if (typeof x === "number") out[f] = labelRound(f, x)
  }
  return out
}

/**
 * Two values agree if within 10%, with a floor of 1.5 g (or 10 kcal).
 * The floor absorbs US label rounding and per-100 g conversions.
 */
export function agrees(field: CoreField, a: number, b: number): boolean {
  const floor = field === "calories" ? 10 : 1.5
  const tolerance = Math.max(floor, 0.1 * Math.max(Math.abs(a), Math.abs(b)))
  return Math.abs(a - b) <= tolerance
}

/**
 * Energy check: 4 kcal/g protein and carbs, 9 kcal/g fat, compared with the
 * stated calories. High-fiber products (which often contain sugar alcohols)
 * get a wider band because fiber provides fewer calories.
 */
export function energyCheck(v: PerServing): { ok: boolean; estimate: number } {
  const { protein, carbs, fat, calories, fiber = 0 } = v
  if ([protein, carbs, fat, calories].some((x) => typeof x !== "number")) {
    return { ok: false, estimate: NaN }
  }
  const estimate = 4 * protein! + 4 * carbs! + 9 * fat!
  if (calories === 0) return { ok: estimate < 10, estimate }
  const band = fiber >= 5 ? 0.35 : 0.2
  return { ok: Math.abs(estimate - calories!) / calories! <= band, estimate }
}

/** Basic sanity rules every label must pass. Returns the problems found. */
export function plausibilityProblems(v: PerServing): string[] {
  const problems: string[] = []
  for (const f of CORE_FIELDS) {
    const x = v[f]
    if (typeof x !== "number" || !Number.isFinite(x)) problems.push(`${f} is missing`)
    else if (x < 0) problems.push(`${f} is negative`)
  }
  if (problems.length) return problems
  if (v.sugar! > v.carbs! + 0.5) problems.push(`sugar (${v.sugar}g) is more than total carbs (${v.carbs}g)`)
  if (v.fiber! > v.carbs! + 0.5) problems.push(`fiber (${v.fiber}g) is more than total carbs (${v.carbs}g)`)
  if (v.servingSizeG && v.protein! + v.carbs! + v.fat! > v.servingSizeG * 1.05) {
    problems.push(`protein + carbs + fat is more than the serving weight (${v.servingSizeG}g)`)
  }
  const energy = energyCheck(v)
  if (!energy.ok) {
    problems.push(`calories (${v.calories}) don't match the macros (about ${Math.round(energy.estimate)})`)
  }
  return problems
}

/** Fields where two sources disagree. */
export function disagreements(a: PerServing, b: PerServing): string[] {
  const out: string[] = []
  for (const f of CORE_FIELDS) {
    const x = a[f]
    const y = b[f]
    if (typeof x === "number" && typeof y === "number" && !agrees(f, x, y)) {
      out.push(`${f}: ${x} vs ${y}`)
    }
  }
  return out
}

export type Decision =
  | { status: "verified"; values: PerServing; notes: string[] }
  | { status: "needs-review"; notes: string[] }

/**
 * Decide what to publish.
 *  - Primary: manufacturer label data from USDA FoodData Central, matched
 *    with high confidence (or pinned by a person).
 *  - Secondary: Open Food Facts, used only as a cross-check.
 * Anything uncertain goes to review and the stored values are left alone.
 */
export function decide(input: {
  primary: PerServing | null
  primaryConfident: boolean
  secondary: PerServing | null
  /** A reviewer looked at both sources and chose the USDA label data. */
  acceptPrimaryReason?: string
}): Decision {
  const primary = input.primary ? labelRoundAll(input.primary) : null
  const secondary = input.secondary ? labelRoundAll(input.secondary) : null
  const { primaryConfident, acceptPrimaryReason } = input
  if (!primary) {
    return { status: "needs-review", notes: ["No USDA label record found for this product."] }
  }
  if (!primaryConfident) {
    return {
      status: "needs-review",
      notes: ["USDA match is uncertain; a person should confirm the right product in the evidence file."],
    }
  }
  const problems = plausibilityProblems(primary)
  if (problems.length) {
    return { status: "needs-review", notes: problems.map((p) => `USDA label data failed a check: ${p}.`) }
  }
  const notes: string[] = []
  if (secondary) {
    const diff = disagreements(primary, secondary)
    if (diff.length) {
      if (acceptPrimaryReason) {
        return {
          status: "verified",
          values: primary,
          notes: [
            `USDA and Open Food Facts disagree (${diff.join("; ")}); a reviewer accepted the USDA label data: ${acceptPrimaryReason}`,
          ],
        }
      }
      return {
        status: "needs-review",
        notes: [`USDA and Open Food Facts disagree (${diff.join("; ")}).`],
      }
    }
    notes.push("Open Food Facts agrees with the USDA label data.")
  } else {
    notes.push("No Open Food Facts record to cross-check.")
  }
  return { status: "verified", values: primary, notes }
}

/**
 * Second label source for products USDA doesn't hold: the brand's own
 * Nutrition Facts panel, transcribed by a reviewer into pipeline/queue.json
 * with the URL of the page or panel image. Published only if every core value
 * is present and the numbers pass the same plausibility checks.
 */
export function decideManufacturer(values: PerServing): Decision {
  const v = labelRoundAll(values)
  const missing = CORE_FIELDS.filter((f) => typeof v[f] !== "number")
  if (missing.length) {
    return { status: "needs-review", notes: [`Manufacturer panel is missing: ${missing.join(", ")}.`] }
  }
  const problems = plausibilityProblems(v)
  if (problems.length) {
    return { status: "needs-review", notes: problems.map((p) => `Manufacturer panel failed a check: ${p}.`) }
  }
  return { status: "verified", values: v, notes: ["Values from the brand's own Nutrition Facts panel."] }
}
