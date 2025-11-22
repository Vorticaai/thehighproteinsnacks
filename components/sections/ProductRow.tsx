// components/sections/ProductRow.tsx
"use client";

import type { Product } from "@/lib/products";
import ProductCard from "@/components/snacks/ProductCard";

interface ProductRowProps {
  title: string;
  products: Product[];
  viewAllHref?: string;
}

export default function ProductRow({
  title,
  products,
  viewAllHref,
}: ProductRowProps) {
  if (!products || products.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>

        {viewAllHref && (
          <a
            href={viewAllHref}
            className="text-sm font-semibold text-[#006F6D] hover:underline"
          >
            View all →
          </a>
        )}
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {products.slice(0, 10).map((product) => (
          <div key={product.id} className="w-[160px] flex-shrink-0">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
