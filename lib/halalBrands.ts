import fs from "fs"
import path from "path"
import type { HalalBrandNote } from "./halal"

/** Halal research on brands and products we discuss but don't list with nutrition yet. Server only. */
export function readHalalBrandNotes(): { checkedAt: string; brands: HalalBrandNote[] } {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", "halal-brands.json"), "utf8"))
}
