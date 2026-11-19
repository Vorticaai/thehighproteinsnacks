import type { Product } from "@/lib/products"
import { absoluteUrl } from "@/lib/seo"
import { explainMatch, type MatchCriteria, type MatchGoal, type Upgrade } from "@/lib/snackMatch"

/**
 * Plain hand-written HTML with inline styles — no @react-email/components or
 * other template-rendering dependency. These emails are short and this
 * keeps the "low-cost, simple" email setup to one extra package (resend)
 * instead of two.
 */

const BRAND_GREEN = "#006F6D"
const WRAPPER_STYLE =
  "font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; color: #1f2937; max-width: 560px; margin: 0 auto;"

function priceText(product: Product) {
  return product.pricePerServing > 0 ? `~$${product.pricePerServing.toFixed(2)}/serving` : "price not recorded yet"
}

function productRow(product: Product, goal: MatchGoal) {
  const url = absoluteUrl(`/snacks/${product.id}`)
  return `
    <tr>
      <td style="padding: 14px 0; border-bottom: 1px solid #e5e7eb;">
        <a href="${url}" style="color:${BRAND_GREEN}; text-decoration:none; font-weight:700; font-size:15px;">${product.name}</a>
        <div style="color:#6b7280; font-size:12px; text-transform:uppercase; letter-spacing:0.04em; margin-top:2px;">${product.brand}</div>
        <div style="color:#374151; font-size:13px; margin-top:6px;">${explainMatch(product, goal)} · ${priceText(product)}</div>
      </td>
    </tr>`
}

function footer(revisitUrl: string) {
  return `
    <p style="margin-top:28px; font-size:13px; color:#6b7280;">
      Bookmark your results: <a href="${revisitUrl}" style="color:${BRAND_GREEN};">${revisitUrl}</a>
    </p>
    <p style="font-size:12px; color:#9ca3af; margin-top:18px;">
      Prices are estimates and change often — check the retailer for the current price. Dietary tags
      reflect product information we hold, not independent certification. Nutrition numbers are
      verified against manufacturer or USDA label data where noted on each product's page; otherwise
      they're from our own research.
    </p>
    <p style="font-size:12px; color:#9ca3af;">The High Protein Snacks · thehighproteinsnacks.com</p>`
}

export function renderMatchEmail(params: { matches: Product[]; criteria: MatchCriteria; revisitUrl: string }): string {
  const goalLabel = params.criteria.goal === "build-muscle" ? "building muscle" : "losing fat"
  const rows = params.matches.map((p) => productRow(p, params.criteria.goal)).join("")
  return `
    <div style="${WRAPPER_STYLE}">
      <h1 style="font-size:20px; margin-bottom:4px;">Your protein snack matches</h1>
      <p style="color:#374151; font-size:14px;">
        Picked for ${goalLabel}, ranked by what matters most for that goal.
      </p>
      <table style="width:100%; border-collapse:collapse; margin-top:12px;">${rows}</table>
      ${footer(params.revisitUrl)}
    </div>`
}

export function renderUpgradeEmail(params: {
  current: Product
  upgrades: Upgrade[]
  goal: MatchGoal
  revisitUrl: string
}): string {
  const { current, upgrades, goal } = params
  const goalLabel = goal === "build-muscle" ? "building muscle" : "losing fat"

  if (upgrades.length === 0) {
    return `
      <div style="${WRAPPER_STYLE}">
        <h1 style="font-size:20px; margin-bottom:4px;">Good news about ${current.name}</h1>
        <p style="color:#374151; font-size:14px;">
          For ${goalLabel}, ${current.name} is already one of the stronger options in our database —
          we couldn't find anything that clearly beats it on protein, calories, sugar or value.
        </p>
        ${footer(params.revisitUrl)}
      </div>`
  }

  const rows = upgrades
    .map(({ product, deltas }) => {
      const url = absoluteUrl(`/snacks/${product.id}`)
      const deltaLine = [
        deltas.protein !== 0 ? `${deltas.protein > 0 ? "+" : ""}${deltas.protein}g protein` : null,
        deltas.calories !== 0 ? `${deltas.calories > 0 ? "+" : ""}${deltas.calories} calories` : null,
        deltas.sugar !== 0 ? `${deltas.sugar > 0 ? "+" : ""}${deltas.sugar}g sugar` : null,
        deltas.proteinPerDollar !== null && deltas.proteinPerDollar !== 0
          ? `${deltas.proteinPerDollar > 0 ? "+" : ""}${deltas.proteinPerDollar}g protein per $`
          : null,
      ]
        .filter(Boolean)
        .join(" · ")
      return `
        <tr>
          <td style="padding: 14px 0; border-bottom: 1px solid #e5e7eb;">
            <a href="${url}" style="color:${BRAND_GREEN}; text-decoration:none; font-weight:700; font-size:15px;">${product.name}</a>
            <div style="color:#6b7280; font-size:12px; text-transform:uppercase; letter-spacing:0.04em; margin-top:2px;">${product.brand}</div>
            <div style="color:#15803d; font-size:13px; margin-top:6px; font-weight:600;">${deltaLine || "A better overall match for your goal"}</div>
            <div style="color:#374151; font-size:13px; margin-top:4px;">${explainMatch(product, goal)} · ${priceText(product)}</div>
          </td>
        </tr>`
    })
    .join("")

  return `
    <div style="${WRAPPER_STYLE}">
      <h1 style="font-size:20px; margin-bottom:4px;">Better than ${current.name}, for ${goalLabel}</h1>
      <p style="color:#374151; font-size:14px;">
        You're currently eating <strong>${current.name}</strong> (${current.proteinPerServing}g protein,
        ${current.caloriesPerServing} calories, ${current.sugarPerServing}g sugar, ${priceText(current)}).
        Here's what beats it:
      </p>
      <table style="width:100%; border-collapse:collapse; margin-top:12px;">${rows}</table>
      ${footer(params.revisitUrl)}
    </div>`
}
