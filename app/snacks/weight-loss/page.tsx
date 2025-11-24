import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { getAllProducts } from "@/lib/products";
import { weightLossFilter } from "@/lib/categoryFilters";
import ProductCard from "@/components/snacks/ProductCard";

export const metadata: Metadata = buildMetadata({
  title: "Best High-Protein Snacks for Weight Loss",
  description:
    "Snacks under 200 calories, ≥5g protein, ≤5g sugar — including CHOMPS auto-included.",
  path: "/snacks/weight-loss",
});

export const revalidate = 21600;

export default function Page() {
  const weightLoss = getAllProducts()
    .filter(weightLossFilter)
    .sort((a, b) => (b.proteinPerDollar ?? 0) - (a.proteinPerDollar ?? 0));

  return (
    <main className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="text-3xl font-black mb-8">Best Snacks for Weight Loss</h1>

      <div className="grid gap-6 md:grid-cols-3">
        {weightLoss.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </main>
  );
}
