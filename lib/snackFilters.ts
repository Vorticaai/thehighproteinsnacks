import type { Product } from "./products"
import { getAllProducts } from "./products"
import { CATEGORY_THRESHOLDS as T, categoryFilters } from "./categoryFilters"

export type CategorySlug =
  | "weight-loss"
  | "high-protein"
  | "low-carb"
  | "keto"
  | "low-sugar"
  | "gluten-free"
  | "vegan"
  | "plant-based"
  | "halal"
  | "protein-bars"
  | "chips"
  | "best-value"

// Copy rule: describe the filter honestly. No certification, medical or
// weight-loss promises; diet tags are as listed by the product, not verified.
const categoryDetails: Record<
  CategorySlug,
  {
    title: string
    description: string
    seoTitle: string
    seoDescription: string
  }
> = {
  "weight-loss": {
    title: "High-Protein Snacks for Weight Loss (Under 200 Calories)",
    description: `Snacks under ${T.weightLossMaxCalories} calories with at least ${T.weightLossMinProteinG}g protein and no more than ${T.weightLossMaxSugarG}g sugar per serving. Useful if you are tracking calories; no snack causes weight loss on its own.`,
    seoTitle: "High-Protein Snacks for Weight Loss: Under 200 Calories",
    seoDescription: `High-protein snacks under ${T.weightLossMaxCalories} calories per serving. Compare protein, sugar and price per serving side by side.`,
  },

  "high-protein": {
    title: `High-Protein Snacks (${T.highProteinMinProteinG}g+)`,
    description: `Snacks with ${T.highProteinMinProteinG}g or more protein per serving.`,
    seoTitle: `High-Protein Snacks with ${T.highProteinMinProteinG}g+ Protein per Serving`,
    seoDescription: `Browse snacks with ${T.highProteinMinProteinG}g or more protein per serving and compare calories, sugar and price.`,
  },

  "low-carb": {
    title: "Low-Carb Protein Snacks",
    description: `Snacks with ${T.lowCarbMaxNetCarbsG}g or fewer net carbs (total carbs minus fiber) per serving.`,
    seoTitle: "Low-Carb High-Protein Snacks",
    seoDescription: `Protein snacks with ${T.lowCarbMaxNetCarbsG}g or fewer net carbs per serving. Compare macros and price per serving.`,
  },

  keto: {
    title: "Keto-Friendly Protein Snacks",
    description: `Snacks with ${T.ketoMaxNetCarbsG}g or fewer net carbs and ${T.ketoMaxSugarG}g or less sugar per serving. Check sugar alcohols on the label if you track them.`,
    seoTitle: "Keto-Friendly High-Protein Snacks",
    seoDescription: `Protein bars, chips and shakes with ${T.ketoMaxNetCarbsG}g or fewer net carbs per serving. Compare macros side by side.`,
  },

  "low-sugar": {
    title: `Low-Sugar Snacks (≤${T.lowSugarMaxSugarG}g)`,
    description: `Every snack here lists ${T.lowSugarMaxSugarG}g of sugar or less per serving.`,
    seoTitle: "Low-Sugar High-Protein Snacks",
    seoDescription: `High-protein snacks with ${T.lowSugarMaxSugarG}g of sugar or less per serving. Compare protein, calories and price.`,
  },

  "gluten-free": {
    title: "Gluten-Free Protein Snacks",
    description:
      "Snacks listed as gluten-free by the product information we hold. We have not verified certification. If you have coeliac disease, check the package and the brand before buying.",
    seoTitle: "Gluten-Free High-Protein Snacks",
    seoDescription:
      "High-protein snacks listed as gluten-free. Compare macros and price per serving; always check the label if you have coeliac disease.",
  },

  vegan: {
    title: "Vegan Protein Snacks",
    description:
      "Snacks listed as vegan or plant-based by the product information we hold. Check the label to confirm.",
    seoTitle: "Vegan High-Protein Snacks",
    seoDescription:
      "Plant-based protein snacks compared by protein, sugar, calories and price per serving.",
  },

  "plant-based": {
    title: "Plant-Based Protein Snacks",
    description:
      "Snacks listed as vegan or plant-based by the product information we hold. Check the label to confirm.",
    seoTitle: "Plant-Based High-Protein Snacks",
    seoDescription:
      "Plant-based protein snacks compared by protein, sugar, calories and price per serving.",
  },

  halal: {
    title: "Halal Protein Snacks",
    description:
      "Snacks marketed as halal by their brand. We have not verified halal certification; check the package and the certifier before buying.",
    seoTitle: "Halal High-Protein Snacks",
    seoDescription:
      "High-protein snacks marketed as halal, compared by protein, sugar and price per serving. Check certification on the package.",
  },

  "protein-bars": {
    title: "Protein Bars Compared",
    description: "Protein bars compared by protein, calories, sugar and price per serving.",
    seoTitle: "Protein Bars Compared by Macros and Price",
    seoDescription:
      "Compare protein bars by protein per serving, sugar, calories and protein per dollar.",
  },

  chips: {
    title: "High-Protein Chips & Crunchy Snacks",
    description: "Protein chips, puffs and crisps compared by macros and price per serving.",
    seoTitle: "High-Protein Chips & Crunchy Snacks",
    seoDescription:
      "Compare protein chips, puffs and crisps by protein, calories, sugar and price per serving.",
  },

  "best-value": {
    title: "Best Value Protein Snacks",
    description: `Snacks with at least ${T.bestValueMinProteinPerDollar}g of protein per $1, ranked by protein per dollar. Prices are estimates from when each product was added and change often.`,
    seoTitle: "Best Value Protein Snacks (Protein per Dollar)",
    seoDescription:
      "High-protein snacks ranked by grams of protein per dollar. Prices are estimates; check the retailer for the current price.",
  },
}

export const categorySlugs = Object.keys(categoryDetails) as CategorySlug[]

export function getCategoryDetails(slug: CategorySlug) {
  return categoryDetails[slug]
}

export function getProductsByCategory(slug: CategorySlug): Product[] {
  const filter = categoryFilters[slug]
  if (!filter) return []
  const products = getAllProducts().filter(filter)
  if (slug === "best-value") {
    return [...products].sort((a, b) => b.proteinPerDollar - a.proteinPerDollar)
  }
  return products
}
