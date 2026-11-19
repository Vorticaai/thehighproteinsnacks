import { Resend } from "resend"

/**
 * Thin wrapper around Resend (resend.com) — chosen for the Snack Finder's
 * "email my results" feature because it's a simple, low-cost transactional
 * email API with a generous free tier (no per-send paid-AI-style cost per
 * visitor) and its own "Audiences" feature doubles as the newsletter-opt-in
 * contact list, so no separate database is needed just to store emails.
 *
 * Requires RESEND_API_KEY to be set (Vercel project env vars). Until it is,
 * every function here fails safely — callers check isEmailConfigured() and
 * show the visitor a plain "not set up yet" message rather than pretending
 * to have sent something.
 */
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export function isEmailConfigured(): boolean {
  return resend !== null
}

const DEFAULT_FROM = "The High Protein Snacks <snacks@thehighproteinsnacks.com>"

export async function sendSnackReport(params: { to: string; subject: string; html: string }): Promise<void> {
  if (!resend) {
    throw new Error("RESEND_API_KEY is not configured")
  }
  const from = process.env.SNACK_EMAIL_FROM || DEFAULT_FROM
  const { error } = await resend.emails.send({
    from,
    to: params.to,
    subject: params.subject,
    html: params.html,
  })
  if (error) {
    throw new Error(`Resend send failed: ${error.message}`)
  }
}

/**
 * Adds an email to the newsletter segment. Only called when the visitor
 * explicitly checked the separate, optional newsletter box — never as a
 * side effect of asking for their one-off match/upgrade report. Silently
 * no-ops if RESEND_SEGMENT_ID isn't configured, so the transactional email
 * above still works before the owner sets up a Segment in Resend. (Resend's
 * older "Audiences" API is deprecated in favor of Segments as of this SDK
 * version — this uses the current one.)
 */
export async function addToNewsletterAudience(email: string): Promise<void> {
  if (!resend) return
  const segmentId = process.env.RESEND_SEGMENT_ID
  if (!segmentId) return
  await resend.contacts.create({ email, segments: [{ id: segmentId }] })
}
