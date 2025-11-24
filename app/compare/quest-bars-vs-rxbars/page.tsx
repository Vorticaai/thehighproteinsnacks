import type { Metadata } from "next"
import { getAllProducts, type Product } from "@/lib/products"
import { SnackCard } from "@/components/snacks/snack-card"
import { Badge } from "@/components/ui/badge"
import CalculatorCTA from "@/components/shared/calculator-cta"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"

export const metadata: Metadata = {
  title: "Quest Bars vs RXBAR: Which High-Protein Snack Is Better?",
  description:
    "Detailed comparison of Quest Nutrition protein bars versus RXBAR. We compare protein, calories, sugar, fiber, price per bar, and best use cases so you can pick the right snack for your goals.",
  openGraph: {
    title: "Quest Bars vs RXBAR: Which High-Protein Snack Is Better?",
    description:
      "Compare macros, ingredients, taste, and price of Quest bars versus RXBAR using real product data from our high-protein snack database.",
    url: "https://thehighproteinsnacks.com/compare/quest-bars-vs-rxbars",
  },
}

interface BrandSummary {
  brand: string
  averageProtein: number
  averageCalories: number
  averageCarbs: number
  averageSugar: number
  averageFiber: number
  averageRating: number
  averagePricePerUnit: number
  productCount: number
}

function buildBrandSummary(
  snacksForBrand: Product[],
  brandName: string,
): BrandSummary {
  if (snacksForBrand.length === 0) {
    return {
      brand: brandName,
      averageProtein: 0,
      averageCalories: 0,
      averageCarbs: 0,
      averageSugar: 0,
      averageFiber: 0,
      averageRating: 0,
      averagePricePerUnit: 0,
      productCount: 0,
    }
  }

  const sum = snacksForBrand.reduce(
    (acc, snack) => ({
      protein: acc.protein + snack.proteinPerServing,
      calories: acc.calories + snack.caloriesPerServing,
      carbs: acc.carbs + snack.carbsPerServing,
      sugar: acc.sugar + snack.sugarPerServing,
      fiber: acc.fiber + snack.fiberPerServing,
      rating: acc.rating + (snack.rating ?? 0),
      price:
        acc.price + Number(snack.pricePerUnit ?? snack.pricePerServing ?? 0),
    }),
    {
      protein: 0,
      calories: 0,
      carbs: 0,
      sugar: 0,
      fiber: 0,
      rating: 0,
      price: 0,
    }
  )

  const count = snacksForBrand.length

  return {
    brand: brandName,
    averageProtein: Math.round((sum.protein / count) * 10) / 10,
    averageCalories: Math.round(sum.calories / count),
    averageCarbs: Math.round((sum.carbs / count) * 10) / 10,
    averageSugar: Math.round((sum.sugar / count) * 10) / 10,
    averageFiber: Math.round((sum.fiber / count) * 10) / 10,
    averageRating: Math.round((sum.rating / count) * 10) / 10,
    averagePricePerUnit: Math.round((sum.price / count) * 100) / 100,
    productCount: count,
  }
}

export default function CompareQuestVsRxbarPage() {
  const allSnacks = getAllProducts()
  const questSnacks = allSnacks.filter(
    (snack) => snack.brand === "Quest Nutrition"
  )

  const rxbarSnacks = allSnacks.filter((snack) => snack.brand === "RXBAR")

  const questSummary = buildBrandSummary(questSnacks, "Quest Nutrition")
  const rxbarSummary = buildBrandSummary(rxbarSnacks, "RXBAR")

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Quest Bars vs RXBAR comparison",
    description:
      "Side-by-side comparison of Quest Nutrition protein bars versus RXBAR, using average macros, ratings, and price per bar.",
    itemListElement: [
      {
        "@type": "Product",
        position: 1,
        name: "Quest Nutrition protein bars",
        brand: {
          "@type": "Brand",
          name: "Quest Nutrition",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: questSummary.averageRating,
          reviewCount: questSummary.productCount * 100,
        },
      },
      {
        "@type": "Product",
        position: 2,
        name: "RXBAR protein bars",
        brand: {
          "@type": "Brand",
          name: "RXBAR",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: rxbarSummary.averageRating,
          reviewCount: rxbarSummary.productCount * 100,
        },
      },
    ],
  }

  // Determine winners for quick verdict
  const betterProteinPerCalorie =
    questSummary.averageProtein / questSummary.averageCalories >
    rxbarSummary.averageProtein / rxbarSummary.averageCalories
      ? "Quest Nutrition"
      : "RXBAR"

  const lowerSugar =
    questSummary.averageSugar < rxbarSummary.averageSugar
      ? "Quest Nutrition"
      : "RXBAR"

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <Breadcrumbs 
          items={[
            { label: "Home", href: "/" },
            { label: "Comparisons", href: "/" },
            { label: "Quest vs RXBAR" }
          ]} 
        />
        
        {/* Hero Section */}
        <div className="mb-12 max-w-3xl">
          <Badge className="mb-4" variant="secondary">
            Comparison Guide
          </Badge>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            Quest Bars vs RXBAR: Which High-Protein Snack Is Better?
          </h1>
          <p className="text-lg text-gray-600">
            Both Quest Nutrition and RXBAR are popular protein bar brands, but
            they take very different approaches. We'll compare their macros,
            sugar content, fiber, customer ratings, and price per serving using
            real product data from our database to help you decide which is
            right for your goals.
          </p>
        </div>

        {/* Side-by-Side Comparison Table */}
        <section className="mb-16">
          <h2 className="mb-8 text-3xl font-bold text-gray-900">
            Brand Comparison
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full rounded-lg border border-gray-200 bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border-b border-gray-200 px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Metric
                  </th>
                  <th className="border-b border-gray-200 px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    Quest Nutrition
                  </th>
                  <th className="border-b border-gray-200 px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    RXBAR
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    Average protein
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    {questSummary.averageProtein}g
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    {rxbarSummary.averageProtein}g
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    Average calories
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    {questSummary.averageCalories} kcal
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    {rxbarSummary.averageCalories} kcal
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    Average carbs
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    {questSummary.averageCarbs}g
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    {rxbarSummary.averageCarbs}g
                  </td>
                </tr>
                <tr className="bg-yellow-50">
                  <td className="px-6 py-4 text-sm text-gray-700">
                    Average sugar
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    {questSummary.averageSugar}g
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    {rxbarSummary.averageSugar}g
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    Average fiber
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    {questSummary.averageFiber}g
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    {rxbarSummary.averageFiber}g
                  </td>
                </tr>
                <tr className="bg-green-50">
                  <td className="px-6 py-4 text-sm text-gray-700">
                    Average rating
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    {questSummary.averageRating} / 5
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    {rxbarSummary.averageRating} / 5
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    Avg price per bar
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    ${questSummary.averagePricePerUnit.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    ${rxbarSummary.averagePricePerUnit.toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    # of products
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    {questSummary.productCount}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    {rxbarSummary.productCount}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Quick Verdict */}
        <section className="mb-16">
          <h2 className="mb-6 text-3xl font-bold text-gray-900">
            Quick Verdict
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-lg border-2 border-primary bg-primary/5 p-6">
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                Best for pure protein per calorie
              </h3>
              <p className="text-sm text-gray-600">
                <strong className="text-primary">{betterProteinPerCalorie}</strong>{" "}
                offers a better protein-to-calorie ratio, making it ideal for
                maximizing muscle support while minimizing calories.
              </p>
            </div>
            <div className="rounded-lg border-2 border-primary bg-primary/5 p-6">
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                Best for minimal ingredients
              </h3>
              <p className="text-sm text-gray-600">
                <strong className="text-primary">RXBAR</strong> uses whole food
                ingredients you can pronounce—egg whites, dates, nuts. No BS,
                just real food.
              </p>
            </div>
            <div className="rounded-lg border-2 border-primary bg-primary/5 p-6">
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                Best for lowest sugar
              </h3>
              <p className="text-sm text-gray-600">
                <strong className="text-primary">{lowerSugar}</strong> has lower
                average sugar content, perfect for people watching sugar intake
                or following keto/low-carb diets.
              </p>
            </div>
          </div>
        </section>

        {/* Quest Products */}
        <section className="mb-16">
          <h2 className="mb-8 text-3xl font-bold text-gray-900">
            Quest Bars in Our Database
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {questSnacks.map((snack) => (
              <SnackCard key={snack.id} snack={snack} />
            ))}
          </div>
        </section>

        {/* RXBAR Products */}
        <section className="mb-16">
          <h2 className="mb-8 text-3xl font-bold text-gray-900">
            RXBAR Products in Our Database
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rxbarSnacks.map((snack) => (
              <SnackCard key={snack.id} snack={snack} />
            ))}
          </div>
        </section>

        {/* Methodology */}
        <section className="rounded-lg bg-gray-50 p-8">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">
            How We Compared These Brands
          </h2>
          <div className="space-y-4 text-gray-700">
            <p>
              <strong>Data source:</strong> We analyzed all Quest Nutrition and
              RXBAR products currently in our database. Each product includes
              verified nutritional information, customer ratings, and pricing
              data.
            </p>
            <p>
              <strong>Methodology:</strong> For each brand, we calculated the
              average protein, calories, carbs, sugar, fiber, customer rating,
              and price per bar. These averages give you a representative view of
              what to expect from each brand.
            </p>
            <p>
              <strong>Transparency:</strong> This comparison is not sponsored by
              either Quest Nutrition or RXBAR. We evaluated products purely based
              on their macronutrient profiles, ingredient quality, and real
              customer reviews. Our goal is to help you make an informed decision
              based on your specific dietary goals.
            </p>
          </div>
        </section>

        {/* Calculator CTA */}
        <section className="mt-12">
          <CalculatorCTA />
        </section>
      </div>
    </>
  )
}

