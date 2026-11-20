"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRight, RefreshCw, Search } from "lucide-react"
import type { Product } from "@/lib/products"
import ProductVisual from "@/components/snacks/ProductVisual"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import EmailResultsCapture from "@/components/quiz/EmailResultsCapture"
import NotifyMeCapture from "@/components/quiz/NotifyMeCapture"
import { trackSnackFinderCompleted, trackSnackEmailSignup, trackNotifySignup } from "@/lib/analytics"
import { searchProducts, findUpgrades, type MatchGoal, type Upgrade } from "@/lib/snackMatch"

type UpgradeMySnackProps = {
  products: Product[]
  initialProductId?: string | null
  initialGoal?: MatchGoal | null
}

export default function UpgradeMySnack({ products, initialProductId, initialGoal }: UpgradeMySnackProps) {
  const initialProduct = initialProductId ? products.find((p) => p.id === initialProductId) ?? null : null
  const [current, setCurrent] = useState<Product | null>(initialProduct)
  const [goal, setGoal] = useState<MatchGoal>(initialGoal ?? "build-muscle")
  const [query, setQuery] = useState("")
  const [showResults, setShowResults] = useState(Boolean(initialProduct))
  const [upgrades, setUpgrades] = useState<Upgrade[]>(
    initialProduct ? findUpgrades(initialProduct, products, initialGoal ?? "build-muscle", 3) : [],
  )

  const matches = useMemo(() => searchProducts(products, query, 6), [products, query])

  // A revisit link pointed at a product no longer in the catalogue.
  if (initialProductId && !initialProduct) {
    return (
      <Card className="rounded-2xl border-gray-200 bg-gray-50">
        <CardContent className="p-8 text-center">
          <p className="mb-2 text-lg font-medium text-gray-900">That snack isn&apos;t in our database anymore</p>
          <p className="text-gray-600">Search for it below, or pick another one to compare.</p>
        </CardContent>
      </Card>
    )
  }

  const pickProduct = (product: Product) => {
    setCurrent(product)
    setQuery("")
    setShowResults(false)
  }

  const runUpgrade = (nextGoal: MatchGoal) => {
    if (!current) return
    const found = findUpgrades(current, products, nextGoal, 3)
    setUpgrades(found)
    setShowResults(true)
    trackSnackFinderCompleted({
      mode: "upgrade",
      goal: nextGoal,
      resultCount: found.length,
    })
  }

  const handleReset = () => {
    setCurrent(null)
    setShowResults(false)
    setUpgrades([])
  }

  if (!current) {
    return (
      <Card className="mb-10 rounded-2xl border-gray-200 bg-gray-50">
        <CardContent className="p-6 md:p-8">
          <label className="mb-3 block text-sm font-bold uppercase tracking-wide text-gray-700">
            What snack do you currently eat?
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or brand, e.g. &quot;Quest bar&quot;"
              className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-3 text-sm focus:border-[#006F6D] focus:outline-none"
            />
          </div>

          {query.trim().length >= 2 ? (
            matches.length > 0 ? (
              <div className="mt-3 divide-y divide-gray-200 overflow-hidden rounded-lg border border-gray-200 bg-white">
                {matches.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => pickProduct(product)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-gray-50"
                  >
                    <span>
                      <span className="block text-xs font-semibold uppercase text-gray-500">{product.brand}</span>
                      <span className="block font-medium text-gray-900">{product.name}</span>
                    </span>
                    <span className="text-xs text-gray-500">{product.proteinPerServing}g protein</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-gray-600">
                We don&apos;t have that one in our database yet — try another name, or browse{" "}
                <Link href="/snacks/weight-loss" className="font-medium text-[#006F6D] underline">
                  all snacks
                </Link>
                .
              </p>
            )
          ) : null}
        </CardContent>
      </Card>
    )
  }

  if (!showResults) {
    return (
      <Card className="mb-10 rounded-2xl border-gray-200 bg-gray-50">
        <CardContent className="space-y-6 p-6 md:p-8">
          <CurrentSnackSummary product={current} onChange={handleReset} />

          <div>
            <label className="mb-3 block text-sm font-bold uppercase tracking-wide text-gray-700">
              What&apos;s your goal?
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
                  onClick={() => setGoal(option.value)}
                  className={`rounded-lg border-2 px-4 py-3 text-center font-medium transition-all ${
                    goal === option.value
                      ? "border-[#CCFF00] bg-[#CCFF00] text-black"
                      : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={() => runUpgrade(goal)}
            className="w-full rounded-full bg-[#CCFF00] py-6 text-lg font-bold text-black transition-colors hover:bg-[#A3CC00]"
          >
            Find my upgrade <ArrowRight className="ml-2 h-5 w-5" />
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
            <h2 className="font-display mb-2 text-2xl font-bold text-gray-900 md:text-3xl">
              {upgrades.length > 0 ? "Better Options For You" : "You're Already Doing Well"}
            </h2>
            <p className="text-gray-600">
              Compared to {current.name}, for {goal === "build-muscle" ? "building muscle" : "losing weight"}
            </p>
          </div>
          <Button
            onClick={handleReset}
            variant="outline"
            className="rounded-full border-[#006F6D] text-[#006F6D] hover:bg-[#006F6D] hover:text-white"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Compare another snack
          </Button>
        </CardContent>
      </Card>

      {upgrades.length > 0 ? (
        <>
          <div className="space-y-6">
            {upgrades.map((upgrade) => (
              <UpgradeCompareCard key={upgrade.product.id} current={current} upgrade={upgrade} />
            ))}
          </div>

          <div className="flex flex-col items-center gap-4 pt-2 text-center">
            <NotifyMeCapture
              payload={{ mode: "upgrade", goal, productId: current.id }}
              onSubscribed={(dietTags) => trackNotifySignup({ mode: "upgrade", goal, dietTags })}
            />
            <EmailResultsCapture
              ctaLabel="Email My Snack Upgrade"
              payload={{ mode: "upgrade", productId: current.id, goal }}
              onSent={(newsletterOptIn) => trackSnackEmailSignup({ mode: "upgrade", newsletterOptIn })}
            />
          </div>
        </>
      ) : (
        <Card className="rounded-2xl border-gray-200 bg-gray-50">
          <CardContent className="p-8 text-center">
            <p className="text-gray-700">
              For {goal === "build-muscle" ? "building muscle" : "losing weight"}, {current.name} already holds
              up well against our database — nothing clearly beats it on protein, calories, sugar or value.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function CurrentSnackSummary({ product, onChange }: { product: Product; onChange: () => void }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4">
      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
        <ProductVisual product={product} />
      </div>
      <div className="flex-1">
        <p className="text-xs font-semibold uppercase text-gray-500">{product.brand}</p>
        <p className="font-bold text-gray-900">{product.name}</p>
        <p className="text-sm text-gray-600">
          {product.proteinPerServing}g protein · {product.caloriesPerServing} cal · {product.sugarPerServing}g sugar
        </p>
      </div>
      <button onClick={onChange} className="text-sm font-medium text-[#006F6D] underline">
        Change
      </button>
    </div>
  )
}

function Delta({ label, value, unit, lowerIsBetter = false }: { label: string; value: number; unit: string; lowerIsBetter?: boolean }) {
  const better = value === 0 ? null : lowerIsBetter ? value < 0 : value > 0
  const color = better === null ? "text-gray-500" : better ? "text-green-600" : "text-red-500"
  const sign = value > 0 ? "+" : ""
  return (
    <div className="text-center">
      <p className="text-xs font-semibold uppercase text-gray-500">{label}</p>
      <p className={`text-base font-extrabold ${color}`}>
        {value === 0 ? "Same" : `${sign}${value}${unit}`}
      </p>
    </div>
  )
}

function UpgradeCompareCard({ current, upgrade }: { current: Product; upgrade: Upgrade }) {
  const { product, deltas } = upgrade
  return (
    <Card className="overflow-hidden rounded-2xl border-gray-200">
      <CardContent className="p-0">
        <div className="grid grid-cols-1 divide-gray-200 md:grid-cols-2 md:divide-x">
          {/* Before */}
          <div className="flex items-center gap-4 border-b border-gray-200 p-5 md:border-b-0">
            <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg opacity-70">
              <ProductVisual product={current} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">Currently eating</p>
              <p className="font-semibold text-gray-700">{current.name}</p>
              <p className="text-xs text-gray-500">
                {current.proteinPerServing}g protein · {current.caloriesPerServing} cal
              </p>
            </div>
          </div>
          {/* After */}
          <div className="flex items-center gap-4 bg-[#006F6D]/5 p-5">
            <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg">
              <ProductVisual product={product} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#006F6D]">Upgrade to</p>
              <Link href={`/snacks/${product.id}`} className="font-bold text-gray-900 hover:underline">
                {product.name}
              </Link>
              <p className="text-xs text-gray-500">{product.brand}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 border-t border-gray-100 p-5 sm:grid-cols-4">
          <Delta label="Protein" value={deltas.protein} unit="g" />
          <Delta label="Calories" value={deltas.calories} unit="" lowerIsBetter />
          <Delta label="Sugar" value={deltas.sugar} unit="g" lowerIsBetter />
          {deltas.proteinPerDollar !== null ? (
            <Delta label="Protein/$" value={deltas.proteinPerDollar} unit="g" />
          ) : (
            <div className="text-center">
              <p className="text-xs font-semibold uppercase text-gray-500">Protein/$</p>
              <p className="text-sm text-gray-400">Price n/a</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
