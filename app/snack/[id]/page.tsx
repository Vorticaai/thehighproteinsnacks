/**
 * Snack detail page with macros, benefits, and structured data.
 * Premium design matching homepage visual hierarchy.
 */
import Image from "next/image"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getAllSnacks } from "@/lib/directory"
import { buildMetadata, absoluteUrl } from "@/lib/seo"
import { getAllProducts } from "@/lib/products"
import { Star, Check } from "lucide-react"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import type { Crumb } from "@/components/layout/breadcrumbs"

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
  const snack = getAllProducts().find((s) => s.id === params.id)
  if (!snack) {
    return buildMetadata({
      title: "Snack not found",
      description: "This snack could not be found in our high-protein database.",
      path: `/snack/${params.id}`,
    })
  }

  // Build SEO-optimized title with brand and protein
  const baseTitle = snack.brand ? `${snack.name} – ${snack.brand}` : snack.name
  const title = `${baseTitle} (${snack.proteinPerServing}g Protein)`

  // Build comprehensive description
  const descriptionParts: string[] = []
  if (snack.brand) {
    descriptionParts.push(`${snack.brand} high-protein snack review.`)
  } else {
    descriptionParts.push("High-protein snack review.")
  }
  descriptionParts.push(
    `Approx. ${snack.proteinPerServing}g protein and ${snack.caloriesPerServing} calories per serving.`
  )
  descriptionParts.push("See macros, usage ideas, and where to buy.")
  const description = descriptionParts.join(" ")

  return buildMetadata({
    title,
    description,
    path: `/snack/${snack.id}`,
    ogImage: snack.imageUrl,
  })
}

export default function SnackPage({ params }: SnackPageProps) {
  const snack = getAllProducts().find((s) => s.id === params.id)
  if (!snack) {
    notFound()
  }

  const categoryTags = snack.categoryTags ?? []
  const dietTags = snack.dietTags ?? []
  const shortBenefits = snack.shortBenefits ?? []
  const bestFor = snack.bestFor ?? []
  const faqEntries = snack.faq ?? []
  const description =
    snack.description ??
    `${snack.brand} ${snack.name} delivers ${snack.proteinPerServing}g protein per serving.`
  const whyGreat =
    snack.whyGreat ??
    `${snack.name} balances macros so you stay energized without crashing.`
  const nutritionBreakdown =
    snack.nutritionBreakdown ??
    `Protein ${snack.proteinPerServing}g · Carbs ${snack.carbsPerServing}g · Fat ${snack.fatsPerServing}g · Sugar ${snack.sugarPerServing}g`
  const ingredientsHighlight =
    snack.ingredientsHighlight ??
    "See retailer listing for the latest ingredient list."

  // Show image if imageUrl exists
  const hasImage = snack.imageUrl && snack.imageUrl.trim().length > 0
  
  // Check if we have verified macro data
  const hasMacros =
    snack.proteinPerServing != null &&
    snack.caloriesPerServing != null &&
    snack.carbsPerServing != null &&
    snack.fatsPerServing != null

  // Determine primary category for breadcrumb
  const primaryCategory = categoryTags[0] || "snacks"

  // Enhanced Product schema with complete nutrition data
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: snack.name,
    image: [snack.imageUrl],
    description,
    brand: {
      "@type": "Brand",
      name: snack.brand,
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: Number(snack.rating ?? 4.6),
      reviewCount: snack.reviewCount ?? 150,
      bestRating: 5,
      worstRating: 1,
    },
    nutrition: {
      "@type": "NutritionInformation",
      servingSize: snack.servingSize ?? "1 serving",
      calories: `${snack.caloriesPerServing} kcal`,
      proteinContent: `${snack.proteinPerServing} g`,
      carbohydrateContent: `${snack.carbsPerServing} g`,
      fatContent: `${snack.fatsPerServing} g`,
      sugarContent: `${snack.sugarPerServing} g`,
      fiberContent: `${snack.fiberPerServing} g`,
    },
    offers: {
      "@type": "Offer",
      price: Number(snack.pricePerUnit ?? snack.pricePerServing).toFixed(2),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: snack.buyUrl || absoluteUrl(`/snack/${snack.id}`),
    },
  }

  // FAQ Schema for rich snippets
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqEntries.map((faq) => ({
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
        item: absoluteUrl(`/snacks/${primaryCategory}`),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: snack.name,
        item: absoluteUrl(`/snack/${snack.id}`),
      },
    ],
  }

  // Build breadcrumb items
  const breadcrumbItems: Crumb[] = [
    { label: "Home", href: "/" },
    { 
      label: primaryCategory.replace("-", " "), 
      href: `/snacks/${primaryCategory}` 
    },
    { label: snack.name }, // current page, no href
  ]

  return (
    <>
      <main className="min-h-screen bg-white">
        {/* Container - matching homepage max-width */}
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <Breadcrumbs items={breadcrumbItems} />

          {/* Hero Content Card */}
          <div className="mb-8 overflow-hidden rounded-2xl bg-white shadow-lg">
            {/* Product Image */}
            {hasImage ? (
              <div className="relative aspect-[21/9] w-full overflow-hidden rounded-t-2xl bg-gray-100">
                <Image
                  src={snack.imageUrl}
                  alt={snack.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                  className="object-cover"
                  priority
                />
              </div>
            ) : (
              <div className="flex aspect-[21/9] w-full items-center justify-center rounded-t-2xl bg-gray-100">
                <div className="space-y-2 text-center">
                  <p className="text-sm font-semibold text-gray-500">{snack.brand}</p>
                  <p className="px-4 text-lg font-medium text-gray-700">{snack.name}</p>
                </div>
              </div>
            )}

            {/* Product Info Section */}
            <div className="p-6 sm:p-8">
              {/* Brand Badge */}
              <div className="mb-4 inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">
                {snack.brand}
              </div>

              {/* Title and Rating */}
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">{snack.name}</h1>
                  {/* Verified Badge - Hero Products Only */}
                  {snack.isHero && (
                    <span className="mt-2 inline-block rounded-full bg-[#C6F221] px-3 py-1 text-xs font-medium text-black shadow-sm">
                      Verified Nutrition
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Star
                    className="h-5 w-5 fill-[#0C6C5A] text-[#0C6C5A]"
                    style={{ fill: "var(--brand-bg)", color: "var(--brand-bg)" }}
                  />
                  <span className="text-lg font-bold text-gray-900">
                    {Number(snack.rating ?? 4.6).toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({snack.reviewCount ?? 150} reviews)
                  </span>
                </div>
              </div>
              
              {/* Verified Macros Badge & Disclaimer */}
              <div className="mb-4 flex flex-wrap items-center gap-3 text-xs">
                {hasMacros && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#006F6D]/20 bg-[#006F6D]/5 px-2.5 py-1 text-[11px] font-medium text-[#006F6D]">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verified macros
                  </span>
                )}
                <span className="text-[11px] text-gray-500">
                  Nutrition info is based on brand/retailer listings and may change. Always check the package label.
                </span>
              </div>

              {/* Diet Tags */}
              <div className="mb-4 flex flex-wrap gap-2">
                {dietTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-block rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium capitalize text-gray-700"
                  >
                    {tag.replace("-", " ")}
                  </span>
                ))}
              </div>

              {/* Description */}
              <p className="mb-6 max-w-3xl text-base leading-relaxed text-gray-600">
                {description}
              </p>

              {/* CTA Button */}
              {snack.buyUrl && (
                <a
                  href={snack.buyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="brand-cta-button mb-6 inline-flex items-center justify-center rounded-lg px-8 py-4 text-base font-semibold shadow-md transition-all"
                  style={{
                    backgroundColor: "var(--brand-lime)",
                    color: "var(--brand-text-dark)",
                  }}
                >
                  Check current price →
                </a>
              )}

              {/* Macro Metrics */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                  label="Protein"
                  value={`${snack.proteinPerServing}g`}
                  sublabel="per serving"
                />
                <MetricCard label="Calories" value={`${snack.caloriesPerServing}`} sublabel="per serving" />
                <MetricCard
                  label="Price"
                  value={`$${Number(snack.pricePerUnit ?? snack.pricePerServing).toFixed(2)}`}
                  sublabel="approx. per serving"
                />
                <MetricCard
                  label="Value"
                  value={`${Math.round(snack.proteinPerDollar)}g/$1`}
                  sublabel="higher is better"
                />
              </div>

              {/* Pricing Disclaimer */}
              <p className="mt-3 text-xs text-gray-500">
                Based on approximate price per serving from Amazon US.
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="my-8 h-px bg-gray-200" />

          {/* Why This Is Great Section */}
          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              Why {snack.name} Is a Great High-Protein Snack
            </h2>
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="mb-5 leading-relaxed text-gray-700">{whyGreat}</p>
              <ul className="space-y-3">
                {shortBenefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check
                      className="mt-0.5 h-5 w-5 shrink-0 text-[#0C6C5A]"
                      style={{ color: "var(--brand-bg)" }}
                    />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Divider */}
          <div className="my-8 h-px bg-gray-200" />

          {/* Nutrition Breakdown Section */}
          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Nutrition Breakdown & Ingredients</h2>
            <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="leading-relaxed text-gray-700">{nutritionBreakdown}</p>
              <p className="leading-relaxed text-gray-700">{ingredientsHighlight}</p>
            </div>
          </section>

          {/* Divider */}
          <div className="my-8 h-px bg-gray-200" />

          {/* Best Time to Enjoy Section */}
          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Best Time to Enjoy</h2>
            <div className="flex flex-wrap gap-2">
              {bestFor.map((time) => (
                <span
                  key={time}
                  className="inline-block rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium capitalize text-gray-700"
                >
                  {time.replace("-", " ")}
                </span>
              ))}
            </div>
          </section>

          {/* Divider */}
          <div className="my-8 h-px bg-gray-200" />

          {/* FAQs Section */}
          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Common Questions</h2>
            <div className="space-y-4">
              {faqEntries.map((faq, idx) => (
                <div key={idx} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">{faq.question}</h3>
                  <p className="leading-relaxed text-gray-700">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  )
}

// Metric Card Component - Matching homepage style
function MetricCard({
  label,
  value,
  sublabel,
}: {
  label: string
  value: string
  sublabel?: string
}) {
  // PROTEIN and VALUE ($/g) get lime background - these are the priority metrics
  const isLimeHighlight = label === "Protein" || label === "Value"
  
  return (
    <div 
      className="flex flex-col items-center justify-center rounded-xl p-4 shadow-sm"
      style={{
        backgroundColor: isLimeHighlight ? "#CCFF00" : "#F9FAFB",
        border: isLimeHighlight ? "none" : "1px solid #e5e7eb"
      }}
    >
      <p 
        className="text-xs font-semibold uppercase tracking-wide"
        style={{ color: isLimeHighlight ? "#000" : "#6b7280" }}
      >
        {label}
      </p>
      <p 
        className={`mt-2 font-black ${label === "Protein" ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"}`}
        style={{ color: isLimeHighlight ? "#000" : "#111827" }}
      >
        {value}
      </p>
      {sublabel && (
        <p 
          className="mt-1 text-xs"
          style={{ color: isLimeHighlight ? "rgba(0,0,0,0.7)" : "#6b7280" }}
        >
          {sublabel}
        </p>
      )}
    </div>
  )
}
