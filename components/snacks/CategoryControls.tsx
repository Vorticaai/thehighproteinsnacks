"use client"

/**
 * Sort + facet controls for a category listing page (/snacks/[slug]).
 *
 * Takes the full, already-category-filtered product list from the server
 * component and does the rest client-side: no new data, no new routes, no
 * query-string state. A category page like /snacks/high-protein stays a
 * single static URL; only what's rendered inside it changes.
 *
 * Facets are computed from the product list itself and hidden when they
 * wouldn't do anything (e.g. no Format toggle on a category that's all
 * bars) — new categories or data changes don't need this component touched.
 */
import { useMemo, useState } from "react"
import ProductCard from "@/components/snacks/ProductCard"
import type { Product } from "@/lib/products"
import { CATEGORY_SORT_OPTIONS, sortProducts, type CategorySortOption } from "@/lib/categorySort"

type FormatFilter = "all" | "bars" | "chips"

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        active
          ? "rounded-full border border-[#C6FF47] bg-[#C6FF47]/10 px-3 py-1.5 text-xs font-semibold text-gray-900"
          : "rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:border-gray-300 hover:text-gray-900"
      }
    >
      {children}
    </button>
  )
}

export default function CategoryControls({
  products,
  defaultSort = "protein-desc",
}: {
  products: Product[]
  defaultSort?: CategorySortOption
}) {
  const [sort, setSort] = useState<CategorySortOption>(defaultSort)
  const [format, setFormat] = useState<FormatFilter>("all")
  const [veganOnly, setVeganOnly] = useState(false)
  const [glutenFreeOnly, setGlutenFreeOnly] = useState(false)

  const facets = useMemo(() => {
    const barsCount = products.filter((p) => p.flags.bars).length
    const chipsCount = products.filter((p) => p.flags.chips).length
    const otherCount = products.length - barsCount - chipsCount
    const veganCount = products.filter((p) => p.flags.vegan).length
    const glutenFreeCount = products.filter((p) => p.flags.glutenFree).length

    const formatGroups = [barsCount, chipsCount, otherCount].filter((n) => n > 0).length

    return {
      showFormat: formatGroups > 1,
      barsCount,
      chipsCount,
      showVegan: veganCount > 0 && veganCount < products.length,
      showGlutenFree: glutenFreeCount > 0 && glutenFreeCount < products.length,
    }
  }, [products])

  const visible = useMemo(() => {
    let next = products
    if (format === "bars") next = next.filter((p) => p.flags.bars)
    if (format === "chips") next = next.filter((p) => p.flags.chips)
    if (veganOnly) next = next.filter((p) => p.flags.vegan)
    if (glutenFreeOnly) next = next.filter((p) => p.flags.glutenFree)
    return sortProducts(next, sort)
  }, [products, format, veganOnly, glutenFreeOnly, sort])

  const hasActiveFilters = format !== "all" || veganOnly || glutenFreeOnly
  const showControls = products.length > 1

  return (
    <div>
      {showControls && (
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {facets.showFormat && (
              <>
                <Pill active={format === "all"} onClick={() => setFormat("all")}>
                  All formats
                </Pill>
                {facets.barsCount > 0 && (
                  <Pill active={format === "bars"} onClick={() => setFormat("bars")}>
                    Bars
                  </Pill>
                )}
                {facets.chipsCount > 0 && (
                  <Pill active={format === "chips"} onClick={() => setFormat("chips")}>
                    Chips
                  </Pill>
                )}
              </>
            )}
            {facets.showVegan && (
              <Pill active={veganOnly} onClick={() => setVeganOnly((v) => !v)}>
                Vegan
              </Pill>
            )}
            {facets.showGlutenFree && (
              <Pill active={glutenFreeOnly} onClick={() => setGlutenFreeOnly((v) => !v)}>
                Gluten-free
              </Pill>
            )}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => {
                  setFormat("all")
                  setVeganOnly(false)
                  setGlutenFreeOnly(false)
                }}
                className="text-xs font-semibold text-gray-500 underline hover:text-gray-900"
              >
                Reset
              </button>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm">
            <span className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-gray-500">
              Sort
            </span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as CategorySortOption)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#006F6D] focus:outline-none"
            >
              {CATEGORY_SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {showControls && (
        <p className="mb-4 text-sm text-gray-500">
          Showing {visible.length} of {products.length} snacks
        </p>
      )}

      {visible.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-600">
          No snacks match these filters.{" "}
          <button
            type="button"
            onClick={() => {
              setFormat("all")
              setVeganOnly(false)
              setGlutenFreeOnly(false)
            }}
            className="font-semibold text-[#006F6D] underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  )
}
