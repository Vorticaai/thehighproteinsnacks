import type { Product } from "./products"
import { getAllProducts } from "./products"
import { weightLossFilter } from "./categoryFilters"

type FlagKey = keyof Product["flags"]

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



  const slugToFlag: Record<CategorySlug, FlagKey> = {
    "weight-loss": "weightLoss",
    "high-protein": "highProtein",
    "low-carb": "lowCarb",
    keto: "keto",
    "low-sugar": "lowSugar",
    "gluten-free": "glutenFree",
    vegan: "vegan",
    "plant-based": "plantBased",
    halal: "halal",            // ⭐ REQUIRED LINE
    "protein-bars": "bars",
    chips: "chips",
  }
  
  

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
    title: "Best Weight Loss High-Protein Snacks",
    description:
      "Snacks under 200 calories that deliver serious protein so you can stay full, crush cravings, and keep your deficit on track.",
    seoTitle: "Best Weight Loss High-Protein Snacks",
    seoDescription:
      "Hand-picked low-calorie, high-protein snacks that support fat loss without hunger. Compare macros, sugar, and price per serving.",
  },

  "high-protein": {
    title: "High-Protein All-Stars",
    description:
      "The highest-protein picks in the database — 20g+ per serving with balanced calories for post-workout or meal replacement.",
    seoTitle: "Top High-Protein Snacks (20g+ per serving)",
    seoDescription:
      "Browse snacks that pack 20g+ protein per serving. Perfect for building muscle, curbing hunger, and simplifying macro tracking.",
  },

  "low-carb": {
    title: "Low-Carb Protein Snacks",
    description:
      "For carb-conscious eaters who still want flavor — each option keeps carbs tight while delivering satisfying protein.",
    seoTitle: "Best Low-Carb High-Protein Snacks",
    seoDescription:
      "Low-carb snacks with the macros you need for cutting and carb cycling. Filtered for low net carbs and clean ingredients.",
  },

  keto: {
    title: "Keto-Friendly Protein Snacks",
    description:
      "Under 10g net carbs with the fat and protein balance you need to stay keto while keeping hunger away.",
    seoTitle: "Keto High-Protein Snacks & Bars",
    seoDescription:
      "Stay in ketosis with these low-net-carb protein bars, chips, and shakes. Every pick keeps sugar minimal and protein high.",
  },

  "low-sugar": {
    title: "Low-Sugar Snacks (≤3g)",
    description:
      "Tight sugar control without sacrificing flavor. Perfect for metabolic health, diabetes-friendly eating, and appetite control.",
    seoTitle: "Low-Sugar High-Protein Snacks",
    seoDescription:
      "Every snack here has 3 grams of sugar or less. Ideal for blood sugar control, weight loss, and steady energy.",
  },

  "gluten-free": {
    title: "Gluten-Free Protein Snacks",
    description:
      "Certified gluten-free picks that deliver macro-friendly nutrition without cross-contamination worries.",
    seoTitle: "Gluten-Free High-Protein Snacks",
    seoDescription:
      "Shop gluten-free protein snacks vetted for celiac safety. Bars, chips, and shakes with great macros.",
  },

  vegan: {
    title: "Vegan Protein Snacks",
    description:
      "Pea, rice, and nut-based proteins with clean ingredients so you can hit your targets without dairy or whey.",
    seoTitle: "Best Vegan High-Protein Snacks",
    seoDescription:
      "Plant-based snacks that deliver 12–20g protein. Perfect for vegans, dairy-free eaters, and gentle digestion.",
  },

  "plant-based": {
    title: "Plant-Based Protein Snacks",
    description:
      "Vegan and plant-powered snacks made from pea, rice, and nut proteins — macro-balanced and dairy-free.",
    seoTitle: "Best Plant-Based High-Protein Snacks",
    seoDescription:
      "Top vegan and plant-based protein snacks with clean ingredients and 10–20g protein per serving.",
  },

  halal: {
    title: "Halal Protein Snacks",
    description:
      "Certified Halal protein snacks with clean ingredients and reliable macros for everyday snacking.",
    seoTitle: "Best Halal Protein Snacks",
    seoDescription:
      "Browse Halal-certified high-protein snacks with trustworthy ingredients, low sugar, and great macros.",
  },

  "protein-bars": {
    title: "Protein Bars Worth Buying",
    description:
      "The most reliable protein bars for travel, work, and gym bags. Ranked by protein density, flavor, and ingredient quality.",
    seoTitle: "Best Protein Bars (Ranked by Macros)",
    seoDescription:
      "Discover the best protein bars on the market with verified macros, low sugar, and great taste.",
  },

  chips: {
    title: "High-Protein Chips & Crunchy Snacks",
    description:
      "Savory, crunchy, high-protein chips that replace junk food without sacrificing flavor or macros.",
    seoTitle: "High-Protein Chips & Crunchy Snacks",
    seoDescription:
      "Quest-style chips, puffs, and crisps delivering protein with bold flavors. Perfect for salty snack cravings.",
  },
}


function filterByFlag(flag: FlagKey): Product[] {
  return getAllProducts().filter((product) => product.flags[flag])
}

export function getWeightLossSnacks(): Product[] {
  return getAllProducts().filter(weightLossFilter)
}

export function getHighProteinSnacks(): Product[] {
  return filterByFlag("highProtein")
}

export function getLowCarbSnacks(): Product[] {
  return filterByFlag("lowCarb")
}

export function getKetoSnacks(): Product[] {
  return filterByFlag("keto")
}

export function getLowSugarSnacks(): Product[] {
  return filterByFlag("lowSugar")
}

export function getGlutenFreeSnacks(): Product[] {
  return filterByFlag("glutenFree")
}

export function getVeganSnacks(): Product[] {
  return filterByFlag("vegan")
}

export function getBars(): Product[] {
  return filterByFlag("bars")
}

export function getChips(): Product[] {
  return filterByFlag("chips")
}
export function getProductsByCategory(slug: CategorySlug): Product[] {
  if (slug === "weight-loss") {
    return getWeightLossSnacks();
  }

  if (slug === "halal") {
    return getHalalSnacks();
  }

  const flag = slugToFlag[slug];
  if (!flag) return [];

  return filterByFlag(flag);
}

// ADD THIS ↓↓↓
export function getHalalSnacks(): Product[] {
  return getAllProducts().filter((p) =>
    (p.dietTags ?? []).includes("halal") ||
    (p.categoryTags ?? []).includes("halal")
  );
}

