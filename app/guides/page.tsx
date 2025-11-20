import type { Metadata } from "next"
import Link from "next/link"
import { guides } from "@/data/guides"

export const metadata: Metadata = {
  title: "High-Protein Snack Guides | The High Protein Snacks",
  description:
    "Expert guides on choosing the best high-protein snacks for your goals. Compare macros, find deals, and learn how to fuel your fitness journey.",
  openGraph: {
    title: "High-Protein Snack Guides | The High Protein Snacks",
    description:
      "Expert guides on choosing the best high-protein snacks for your goals. Compare macros, find deals, and learn how to fuel your fitness journey.",
    url: "https://thehighproteinsnacks.com/guides",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "High-Protein Snack Guides | The High Protein Snacks",
    description:
      "Expert guides on choosing the best high-protein snacks for your goals. Compare macros, find deals, and learn how to fuel your fitness journey.",
  },
}

export default function GuidesPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-12">
        <h1 className="font-display mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
          High-Protein Snack Guides
        </h1>
        <p className="text-gray-600">
          Expert advice on choosing the best high-protein snacks for your goals, budget, and
          lifestyle.
        </p>
      </div>

      {/* Guides Grid */}
      {guides.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {guides.map((guide) => (
            <Link
              key={guide.slug}
              href={`/guides/${guide.slug}`}
              className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div className="mb-4">
                <span className="inline-block rounded-lg bg-[#006F6D] px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white">
                  Guide
                </span>
              </div>
              <h2 className="mb-3 text-xl font-bold text-gray-900 group-hover:text-[#006F6D]">
                {guide.title}
              </h2>
              <p className="mb-4 flex-1 text-sm leading-relaxed text-gray-600">{guide.description}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">{guide.readingTimeMinutes} min read</span>
                <span className="font-semibold text-[#006F6D] group-hover:underline">Read guide →</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
          <p className="text-gray-600">No guides available yet. Check back soon!</p>
        </div>
      )}
    </main>
  )
}

