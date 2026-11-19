import { test } from "node:test"
import assert from "node:assert/strict"
import { barcodeVariants, pickBest, productTokens } from "../pipeline/match"

const product = { name: "Quest Protein Bar Chocolate Chip Cookie Dough", brand: "Quest Nutrition" }

test("product tokens drop brand and generic words", () => {
  assert.deepEqual(productTokens(product.name, product.brand), ["chocolate", "chip", "cookie", "dough"])
})

test("picks the same-brand record with the most product words", () => {
  const result = pickBest(product, [
    { fdcId: 1, description: "COOKIES & CREAM PROTEIN BAR", brandName: "QUEST" },
    { fdcId: 2, description: "CHOCOLATE CHIP COOKIE DOUGH PROTEIN BAR", brandName: "QUEST", gtinUpc: "888849000425" },
    { fdcId: 3, description: "CHOCOLATE CHIP COOKIE DOUGH BAR", brandName: "OTHER BRAND" },
  ])
  assert.equal(result.best?.fdcId, 2)
  assert.equal(result.confident, true)
})

test("is not confident when product words are missing", () => {
  const result = pickBest(product, [{ fdcId: 1, description: "CHOCOLATE PROTEIN BAR", brandName: "QUEST" }])
  assert.equal(result.confident, false)
})

test("rejects candidates from other brands", () => {
  const result = pickBest(product, [{ fdcId: 3, description: "CHOCOLATE CHIP COOKIE DOUGH BAR", brandName: "OTHER" }])
  assert.equal(result.best, null)
})

test("a weak brand word doesn't match through an unrelated candidate's description", () => {
  // "Pure Protein" -> brandTokens ["pure"] once STOP removes "protein". Abbott/EAS's
  // real shake has brandName "EAS", but its description happens to contain "pure" -
  // that must not count as a Pure Protein match.
  const pureProtein = { name: "Pure Protein Shake Frosty Chocolate", brand: "Pure Protein" }
  const result = pickBest(pureProtein, [
    { fdcId: 1, description: "MILK CHOCOLATE PURE MILK PROTEIN SHAKE", brandOwner: "Ross Products Division", brandName: "EAS" },
  ])
  assert.equal(result.best, null)
})

test("a weak brand word still matches through the candidate's own brandName", () => {
  const pureProtein = { name: "Pure Protein Shake Frosty Chocolate", brand: "Pure Protein" }
  const result = pickBest(pureProtein, [
    { fdcId: 1, description: "FROSTY CHOCOLATE SHAKE", brandName: "PURE PROTEIN", brandOwner: "Rexall Sundown, Inc." },
  ])
  assert.equal(result.best?.fdcId, 1)
  assert.equal(result.confident, true)
})

test("barcode variants cover UPC-12 and EAN-13 forms", () => {
  const v = barcodeVariants("00888849000425")
  assert.ok(v.includes("888849000425"))
  assert.ok(v.includes("0888849000425"))
})

import { cleanQuery } from "../pipeline/sources/fdc"
test("cleanQuery strips characters USDA search rejects", () => {
  assert.equal(cleanQuery("Magic Spoon Peanut Butter Cereal (per serving)"), "Magic Spoon Peanut Butter Cereal per serving")
  assert.equal(cleanQuery("Justin’s Almond Butter – Bar"), "Justins Almond Butter Bar")
  assert.equal(cleanQuery("Chomps Turkey Jalapeño Stick"), "Chomps Turkey Jalapeno Stick")
})
