// app/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import ProductRow from "@/components/sections/ProductRow";
import { getAllProducts } from "@/lib/products";
import { CheckCircle2 } from "lucide-react";
import ComparisonsRow from "@/components/sections/ComparisonsRow";
import GuidesRow from "@/components/sections/GuidesRow";

// --- BRAND COLORS (centralized) ---
const PRIMARY_DARK = "#124942"; // was #0F3D37// softer deep teal
const ACCENT_LIME  = "#C6FF47"; // lime highlight

export const metadata: Metadata = {
  title: "The High Protein Snacks Directory – 500+ Tested & Ranked (2025)",
  description:
    "Stop eating chalky bars. Independent rankings of 500+ high-protein snacks by protein-per-dollar, taste, and ingredient quality.",
};

export default async function HomePage() {
  const products = getAllProducts();
  const productCount = products.length;


  // Best value = highest grams of protein per dollar
  const bestValue = [...products]
    .filter((p) => p.pricePerServing > 0 && p.proteinPerServing > 0)
    .sort((a, b) => b.proteinPerDollar - a.proteinPerDollar)
    .slice(0, 10);

  return (
    <>
      {/* HERO */}
      <header style={{ backgroundColor: PRIMARY_DARK }} className="text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
          

          <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
            Stop eating <span className="text-[#C6FF47]">chalky</span> bars.
          </h1>

          <p className="mt-4 max-w-3xl mx-auto text-lg sm:text-xl text-gray-200">
  Compare protein, sugar, and price across trusted bars, chips, and shakes —
  ranked to help you snack smarter.
</p>



<p className="mx-auto mt-4 max-w-3xl text-lg sm:text-xl text-gray-200">
  The independent directory of high-protein snacks—ranked by protein-per-dollar,
  sugar, and ingredient quality.
</p>


          {/* Trust badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-gray-300">
  <span className="flex items-center gap-1">
    <CheckCircle2 className="h-4 w-4 text-emerald-300" /> Real nutrition facts
  </span>
  <span className="flex items-center gap-1">
    <CheckCircle2 className="h-4 w-4 text-emerald-300" /> Ranked by protein-per-dollar
  </span>
  <span className="flex items-center gap-1">
    <CheckCircle2 className="h-4 w-4 text-emerald-300" /> No sponsored placements
  </span>
  <span className="flex items-center gap-1">
    <CheckCircle2 className="h-4 w-4 text-emerald-300" /> New snacks added regularly
  </span>
</div>


        {/* Primary CTAs */}
<div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
  <Link
    href="/snacks"
    className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-bold text-black transition hover:opacity-95"
    style={{ backgroundColor: ACCENT_LIME }}
  >
    Browse snacks →
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
    href="/snacks/weight-loss"
    className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-white hover:bg-white/10"
  >
    Weight-loss picks
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
        {/* Best Value Row */}
        <ProductRow
          title="💰 Best Value High-Protein Snacks"
          subtitle="Highest protein per dollar right now"
          products={bestValue}
          viewAllHref="/snacks/best-value"
        />

        {/* Popular Comparisons (SEO + conversion) */}
        <ComparisonsRow />

        {/* Nutrition Guides (authority + internal links) */}
        <GuidesRow />

        {/* Categories */}
        <section className="my-20">
          <h2 className="mb-10 text-center text-3xl font-black text-gray-900">
            Explore by Category
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Weight Loss",
                desc: "Under 200 calories, designed to keep you full",
                icon: "⚖️",
                href: "/snacks/weight-loss",
              },
              {
                title: "Low Sugar",
                desc: "<2g sugar or less to prevent insulin spikes",
                icon: "🍬",
                href: "/snacks/low-sugar",
              },
              {
                title: "Keto Friendly",
                desc: "High fat, low carb options for ketosis",
                icon: "🥑",
                href: "/snacks/keto",
              },
              {
                title: "Protein Bars",
                desc: "The classics — ranked by taste & texture",
                icon: "🍫",
                href: "/snacks/bars",
              },
              {
                title: "Budget Finds",
                desc: "Highest protein for the lowest cost per gram",
                icon: "💸",
                href: "/snacks/best-value",
              },
              {
                title: "Plant Based",
                desc: "100% vegan complete protein sources",
                icon: "🌱",
                href: "/snacks/vegan",
              },
            ].map((cat) => (
              <Link
                key={cat.title}
                href={cat.href}
                className="group block rounded-2xl bg-white p-8 shadow-sm border-2 border-[#C6FF47] hover:-translate-y-1 hover:shadow-lg hover:ring-2 hover:ring-[#C6FF47] transition"

              >
                <div className="mb-4 text-4xl">{cat.icon}</div>
                <h3 className="text-xl font-bold text-gray-900">{cat.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{cat.desc}</p>
                <span className="mt-6 inline-block font-bold text-[#0B1F1E] group-hover:underline">
                  View snacks →
                </span>
              </Link>
            ))}
          </div>
        </section>

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
                href: "/tools/protein-calculator",
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
