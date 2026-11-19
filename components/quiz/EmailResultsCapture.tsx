"use client"

import { useState } from "react"
import { Mail, Loader2, CheckCircle2 } from "lucide-react"
import type { MatchCriteria, MatchGoal } from "@/lib/snackMatch"

type EmailPayload =
  | { mode: "match"; criteria: MatchCriteria }
  | { mode: "upgrade"; productId: string; goal: MatchGoal }

type EmailResultsCaptureProps = {
  ctaLabel: string
  payload: EmailPayload
  onSent?: (newsletterOptIn: boolean) => void
}

type Status = "idle" | "open" | "sending" | "sent" | "error"

/**
 * Results are already on screen before this ever appears — no email wall.
 * Newsletter sign-up is a separate, unchecked-by-default checkbox: checking
 * it is never required to receive the one-off report.
 */
export default function EmailResultsCapture({ ctaLabel, payload, onSent }: EmailResultsCaptureProps) {
  const [status, setStatus] = useState<Status>("idle")
  const [email, setEmail] = useState("")
  const [newsletterOptIn, setNewsletterOptIn] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (status === "idle") {
    return (
      <button
        onClick={() => setStatus("open")}
        className="inline-flex items-center gap-2 rounded-full border-2 border-[#006F6D] px-6 py-3 font-bold text-[#006F6D] transition-colors hover:bg-[#006F6D] hover:text-white"
      >
        <Mail className="h-4 w-4" />
        {ctaLabel}
      </button>
    )
  }

  if (status === "sent") {
    return (
      <p className="flex items-center gap-2 font-medium text-[#006F6D]">
        <CheckCircle2 className="h-5 w-5" />
        Sent! Check your inbox for your results and a link to revisit them anytime.
      </p>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setStatus("sending")
    setError(null)
    try {
      const res = await fetch("/api/snack-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newsletterOptIn, ...payload }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || "Something went wrong. Try again.")
        setStatus("open")
        return
      }
      setStatus("sent")
      onSent?.(newsletterOptIn)
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.")
      setStatus("open")
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md rounded-2xl border border-gray-200 bg-gray-50 p-5"
    >
      <label htmlFor="snack-email-input" className="mb-2 block text-sm font-bold text-gray-700">
        {ctaLabel}
      </label>
      <div className="flex gap-2">
        <input
          id="snack-email-input"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#006F6D] focus:outline-none"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-[#006F6D] px-4 py-2 text-sm font-bold text-white hover:bg-[#005453] disabled:opacity-60"
        >
          {status === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Send
        </button>
      </div>

      <label className="mt-3 flex items-start gap-2 text-xs text-gray-600">
        <input
          type="checkbox"
          checked={newsletterOptIn}
          onChange={(e) => setNewsletterOptIn(e.target.checked)}
          className="mt-0.5"
        />
        Also send me occasional snack tips and new product alerts (optional — separate from this
        one-off report)
      </label>

      {error ? <p className="mt-2 text-xs font-medium text-red-600">{error}</p> : null}
    </form>
  )
}
