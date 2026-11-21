import type { Metadata } from "next"
import Link from "next/link"
import Breadcrumbs from "@/components/nav/Breadcrumbs"
import ValueIndexTable from "@/components/snacks/ValueIndexTable"
import { JsonLd } from "@/components/seo/jsonld"
import { getAllProducts } from "@/lib/products"
import { buildValueIndex, computeValueIndexStats } from "@/lib/proteinValueIndex"
import { absoluteUrl, buildMetadata } from "@/lib/seo"
import { guideHref } from "@/lib/guides"

export const revalidate = 60 * 60 * 6

const PATH = "/protein-value-index"
const TITLE = "Protein Value Index"
const DESCRIPTION =
  "Every high-protein snack we track, ranked by grams of protein per dollar. An original, regularly-recalculated data comparison — not a buying guide."

export const metadata: Metadata = buildMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
})

function StatTile({
  label,
  value,
  detail,
  href,
}: {
  label: string
  value: string
  detail?: string
  href?: string
}) {
  const body = (
    <div className="h-full rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <p className="text-xs font-bold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-gray-900">{value}</p>
      {detail ? <p className="mt-1 text-sm text-gray-600">{detail}</p> : null}
      {href ? <p className="mt-3 text-sm font-semibold text-[#006F6D]">View snack →</p> : null}
    </div>
  )
  return href ? (
    <Link href={href} className="block h-full">
      {body}
    </Link>
  ) : (
    body
  )
}

export default function ProteinValueIndexPage() {
  const products = getAllProducts()
  const entries = buildValueIndex(products)
  const stats = computeValueIndexStats(entries)
  const today = new Date()
  const updatedLabel = today.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const breadcrumbItems = [{ name: "Home", href: "/" }, { name: TITLE }]

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.href ? absoluteUrl(item.href) : absoluteUrl(PATH),
    })),
  }

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: TITLE,
    description: DESCRIPTION,
    url: absoluteUrl(PATH),
  }

  const datasetJsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Protein Value Index — grams of protein per dollar by product",
    description: DESCRIPTION,
    url: absoluteUrl(PATH),
    license: absoluteUrl("/how-we-review"),
    creator: { "@type": "Organization", name: "The High Protein Snacks", url: absoluteUrl("/") },
    dateModified: today.toISOString().slice(0, 10),
    variableMeasured: ["Protein per serving (g)", "Price per serving (USD)", "Protein per dollar (g)"],
  }

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={webPageJsonLd} />
      <JsonLd data={datasetJsonLd} />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <Breadcrumbs items={breadcrumbItems} />

        <header className="mb-8 max-w-3xl">
          <span className="inline-block rounded-full bg-[#C6FF47] px-3 py-1 text-xs font-bold text-black">
            Original data
          </span>
          <h1 className="mb-4 mt-4 text-3xl font-black text-gray-900 sm:text-4xl">{TITLE}</h1>
          <p className="text-lg text-gray-600">{DESCRIPTION}</p>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <span>Recalculated {updatedLabel}</span>
            <span>{stats.count} priced snacks</span>
            <span>{stats.verifiedCount} label-checked</span>
          </div>
        </header>

        <div className="mb-10 rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-900">Methodology</h2>
          <p className="text-sm leading-relaxed text-gray-700">
            Protein per dollar is grams of protein per serving divided by price per serving, computed
            the same way across every product — no brand pays for a better rank. Prices are estimates
            recorded when each product was priced and can be out of date; nutrition values are either
            checked against manufacturer label data (marked &ldquo;Label-checked&rdquo; below) or from
            our original research pending that check. Only products with a recorded price are ranked.
            Full detail on sourcing and verification is on our{" "}
            <Link href="/how-we-review" className="font-semibold text-[#006F6D] hover:underline">
              Data Accuracy &amp; Methodology
            </Link>{" "}
            page.
          </p>
        </div>

        {stats.count > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 text-xl font-bold text-gray-900">The numbers</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.best && (
                <StatTile
                  label="Best value overall"
                  value={`${stats.best.proteinPerDollar.toFixed(1)}g / $`}
                  detail={stats.best.name}
                  href={`/snacks/${stats.best.id}`}
                />
              )}
              {stats.spreadMultiple && (
                <StatTile
                  label="Value spread"
                  value={`${stats.spreadMultiple}×`}
                  detail="More protein per dollar, best vs. priciest"
                />
              )}
              <StatTile
                label="Median value"
                value={`${stats.median.toFixed(1)}g / $`}
                detail="Across every priced snack we track"
              />
              <StatTile
                label="Average value"
                value={`${stats.average.toFixed(1)}g / $`}
                detail="Mean protein per dollar"
              />
              {stats.bestBar && (
                <StatTile
                  label="Best value bar"
                  value={`${stats.bestBar.proteinPerDollar.toFixed(1)}g / $`}
                  detail={stats.bestBar.name}
                  href={`/snacks/${stats.bestBar.id}`}
                />
              )}
              {stats.bestChips && (
                <StatTile
                  label="Best value chips"
                  value={`${stats.bestChips.proteinPerDollar.toFixed(1)}g / $`}
                  detail={stats.bestChips.name}
                  href={`/snacks/${stats.bestChips.id}`}
                />
              )}
              {stats.priciest && (
                <StatTile
                  label="Priciest per gram of protein"
                  value={`${stats.priciest.proteinPerDollar.toFixed(1)}g / $`}
                  detail={stats.priciest.name}
                  href={`/snacks/${stats.priciest.id}`}
                />
              )}
            </div>
          </section>
        )}

        <section className="mb-10">
          <h2 className="mb-4 text-xl font-bold text-gray-900">Full ranking</h2>
          {entries.length > 0 ? (
            <ValueIndexTable entries={entries} />
          ) : (
            <p className="text-gray-600">No priced snacks yet. Check back soon.</p>
          )}
        </section>

        <div className="mb-10 rounded-xl border border-[#C6FF47]/60 bg-[#C6FF47]/10 p-6">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-900">
            Citing or linking to this page
          </h2>
          <p className="text-sm text-gray-700">
            This index is free to cite or link to. A simple attribution: &ldquo;Data via{" "}
            <Link href={PATH} className="font-semibold text-[#006F6D] hover:underline">
              The High Protein Snacks&apos; Protein Value Index
            </Link>
            &rdquo; linking to{" "}
            <span className="font-mono text-xs">{absoluteUrl(PATH)}</span>.
          </p>
        </div>

        <div className="flex flex-wrap gap-4 text-sm font-semibold">
          <Link href="/snacks/best-value" className="text-[#006F6D] hover:underline">
            Browse &amp; filter the Best Value category →
          </Link>
          <Link href={guideHref("best-budget-snacks")} className="text-[#006F6D] hover:underline">
            Read the budget snacks buying guide →
          </Link>
        </div>
      </main>
    </>
  )
}
