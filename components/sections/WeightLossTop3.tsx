import Link from "next/link";
import type { Product } from "@/lib/products";
import ProductCard from "@/components/snacks/ProductCard";

type WeightLossTop3Props = {
  products: Product[];
};

export default function WeightLossTop3({ products }: WeightLossTop3Props) {
  const top3 = products.slice(0, 3);

  if (top3.length === 0) {
    return null;
  }

  return (
    <section className="my-20">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="text-center text-3xl font-black text-gray-900 mb-4">
          Best for Weight Loss — Top 3 Picks
        </h2>

        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-10">
          Under 200 calories. High protein. Clean ingredients.
          Only the top 3 snacks that actually support fat loss.
        </p>

        <div className="grid gap-6 md:grid-cols-3">
          {top3.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/snacks/weight-loss"
            className="inline-block rounded-full bg-[#C6FF47] px-6 py-3 font-bold text-black hover:bg-[#A3CC00] transition"
          >
            View All Weight-Loss Snacks →
          </Link>
        </div>
      </div>
    </section>
  );
}
