import type { Product } from "@/lib/products"

type LabelCardProps = {
  product: Pick<
    Product,
    "name" | "brand" | "proteinPerServing" | "caloriesPerServing" | "sugarPerServing"
  >
  size?: "sm" | "lg"
  className?: string
}

/**
 * A generated "label card" shown in place of a product photo.
 * It uses only our own data, so there are no image-rights issues,
 * and every card looks consistent.
 */
export default function LabelCard({ product, size = "sm", className = "" }: LabelCardProps) {
  const large = size === "lg"
  const label = `${product.brand} ${product.name}: ${product.proteinPerServing}g protein, ${product.caloriesPerServing} calories, ${product.sugarPerServing}g sugar per serving`

  return (
    <div
      role="img"
      aria-label={label}
      className={`flex h-full w-full flex-col justify-between rounded-lg bg-[#0B1F1E] text-white ${
        large ? "min-h-[320px] p-8" : "min-h-[120px] p-3"
      } ${className}`}
    >
      <div>
        <p
          className={`font-semibold uppercase tracking-[0.2em] text-[#C6FF47] ${
            large ? "text-xs" : "text-[9px]"
          }`}
        >
          {product.brand}
        </p>
        <p
          className={`mt-1 line-clamp-2 font-semibold leading-snug text-gray-100 ${
            large ? "text-lg" : "text-[11px]"
          }`}
        >
          {product.name}
        </p>
      </div>
      <div>
        <p className={`font-black leading-none ${large ? "text-6xl" : "text-2xl"}`}>
          {product.proteinPerServing}g
          <span className={`ml-1 font-semibold text-gray-300 ${large ? "text-lg" : "text-[10px]"}`}>
            protein
          </span>
        </p>
        <p className={`mt-1 text-gray-300 ${large ? "text-sm" : "text-[10px]"}`}>
          {product.caloriesPerServing} cal · {product.sugarPerServing}g sugar per serving
        </p>
      </div>
    </div>
  )
}
