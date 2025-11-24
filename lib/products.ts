import fs from "fs"
import path from "path"
import Papa from "papaparse"

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

  productCache = rows.map((row) => normalizeRow(row))

  return productCache
}
// --- Auto-detection helpers for diet flags ---

const KNOWN_VEGAN_BRANDS = [
  'orgain',
  'no cow',
  'gomacro',
  'barebells vegan',
  'think! plant',
  // TODO: extend with brands you know are fully vegan
];

const KNOWN_GLUTEN_FREE_BRANDS = [
  'kind',
  'rxbar',
  'lara bar',
  // TODO: extend with brands you know are GF (or GF product lines)
];

function detectVegan(brandRaw: string, productNameRaw: string): {
  vegan: boolean;
  plantBased: boolean;
} {
  const text = `${brandRaw} ${productNameRaw}`.toLowerCase();

  const hasVeganKeyword =
    text.includes('vegan') ||
    text.includes('100% plant') ||
    text.includes('plant-based') ||
    text.includes('plant based') ||
    text.includes('dairy-free') ||
    text.includes('dairy free') ||
    text.includes('no dairy');

  const isKnownVeganBrand = KNOWN_VEGAN_BRANDS.some((b) =>
    text.includes(b.toLowerCase())
  );

  const vegan = hasVeganKeyword || isKnownVeganBrand;
  const plantBased = vegan || text.includes('plant protein') || text.includes('plant powered');

  return { vegan, plantBased };
}

function detectGlutenFree(brandRaw: string, productNameRaw: string): boolean {
  const text = `${brandRaw} ${productNameRaw}`.toLowerCase();

  const hasGlutenFreeKeyword =
    text.includes('gluten-free') ||
    text.includes('gluten free') ||
    text.includes('no gluten') ||
    text.includes('gf certified') ||
    text.includes('coeliac safe');

  const isKnownGfBrand = KNOWN_GLUTEN_FREE_BRANDS.some((b) =>
    text.includes(b.toLowerCase())
  );

  return hasGlutenFreeKeyword || isKnownGfBrand;
}

function detectHalal(brandRaw: string, productNameRaw: string): boolean {
  const text = `${brandRaw} ${productNameRaw}`.toLowerCase();
  return text.includes('halal');
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
    imageUrl: buildImagePath(row.imageFileName),
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

// Only ever upgrade to true; don't force false over CSV
if (veganDetection.vegan) {
  baseProduct.flags.vegan = true
}
if (veganDetection.plantBased) {
  baseProduct.flags.plantBased = true
}
if (autoGlutenFree) {
  baseProduct.flags.glutenFree = true
}
if (isHalal) {
  baseProduct.flags.halal = true
}

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

  return normalized === key.toLowerCase() || normalized.length > 0
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

function buildImagePath(fileName: string | undefined): string {
  if (!fileName) return ""
  const trimmed = fileName.trim()
  if (!trimmed) return ""
  return trimmed.startsWith("/snacks/") ? trimmed : `/snacks/${trimmed}`
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
    qualifiesForWeightLoss(product) && "weight-loss",
    product.flags.lowSugar && "low-sugar",
    product.flags.glutenFree && "gluten-free",
    product.flags.budget && "best-value",
    product.proteinPerServing >= 15 && "high-protein",
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
      answer: qualifiesForWeightLoss(product)
        ? "Yes. Its calories stay under common deficit targets and the protein keeps you satisfied."
        : "It can fit a deficit if you budget the calories with lighter meals.",
    },
    {
      question: `What are the macros per serving?`,
      answer: `${product.proteinPerServing}g protein, ${product.carbsPerServing}g carbs, ${product.fatsPerServing}g fat.`,
    },
  ]

  const description = `${product.brand} ${product.name} delivers ${product.proteinPerServing}g protein for ${product.caloriesPerServing} calories per serving.`
  const whyGreat = `${product.name} balances macros so you stay full without blowing your budget or calories.`
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
    rating: 4.6,
    reviewCount: 180,
    isHero: false,
  }
}

function qualifiesForWeightLoss(product: {
  caloriesPerServing: number
  proteinPerServing: number
  sugarPerServing: number
  brand: string
}) {
  return (
    (product.caloriesPerServing < 200 &&
      product.proteinPerServing >= 5 &&
      product.sugarPerServing <= 5) ||
    product.brand.toLowerCase().includes("chomps")
  )
}
