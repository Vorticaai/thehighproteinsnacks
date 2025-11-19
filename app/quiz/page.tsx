"use client"

/**
 * Snack Finder Quiz - Interactive quiz that recommends personalized
 * high-protein snacks based on user goals, preferences, and dietary needs.
 */
import { useState } from "react"
import Link from "next/link"
import { snacks } from "@/data/snacks"
import type { Snack, DietTag } from "@/data/types"
import { SnackCard } from "@/components/snacks/snack-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, RefreshCw } from "lucide-react"

type Goal = "lose-fat" | "maintain" | "build-muscle"
type SnackTime = "desk" | "late-night" | "pre-workout" | "on-the-go"
type CalorieBand = "<150" | "150-220" | "220-280"
type DietTagChoice = "vegan" | "keto" | "gluten-free" | "halal" | "low-sugar"
type Flavor = "sweet" | "savory" | "either"

interface QuizAnswers {
  goal: Goal | null
  snackTime: SnackTime | null
  calorieBand: CalorieBand | null
  dietTags: DietTagChoice[]
  flavor: Flavor | null
}

function getRecommendedSnacks(answers: QuizAnswers): Snack[] {
  let filtered = [...snacks]

  // Filter by calorie band
  if (answers.calorieBand) {
    filtered = filtered.filter((snack) => {
      const cals = snack.caloriesPerServing
      switch (answers.calorieBand) {
        case "<150":
          return cals < 150
        case "150-220":
          return cals >= 150 && cals <= 220
        case "220-280":
          return cals >= 220 && cals <= 280
        default:
          return true
      }
    })
  }

  // Filter by diet tags
  if (answers.dietTags.length > 0) {
    filtered = filtered.filter((snack) =>
      answers.dietTags.every((tag) => snack.dietTags.includes(tag as DietTag))
    )
  }

  // Filter by snack time (using bestFor field)
  if (answers.snackTime) {
    const timeMap: Record<SnackTime, string[]> = {
      desk: ["desk-snack", "office-drawer", "study-fuel"],
      "late-night": ["late-night-craving", "movie-snack"],
      "pre-workout": ["pre-workout", "gym-bag", "post-workout"],
      "on-the-go": ["travel", "road-trip", "on-the-go", "airport-snack"],
    }
    const relevantTimes = timeMap[answers.snackTime]
    filtered = filtered.filter((snack) =>
      snack.bestFor.some((time) => relevantTimes.includes(time))
    )
  }

  // Filter by flavor preference (using name/description heuristics)
  if (answers.flavor && answers.flavor !== "either") {
    filtered = filtered.filter((snack) => {
      const text = `${snack.name} ${snack.description}`.toLowerCase()
      if (answers.flavor === "sweet") {
        return (
          text.includes("chocolate") ||
          text.includes("cookie") ||
          text.includes("brownie") ||
          text.includes("caramel") ||
          text.includes("peanut butter") ||
          text.includes("vanilla") ||
          text.includes("berry") ||
          text.includes("mint")
        )
      } else {
        // savory
        return (
          text.includes("ranch") ||
          text.includes("bbq") ||
          text.includes("cheese") ||
          text.includes("sour cream") ||
          text.includes("jerky") ||
          text.includes("meat") ||
          text.includes("beef") ||
          text.includes("turkey") ||
          text.includes("chicken") ||
          text.includes("bacon") ||
          text.includes("salt")
        )
      }
    })
  }

  // Score and sort by goal
  const scored = filtered.map((snack) => {
    let score = 0

    // Base score on protein
    score += snack.proteinPerServing * 4

    // Adjust by goal
    if (answers.goal === "lose-fat") {
      score -= snack.caloriesPerServing / 10
      score += snack.fiberPerServing * 2
    } else if (answers.goal === "build-muscle") {
      score += snack.proteinPerServing * 2
    } else {
      // maintain
      score += snack.rating * 10
    }

    // Bonus for high protein per dollar
    score += snack.proteinPerDollar * 3

    // Boost hero snacks slightly (curated products)
    if (snack.isHero) {
      score += 5
    }

    return { snack, score }
  })

  scored.sort((a, b) => b.score - a.score)

  return scored.slice(0, 9).map((item) => item.snack)
}

export default function SnackFinderQuizPage() {
  const [answers, setAnswers] = useState<QuizAnswers>({
    goal: null,
    snackTime: null,
    calorieBand: null,
    dietTags: [],
    flavor: null,
  })
  const [showResults, setShowResults] = useState(false)

  const handleSubmit = () => {
    // Validate at least goal and calorie band are selected
    if (!answers.goal || !answers.calorieBand) {
      alert("Please select at least your goal and calorie preference")
      return
    }
    setShowResults(true)
  }

  const handleReset = () => {
    setAnswers({
      goal: null,
      snackTime: null,
      calorieBand: null,
      dietTags: [],
      flavor: null,
    })
    setShowResults(false)
  }

  const toggleDietTag = (tag: DietTagChoice) => {
    setAnswers((prev) => ({
      ...prev,
      dietTags: prev.dietTags.includes(tag)
        ? prev.dietTags.filter((t) => t !== tag)
        : [...prev.dietTags, tag],
    }))
  }

  const recommendations = showResults ? getRecommendedSnacks(answers) : []

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 md:py-12">
      {/* Hero Section */}
      <header className="mb-10 text-center">
        <h1 className="font-display mb-4 text-4xl font-extrabold text-gray-900 md:text-5xl">
          Snack Finder Quiz
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-600">
          Answer a few quick questions and we'll recommend high-protein snacks
          that match your goals, calories, and diet tags.
        </p>
      </header>

      {!showResults ? (
        /* Quiz Form */
        <Card className="mb-10 rounded-2xl border-gray-200 bg-gray-50">
          <CardContent className="p-6 md:p-8">
            <div className="space-y-8">
              {/* Question 1: Goal */}
              <div>
                <label className="mb-3 block text-sm font-bold uppercase tracking-wide text-gray-700">
                  1. What's your primary goal?
                </label>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { value: "lose-fat" as Goal, label: "Lose fat & stay full" },
                    { value: "maintain" as Goal, label: "Maintain weight" },
                    {
                      value: "build-muscle" as Goal,
                      label: "Build muscle / gain",
                    },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() =>
                        setAnswers((prev) => ({ ...prev, goal: option.value }))
                      }
                      className={`rounded-lg border-2 px-4 py-3 text-center font-medium transition-all ${
                        answers.goal === option.value
                          ? "border-[#CCFF00] bg-[#CCFF00] text-black"
                          : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 2: Snack Time */}
              <div>
                <label className="mb-3 block text-sm font-bold uppercase tracking-wide text-gray-700">
                  2. When do you usually snack?
                </label>
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                  {[
                    { value: "desk" as SnackTime, label: "At my desk" },
                    { value: "late-night" as SnackTime, label: "Late night" },
                    { value: "pre-workout" as SnackTime, label: "Pre/post workout" },
                    { value: "on-the-go" as SnackTime, label: "On the go" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() =>
                        setAnswers((prev) => ({
                          ...prev,
                          snackTime: option.value,
                        }))
                      }
                      className={`rounded-lg border-2 px-4 py-3 text-center text-sm font-medium transition-all ${
                        answers.snackTime === option.value
                          ? "border-[#CCFF00] bg-[#CCFF00] text-black"
                          : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 3: Calorie Band */}
              <div>
                <label className="mb-3 block text-sm font-bold uppercase tracking-wide text-gray-700">
                  3. How many calories per snack?
                </label>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { value: "<150" as CalorieBand, label: "Under 150 cal" },
                    { value: "150-220" as CalorieBand, label: "150–220 cal" },
                    { value: "220-280" as CalorieBand, label: "220–280 cal" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() =>
                        setAnswers((prev) => ({
                          ...prev,
                          calorieBand: option.value,
                        }))
                      }
                      className={`rounded-lg border-2 px-4 py-3 text-center font-medium transition-all ${
                        answers.calorieBand === option.value
                          ? "border-[#CCFF00] bg-[#CCFF00] text-black"
                          : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 4: Diet Tags */}
              <div>
                <label className="mb-3 block text-sm font-bold uppercase tracking-wide text-gray-700">
                  4. Any dietary requirements? (optional, select all that apply)
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "vegan" as DietTagChoice, label: "Vegan" },
                    { value: "keto" as DietTagChoice, label: "Keto" },
                    {
                      value: "gluten-free" as DietTagChoice,
                      label: "Gluten-free",
                    },
                    { value: "halal" as DietTagChoice, label: "Halal" },
                    { value: "low-sugar" as DietTagChoice, label: "Low sugar" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => toggleDietTag(option.value)}
                      className={`rounded-full border-2 px-4 py-2 text-sm font-medium transition-all ${
                        answers.dietTags.includes(option.value)
                          ? "border-[#006F6D] bg-[#006F6D] text-white"
                          : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 5: Flavor */}
              <div>
                <label className="mb-3 block text-sm font-bold uppercase tracking-wide text-gray-700">
                  5. Sweet or savory?
                </label>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { value: "sweet" as Flavor, label: "Sweet" },
                    { value: "savory" as Flavor, label: "Savory" },
                    { value: "either" as Flavor, label: "Either is fine" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() =>
                        setAnswers((prev) => ({
                          ...prev,
                          flavor: option.value,
                        }))
                      }
                      className={`rounded-lg border-2 px-4 py-3 text-center font-medium transition-all ${
                        answers.flavor === option.value
                          ? "border-[#CCFF00] bg-[#CCFF00] text-black"
                          : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                className="w-full rounded-full bg-[#CCFF00] py-6 text-lg font-bold text-black hover:bg-[#A3CC00] transition-colors"
              >
                Show my recommendations <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Results Section */
        <div className="space-y-8">
          {/* Results Header */}
          <Card className="rounded-2xl border-[#006F6D] bg-white">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display mb-2 text-2xl font-bold text-gray-900 md:text-3xl">
                    Your Personalized Recommendations
                  </h2>
                  <p className="text-gray-600">
                    We found {recommendations.length} snacks that match your
                    preferences
                  </p>
                </div>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="rounded-full border-[#006F6D] text-[#006F6D] hover:bg-[#006F6D] hover:text-white"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retake Quiz
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results Grid */}
          {recommendations.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recommendations.map((snack) => (
                <SnackCard key={snack.id} snack={snack} />
              ))}
            </div>
          ) : (
            <Card className="rounded-2xl border-gray-200 bg-gray-50">
              <CardContent className="p-8 text-center">
                <p className="mb-4 text-lg font-medium text-gray-900">
                  No snacks match all your criteria
                </p>
                <p className="mb-6 text-gray-600">
                  Try adjusting your dietary requirements or calorie range
                </p>
                <Button
                  onClick={handleReset}
                  className="rounded-full bg-[#CCFF00] px-6 py-3 font-bold text-black hover:bg-[#A3CC00]"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Browse All Link */}
          <div className="text-center">
            <p className="mb-4 text-gray-600">
              Want to explore more options?
            </p>
            <Link
              href="/category/weight-loss"
              className="inline-flex items-center rounded-full border-2 border-[#006F6D] bg-transparent px-6 py-3 font-bold text-[#006F6D] hover:bg-[#006F6D] hover:text-white transition-colors"
            >
              Browse all snacks <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-12 rounded-lg bg-gray-100 p-6">
        <p className="text-sm text-gray-700">
          <strong>Note:</strong> These recommendations are based on your
          preferences and our product database. Individual nutritional needs
          vary. Always check product labels and consult with a healthcare
          professional for personalized dietary advice.
        </p>
      </div>
    </main>
  )
}

