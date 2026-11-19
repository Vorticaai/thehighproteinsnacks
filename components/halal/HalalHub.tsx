import Link from "next/link"
import Breadcrumbs from "@/components/nav/Breadcrumbs"
import ProductCard from "@/components/snacks/ProductCard"
import { VerifiedPill } from "@/components/snacks/VerificationNote"
import { JsonLd } from "@/components/seo/jsonld"
import { HALAL_STATUS_RANK } from "@/lib/halal"
import { getAllProducts, type Product } from "@/lib/products"
import { absoluteUrl } from "@/lib/seo"
import { HalalEvidenceLinks, HalalStatusLegend, HalalStatusPill, HowToCheckHalal } from "./HalalStatus"

const byEvidenceThenProtein = (a: Product, b: Product) =>
  HALAL_STATUS_RANK[a.halal!.status] - HALAL_STATUS_RANK[b.halal!.status] ||
  b.proteinPerServing - a.proteinPerServing

/** /snacks/halal: halal snacks with who certifies them and how sure we are. */
export default function HalalHub({ title, description }: { title: string; description: string }) {
  const researched = getAllProducts().filter((p) => p.halal)
  const listed = researched.filter((p) => p.flags.halal).sort(byEvidenceThenProtein)
  const notCertified = researched.filter((p) => !p.flags.halal)
  const lastChecked = researched.map((p) => p.halal!.checkedAt).sort().at(-1)

  const breadcrumbItems = [{ name: "Home", href: "/" }, { name: "Snacks", href: "/snacks" }, { name: title }]

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: title,
          itemListElement: listed.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: p.name,
            url: absoluteUrl(`/snacks/${p.id}`),
          })),
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
            item: item.href ? absoluteUrl(item.href) : absoluteUrl("/snacks/halal"),
          })),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: title,
          description,
          url: absoluteUrl("/snacks/halal"),
          dateModified: lastChecked,
        }}
      />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <Breadcrumbs items={breadcrumbItems} />

        <header className="mb-8 max-w-3xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#006F6D]">Snack Directory</p>
          <h1 className="font-display mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">{title}</h1>
          <p className="text-lg text-gray-600">
            We list a snack as halal only when we can show who certifies it, or at least that the brand sells it as
            halal. &ldquo;Halal friendly&rdquo; on its own doesn&apos;t count. Every row links to the source we used.
          </p>
          {lastChecked && <p className="mt-2 text-sm text-gray-500">Certifications last checked {lastChecked}.</p>}
        </header>

        <section aria-labelledby="table-heading" className="mb-12">
          <h2 id="table-heading" className="mb-3 text-xl font-bold text-gray-900">
            Halal protein snacks compared
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                <tr>
                  <th className="px-4 py-3">Snack</th>
                  <th className="px-4 py-3">Halal status</th>
                  <th className="px-4 py-3">Certifier</th>
                  <th className="px-4 py-3 text-right">Protein</th>
                  <th className="px-4 py-3 text-right">Calories</th>
                  <th className="px-4 py-3 text-right">Sugar</th>
                  <th className="px-4 py-3">Sources</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {listed.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3">
                      <Link href={`/snacks/${p.id}`} className="font-semibold text-gray-900 underline-offset-2 hover:underline">
                        {p.name}
                      </Link>
                      <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                        {p.brand}
                        <VerifiedPill product={p} />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <HalalStatusPill status={p.halal!.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-700">{p.halal!.certifier ?? "Not named"}</td>
                    <td className="px-4 py-3 text-right font-semibold">{p.proteinPerServing}g</td>
                    <td className="px-4 py-3 text-right">{p.caloriesPerServing}</td>
                    <td className="px-4 py-3 text-right">{p.sugarPerServing}g</td>
                    <td className="px-4 py-3">
                      <HalalEvidenceLinks check={p.halal!} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Per serving. Products without the &ldquo;Label-checked&rdquo; mark still show our original numbers; we are
            checking them against manufacturer label data.
          </p>
        </section>

        <section aria-labelledby="legend-heading" className="mb-12">
          <h2 id="legend-heading" className="mb-3 text-xl font-bold text-gray-900">
            What the halal statuses mean
          </h2>
          <HalalStatusLegend />
        </section>

        {listed.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-4 text-xl font-bold text-gray-900">The snacks</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {listed.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        {notCertified.length > 0 && (
          <section aria-labelledby="not-certified-heading" className="mb-12 rounded-2xl border border-gray-200 bg-gray-50 p-6">
            <h2 id="not-certified-heading" className="text-xl font-bold text-gray-900">
              Sold as &ldquo;halal friendly&rdquo;, but not halal-certified
            </h2>
            <p className="mt-2 max-w-3xl text-gray-600">
              These came up in halal searches and used to be on this page. We found a kosher certificate but no halal
              certificate, so we no longer list them as halal. Whether kosher meat is acceptable is a question for your
              own scholar, not a certification.
            </p>
            <ul className="mt-4 space-y-3">
              {notCertified.map((p) => (
                <li key={p.id} className="text-sm text-gray-700">
                  <Link href={`/snacks/${p.id}`} className="font-semibold underline">
                    {p.name}
                  </Link>{" "}
                  &mdash; {p.halal!.summary} <HalalEvidenceLinks check={p.halal!} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mb-12 grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="mb-3 text-xl font-bold text-gray-900">How to check a halal snack yourself</h2>
            <HowToCheckHalal />
          </div>
          <div className="rounded-2xl border border-[#006F6D]/20 bg-[#006F6D]/5 p-6">
            <h2 className="text-xl font-bold text-gray-900">Looking for halal protein bars?</h2>
            <p className="mt-2 text-gray-700">
              Halal-certified protein bars are harder to find in the US than jerky. We checked the big brands and the
              imports that do carry certification.
            </p>
            <Link
              href="/snacks/halal-protein-bars"
              className="mt-4 inline-flex rounded-full bg-[#006F6D] px-4 py-2 text-sm font-semibold text-white"
            >
              Halal protein bars: what&apos;s certified
            </Link>
          </div>
        </section>

        <p className="max-w-3xl text-sm text-gray-500">
          Brands: if your snack is halal-certified and we&apos;ve missed it or got it wrong, email the certificate to{" "}
          <a href="mailto:support@thehighproteinsnacks.com" className="underline">
            support@thehighproteinsnacks.com
          </a>{" "}
          and we&apos;ll update the page. See <Link href="/how-we-review" className="underline">how we review</Link>.
        </p>
      </main>
    </>
  )
}
