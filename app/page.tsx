// app/page.tsx
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getAllProducts, type Product } from "@/lib/products";
import { categoryFilters, weightLossFilter } from "@/lib/categoryFilters";
import ComparisonsRow from "@/components/sections/ComparisonsRow";
import GuidesRow from "@/components/sections/GuidesRow";
import ProductRow from "@/components/sections/ProductRow";
import ExploreCategoryRow from "@/components/sections/ExploreCategoryRow";
import TopRankingsToday from "@/components/sections/TopRankingsToday";
import WeightLossTop3 from "@/components/sections/WeightLossTop3";
import { uniqueByBrand } from "@/lib/utils/uniqueByBrand";
import { JsonLd } from "@/components/seo/jsonld";
import { AdSlot } from "@/components/ads/AdSlot";
import { absoluteUrl } from "@/lib/seo";





// --- BRAND COLORS (centralized) ---
// Hero now lives on the photo itself; headline/CTA colors come from the
// --brand-* CSS variables in app/globals.css (var(--brand-text-dark), var(--brand-lime))
// instead of hardcoded hex, so there's one source of truth for them.
const siteUrl = "https://www.thehighproteinsnacks.com";

const HERO_CHIPS = [
  { label: "High Protein", href: "/snacks/high-protein" },
  { label: "Low Sugar", href: "/snacks/low-sugar" },
  { label: "Best Value", href: "/snacks/best-value" },
  { label: "Weight Loss", href: "/snacks/weight-loss" },
] as const;

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "The High Protein Snacks",
  url: siteUrl,
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteUrl}/snacks?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "The High Protein Snacks",
  url: siteUrl,
  logo: `${siteUrl}/logo-highproteinsnacks.png`,
};

const HOME_TITLE = "High-Protein Snacks Compared by Protein, Sugar & Price";
const HOME_DESCRIPTION =
  "Compare high-protein snacks by protein, sugar, calories and protein per dollar. Filter by low sugar, keto, vegan, gluten-free and more.";

export const metadata = {
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  alternates: {
    canonical: absoluteUrl("/"),
  },
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    url: absoluteUrl("/"),
    type: "website",
    images: [{ url: absoluteUrl("/og-default.jpg") }],
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: [absoluteUrl("/og-default.jpg")],
  },
};



type CategorySlug = keyof typeof categoryFilters;

const defaultSorter = (a: Product, b: Product) =>
  b.proteinPerServing - a.proteinPerServing;

const sorters: Partial<Record<CategorySlug, (a: Product, b: Product) => number>> =
  {
    "best-value": (a, b) => b.proteinPerDollar - a.proteinPerDollar,
    "low-sugar": (a, b) => {
      if (a.sugarPerServing === b.sugarPerServing) {
        return b.proteinPerServing - a.proteinPerServing;
      }
      return a.sugarPerServing - b.sugarPerServing;
    },
    "weight-loss": (a, b) =>
      (b.proteinPerDollar ?? 0) - (a.proteinPerDollar ?? 0),
    keto: (a, b) => {
      const netA = a.netCarbs ?? Number.POSITIVE_INFINITY;
      const netB = b.netCarbs ?? Number.POSITIVE_INFINITY;
      if (netA === netB) {
        return b.proteinPerServing - a.proteinPerServing;
      }
      return netA - netB;
    },
  };

function selectProducts(
  slug: CategorySlug,
  products: Product[],
  limit = 10,
): Product[] {
  const filterFn = categoryFilters[slug];
  if (!filterFn) return [];
  const filtered = products.filter(filterFn);
  const sorter = sorters[slug] ?? defaultSorter;
  return filtered.sort(sorter).slice(0, limit);
}

export default async function HomePage() {
  const products = getAllProducts();
  const weightLossProducts = products
    .filter(weightLossFilter)
    .sort((a, b) => (b.proteinPerDollar ?? 0) - (a.proteinPerDollar ?? 0));
  const weightLossTop3 = weightLossProducts.slice(0, 3);
  const weightLossRow = weightLossProducts.slice(0, 6);

  const bestValue = uniqueByBrand(
    products.filter((p) => p.proteinPerDollar >= 12)
  );
  
  const lowSugar = uniqueByBrand(selectProducts("low-sugar", products));
  const weightLoss = uniqueByBrand(weightLossProducts);
  const keto = uniqueByBrand(selectProducts("keto", products, 20));

  const highProtein = uniqueByBrand(selectProducts("high-protein", products));
  const bestValueProduct = products.reduce<Product | null>((best, product) => {
    const current = product.proteinPerDollar ?? 0;
    const bestScore = best?.proteinPerDollar ?? 0;
    return !best || current > bestScore ? product : best;
  }, null);
  const bestLowSugarProduct = products.reduce<Product | null>((best, product) => {
    const currentSugar =
      product.sugarPerServing ?? Number.POSITIVE_INFINITY;
    const bestSugar =
      best?.sugarPerServing ?? Number.POSITIVE_INFINITY;
    return !best || currentSugar < bestSugar ? product : best;
  }, null);
  const bestHighProteinProduct = products.reduce<Product | null>(
    (best, product) => {
      const currentProtein = product.proteinPerServing ?? 0;
      const bestProtein = best?.proteinPerServing ?? 0;
      return !best || currentProtein > bestProtein ? product : best;
    },
    null,
  );

  return (
    <>
      <JsonLd data={websiteJsonLd} />
      <JsonLd data={organizationJsonLd} />
      {/* HERO — full-bleed photo, real HTML content overlaid in the photo's
          left negative space. The outer header's background is the same
          cream as the photo's own empty area, so on screens wider than the
          1680px media cap, the extra margin reads as a seamless extension
          of the photo rather than a hard edge or stretched/over-cropped image. */}
      <header
        className="relative overflow-hidden"
        style={{ backgroundColor: "var(--hero-cream)" }}
      >
        <div className="relative mx-auto max-w-[1680px]">
          {/* Desktop / tablet */}
          <div
            className="relative hidden w-full md:block"
            style={{ height: "clamp(440px, 36vw, 620px)" }}
          >
            <Image
              src="/images/hero/hero-desktop.jpg"
              alt="A flat-lay of high-protein snack bars, protein shakes, chips and bites"
              fill
              priority
              sizes="(min-width: 1680px) 1680px, 100vw"
              style={{ objectFit: "cover", objectPosition: "center 42%" }}
            />
            <div className="absolute inset-0 flex items-center">
              <div className="ml-6 max-w-[420px] lg:ml-14 xl:ml-20">
                <h1
                  className="text-3xl font-black leading-tight tracking-tight lg:text-[2.75rem]"
                  style={{ color: "var(--brand-text-dark)" }}
                >
                  Find &amp; Compare High-Protein Snacks for Your Goals
                </h1>
                <p
                  className="mt-4 text-base lg:text-lg"
                  style={{ color: "rgba(2,46,39,0.78)" }}
                >
                  Compare protein, sugar, calories and value across hundreds
                  of snacks — ranked by the numbers, not the marketing.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Link
                    href="/snacks"
                    className="inline-flex min-h-[48px] items-center justify-center rounded-full px-6 text-sm font-bold transition hover:opacity-90"
                    style={{
                      backgroundColor: "var(--brand-lime)",
                      color: "var(--brand-text-dark)",
                    }}
                  >
                    Explore Snacks
                  </Link>
                  <Link
                    href="/quiz"
                    className="inline-flex min-h-[48px] items-center justify-center rounded-full border-2 bg-white/90 px-6 text-sm font-semibold transition hover:bg-white"
                    style={{
                      borderColor: "var(--brand-text-dark)",
                      color: "var(--brand-text-dark)",
                    }}
                  >
                    Find My Perfect Snack
                  </Link>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {HERO_CHIPS.map((chip) => (
                    <Link
                      key={chip.href}
                      href={chip.href}
                      className="inline-flex min-h-[38px] items-center rounded-full border bg-white/90 px-3 text-sm font-medium transition hover:bg-white"
                      style={{
                        borderColor: "rgba(2,46,39,0.25)",
                        color: "var(--brand-text-dark)",
                      }}
                    >
                      {chip.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile — stacked: cream content block, then photo band directly
              beneath it in the same cream tone, then a separately-cropped
              mobile composition (not just a scaled-down desktop crop). */}
          <div className="md:hidden">
            <div
              className="px-5 pb-6 pt-10"
              style={{ backgroundColor: "var(--hero-cream)" }}
            >
              <h1
                className="text-[1.75rem] font-black leading-tight tracking-tight"
                style={{ color: "var(--brand-text-dark)" }}
              >
                Find &amp; Compare High-Protein Snacks for Your Goals
              </h1>
              <p
                className="mt-3 text-sm"
                style={{ color: "rgba(2,46,39,0.78)" }}
              >
                Compare protein, sugar, calories and value across hundreds
                of snacks — ranked by the numbers, not the marketing.
              </p>
              <div className="mt-5 flex flex-col gap-3">
                <Link
                  href="/snacks"
                  className="inline-flex min-h-[48px] w-full items-center justify-center rounded-full px-6 text-sm font-bold"
                  style={{
                    backgroundColor: "var(--brand-lime)",
                    color: "var(--brand-text-dark)",
                  }}
                >
                  Explore Snacks
                </Link>
                <Link
                  href="/quiz"
                  className="inline-flex min-h-[48px] w-full items-center justify-center rounded-full border-2 bg-white/90 px-6 text-sm font-semibold"
                  style={{
                    borderColor: "var(--brand-text-dark)",
                    color: "var(--brand-text-dark)",
                  }}
                >
                  Find My Perfect Snack
                </Link>
              </div>
              {/* 2x2 — all four visible at once, no horizontal scroll */}
              <div className="mt-5 grid grid-cols-2 gap-2">
                {HERO_CHIPS.map((chip) => (
                  <Link
                    key={chip.href}
                    href={chip.href}
                    className="inline-flex min-h-[44px] items-center justify-center rounded-full border bg-white/90 px-2 text-center text-sm font-medium"
                    style={{
                      borderColor: "rgba(2,46,39,0.25)",
                      color: "var(--brand-text-dark)",
                    }}
                  >
                    {chip.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="relative aspect-[1196/806] w-full">
              <Image
                src="/images/hero/hero-mobile.jpg"
                alt="A flat-lay of high-protein snack bars, protein shakes, chips and bites"
                fill
                priority
                sizes="100vw"
                style={{ objectFit: "cover" }}
              />
            </div>
          </div>
        </div>
      </header>
      <AdSlot slot="REPLACE_WITH_HOME_SLOT_ID" className="my-10" />
      {bestValueProduct && bestLowSugarProduct && bestHighProteinProduct && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              name: "Top Rankings Today",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: bestValueProduct.name,
                  url: absoluteUrl(`/snacks/${bestValueProduct.id}`),
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: bestLowSugarProduct.name,
                  url: absoluteUrl(`/snacks/${bestLowSugarProduct.id}`),
                },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: bestHighProteinProduct.name,
                  url: absoluteUrl(`/snacks/${bestHighProteinProduct.id}`),
                },
              ],
            }),
          }}
        />
      )}
      <TopRankingsToday />
      <WeightLossTop3 products={weightLossTop3} /> 

      {/* JSON-LD: Best Value list (only once) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Best Value High-Protein Snacks",
            itemListElement: bestValue.map((p, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: p.buyUrl || "https://thehighproteinsnacks.com/snacks",
              name: p.name,
            })),
          }),
        }}
      />


      <main className="mx-auto max-w-7xl bg-gray-50 px-4 py-16 sm:px-6 lg:px-8">
        <ProductRow
          title="Best Value"
          products={bestValue}
          viewAllHref="/snacks/best-value"
          cardStyle="modern"
        />

        <ProductRow
          title="Low Sugar"
          products={lowSugar}
          viewAllHref="/snacks/low-sugar"
        />

        <ProductRow
          title="Weight Loss"
          products={weightLoss}
          viewAllHref="/snacks/weight-loss"
        />

        <ProductRow
          title="Keto"
          products={keto}
          viewAllHref="/snacks/keto"
        />

        <ProductRow
          title="High Protein"
          products={highProtein}
          viewAllHref="/snacks/high-protein"
        />

        {/* Popular Comparisons (SEO + conversion) */}
        <ComparisonsRow />

        {/* Nutrition Guides (authority + internal links) */}
        <GuidesRow />

        <ExploreCategoryRow />

        {/* Tools */}
        <section className="my-20 rounded-3xl bg-[#0B1F1E] p-10 text-white">
          <h2 className="mb-10 text-center text-3xl font-black">
            Snack smarter with our tools
          </h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                title: "Protein Calculator",
                desc: "Find your exact daily needs based on goals & activity",
                cta: "Calculate Now",
                href: "/calculator",
                highlight: false,
              },
              {
                title: "Perfect Snack Quiz",
                desc: "Answer 4 quick questions → get your top 3 matches instantly",
                cta: "Start Quiz",
                href: "/quiz",
                highlight: true,
              },
              {
                title: "Price-Per-Protein",
                desc:
                  "Sort the entire database by cost efficiency. Find the cheapest grams",
                cta: "Compare Prices",
                href: "/snacks/best-value",
                highlight: false,
              },
            ].map((tool) => (
              <Link
                key={tool.title}
                href={tool.href}
                className={`block rounded-2xl p-8 transition ${
                  tool.highlight
                    ? "bg-[#C6FF47] text-black"
                    : "bg-white/10 backdrop-blur hover:bg-white/20"
                }`}
              >
                <h3 className="text-xl font-bold">{tool.title}</h3>
                <p className="mt-3 text-sm opacity-90">{tool.desc}</p>
                <span
                  className={`mt-6 inline-block font-bold ${
                    tool.highlight ? "text-black" : "text-[#C6FF47]"
                  }`}
                >
                  {tool.cta} →
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
