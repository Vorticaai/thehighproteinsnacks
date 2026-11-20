import { test } from "node:test"
import assert from "node:assert/strict"
import type { Product } from "../lib/products"
import {
  computeNotifyPick,
  getBaselineProduct,
  isMeaningfulImprovement,
  propertiesToSubscription,
  subscriptionToProperties,
  type NotifySubscription,
} from "../lib/snackNotify"

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

function baseSub(overrides: Partial<NotifySubscription> = {}): NotifySubscription {
  return {
    mode: "match",
    goal: "build-muscle",
    dietTags: [],
    minProtein: 0,
    calorieBand: "any",
    budgetBand: "any",
    productId: null,
    lastNotifiedProductId: null,
    notifyActive: true,
    manageToken: "token-123",
    ...overrides,
  }
}

test("subscriptionToProperties / propertiesToSubscription round-trip (match mode)", () => {
  const sub = baseSub({ dietTags: ["vegan", "low-sugar"], minProtein: 15, calorieBand: "under150", budgetBand: "under250c" })
  const props = subscriptionToProperties(sub)
  const bag = Object.fromEntries(
    Object.entries(props).map(([k, v]) => [k, { type: typeof v === "number" ? "number" : "string", value: v }]),
  ) as any
  const decoded = propertiesToSubscription(bag)
  assert.deepEqual(decoded, sub)
})

test("subscriptionToProperties / propertiesToSubscription round-trip (upgrade mode)", () => {
  const sub = baseSub({ mode: "upgrade", productId: "p1", lastNotifiedProductId: "p2" })
  const props = subscriptionToProperties(sub)
  const bag = Object.fromEntries(
    Object.entries(props).map(([k, v]) => [k, { type: typeof v === "number" ? "number" : "string", value: v }]),
  ) as any
  const decoded = propertiesToSubscription(bag)
  assert.deepEqual(decoded, sub)
})

test("propertiesToSubscription rejects an invalid mode", () => {
  assert.equal(propertiesToSubscription({ notifyMode: { type: "string", value: "bogus" } } as any), null)
})

test("propertiesToSubscription rejects upgrade mode with no productId", () => {
  const bag = {
    notifyMode: { type: "string", value: "upgrade" },
    notifyGoal: { type: "string", value: "lose-fat" },
  } as any
  assert.equal(propertiesToSubscription(bag), null)
})

test("computeNotifyPick (match mode) returns the top-ranked candidate", () => {
  const products = [
    product({ id: "low", proteinPerServing: 10 }),
    product({ id: "high", proteinPerServing: 25 }),
  ]
  const sub = baseSub({ mode: "match", goal: "build-muscle" })
  const { product: pick, skippedReason } = computeNotifyPick(sub, products)
  assert.equal(pick?.id, "high")
  assert.equal(skippedReason, null)
})

test("computeNotifyPick (match mode) reports 'relaxed' rather than returning a silently loosened pick", () => {
  const products = [product({ id: "only", proteinPerServing: 20, caloriesPerServing: 300 })]
  const sub = baseSub({ mode: "match", minProtein: 10, calorieBand: "under150" })
  const { product: pick, skippedReason } = computeNotifyPick(sub, products)
  assert.equal(pick, null)
  assert.equal(skippedReason, "relaxed")
})

test("computeNotifyPick (match mode) reports 'no-candidates' when nothing meets even the loosened bar", () => {
  const products = [product({ id: "only", proteinPerServing: 5 })]
  const sub = baseSub({ mode: "match", minProtein: 25 })
  const { product: pick, skippedReason } = computeNotifyPick(sub, products)
  assert.equal(pick, null)
  assert.equal(skippedReason, "no-candidates")
})

test("computeNotifyPick (upgrade mode) reports 'missing-current-product' when it's left the catalogue", () => {
  const products = [product({ id: "other" })]
  const sub = baseSub({ mode: "upgrade", productId: "gone" })
  const { product: pick, skippedReason } = computeNotifyPick(sub, products)
  assert.equal(pick, null)
  assert.equal(skippedReason, "missing-current-product")
})

test("computeNotifyPick (upgrade mode) finds a genuine upgrade", () => {
  const products = [
    product({ id: "current", proteinPerServing: 10 }),
    product({ id: "better", proteinPerServing: 20 }),
  ]
  const sub = baseSub({ mode: "upgrade", productId: "current" })
  const { product: pick, skippedReason } = computeNotifyPick(sub, products)
  assert.equal(pick?.id, "better")
  assert.equal(skippedReason, null)
})

test("computeNotifyPick (upgrade mode) returns null, not an error, when already the best", () => {
  const products = [
    product({ id: "current", proteinPerServing: 30 }),
    product({ id: "worse", proteinPerServing: 10 }),
  ]
  const sub = baseSub({ mode: "upgrade", productId: "current" })
  const { product: pick, skippedReason } = computeNotifyPick(sub, products)
  assert.equal(pick, null)
  assert.equal(skippedReason, null)
})

test("getBaselineProduct prefers the last-notified product when it's still around", () => {
  const products = [product({ id: "last" }), product({ id: "current" })]
  const sub = baseSub({ mode: "upgrade", productId: "current", lastNotifiedProductId: "last" })
  assert.equal(getBaselineProduct(sub, products)?.id, "last")
})

test("getBaselineProduct falls back to the subscriber's current snack (upgrade mode only)", () => {
  const products = [product({ id: "current" })]
  const sub = baseSub({ mode: "upgrade", productId: "current", lastNotifiedProductId: "no-longer-listed" })
  assert.equal(getBaselineProduct(sub, products)?.id, "current")
})

test("getBaselineProduct has no fallback for match mode with no prior notification", () => {
  const products = [product({ id: "x" })]
  const sub = baseSub({ mode: "match", lastNotifiedProductId: null })
  assert.equal(getBaselineProduct(sub, products), null)
})

test("isMeaningfulImprovement always true with no baseline to compare against", () => {
  assert.equal(isMeaningfulImprovement(product({ id: "a" }), null), true)
})

test("isMeaningfulImprovement is true past the protein-delta threshold", () => {
  const baseline = product({ id: "base", proteinPerServing: 10, pricePerServing: 0 })
  const candidate = product({ id: "cand", proteinPerServing: 13, pricePerServing: 0 })
  assert.equal(isMeaningfulImprovement(candidate, baseline), true)
})

test("isMeaningfulImprovement is true past the protein-per-dollar threshold even with a small protein delta", () => {
  const baseline = product({ id: "base", proteinPerServing: 10, pricePerServing: 5, proteinPerDollar: 2 })
  const candidate = product({ id: "cand", proteinPerServing: 11, pricePerServing: 2, proteinPerDollar: 5.5 })
  assert.equal(isMeaningfulImprovement(candidate, baseline), true)
})

test("isMeaningfulImprovement is false for a merely marginal difference", () => {
  const baseline = product({ id: "base", proteinPerServing: 10, pricePerServing: 2, proteinPerDollar: 5 })
  const candidate = product({ id: "cand", proteinPerServing: 11, pricePerServing: 2, proteinPerDollar: 5.5 })
  assert.equal(isMeaningfulImprovement(candidate, baseline), false)
})
