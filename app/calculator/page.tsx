"use client"

import { useState } from "react"
import { snacks } from "@/data/snacks"
import { SnackCard } from "@/components/snacks/snack-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { buildMetadata } from "@/lib/seo"

type WeightUnit = "kg" | "lbs"
type Goal = "lose-fat" | "maintain" | "build-muscle"
type Activity = "sedentary" | "light" | "moderate" | "very"

export default function CalculatorPage() {
  const [weight, setWeight] = useState<number>(95)
  const [unit, setUnit] = useState<WeightUnit>("kg")
  const [goal, setGoal] = useState<Goal>("lose-fat")
  const [activity, setActivity] = useState<Activity>("moderate")
  const [result, setResult] = useState<{ min: number; max: number } | null>(null)

  const calculateProtein = () => {
    // Convert lbs to kg if needed
    const weightInKg = unit === "lbs" ? weight * 0.453592 : weight

    // Base multipliers (g protein per kg bodyweight)
    let multiplierMin = 1.6
    let multiplierMax = 2.0

    if (goal === "lose-fat") {
      multiplierMin = 1.8
      multiplierMax = 2.2
    } else if (goal === "build-muscle") {
      multiplierMin = 1.8
      multiplierMax = 2.4
    }

    // Adjust for activity
    if (activity === "very") {
      multiplierMax += 0.2
    }

    const min = Math.round((weightInKg * multiplierMin) / 5) * 5
    const max = Math.round((weightInKg * multiplierMax) / 5) * 5

    setResult({ min, max })
  }

  // Get recommended snacks
  const getRecommendedSnacks = () => {
    return snacks
      .filter((s) => s.proteinPerServing >= 10 && s.caloriesPerServing <= 260)
      .sort((a, b) => b.proteinPerDollar - a.proteinPerDollar)
      .slice(0, 6)
  }

  const recommendedSnacks = result ? getRecommendedSnacks() : []

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 md:py-12">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="font-display text-4xl font-bold text-gray-900 md:text-5xl">
          High-Protein Intake Calculator
        </h1>
        <p className="mt-3 text-lg text-gray-600">
          Estimate how much protein you need per day based on your body weight and goals, then see
          snack ideas that fit your macros.
        </p>
      </div>

      {/* Calculator Form */}
      <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
        {/* Body Weight */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-gray-700">
            Body Weight
          </label>
          <div className="flex items-center gap-3">
            <Input
              type="number"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="flex-1 text-lg"
              min="1"
            />
            <div className="flex rounded-full border border-gray-200 bg-gray-50 p-1">
              <button
                onClick={() => setUnit("kg")}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  unit === "kg" ? "bg-[#CCFF00] text-black" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                kg
              </button>
              <button
                onClick={() => setUnit("lbs")}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  unit === "lbs" ? "bg-[#CCFF00] text-black" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                lbs
              </button>
            </div>
          </div>
        </div>

        {/* Primary Goal */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-gray-700">
            Primary Goal
          </label>
          <div className="space-y-2">
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:border-[#006F6D]">
              <input
                type="radio"
                name="goal"
                value="lose-fat"
                checked={goal === "lose-fat"}
                onChange={(e) => setGoal(e.target.value as Goal)}
                className="h-4 w-4 text-[#006F6D]"
              />
              <span className="font-medium text-gray-900">Lose fat & keep muscle</span>
            </label>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:border-[#006F6D]">
              <input
                type="radio"
                name="goal"
                value="maintain"
                checked={goal === "maintain"}
                onChange={(e) => setGoal(e.target.value as Goal)}
                className="h-4 w-4 text-[#006F6D]"
              />
              <span className="font-medium text-gray-900">Maintain weight</span>
            </label>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:border-[#006F6D]">
              <input
                type="radio"
                name="goal"
                value="build-muscle"
                checked={goal === "build-muscle"}
                onChange={(e) => setGoal(e.target.value as Goal)}
                className="h-4 w-4 text-[#006F6D]"
              />
              <span className="font-medium text-gray-900">Build muscle / gain strength</span>
            </label>
          </div>
        </div>

        {/* Activity Level */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-gray-700">
            Activity Level
          </label>
          <select
            value={activity}
            onChange={(e) => setActivity(e.target.value as Activity)}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-900 focus:border-[#006F6D] focus:outline-none focus:ring-2 focus:ring-[#006F6D]/20"
          >
            <option value="sedentary">Mostly sedentary (little or no exercise)</option>
            <option value="light">Lightly active (1–3 workouts per week)</option>
            <option value="moderate">Moderately active (3–5 workouts per week)</option>
            <option value="very">Very active (6–7 workouts per week or physical job)</option>
          </select>
          <p className="mt-1 text-sm text-gray-600">
            Tip: count gym sessions, sports and long walks as workouts when choosing your activity
            level.
          </p>
        </div>

        {/* Calculate Button */}
        <Button
          onClick={calculateProtein}
          className="w-full rounded-full bg-[#CCFF00] py-6 text-lg font-bold text-black hover:bg-[#A3CC00]"
        >
          Calculate my protein target
        </Button>
      </div>

      {/* Results */}
      {result && (
        <>
          <div className="mb-8 rounded-2xl border border-[#006F6D] bg-white p-8 shadow-sm">
            <h2 className="mb-3 font-display text-2xl font-bold text-gray-900">
              Your daily protein target
            </h2>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-5xl font-extrabold text-[#006F6D] md:text-6xl">
                {result.min}–{result.max}g
              </span>
              <span className="text-lg text-gray-600">protein per day</span>
            </div>
            <p className="mt-3 text-gray-700">
              {goal === "lose-fat" &&
                "Higher end helps preserve lean muscle while dieting."}
              {goal === "maintain" &&
                "This range supports muscle maintenance and overall health."}
              {goal === "build-muscle" &&
                "Higher protein intake supports muscle growth and recovery."}
            </p>
            <p className="mt-4 text-sm text-gray-500">
              Rule of thumb: 1.6–2.3g protein per kg of bodyweight (0.8–1.0g per lb). This tool
              gives an estimate, not medical advice.
            </p>
          </div>

          {/* Snack Recommendations */}
          <div className="mb-8">
            <h2 className="mb-6 font-display text-3xl font-bold text-gray-900">
              Snacks that help you hit this target
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recommendedSnacks.map((snack) => (
                <SnackCard key={snack.id} snack={snack} />
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
            <strong>Important:</strong> This calculator uses general science-based guidelines for
            healthy adults. Always adjust based on your doctor's or dietitian's advice, total
            calories, and how you feel. Individual needs vary based on training intensity, body
            composition, and metabolic factors.
          </p>
        </>
      )}
    </main>
  )
}

