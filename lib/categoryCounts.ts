import { LISTED_HALAL_STATUSES } from "./halal"
import { readHalalBrandNotes } from "./halalBrands"

/**
 * Count text for category cards (snacks index and home page). Counts come
 * from the product data at build time, so they update with every deploy.
 * The halal card also mentions brands we're still checking.
 */
export function categoryCountLabel(slug: string, count: number): string {
  const snacks = count === 0 ? "No snacks yet" : `${count} snack${count === 1 ? "" : "s"}`
  if (slug !== "halal") return snacks
  const checking = readHalalBrandNotes().brands.filter((b) => LISTED_HALAL_STATUSES.includes(b.halal.status)).length
  return checking > 0 ? `${snacks} + ${checking} brands being checked` : snacks
}
