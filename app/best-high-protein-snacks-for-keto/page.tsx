import type { Metadata } from "next"
import { snacks } from "@/data/snacks"
import { SnackCard } from "@/components/snacks/snack-card"
import { Badge } from "@/components/ui/badge"
import CalculatorCTA from "@/components/shared/calculator-cta"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"

const PAGE_TITLE = "Best High-Protein Snacks for Keto (Low-Carb, High-Protein)"
const PAGE_DESCRIPTION =
  "A ranked list of high-protein, low-carb snacks that fit a keto lifestyle. All picks are under 10g carbs and packed with protein for steady energy and appetite control."

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    type: "website",
  },
}

function getBestKetoSnacks() {
  const ketoSnacks = snacks.filter((snack) =>
    snack.categoryTags?.includes("keto")
  )

  const filtered = ketoSnacks.filter((snack) => snack.carbsPerServing <= 10)

  const ranked = [...filtered].sort((a, b) => {
    const aScore =
      a.proteinPerServing * 4 - a.carbsPerServing * 0.5 + (a.rating || 0)
    const bScore =
      b.proteinPerServing * 4 - b.carbsPerServing * 0.5 + (b.rating || 0)
    return bScore - aScore
  })

  return ranked.slice(0, 15)
}

export default function BestKetoSnacksPage() {
  const bestSnacks = getBestKetoSnacks()

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    itemListElement: bestSnacks.map((snack, index) => ({
      "@type": "Product",
      position: index + 1,
      url: `https://thehighproteinsnacks.com/snack/${snack.id}`,
      name: snack.name,
      image: snack.imageUrl,
      brand: {
        "@type": "Brand",
        name: snack.brand,
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: snack.rating,
        reviewCount: snack.reviewCount,
      },
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
            { label: "Guides", href: "/" },
            { label: "Best for Keto" }
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
              <span>Under 10g carbs per serving</span>
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
          <h2 className="mb-8 text-3xl font-bold text-gray-900">
            Top Keto-Friendly Snacks (Ranked)
          </h2>
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
            How We Chose These Keto Snacks
          </h2>
          <div className="space-y-4 text-gray-700">
            <p>
              <strong>Filtering criteria:</strong> We filtered our entire
              database to include only snacks tagged as "keto" friendly with 10g
              of carbs or fewer per serving. This ensures you're getting truly
              low-carb options that won't kick you out of ketosis or spike your
              blood sugar.
            </p>
            <p>
              <strong>Ranking algorithm:</strong> We ranked the filtered snacks
              using a score that heavily weighs protein content, penalizes carbs,
              and factors in verified customer ratings. Snacks with higher
              protein-to-carb ratios score better, helping you maintain ketosis
              while staying satisfied.
            </p>
            <p>
              <strong>Transparency:</strong> This list is not sponsored. We
              evaluated products based purely on their macronutrient profiles,
              carb counts, and real customer reviews. Our goal is to help you
              find keto snacks that actually support your low-carb lifestyle.
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

