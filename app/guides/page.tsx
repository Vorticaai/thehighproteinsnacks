import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import Breadcrumbs from "@/components/nav/Breadcrumbs";
import { guides } from "@/data/guides";
import { absoluteUrl } from "@/lib/seo";
const PAGE_URL = `https://www.thehighproteinsnacks.com/guides`;


export const metadata: Metadata = {
  title: "High-Protein Snack Buying Guides",
  description:
    "Buying guides for low-sugar, keto, vegan, budget and lower-calorie high-protein snacks, built from our product data.",
  alternates: {
    canonical: `https://www.thehighproteinsnacks.com/guides`,
  },
  openGraph: {
    title: "High-Protein Snack Buying Guides",
    description:
      "Buying guides for low-sugar, keto, vegan, budget and lower-calorie high-protein snacks, built from our product data.",
    url: `https://www.thehighproteinsnacks.com/guides`,
    type: "website",
    images: [
      {
        url: `https://www.thehighproteinsnacks.com/og-default.jpg`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "High-Protein Snack Buying Guides",
    description:
      "Buying guides for low-sugar, keto, vegan, budget and lower-calorie high-protein snacks, built from our product data.",
    images: [`https://www.thehighproteinsnacks.com/og-default.jpg`],
  },
};


const featuredCategoryLinks = [
  { label: "Weight Loss Snacks", href: "/snacks/weight-loss" },
  { label: "Low-Sugar Snacks", href: "/snacks/low-sugar" },
  { label: "Best Value Picks", href: "/snacks/best-value" },
  { label: "Vegan Snacks", href: "/snacks/vegan" },
];

// Two data/guides.ts slugs now permanently redirect to the standalone
// "best-high-protein-snacks-for-*" pages (see next.config.mjs) — link
// straight to the real destination instead of through the redirect.
const REDIRECTED_GUIDE_HREFS: Record<string, string> = {
  "best-high-protein-snacks-for-weight-loss": "/best-high-protein-snacks-for-weight-loss",
  "best-keto-snacks": "/best-high-protein-snacks-for-keto",
};

function guideHref(slug: string) {
  return REDIRECTED_GUIDE_HREFS[slug] ?? `/guides/${slug}`;
}

// Standalone guide pages that have no data/guides.ts entry at all. Without
// this, these had no internal link from anywhere on the site.
const situationalGuides = [
  {
    href: "/best-high-protein-snacks-for-road-trips",
    title: "Best High-Protein Snacks for Road Trips",
    description:
      "Shelf-stable, mess-free picks that survive a hot glovebox and a long drive.",
  },
  {
    href: "/best-high-protein-snacks-for-office-and-desk",
    title: "Best High-Protein Snacks for the Office & Desk",
    description:
      "Quiet, no-fridge-needed snacks that won't leave your keyboard sticky.",
  },
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
    itemListElement: [
      ...guides.map((guide) => ({
        name: guide.title,
        url: absoluteUrl(guideHref(guide.slug)),
      })),
      ...situationalGuides.map((guide) => ({
        name: guide.title,
        url: absoluteUrl(guide.href),
      })),
    ].map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: item.url,
    })),
  };

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Buying Guides",
    description:
      "Guides that compare protein snacks by diet needs, sugar, price and macros.",
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
            Buying Guides
          </h1>
          <p className="text-gray-600">
            Shortcut your research with data-driven breakdowns of the
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
                href={guideHref(guide.slug)}
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

        <div className="mt-12">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">
            Guides by Situation
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {situationalGuides.map((guide) => (
              <Link
                key={guide.href}
                href={guide.href}
                className="group flex h-full flex-col rounded-2xl border-2 border-[#C6FF47] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg hover:ring-2 hover:ring-[#C6FF47]"
              >
                <h3 className="mb-3 text-xl font-bold text-gray-900">
                  {guide.title}
                </h3>
                <p className="mb-4 flex-1 text-sm leading-relaxed text-gray-600">
                  {guide.description}
                </p>
                <span className="inline-flex items-center font-semibold text-[#0B1F1E]">
                  Read guide →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}