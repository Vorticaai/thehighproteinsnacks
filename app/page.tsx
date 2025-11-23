// app/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { getAllProducts, type Product } from "@/lib/products";
import { categoryFilters } from "@/lib/categoryFilters";
import ComparisonsRow from "@/components/sections/ComparisonsRow";
import GuidesRow from "@/components/sections/GuidesRow";
import ProductRow from "@/components/sections/ProductRow";
import ExploreCategoryRow from "@/components/sections/ExploreCategoryRow";

// --- BRAND COLORS (centralized) ---
const PRIMARY_DARK = "#124942"; // was #0F3D37// softer deep teal
const ACCENT_LIME  = "#C6FF47"; // lime highlight

export const metadata: Metadata = {
  title: "The High Protein Snacks Directory",
  description:
    "Independent rankings of the cleanest high-protein snacks—compare macros, sugar, and price in one scroll-friendly hub.",
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
    "weight-loss": (a, b) => {
      if (a.caloriesPerServing === b.caloriesPerServing) {
        return b.proteinPerServing - a.proteinPerServing;
      }
      return a.caloriesPerServing - b.caloriesPerServing;
    },
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

  const bestValue = selectProducts("best-value", products);
  const lowSugar = selectProducts("low-sugar", products);
  const weightLoss = selectProducts("weight-loss", products);
  const keto = selectProducts("keto", products);
  const highProtein = selectProducts("high-protein", products);

  return (
    <>
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
    </div>
  </div>
</header>


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
