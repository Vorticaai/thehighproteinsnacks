import type { Product } from "@/lib/products"

type CategoryFilter = (product: Product) => boolean
type WeightLossComparable = Pick<
  Product,
  "caloriesPerServing" | "proteinPerServing" | "sugarPerServing" | "brand"
>

const hasPositiveValue = (value: number | undefined): boolean =>
  typeof value === "number" && Number.isFinite(value) && value > 0

export const weightLossFilter = (p: WeightLossComparable) =>
  (p.caloriesPerServing < 200 && p.proteinPerServing >= 5 && p.sugarPerServing <= 5) ||
  p.brand.toLowerCase().includes("chomps")

export const categoryFilters: Record<string, CategoryFilter> = {
  "best-value": (product) =>
    hasPositiveValue(product.pricePerServing) &&
    hasPositiveValue(product.proteinPerServing),
  "low-sugar": (product) => product.flags?.lowSugar === true,
  "weight-loss": (product) => weightLossFilter(product),
  keto: (product) => product.netCarbs !== undefined && product.netCarbs <= 10,
  "high-protein": (product) => product.proteinPerServing >= 15,
  vegan: (product) => product.flags?.vegan === true,
  "gluten-free": (product) => product.flags?.glutenFree === true,
  budget: (product) => product.flags?.budget === true,
  "protein-bars": (product) => product.type === "bar",
  "protein-chips": (product) => product.type === "chips",
  "protein-cookies": (product) => product.type === "cookie",
  halal: (product) =>
    product.flags?.halal === true ||
    (product.dietTags ?? []).includes("halal") ||
    (product.categoryTags ?? []).includes("halal"),
}
