// app/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
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





// --- BRAND COLORS (centralized) ---
const PRIMARY_DARK = "#124942"; // was #0F3D37// softer deep teal
const ACCENT_LIME  = "#C6FF47"; // lime highlight
const siteUrl = "https://www.thehighproteinsnacks.com";

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

export const metadata: Metadata = {
  title: "Best High-Protein Snacks Ranked (2025) – Protein, Sugar & Value Directory",
  description:
    "Find high-protein snacks that actually taste good — bars, shakes, chips & bites ranked by protein-per-dollar, sugar, calories, and ingredient quality. Updated constantly.",
  openGraph: {
    title: "Best High-Protein Snacks Ranked (2025)",
    description:
      "Independent rankings of high-protein snacks — bars, shakes, chips & bites. Ranked by protein-per-dollar, sugar, calories & ingredient quality.",
    url: "https://thehighproteinsnacks.com",
    siteName: "The High Protein Snacks",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Best High-Protein Snacks (2025)",
    description:
      "Independent rankings of bars, shakes, chips & bites — ranked by protein-per-dollar, sugar & calories.",
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
      {/* HERO */}
<header style={{ backgroundColor: PRIMARY_DARK }} className="text-white">
  
  
  <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">


    {/* NEW HEADLINE */}
    <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
      Find the best <span className="text-[#C6FF47]">high-protein snacks</span> for your goals.
    </h1>

    {/* SUBHEAD */}
    <p className="mt-4 max-w-3xl mx-auto text-lg sm:text-xl text-gray-200">
      Bars, shakes, chips, bites — ranked by what actually matters:
      <span className="font-semibold text-white"> protein-per-dollar</span>,
      <span className="font-semibold text-white"> sugar</span>, and
      <span className="font-semibold text-white"> ingredient quality</span>.
    </p>

    

    {/* Trust badges */}
    <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-gray-300">
      <span className="flex items-center gap-1">
        <CheckCircle2 className="h-4 w-4 text-emerald-300" /> Tested by real people
      </span>
      <span className="flex items-center gap-1">
        <CheckCircle2 className="h-4 w-4 text-emerald-300" /> Ranked by nutrition
      </span>
      <span className="flex items-center gap-1">
        <CheckCircle2 className="h-4 w-4 text-emerald-300" /> No sponsored content
      </span>
      <span className="flex items-center gap-1">
        <CheckCircle2 className="h-4 w-4 text-emerald-300" /> Updated constantly
      </span>
    </div>

    {/* Primary CTAs */}
    <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
      <Link
        href="/snacks"
        className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-bold text-black transition hover:opacity-95"
        style={{ backgroundColor: ACCENT_LIME }}
      >
        Find Your Snack →
      </Link>

      <Link
        href="/tools/snack-finder"
        className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
      >
        Snack Finder Quiz
      </Link>
    </div>

    {/* Quick filter chips */}
    <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm">
      <Link
        href="/snacks/high-protein"
        className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-white hover:bg-white/10"
      >
        High-protein picks
      </Link>

      <Link
        href="/snacks/low-sugar"
        className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-white hover:bg-white/10"
      >
        Low-sugar snacks
      </Link>

      <Link
        href="/snacks/best-value"
        className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-white hover:bg-white/10"
      >
        Best value (g per $)
      </Link>

      <Link
  href="/snacks/weight-loss"
  className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-white hover:bg-white/10"
>
  Weight-loss picks
</Link>

    </div>
  </div>
</header>
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
                  url: `/snack/${bestValueProduct.id}`,
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: bestLowSugarProduct.name,
                  url: `/snack/${bestLowSugarProduct.id}`,
                },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: bestHighProteinProduct.name,
                  url: `/snack/${bestHighProteinProduct.id}`,
                },
              ],
            }),
          }}
        />
      )}
      <section className="bg-white py-10 border-b">
  <div className="mx-auto max-w-4xl px-4 text-center">
    <h2 className="text-2xl font-bold text-gray-900 mb-3">
      Not sure which snack to choose?
    </h2>
    <p className="text-gray-600 mb-6">
      Answer 4 quick questions and get your top 3 high-protein snack matches.
    </p>
    <Link
      href="/tools/snack-finder"
      className="inline-block rounded-full bg-[#C6FF47] px-6 py-3 text-black font-bold hover:bg-[#A3CC00] transition"
    >
      Take the Snack Finder Quiz →
    </Link>
  </div>
</section>

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
                href: "/tools/snack-finder",
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
