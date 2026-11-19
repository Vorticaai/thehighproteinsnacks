/**
 * The stored shape of one product: data/products/<id>.json.
 *
 * This file is the single source of truth for a product. The site reads it
 * through lib/products.ts; the verification pipeline (/pipeline) updates it.
 * Every nutrition value carries where it came from via `verification`.
 */

export type NutritionValues = {
  /** Serving as printed on the label, e.g. "1 bar (60 g)". */
  servingSize: string | null
  servingSizeG: number | null
  protein: number
  calories: number
  /** Total carbohydrate as on a US label (includes fiber). */
  carbs: number
  fiber: number
  sugar: number
  fat: number
}

export type VerificationStatus =
  /** Imported values, never checked. */
  | "unverified"
  /** Matches manufacturer label data from at least one independent source. */
  | "verified"
  /** Sources disagree or the match is uncertain; a person must decide. */
  | "needs-review"

export type SourceRef = {
  name: "USDA FoodData Central" | "Open Food Facts" | "Manufacturer website"
  id: string
  url: string
  checkedAt: string
  /** Per-serving values as reported by this source. */
  values: Partial<NutritionValues>
}

export type ProductImage = {
  src: string
  alt: string
  credit: string
  license: string
  licenseUrl: string
  sourceUrl: string
}

/**
 * How sure we are that a product is halal-certified. Ordered from strongest
 * to weakest. Only the first three put a product on the halal pages.
 */
export type HalalStatus =
  /** Certifier named and the product confirmed on the certifier's own list or certificate. */
  | "certified"
  /** A certifier is named (by the brand, a directory or a retailer) but not yet confirmed with the certifier. */
  | "certifier-named"
  /** Brand says halal or halal-certified but names no certifier. */
  | "brand-claim"
  /** Sold as "halal-friendly" or similar, with no halal certificate found. */
  | "not-certified"

export type HalalEvidence = {
  /** What the source says, in our words. */
  label: string
  url: string
  kind: "certifier" | "brand" | "directory" | "retailer" | "press"
}

export type HalalCheck = {
  status: HalalStatus
  certifier: string | null
  checkedAt: string
  evidence: HalalEvidence[]
  /** Shown to readers. */
  summary: string
}

export type ProductRecord = {
  id: string
  name: string
  brand: string
  productType: "bar" | "chips" | null
  buyUrl: string
  price: {
    /** 0 means no price recorded. */
    perServing: number
    status: "estimate"
    note: string
  }
  nutrition: NutritionValues
  /** Diet claims as described by the brand or listing. Not certifications. */
  claims: {
    vegan: boolean
    plantBased: boolean
    glutenFree: boolean
    halal: boolean
    status: "as-listed"
  }
  identifiers: {
    asin: string | null
    gtin: string | null
    fdcId: number | null
  }
  image: ProductImage | null
  /** Halal certification research. Absent when nobody has checked. */
  halal?: HalalCheck | null
  verification: {
    status: VerificationStatus
    checkedAt: string | null
    sources: SourceRef[]
    notes: string[]
  }
}
