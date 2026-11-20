/**
 * Snack Match Notify — weekly alert run.
 *
 * For every subscriber in the Resend "Snack Match Notify" segment:
 *   1. Read their saved preferences back from their Resend contact's
 *      properties (lib/snackNotify.ts) — this project has no database;
 *      that contact record is the subscriber's entire stored state.
 *   2. Recompute their best current pick with the same deterministic
 *      matching engine the live site uses (lib/snackMatch.ts) — nothing
 *      special-cased for this script.
 *   3. Skip them unless the pick is new (not what we last told them about)
 *      AND a real, meaningful improvement (lib/snackNotify.ts's delta
 *      thresholds) over their baseline. No pick, no change, or a marginal
 *      scoring difference all mean "say nothing this week."
 *   4. Send the one alert email, then record the new pick so next week's
 *      comparison is against this one (no duplicate alerts).
 *
 * This is the only thing that emails a Notify subscriber more than once —
 * the welcome/updated-preferences emails (app/api/snack-notify/*) are sent
 * directly from those routes, not from here, and never repeat on a schedule.
 *
 * Runs weekly in GitHub Actions (.github/workflows/snack-notify.yml), same
 * cadence as the existing catalogue audit. One subscriber's failure is
 * logged and skipped rather than aborting the run.
 *
 * Env: RESEND_API_KEY, RESEND_NOTIFY_SEGMENT_ID, NEXT_PUBLIC_SITE_URL
 */
import { getAllProducts } from "../lib/products"
import {
  isEmailConfigured,
  isNotifyConfigured,
  listNotifySubscriberEmails,
  getNotifyContact,
  upsertNotifyContact,
  sendSnackReport,
} from "../lib/email"
import { renderNotifyAlertEmail } from "../lib/emailTemplates"
import {
  computeNotifyPick,
  getBaselineProduct,
  isMeaningfulImprovement,
  propertiesToSubscription,
  subscriptionToProperties,
} from "../lib/snackNotify"

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

function manageUrl(email: string, token: string): string {
  const site = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.thehighproteinsnacks.com").replace(/\/$/, "")
  return `${site}/snack-notify/manage?email=${encodeURIComponent(email)}&token=${token}`
}

async function main() {
  if (!isEmailConfigured() || !isNotifyConfigured()) {
    console.log("Notify isn't configured (missing RESEND_API_KEY or RESEND_NOTIFY_SEGMENT_ID) — nothing to do.")
    return
  }

  const products = getAllProducts()
  const emails = await listNotifySubscriberEmails()
  console.log(`Snack Match Notify: ${emails.length} subscriber(s) in the segment.`)

  let notified = 0
  let skipped = 0
  let failed = 0

  for (const email of emails) {
    try {
      const contact = await getNotifyContact(email)
      if (!contact) {
        skipped++
        continue
      }
      const sub = propertiesToSubscription(contact.properties)
      if (!sub || !sub.notifyActive) {
        skipped++
        continue
      }

      const { product: pick, skippedReason } = computeNotifyPick(sub, products)
      if (!pick) {
        console.log(`- ${email}: no pick (${skippedReason ?? "no candidates"}) — skipping.`)
        skipped++
        continue
      }
      if (pick.id === sub.lastNotifiedProductId) {
        skipped++
        continue
      }

      const baseline = getBaselineProduct(sub, products)
      if (!isMeaningfulImprovement(pick, baseline)) {
        skipped++
        continue
      }

      const html = renderNotifyAlertEmail({
        mode: sub.mode,
        goal: sub.goal,
        dietTags: sub.dietTags,
        pick,
        baseline,
        manageUrl: manageUrl(email, sub.manageToken),
      })
      await sendSnackReport({ to: email, subject: "We found a better snack match for you", html })
      await upsertNotifyContact(email, subscriptionToProperties({ ...sub, lastNotifiedProductId: pick.id }))
      console.log(`- ${email}: notified about ${pick.name}.`)
      notified++
    } catch (err) {
      console.error(`- ${email}: failed —`, err)
      failed++
    }
    // Be polite to Resend's API rather than firing requests back-to-back.
    await sleep(300)
  }

  console.log(`Done. Notified ${notified}, skipped ${skipped}, failed ${failed}.`)
}

main().catch((err) => {
  console.error("Snack Match Notify run failed:", err)
  process.exitCode = 1
})
