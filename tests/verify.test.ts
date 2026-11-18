import { test } from "node:test"
import assert from "node:assert/strict"
import { agrees, decide, disagreements, energyCheck, plausibilityProblems } from "../pipeline/verify"

const questLabel = { protein: 21, calories: 190, carbs: 22, fiber: 14, sugar: 1, fat: 8, servingSizeG: 60 }

test("agrees uses 10% with a 1 g / 10 kcal floor", () => {
  assert.equal(agrees("protein", 21, 22), true)
  assert.equal(agrees("protein", 21, 24), false)
  assert.equal(agrees("sugar", 0, 1), true)
  assert.equal(agrees("calories", 190, 200), true)
  assert.equal(agrees("calories", 190, 215), false)
})

test("energy check allows a wider band for high-fiber bars", () => {
  assert.equal(energyCheck(questLabel).ok, true)
  assert.equal(energyCheck({ protein: 5, carbs: 5, fat: 13, calories: 210, fiber: 0 }).ok, false)
})

test("plausibility catches impossible labels", () => {
  assert.deepEqual(plausibilityProblems(questLabel), [])
  assert.ok(plausibilityProblems({ ...questLabel, sugar: 30 }).some((p) => p.includes("sugar")))
  assert.ok(plausibilityProblems({ ...questLabel, fiber: 30 }).some((p) => p.includes("fiber")))
  assert.ok(plausibilityProblems({ ...questLabel, protein: undefined }).some((p) => p.includes("missing")))
})

test("disagreements lists fields outside tolerance", () => {
  assert.deepEqual(disagreements(questLabel, { ...questLabel, protein: 20 }), [])
  assert.deepEqual(disagreements(questLabel, { ...questLabel, carbs: 4 }), ["carbs: 22 vs 4"])
})

test("decide only verifies a confident, plausible, uncontradicted USDA record", () => {
  assert.equal(decide({ primary: questLabel, primaryConfident: true, secondary: null }).status, "verified")
  assert.equal(decide({ primary: questLabel, primaryConfident: true, secondary: questLabel }).status, "verified")
  assert.equal(decide({ primary: questLabel, primaryConfident: false, secondary: null }).status, "needs-review")
  assert.equal(decide({ primary: null, primaryConfident: false, secondary: questLabel }).status, "needs-review")
  assert.equal(
    decide({ primary: questLabel, primaryConfident: true, secondary: { ...questLabel, protein: 10 } }).status,
    "needs-review",
  )
})
