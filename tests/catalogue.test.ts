import { test } from "node:test"
import assert from "node:assert/strict"
import fs from "fs"
import path from "path"
import { getAllProducts, readProductRecords } from "../lib/products"
import { categoryFilters } from "../lib/categoryFilters"
import { categorySlugs, getProductsByCategory } from "../lib/snackFilters"

const records = readProductRecords()

test("every record has an id that matches its file name and is unique", () => {
  const files = fs.readdirSync(path.join(process.cwd(), "data", "products")).filter((f) => f.endsWith(".json"))
  assert.equal(files.length, records.length)
  const ids = new Set(records.map((r) => r.id))
  assert.equal(ids.size, records.length)
  for (const f of files) assert.ok(ids.has(f.replace(/\.json$/, "")), `${f} has a mismatched id`)
})

test("nutrition values are present and not negative", () => {
  for (const r of records) {
    for (const [k, v] of Object.entries(r.nutrition)) {
      if (k === "servingSize" || k === "servingSizeG") continue
      assert.ok(typeof v === "number" && v >= 0, `${r.id}.${k} = ${v}`)
    }
  }
})

test("verified records name their sources and a date", () => {
  for (const r of records.filter((x) => x.verification.status === "verified")) {
    assert.ok(r.verification.sources.length > 0, `${r.id} is verified without sources`)
    assert.ok(r.verification.checkedAt, `${r.id} is verified without a date`)
    assert.ok(r.identifiers.fdcId, `${r.id} is verified without a USDA id`)
  }
})

test("images are credited and the file exists", () => {
  for (const r of records.filter((x) => x.image)) {
    assert.ok(r.image!.credit && r.image!.license && r.image!.sourceUrl, `${r.id} image lacks credit`)
    assert.ok(fs.existsSync(path.join(process.cwd(), "public", r.image!.src)), `${r.id} image file missing`)
  }
})

test("category pages list exactly what category counts count", () => {
  const products = getAllProducts()
  for (const slug of categorySlugs) {
    const counted = products.filter(categoryFilters[slug]).map((p) => p.id).sort()
    const listed = getProductsByCategory(slug).map((p) => p.id).sort()
    assert.deepEqual(listed, counted, `category ${slug}`)
  }
})

test("no product page shows ratings", () => {
  for (const p of getAllProducts()) {
    assert.equal(p.rating, undefined)
    assert.equal(p.reviewCount, undefined)
  }
})
