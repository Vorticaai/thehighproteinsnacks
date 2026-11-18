import type { Product } from "@/lib/products"

/**
 * Single source of truth for category membership.
 *
 * Every category count, category page, homepage section and sitemap entry
 * must use these functions, so counts and listings can never disagree.
 * Numeric thresholds live in CATEGORY_THRESHOLDS so copy can quote them.
 *
 * Diet claims (vegan, gluten-free, halal) come from product data only and
 * are NOT verified certifications. Page copy must say so.
 */

type CategoryFilter = (product: Product) => boolean

export const CATEGORY_THRESHOLDS = {
  lowSugarMaxSugarG: 3,
  highProteinMinProteinG: 20,
  ketoMaxNetCarbsG: 10,
  ketoMaxSugarG: 5,
  lowCarbMaxNetCarbsG: 15,
  weightLossMaxCalories: 200,
  weightLossMinProteinG: 10,
  weightLossMaxSugarG: 5,
  bestValueMinProteinPerDollar: 12,
} as const

const T = CATEGORY_THRESHOLDS

type WeightLossComparable = Pick<
  Product,
  "caloriesPerServing" | "proteinPerServing" | "sugarPerServing"
>

export const weightLossFilter = (p: WeightLossComparable) =>
  p.caloriesPerServing > 0 &&
  p.caloriesPerServing < T.weightLossMaxCalories &&
  p.proteinPerServing >= T.weightLossMinProteinG &&
  p.sugarPerServing <= T.weightLossMaxSugarG

const netCarbs = (p: Product) =>
  typeof p.netCarbs === "number" ? p.netCarbs : Math.max(p.carbsPerServing - p.fiberPerServing, 0)

export const categoryFilters: Record<string, CategoryFilter> = {
  "best-value": (p) =>
    p.pricePerServing > 0 && p.proteinPerDollar >= T.bestValueMinProteinPerDollar,
  "low-sugar": (p) => p.sugarPerServing <= T.lowSugarMaxSugarG,
  "weight-loss": (p) => weightLossFilter(p),
  keto: (p) => netCarbs(p) <= T.ketoMaxNetCarbsG && p.sugarPerServing <= T.ketoMaxSugarG,
  "low-carb": (p) => netCarbs(p) <= T.lowCarbMaxNetCarbsG,
  "high-protein": (p) => p.proteinPerServing >= T.highProteinMinProteinG,
  vegan: (p) => p.flags?.vegan === true,
  "plant-based": (p) => p.flags?.plantBased === true || p.flags?.vegan === true,
  "gluten-free": (p) => p.flags?.glutenFree === true,
  halal: (p) => p.flags?.halal === true,
  "protein-bars": (p) => p.flags?.bars === true,
  chips: (p) => p.flags?.chips === true,
}

export function filterForCategory(slug: string): CategoryFilter | undefined {
  return categoryFilters[slug]
}
