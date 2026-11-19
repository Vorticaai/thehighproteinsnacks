import type { Metadata } from "next"
import Link from "next/link"
import { getAllProducts } from "@/lib/products"
import { SnackCard } from "@/components/snacks/snack-card"
import { Badge } from "@/components/ui/badge"
import CalculatorCTA from "@/components/shared/calculator-cta"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { weightLossFilter } from "@/lib/categoryFilters"

const PAGE_TITLE = "Best High-Protein Snacks for Weight Loss (Under 200 Calories)"
const PAGE_DESCRIPTION =
  "A ranked list of high-protein snacks under 200 calories compared by protein, calories and sugar. Hand-picked from top brands like Quest, RXBAR, KIND, Built Bar, IQBAR and more."

export const metadata: Metadata = {
  alternates: { canonical: "/best-high-protein-snacks-for-weight-loss" },
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    type: "website",
  },
}

function getBestWeightLossSnacks() {
  const weightLossSnacks = getAllProducts().filter(weightLossFilter)

  const ranked = [...weightLossSnacks].sort((a, b) => {
    const aScore =
      a.proteinPerServing * 4 - a.caloriesPerServing / 10
    const bScore =
      b.proteinPerServing * 4 - b.caloriesPerServing / 10
    return bScore - aScore
  })

  return ranked.slice(0, 15)
}

export default function BestWeightLossSnacksPage() {
  const bestSnacks = getBestWeightLossSnacks()

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    itemListElement: bestSnacks.map((snack, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `https://www.thehighproteinsnacks.com/snacks/${snack.id}`,
      name: snack.name,
    })),
  }

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
            { label: "Guides", href: "/guides" },
            { label: "Best for Weight Loss" }
          ]} 
        />
        
        {/* Header Section */}
        <div className="mb-12 max-w-3xl">
          <Badge className="mb-4" variant="secondary">
            Guide
          </Badge>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            {PAGE_TITLE}
          </h1>
          <p className="mb-6 text-lg text-gray-600">
            {PAGE_DESCRIPTION}
          </p>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="mr-2 text-primary">✓</span>
              <span>Under 200 calories per serving</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-primary">✓</span>
              <span>At least 10g protein</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-primary">✓</span>
              <span>Real products available in the US</span>
            </li>
          </ul>
        </div>

        {/* Top Picks Section */}
        <section className="mb-16">
          <div className="mb-8 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-3xl font-bold text-gray-900">
              Top Picks (Ranked)
            </h2>
            <Link
              href="/snacks/weight-loss"
              className="text-sm font-semibold text-primary hover:underline"
            >
              Browse &amp; filter all weight-loss snacks →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {bestSnacks.map((snack, index) => (
              <div key={snack.id} className="relative">
                <div className="absolute -left-2 -top-2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg font-bold text-white shadow-lg">
                  #{index + 1}
                </div>
                <SnackCard snack={snack} />
              </div>
            ))}
          </div>
        </section>

        {/* Methodology Section */}
        <section className="rounded-lg bg-gray-50 p-8">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">
            How We Chose These Weight-Loss Snacks
          </h2>
          <div className="space-y-4 text-gray-700">
            <p>
              <strong>Filtering criteria:</strong> We filtered our entire
              database to include only snacks tagged as "weight-loss" friendly
              with 200 calories or fewer per serving. This ensures you're
              getting genuinely low-calorie options that won't blow your daily
              budget.
            </p>
            <p>
              <strong>Ranking algorithm:</strong> We ranked the filtered snacks
              using a simple score that weighs protein content (heavily) and
              penalises total calories. Higher protein-per-calorie ratios score
              better.
            </p>
            <p>
              <strong>Transparency:</strong> This list is not sponsored. We
              evaluated products based purely on their macronutrient profiles,
              and calorie counts as listed in our data. Our goal is to help
              you find snacks that actually support your weight loss goals.
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

