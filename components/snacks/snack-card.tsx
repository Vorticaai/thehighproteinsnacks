/**
 * Shared snack card for featured sections and list displays.
 */
import Link from "next/link"
import type { Product } from "@/lib/products"
import ProductVisual from "@/components/snacks/ProductVisual"
import { VerifiedPill } from "@/components/snacks/VerificationNote"

type SnackCardProps = {
  snack: Product
}

export function SnackCard({ snack }: SnackCardProps) {
  return (
    <Link href={`/snacks/${snack.id}`} className="block">
      <div className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md">
        {/* Licensed photo with credit, or the generated label card */}
        <div className="aspect-[4/3] w-full overflow-hidden rounded-t-2xl">
          <ProductVisual product={snack} />
        </div>

        {/* Card Content */}
        <div className="flex flex-1 flex-col p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-gray-600">{snack.brand}</span>
            <VerifiedPill product={snack} />
          </div>

          {/* Product Name */}
          <h3 className="mb-3 line-clamp-2 text-base font-bold text-gray-900 group-hover:text-[#006F6D]">
            {snack.name}
          </h3>
          
          {/* Macro Stats */}
          <div className="mb-4 grid grid-cols-3 gap-2">
            <MacroStat
              label="Protein"
              value={`${snack.proteinPerServing}g`}
              highlight
            />
            <MacroStat label="Calories" value={`${snack.caloriesPerServing}`} />
            <MacroStat
              label="g per $"
              value={`${snack.proteinPerDollar.toFixed(1)}`}
              isPricePerProtein
            />
          </div>

          {/* Diet Tags */}
          <div className="mt-auto flex flex-wrap gap-1.5">
            {(snack.dietTags ?? []).slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="inline-block rounded-full bg-[#006F6D] px-3 py-1 text-xs font-medium text-white"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* View Link */}
          <div className="mt-3 text-sm font-medium text-[#006F6D] group-hover:underline">
            View →
          </div>
        </div>
      </div>
    </Link>
  )
}

function MacroStat({
  label,
  value,
  highlight = false,
  isPricePerProtein = false,
}: {
  label: string
  value: string
  highlight?: boolean
  isPricePerProtein?: boolean
}) {
  const useLime = highlight || isPricePerProtein

  return (
    <div
      className={`rounded-lg px-2 py-2 text-center ${
        useLime ? "bg-[#CCFF00]" : "bg-gray-50"
      }`}
    >
      <p
        className={`text-xs font-semibold uppercase ${
          useLime ? "text-black" : "text-gray-600"
        }`}
      >
        {label}
      </p>
      <p
        className={`text-base font-extrabold ${
          useLime ? "text-black" : "text-gray-900"
        }`}
      >
        {value}
      </p>
    </div>
  )
}
