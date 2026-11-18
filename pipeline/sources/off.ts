/**
 * Open Food Facts: crowd-sourced product database.
 * Data: ODbL. Product photos: CC BY-SA. We use the data only as a
 * cross-check (never as the published source) and show photos with credit.
 * Docs: https://openfoodfacts.github.io/openfoodfacts-server/api/
 */
import { barcodeVariants } from "../match"
import type { PerServing } from "../verify"

const USER_AGENT = "TheHighProteinSnacks/1.0 (https://www.thehighproteinsnacks.com)"
const FIELDS = [
  "code", "product_name", "brands", "serving_size", "serving_quantity",
  "nutriments", "image_front_url", "last_modified_t",
].join(",")

export type OffProduct = {
  code: string
  product_name?: string
  brands?: string
  serving_size?: string
  serving_quantity?: number | string
  image_front_url?: string
  last_modified_t?: number
  nutriments?: Record<string, number | string | undefined>
}

export async function getByBarcode(gtin: string): Promise<OffProduct | null> {
  for (const code of barcodeVariants(gtin)) {
    const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=${FIELDS}`, {
      headers: { "User-Agent": USER_AGENT },
    })
    if (!res.ok) continue
    const data = (await res.json()) as { status?: number; product?: OffProduct }
    if (data.status === 1 && data.product) return { ...data.product, code: data.product.code ?? code }
    await new Promise((r) => setTimeout(r, 400))
  }
  return null
}

const num = (v: unknown) => (typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" ? Number(v) : undefined)

export function offPerServing(p: OffProduct): PerServing | null {
  const n = p.nutriments ?? {}
  const serving = num(p.serving_quantity)
  const pick = (key: string) => {
    const s = num(n[`${key}_serving`])
    if (typeof s === "number" && Number.isFinite(s)) return s
    const h = num(n[`${key}_100g`])
    if (typeof h === "number" && Number.isFinite(h) && serving) return Math.round(h * serving) / 100
    return undefined
  }
  const values: PerServing = {
    protein: pick("proteins"),
    calories: pick("energy-kcal"),
    carbs: pick("carbohydrates"),
    fiber: pick("fiber"),
    sugar: pick("sugars"),
    fat: pick("fat"),
    servingSize: p.serving_size ?? null,
    servingSizeG: serving ?? null,
  }
  return typeof values.protein === "number" && typeof values.calories === "number" ? values : null
}

export const offUrl = (code: string) => `https://world.openfoodfacts.org/product/${code}`

export async function downloadImage(url: string): Promise<Buffer | null> {
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } })
  if (!res.ok) return null
  const type = res.headers.get("content-type") ?? ""
  if (!type.startsWith("image/")) return null
  return Buffer.from(await res.arrayBuffer())
}
