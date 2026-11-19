import { NextRequest, NextResponse } from "next/server"
import { getAllProducts } from "@/lib/products"
import {
  findMatches,
  findUpgrades,
  criteriaToSearchParams,
  type MatchCriteria,
  type MatchGoal,
} from "@/lib/snackMatch"
import { sendSnackReport, addToNewsletterAudience, isEmailConfigured } from "@/lib/email"
import { renderMatchEmail, renderUpgradeEmail } from "@/lib/emailTemplates"
import { absoluteUrl } from "@/lib/seo"

export const runtime = "nodejs"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Sends a visitor's Find My Match / Upgrade My Snack result to their inbox.
 * Recomputes the result server-side from the submitted criteria/product id
 * rather than trusting a client-submitted list of products — same
 * deterministic engine the page itself uses, so the emailed report always
 * matches what a tampered or stale client payload could not fake.
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

  const { email, mode, newsletterOptIn } = body as Record<string, unknown>
  if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 })
  }
  if (mode !== "match" && mode !== "upgrade") {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }

  if (!isEmailConfigured()) {
    return NextResponse.json({ error: "Email delivery isn't set up on this site yet." }, { status: 503 })
  }

  const products = getAllProducts()
  const to = email.trim()

  try {
    if (mode === "match") {
      const criteria = (body as { criteria?: MatchCriteria }).criteria
      if (!criteria || !criteria.goal) {
        return NextResponse.json({ error: "Missing match criteria." }, { status: 400 })
      }
      const { results } = findMatches(products, criteria, 5)
      if (results.length === 0) {
        return NextResponse.json(
          { error: "No matches to email yet — try loosening a preference first." },
          { status: 400 },
        )
      }
      const revisitUrl = absoluteUrl(`/quiz?${criteriaToSearchParams(criteria).toString()}`)
      const html = renderMatchEmail({ matches: results, criteria, revisitUrl })
      await sendSnackReport({ to, subject: "Your personalized protein snack matches", html })
    } else {
      const productId = (body as { productId?: string }).productId
      const goal = (body as { goal?: MatchGoal }).goal
      if (typeof productId !== "string" || (goal !== "lose-fat" && goal !== "build-muscle")) {
        return NextResponse.json({ error: "Missing upgrade details." }, { status: 400 })
      }
      const current = products.find((p) => p.id === productId)
      if (!current) {
        return NextResponse.json({ error: "That product is no longer in our database." }, { status: 400 })
      }
      const upgrades = findUpgrades(current, products, goal, 3)
      const revisitUrl = absoluteUrl(`/quiz?mode=upgrade&product=${current.id}&goal=${goal}`)
      const html = renderUpgradeEmail({ current, upgrades, goal, revisitUrl })
      await sendSnackReport({ to, subject: `Better alternatives to ${current.name}`, html })
    }

    if (newsletterOptIn === true) {
      // Best-effort: a newsletter-signup hiccup shouldn't make the visitor
      // think their report email failed to send.
      await addToNewsletterAudience(to).catch((err) => {
        console.error("newsletter signup failed", err)
      })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("snack-email send failed", err)
    return NextResponse.json({ error: "Something went wrong sending that email. Try again shortly." }, { status: 500 })
  }
}
