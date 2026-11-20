import type { Product } from "@/lib/products"
import { absoluteUrl } from "@/lib/seo"
import {
  explainMatch,
  deltasFrom,
  DIET_TAG_LABELS,
  type MatchCriteria,
  type MatchGoal,
  type Upgrade,
  type DietTag,
} from "@/lib/snackMatch"

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

/**
 * Snack Match Notify — the standing "tell me when something better shows
 * up" subscription (lib/snackNotify.ts), distinct from the one-off emails
 * above. These link to the manage page, not a revisit link: an ongoing
 * subscription is something to edit or cancel, not just re-view.
 */

function notifyFooter(manageUrl: string) {
  return `
    <p style="margin-top:28px; font-size:13px; color:#6b7280;">
      <a href="${manageUrl}" style="color:${BRAND_GREEN};">Manage your notification preferences or unsubscribe</a>
    </p>
    <p style="font-size:12px; color:#9ca3af; margin-top:18px;">
      Prices are estimates and change often — check the retailer for the current price. Dietary tags
      reflect product information we hold, not independent certification; nutrition numbers are
      verified against manufacturer or USDA label data where noted on each product's page, otherwise
      they're from our own research. We only send this when something in our database actually
      changes for the better for you — no routine or promotional emails.
    </p>
    <p style="font-size:12px; color:#9ca3af;">The High Protein Snacks · thehighproteinsnacks.com</p>`
}

function dietSummary(dietTags: DietTag[]): string {
  if (dietTags.length === 0) return ""
  return ` that are ${dietTags.map((t) => DIET_TAG_LABELS[t]).join(", ")}`
}

/** Sent once, right when someone subscribes or updates their preferences — never a routine resend. */
export function renderNotifySubscriptionEmail(params: {
  kind: "welcome" | "updated"
  mode: "match" | "upgrade"
  goal: MatchGoal
  dietTags: DietTag[]
  currentSnackName?: string
  pick: Product | null
  manageUrl: string
}): string {
  const { kind, mode, goal, dietTags, currentSnackName, pick, manageUrl } = params
  const goalLabel = goal === "build-muscle" ? "building muscle" : "losing fat"
  const heading =
    kind === "welcome" ? "You're subscribed to Snack Match Notify" : "Your Snack Match Notify preferences are updated"

  const intro =
    mode === "match"
      ? `We'll email you when a new or updated snack in our database${dietSummary(dietTags)} is a meaningfully better match for ${goalLabel} than what you have now.`
      : `We'll email you when something${dietSummary(dietTags)} meaningfully beats ${currentSnackName ?? "your current snack"} for ${goalLabel}.`

  const pickSection = pick
    ? `<p style="color:#374151; font-size:14px; margin-top:16px;">Right now, that's:</p>
       <table style="width:100%; border-collapse:collapse; margin-top:8px;">${productRow(pick, goal)}</table>`
    : `<p style="color:#374151; font-size:14px; margin-top:16px;">
         We don't have a match for these exact preferences yet — we'll email you as soon as one shows up.
       </p>`

  return `
    <div style="${WRAPPER_STYLE}">
      <h1 style="font-size:20px; margin-bottom:4px;">${heading}</h1>
      <p style="color:#374151; font-size:14px;">${intro}</p>
      ${pickSection}
      ${notifyFooter(manageUrl)}
    </div>`
}

/** The actual "we found something better" alert — the only recurring email this subscription sends, and only when it's earned. */
export function renderNotifyAlertEmail(params: {
  mode: "match" | "upgrade"
  goal: MatchGoal
  pick: Product
  baseline: Product | null
  manageUrl: string
}): string {
  const { mode, goal, pick, baseline, manageUrl } = params
  const goalLabel = goal === "build-muscle" ? "building muscle" : "losing fat"
  const url = absoluteUrl(`/snacks/${pick.id}`)

  const deltaLine = baseline
    ? (() => {
        const d = deltasFrom(baseline, pick)
        return [
          d.protein !== 0 ? `${d.protein > 0 ? "+" : ""}${d.protein}g protein` : null,
          d.calories !== 0 ? `${d.calories > 0 ? "+" : ""}${d.calories} calories` : null,
          d.sugar !== 0 ? `${d.sugar > 0 ? "+" : ""}${d.sugar}g sugar` : null,
          d.proteinPerDollar !== null && d.proteinPerDollar !== 0
            ? `${d.proteinPerDollar > 0 ? "+" : ""}${d.proteinPerDollar}g protein per $`
            : null,
        ]
          .filter(Boolean)
          .join(" · ")
      })()
    : null

  return `
    <div style="${WRAPPER_STYLE}">
      <h1 style="font-size:20px; margin-bottom:4px;">We found a better match for ${goalLabel}</h1>
      <p style="color:#374151; font-size:14px;">
        A ${mode === "upgrade" ? "better alternative to your current snack" : "new top match for your preferences"}
        just showed up in our database:
      </p>
      <table style="width:100%; border-collapse:collapse; margin-top:12px;">
        <tr>
          <td style="padding: 14px 0; border-bottom: 1px solid #e5e7eb;">
            <a href="${url}" style="color:${BRAND_GREEN}; text-decoration:none; font-weight:700; font-size:15px;">${pick.name}</a>
            <div style="color:#6b7280; font-size:12px; text-transform:uppercase; letter-spacing:0.04em; margin-top:2px;">${pick.brand}</div>
            ${deltaLine ? `<div style="color:#15803d; font-size:13px; margin-top:6px; font-weight:600;">${deltaLine}</div>` : ""}
            <div style="color:#374151; font-size:13px; margin-top:4px;">${explainMatch(pick, goal)} · ${priceText(pick)}</div>
          </td>
        </tr>
      </table>
      ${notifyFooter(manageUrl)}
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
