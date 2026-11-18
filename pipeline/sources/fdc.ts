/**
 * USDA FoodData Central (public domain, CC0).
 * Branded records come from manufacturers' label data (GS1/1WorldSync).
 * API guide: https://fdc.nal.usda.gov/api-guide
 */
import type { FdcCandidate } from "../match"
import type { PerServing } from "../verify"

const BASE = "https://api.nal.usda.gov/fdc/v1"

export type FdcFood = FdcCandidate & {
  servingSize?: number
  servingSizeUnit?: string
  householdServingFullText?: string
  ingredients?: string
  modifiedDate?: string
  publicationDate?: string
  dataSource?: string
  labelNutrients?: Record<string, { value: number } | undefined>
  foodNutrients?: Array<{
    amount?: number
    value?: number
    nutrient?: { number?: string; name?: string; unitName?: string }
    nutrientNumber?: string
  }>
}

async function getJson(url: string): Promise<unknown> {
  let last = 0
  for (let attempt = 1; attempt <= 4; attempt++) {
    const res = await fetch(url, { headers: { Accept: "application/json" } })
    if (res.ok) return res.json()
    last = res.status
    if (res.status === 429 || res.status >= 500) {
      await new Promise((r) => setTimeout(r, 3000 * attempt))
      continue
    }
    throw new Error(`FDC ${res.status} for ${url.replace(/api_key=[^&]+/, "api_key=***")}`)
  }
  throw new Error(
    `FDC request failed after retries (last status ${last}). ` +
      (last === 429 ? "The shared DEMO_KEY is rate-limited: add a free FDC_API_KEY repository secret." : ""),
  )
}

export async function searchBranded(query: string, apiKey: string): Promise<FdcCandidate[]> {
  const url = `${BASE}/foods/search?api_key=${encodeURIComponent(apiKey)}&dataType=Branded&pageSize=25&query=${encodeURIComponent(query)}`
  const data = (await getJson(url)) as { foods?: FdcCandidate[] }
  return (data.foods ?? []).map((f) => ({
    fdcId: f.fdcId,
    description: f.description,
    brandOwner: f.brandOwner,
    brandName: f.brandName,
    gtinUpc: f.gtinUpc,
    publishedDate: f.publishedDate,
  }))
}

/** Full records for up to 20 ids in one request. */
export async function getFoods(ids: number[], apiKey: string): Promise<FdcFood[]> {
  if (ids.length === 0) return []
  const out: FdcFood[] = []
  for (let i = 0; i < ids.length; i += 20) {
    const chunk = ids.slice(i, i + 20)
    const url = `${BASE}/foods?api_key=${encodeURIComponent(apiKey)}&format=full&fdcIds=${chunk.join(",")}`
    out.push(...((await getJson(url)) as FdcFood[]))
  }
  return out
}

const GRAM_UNITS = new Set(["g", "grm", "gm", "gram", "grams"])

/** Per-serving values, preferring the label panel exactly as printed. */
export function fdcPerServing(food: FdcFood): PerServing | null {
  const unit = (food.servingSizeUnit ?? "").toLowerCase()
  const servingSizeG = food.servingSize && GRAM_UNITS.has(unit) ? food.servingSize : null
  const servingSize =
    [food.householdServingFullText, food.servingSize ? `${food.servingSize} ${unit || ""}`.trim() : null]
      .filter(Boolean)
      .join(" / ") || null

  const ln = food.labelNutrients
  if (ln && ln.protein && ln.calories) {
    return {
      protein: ln.protein?.value,
      calories: ln.calories?.value,
      carbs: ln.carbohydrates?.value,
      fiber: ln.fiber?.value ?? 0,
      sugar: ln.sugars?.value,
      fat: ln.fat?.value,
      servingSize,
      servingSizeG,
    }
  }

  // Fallback: per-100 g values scaled to the serving.
  if (!servingSizeG || !food.foodNutrients) return null
  const per100 = (num: string) => {
    const n = food.foodNutrients!.find((x) => (x.nutrient?.number ?? x.nutrientNumber) === num)
    const v = n?.amount ?? n?.value
    return typeof v === "number" ? Math.round((v * servingSizeG) / 10) / 10 : undefined
  }
  return {
    protein: per100("203"),
    calories: per100("208"),
    carbs: per100("205"),
    fiber: per100("291") ?? 0,
    sugar: per100("269") ?? per100("2000"),
    fat: per100("204"),
    servingSize,
    servingSizeG,
  }
}

export const fdcUrl = (fdcId: number) => `https://fdc.nal.usda.gov/food-details/${fdcId}/nutrients`
