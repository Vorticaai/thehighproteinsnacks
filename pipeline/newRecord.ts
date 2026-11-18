import type { ProductRecord } from "../lib/productRecord"

/**
 * Skeleton record for a product proposed in pipeline/queue.json. Nutrition is
 * zero until the verification run fills it from label data; the run only
 * writes the record to data/products when the values verify.
 */
export function newRecord(
  id: string,
  add: { name: string; brand: string; productType: "bar" | "chips" | null; buyUrl: string; halal?: ProductRecord["halal"] },
): ProductRecord {
  return {
    id,
    name: add.name,
    brand: add.brand,
    productType: add.productType,
    buyUrl: add.buyUrl,
    price: { perServing: 0, status: "estimate", note: "No price recorded yet." },
    nutrition: { servingSize: null, servingSizeG: null, protein: 0, calories: 0, carbs: 0, fiber: 0, sugar: 0, fat: 0 },
    claims: { vegan: false, plantBased: false, glutenFree: false, halal: Boolean(add.halal), status: "as-listed" },
    identifiers: { asin: null, gtin: null, fdcId: null },
    image: null,
    halal: add.halal ?? null,
    verification: { status: "unverified", checkedAt: null, sources: [], notes: [] },
  }
}
