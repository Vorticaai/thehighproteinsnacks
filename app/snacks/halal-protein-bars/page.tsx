import type { Metadata } from "next"
import Link from "next/link"
import Breadcrumbs from "@/components/nav/Breadcrumbs"
import { JsonLd } from "@/components/seo/jsonld"
import { HalalEvidenceLinks, HalalStatusLegend, HalalStatusPill, HowToCheckHalal } from "@/components/halal/HalalStatus"
import { HALAL_STATUS_RANK } from "@/lib/halal"
import { readHalalBrandNotes } from "@/lib/halalBrands"
import { getAllProducts } from "@/lib/products"
import { absoluteUrl } from "@/lib/seo"

export const revalidate = 21600

const PATH = "/snacks/halal-protein-bars"
const TITLE = "Halal Protein Bars: Which Ones Are Actually Certified?"
const DESCRIPTION =
  "We checked which protein bars sold in the US are halal-certified, who certifies them, and which popular bars are not. Every claim links to its source."

export const metadata: Metadata = {
  title: "Halal Protein Bars (2026): Which Are Certified in the US?",
  description: DESCRIPTION,
  alternates: { canonical: absoluteUrl(PATH) },
  openGraph: { title: TITLE, description: DESCRIPTION, url: absoluteUrl(PATH), type: "article", images: [{ url: absoluteUrl("/og-default.jpg") }] },
}

export default function HalalProteinBarsPage() {
  const { checkedAt, brands } = readHalalBrandNotes()
  const bars = brands
    .filter((b) => b.type === "bar")
    .sort((a, b) => HALAL_STATUS_RANK[a.halal.status] - HALAL_STATUS_RANK[b.halal.status])
  const withCertification = bars.filter((b) => b.halal.status !== "not-certified")
  const without = bars.filter((b) => b.halal.status === "not-certified")

  const catalogueBars = getAllProducts().filter((p) => p.flags.bars)
  const catalogueHalalBars = catalogueBars.filter((p) => p.flags.halal)

  const certifiedBrandList = withCertification.map((b) => b.brand).join(", ")
  const uncertifiedBrandList = without
    .map((b) => (b.brand === "Barebells" ? "Barebells' US bars" : b.brand))
    .join(", ")

  const faqs = [
    {
      question: "Are Quest, RXBAR, or Barebells protein bars halal in the US?",
      answer: `We can't say either way with confidence. Of the big US brands we checked (${uncertifiedBrandList}), none documents or claims halal certification for the bars sold in the US — but that's different from confirming the ingredients aren't halal. It may mean the product is sold as "halal friendly" without a certificate, or certified only in other countries. Treat these as unconfirmed rather than ruled out, and check with the brand directly if certification matters to you.`,
    },
    {
      question: "Which protein bars are actually halal-certified in the US?",
      answer: certifiedBrandList
        ? `${certifiedBrandList}, sold online rather than on US supermarket shelves. See the table above for who certifies each one.`
        : "None of the bars we've checked so far carry a documented US halal certification. Check back — we update this page as we verify new brands.",
    },
    {
      question: "Why is halal certification for protein bars so hard to find?",
      answer:
        "Many bars use collagen or gelatin, which is only halal if it comes from a halal source, plus flavourings that can carry alcohol. A bar can also be certified in one country and not another, because certificates cover specific factories.",
    },
  ]

  const breadcrumbItems = [
    { name: "Home", href: "/" },
    { name: "Snacks", href: "/snacks" },
    { name: "Halal", href: "/snacks/halal" },
    { name: "Halal protein bars" },
  ]

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: TITLE,
          description: DESCRIPTION,
          dateModified: checkedAt,
          mainEntityOfPage: absoluteUrl(PATH),
          author: { "@type": "Organization", name: "The High Protein Snacks" },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: breadcrumbItems.map((item, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: item.name,
            item: item.href ? absoluteUrl(item.href) : absoluteUrl(PATH),
          })),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: { "@type": "Answer", text: faq.answer },
          })),
        }}
      />

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <Breadcrumbs items={breadcrumbItems} />

        <header className="mb-8 max-w-3xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#006F6D]">Halal guide</p>
          <h1 className="font-display mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">{TITLE}</h1>
          <p className="text-sm text-gray-500">Last checked {checkedAt}</p>
        </header>

        <section className="mb-10 max-w-3xl rounded-2xl border border-[#006F6D]/20 bg-[#006F6D]/5 p-6">
          <h2 className="text-lg font-bold text-gray-900">Short answer</h2>
          <p className="mt-2 text-gray-700">
            Of the bars we checked, the ones that say they are halal-certified are{" "}
            {withCertification.map((b, i) => (
              <span key={b.brand + b.product}>
                {i > 0 && (i === withCertification.length - 1 ? " and " : ", ")}
                {b.brand}
              </span>
            ))}
            , sold online rather than on US supermarket shelves. The big US brands we checked (
            {without.map((b, i) => (
              <span key={b.brand + b.product}>
                {i > 0 && (i === without.length - 1 ? " and " : ", ")}
                {b.brand === "Barebells" ? "Barebells' US bars" : b.brand}
              </span>
            ))}
            ) don&apos;t claim halal certification in the US.
          </p>
        </section>

        <section aria-labelledby="bars-heading" className="mb-12">
          <h2 id="bars-heading" className="mb-3 text-xl font-bold text-gray-900">
            Protein bars and their halal status
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                <tr>
                  <th className="px-4 py-3">Bar</th>
                  <th className="px-4 py-3">Halal status</th>
                  <th className="px-4 py-3">Certifier</th>
                  <th className="px-4 py-3">What we found</th>
                  <th className="px-4 py-3">Sources</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white align-top">
                {bars.map((b) => (
                  <tr key={b.brand + b.product}>
                    <td className="px-4 py-3">
                      <a href={b.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-gray-900 underline-offset-2 hover:underline">
                        {b.brand} {b.product}
                      </a>
                      <div className="mt-1 text-xs text-gray-500">{b.usAvailability}</div>
                      {b.proteinNote && <div className="mt-1 text-xs text-gray-500">{b.proteinNote}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <HalalStatusPill status={b.halal.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-700">{b.halal.certifier ?? "Not named"}</td>
                    <td className="px-4 py-3 text-gray-700">{b.halal.summary}</td>
                    <td className="px-4 py-3">
                      <HalalEvidenceLinks check={b.halal} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-12 max-w-3xl">
          <h2 className="mb-3 text-xl font-bold text-gray-900">Bars in our directory</h2>
          {catalogueHalalBars.length > 0 ? (
            <ul className="list-disc pl-5 text-gray-700">
              {catalogueHalalBars.map((p) => (
                <li key={p.id}>
                  <Link href={`/snacks/${p.id}`} className="underline">
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-700">
              None of the {catalogueBars.length} protein bars in our directory has a halal certification we can document
              yet. If you need certified halal protein, meat snacks are the easier option in the US:{" "}
              <Link href="/snacks/halal" className="underline">
                see halal jerky and meat sticks
              </Link>
              .
            </p>
          )}
        </section>

        <section className="mb-12">
          <h2 className="mb-3 text-xl font-bold text-gray-900">What the halal statuses mean</h2>
          <HalalStatusLegend />
        </section>

        <section className="mb-12 max-w-3xl">
          <h2 className="mb-3 text-xl font-bold text-gray-900">Why protein bars are tricky</h2>
          <p className="text-gray-700">
            Many bars use collagen or gelatin, which is only halal if it comes from a halal source, and flavourings that
            can carry alcohol. The same bar can also be certified in one country and not in another, because certificates
            cover specific factories: Barebells, for example, says its bars sold in Europe and the Middle East are
            certified but does not say the same for the US.
          </p>
        </section>

        <section className="mb-12 max-w-3xl">
          <h2 className="mb-3 text-xl font-bold text-gray-900">How to check a bar yourself</h2>
          <HowToCheckHalal />
        </section>

        <section className="mb-12 max-w-3xl">
          <h2 className="mb-3 text-xl font-bold text-gray-900">Quick answers</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <details key={faq.question} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <summary className="cursor-pointer text-sm font-semibold text-gray-900">{faq.question}</summary>
                <p className="mt-2 text-sm text-gray-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mb-12 max-w-3xl">
          <h2 className="mb-3 text-xl font-bold text-gray-900">Related reading</h2>
          <ul className="list-disc space-y-1 pl-5 text-gray-700">
            <li>
              <Link href="/snacks/halal" className="underline">
                All halal snacks we've checked
              </Link>{" "}
              — certified options tend to be jerky and meat sticks rather than bars; see the full list if certification is a
              requirement for you.
            </li>
            <li>
              <Link href="/compare/quest-bars-vs-rxbars" className="underline">
                Quest Bars vs RXBAR: full comparison
              </Link>{" "}
              — if an uncertified bar is acceptable to you, this compares two of the brands above on macros and price.
            </li>
            <li>
              <Link href="/snacks/protein-bars" className="underline">
                All protein bars in our directory
              </Link>
            </li>
          </ul>
        </section>

        <p className="max-w-3xl text-sm text-gray-500">
          We don&apos;t earn anything from the brand links on this page. Brands: if your bar is halal-certified for the
          US, email the certificate to{" "}
          <a href="mailto:support@thehighproteinsnacks.com" className="underline">
            support@thehighproteinsnacks.com
          </a>
          .
        </p>
      </main>
    </>
  )
}
