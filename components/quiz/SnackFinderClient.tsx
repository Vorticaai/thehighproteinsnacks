"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import type { Product } from "@/lib/products"
import FindMyMatch from "@/components/quiz/FindMyMatch"
import UpgradeMySnack from "@/components/quiz/UpgradeMySnack"
import { criteriaFromSearchParams, type MatchGoal } from "@/lib/snackMatch"

type Mode = "match" | "upgrade"

type SnackFinderClientProps = {
  products: Product[]
}

/**
 * Hosts both Snack Finder tools: "Find My Match" (goal/protein/calorie/
 * budget/diet quiz) and "Upgrade My Snack" (search + before/after
 * comparison). A revisit link emailed from either tool (?mode=upgrade&
 * product=...&goal=... or ?mode=match&goal=...&protein=...) opens straight
 * to that tool's results, recomputed live against current product data.
 */
export default function SnackFinderClient({ products }: SnackFinderClientProps) {
  const params = useSearchParams()
  const linkedMode = params.get("mode")
  const [mode, setMode] = useState<Mode>(linkedMode === "upgrade" ? "upgrade" : "match")

  const initialCriteria = linkedMode === "match" ? criteriaFromSearchParams(params) : null
  const initialProductId = linkedMode === "upgrade" ? params.get("product") : null
  const goalParam = params.get("goal")
  const initialGoal: MatchGoal | null = goalParam === "lose-fat" || goalParam === "build-muscle" ? goalParam : null

  return (
    <>
      <header className="mb-8 text-center">
        <h1 className="font-display mb-4 text-4xl font-extrabold text-gray-900 md:text-5xl">
          Protein Snack Match &amp; Upgrade
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-600">
          Find the high-protein snacks that fit your goal, or see what beats the snack you&apos;re eating
          now.
        </p>
      </header>

      <div className="mb-8 flex justify-center gap-2 rounded-full bg-gray-100 p-1.5">
        <button
          onClick={() => setMode("match")}
          className={`flex-1 rounded-full px-4 py-2.5 text-sm font-bold transition-colors sm:flex-none sm:px-8 ${
            mode === "match" ? "bg-white text-gray-900 shadow" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Find My Match
        </button>
        <button
          onClick={() => setMode("upgrade")}
          className={`flex-1 rounded-full px-4 py-2.5 text-sm font-bold transition-colors sm:flex-none sm:px-8 ${
            mode === "upgrade" ? "bg-white text-gray-900 shadow" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Upgrade My Snack
        </button>
      </div>

      {mode === "match" ? (
        <FindMyMatch products={products} initialCriteria={initialCriteria} />
      ) : (
        <UpgradeMySnack products={products} initialProductId={initialProductId} initialGoal={initialGoal} />
      )}

      <div className="mt-12 rounded-lg bg-gray-100 p-6">
        <p className="text-sm text-gray-700">
          <strong>Note:</strong> Matches and upgrades are based on the preferences you select and our
          product database. Prices are estimates and change often — check the retailer for the current
          price. Dietary tags reflect our product listings, not independent certification. Individual
          nutritional needs vary; always check the label and consult a healthcare professional for
          personalized advice.
        </p>
      </div>
    </>
  )
}
