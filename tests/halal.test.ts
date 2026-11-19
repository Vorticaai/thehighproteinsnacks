import { test } from "node:test"
import assert from "node:assert/strict"
import fs from "fs"
import path from "path"
import { getAllProducts, readProductRecords } from "../lib/products"
import { getProductsByCategory } from "../lib/snackFilters"
import { HALAL_STATUS_RANK, isListedHalal, type HalalBrandNote } from "../lib/halal"
import type { HalalCheck } from "../lib/productRecord"
import { newRecord } from "../pipeline/newRecord"

const STATUSES = Object.keys(HALAL_STATUS_RANK)

function assertValidCheck(where: string, check: HalalCheck) {
  assert.ok(STATUSES.includes(check.status), `${where}: unknown status ${check.status}`)
  assert.match(check.checkedAt, /^\d{4}-\d{2}-\d{2}$/, `${where}: checkedAt`)
  assert.ok(check.summary.length > 20, `${where}: summary missing`)
  assert.ok(check.evidence.length > 0, `${where}: no evidence`)
  for (const e of check.evidence) {
    assert.match(e.url, /^https:\/\//, `${where}: evidence URL must be https`)
    assert.ok(e.label.length > 10, `${where}: evidence label missing`)
  }
  if (check.status === "certified" || check.status === "certifier-named") {
    assert.ok(check.certifier, `${where}: ${check.status} needs a certifier`)
  }
  if (check.status === "certified") {
    assert.ok(
      check.evidence.some((e) => e.kind === "certifier"),
      `${where}: "certified" needs evidence from the certifier itself`,
    )
  }
}

test("every product on the halal page has documented halal research", () => {
  const halal = getProductsByCategory("halal")
  assert.ok(halal.length > 0)
  for (const p of halal) {
    assert.ok(p.halal, `${p.id} is listed as halal without research`)
    assert.ok(isListedHalal(p.halal), `${p.id} is listed with status ${p.halal!.status}`)
  }
})

test("halal research on records is well-formed", () => {
  for (const r of readProductRecords()) if (r.halal) assertValidCheck(r.id, r.halal)
})

test("'not-certified' products are never tagged halal", () => {
  for (const p of getAllProducts().filter((x) => x.halal?.status === "not-certified")) {
    assert.equal(p.flags.halal, false, p.id)
    assert.ok(!p.dietTags?.includes("halal"), `${p.id} has a halal diet tag`)
    assert.ok(!/\bhalal\b/i.test(p.name), `${p.id} has "halal" in its name`)
  }
})

test("halal brand notes are well-formed", () => {
  const data = JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", "halal-brands.json"), "utf8")) as {
    brands: HalalBrandNote[]
  }
  assert.ok(data.brands.length > 0)
  for (const b of data.brands) {
    assertValidCheck(`${b.brand} ${b.product}`, b.halal)
    assert.match(b.url, /^https:\/\//)
  }
})

test("queued new products are well-formed and carry valid halal research", () => {
  const queue = JSON.parse(fs.readFileSync(path.join(process.cwd(), "pipeline", "queue.json"), "utf8")) as {
    products: Array<{ id: string; add?: Parameters<typeof newRecord>[1] }>
  }
  for (const entry of queue.products.filter((e) => e.add)) {
    const r = newRecord(entry.id, entry.add!)
    assert.equal(r.verification.status, "unverified")
    assert.match(r.buyUrl, /^https:\/\//)
    if (r.halal) assertValidCheck(entry.id, r.halal)
  }
})

import { categoryCountLabel } from "../lib/categoryCounts"
test("halal card count includes the snacks and the brands still being checked", () => {
  const n = getProductsByCategory("halal").length
  const label = categoryCountLabel("halal", n)
  assert.ok(label.startsWith(`${n} snack`), label)
  assert.match(label, /brands being checked/)
  assert.equal(categoryCountLabel("keto", 3), "3 snacks")
})
