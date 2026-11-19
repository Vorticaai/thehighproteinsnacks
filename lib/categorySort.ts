import type { Product } from "@/lib/products"

/**
 * Sort options for category listing pages (/snacks/[slug]). Kept next to
 * categoryFilters.ts: that file is the source of truth for which products
 * belong to a category, this one is the source of truth for what order
 * they're shown in. Every field used here already exists on Product — no
 * new data, so this never needs to agree with anything else.
 */
export type CategorySortOption =
  | "protein-desc"
  | "protein-per-dollar-desc"
  | "price-asc"
  | "calories-asc"
  | "sugar-asc"

export const CATEGORY_SORT_OPTIONS: Array<{
  value: CategorySortOption
  label: string
}> = [
  { value: "protein-desc", label: "Protein: high to low" },
  { value: "protein-per-dollar-desc", label: "Best value (protein per $)" },
  { value: "price-asc", label: "Price per serving: low to high" },
  { value: "calories-asc", label: "Calories: low to high" },
  { value: "sugar-asc", label: "Sugar: low to high" },
]

// Products with no price recorded (pricePerServing <= 0) sort to the end of
// price-based sorts instead of leading them.
function priceRank(value: number) {
  return value > 0 ? value : Number.POSITIVE_INFINITY
}

const comparators: Record<CategorySortOption, (a: Product, b: Product) => number> = {
  "protein-desc": (a, b) => b.proteinPerServing - a.proteinPerServing,
  "protein-per-dollar-desc": (a, b) => b.proteinPerDollar - a.proteinPerDollar,
  "price-asc": (a, b) => priceRank(a.pricePerServing) - priceRank(b.pricePerServing),
  "calories-asc": (a, b) => a.caloriesPerServing - b.caloriesPerServing,
  "sugar-asc": (a, b) => a.sugarPerServing - b.sugarPerServing,
}

/** Returns a new, sorted array. Never mutates the input. */
export function sortProducts(products: Product[], sort: CategorySortOption): Product[] {
  return [...products].sort(comparators[sort])
}
