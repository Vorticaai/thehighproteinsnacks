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

  const rows = parsed.data.filter(
    (row): row is RawProductRow => Boolean(row?.ID && row?.Product_Name),
  )

  productCache = rows.map((row) => normalizeRow(row))

  return productCache
}

function normalizeRow(row: RawProductRow): Product {
  const protein = toNumber(row.proteinPerServing)
  const price = toNumber(row.pricePerServing)
  const carbs = toNumber(row.carbsPerServing)
  const fiber = toNumber(row.fiberPerServing)
  const netCarbs = Math.max(carbs - fiber, 0)

  return {
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
      dairyFree: toBool(row.isDairyFree, "isDairyFree"),
      budget: toBool(row.isBudget, "isBudget"),
      bars: toBool(row.isBars, "isBars"),
      chips: toBool(row.isChips, "isChips"),
      cookies: toBool(row.isCookies, "isCookies"),
    },
  }
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

