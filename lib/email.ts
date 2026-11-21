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

/** Shared validation for every snack-email/snack-notify API route. */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim())
}

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

/**
 * The Snack Match Notify subscription (lib/snackNotify.ts) is a completely
 * separate Resend segment from the newsletter above — so unsubscribing from
 * one never silently touches the other. This is also the project's only
 * "database": each subscriber's preferences live in that contact's own
 * `properties` bag, read back by getNotifyContact().
 */
export function isNotifyConfigured(): boolean {
  return resend !== null && Boolean(process.env.RESEND_NOTIFY_SEGMENT_ID)
}

export type NotifyContact = {
  id: string
  email: string
  properties: Record<string, { type: "string" | "number"; value: string | number }>
}

export async function getNotifyContact(email: string): Promise<NotifyContact | null> {
  if (!resend) throw new Error("RESEND_API_KEY is not configured")
  const { data } = await resend.contacts.get({ email })
  if (!data) return null
  return { id: data.id, email: data.email, properties: data.properties }
}

/**
 * Creates the contact if it doesn't exist yet (adding it to the Notify
 * segment at the same time), or updates its properties and makes sure it's
 * in the segment if it already existed for some other reason (e.g. it was
 * previously only a newsletter contact). Never touches the contact's global
 * `unsubscribed` flag — Notify's own on/off state is the `notifyActive`
 * property instead, so it can't cross-affect an unrelated subscription on
 * the same email address.
 */
export async function upsertNotifyContact(
  email: string,
  properties: Record<string, string | number | null>,
): Promise<void> {
  if (!resend) throw new Error("RESEND_API_KEY is not configured")
  const segmentId = process.env.RESEND_NOTIFY_SEGMENT_ID
  if (!segmentId) throw new Error("RESEND_NOTIFY_SEGMENT_ID is not configured")

  const existing = await resend.contacts.get({ email })
  if (existing.data) {
    const { error: updateError } = await resend.contacts.update({ email, properties })
    if (updateError) {
      throw new Error(`Resend contact update failed: ${updateError.message}`)
    }
    const { error: segmentError } = await resend.contacts.segments.add({ email, segmentId })
    if (segmentError) {
      // Resend treats "already in the segment" as a success, not an error, so
      // anything landing here is a genuine failure (bad segment ID, API issue,
      // etc.) — log it instead of swallowing it, so it shows up in Vercel's
      // function logs rather than silently leaving the contact out of the
      // segment the weekly job reads from.
      console.error("snack-notify: segments.add failed", { email, segmentId, error: segmentError })
    }
  } else {
    const { error } = await resend.contacts.create({ email, properties, segments: [{ id: segmentId }] })
    if (error) {
      throw new Error(`Resend contact create failed: ${error.message}`)
    }
  }
}

/** Lists every contact in the Notify segment, paging through all of them. */
export async function listNotifySubscriberEmails(): Promise<string[]> {
  if (!resend) throw new Error("RESEND_API_KEY is not configured")
  const segmentId = process.env.RESEND_NOTIFY_SEGMENT_ID
  if (!segmentId) throw new Error("RESEND_NOTIFY_SEGMENT_ID is not configured")

  const emails: string[] = []
  let after: string | undefined
  for (let page = 0; page < 50; page++) {
    const { data, error } = await resend.contacts.list({ segmentId, limit: 100, ...(after ? { after } : {}) })
    if (error || !data) break
    emails.push(...data.data.map((c) => c.email))
    if (!data.has_more || data.data.length === 0) break
    after = data.data[data.data.length - 1].id
  }
  return emails
}
