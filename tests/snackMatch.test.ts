import { test } from "node:test"
import assert from "node:assert/strict"
import {
  findMatches,
  findUpgrades,
  goalScore,
  searchProducts,
  explainMatch,
  DEFAULT_CRITERIA,
  type MatchCriteria,
} from "../lib/snackMatch"
import type { Product } from "../lib/products"

function product(overrides: Partial<Product>): Product {
  return {
    id: "id",
    name: "name",
    brand: "brand",
    proteinPerServing: 10,
    caloriesPerServing: 150,
    carbsPerServing: 10,
    fatsPerServing: 5,
    sugarPerServing: 2,
    fiberPerServing: 1,
    netCarbs: 9,
    pricePerServing: 2,
    buyUrl: "",
    imageUrl: "",
    image: null,
    proteinPerDollar: 5,
    flags: {},
    halal: null,
    verification: { status: "unverified", checkedAt: null, sources: [] },
    ...overrides,
  } as Product
}

test("findMatches respects a hard protein floor and diet requirement", () => {
  const products = [
    product({ id: "low-protein", proteinPerServing: 5, flags: { vegan: true } }),
    product({ id: "non-vegan-high-protein", proteinPerServing: 30, flags: {} }),
    product({ id: "good-match", proteinPerServing: 25, flags: { vegan: true } }),
  ]
  const criteria: MatchCriteria = { ...DEFAULT_CRITERIA, minProtein: 20, dietTags: ["vegan"] }
  const { results, relaxed } = findMatches(products, criteria, 5)
  assert.deepEqual(
    results.map((p) => p.id),
    ["good-match"],
  )
  assert.equal(relaxed, false)
})

test("findMatches relaxes calorie/budget filters rather than returning nothing, but never drops diet or protein requirements", () => {
  const products = [
    product({ id: "only-option", proteinPerServing: 20, caloriesPerServing: 400, flags: { vegan: true } }),
    product({ id: "wrong-diet", proteinPerServing: 20, caloriesPerServing: 100, flags: {} }),
  ]
  const criteria: MatchCriteria = {
    ...DEFAULT_CRITERIA,
    minProtein: 20,
    calorieBand: "under150", // only-option (400 cal) fails this
    dietTags: ["vegan"],
  }
  const { results, relaxed } = findMatches(products, criteria, 5)
  assert.deepEqual(
    results.map((p) => p.id),
    ["only-option"],
  )
  assert.equal(relaxed, true)
})

test("findMatches returns an empty, non-throwing result when truly nothing qualifies", () => {
  const products = [product({ id: "a", proteinPerServing: 5, flags: {} })]
  const criteria: MatchCriteria = { ...DEFAULT_CRITERIA, minProtein: 25, dietTags: ["vegan"] }
  const { results } = findMatches(products, criteria, 5)
  assert.deepEqual(results, [])
})

test("build-muscle goal ranks raw protein above protein density", () => {
  const highProtein = product({ id: "high-protein", proteinPerServing: 30, caloriesPerServing: 300 })
  const dense = product({ id: "dense", proteinPerServing: 10, caloriesPerServing: 80 })
  assert.ok(goalScore(highProtein, "build-muscle") > goalScore(dense, "build-muscle"))
})

test("lose-fat goal ranks protein density above raw protein", () => {
  const highProtein = product({ id: "high-protein", proteinPerServing: 30, caloriesPerServing: 300 })
  const dense = product({ id: "dense", proteinPerServing: 10, caloriesPerServing: 60 })
  assert.ok(goalScore(dense, "lose-fat") > goalScore(highProtein, "lose-fat"))
})

test("findUpgrades only returns products that score strictly higher than the current one", () => {
  const current = product({ id: "current", proteinPerServing: 15, caloriesPerServing: 200, pricePerServing: 2, proteinPerDollar: 7.5 })
  const worse = product({ id: "worse", proteinPerServing: 8, caloriesPerServing: 220 })
  const better = product({ id: "better", proteinPerServing: 25, caloriesPerServing: 190, pricePerServing: 2, proteinPerDollar: 12.5 })
  const upgrades = findUpgrades(current, [current, worse, better], "build-muscle", 3)
  assert.deepEqual(
    upgrades.map((u) => u.product.id),
    ["better"],
  )
  assert.equal(upgrades[0].deltas.protein, 10)
  assert.equal(upgrades[0].deltas.calories, -10)
})

test("findUpgrades never includes the current product itself", () => {
  const current = product({ id: "current", proteinPerServing: 15 })
  const upgrades = findUpgrades(current, [current], "build-muscle", 3)
  assert.deepEqual(upgrades, [])
})

test("findUpgrades leaves proteinPerDollar delta null when either side is unpriced", () => {
  const current = product({ id: "current", proteinPerServing: 10, pricePerServing: 0, proteinPerDollar: 0 })
  const better = product({ id: "better", proteinPerServing: 30, pricePerServing: 2, proteinPerDollar: 15 })
  const upgrades = findUpgrades(current, [current, better], "build-muscle", 3)
  assert.equal(upgrades[0].deltas.proteinPerDollar, null)
})

test("searchProducts matches on brand or name, case-insensitively, and ignores short queries", () => {
  const products = [
    product({ id: "quest-bar", name: "Chocolate Chip Cookie Dough", brand: "Quest" }),
    product({ id: "rxbar", name: "Peanut Butter", brand: "RXBAR" }),
  ]
  assert.deepEqual(searchProducts(products, "quest").map((p) => p.id), ["quest-bar"])
  assert.deepEqual(searchProducts(products, "PEANUT").map((p) => p.id), ["rxbar"])
  assert.deepEqual(searchProducts(products, "q"), [])
})

test("explainMatch never throws on a zero-calorie or zero-price product", () => {
  const p = product({ caloriesPerServing: 0, pricePerServing: 0 })
  assert.doesNotThrow(() => explainMatch(p, "lose-fat"))
  assert.doesNotThrow(() => explainMatch(p, "build-muscle"))
})
