import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import Breadcrumbs from "@/components/nav/Breadcrumbs";
import { guides } from "@/data/guides";
import { absoluteUrl } from "@/lib/seo";

const PAGE_URL = "https://thehighproteinsnacks.com/guides";

export const revalidate = 60 * 60 * 6;

export const metadata: Metadata = {
  title: "Expert High-Protein Snack Guides",
  description:
    "Read nutritionist-backed buying guides for low-sugar, keto, vegan, budget, and weight-loss snacks.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Expert High-Protein Snack Guides",
    description:
      "Read nutritionist-backed buying guides for low-sugar, keto, vegan, budget, and weight-loss snacks.",
    url: PAGE_URL,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Expert High-Protein Snack Guides",
    description:
      "Read nutritionist-backed buying guides for low-sugar, keto, vegan, budget, and weight-loss snacks.",
  },
};

const featuredCategoryLinks = [
  { label: "Weight Loss Snacks", href: "/snacks/weight-loss" },
  { label: "Low-Sugar Snacks", href: "/snacks/low-sugar" },
  { label: "Best Value Picks", href: "/snacks/best-value" },
  { label: "Vegan Snacks", href: "/snacks/vegan" },
];

export default function GuidesPage() {
  const breadcrumbItems = [
    { name: "Home", href: "/" },
    { name: "Guides" },
  ];

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.href ? absoluteUrl(item.href) : PAGE_URL,
    })),
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "High-Protein Snack Guides",
    itemListElement: guides.map((guide, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: guide.title,
      url: absoluteUrl(`/guides/${guide.slug}`),
    })),
  };

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Expert Buying Guides",
    description:
      "Expert-written guides that compare protein snacks by diet needs, sugar, price, and macros.",
    url: PAGE_URL,
  };

  return (
    <>
      <Script
        id="guides-breadcrumbs"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Script
        id="guides-itemlist"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <Script
        id="guides-webpage"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <Breadcrumbs items={breadcrumbItems} />
        <header className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C6FF47]">
            EXPERT INSIGHTS
          </p>
          <h1 className="font-display mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
            Expert Buying Guides
          </h1>
          <p className="text-gray-600">
            Shortcut your research with nutritionist-written breakdowns of the
            best snacks for every diet goal. Every pick is sourced from our CSV
            database so macros stay honest.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {featuredCategoryLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex items-center rounded-full border border-[#C6FF47] px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-gray-900 transition hover:bg-[#C6FF47]/10"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </header>

        {guides.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {guides.map((guide) => (
              <Link
                key={guide.slug}
                href={`/guides/${guide.slug}`}
                className="group flex h-full flex-col rounded-2xl border-2 border-[#C6FF47] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg hover:ring-2 hover:ring-[#C6FF47]"
              >
                <div className="mb-4 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <span>{guide.readingTimeMinutes} min read</span>
                  <span>{guide.recommendedSnackIds.length} products</span>
                </div>
                <h2 className="mb-3 text-xl font-bold text-gray-900">
                  {guide.title}
                </h2>
                <p className="mb-4 flex-1 text-sm leading-relaxed text-gray-600">
                  {guide.description}
                </p>
                <span className="inline-flex items-center font-semibold text-[#0B1F1E]">
                  Read guide →
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <p className="text-gray-600">
              No guides available yet. Check back soon!
            </p>
          </div>
        )}
      </main>
    </>
  );
}