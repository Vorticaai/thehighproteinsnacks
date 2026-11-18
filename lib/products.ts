import fs from "fs"
import path from "path"
import { categoryFilters } from "./categoryFilters"
import type { ProductImage, ProductRecord, VerificationStatus } from "./productRecord"

/**
 * Loads product records from data/products/*.json and turns them into the
 * Product shape the pages use. Records are the single source of truth; see
 * lib/productRecord.ts for the stored format and /pipeline for how values are
 * verified.
 */

export type ProductFlags = {
  vegan?: boolean
  plantBased?: boolean
  glutenFree?: boolean
  halal?: boolean
  bars?: boolean
  chips?: boolean
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
  netCarbs: number
  pricePerServing: number
  buyUrl: string
  /** Kept for older components; empty unless a licensed image exists. */
  imageUrl: string
  image: ProductImage | null
  proteinPerDollar: number
  type?: string
  flags: ProductFlags
  servingSize?: string
  gtin?: string
  verification: {
    status: VerificationStatus
    checkedAt: string | null
    sources: ProductRecord["verification"]["sources"]
  }
  // Generated editorial fields used by older pages
  description?: string
  whyGreat?: string
  nutritionBreakdown?: string
  ingredientsHighlight?: string
  shortBenefits?: string[]
  bestFor?: string[]
  dietTags?: string[]
  categoryTags?: string[]
  faq?: Array<{ question: string; answer: string }>
  pricePerUnit?: number
  isHero?: boolean
  // Legacy fields; no longer populated
  rating?: number
  reviewCount?: number
}

const PRODUCTS_DIR = path.join(process.cwd(), "data", "products")

let productCache: Product[] | null = null

export function readProductRecords(dir = PRODUCTS_DIR): ProductRecord[] {
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) as ProductRecord)
}

export function getAllProducts(): Product[] {
  if (productCache) return productCache
  productCache = readProductRecords().map(toProduct)
  return productCache
}

export function toProduct(record: ProductRecord): Product {
  const n = record.nutrition
  const price = record.price.perServing
  // US labels include fiber in total carbohydrate.
  const netCarbs = Math.max(n.carbs - n.fiber, 0)

  const product: Product = {
    id: record.id,
    name: record.name,
    brand: record.brand,
    proteinPerServing: n.protein,
    caloriesPerServing: n.calories,
    carbsPerServing: n.carbs,
    fatsPerServing: n.fat,
    sugarPerServing: n.sugar,
    fiberPerServing: n.fiber,
    netCarbs,
    pricePerServing: price,
    pricePerUnit: price,
    buyUrl: record.buyUrl,
    imageUrl: record.image?.src ?? "",
    image: record.image,
    proteinPerDollar: price > 0 ? Number((n.protein / price).toFixed(2)) : 0,
    type: record.productType ?? undefined,
    flags: {
      vegan: record.claims.vegan,
      plantBased: record.claims.plantBased,
      glutenFree: record.claims.glutenFree,
      halal: record.claims.halal,
      bars: record.productType === "bar",
      chips: record.productType === "chips",
    },
    servingSize: n.servingSize ?? undefined,
    gtin: record.identifiers.gtin ?? undefined,
    verification: {
      status: record.verification.status,
      checkedAt: record.verification.checkedAt,
      sources: record.verification.sources,
    },
  }

  return { ...product, ...buildAutoContent(product) }
}

function buildAutoContent(product: Product) {
  const inCategory = (slug: string) => categoryFilters[slug]?.(product) === true

  const dietTags = [
    product.flags.vegan && "vegan",
    product.flags.plantBased && "plant-based",
    product.flags.halal && "halal",
    product.flags.glutenFree && "gluten-free",
    inCategory("keto") && "keto",
    inCategory("low-sugar") && "low-sugar",
  ].filter(Boolean) as string[]

  const categoryTags = Object.keys(categoryFilters).filter(inCategory)

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

  return {
    dietTags: Array.from(new Set(dietTags)),
    categoryTags,
    shortBenefits,
    bestFor: ["desk-snack", "on-the-go", "post-workout"],
    faq,
    description: `${product.brand} ${product.name} has ${product.proteinPerServing}g protein for ${product.caloriesPerServing} calories per serving.`,
    whyGreat: `${product.name} has ${product.proteinPerServing}g protein and ${product.caloriesPerServing} calories per serving.`,
    nutritionBreakdown: `Protein ${product.proteinPerServing}g · Carbs ${product.carbsPerServing}g · Fat ${product.fatsPerServing}g · Sugar ${product.sugarPerServing}g`,
    ingredientsHighlight: "See the package or retailer listing for the current ingredient list.",
    isHero: false,
  }
}
