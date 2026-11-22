import { test } from "node:test"
import assert from "node:assert/strict"
import { guides, getAllGuideSlugs } from "../data/guides"
import { getAllProducts } from "../lib/products"
import { CATEGORY_THRESHOLDS as T } from "../lib/categoryFilters"

const products = getAllProducts()
const byId = new Map(products.map((p) => [p.id, p]))
const guideSlugs = new Set(getAllGuideSlugs())

test("every guide's recommendedSnackIds resolve to a real, current product", () => {
  for (const guide of guides) {
    for (const id of guide.recommendedSnackIds) {
      assert.ok(byId.has(id), `${guide.slug} recommends "${id}", which is not a product in data/products`)
    }
  }
})

test("every guide's relatedGuideIds resolve to a real guide slug", () => {
  for (const guide of guides) {
    for (const slug of guide.relatedGuideIds ?? []) {
      assert.ok(guideSlugs.has(slug), `${guide.slug} relatedGuideIds references unknown guide "${slug}"`)
    }
  }
})

test("a guide never renders the same live comparison table twice", () => {
  // Each section with type "comparison" renders the SAME recommendedProducts
  // table (see app/guides/[slug]/page.tsx) under its own heading. A second
  // "comparison" section on the same guide is always an exact duplicate of
  // the first, not a different table.
  for (const guide of guides) {
    const comparisonSections = guide.content.sections.filter((s) => s.type === "comparison")
    assert.ok(
      comparisonSections.length <= 1,
      `${guide.slug} has ${comparisonSections.length} "comparison" sections, which renders the same table more than once`,
    )
  }
})

test("the vegan guide only recommends products flagged vegan", () => {
  const guide = guides.find((g) => g.slug === "best-vegan-high-protein-snacks")
  assert.ok(guide, "best-vegan-high-protein-snacks guide not found")
  for (const id of guide!.recommendedSnackIds) {
    const product = byId.get(id)
    assert.ok(product?.flags.vegan, `${id} is recommended in the vegan guide but is not flagged vegan`)
  }
})

test("the muscle-building guide only recommends products within the high-protein threshold", () => {
  const guide = guides.find((g) => g.slug === "best-high-protein-snacks-for-muscle-building")
  assert.ok(guide, "best-high-protein-snacks-for-muscle-building guide not found")
  for (const id of guide!.recommendedSnackIds) {
    const product = byId.get(id)
    assert.ok(
      product && product.proteinPerServing >= T.highProteinMinProteinG,
      `${id} has ${product?.proteinPerServing}g protein, under the ${T.highProteinMinProteinG}g high-protein threshold`,
    )
  }
})

test("the low-sugar guide only recommends products within the low-sugar threshold", () => {
  const guide = guides.find((g) => g.slug === "best-low-sugar-high-protein-snacks")
  assert.ok(guide, "best-low-sugar-high-protein-snacks guide not found")
  for (const id of guide!.recommendedSnackIds) {
    const product = byId.get(id)
    assert.ok(
      product && product.sugarPerServing <= T.lowSugarMaxSugarG,
      `${id} has ${product?.sugarPerServing}g sugar, over the ${T.lowSugarMaxSugarG}g low-sugar threshold`,
    )
  }
})

test("the budget guide only recommends products meeting its own stated criteria", () => {
  // No shared "budget" category threshold exists in lib/categoryFilters.ts;
  // these are the guide's own documented selection criteria (see its "How
  // We Picked These Budget Snacks" section) — max $2.00/serving, min 12g
  // protein, 120-260 calories, at least 7g of protein per dollar. Guards
  // against the same silent drift fixed on 2026-11-23 (stale picks that no
  // longer matched the live Protein Value Index ranking).
  const guide = guides.find((g) => g.slug === "best-budget-snacks")
  assert.ok(guide, "best-budget-snacks guide not found")
  for (const id of guide!.recommendedSnackIds) {
    const product = byId.get(id)
    assert.ok(product, `${id} is recommended in the budget guide but is not a real product`)
    assert.ok(
      product!.pricePerServing > 0 && product!.pricePerServing <= 2.0,
      `${id} costs $${product!.pricePerServing}, over the guide's $2.00 budget ceiling`,
    )
    assert.ok(
      product!.proteinPerServing >= 12,
      `${id} has ${product!.proteinPerServing}g protein, under the guide's 12g minimum`,
    )
    assert.ok(
      product!.caloriesPerServing >= 120 && product!.caloriesPerServing <= 260,
      `${id} has ${product!.caloriesPerServing} calories, outside the guide's 120-260 range`,
    )
    assert.ok(
      product!.proteinPerDollar >= 7,
      `${id} delivers ${product!.proteinPerDollar}g of protein per dollar, under the guide's 7g/$1 floor`,
    )
  }
})
