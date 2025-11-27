// components/snacks/ProductCard.tsx
"use client";

import type { Product } from "@/lib/products";
import Link from "next/link";
import { trackAmazonClick } from "@/lib/analytics"
console.log("trackAmazonClick imported as:", trackAmazonClick);




// helpers to color the value badge
const valueClass = (gPerDollar: number) => {
  if (gPerDollar >= 18) return "bg-[#C6FF47] text-black";      // elite value
  if (gPerDollar >= 12) return "bg-gray-100 text-gray-800";    // good/average
  return "bg-amber-100 text-amber-900";                        // weaker value
};

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  return (
    <div className="group flex h-full flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      {/* Image (smaller, stable height) */}
      <div className="mb-3 flex h-[120px] w-full items-center justify-center overflow-hidden rounded-lg bg-gray-50">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="max-h-[100px] w-auto object-contain transition-transform duration-200 group-hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* Title + brand */}
      <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-gray-900">
        <Link
          href={`/snacks/${product.id}`}
          className="text-gray-900 transition hover:text-[#006F6D]"
        >
          {product.name}
        </Link>
      </h3>
      <p className="mb-2 text-[11px] uppercase tracking-wide text-gray-500">
        {product.brand}
      </p>

      {/* Nutrition & value badges */}
      <div className="mb-2 flex flex-wrap gap-2 text-[11px] font-semibold">
        <span className="rounded-full bg-gray-100 px-2 py-1 text-gray-700">
          ${product.pricePerServing.toFixed(2)} / serving
        </span>
        <span className="rounded-full bg-gray-100 px-2 py-1 text-gray-700">
          {product.proteinPerServing}g protein
        </span>
        <span className={`rounded-full px-2 py-1 ${valueClass(product.proteinPerDollar)}`}>
          {product.proteinPerDollar.toFixed(1)}g per $
        </span>
      </div>

      {/* tiny calories line */}
      <p className="mb-2 text-[10px] text-gray-500">
        {product.caloriesPerServing} cal / serving
      </p>

      {/* CTA */}
     {/* CTA */}
     <a
  href={product.buyUrl}
  target="_blank"
  rel="noopener noreferrer"
  onClick={() => {
    console.log("[CTA] Amazon clicked →", product.name, product.id);
    trackAmazonClick(product.name, product.id);
  }}
  className="mt-auto inline-flex w-full items-center justify-center rounded-full bg-[#C6FF47] px-3 py-2 text-xs font-bold text-black transition hover:bg-[#b8e840]"
>
  View on Amazon →
</a>




      <p className="mt-1 text-center text-[10px] text-gray-500">Available on Amazon</p>
    </div>
  );
}
