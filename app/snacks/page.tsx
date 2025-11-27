import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import Breadcrumbs from "@/components/nav/Breadcrumbs";
import { getAllProducts, type Product } from "@/lib/products";
import { weightLossFilter } from "@/lib/categoryFilters";
import { absoluteUrl } from "@/lib/seo";
import { categoryFilters } from "@/lib/categoryFilters";
import { AdSlot } from "@/components/ads/AdSlot";

export const revalidate = 60 * 60 * 6; // 21600 seconds

const PAGE_URL = "https://thehighproteinsnacks.com/snacks";

const heroCopy = {
  title: "Snack Categories Built for Real Goals",
  description:
    "Filter every product in the directory by sugar, calories, diet tags, and price-per-protein. Pick a category to jump straight into the snacks that match your priorities.",
};

type CategoryCard = {
  title: string;
  description: string;
  slug: string;
  highlight?: boolean;
  filter: (product: Product) => boolean;
};

const categoryCards: CategoryCard[] = [
  {
    title: "Best Value",
    description: "Ranked by protein-per-dollar so you never overpay.",
    slug: "best-value",
    filter: categoryFilters["best-value"],
    highlight: true,
  },
  {
    title: "Low Sugar",
    description: "≤2g sugar for stable energy and blood-sugar control.",
    slug: "low-sugar",
    filter: categoryFilters["low-sugar"],
  },
  {
    title: "Weight Loss",
    description: "Under 200 calories with 5g+ protein.",
    slug: "weight-loss",
    filter: categoryFilters["weight-loss"],
  },
  {
    title: "Keto Friendly",
    description: "Low net carbs — under 10g net carbs.",
    slug: "keto",
    filter: categoryFilters["keto"],
  },
  {
    title: "Plant-Based",
    description: "Vegan and plant-powered protein picks.",
    slug: "vegan",
    filter: categoryFilters["vegan"],
  },
  {
    title: "Gluten-Free",
    description: "Snacks suitable for gluten-sensitive diets.",
    slug: "gluten-free",
    filter: categoryFilters["gluten-free"] ?? (() => false),
  },

  // ⭐ NEW: HALAL CATEGORY
  {
    title: "Halal",
    description: "Certified Halal high-protein snacks.",
    slug: "halal",
    filter: categoryFilters["halal"],
  },
];

export const metadata: Metadata = {
  title: "Browse High-Protein Snack Categories",
  description:
    "Explore low-sugar, weight-loss, keto, vegan, and best-value protein snack lists—each curated from real nutrition data.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Browse High-Protein Snack Categories",
    description:
      "Explore low-sugar, weight-loss, keto, vegan, and best-value protein snack lists—each curated from real nutrition data.",
    url: PAGE_URL,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Browse High-Protein Snack Categories",
    description:
      "Explore low-sugar, weight-loss, keto, vegan, and best-value protein snack lists—each curated from real nutrition data.",
  },
};

export default function SnacksIndexPage() {
  const products = getAllProducts();
  const cardsWithCounts = categoryCards.map((card) => ({
    ...card,
    count: products.filter(card.filter).length,
  }));

  const breadcrumbItems = [
    { name: "Home", href: "/" },
    { name: "Snacks" },
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

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Snack Categories",
    description: heroCopy.description,
    url: PAGE_URL,
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <Breadcrumbs items={breadcrumbItems} />

      <header className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C6FF47]">
          THE DIRECTORY
        </p>
        <h1 className="mt-3 text-3xl font-black text-gray-900 sm:text-4xl">
          {heroCopy.title}
        </h1>
        <p className="mt-4 max-w-3xl text-lg text-gray-600">
          {heroCopy.description}
        </p>
      </header>

      <AdSlot slot="REPLACE_WITH_SNACKS_SLOT_ID" className="my-8" />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cardsWithCounts.map((card) => (
          <Link
            key={card.slug}
            href={`/snacks/${card.slug}`}
            className={`rounded-2xl border-2 border-[#C6FF47] bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:ring-2 hover:ring-[#C6FF47] ${
              card.highlight ? "lg:col-span-2" : ""
            }`}
          >
            <p className="text-sm font-semibold uppercase tracking-wide text-[#006F6D]">
              {card.count} snacks
            </p>
            <h2 className="mt-2 text-2xl font-bold text-gray-900">
              {card.title}
            </h2>
            <p className="mt-2 text-sm text-gray-600">{card.description}</p>
            <span className="mt-6 inline-flex items-center font-semibold text-[#0B1F1E]">
              View category →
            </span>
          </Link>
        ))}
      </div>

      <Script
        id="snacks-breadcrumb-jsonld"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Script
        id="snacks-page-jsonld"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
    </main>
  );
}

