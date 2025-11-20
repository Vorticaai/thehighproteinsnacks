import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { getGuideBySlug, getAllGuideSlugs } from "@/data/guides"
import { snacks } from "@/data/snacks"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"

interface GuidePageProps {
  params: {
    slug: string
  }
}

export async function generateStaticParams() {
  const slugs = getAllGuideSlugs()
  return slugs.map((slug) => ({
    slug,
  }))
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const guide = getGuideBySlug(params.slug)

  if (!guide) {
    return {
      title: "Guide Not Found",
      description: "The requested guide could not be found.",
    }
  }

  return {
    title: `${guide.title} | High-Protein Snack Guide`,
    description: guide.metaDescription,
    keywords: guide.keywords,
    openGraph: {
      title: `${guide.title} | High-Protein Snack Guide`,
      description: guide.metaDescription,
      url: `https://thehighproteinsnacks.com/guides/${guide.slug}`,
      type: "article",
      publishedTime: guide.publishedDate,
      modifiedTime: guide.updatedDate,
      authors: [guide.author],
    },
    twitter: {
      card: "summary_large_image",
      title: `${guide.title} | High-Protein Snack Guide`,
      description: guide.metaDescription,
    },
  }
}

export default function GuidePage({ params }: GuidePageProps) {
  const guide = getGuideBySlug(params.slug)

  if (!guide) {
    notFound()
  }

  // Get recommended snacks
  const recommendedSnacks = guide.recommendedSnackIds
    .map((id) => snacks.find((s) => s.id === id))
    .filter(Boolean)

  // BreadcrumbList Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://thehighproteinsnacks.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Guides",
        item: "https://thehighproteinsnacks.com/guides",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: guide.title,
        item: `https://thehighproteinsnacks.com/guides/${guide.slug}`,
      },
    ],
  }

  // FAQPage Schema
  const faqSchema = guide.faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: guide.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  } : null

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <Breadcrumbs items={[
          { label: "Home", href: "/" },
          { label: "Guides", href: "/guides" },
          { label: guide.title }
        ]} />

        {/* Header */}
        <header className="mb-8 mt-6">
          <div className="mb-3">
            <span className="inline-block rounded-full bg-[#C6F221] px-3 py-1 text-xs font-bold uppercase tracking-wide text-black shadow-sm">
              Guide
            </span>
          </div>
          <h1 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
            {guide.title}
          </h1>
          <p className="mb-6 text-base leading-relaxed text-gray-600">{guide.description}</p>
          <div className="flex flex-wrap gap-3 text-xs text-gray-500">
            <span>By {guide.author}</span>
            <span>•</span>
            <span>{guide.readingTimeMinutes} min read</span>
            <span>•</span>
            <time dateTime={guide.updatedDate}>
              Updated {new Date(guide.updatedDate).toLocaleDateString()}
            </time>
          </div>
        </header>

        {/* Introduction */}
        <div className="mb-8">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-base leading-relaxed text-gray-700">{guide.content.introduction}</p>
          </div>
        </div>

        {/* Content Sections */}
        <div className="mb-8 space-y-8">
          {guide.content.sections.map((section, index) => (
            <section key={index}>
              <h2 className="mb-4 border-b-2 border-[#CCFF00] pb-2 text-2xl font-bold text-gray-900">{section.heading}</h2>
              {section.subheading && (
                <h3 className="mb-3 text-lg font-semibold text-gray-700">{section.subheading}</h3>
              )}
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <p className="leading-relaxed text-gray-700">{section.content}</p>
              </div>
            </section>
          ))}
        </div>

        {/* Recommended Snacks */}
        {recommendedSnacks.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-6 border-b-2 border-[#CCFF00] pb-2 text-2xl font-bold text-gray-900">Recommended Snacks</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {recommendedSnacks.map((snack) => (
                <Link
                  key={snack.id}
                  href={`/snack/${snack.id}`}
                  className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md"
                >
                  <h3 className="mb-2 text-base font-bold text-gray-900">
                    {snack.name}
                  </h3>
                  <div className="mb-4 flex gap-3 text-sm text-gray-600">
                    <span className="rounded-lg bg-[#CCFF00] px-2 py-1 text-xs font-bold text-black">{snack.proteinPerServing}g protein</span>
                    <span className="rounded-lg bg-gray-50 px-2 py-1 text-xs font-semibold text-gray-700">{snack.caloriesPerServing} cal</span>
                  </div>
                  <span className="mt-auto text-sm font-semibold text-[#006F6D] group-hover:underline">
                    View details →
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* FAQs */}
        {guide.faqs.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-6 border-b-2 border-[#CCFF00] pb-2 text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {guide.faqs.map((faq, index) => (
                <div key={index} className="rounded-xl border-l-4 border-l-gray-200 bg-gray-50 p-6 shadow-sm hover:border-l-[#CCFF00] transition-colors">
                  <h3 className="mb-3 text-lg font-semibold text-gray-900">{faq.question}</h3>
                  <p className="leading-relaxed text-gray-700">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Back to Guides */}
        <div className="my-8 h-px bg-gray-200" />
        <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/guides"
            className="inline-flex items-center text-sm font-semibold text-gray-600 hover:text-gray-900"
          >
            ← Back to all guides
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-[#CCFF00] px-6 py-3 text-sm font-bold text-black transition-colors hover:bg-[#A3CC00]"
          >
            Browse all snacks
          </Link>
        </div>
      </main>
    </>
  )
}

