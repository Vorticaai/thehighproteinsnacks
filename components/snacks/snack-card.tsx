/**
 * Shared snack card for featured sections and list displays.
 */
import Image from "next/image"
import Link from "next/link"
import type { Snack } from "@/data/types"
import { Star } from "lucide-react"

type SnackCardProps = {
  snack: Snack
}

export function SnackCard({ snack }: SnackCardProps) {
  // Show image if imageUrl exists, regardless of hero status
  const hasImage = snack.imageUrl && snack.imageUrl.trim().length > 0

  return (
    <Link href={`/snack/${snack.id}`} className="block">
      <div className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md">
        {/* Product Image */}
        {hasImage ? (
          <div className="relative h-48 w-full overflow-hidden bg-gray-100">
            <Image
              src={snack.imageUrl}
              alt={snack.name}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform group-hover:scale-105"
            />
          </div>
        ) : (
          <div className="flex h-48 w-full items-center justify-center bg-gray-100 px-4 text-center">
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
              <span className="font-semibold text-gray-900">{snack.rating.toFixed(1)}</span>
            </div>
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
              label="$/g"
              value={`${snack.proteinPerDollar.toFixed(1)}`}
              isPricePerProtein
            />
          </div>

          {/* Diet Tags */}
          <div className="mt-auto flex flex-wrap gap-1.5">
            {snack.dietTags.slice(0, 2).map((tag) => (
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
