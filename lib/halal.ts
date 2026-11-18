import type { HalalCheck, HalalStatus } from "./productRecord"

/**
 * Halal certification helpers. Research lives on each product record
 * (`halal` in data/products/<id>.json); brands we discuss but don't list as
 * products live in data/halal-brands.json.
 */

/** Statuses that put a product on the halal pages. */
export const LISTED_HALAL_STATUSES: HalalStatus[] = ["certified", "certifier-named", "brand-claim"]

export const isListedHalal = (check: HalalCheck | null | undefined) =>
  Boolean(check && LISTED_HALAL_STATUSES.includes(check.status))

/** Sort order: strongest evidence first. */
export const HALAL_STATUS_RANK: Record<HalalStatus, number> = {
  certified: 0,
  "certifier-named": 1,
  "brand-claim": 2,
  "not-certified": 3,
}

export const HALAL_STATUS_LABEL: Record<HalalStatus, { short: string; long: string; tone: "strong" | "medium" | "weak" | "none" }> = {
  certified: {
    short: "Certified",
    long: "Certifier named and the product confirmed on the certifier's own list or certificate.",
    tone: "strong",
  },
  "certifier-named": {
    short: "Certifier named",
    long: "A certifier is named by the brand, a halal directory or retailers, but we have not yet confirmed the product with the certifier.",
    tone: "medium",
  },
  "brand-claim": {
    short: "Brand claim",
    long: "Sold as halal, but we could not find which body certifies it. Check the halal mark on the package.",
    tone: "weak",
  },
  "not-certified": {
    short: "Not halal-certified",
    long: "No halal certificate found for the product as sold in the US. It may be sold as \"halal friendly\", or certified only in other countries.",
    tone: "none",
  },
}

export type HalalBrandNote = {
  brand: string
  product: string
  type: "bar" | "jerky" | "stick" | "other"
  /** Where the brand sells it in the US, if anywhere. */
  usAvailability: string
  proteinNote: string | null
  halal: HalalCheck
  url: string
}
