import fs from "fs"
import path from "path"
import Papa from "papaparse"

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
  pricePerServing: number
  buyUrl: string
  imageUrl: string
  proteinPerDollar: number
  flags: {
    weightLoss: boolean
    highProtein: boolean
    lowCarb: boolean
    keto: boolean
    lowSugar: boolean
    glutenFree: boolean
    vegan: boolean
    bars: boolean
    chips: boolean
  }
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
  isWeightLoss: string
  isHighProtein: string
  isLowCarb: string
  isKeto: string
  isLowSugar: string
  isGlutenFree: string
  isVegan: string
  isBars: string
  isChips: string
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

  return {
    id: row.ID,
    name: row.Product_Name,
    brand: row.Brand,
    proteinPerServing: protein,
    caloriesPerServing: toNumber(row.caloriesPerServing),
    carbsPerServing: toNumber(row.carbsPerServing),
    fatsPerServing: toNumber(row.fatsPerServing),
    sugarPerServing: toNumber(row.sugarPerServing),
    fiberPerServing: toNumber(row.fiberPerServing),
    pricePerServing: price,
    buyUrl: row.buyUrl?.trim() ?? "",
    imageUrl: buildImagePath(row.imageFileName),
    proteinPerDollar: price > 0 ? Number((protein / price).toFixed(2)) : 0,
    flags: {
      weightLoss: toBool(row.isWeightLoss, "isWeightLoss"),
      highProtein: toBool(row.isHighProtein, "isHighProtein"),
      lowCarb: toBool(row.isLowCarb, "isLowCarb"),
      keto: toBool(row.isKeto, "isKeto"),
      lowSugar: toBool(row.isLowSugar, "isLowSugar"),
      glutenFree: toBool(row.isGlutenFree, "isGlutenFree"),
      vegan: toBool(row.isVegan, "isVegan"),
      bars: toBool(row.isBars, "isBars"),
      chips: toBool(row.isChips, "isChips"),
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

function buildImagePath(fileName: string | undefined): string {
  if (!fileName) return ""
  const trimmed = fileName.trim()
  if (!trimmed) return ""
  return trimmed.startsWith("/snacks/") ? trimmed : `/snacks/${trimmed}`
}

