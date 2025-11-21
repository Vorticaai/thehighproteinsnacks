// app/guides/[slug]/page.tsx
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { renderMarkdown } from "@/lib/renderMarkdown"

import type { Snack } from "@/data/types"
import { getGuideBySlug, getAllGuideSlugs } from "@/data/guides"
import { snacks } from "@/data/snacks"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"

import { SnackComparisonTable } from "@/components/snacks/SnackComparisonTable"
import { BudgetComparisonTable } from "@/components/snacks/BudgetComparisonTable"
import { getLowSugarSnacks } from "@/lib/getLowSugarSnacks"

interface GuidePageProps {
  params: { slug: string }
}

export async function generateStaticParams() {
  const slugs = getAllGuideSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const guide = getGuideBySlug(params.slug)
  if (!guide) {
    return { title: "Guide Not Found", description: "Guide missing" }
  }

  const fullTitle = `${guide.title} | High-Protein Snack Guide`
  return {
    title: fullTitle,
    description: guide.metaDescription,
  }
}

export default function GuidePage({ params }: GuidePageProps) {
  const guide = getGuideBySlug(params.slug)
  if (!guide) notFound()

  const isBudgetGuide = guide.slug === "best-budget-snacks"
  const isLowSugarGuide = guide.slug === "low-sugar-protein-snacks"

  const recommendedSnacks: Snack[] = guide.recommendedSnackIds
    .map((id) => snacks.find((s) => s.id === id))
    .filter((s): s is Snack => Boolean(s))

  const budgetComparisonSnacks = isBudgetGuide
    ? recommendedSnacks
        .map((snack, index) => {
          const price = snack.pricePerUnit ?? 0
          const ppd = price > 0 ? Number((snack.proteinPerServing / price).toFixed(1)) : 0
          return { snack, pricePerServing: price, proteinPerDollarValue: ppd, originalIndex: index }
        })
        .sort((a, b) => b.proteinPerDollarValue - a.proteinPerDollarValue)
    : []

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Guides", href: "/guides" },
          { label: guide.title },
        ]}
      />

      <header className="mb-8 mt-6">
        <span className="inline-block rounded-full bg-[#C6F221] px-3 py-1 text-xs font-bold text-black">
          Guide
        </span>
        <h1 className="mb-4 text-3xl font-bold">{guide.title}</h1>
        <p className="mb-6 text-gray-600">{guide.description}</p>
      </header>

      <div className="mb-8 rounded-xl border bg-white p-6 shadow-sm">
        {guide.content.introduction}
      </div>

      <div className="mb-8 space-y-8">
        {guide.content.sections.map((section, index) => (
          <section key={index}>
            <h2 className="mb-4 border-b-2 border-[#CCFF00] pb-2 text-2xl font-bold">
              {section.heading}
            </h2>

            {isBudgetGuide && index === 0 ? (
              <BudgetComparisonTable
                title="Best Value Picks"
                snacks={recommendedSnacks}
              />
            ) : isLowSugarGuide && index === 0 ? (
              <SnackComparisonTable
                title="Quick Low-Sugar Comparison"
                snacks={getLowSugarSnacks()}
              />
            ) : (
              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <div
                  className="prose prose-gray max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: renderMarkdown(section.content),
                  }}
                />
              </div>
            )}
          </section>
        ))}
      </div>

      {recommendedSnacks.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-6 border-b-2 border-[#CCFF00] pb-2 text-2xl font-bold">
            Recommended Snacks
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {recommendedSnacks.map((snack) => (
              <Link
                key={snack.id}
                href={`/snack/${snack.id}`}
                className="group rounded-xl border bg-white p-5 shadow-sm hover:shadow-md"
              >
                <h3 className="font-bold">{snack.name}</h3>
                <span className="mt-2 inline-block rounded bg-[#CCFF00] px-2 py-1 text-xs font-bold">
                  {snack.proteinPerServing}g protein
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="h-px bg-gray-200 my-10" />

      <Link href="/guides" className="text-sm font-semibold hover:underline">
        ← Back to all guides
      </Link>
    </main>
  )
}
