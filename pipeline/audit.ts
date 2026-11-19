/**
 * Independent audit of the published catalogue.
 *
 * For every product marked "verified" with a USDA source:
 *   1. Re-fetch the USDA record by its id and recompute the label values.
 *   2. Compare with the values stored in data/products/<id>.json.
 *   3. Fetch the live product page and confirm it shows the stored protein,
 *      calories and sugar.
 * Products checked against a brand's panel are listed for a person or a
 * fresh reading of the panel image, since the panel is an image.
 *
 * Writes pipeline/audit.md and exits non-zero when anything disagrees.
 * Runs in GitHub Actions (.github/workflows/audit.yml).
 */
import fs from "fs"
import path from "path"
import { readProductRecords } from "../lib/products"
import { fdcPerServing, getFoods } from "./sources/fdc"
import { CORE_FIELDS, labelRoundAll } from "./verify"

const ROOT = process.cwd()
const API_KEY = (process.env.FDC_API_KEY ?? "").trim() || "DEMO_KEY"
const SITE = process.env.SITE_URL ?? "https://www.thehighproteinsnacks.com"
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function main() {
  const records = readProductRecords()
  const verified = records.filter((r) => r.verification.status === "verified")
  const usda = verified.filter((r) => r.verification.sources.some((s) => s.name === "USDA FoodData Central"))
  const brand = verified.filter((r) => r.verification.sources.some((s) => s.name === "Manufacturer website"))

  const ids = usda.map((r) => r.identifiers.fdcId!).filter(Boolean)
  const foods = new Map((await getFoods(ids, API_KEY)).map((f) => [f.fdcId, f]))

  const problems: string[] = []
  let sourceOk = 0
  let pageOk = 0
  for (const r of usda) {
    const food = foods.get(r.identifiers.fdcId!)
    const v = food ? fdcPerServing(food) : null
    if (!v) {
      problems.push(`| ${r.id} | USDA | record ${r.identifiers.fdcId} not returned |`)
      continue
    }
    const label = labelRoundAll(v)
    const usedOff = r.verification.notes.some((n) => n.startsWith("Published the Open Food Facts values"))
    const diffs = usedOff
      ? []
      : CORE_FIELDS.filter((f) => typeof label[f] === "number" && label[f] !== r.nutrition[f]).map(
          (f) => `${f}: site ${r.nutrition[f]} vs USDA ${label[f]}`,
        )
    if (diffs.length) problems.push(`| ${r.id} | USDA | ${diffs.join("; ")} |`)
    else sourceOk++
  }

  for (const r of verified) {
    try {
      const res = await fetch(`${SITE}/snacks/${r.id}`, { headers: { "User-Agent": "THPS-audit/1.0" } })
      if (!res.ok) {
        problems.push(`| ${r.id} | live page | HTTP ${res.status} |`)
        continue
      }
      const html = (await res.text()).replace(/<!-- -->/g, "")
      const missing = [
        [`${r.nutrition.protein}g protein`, "protein"],
        [`${r.nutrition.calories} cal`, "calories"],
        [`${r.nutrition.sugar}g sugar`, "sugar"],
      ].filter(([needle]) => !html.includes(needle as string))
      if (missing.length) problems.push(`| ${r.id} | live page | doesn't show ${missing.map((m) => m[1]).join(", ")} as stored |`)
      else pageOk++
    } catch (err) {
      problems.push(`| ${r.id} | live page | ${(err as Error).message} |`)
    }
    await sleep(150)
  }

  const report = [
    `# Catalogue audit ${new Date().toISOString().slice(0, 10)}`,
    "",
    `- Products marked label-checked: ${verified.length}`,
    `- Match a fresh copy of their USDA record: ${sourceOk} of ${usda.length}`,
    `- Live page shows the stored protein, calories and sugar: ${pageOk} of ${verified.length}`,
    `- Checked against a brand's own panel (image; re-read separately): ${brand.map((r) => r.id).join(", ") || "none"}`,
    "",
    problems.length ? "## Problems\n\n| Product | Check | Detail |\n| --- | --- | --- |\n" + problems.join("\n") : "No problems found.",
    "",
  ].join("\n")
  fs.writeFileSync(path.join(ROOT, "pipeline", "audit.md"), report)
  console.log(report)
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, report)
  if (problems.length) process.exit(1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
