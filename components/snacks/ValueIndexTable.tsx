"use client"

/**
 * The ranked table for /protein-value-index. Deliberately a dense, numbered
 * table rather than a card grid (see CategoryControls) — this page is a data
 * study people cite and scan, not a browsing experience.
 *
 * Sort is a small subset of CATEGORY_SORT_OPTIONS (the ones that make sense
 * for a value ranking); re-sorting is a client-side re-sort of the same
 * already-fetched list, same pattern as CategoryControls.
 */
import { useMemo, useState } from "react"
import Link from "next/link"
import { VerifiedPill } from "@/components/snacks/VerificationNote"
import { sortProducts, type CategorySortOption } from "@/lib/categorySort"
import type { ValueIndexEntry } from "@/lib/proteinValueIndex"

const SORT_OPTIONS: Array<{ value: CategorySortOption; label: string }> = [
  { value: "protein-per-dollar-desc", label: "Best value (protein per $)" },
  { value: "protein-desc", label: "Protein: high to low" },
  { value: "price-asc", label: "Price per serving: low to high" },
]

export default function ValueIndexTable({ entries }: { entries: ValueIndexEntry[] }) {
  const [sort, setSort] = useState<CategorySortOption>("protein-per-dollar-desc")

  const rows = useMemo(() => {
    if (sort === "protein-per-dollar-desc") return entries
    const products = sortProducts(
      entries.map((e) => e.product),
      sort,
    )
    // Re-sorting drops the original rank numbering (rank only means
    // something for the default protein-per-dollar order) — the Rank
    // column shows "—" for any other sort rather than a now-wrong number.
    return products.map((product) => ({ product, rank: null as number | null }))
  }, [entries, sort])

  return (
    <div>
      <div className="mb-4 flex items-center justify-end gap-2 text-sm">
        <span className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-gray-500">
          Sort
        </span>
        <select
          value={sort}
          onChange={(event) => setSort(event.target.value as CategorySortOption)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#006F6D] focus:outline-none"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th scope="col" className="px-4 py-3">
                Rank
              </th>
              <th scope="col" className="px-4 py-3">
                Snack
              </th>
              <th scope="col" className="px-4 py-3 text-right">
                Protein
              </th>
              <th scope="col" className="px-4 py-3 text-right">
                Price / serving
              </th>
              <th scope="col" className="px-4 py-3 text-right">
                Protein per $
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ product, rank }, index) => (
              <tr
                key={product.id}
                className={index % 2 === 0 ? "bg-white" : "bg-gray-50/60"}
              >
                <td className="px-4 py-3 align-top font-mono text-gray-500">
                  {rank ?? "—"}
                </td>
                <td className="px-4 py-3 align-top">
                  <Link
                    href={`/snacks/${product.id}`}
                    className="font-semibold text-gray-900 hover:text-[#006F6D] hover:underline"
                  >
                    {product.name}
                  </Link>
                  <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-gray-500">
                    <span>{product.brand}</span>
                    <VerifiedPill product={product} />
                  </div>
                </td>
                <td className="px-4 py-3 text-right align-top text-gray-700">
                  {product.proteinPerServing}g
                </td>
                <td className="px-4 py-3 text-right align-top text-gray-700">
                  ${product.pricePerServing.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right align-top font-semibold text-[#006F6D]">
                  {product.proteinPerDollar.toFixed(1)}g
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
