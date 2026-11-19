import { test } from "node:test"
import assert from "node:assert/strict"
import { sortProducts, CATEGORY_SORT_OPTIONS, type CategorySortOption } from "../lib/categorySort"
import type { Product } from "../lib/products"

// Minimal fixtures — only the fields each sort reads.
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

test("every declared sort option has a working comparator", () => {
  const sample = [product({ id: "a" }), product({ id: "b" })]
  for (const { value } of CATEGORY_SORT_OPTIONS) {
    assert.doesNotThrow(() => sortProducts(sample, value))
  }
})

test("sortProducts never mutates the input array", () => {
  const input = [
    product({ id: "low", proteinPerServing: 5 }),
    product({ id: "high", proteinPerServing: 25 }),
  ]
  const inputCopy = [...input]
  sortProducts(input, "protein-desc")
  assert.deepEqual(input, inputCopy, "input array order changed")
})

test("protein-desc sorts highest protein first", () => {
  const sorted = sortProducts(
    [product({ id: "low", proteinPerServing: 5 }), product({ id: "high", proteinPerServing: 25 })],
    "protein-desc",
  )
  assert.deepEqual(sorted.map((p) => p.id), ["high", "low"])
})

test("protein-per-dollar-desc sorts best value first", () => {
  const sorted = sortProducts(
    [product({ id: "weak", proteinPerDollar: 4 }), product({ id: "best", proteinPerDollar: 20 })],
    "protein-per-dollar-desc",
  )
  assert.deepEqual(sorted.map((p) => p.id), ["best", "weak"])
})

test("price-asc sorts cheapest first and pushes unpriced items to the end", () => {
  const sorted = sortProducts(
    [
      product({ id: "unpriced", pricePerServing: 0 }),
      product({ id: "expensive", pricePerServing: 4.5 }),
      product({ id: "cheap", pricePerServing: 1.2 }),
    ],
    "price-asc",
  )
  assert.deepEqual(sorted.map((p) => p.id), ["cheap", "expensive", "unpriced"])
})

test("calories-asc and sugar-asc sort ascending", () => {
  const byCalories = sortProducts(
    [product({ id: "high", caloriesPerServing: 220 }), product({ id: "low", caloriesPerServing: 90 })],
    "calories-asc",
  )
  assert.deepEqual(byCalories.map((p) => p.id), ["low", "high"])

  const bySugar = sortProducts(
    [product({ id: "sweet", sugarPerServing: 12 }), product({ id: "plain", sugarPerServing: 1 })],
    "sugar-asc",
  )
  assert.deepEqual(bySugar.map((p) => p.id), ["plain", "sweet"])
})
