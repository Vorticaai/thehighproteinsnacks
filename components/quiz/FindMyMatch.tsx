"use client"

import { useState } from "react"
import { ArrowRight, RefreshCw } from "lucide-react"
import type { Product } from "@/lib/products"
import { SnackCard } from "@/components/snacks/snack-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import EmailResultsCapture from "@/components/quiz/EmailResultsCapture"
import { trackSnackFinderCompleted, trackSnackEmailSignup } from "@/lib/analytics"
import {
  findMatches,
  explainMatch,
  DEFAULT_CRITERIA,
  PROTEIN_BANDS,
  CALORIE_BANDS,
  BUDGET_BANDS,
  DIET_TAGS,
  DIET_TAG_LABELS,
  type MatchCriteria,
  type MatchGoal,
  type DietTag,
} from "@/lib/snackMatch"

type FindMyMatchProps = {
  products: Product[]
  initialCriteria?: MatchCriteria | null
}

export default function FindMyMatch({ products, initialCriteria }: FindMyMatchProps) {
  const [criteria, setCriteria] = useState<MatchCriteria>(initialCriteria ?? DEFAULT_CRITERIA)
  const [showResults, setShowResults] = useState(Boolean(initialCriteria))
  const [{ results, relaxed }, setOutcome] = useState(() =>
    initialCriteria ? findMatches(products, initialCriteria, 5) : { results: [] as Product[], relaxed: false },
  )

  const runMatch = (nextCriteria: MatchCriteria) => {
    const outcome = findMatches(products, nextCriteria, 5)
    setOutcome(outcome)
    setShowResults(true)
    trackSnackFinderCompleted({
      mode: "match",
      goal: nextCriteria.goal,
      dietTags: nextCriteria.dietTags,
      calorieBand: nextCriteria.calorieBand,
      budgetBand: nextCriteria.budgetBand,
      resultCount: outcome.results.length,
    })
  }

  const handleReset = () => {
    setCriteria(DEFAULT_CRITERIA)
    setShowResults(false)
  }

  const toggleDietTag = (tag: DietTag) => {
    setCriteria((prev) => ({
      ...prev,
      dietTags: prev.dietTags.includes(tag) ? prev.dietTags.filter((t) => t !== tag) : [...prev.dietTags, tag],
    }))
  }

  if (!showResults) {
    return (
      <Card className="mb-10 rounded-2xl border-gray-200 bg-gray-50">
        <CardContent className="space-y-8 p-6 md:p-8">
          <div>
            <label className="mb-3 block text-sm font-bold uppercase tracking-wide text-gray-700">
              1. What&apos;s your goal?
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  { value: "lose-fat", label: "Lose weight" },
                  { value: "build-muscle", label: "Build muscle" },
                ] as { value: MatchGoal; label: string }[]
              ).map((option) => (
                <button
                  key={option.value}
                  onClick={() => setCriteria((prev) => ({ ...prev, goal: option.value }))}
                  className={`rounded-lg border-2 px-4 py-3 text-center font-medium transition-all ${
                    criteria.goal === option.value
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
              2. Minimum protein per serving?
            </label>
            <div className="grid grid-cols-5 gap-3">
              {PROTEIN_BANDS.map((band) => (
                <button
                  key={band}
                  onClick={() => setCriteria((prev) => ({ ...prev, minProtein: band }))}
                  className={`rounded-lg border-2 px-3 py-3 text-center font-medium transition-all ${
                    criteria.minProtein === band
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
              3. Calorie preference?
            </label>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
              {CALORIE_BANDS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setCriteria((prev) => ({ ...prev, calorieBand: option.value }))}
                  className={`rounded-lg border-2 px-4 py-3 text-center text-sm font-medium transition-all ${
                    criteria.calorieBand === option.value
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
              4. Budget per serving?
            </label>
            <div className="grid gap-3 sm:grid-cols-3">
              {BUDGET_BANDS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setCriteria((prev) => ({ ...prev, budgetBand: option.value }))}
                  className={`rounded-lg border-2 px-4 py-3 text-center text-sm font-medium transition-all ${
                    criteria.budgetBand === option.value
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
              5. Any dietary requirements? (optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {DIET_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleDietTag(tag)}
                  className={`rounded-full border-2 px-4 py-2 text-sm font-medium transition-all ${
                    criteria.dietTags.includes(tag)
                      ? "border-[#006F6D] bg-[#006F6D] text-white"
                      : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                  }`}
                >
                  {DIET_TAG_LABELS[tag]}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Dietary tags reflect our product listings, not independent certification — always check
              the label.
            </p>
          </div>

          <Button
            onClick={() => runMatch(criteria)}
            className="w-full rounded-full bg-[#CCFF00] py-6 text-lg font-bold text-black transition-colors hover:bg-[#A3CC00]"
          >
            Show my matches <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      <Card className="rounded-2xl border-[#006F6D] bg-white">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6 md:p-8">
          <div>
            <h2 className="font-display mb-2 text-2xl font-bold text-gray-900 md:text-3xl">Your Matches</h2>
            <p className="text-gray-600">
              {results.length > 0
                ? `Top ${results.length} snack${results.length === 1 ? "" : "s"} for ${
                    criteria.goal === "build-muscle" ? "building muscle" : "losing weight"
                  }${relaxed ? " (we loosened your budget/calorie range to find these)" : ""}`
                : "No snacks match every preference you picked"}
            </p>
          </div>
          <Button
            onClick={handleReset}
            variant="outline"
            className="rounded-full border-[#006F6D] text-[#006F6D] hover:bg-[#006F6D] hover:text-white"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Start over
          </Button>
        </CardContent>
      </Card>

      {results.length > 0 ? (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {results.map((snack) => (
              <div key={snack.id} className="flex flex-col gap-2">
                <SnackCard snack={snack} />
                <p className="px-1 text-xs text-gray-500">{explainMatch(snack, criteria.goal)}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center gap-3 pt-2 text-center">
            <EmailResultsCapture
              ctaLabel="Email My Snack Matches"
              payload={{ mode: "match", criteria }}
              onSent={(newsletterOptIn) => trackSnackEmailSignup({ mode: "match", newsletterOptIn })}
            />
          </div>
        </>
      ) : (
        <Card className="rounded-2xl border-gray-200 bg-gray-50">
          <CardContent className="p-8 text-center">
            <p className="mb-2 text-lg font-medium text-gray-900">No snacks match every requirement</p>
            <p className="mb-6 text-gray-600">
              Try loosening your dietary requirements or protein target, or start over.
            </p>
            <Button onClick={handleReset} className="rounded-full bg-[#CCFF00] px-6 py-3 font-bold text-black">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try again
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
