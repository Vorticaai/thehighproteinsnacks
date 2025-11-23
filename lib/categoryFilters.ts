import type { Product } from "@/lib/products";

type CategoryFilter = (product: Product) => boolean;

const hasPositiveValue = (value: number | undefined): boolean =>
  typeof value === "number" && Number.isFinite(value) && value > 0;

export const categoryFilters: Record<string, CategoryFilter> = {
  "best-value": (product) =>
    hasPositiveValue(product.pricePerServing) &&
    hasPositiveValue(product.proteinPerServing),
  "low-sugar": (product) => product.flags?.lowSugar === true,
  "weight-loss": (product) => product.flags?.weightLoss === true,
  keto: (product) =>
    product.netCarbs !== undefined && product.netCarbs <= 10,
  "high-protein": (product) => product.proteinPerServing >= 15,
  vegan: (product) => product.flags?.vegan === true,
  "plant-based": (product) => product.flags?.plantBased === true,
  "dairy-free": (product) => product.flags?.dairyFree === true,
  budget: (product) => product.flags?.budget === true,

  // Product types from CSV (if type field exists)
  "protein-bars": (product) => product.type === "bar",
  "protein-chips": (product) => product.type === "chips",
  "protein-cookies": (product) => product.type === "cookie",
};

