/**
 * Snack detail page with macros, benefits, and structured data.
 * Uses Next.js App Router patterns for static generation and SEO.
 */
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { getAllSnacks } from "@/lib/directory"
import { buildMetadata, absoluteUrl } from "@/lib/seo"
import { snacks } from "@/data/snacks"

type SnackPageProps = {
  params: { id: string }
}

// Generate static params for all snacks at build time
export async function generateStaticParams() {
  const allSnacks = getAllSnacks()
  return allSnacks.map((snack) => ({
    id: snack.id,
  }))
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: SnackPageProps): Promise<Metadata> {
  const snack = snacks.find((s) => s.id === params.id)
  if (!snack) {
    return buildMetadata({
      title: "Snack not found",
      description: "Explore our latest high-protein picks.",
      path: `/snack/${params.id}`,
    })
  }
  return buildMetadata({
    title: snack.name,
    description: snack.description,
    path: `/snack/${snack.id}`,
    ogImage: snack.imageUrl,
  })
}

export default function SnackPage({ params }: SnackPageProps) {
  const snack = snacks.find((s) => s.id === params.id)
  if (!snack) {
    notFound()
  }

  // Determine primary category for breadcrumb
  const primaryCategory = snack.categoryTags[0] || "snacks"

  // Enhanced Product schema with complete nutrition data
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: snack.name,
    image: [snack.imageUrl],
    description: snack.description,
    brand: {
      "@type": "Brand",
      name: snack.brand,
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: snack.rating,
      reviewCount: snack.reviewCount,
      bestRating: 5,
      worstRating: 1,
    },
    nutrition: {
      "@type": "NutritionInformation",
      servingSize: snack.servingSize,
      calories: `${snack.caloriesPerServing} kcal`,
      proteinContent: `${snack.proteinPerServing} g`,
      carbohydrateContent: `${snack.carbsPerServing} g`,
      fatContent: `${snack.fatsPerServing} g`,
      sugarContent: `${snack.sugarPerServing} g`,
      fiberContent: `${snack.fiberPerServing} g`,
    },
    offers: {
      "@type": "Offer",
      price: snack.pricePerUnit.toFixed(2),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url:
        snack.buyUrl ||
        absoluteUrl(`/snack/${snack.id}`),
    },
  }

  // FAQ Schema for rich snippets
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: snack.faq.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  }

  // Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: absoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: primaryCategory.replace("-", " "),
        item: absoluteUrl(`/category/${primaryCategory}`),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: snack.name,
        item: absoluteUrl(`/snack/${snack.id}`),
      },
    ],
  }

  return (
    <>
      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span>/</span>
          <Link
            href={`/category/${primaryCategory}`}
            className="hover:text-foreground capitalize"
          >
            {primaryCategory.replace("-", " ")}
          </Link>
          <span>/</span>
          <span className="text-foreground">{snack.name}</span>
        </nav>

        {/* Hero Image */}
        <div className="relative h-80 w-full overflow-hidden rounded-3xl">
          <Image
            src={snack.imageUrl}
            alt={snack.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            className="object-cover"
            priority
          />
        </div>

        {/* Header */}
        <header className="space-y-4">
          <Badge variant="secondary" className="rounded-full px-3 py-1">
            {snack.brand}
          </Badge>
          <h1 className="text-4xl font-bold text-gray-900">{snack.name}</h1>
          <p className="text-lg text-muted-foreground">{snack.description}</p>
          <div className="flex flex-wrap gap-2">
            {snack.dietTags.map((tag) => (
              <Badge key={tag} variant="outline" className="capitalize">
                {tag.replace("-", " ")}
              </Badge>
            ))}
          </div>
        </header>

        {/* Key Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Protein"
            value={`${snack.proteinPerServing}g`}
            highlight
          />
          <StatCard label="Calories" value={`${snack.caloriesPerServing}`} />
          <StatCard
            label="Price"
            value={`$${snack.pricePerUnit.toFixed(2)}`}
          />
          <StatCard
            label="Protein/$"
            value={`${snack.proteinPerDollar.toFixed(1)}g`}
          />
        </div>

        {/* CTA Button */}
        {snack.buyUrl && (
          <div className="flex justify-center">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href={snack.buyUrl} target="_blank" rel="noopener noreferrer">
                Check current price →
              </Link>
            </Button>
          </div>
        )}

        <Separator className="my-4" />

        {/* Why this is a great high-protein snack */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            Why {snack.name} Is a Great High-Protein Snack
          </h2>
          <Card>
            <CardContent className="pt-6">
              <p className="mb-4 text-muted-foreground leading-relaxed">
                {snack.whyGreat}
              </p>
              <ul className="space-y-3">
                {snack.shortBenefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                      ✓
                    </span>
                    <span className="text-muted-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Nutrition breakdown & ingredients */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            Nutrition Breakdown & Ingredients
          </h2>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                {snack.nutritionBreakdown}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {snack.ingredientsHighlight}
              </p>
            </CardContent>
          </Card>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium">Macros per serving</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <MacroRow label="Protein" value={`${snack.proteinPerServing}g`} />
                <MacroRow label="Calories" value={`${snack.caloriesPerServing}`} />
                <MacroRow label="Carbs" value={`${snack.carbsPerServing}g`} />
                <MacroRow label="Fats" value={`${snack.fatsPerServing}g`} />
                <MacroRow label="Sugar" value={`${snack.sugarPerServing}g`} />
                <MacroRow label="Fiber" value={`${snack.fiberPerServing}g`} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium">Serving details</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <DetailRow label="Serving size" value={snack.servingSize} />
                <DetailRow
                  label="Rating"
                  value={`${snack.rating.toFixed(1)} / 5.0 (${snack.reviewCount} reviews)`}
                />
                <DetailRow
                  label="Price per serving"
                  value={`$${snack.pricePerUnit.toFixed(2)}`}
                />
                <DetailRow
                  label="Protein per dollar"
                  value={`${snack.proteinPerDollar}g/$`}
                />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* When to Enjoy This Snack */}
        {snack.bestFor && snack.bestFor.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              When to Enjoy This Snack
            </h2>
            <Card>
              <CardContent className="pt-6">
                <p className="mb-4 text-sm text-muted-foreground">
                  Perfect occasions and times to eat {snack.name}:
                </p>
                <div className="flex flex-wrap gap-3">
                  {snack.bestFor.map((occasion) => (
                    <Badge key={occasion} variant="secondary" className="text-sm capitalize">
                      {occasion.replace("-", " ")}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* FAQs */}
        {snack.faq && snack.faq.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              Common Questions About {snack.name}
            </h2>
            <div className="space-y-4">
              {snack.faq.map((item, idx) => (
                <Card key={idx}>
                  <CardContent className="pt-6">
                    <h3 className="mb-3 text-lg font-semibold text-gray-900">
                      {item.question}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">{item.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Product Schema JSON-LD */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      {/* FAQ Schema JSON-LD */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {/* Breadcrumb Schema JSON-LD */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  )
}

// Helper components
function StatCard({
  label,
  value,
  highlight = false,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <Card className={highlight ? "border-primary" : ""}>
      <CardContent className="flex flex-col items-center justify-center p-6">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p
          className={`mt-2 text-3xl font-bold ${highlight ? "text-primary" : "text-gray-900"}`}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  )
}

function MacroRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
      <span className="font-medium text-gray-900">{label}</span>
      <span className="text-muted-foreground">{value}</span>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  )
}


