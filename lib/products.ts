import fs from "fs"
import path from "path"
import Papa from "papaparse"
import { weightLossFilter } from "./categoryFilters"

export type ProductFlags = {
  weightLoss?: boolean
  highProtein?: boolean
  lowCarb?: boolean
  keto?: boolean
  lowSugar?: boolean
  glutenFree?: boolean
  vegan?: boolean
  plantBased?: boolean
  halal?: boolean
  dairyFree?: boolean
  budget?: boolean
  bars?: boolean
  chips?: boolean
  cookies?: boolean
  
}

export type Product = {
  id: string
  name: string
  brand: string
  proteinPerServing: number
  caloriesPerServing: number
  carbsPerServing: number
  fatsPerServing: number
  sugarPerServing: number
  fiberPerServing: number
  netCarbs?: number
  pricePerServing: number
  buyUrl: string
  imageUrl: string
  proteinPerDollar: number
  type?: string
  flags: ProductFlags
  // optional editorial fields (legacy pages still expect these)
  rating?: number
  reviewCount?: number
  description?: string
  whyGreat?: string
  nutritionBreakdown?: string
  ingredientsHighlight?: string
  shortBenefits?: string[]
  bestFor?: string[]
  dietTags?: string[]
  categoryTags?: string[]
  faq?: Array<{ question: string; answer: string }>
  servingSize?: string
  pricePerUnit?: number
  isHero?: boolean
}

type RawProductRow = {
  ID: string
  Product_Name: string
  Brand: string
  proteinPerServing: string
  caloriesPerServing: string
  carbsPerServing: string
  fatsPerServing: string
  sugarPerServing: string
  fiberPerServing: string
  pricePerServing: string
  buyUrl: string
  imageFileName: string
  type?: string
  isWeightLoss: string
  isHighProtein: string
  isLowCarb: string
  isKeto: string
  isLowSugar: string
  isGlutenFree: string
  isVegan: string
  isBars: string
  isChips: string
  isPlantBased?: string
  isDairyFree?: string
  isBudget?: string
  isCookies?: string
}

let productCache: Product[] | null = null

export function getAllProducts(): Product[] {
  if (productCache) return productCache

  const csvPath = path.join(process.cwd(), "data", "products.csv")
  const csvContent = fs.readFileSync(csvPath, "utf8")

  const parsed = Papa.parse<RawProductRow>(csvContent, {
    header: true,
    skipEmptyLines: true,
  })

  const rows = parsed.data.filter((row): row is RawProductRow =>
    Boolean(row?.ID && row?.Product_Name),
  )

  // Drop duplicate IDs (first row wins) so each product has one URL.
  const seen = new Set<string>()
  const uniqueRows = rows.filter((row) => {
    const id = row.ID.trim()
    if (seen.has(id)) return false
    seen.add(id)
    return true
  })

  productCache = uniqueRows.map((row) => normalizeRow(row))

  return productCache
}
// --- SMART AUTO-DETECTION HELPERS (NO BRAND ASSUMPTIONS) ---

function detectVegan(brandRaw: string, productNameRaw: string): {
  vegan: boolean;
  plantBased: boolean;
} {
  const text = `${brandRaw} ${productNameRaw}`.toLowerCase();

  const vegan =
    text.includes("vegan") ||
    text.includes("plant-based") ||
    text.includes("plant based") ||
    text.includes("dairy-free") ||
    text.includes("dairy free") ||
    text.includes("no dairy") ||
    text.includes("100% plant") ||
    text.includes("made with plants");

  const plantBased =
    vegan ||
    text.includes("plant protein") ||
    text.includes("plant powered");

  return { vegan, plantBased };
}


function detectGlutenFree(brandRaw: string, productNameRaw: string): boolean {
  const text = `${brandRaw} ${productNameRaw}`.toLowerCase();

  return (
    text.includes("gluten free") ||
    text.includes("gluten-free") ||
    text.includes("glutenfree") ||
    text.includes("celiac") ||
    text.includes("coeliac") ||
    text.includes("no gluten")
  );
}


function detectHalal(brandRaw: string, productNameRaw: string): boolean {
  const text = `${brandRaw} ${productNameRaw}`.toLowerCase();
  return (
    text.includes("halal") ||
    text.includes("zabihah") ||
    text.includes("hand slaughtered")
  );
}



function normalizeRow(row: RawProductRow): Product {
  const protein = toNumber(row.proteinPerServing)
  const price = toNumber(row.pricePerServing)
  const carbs = toNumber(row.carbsPerServing)
  const fiber = toNumber(row.fiberPerServing)
  const netCarbs = Math.max(carbs - fiber, 0)

  const baseProduct: Product = {
    id: row.ID,
    name: row.Product_Name,
    brand: row.Brand,
    proteinPerServing: protein,
    caloriesPerServing: toNumber(row.caloriesPerServing),
    carbsPerServing: carbs,
    fatsPerServing: toNumber(row.fatsPerServing),
    sugarPerServing: toNumber(row.sugarPerServing),
    fiberPerServing: fiber,
    netCarbs,
    pricePerServing: price,
    buyUrl: row.buyUrl?.trim() ?? "",
    // Product photos were removed (they were copied from Amazon listings).
    // Pages show a generated LabelCard instead. imageFileName stays in the CSV
    // only as a record of the old file name.
    imageUrl: "",
    proteinPerDollar: price > 0 ? Number((protein / price).toFixed(2)) : 0,
    type: normalizeProductType(row.type),
    flags: {
      weightLoss: toBool(row.isWeightLoss, "isWeightLoss"),
      highProtein: toBool(row.isHighProtein, "isHighProtein"),
      lowCarb: toBool(row.isLowCarb, "isLowCarb"),
      keto: toBool(row.isKeto, "isKeto"),
      lowSugar: toBool(row.isLowSugar, "isLowSugar"),
      glutenFree: toBool(row.isGlutenFree, "isGlutenFree"),
      vegan: toBool(row.isVegan, "isVegan"),
      plantBased: toBool(row.isPlantBased, "isPlantBased"),
      halal: false,
      dairyFree: toBool(row.isDairyFree, "isDairyFree"),
      budget: toBool(row.isBudget, "isBudget"),
      bars: toBool(row.isBars, "isBars"),
      chips: toBool(row.isChips, "isChips"),
      cookies: toBool(row.isCookies, "isCookies"),
    },
    pricePerUnit: price,
    servingSize: "1 serving",
  }
// --- MERGE AUTO-DETECTED VEGAN / PLANT-BASED / GLUTEN-FREE FLAGS ---
const veganDetection = detectVegan(baseProduct.brand, baseProduct.name)
const autoGlutenFree = detectGlutenFree(baseProduct.brand, baseProduct.name)
const isHalal = detectHalal(baseProduct.brand, baseProduct.name)

// Merge CSV + auto-detection (CSV always wins if true)
baseProduct.flags.vegan =
  baseProduct.flags.vegan || veganDetection.vegan;

baseProduct.flags.plantBased =
  baseProduct.flags.plantBased || veganDetection.plantBased;

baseProduct.flags.glutenFree =
  baseProduct.flags.glutenFree || autoGlutenFree;

baseProduct.flags.halal =
  baseProduct.flags.halal || isHalal;


  let finalProduct: Product = {
    ...baseProduct,
    ...buildAutoContent(baseProduct),
  }

  if (isHalal) {
    finalProduct.dietTags = [...(finalProduct.dietTags ?? []), "halal"]
    finalProduct.categoryTags = [...(finalProduct.categoryTags ?? []), "halal"]
  }

  return finalProduct
}

function toNumber(value: string | undefined): number {
  if (!value) return 0
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function toBool(value: string | undefined, key: string): boolean {
  if (!value) return false
  const normalized = value.trim().toLowerCase()
  if (!normalized) return false

  const truthy = ["true", "1", "yes", "y", "x", "✓"]
  const falsy = ["false", "0", "no", "n", "?"]

  if (truthy.includes(normalized)) return true
  if (falsy.includes(normalized)) return false

  // Anything unrecognised is treated as "not set", never as true.
  return normalized === key.toLowerCase()
}

function normalizeProductType(value: string | undefined): string | undefined {
  if (!value) return undefined
  const normalized = value.trim().toLowerCase()
  if (!normalized) return undefined

  const typeMap: Record<string, string> = {
    bar: "bar",
    bars: "bar",
    chip: "chips",
    chips: "chips",
    cookie: "cookie",
    cookies: "cookie",
  }

  return typeMap[normalized] ?? normalized
}




function buildAutoContent(product: Product) {
  const dietTags = [
    ...(product.dietTags ?? []),
    product.flags.vegan && "vegan",
    product.flags.plantBased && "plant-based",
    product.flags.halal && "halal",
    product.flags.keto && "keto",
    product.flags.lowSugar && "low-sugar",
    product.flags.glutenFree && "gluten-free",
    product.flags.dairyFree && "dairy-free",
  ]
    .filter(Boolean)
    .map((tag) => tag as string)
  const dedupedDietTags = Array.from(new Set(dietTags))

  const categoryTags = [
    ...(product.categoryTags ?? []),
    product.flags.halal && "halal",
    weightLossFilter(product) && "weight-loss",
    product.flags.lowSugar && "low-sugar",
    product.flags.glutenFree && "gluten-free",
    product.flags.budget && "best-value",
    product.proteinPerServing >= 20 && "high-protein",
    product.type === "bar" && "protein-bars",
    product.type === "chips" && "protein-chips",
    product.type === "cookie" && "protein-cookies",
  ]
    .filter(Boolean)
    .map((tag) => tag as string)
  const dedupedCategoryTags = Array.from(new Set(categoryTags))

  const shortBenefits = [
    `${product.proteinPerServing}g protein`,
    `${product.caloriesPerServing} calories`,
    `${product.sugarPerServing}g sugar`,
    `${product.proteinPerDollar.toFixed(1)}g per $`,
  ]

  const faq = [
    {
      question: `Is ${product.name} good for weight loss?`,
      answer: `It has ${product.caloriesPerServing} calories and ${product.proteinPerServing}g protein per serving. No single food causes weight loss; what matters is your overall diet.`,
    },
    {
      question: `What are the macros per serving?`,
      answer: `${product.proteinPerServing}g protein, ${product.carbsPerServing}g carbs, ${product.fatsPerServing}g fat.`,
    },
  ]

  const description = `${product.brand} ${product.name} delivers ${product.proteinPerServing}g protein for ${product.caloriesPerServing} calories per serving.`
  const whyGreat = `${product.name} has ${product.proteinPerServing}g protein and ${product.caloriesPerServing} calories per serving.`
  const nutritionBreakdown = `Protein ${product.proteinPerServing}g · Carbs ${product.carbsPerServing}g · Fat ${product.fatsPerServing}g · Sugar ${product.sugarPerServing}g`
  const ingredientsHighlight =
    "See retailer listing for the most up-to-date ingredient list."

  return {
    dietTags: dedupedDietTags,
    categoryTags: dedupedCategoryTags,
    shortBenefits,
    bestFor: ["desk-snack", "on-the-go", "post-workout"],
    faq,
    description,
    whyGreat,
    nutritionBreakdown,
    ingredientsHighlight,
    isHero: false,
  }
}

