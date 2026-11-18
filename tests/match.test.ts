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

test("barcode variants cover UPC-12 and EAN-13 forms", () => {
  const v = barcodeVariants("00888849000425")
  assert.ok(v.includes("888849000425"))
  assert.ok(v.includes("0888849000425"))
})
