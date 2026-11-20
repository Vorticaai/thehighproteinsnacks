"use client"

import { useState } from "react"
import { BellRing, Loader2, CheckCircle2 } from "lucide-react"
import {
  DIET_TAGS,
  DIET_TAG_LABELS,
  type MatchGoal,
  type ProteinBand,
  type CalorieBand,
  type BudgetBand,
  type DietTag,
} from "@/lib/snackMatch"

type NotifyPayloadBase = { mode: "match" | "upgrade"; goal: MatchGoal }
type MatchPayload = NotifyPayloadBase & {
  mode: "match"
  minProtein: ProteinBand
  calorieBand: CalorieBand
  budgetBand: BudgetBand
}
type UpgradePayload = NotifyPayloadBase & { mode: "upgrade"; productId: string }

type NotifyMeCaptureProps = {
  payload: MatchPayload | UpgradePayload
  initialDietTags?: DietTag[]
  onSubscribed?: (dietTags: DietTag[]) => void
}

type Status = "idle" | "open" | "sending" | "sent" | "error"

/**
 * The primary ask after results: a standing subscription, not a one-off
 * copy of what's already on screen (see EmailResultsCapture, kept as the
 * secondary "Email My Results" option below this). Consent here is its own
 * required checkbox, separate from the one-off report and from the general
 * newsletter opt-in elsewhere — subscribing IS the consent, so there's no
 * meaningful "subscribe without it" state.
 */
export default function NotifyMeCapture({ payload, initialDietTags = [], onSubscribed }: NotifyMeCaptureProps) {
  const [status, setStatus] = useState<Status>("idle")
  const [email, setEmail] = useState("")
  const [dietTags, setDietTags] = useState<DietTag[]>(initialDietTags)
  const [consent, setConsent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleDietTag = (tag: DietTag) => {
    setDietTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  if (status === "idle") {
    return (
      <button
        onClick={() => setStatus("open")}
        className="inline-flex items-center gap-2 rounded-full bg-[#CCFF00] px-6 py-3 font-bold text-black transition-colors hover:bg-[#A3CC00]"
      >
        <BellRing className="h-4 w-4" />
        Notify Me When You Find a Better Snack for Me
      </button>
    )
  }

  if (status === "sent") {
    return (
      <p className="flex items-center gap-2 font-medium text-[#006F6D]">
        <CheckCircle2 className="h-5 w-5" />
        You&apos;re subscribed — check your email for a confirmation with your current best match.
      </p>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !consent) return
    setStatus("sending")
    setError(null)
    try {
      const res = await fetch("/api/snack-notify/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, consent, dietTags, ...payload }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || "Something went wrong. Try again.")
        setStatus("open")
        return
      }
      setStatus("sent")
      onSubscribed?.(dietTags)
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.")
      setStatus("open")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl border-2 border-[#CCFF00] bg-white p-5">
      <p className="mb-1 font-bold text-gray-900">Notify Me When You Find a Better Snack for Me</p>
      <p className="mb-3 text-xs text-gray-600">
        We&apos;ll only email you when a new or updated snack in our database is a real, meaningful improvement —
        not on a schedule, and never a promotional blast.
      </p>

      <div className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#006F6D] focus:outline-none"
        />
      </div>

      <div className="mt-3">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">
          Only notify me about snacks that are (optional)
        </p>
        <div className="flex flex-wrap gap-1.5">
          {DIET_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleDietTag(tag)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                dietTags.includes(tag)
                  ? "border-[#006F6D] bg-[#006F6D] text-white"
                  : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
              }`}
            >
              {DIET_TAG_LABELS[tag]}
            </button>
          ))}
        </div>
      </div>

      <label className="mt-3 flex items-start gap-2 text-xs text-gray-600">
        <input
          type="checkbox"
          required
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5"
        />
        I agree to get occasional emails when a genuinely better match is found for these preferences. Separate
        from any newsletter — I can update or cancel this anytime from a link in the email.
      </label>

      <button
        type="submit"
        disabled={status === "sending" || !consent}
        className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#006F6D] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#005453] disabled:opacity-60"
      >
        {status === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Subscribe
      </button>

      {error ? <p className="mt-2 text-xs font-medium text-red-600">{error}</p> : null}
    </form>
  )
}
