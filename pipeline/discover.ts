/**
 * Product discovery.
 *
 * Searches USDA FoodData Central (manufacturer label data) for the queries in
 * pipeline/discover-queries.json and lists high-protein products that are not
 * in the catalogue yet. Writes pipeline/candidates.json (machine-readable,
 * ready to turn into queue "add" entries) and pipeline/candidates.md (for
 * people). Nothing is published from here: chosen candidates go through
 * pipeline/queue.json and the normal verification run.
 *
 * Runs in GitHub Actions (.github/workflows/discover-products.yml).
 */
import fs from "fs"
import path from "path"
import { readProductRecords } from "../lib/products"
import { brandTokens } from "./match"
import { fdcPerServing, fdcUrl, getFoods, searchBranded, type FdcFood } from "./sources/fdc"
import { labelRoundAll, plausibilityProblems } from "./verify"

type Query = { query: string; type: "bar" | "chips" | null; minProtein?: number; brand?: string }

const ROOT = process.cwd()
const API_KEY = (process.env.FDC_API_KEY ?? "").trim() || "DEMO_KEY"
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)

const SMALL = new Set(["and", "or", "with", "of", "the", "in", "a"])
export const titleCase = (s: string) =>
  s
    .toLowerCase()
    .split(/\s+/)
    .map((w, i) => (i > 0 && SMALL.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ")
    .replace(/\s+,/g, ",")

async function main() {
  const { queries } = JSON.parse(fs.readFileSync(path.join(ROOT, "pipeline", "discover-queries.json"), "utf8")) as {
    queries: Query[]
  }
  const records = readProductRecords()
  const knownFdc = new Set(records.map((r) => r.identifiers.fdcId).filter(Boolean))
  const knownGtin = new Set(records.map((r) => (r.identifiers.gtin ?? "").replace(/^0+/, "")).filter(Boolean))

  const seen = new Map<number, Query>()
  for (const q of queries) {
    try {
      const found = await searchBranded(q.query, API_KEY)
      for (const c of found) {
        if (seen.has(c.fdcId) || knownFdc.has(c.fdcId)) continue
        if (c.gtinUpc && knownGtin.has(c.gtinUpc.replace(/^0+/, ""))) continue
        if (q.brand) {
          const want = brandTokens(q.brand)
          const have = brandTokens(`${c.brandName ?? ""} ${c.brandOwner ?? ""}`)
          if (!want.some((t) => have.includes(t))) continue
        }
        seen.set(c.fdcId, q)
      }
    } catch (err) {
      console.error(`Search failed for "${q.query}": ${(err as Error).message.slice(0, 160)}`)
    }
    await sleep(400)
  }

  const foods: FdcFood[] = await getFoods(Array.from(seen.keys()), API_KEY)
  const candidates = []
  const byKey = new Set<string>()
  for (const food of foods) {
    const q = seen.get(food.fdcId)!
    const v = fdcPerServing(food)
    if (!v || typeof v.protein !== "number" || typeof v.calories !== "number") continue
    const values = labelRoundAll(v)
    if ((values.protein ?? 0) < (q.minProtein ?? 10)) continue
    if (plausibilityProblems(values).length > 0) continue
    if (food.modifiedDate && Number(food.modifiedDate.slice(-4)) < 2020) continue
    const brand = titleCase(food.brandName || food.brandOwner || "")
    if (!brand) continue
    const name = titleCase(food.description)
    // One entry per brand + description (USDA lists the same product per pack size).
    const key = `${brand}|${name}`
    if (byKey.has(key)) continue
    byKey.add(key)
    candidates.push({
      id: slugify(`${brand} ${name}`),
      name: name.toLowerCase().startsWith(brand.toLowerCase()) ? name : `${brand} ${name}`,
      brand,
      productType: q.type,
      fdcId: food.fdcId,
      gtin: food.gtinUpc ?? null,
      modifiedDate: food.modifiedDate ?? null,
      servingSize: values.servingSize ?? null,
      protein: values.protein,
      calories: values.calories,
      sugar: values.sugar,
      query: q.query,
      url: fdcUrl(food.fdcId),
    })
  }
  candidates.sort((a, b) => a.brand.localeCompare(b.brand) || a.name.localeCompare(b.name))

  fs.writeFileSync(path.join(ROOT, "pipeline", "candidates.json"), JSON.stringify({ candidates }, null, 2) + "\n")
  const md = [
    `# Discovery run ${new Date().toISOString().slice(0, 10)}`,
    "",
    `${candidates.length} high-protein products found in USDA label data that are not in the catalogue.`,
    "",
    "| Brand | Product | Protein | Calories | Sugar | Serving | USDA |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    ...candidates.map(
      (c) =>
        `| ${c.brand} | ${c.name.replace(/\|/g, "/")} | ${c.protein} g | ${c.calories} | ${c.sugar ?? "?"} g | ${c.servingSize ?? ""} | [${c.fdcId}](${c.url}) |`,
    ),
    "",
  ].join("\n")
  fs.writeFileSync(path.join(ROOT, "pipeline", "candidates.md"), md)
  console.log(`${candidates.length} candidates`)
}

if (process.argv[1]?.endsWith("discover.ts")) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
