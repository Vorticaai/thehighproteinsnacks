import { NextRequest, NextResponse } from "next/server"
import { getAllProducts } from "@/lib/products"
import { isEmailConfigured, isNotifyConfigured, getNotifyContact, upsertNotifyContact, sendSnackReport } from "@/lib/email"
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
 * Both reads and writes to someone's Notify subscription are gated by the
 * same opaque token minted at subscribe time (see app/api/snack-notify/
 * subscribe) — no account/login system, just "you have the link from your
 * own email". Good enough for a low-stakes preference toggle; not meant to
 * carry any stronger guarantee than that.
 */
async function loadVerified(email: string, token: string) {
  const contact = await getNotifyContact(email)
  if (!contact) return null
  const sub = propertiesToSubscription(contact.properties)
  if (!sub || sub.manageToken !== token) return null
  return sub
}

export async function GET(req: NextRequest) {
  if (!isEmailConfigured() || !isNotifyConfigured()) {
    return NextResponse.json({ error: "Notifications aren't set up on this site yet." }, { status: 503 })
  }

  const email = req.nextUrl.searchParams.get("email")
  const token = req.nextUrl.searchParams.get("token")
  if (!email || !token) {
    return NextResponse.json({ error: "Missing link details." }, { status: 400 })
  }

  const sub = await loadVerified(email, token)
  if (!sub) {
    return NextResponse.json({ error: "That link is no longer valid." }, { status: 404 })
  }

  const products = getAllProducts()
  const productName = sub.mode === "upgrade" ? products.find((p) => p.id === sub.productId)?.name ?? null : null

  return NextResponse.json({
    mode: sub.mode,
    goal: sub.goal,
    dietTags: sub.dietTags,
    minProtein: sub.minProtein,
    calorieBand: sub.calorieBand,
    budgetBand: sub.budgetBand,
    productId: sub.productId,
    productName,
    notifyActive: sub.notifyActive,
  })
}

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }
  if (!isEmailConfigured() || !isNotifyConfigured()) {
    return NextResponse.json({ error: "Notifications aren't set up on this site yet." }, { status: 503 })
  }

  const input = (body ?? {}) as Record<string, unknown>
  const email = input.email
  const token = input.token
  if (typeof email !== "string" || typeof token !== "string") {
    return NextResponse.json({ error: "Missing link details." }, { status: 400 })
  }

  const sub = await loadVerified(email, token)
  if (!sub) {
    return NextResponse.json({ error: "That link is no longer valid." }, { status: 404 })
  }

  try {
    if (input.action === "cancel") {
      const cancelled: NotifySubscription = { ...sub, notifyActive: false }
      await upsertNotifyContact(email, subscriptionToProperties(cancelled))
      return NextResponse.json({ ok: true })
    }

    if (input.action !== "update") {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 })
    }

    const goal = input.goal
    if (goal !== "lose-fat" && goal !== "build-muscle") {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 })
    }
    const dietTags: DietTag[] = Array.isArray(input.dietTags)
      ? input.dietTags.filter((t): t is DietTag => DIET_TAGS.includes(t as DietTag))
      : []

    let minProtein = sub.minProtein
    let calorieBand = sub.calorieBand
    let budgetBand = sub.budgetBand
    if (sub.mode === "match") {
      const proteinRaw = Number(input.minProtein)
      minProtein = PROTEIN_BANDS.includes(proteinRaw as NotifySubscription["minProtein"])
        ? (proteinRaw as NotifySubscription["minProtein"])
        : 0
      calorieBand = CALORIE_BANDS.some((b) => b.value === input.calorieBand)
        ? (input.calorieBand as NotifySubscription["calorieBand"])
        : "any"
      budgetBand = BUDGET_BANDS.some((b) => b.value === input.budgetBand)
        ? (input.budgetBand as NotifySubscription["budgetBand"])
        : "any"
    }

    const products = getAllProducts()
    const { product: pick } = computeNotifyPick(
      { ...sub, goal, dietTags, minProtein, calorieBand, budgetBand, notifyActive: true },
      products,
    )

    const updated: NotifySubscription = {
      ...sub,
      goal,
      dietTags,
      minProtein,
      calorieBand,
      budgetBand,
      notifyActive: true,
      // Silently re-seed the baseline for the new criteria — same reasoning
      // as a fresh subscribe: this confirmation email is not the recurring
      // alert, so it should never double as one.
      lastNotifiedProductId: pick?.id ?? null,
    }
    await upsertNotifyContact(email, subscriptionToProperties(updated))

    const manageUrl = absoluteUrl(`/snack-notify/manage?email=${encodeURIComponent(email)}&token=${sub.manageToken}`)
    const currentSnackName = sub.mode === "upgrade" ? products.find((p) => p.id === sub.productId)?.name : undefined
    const html = renderNotifySubscriptionEmail({
      kind: "updated",
      mode: sub.mode,
      goal,
      dietTags,
      currentSnackName,
      pick,
      manageUrl,
    })
    await sendSnackReport({ to: email, subject: "Your Snack Match Notify preferences are updated", html })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("snack-notify manage failed", err)
    return NextResponse.json({ error: "Something went wrong saving that. Try again shortly." }, { status: 500 })
  }
}
