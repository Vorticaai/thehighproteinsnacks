import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { getAllProducts } from "@/lib/products";
import ProductCard from "@/components/snacks/ProductCard";

export const metadata: Metadata = buildMetadata({
  title: "Low-Sugar High-Protein Snacks",
  description: "High-protein snacks with 3g or less sugar per serving.",
  path: "/snacks/low-sugar",
});

export const revalidate = 21600;

export default function Page() {
  const products = getAllProducts()
    .filter((p) => p.sugarPerServing <= 3)
    .sort((a, b) => a.sugarPerServing - b.sugarPerServing);

  return (
    <main className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="text-3xl font-black mb-8">Low-Sugar Snacks</h1>

      <div className="grid gap-6 md:grid-cols-3">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </main>
  );
}
