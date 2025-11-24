"use client"

import { useState } from "react"
import { SnackCard } from "@/components/snacks/snack-card"
import type { Product } from "@/lib/products"

type GoalOption = "lose-fat" | "maintain" | "build-muscle"
type ActivityLevel = "sedentary" | "light" | "moderate" | "very"

type CalculatorFormProps = {
  snacks: Product[]
}

type ProteinRange = {
  min: number
  max: number
}

export default function CalculatorForm({ snacks }: CalculatorFormProps) {
  const [weight, setWeight] = useState(90)
  const [unit, setUnit] = useState<"kg" | "lbs">("kg")
  const [goal, setGoal] = useState<GoalOption>("lose-fat")
  const [activity, setActivity] = useState<ActivityLevel>("moderate")

  const [result, setResult] = useState<ProteinRange | null>(null)

  const calculate = () => {
    const kg = unit === "lbs" ? weight * 0.453592 : weight

    let min = 1.6,
      max = 2.0

    if (goal === "lose-fat") {
      min = 1.8
      max = 2.2
    }
    if (goal === "build-muscle") {
      min = 1.8
      max = 2.4
    }
    if (activity === "very") {
      max += 0.2
    }

    const minG = Math.round(kg * min)
    const maxG = Math.round(kg * max)

    setResult({ min: minG, max: maxG })
  }

  const recommendedSnacks = snacks
    .filter(
      (s) =>
        s.proteinPerServing >= 10 &&
        s.caloriesPerServing <= 260 &&
        typeof s.proteinPerDollar === "number",
    )
    .sort((a, b) => b.proteinPerDollar - a.proteinPerDollar)
    .slice(0, 6)

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
      {/* Weight */}
      <div className="mb-6">
        <label className="block text-sm font-semibold uppercase text-gray-700 mb-2">
          Body Weight
        </label>
        <div className="flex items-center gap-3">
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            className="flex-1 rounded-lg border px-3 py-2 text-lg"
          />
          <div className="flex rounded-full border bg-gray-50 p-1">
            <button
              onClick={() => setUnit("kg")}
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                unit === "kg" ? "bg-[#CCFF00] text-black" : "text-gray-600"
              }`}
            >
              kg
            </button>
            <button
              onClick={() => setUnit("lbs")}
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                unit === "lbs" ? "bg-[#CCFF00] text-black" : "text-gray-600"
              }`}
            >
              lbs
            </button>
          </div>
        </div>
      </div>

      {/* Goal */}
      <div className="mb-6">
        <label className="block text-sm font-semibold uppercase text-gray-700 mb-2">
          Primary Goal
        </label>
        <div className="space-y-2">
          {(["lose-fat", "maintain", "build-muscle"] as GoalOption[]).map((g) => (
            <label
              key={g}
              className="flex cursor-pointer items-center gap-3 rounded-xl border p-4 hover:border-[#006F6D]"
            >
              <input
                type="radio"
                name="goal"
                value={g}
                checked={goal === g}
                onChange={() => setGoal(g)}
              />
              <span className="font-medium text-gray-900 capitalize">
                {g.replace("-", " ")}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Activity */}
      <div className="mb-6">
        <label className="block text-sm font-semibold uppercase text-gray-700 mb-2">
          Activity Level
        </label>
        <select
          value={activity}
          onChange={(e) => setActivity(e.target.value as ActivityLevel)}
          className="w-full rounded-lg border px-4 py-3"
        >
          <option value="sedentary">Sedentary</option>
          <option value="light">Light (1–3 workouts)</option>
          <option value="moderate">Moderate (3–5 workouts)</option>
          <option value="very">Very active</option>
        </select>
      </div>

      {/* Calculate */}
      <button
        onClick={calculate}
        className="w-full rounded-full bg-[#CCFF00] py-4 font-bold text-black hover:bg-[#A3CC00]"
      >
        Calculate
      </button>

      {result && (
        <>
          <div className="mt-8 rounded-2xl border border-[#006F6D] p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Your daily protein target
            </h2>
            <p className="text-4xl font-extrabold text-[#006F6D]">
              {result.min}–{result.max}g
            </p>
          </div>

          {/* Snacks */}
          <div className="mt-10">
            <h3 className="text-2xl font-bold mb-6">
              Snacks to help you reach your target
            </h3>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recommendedSnacks.map((s) => (
                <SnackCard key={s.id} snack={s} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
