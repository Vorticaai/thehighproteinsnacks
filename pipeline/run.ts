/**
 * Verification run.
 *
 * For each product in pipeline/queue.json:
 *   1. Find its USDA FoodData Central record (manufacturer label data).
 *   2. Cross-check against Open Food Facts using the barcode.
 *   3. Apply the rules in pipeline/verify.ts.
 *   4. Update data/products/<id>.json, save evidence to data/evidence/<id>.json,
 *      and download a credited front-of-pack photo when one exists.
 *   5. Write pipeline/last-run.md, a readable report for the pull request.
 *
 * Runs in GitHub Actions (.github/workflows/verify-products.yml), never on the
 * live site. Nothing is published until a person merges the pull request.
 *
 * Env: FDC_API_KEY (free from https://fdc.nal.usda.gov/api-key-signup);
 *      falls back to the rate-limited DEMO_KEY.
 */
import fs from "fs"
import path from "path"
import type { ProductRecord, SourceRef } from "../lib/productRecord"
import { pickBest, type MatchResult } from "./match"
import { fdcPerServing, fdcUrl, getFoods, searchBranded, type FdcFood } from "./sources/fdc"
import { downloadImage, getByBarcode, offPerServing, offUrl, type OffProduct } from "./sources/off"
import { CORE_FIELDS, decide, type PerServing } from "./verify"

type QueueEntry = {
  id: string
  /** Set by a person after reviewing evidence: the correct USDA record. */
  fdcId?: number
  /** Optional search text when the product name finds the wrong records. */
  query?: string
  /** Reviewer's reason for trusting USDA label data over Open Food Facts. */
  acceptUsdaReason?: string
  /** Reviewer rejected the Open Food Facts photo (wrong side, blurry...). */
  skipPhoto?: boolean
  note?: string
}

const ROOT = process.cwd()
const PRODUCTS = path.join(ROOT, "data", "products")
const EVIDENCE = path.join(ROOT, "data", "evidence")
const IMAGES = path.join(ROOT, "public", "products")
const API_KEY = (process.env.FDC_API_KEY ?? "").trim() || "DEMO_KEY"
console.log(`USDA key: ${process.env.FDC_API_KEY ? `secret set (${API_KEY.length} characters after trimming)` : "DEMO_KEY"}`)
const today = new Date().toISOString().slice(0, 10)
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

const round = (x: number | undefined) => (typeof x === "number" ? Math.round(x * 10) / 10 : x)

async function main() {
  const queue = JSON.parse(fs.readFileSync(path.join(ROOT, "pipeline", "queue.json"), "utf8")) as {
    products: QueueEntry[]
  }
  fs.mkdirSync(EVIDENCE, { recursive: true })
  fs.mkdirSync(IMAGES, { recursive: true })

  // 1. Search (skipped for pinned products)
  const matches = new Map<string, MatchResult & { pinned: boolean }>()
  for (const entry of queue.products) {
    const record = readRecord(entry.id)
    if (entry.fdcId) {
      matches.set(entry.id, { best: { fdcId: entry.fdcId, description: "(pinned)" }, confident: true, reason: "Pinned by a person after review.", ranked: [], pinned: true })
      continue
    }
    const query = entry.query ?? record.name
    const candidates = await searchBranded(query, API_KEY)
    matches.set(entry.id, { ...pickBest(record, candidates), pinned: false })
    await sleep(500)
  }

  // 2. Full USDA records for the chosen candidates, in one batch
  const ids = Array.from(new Set(Array.from(matches.values()).map((m) => m.best?.fdcId).filter(Boolean) as number[]))
  const foods = new Map<number, FdcFood>((await getFoods(ids, API_KEY)).map((f) => [f.fdcId, f]))

  const rows: string[] = []
  for (const entry of queue.products) {
    const record = readRecord(entry.id)
    const match = matches.get(entry.id)!
    const food = match.best ? foods.get(match.best.fdcId) ?? null : null
    const primary = food ? fdcPerServing(food) : null

    // 3. Open Food Facts cross-check by barcode
    let off: OffProduct | null = null
    if (food?.gtinUpc) {
      off = await getByBarcode(food.gtinUpc)
      await sleep(500)
    }
    const secondary = off ? offPerServing(off) : null

    const decision = decide({
      primary,
      primaryConfident: match.confident,
      secondary,
      acceptPrimaryReason: entry.acceptUsdaReason,
    })
    const before = { ...record.nutrition }
    const sources: SourceRef[] = []

    if (decision.status === "verified" && food && primary) {
      sources.push({
        name: "USDA FoodData Central",
        id: String(food.fdcId),
        url: fdcUrl(food.fdcId),
        checkedAt: today,
        values: pickValues(primary),
      })
      if (off && secondary) {
        sources.push({ name: "Open Food Facts", id: off.code, url: offUrl(off.code), checkedAt: today, values: pickValues(secondary) })
      }
      record.nutrition = {
        servingSize: primary.servingSize ?? null,
        servingSizeG: primary.servingSizeG ?? null,
        protein: round(primary.protein)!,
        calories: round(primary.calories)!,
        carbs: round(primary.carbs)!,
        fiber: round(primary.fiber ?? 0)!,
        sugar: round(primary.sugar)!,
        fat: round(primary.fat)!,
      }
      record.identifiers.fdcId = food.fdcId
      record.identifiers.gtin = food.gtinUpc ?? null
    }

    record.verification = {
      status: decision.status,
      checkedAt: today,
      sources,
      notes: [match.reason, ...decision.notes, ...(entry.note ? [entry.note] : [])],
    }

    // 4. Photo: only when the barcode came from a confident USDA match
    let photo = "none"
    if (entry.skipPhoto) {
      const file = path.join(IMAGES, `${record.id}.jpg`)
      if (fs.existsSync(file)) fs.unlinkSync(file)
      record.image = null
      photo = "rejected by reviewer"
    } else if (off?.image_front_url && match.confident) {
      const bytes = await downloadImage(off.image_front_url)
      if (bytes && bytes.length > 5000) {
        const file = `${record.id}.jpg`
        fs.writeFileSync(path.join(IMAGES, file), bytes)
        record.image = {
          src: `/products/${file}`,
          alt: `${record.brand} ${record.name} package`,
          credit: "Open Food Facts contributors",
          license: "CC BY-SA 3.0",
          licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
          sourceUrl: offUrl(off.code),
        }
        photo = "added"
      }
    }

    writeRecord(record)
    fs.writeFileSync(
      path.join(EVIDENCE, `${record.id}.json`),
      JSON.stringify(
        {
          checkedAt: today,
          query: entry.query ?? record.name,
          match: {
            pinned: match.pinned,
            confident: match.confident,
            reason: match.reason,
            chosen: match.best,
            topCandidates: match.ranked.slice(0, 5),
          },
          usda: food
            ? {
                fdcId: food.fdcId,
                description: food.description,
                brandOwner: food.brandOwner,
                brandName: food.brandName,
                gtinUpc: food.gtinUpc,
                servingSize: food.servingSize,
                servingSizeUnit: food.servingSizeUnit,
                householdServingFullText: food.householdServingFullText,
                dataSource: food.dataSource,
                modifiedDate: food.modifiedDate,
                ingredients: food.ingredients,
                perServing: primary,
              }
            : null,
          openFoodFacts: off ? { code: off.code, product_name: off.product_name, brands: off.brands, serving_size: off.serving_size, perServing: secondary, image_front_url: off.image_front_url } : null,
          decision,
          before,
          after: record.nutrition,
        },
        null,
        2,
      ) + "\n",
    )

    const changes = CORE_FIELDS.filter((f) => before[f] !== record.nutrition[f]).map((f) => `${f} ${before[f]}→${record.nutrition[f]}`)
    rows.push(
      `| ${record.id} | ${decision.status} | ${food ? `[${food.fdcId}](${fdcUrl(food.fdcId)}) ${escape(food.description)}` : "—"} | ${off ? `[${off.code}](${offUrl(off.code)})` : "—"} | ${changes.join(", ") || "none"} | ${photo} | ${escape(record.verification.notes.join(" "))} |`,
    )
  }

  const report = [
    `# Verification run ${today}`,
    "",
    `${queue.products.length} products checked. Values change only for products marked **verified**.`,
    "",
    "| Product | Status | USDA record | Open Food Facts | Changes | Photo | Notes |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    ...rows,
    "",
  ].join("\n")
  fs.writeFileSync(path.join(ROOT, "pipeline", "last-run.md"), report)
  console.log(report)
}

function pickValues(v: PerServing) {
  const out: Record<string, number> = {}
  for (const f of CORE_FIELDS) if (typeof v[f] === "number") out[f] = round(v[f]) as number
  return out
}

const escape = (s: string) => s.replace(/\|/g, "/").replace(/\n/g, " ")

function readRecord(id: string): ProductRecord {
  const file = path.join(PRODUCTS, `${id}.json`)
  if (!fs.existsSync(file)) throw new Error(`Unknown product id in queue: ${id}`)
  return JSON.parse(fs.readFileSync(file, "utf8"))
}

function writeRecord(record: ProductRecord) {
  fs.writeFileSync(path.join(PRODUCTS, `${record.id}.json`), JSON.stringify(record, null, 2) + "\n")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
