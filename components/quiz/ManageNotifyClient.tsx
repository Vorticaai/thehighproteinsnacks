"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Loader2, CheckCircle2 } from "lucide-react"
import {
  PROTEIN_BANDS,
  CALORIE_BANDS,
  BUDGET_BANDS,
  DIET_TAGS,
  DIET_TAG_LABELS,
  type MatchGoal,
  type ProteinBand,
  type CalorieBand,
  type BudgetBand,
  type DietTag,
} from "@/lib/snackMatch"

type ManageState = {
  mode: "match" | "upgrade"
  goal: MatchGoal
  dietTags: DietTag[]
  minProtein: ProteinBand
  calorieBand: CalorieBand
  budgetBand: BudgetBand
  productId: string | null
  productName: string | null
  notifyActive: boolean
}

export default function ManageNotifyClient() {
  const params = useSearchParams()
  const email = params.get("email")
  const token = params.get("token")

  const [status, setStatus] = useState<"loading" | "invalid" | "ready" | "cancelled">("loading")
  const [state, setState] = useState<ManageState | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!email || !token) {
      setStatus("invalid")
      return
    }
    fetch(`/api/snack-notify/manage?email=${encodeURIComponent(email)}&token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setStatus("invalid")
          return
        }
        setState(data)
        setStatus("ready")
      })
      .catch(() => setStatus("invalid"))
  }, [email, token])

  const toggleDietTag = (tag: DietTag) => {
    if (!state) return
    setState({
      ...state,
      dietTags: state.dietTags.includes(tag) ? state.dietTags.filter((t) => t !== tag) : [...state.dietTags, tag],
    })
  }

  const save = async () => {
    if (!state || !email || !token) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch("/api/snack-notify/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          token,
          action: "update",
          goal: state.goal,
          dietTags: state.dietTags,
          minProtein: state.minProtein,
          calorieBand: state.calorieBand,
          budgetBand: state.budgetBand,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Something went wrong. Try again.")
        return
      }
      setMessage("Saved — check your email for a confirmation with your updated best match.")
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.")
    } finally {
      setSaving(false)
    }
  }

  const cancel = async () => {
    if (!email || !token) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch("/api/snack-notify/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, action: "cancel" }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Something went wrong. Try again.")
        return
      }
      setStatus("cancelled")
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.")
    } finally {
      setSaving(false)
    }
  }

  if (status === "loading") {
    return <p className="text-gray-600">Loading your preferences…</p>
  }

  if (status === "invalid") {
    return (
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center">
        <p className="text-lg font-medium text-gray-900">That link is no longer valid</p>
        <p className="mt-2 text-gray-600">
          It may have expired, or the subscription it points to no longer exists. Subscribe again from the{" "}
          <a href="/quiz" className="font-medium text-[#006F6D] underline">
            Snack Finder
          </a>
          .
        </p>
      </div>
    )
  }

  if (status === "cancelled") {
    return (
      <div className="rounded-2xl border border-[#006F6D] bg-white p-8 text-center">
        <CheckCircle2 className="mx-auto mb-3 h-8 w-8 text-[#006F6D]" />
        <p className="text-lg font-medium text-gray-900">You&apos;re unsubscribed</p>
        <p className="mt-2 text-gray-600">You won&apos;t receive any more Snack Match Notify emails.</p>
      </div>
    )
  }

  if (!state) return null

  return (
    <div className="space-y-6 rounded-2xl border border-gray-200 bg-gray-50 p-6 md:p-8">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Your Snack Match Notify preferences</h2>
        <p className="mt-1 text-sm text-gray-600">
          {state.mode === "upgrade" && state.productName
            ? `Comparing against: ${state.productName}`
            : "Find My Match subscription"}
        </p>
      </div>

      <div>
        <label className="mb-3 block text-sm font-bold uppercase tracking-wide text-gray-700">Goal</label>
        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              { value: "lose-fat", label: "Lose weight" },
              { value: "build-muscle", label: "Build muscle" },
            ] as { value: MatchGoal; label: string }[]
          ).map((option) => (
            <button
              key={option.value}
              onClick={() => setState({ ...state, goal: option.value })}
              className={`rounded-lg border-2 px-4 py-3 text-center font-medium transition-all ${
                state.goal === option.value
                  ? "border-[#CCFF00] bg-[#CCFF00] text-black"
                  : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {state.mode === "match" ? (
        <>
          <div>
            <label className="mb-3 block text-sm font-bold uppercase tracking-wide text-gray-700">
              Minimum protein per serving
            </label>
            <div className="grid grid-cols-5 gap-3">
              {PROTEIN_BANDS.map((band) => (
                <button
                  key={band}
                  onClick={() => setState({ ...state, minProtein: band })}
                  className={`rounded-lg border-2 px-3 py-3 text-center font-medium transition-all ${
                    state.minProtein === band
                      ? "border-[#CCFF00] bg-[#CCFF00] text-black"
                      : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                  }`}
                >
                  {band === 0 ? "Any" : `${band}g+`}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-3 block text-sm font-bold uppercase tracking-wide text-gray-700">
              Calorie preference
            </label>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
              {CALORIE_BANDS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setState({ ...state, calorieBand: option.value })}
                  className={`rounded-lg border-2 px-4 py-3 text-center text-sm font-medium transition-all ${
                    state.calorieBand === option.value
                      ? "border-[#CCFF00] bg-[#CCFF00] text-black"
                      : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-3 block text-sm font-bold uppercase tracking-wide text-gray-700">
              Budget per serving
            </label>
            <div className="grid gap-3 sm:grid-cols-3">
              {BUDGET_BANDS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setState({ ...state, budgetBand: option.value })}
                  className={`rounded-lg border-2 px-4 py-3 text-center text-sm font-medium transition-all ${
                    state.budgetBand === option.value
                      ? "border-[#CCFF00] bg-[#CCFF00] text-black"
                      : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </>
      ) : null}

      <div>
        <label className="mb-3 block text-sm font-bold uppercase tracking-wide text-gray-700">
          Dietary requirements (optional)
        </label>
        <div className="flex flex-wrap gap-2">
          {DIET_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleDietTag(tag)}
              className={`rounded-full border-2 px-4 py-2 text-sm font-medium transition-all ${
                state.dietTags.includes(tag)
                  ? "border-[#006F6D] bg-[#006F6D] text-white"
                  : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
              }`}
            >
              {DIET_TAG_LABELS[tag]}
            </button>
          ))}
        </div>
      </div>

      {message ? <p className="font-medium text-[#006F6D]">{message}</p> : null}
      {error ? <p className="font-medium text-red-600">{error}</p> : null}

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-[#CCFF00] px-6 py-3 font-bold text-black transition-colors hover:bg-[#A3CC00] disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Save changes
        </button>
        <button
          onClick={cancel}
          disabled={saving}
          className="rounded-full border-2 border-gray-300 px-6 py-3 font-medium text-gray-600 transition-colors hover:border-red-300 hover:text-red-600 disabled:opacity-60"
        >
          Stop these notifications
        </button>
      </div>
    </div>
  )
}
