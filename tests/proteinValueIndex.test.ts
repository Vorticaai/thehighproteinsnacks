import { test } from "node:test"
import assert from "node:assert/strict"
import { buildValueIndex, computeValueIndexStats } from "../lib/proteinValueIndex"
import type { Product } from "../lib/products"

// Minimal fixtures — only the fields the index/stats read.
function product(overrides: Partial<Product>): Product {
  return {
    id: "id",
    name: "name",
    brand: "brand",
    proteinPerServing: 0,
    caloriesPerServing: 0,
    carbsPerServing: 0,
    fatsPerServing: 0,
    sugarPerServing: 0,
    fiberPerServing: 0,
    netCarbs: 0,
    pricePerServing: 0,
    buyUrl: "",
    imageUrl: "",
    image: null,
    proteinPerDollar: 0,
    flags: {},
    halal: null,
    verification: { status: "unverified", checkedAt: null, sources: [] },
    ...overrides,
  } as Product
}

test("buildValueIndex excludes products with no recorded price", () => {
  const entries = buildValueIndex([
    product({ id: "priced", pricePerServing: 1, proteinPerDollar: 10 }),
    product({ id: "unpriced", pricePerServing: 0, proteinPerDollar: 0 }),
  ])
  assert.equal(entries.length, 1)
  assert.equal(entries[0].product.id, "priced")
})

test("buildValueIndex ranks by protein-per-dollar descending, rank starts at 1", () => {
  const entries = buildValueIndex([
    product({ id: "mid", pricePerServing: 1, proteinPerDollar: 10 }),
    product({ id: "best", pricePerServing: 1, proteinPerDollar: 20 }),
    product({ id: "worst", pricePerServing: 1, proteinPerDollar: 2 }),
  ])
  assert.deepEqual(
    entries.map((e) => e.product.id),
    ["best", "mid", "worst"],
  )
  assert.deepEqual(
    entries.map((e) => e.rank),
    [1, 2, 3],
  )
})

test("buildValueIndex never mutates the input array", () => {
  const input = [
    product({ id: "a", pricePerServing: 1, proteinPerDollar: 5 }),
    product({ id: "b", pricePerServing: 1, proteinPerDollar: 15 }),
  ]
  const inputCopy = [...input]
  buildValueIndex(input)
  assert.deepEqual(input, inputCopy, "input array order changed")
})

test("computeValueIndexStats handles an empty index without throwing", () => {
  const stats = computeValueIndexStats([])
  assert.equal(stats.count, 0)
  assert.equal(stats.best, null)
  assert.equal(stats.priciest, null)
  assert.equal(stats.spreadMultiple, null)
})

test("computeValueIndexStats picks the correct best and priciest-per-gram", () => {
  const entries = buildValueIndex([
    product({ id: "best", pricePerServing: 1, proteinPerDollar: 20 }),
    product({ id: "worst", pricePerServing: 1, proteinPerDollar: 2 }),
  ])
  const stats = computeValueIndexStats(entries)
  assert.equal(stats.best?.id, "best")
  assert.equal(stats.priciest?.id, "worst")
  assert.equal(stats.spreadMultiple, 10)
})

test("computeValueIndexStats computes median and average correctly (even count)", () => {
  const entries = buildValueIndex([
    product({ id: "a", pricePerServing: 1, proteinPerDollar: 10 }),
    product({ id: "b", pricePerServing: 1, proteinPerDollar: 20 }),
    product({ id: "c", pricePerServing: 1, proteinPerDollar: 30 }),
    product({ id: "d", pricePerServing: 1, proteinPerDollar: 40 }),
  ])
  const stats = computeValueIndexStats(entries)
  assert.equal(stats.median, 25) // (20 + 30) / 2
  assert.equal(stats.average, 25) // (10+20+30+40)/4
})

test("computeValueIndexStats counts verified products correctly", () => {
  const entries = buildValueIndex([
    product({
      id: "a",
      pricePerServing: 1,
      proteinPerDollar: 10,
      verification: { status: "verified", checkedAt: "2026-01-01", sources: [] },
    }),
    product({ id: "b", pricePerServing: 1, proteinPerDollar: 20, verification: { status: "needs-review", checkedAt: null, sources: [] } }),
  ])
  const stats = computeValueIndexStats(entries)
  assert.equal(stats.verifiedCount, 1)
})

test("computeValueIndexStats finds the best bar and best chips separately from overall best", () => {
  const entries = buildValueIndex([
    product({ id: "overall-best-shake", pricePerServing: 1, proteinPerDollar: 50, flags: {} }),
    product({ id: "best-bar", pricePerServing: 1, proteinPerDollar: 20, flags: { bars: true } }),
    product({ id: "worse-bar", pricePerServing: 1, proteinPerDollar: 5, flags: { bars: true } }),
    product({ id: "best-chips", pricePerServing: 1, proteinPerDollar: 15, flags: { chips: true } }),
  ])
  const stats = computeValueIndexStats(entries)
  assert.equal(stats.best?.id, "overall-best-shake")
  assert.equal(stats.bestBar?.id, "best-bar")
  assert.equal(stats.bestChips?.id, "best-chips")
})

test("computeValueIndexStats returns null bestBar/bestChips when that format is absent", () => {
  const entries = buildValueIndex([product({ id: "a", pricePerServing: 1, proteinPerDollar: 10, flags: {} })])
  const stats = computeValueIndexStats(entries)
  assert.equal(stats.bestBar, null)
  assert.equal(stats.bestChips, null)
})
