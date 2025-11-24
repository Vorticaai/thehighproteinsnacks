/**
 * Shared snack card for featured sections and list displays.
 */
import Image from "next/image"
import Link from "next/link"
import type { Product } from "@/lib/products"
import { Star } from "lucide-react"

type SnackCardProps = {
  snack: Product
}

export function SnackCard({ snack }: SnackCardProps) {
  // Show image if imageUrl exists, regardless of hero status
  const hasImage = snack.imageUrl && snack.imageUrl.trim().length > 0
  
  // Check if we have verified macro data
  const hasMacros =
    snack.proteinPerServing != null &&
    snack.caloriesPerServing != null &&
    snack.carbsPerServing != null &&
    snack.fatsPerServing != null

  return (
    <Link href={`/snack/${snack.id}`} className="block">
      <div className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md">
        {/* Product Image */}
        {hasImage ? (
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-2xl bg-gray-100">
            {/* Verified Badge - Hero Products Only */}
            {snack.isHero && (
              <span className="absolute left-3 top-3 z-10 inline-block rounded-full bg-[#C6F221] px-2 py-0.5 text-[10px] font-medium text-black shadow-sm">
                Verified Nutrition
              </span>
            )}
            <Image
              src={snack.imageUrl}
              alt={snack.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px"
              className="object-cover transition-transform group-hover:scale-105"
            />
          </div>
        ) : (
          <div className="flex aspect-[4/3] w-full items-center justify-center rounded-t-2xl bg-gray-100 px-4 text-center">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-500">{snack.brand}</p>
              <p className="line-clamp-2 text-sm font-medium text-gray-700">{snack.name}</p>
            </div>
          </div>
        )}

        {/* Card Content */}
        <div className="flex flex-1 flex-col p-4">
          {/* Brand & Rating */}
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-600">{snack.brand}</span>
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-gray-900">
                {Number(snack.rating ?? 4.6).toFixed(1)}
              </span>
            </div>
          </div>

          {/* Product Name */}
          <h3 className="mb-3 line-clamp-2 text-base font-bold text-gray-900 group-hover:text-[#006F6D]">
            {snack.name}
          </h3>
          
          {/* Verified Macros Badge */}
          {hasMacros && (
            <div className="mb-3">
              <span className="inline-flex items-center gap-1 rounded-full border border-[#006F6D]/20 bg-[#006F6D]/5 px-2 py-0.5 text-[11px] font-medium text-[#006F6D]">
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Verified macros
              </span>
            </div>
          )}

          {/* Macro Stats */}
          <div className="mb-4 grid grid-cols-3 gap-2">
            <MacroStat
              label="Protein"
              value={`${snack.proteinPerServing}g`}
              highlight
            />
            <MacroStat label="Calories" value={`${snack.caloriesPerServing}`} />
            <MacroStat
              label="$/g"
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
