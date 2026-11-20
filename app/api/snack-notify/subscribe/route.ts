import { randomUUID } from "node:crypto"
import { NextRequest, NextResponse } from "next/server"
import { getAllProducts } from "@/lib/products"
import {
  isValidEmail,
  isEmailConfigured,
  isNotifyConfigured,
  sendSnackReport,
  getNotifyContact,
  upsertNotifyContact,
} from "@/lib/email"
import { renderNotifySubscriptionEmail } from "@/lib/emailTemplates"
import { absoluteUrl } from "@/lib/seo"
import {
  computeNotifyPick,
  propertiesToSubscription,
  subscriptionToProperties,
  type NotifySubscription,
} from "@/lib/snackNotify"
import { DIET_TAGS, PROTEIN_BANDS, CALORIE_BANDS, BUDGET_BANDS, type DietTag } from "@/lib/snackMatch"

export const runtime = "nodejs"

/**
 * Subscribes (or re-subscribes / updates) someone to Snack Match Notify.
 * Sends one welcome/updated email immediately with their current best pick,
 * then silently records that pick as the baseline — the recurring "we found
 * something better" alert (pipeline/notify.ts, run weekly) only fires once
 * something genuinely changes after this point, never as a duplicate of
 * this email.
 */
export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }

  const input = body as Record<string, unknown>
  const email = input.email
  if (typeof email !== "string" || !isValidEmail(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 })
  }
  if (input.consent !== true) {
    return NextResponse.json({ error: "Consent is required to subscribe." }, { status: 400 })
  }

  const mode = input.mode
  if (mode !== "match" && mode !== "upgrade") {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }
  const goal = input.goal
  if (goal !== "lose-fat" && goal !== "build-muscle") {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }
  const dietTags: DietTag[] = Array.isArray(input.dietTags)
    ? input.dietTags.filter((t): t is DietTag => DIET_TAGS.includes(t as DietTag))
    : []

  let minProtein: NotifySubscription["minProtein"] = 0
  let calorieBand: NotifySubscription["calorieBand"] = "any"
  let budgetBand: NotifySubscription["budgetBand"] = "any"
  let productId: string | null = null

  if (mode === "match") {
    const proteinRaw = Number(input.minProtein)
    minProtein = PROTEIN_BANDS.includes(proteinRaw as (typeof PROTEIN_BANDS)[number])
      ? (proteinRaw as NotifySubscription["minProtein"])
      : 0
    calorieBand = CALORIE_BANDS.some((b) => b.value === input.calorieBand)
      ? (input.calorieBand as NotifySubscription["calorieBand"])
      : "any"
    budgetBand = BUDGET_BANDS.some((b) => b.value === input.budgetBand)
      ? (input.budgetBand as NotifySubscription["budgetBand"])
      : "any"
  } else {
    if (typeof input.productId !== "string") {
      return NextResponse.json({ error: "Missing upgrade details." }, { status: 400 })
    }
    productId = input.productId
  }

  if (!isEmailConfigured() || !isNotifyConfigured()) {
    return NextResponse.json({ error: "Notifications aren't set up on this site yet." }, { status: 503 })
  }

  const products = getAllProducts()
  const to = email.trim()

  if (mode === "upgrade" && !products.find((p) => p.id === productId)) {
    return NextResponse.json({ error: "That product is no longer in our database." }, { status: 400 })
  }

  try {
    const existing = await getNotifyContact(to)
    const existingSub = existing ? propertiesToSubscription(existing.properties) : null
    const manageToken = existingSub?.manageToken || randomUUID()

    const { product: pick } = computeNotifyPick(
      { mode, goal, dietTags, minProtein, calorieBand, budgetBand, productId, lastNotifiedProductId: null, notifyActive: true, manageToken },
      products,
    )

    const sub: NotifySubscription = {
      mode,
      goal,
      dietTags,
      minProtein,
      calorieBand,
      budgetBand,
      productId,
      lastNotifiedProductId: pick?.id ?? null,
      notifyActive: true,
      manageToken,
    }

    await upsertNotifyContact(to, subscriptionToProperties(sub))

    const manageUrl = absoluteUrl(`/snack-notify/manage?email=${encodeURIComponent(to)}&token=${manageToken}`)
    const currentSnackName = mode === "upgrade" ? products.find((p) => p.id === productId)?.name : undefined
    const html = renderNotifySubscriptionEmail({
      kind: existing ? "updated" : "welcome",
      mode,
      goal,
      dietTags,
      currentSnackName,
      pick,
      manageUrl,
    })
    await sendSnackReport({
      to,
      subject: existing ? "Your Snack Match Notify preferences are updated" : "You're subscribed to Snack Match Notify",
      html,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("snack-notify subscribe failed", err)
    return NextResponse.json({ error: "Something went wrong subscribing. Try again shortly." }, { status: 500 })
  }
}
