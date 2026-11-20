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
 * Hand-written, table-based HTML emails with inline styles — no
 * @react-email/components or other template-rendering dependency (keeps the
 * "low-cost, simple" email setup to one extra package: resend).
 *
 * Built to one shared brand design system (header, product card, macro
 * tiles, CTA button, footer) so the welcome email, the recurring "better
 * match" alert and the one-off "Email My Results" report all read as the
 * same product rather than three different emails bolted together.
 *
 * Email-client constraints baked in throughout:
 *  - table layout (role="presentation") everywhere, not flexbox/grid —
 *    Outlook's Word rendering engine and several mobile mail apps support
 *    neither.
 *  - every style inline; the one <style> block only adds optional
 *    refinements (a responsive tweak, font smoothing) nothing depends on.
 *  - every <img> has explicit sizing and real alt text, and no content that
 *    matters — name, brand, macros, price, the CTA itself — lives only
 *    inside an image, so the email stays fully readable with images
 *    switched off (Outlook's and many corporate inboxes' default).
 *  - a light-mode-only color-scheme hint, so Gmail/Apple Mail's automatic
 *    dark mode doesn't invert the brand palette into something illegible.
 *  - a bulletproof mso-conditional wrapper so Outlook desktop renders a
 *    fixed 600px column instead of collapsing the fluid table.
 */

// Brand Theme Colors — mirrors the --brand-* custom properties in
// app/globals.css (the homepage hero's palette), so the email and the site
// read as one brand rather than two.
const BRAND_DARK = "#085E52"
const BRAND_LIME = "#C6FF47"
const TEXT_ON_LIME = "#022E27"
const CREAM = "#F4E8E0"
const BODY_TEXT = "#1f2937"
const MUTED_TEXT = "#6b7280"
const FAINT_TEXT = "#9ca3af"
const BORDER = "#e5e7eb"
const CARD_BG = "#ffffff"
const SITE_NAME = "The High Protein Snacks"
const FONT_STACK = "-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function priceText(product: Product): string {
  return product.pricePerServing > 0 ? `~$${product.pricePerServing.toFixed(2)}/serving` : "price not recorded yet"
}

function goalLabel(goal: MatchGoal): string {
  return goal === "build-muscle" ? "Building muscle" : "Losing fat"
}

function goalWord(goal: MatchGoal): string {
  return goal === "build-muscle" ? "building muscle" : "losing fat"
}

function dietTagsLabel(dietTags: DietTag[]): string {
  if (dietTags.length === 0) return "No dietary filters set"
  return dietTags.map((t) => DIET_TAG_LABELS[t]).join(", ")
}

/** Used inline in a sentence, e.g. "...a snack that are Vegan, Keto...". Empty string when there's nothing to add. */
function dietSummary(dietTags: DietTag[]): string {
  if (dietTags.length === 0) return ""
  return ` that are ${dietTags.map((t) => DIET_TAG_LABELS[t]).join(", ")}`
}

/**
 * The outer document every email shares: light-mode-only meta tags, a
 * hidden preheader, the logo header, a lime accent strip, the content slot,
 * and the footer slot. Nothing below this line renders without going
 * through here, so a brand update only ever needs to happen in one place.
 */
function emailShell(params: { previewText: string; title: string; contentHtml: string; footerHtml: string }): string {
  const { previewText, title, contentHtml, footerHtml } = params
  const logoUrl = absoluteUrl("/logo-highproteinsnacks.png")
  const homeUrl = absoluteUrl("/")

  return `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="color-scheme" content="light" />
<meta name="supported-color-schemes" content="light" />
<title>${escapeHtml(title)}</title>
<!--[if mso]>
<noscript>
<xml>
<o:OfficeDocumentSettings>
<o:PixelsPerInch>96</o:PixelsPerInch>
</o:OfficeDocumentSettings>
</xml>
</noscript>
<![endif]-->
<style>
  body, table, td, a { font-family: ${FONT_STACK}; }
  body { -webkit-font-smoothing: antialiased; }
  img { -ms-interpolation-mode: bicubic; }
  a { text-decoration: none; }
  @media screen and (max-width: 600px) {
    .email-padding { padding-left: 20px !important; padding-right: 20px !important; }
  }
</style>
</head>
<body style="margin:0; padding:0; background-color:${CREAM}; -webkit-text-size-adjust:100%; text-size-adjust:100%;">
  <div style="display:none; max-height:0; overflow:hidden; mso-hide:all; font-size:1px; line-height:1px; color:${CREAM};">
    ${escapeHtml(previewText)}
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${CREAM};">
    <tr>
      <td align="center" style="padding:28px 12px;">
        <!--[if mso]>
        <table role="presentation" width="600" align="center" cellpadding="0" cellspacing="0" border="0"><tr><td>
        <![endif]-->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; margin:0 auto;">
          <tr>
            <td align="center" style="background-color:${CARD_BG}; border:1px solid ${BORDER}; border-bottom:none; border-radius:16px 16px 0 0; padding:28px 32px 22px;">
              <a href="${homeUrl}" style="display:inline-block;">
                <img src="${logoUrl}" width="200" alt="${SITE_NAME}" style="display:block; border:0; outline:none; width:200px; max-width:200px; height:auto;" />
              </a>
            </td>
          </tr>
          <tr>
            <td style="background-color:${BRAND_LIME}; height:4px; line-height:4px; font-size:0;">&nbsp;</td>
          </tr>
          <tr>
            <td class="email-padding" style="background-color:${CARD_BG}; border-left:1px solid ${BORDER}; border-right:1px solid ${BORDER}; padding:32px;">
              ${contentHtml}
            </td>
          </tr>
          <tr>
            <td class="email-padding" style="background-color:#fafaf9; border:1px solid ${BORDER}; border-top:none; border-radius:0 0 16px 16px; padding:24px 32px;">
              ${footerHtml}
            </td>
          </tr>
        </table>
        <!--[if mso]>
        </td></tr></table>
        <![endif]-->
      </td>
    </tr>
  </table>
</body>
</html>`
}

/** Small "Your preferences" tile shown on every email so a subscriber always sees exactly what's being tracked. */
function preferencesBox(params: { goal: MatchGoal; dietTags?: DietTag[]; watching?: string | null }): string {
  const { goal, dietTags, watching } = params
  const rows: string[] = [
    `<tr><td style="padding:3px 0; font-size:13px; color:${BODY_TEXT};">Goal: <strong style="color:${BRAND_DARK};">${escapeHtml(goalLabel(goal))}</strong></td></tr>`,
  ]
  if (dietTags !== undefined) {
    rows.push(
      `<tr><td style="padding:3px 0; font-size:13px; color:${BODY_TEXT};">Diet: <strong style="color:${BRAND_DARK};">${escapeHtml(dietTagsLabel(dietTags))}</strong></td></tr>`,
    )
  }
  if (watching) {
    rows.push(
      `<tr><td style="padding:3px 0; font-size:13px; color:${BODY_TEXT};">Watching: <strong style="color:${BRAND_DARK};">${escapeHtml(watching)}</strong></td></tr>`,
    )
  }
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${CREAM}; border-radius:12px; margin:18px 0;">
      <tr>
        <td style="padding:14px 18px;">
          <div style="font-size:10.5px; text-transform:uppercase; letter-spacing:0.06em; color:${BRAND_DARK}; font-weight:700; margin-bottom:4px;">
            Your preferences
          </div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows.join("")}</table>
        </td>
      </tr>
    </table>`
}

function ctaButton(url: string, label: string): string {
  return `
    <table role="presentation" align="center" cellpadding="0" cellspacing="0" style="margin:18px auto 0;">
      <tr>
        <td align="center" style="background-color:${BRAND_LIME}; border-radius:999px;">
          <a href="${url}" style="display:inline-block; padding:13px 30px; font-size:14px; font-weight:700; color:${TEXT_ON_LIME}; text-decoration:none; border-radius:999px;">
            ${escapeHtml(label)} &rarr;
          </a>
        </td>
      </tr>
    </table>`
}

function macroTile(value: string, label: string): string {
  return `
    <td width="50%" align="center" style="padding:4px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${CREAM}; border-radius:10px;">
        <tr>
          <td align="center" style="padding:12px 6px;">
            <div style="font-size:18px; font-weight:800; color:${BRAND_DARK}; line-height:1.2;">${escapeHtml(value)}</div>
            <div style="font-size:10px; text-transform:uppercase; letter-spacing:0.05em; color:${MUTED_TEXT}; margin-top:2px;">${escapeHtml(label)}</div>
          </td>
        </tr>
      </table>
    </td>`
}

/** A 2x2 grid rather than 4-across so it stays readable at phone widths without needing a media query. */
function macroGrid(product: Product): string {
  const valueText = product.pricePerServing > 0 ? `$${product.pricePerServing.toFixed(2)}/srv` : "N/A"
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:14px;">
      <tr>${macroTile(`${product.proteinPerServing}g`, "Protein")}${macroTile(`${product.caloriesPerServing}`, "Calories")}</tr>
      <tr>${macroTile(`${product.sugarPerServing}g`, "Sugar")}${macroTile(valueText, "Est. value")}</tr>
    </table>`
}

/**
 * The product's licensed photo, when there is one (about a quarter of the
 * catalogue — most products render this as nothing at all, which is fine,
 * the card reads cleanly either way). Photos are Open Food Facts CC BY-SA,
 * which requires the credit to stay next to the image — same rule
 * components/snacks/ProductVisual.tsx follows on the site itself. Width and
 * height are both set (a fixed 140x140 box, letterboxed via object-fit on
 * clients that support it) deliberately, even though that can very slightly
 * crop a tall package photo on the few clients that ignore object-fit —
 * the alternative (height left to "auto") lets a missing or blocked image's
 * alt text spill out of the card at full size with no bound, which is worse
 * on every client than a small, contained crop on one.
 */
function productImageBlock(product: Product): string {
  const image = product.image
  if (!image) return ""
  const src = absoluteUrl(image.src)
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
      <tr>
        <td align="center" style="background-color:${CREAM}; border-radius:12px; padding:16px;">
          <img src="${src}" width="140" height="140" alt="${escapeHtml(image.alt)}" style="display:block; border:0; outline:none; width:140px; height:140px; max-width:140px; object-fit:contain; background-color:${CREAM}; font-size:11px; line-height:1.4; color:${MUTED_TEXT}; font-family:${FONT_STACK};" />
        </td>
      </tr>
      <tr>
        <td align="center" style="padding-top:6px;">
          <span style="font-size:10px; color:${FAINT_TEXT};">Photo: ${escapeHtml(image.credit)}, ${escapeHtml(image.license)}</span>
        </td>
      </tr>
    </table>`
}

/** A small lime pill showing the real, explainable deltas vs. a baseline product — only rendered when there's something to show. */
function deltaBadge(baseline: Product | null, pick: Product): string {
  if (!baseline) return ""
  const d = deltasFrom(baseline, pick)
  const parts = [
    d.protein !== 0 ? `${d.protein > 0 ? "+" : ""}${d.protein}g protein` : null,
    d.calories !== 0 ? `${d.calories > 0 ? "+" : ""}${d.calories} cal` : null,
    d.sugar !== 0 ? `${d.sugar > 0 ? "+" : ""}${d.sugar}g sugar` : null,
    d.proteinPerDollar !== null && d.proteinPerDollar !== 0
      ? `${d.proteinPerDollar > 0 ? "+" : ""}${d.proteinPerDollar}g protein/$`
      : null,
  ].filter((v): v is string => Boolean(v))
  if (parts.length === 0) return ""
  return `
    <div style="margin-top:10px;">
      <span style="display:inline-block; background-color:${BRAND_LIME}; color:${TEXT_ON_LIME}; font-size:12px; font-weight:700; padding:5px 12px; border-radius:999px;">
        ${escapeHtml(parts.join(" · "))}
      </span>
    </div>`
}

/** The visual centrepiece: image (if any), name, macro grid, why it matched, and the CTA to the actual product page. */
function heroProductCard(params: { product: Product; goal: MatchGoal; badgeHtml?: string; ctaLabel: string }): string {
  const { product, goal, badgeHtml = "", ctaLabel } = params
  const url = absoluteUrl(`/snacks/${product.id}`)
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${BORDER}; border-radius:14px; margin-top:6px;">
      <tr>
        <td style="padding:22px;">
          ${productImageBlock(product)}
          <div style="text-align:center;">
            <div style="font-size:11px; text-transform:uppercase; letter-spacing:0.05em; color:${MUTED_TEXT}; font-weight:600;">${escapeHtml(product.brand)}</div>
            <a href="${url}" style="display:inline-block; margin-top:4px; font-size:20px; font-weight:800; color:${BRAND_DARK}; text-decoration:none;">${escapeHtml(product.name)}</a>
            ${badgeHtml}
          </div>
          ${macroGrid(product)}
          <p style="text-align:center; font-size:13px; color:${BODY_TEXT}; margin:14px 0 0;">${escapeHtml(explainMatch(product, goal))}</p>
          <div style="text-align:center;">${ctaButton(url, ctaLabel)}</div>
        </td>
      </tr>
    </table>`
}

/** A smaller, single-line-per-field row for the rest of a list — keeps "also worth a look" results scannable instead of five giant cards. */
function compactProductRow(product: Product, goal: MatchGoal): string {
  const url = absoluteUrl(`/snacks/${product.id}`)
  return `
    <tr>
      <td style="padding:14px 0; border-bottom:1px solid ${BORDER};">
        <a href="${url}" style="color:${BRAND_DARK}; text-decoration:none; font-weight:700; font-size:15px;">${escapeHtml(product.name)}</a>
        <div style="color:${MUTED_TEXT}; font-size:12px; text-transform:uppercase; letter-spacing:0.04em; margin-top:2px;">${escapeHtml(product.brand)}</div>
        <div style="color:${BODY_TEXT}; font-size:13px; margin-top:6px;">${escapeHtml(explainMatch(product, goal))} &middot; ${priceText(product)}</div>
      </td>
    </tr>`
}

function emailFooter(params: { primaryLabel: string; primaryUrl: string; extraNote?: string }): string {
  const { primaryLabel, primaryUrl, extraNote } = params
  const year = new Date().getFullYear()
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding-bottom:14px;">
          <a href="${primaryUrl}" style="color:${BRAND_DARK}; font-size:13px; font-weight:600;">${escapeHtml(primaryLabel)} &rarr;</a>
        </td>
      </tr>
    </table>
    <p style="font-size:11.5px; color:${FAINT_TEXT}; line-height:1.6; margin:0 0 10px;">
      Prices are estimates and change often — check the retailer for the current price. Dietary tags reflect
      product information we hold, not independent certification. Nutrition numbers are verified against
      manufacturer or USDA label data where noted on each product's page; otherwise they're from our own
      research.${extraNote ? ` ${extraNote}` : ""}
    </p>
    <p style="font-size:11.5px; color:${FAINT_TEXT}; margin:0;">
      &copy; ${year} ${SITE_NAME} &middot;
      <a href="${absoluteUrl("/")}" style="color:${FAINT_TEXT}; text-decoration:underline;">thehighproteinsnacks.com</a>
    </p>`
}

const NOTIFY_EXTRA_NOTE =
  "We only send this when something in our database actually changes for the better for you — no routine or promotional emails."

/** The one-off "Email My Results" report for Find My Match. */
export function renderMatchEmail(params: { matches: Product[]; criteria: MatchCriteria; revisitUrl: string }): string {
  const { matches, criteria, revisitUrl } = params
  const [top, ...rest] = matches
  const word = goalWord(criteria.goal)

  const content = `
    <h1 style="font-size:21px; margin:0 0 6px; color:${BRAND_DARK};">Your protein snack matches</h1>
    <p style="color:${BODY_TEXT}; font-size:14px; margin:0;">Picked for ${word}, ranked by what matters most for that goal.</p>
    ${preferencesBox({ goal: criteria.goal, dietTags: criteria.dietTags })}
    ${top ? heroProductCard({ product: top, goal: criteria.goal, ctaLabel: "View This Snack" }) : ""}
    ${
      rest.length > 0
        ? `<h2 style="font-size:12px; color:${MUTED_TEXT}; text-transform:uppercase; letter-spacing:0.05em; margin:26px 0 4px; font-weight:700;">Also worth a look</h2>
           <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rest.map((p) => compactProductRow(p, criteria.goal)).join("")}</table>`
        : ""
    }
  `
  return emailShell({
    previewText: top ? `Your top match: ${top.name}` : "Your personalized protein snack matches are ready.",
    title: "Your protein snack matches",
    contentHtml: content,
    footerHtml: emailFooter({ primaryLabel: "Bookmark your results", primaryUrl: revisitUrl }),
  })
}

/** The one-off "Email My Results" report for Upgrade My Snack. */
export function renderUpgradeEmail(params: {
  current: Product
  upgrades: Upgrade[]
  goal: MatchGoal
  revisitUrl: string
}): string {
  const { current, upgrades, goal, revisitUrl } = params
  const word = goalWord(goal)

  if (upgrades.length === 0) {
    const content = `
      <h1 style="font-size:21px; margin:0 0 6px; color:${BRAND_DARK};">Good news about ${escapeHtml(current.name)}</h1>
      <p style="color:${BODY_TEXT}; font-size:14px; margin:0;">
        For ${word}, ${escapeHtml(current.name)} is already one of the stronger options in our database —
        we couldn't find anything that clearly beats it on protein, calories, sugar or value.
      </p>
      ${preferencesBox({ goal, watching: current.name })}
    `
    return emailShell({
      previewText: `${current.name} is already a strong pick for ${word}.`,
      title: `Good news about ${current.name}`,
      contentHtml: content,
      footerHtml: emailFooter({ primaryLabel: "Bookmark your results", primaryUrl: revisitUrl }),
    })
  }

  const [top, ...rest] = upgrades
  const content = `
    <h1 style="font-size:21px; margin:0 0 6px; color:${BRAND_DARK};">Better than ${escapeHtml(current.name)}, for ${word}</h1>
    <p style="color:${BODY_TEXT}; font-size:14px; margin:0;">
      You're currently eating <strong>${escapeHtml(current.name)}</strong> (${current.proteinPerServing}g protein,
      ${current.caloriesPerServing} calories, ${current.sugarPerServing}g sugar, ${priceText(current)}). Here's what beats it:
    </p>
    ${preferencesBox({ goal, watching: current.name })}
    ${heroProductCard({ product: top.product, goal, badgeHtml: deltaBadge(current, top.product), ctaLabel: "View This Upgrade" })}
    ${
      rest.length > 0
        ? `<h2 style="font-size:12px; color:${MUTED_TEXT}; text-transform:uppercase; letter-spacing:0.05em; margin:26px 0 4px; font-weight:700;">More upgrades</h2>
           <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rest.map(({ product }) => compactProductRow(product, goal)).join("")}</table>`
        : ""
    }
  `
  return emailShell({
    previewText: `${top.product.name} beats ${current.name} for ${word}.`,
    title: `Better than ${current.name}`,
    contentHtml: content,
    footerHtml: emailFooter({ primaryLabel: "Bookmark your results", primaryUrl: revisitUrl }),
  })
}

/**
 * Snack Match Notify — the standing "tell me when something better shows
 * up" subscription (lib/snackNotify.ts), distinct from the one-off emails
 * above. These link to the manage page, not a revisit link: an ongoing
 * subscription is something to edit or cancel, not just re-view.
 */

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
  const word = goalWord(goal)
  const heading =
    kind === "welcome" ? "You're subscribed to Snack Match Notify" : "Your Snack Match Notify preferences are updated"

  const intro =
    mode === "match"
      ? `We'll email you when a new or updated snack in our database${dietSummary(dietTags)} is a meaningfully better match for ${word} than what you have now.`
      : `We'll email you when something${dietSummary(dietTags)} meaningfully beats ${escapeHtml(currentSnackName ?? "your current snack")} for ${word}.`

  const pickSection = pick
    ? `<p style="color:${BODY_TEXT}; font-size:14px; margin:18px 0 0;">Right now, that's:</p>
       ${heroProductCard({ product: pick, goal, ctaLabel: "View My Snack Match" })}`
    : `<p style="color:${BODY_TEXT}; font-size:14px; margin:18px 0 0;">
         We don't have a match for these exact preferences yet — we'll email you as soon as one shows up.
       </p>`

  const content = `
    <h1 style="font-size:21px; margin:0 0 6px; color:${BRAND_DARK};">${heading}</h1>
    <p style="color:${BODY_TEXT}; font-size:14px; margin:0;">${intro}</p>
    ${preferencesBox({ goal, dietTags, watching: mode === "upgrade" ? currentSnackName ?? null : null })}
    ${pickSection}
  `
  return emailShell({
    previewText: pick ? `Your current best match: ${pick.name}` : "You're subscribed to Snack Match Notify.",
    title: heading,
    contentHtml: content,
    footerHtml: emailFooter({
      primaryLabel: "Manage preferences & unsubscribe",
      primaryUrl: manageUrl,
      extraNote: NOTIFY_EXTRA_NOTE,
    }),
  })
}

/** The actual "we found something better" alert — the only recurring email this subscription sends, and only when it's earned. */
export function renderNotifyAlertEmail(params: {
  mode: "match" | "upgrade"
  goal: MatchGoal
  dietTags: DietTag[]
  pick: Product
  baseline: Product | null
  manageUrl: string
}): string {
  const { mode, goal, dietTags, pick, baseline, manageUrl } = params
  const word = goalWord(goal)

  const content = `
    <h1 style="font-size:21px; margin:0 0 6px; color:${BRAND_DARK};">We found a better match for ${word}</h1>
    <p style="color:${BODY_TEXT}; font-size:14px; margin:0;">
      A ${mode === "upgrade" ? "better alternative to your current snack" : "new top match for your preferences"}
      just showed up in our database:
    </p>
    ${preferencesBox({ goal, dietTags })}
    ${heroProductCard({ product: pick, goal, badgeHtml: deltaBadge(baseline, pick), ctaLabel: "View My Snack Match" })}
  `
  return emailShell({
    previewText: `${pick.name} is now a better match for ${word}.`,
    title: "We found a better match for you",
    contentHtml: content,
    footerHtml: emailFooter({
      primaryLabel: "Manage preferences & unsubscribe",
      primaryUrl: manageUrl,
      extraNote: NOTIFY_EXTRA_NOTE,
    }),
  })
}
