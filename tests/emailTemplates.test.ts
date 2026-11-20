import { test } from "node:test"
import assert from "node:assert/strict"
import type { Product } from "../lib/products"
import {
  renderMatchEmail,
  renderUpgradeEmail,
  renderNotifySubscriptionEmail,
  renderNotifyAlertEmail,
} from "../lib/emailTemplates"
import type { MatchCriteria, Upgrade } from "../lib/snackMatch"

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

const criteria: MatchCriteria = {
  goal: "build-muscle",
  minProtein: 20,
  calorieBand: "any",
  budgetBand: "any",
  dietTags: ["vegan", "gluten-free"],
}

/**
 * Every template should share the same brand shell (logo, lime accent,
 * light-mode meta tags, bulletproof Outlook wrapper) — this is what makes
 * them read as one product instead of four different emails.
 */
function assertSharedShell(html: string) {
  assert.match(html, /logo-highproteinsnacks\.png/, "should include the site logo")
  assert.match(html, /name="color-scheme" content="light"/, "should pin light mode so auto dark mode can't invert the palette")
  assert.match(html, /<!--\[if mso\]>/, "should include the Outlook bulletproof wrapper")
  assert.match(html, /role="presentation"/, "layout tables should be marked presentational for screen readers")
  assert.match(html, /The High Protein Snacks/, "footer should carry the site name")
}

test("renderMatchEmail renders the top pick as a hero card with macros, preferences and a CTA to the real product page", () => {
  const top = product({ id: "top-pick", name: "Top Pick Bar", brand: "Acme", proteinPerServing: 25, caloriesPerServing: 180, sugarPerServing: 2, pricePerServing: 2.5 })
  const second = product({ id: "second-pick", name: "Second Pick", brand: "Beta" })
  const html = renderMatchEmail({ matches: [top, second], criteria, revisitUrl: "https://example.com/quiz?x=1" })

  assertSharedShell(html)
  assert.match(html, /Top Pick Bar/)
  assert.match(html, /25g/, "protein tile")
  assert.match(html, /180/, "calories tile")
  assert.match(html, /\$2\.50\/srv/, "value tile")
  assert.match(html, /href="https:\/\/www\.thehighproteinsnacks\.com\/snacks\/top-pick"/, "CTA should link to the actual recommendation's page")
  assert.match(html, /View This Snack/)
  assert.match(html, /Also worth a look/, "remaining matches should appear as a secondary list, not a second hero card")
  assert.match(html, /Second Pick/)
  assert.match(html, /Building muscle/, "preferences box should show the goal")
  assert.match(html, /Vegan, Gluten-free/, "preferences box should show the dietary filters")
  assert.match(html, /Bookmark your results/)
  assert.match(html, /https:\/\/example\.com\/quiz\?x=1/)
})

test("renderMatchEmail with a single match has no 'also worth a look' section", () => {
  const top = product({ id: "only", name: "Only One" })
  const html = renderMatchEmail({ matches: [top], criteria, revisitUrl: "https://example.com/quiz" })
  assert.doesNotMatch(html, /Also worth a look/)
})

test("renderUpgradeEmail shows a positive-change badge and the current snack as 'watching'", () => {
  const current = product({ id: "current", name: "Current Snack", proteinPerServing: 15, caloriesPerServing: 200, sugarPerServing: 8, pricePerServing: 2 })
  const better = product({ id: "better", name: "Better Snack", brand: "Gamma", proteinPerServing: 22, caloriesPerServing: 190, sugarPerServing: 3, pricePerServing: 2 })
  const upgrades: Upgrade[] = [
    { product: better, deltas: { protein: 7, calories: -10, sugar: -5, proteinPerDollar: 3.5 } },
  ]
  const html = renderUpgradeEmail({ current, upgrades, goal: "build-muscle", revisitUrl: "https://example.com/quiz?mode=upgrade" })

  assertSharedShell(html)
  assert.match(html, /Watching:.*Current Snack/)
  assert.match(html, /Better Snack/)
  assert.match(html, /\+7g protein/)
  assert.match(html, /View This Upgrade/)
})

test("renderUpgradeEmail with no upgrades shows the 'already great' message, no product card", () => {
  const current = product({ id: "current", name: "Already Great" })
  const html = renderUpgradeEmail({ current, upgrades: [], goal: "lose-fat", revisitUrl: "https://example.com/quiz" })

  assertSharedShell(html)
  assert.match(html, /Good news about Already Great/)
  assert.match(html, /Losing fat/)
  assert.doesNotMatch(html, /View This Upgrade/)
})

test("renderNotifySubscriptionEmail (welcome, match mode) shows the pick as the centrepiece and a manage/unsubscribe link", () => {
  const pick = product({ id: "pick", name: "Welcome Pick", proteinPerServing: 30, caloriesPerServing: 160, sugarPerServing: 1, pricePerServing: 3 })
  const html = renderNotifySubscriptionEmail({
    kind: "welcome",
    mode: "match",
    goal: "build-muscle",
    dietTags: ["keto"],
    pick,
    manageUrl: "https://example.com/snack-notify/manage?email=a@b.com&token=t",
  })

  assertSharedShell(html)
  assert.match(html, /You're subscribed to Snack Match Notify/)
  assert.match(html, /Welcome Pick/)
  assert.match(html, /View My Snack Match/, "CTA copy should match the spec exactly")
  assert.match(html, /Keto/)
  assert.match(html, /Manage preferences &amp; unsubscribe/)
  assert.match(html, /href="https:\/\/example\.com\/snack-notify\/manage\?email=a@b\.com&token=t"/)
  assert.match(html, /no routine or promotional emails/)
})

test("renderNotifySubscriptionEmail (updated, upgrade mode) names the current snack and has no pick section when there's no match yet", () => {
  const html = renderNotifySubscriptionEmail({
    kind: "updated",
    mode: "upgrade",
    goal: "lose-fat",
    dietTags: [],
    currentSnackName: "My Current Bar",
    pick: null,
    manageUrl: "https://example.com/manage",
  })

  assert.match(html, /Your Snack Match Notify preferences are updated/)
  assert.match(html, /My Current Bar/)
  assert.match(html, /No dietary filters set/)
  assert.match(html, /we'll email you as soon as one shows up/)
})

test("renderNotifyAlertEmail shows the delta badge against the baseline and the subscriber's diet tags", () => {
  const baseline = product({ id: "baseline", name: "Old Snack", proteinPerServing: 15, caloriesPerServing: 200, sugarPerServing: 8, pricePerServing: 2 })
  const pick = product({ id: "pick", name: "New Better Snack", proteinPerServing: 22, caloriesPerServing: 190, sugarPerServing: 3, pricePerServing: 2 })
  const html = renderNotifyAlertEmail({
    mode: "upgrade",
    goal: "build-muscle",
    dietTags: ["vegan"],
    pick,
    baseline,
    manageUrl: "https://example.com/manage",
  })

  assertSharedShell(html)
  assert.match(html, /We found a better match/)
  assert.match(html, /New Better Snack/)
  assert.match(html, /\+7g protein/)
  assert.match(html, /Vegan/)
  assert.match(html, /View My Snack Match/)
})

test("renderNotifyAlertEmail with no baseline shows no delta badge but still renders the pick", () => {
  const pick = product({ id: "pick", name: "First Ever Pick" })
  const html = renderNotifyAlertEmail({
    mode: "match",
    goal: "build-muscle",
    dietTags: [],
    pick,
    baseline: null,
    manageUrl: "https://example.com/manage",
  })
  assert.match(html, /First Ever Pick/)
  assert.doesNotMatch(html, /g protein<\/span>/)
})

test("product image is shown with its license credit next to it when present, and omitted cleanly when absent", () => {
  const withImage = product({
    id: "with-image",
    name: "Photographed Snack",
    image: {
      src: "/products/photographed-snack.jpg",
      alt: "Photographed Snack package",
      credit: "Open Food Facts contributors",
      license: "CC BY-SA 3.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
      sourceUrl: "https://world.openfoodfacts.org/product/0000",
    },
  })
  const withoutImage = product({ id: "no-image", name: "Unphotographed Snack" })

  const htmlWith = renderNotifySubscriptionEmail({
    kind: "welcome",
    mode: "match",
    goal: "build-muscle",
    dietTags: [],
    pick: withImage,
    manageUrl: "https://example.com/manage",
  })
  assert.match(htmlWith, /products\/photographed-snack\.jpg/)
  assert.match(htmlWith, /Photographed Snack package/, "alt text should be present for accessibility / images-off")
  assert.match(htmlWith, /Open Food Facts contributors, CC BY-SA 3\.0/, "CC BY-SA credit must stay next to the image")

  const htmlWithout = renderNotifySubscriptionEmail({
    kind: "welcome",
    mode: "match",
    goal: "build-muscle",
    dietTags: [],
    pick: withoutImage,
    manageUrl: "https://example.com/manage",
  })
  assert.doesNotMatch(htmlWithout, /<img[^>]*products\//, "no product <img> should render when there's no licensed photo")
})

test("product name and macro values are real text, not only pixels inside an image — readable with images switched off", () => {
  const pick = product({ id: "pick", name: "Readable Snack", brand: "Readable Brand", proteinPerServing: 28, caloriesPerServing: 170, sugarPerServing: 4, pricePerServing: 1.75 })
  const html = renderNotifyAlertEmail({
    mode: "match",
    goal: "build-muscle",
    dietTags: [],
    pick,
    baseline: null,
    manageUrl: "https://example.com/manage",
  })
  // Strip every <img ...> tag; the content that matters must survive outside them.
  const withoutImages = html.replace(/<img[^>]*>/g, "")
  for (const expected of ["Readable Snack", "Readable Brand", "28g", "170", "4g", "1.75", "View My Snack Match"]) {
    assert.ok(withoutImages.includes(expected), `expected "${expected}" to remain as real text once images are stripped`)
  }
})

test("product name and brand are HTML-escaped so special characters can't break the markup", () => {
  const pick = product({ id: "pick", name: `R&D Snack <Bar>`, brand: `Mom's "Best"` })
  const html = renderNotifyAlertEmail({
    mode: "match",
    goal: "build-muscle",
    dietTags: [],
    pick,
    baseline: null,
    manageUrl: "https://example.com/manage",
  })
  assert.match(html, /R&amp;D Snack &lt;Bar&gt;/)
  assert.match(html, /Mom&#39;s &quot;Best&quot;/)
  assert.doesNotMatch(html, /<Bar>/)
})
