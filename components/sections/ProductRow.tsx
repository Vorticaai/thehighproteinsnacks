// components/sections/ProductRow.tsx
"use client";

import Link from "next/link";
import type { Product } from "@/lib/products";
import ProductCard from "@/components/snacks/ProductCard";

type Props = {
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllHref: string;
  cardStyle?: "modern" | "default";
};

export default function ProductRow({
  title,
  subtitle,
  products,
  viewAllHref,
  cardStyle = "default",
}: Props) {
  if (!products || products.length === 0) return null;

  return (
    <section className="mb-10" data-card-style={cardStyle}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          {subtitle ? (
            <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
          ) : null}
        </div>
        <Link
          href={viewAllHref}
          className="text-sm font-semibold text-[#006F6D] hover:underline"
        >
          View all →
        </Link>
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
