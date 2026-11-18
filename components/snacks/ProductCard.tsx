// components/snacks/ProductCard.tsx
import type { Product } from "@/lib/products";
import Link from "next/link";
import BuyLink from "@/components/snacks/BuyLink";
import ProductVisual from "@/components/snacks/ProductVisual";
import { VerifiedPill } from "@/components/snacks/VerificationNote";




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
      {/* Licensed photo with credit, or the generated label card */}
      <div className="mb-3 h-[132px] w-full overflow-hidden rounded-lg">
        <ProductVisual product={product} />
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
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-[11px] uppercase tracking-wide text-gray-500">{product.brand}</p>
        <VerifiedPill product={product} />
      </div>

      {/* Nutrition & value badges */}
      <div className="mb-2 flex flex-wrap gap-2 text-[11px] font-semibold">
        <span className="rounded-full bg-gray-100 px-2 py-1 text-gray-700">
          ~${product.pricePerServing.toFixed(2)} / serving
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
      <BuyLink
        href={product.buyUrl}
        productName={product.name}
        productId={product.id}
        className="mt-auto inline-flex w-full items-center justify-center rounded-full bg-[#C6FF47] px-3 py-2 text-xs font-bold text-black transition hover:bg-[#b8e840]"
      >
        Check price on Amazon →
      </BuyLink>
      <p className="mt-1 text-center text-[10px] text-gray-500">Price is an estimate; affiliate link</p>
    </div>
  );
}
