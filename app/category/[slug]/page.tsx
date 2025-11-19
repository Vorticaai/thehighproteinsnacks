/**
 * Category route shows snacks filtered by a specific angle (e.g. weight-loss).
 */
import { notFound } from "next/navigation"
import { FilterBar } from "@/components/category/filter-bar"
import { ItemListSchema } from "@/components/schema/ItemListSchema"
import { SnackCard } from "@/components/snacks/snack-card"
import { filterSnacks, getCategoryBySlug } from "@/lib/directory"
import type { SortOption } from "@/lib/directory"
import { buildMetadata, absoluteUrl } from "@/lib/seo"
import type { DietTag } from "@/data/types"
const allowedSorts: SortOption[] = [
  "protein-desc",
  "protein-per-dollar",
  "calories-asc",
]

type CategoryPageProps = {
  params: { slug: string }
  searchParams: {
    minProtein?: string
    maxCalories?: string
    diet?: string
    sort?: SortOption
  }
}

export function generateMetadata({ params }: CategoryPageProps) {
  const category = getCategoryBySlug(params.slug)
  if (!category) {
    return buildMetadata({
      title: "High Protein Snack Category",
      description: "Browse curated high-protein snacks by category, macros and diet preferences.",
      path: `/category/${params.slug}`,
    })
  }
  return buildMetadata({
    title: category.title,
    description: category.description,
    path: `/category/${category.slug}`,
  })
}

export default function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const category = getCategoryBySlug(params.slug)
  if (!category) {
    notFound()
  }

  const minProtein = searchParams.minProtein
    ? Number(searchParams.minProtein)
    : undefined
  const maxCalories = searchParams.maxCalories
    ? Number(searchParams.maxCalories)
    : undefined
  const dietTags: DietTag[] = searchParams.diet
    ? (searchParams.diet.split(",") as DietTag[])
    : []
  const sortParam = searchParams.sort
  const sort = allowedSorts.includes(sortParam as SortOption)
    ? (sortParam as SortOption)
    : "protein-desc"

  const snacks = filterSnacks(category.slug, {
    minProtein,
    maxCalories,
    dietTags,
    sort,
  })

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">
      <header className="space-y-4">
        <p className="text-sm font-semibold uppercase text-primary">
          {category.primaryKeyword}
        </p>
        <h1 className="text-3xl font-semibold">{category.title}</h1>
        <p className="text-muted-foreground">{category.description}</p>
      </header>
      <FilterBar
        slug={category.slug}
        initialMinProtein={minProtein}
        initialMaxCalories={maxCalories}
        initialDiets={dietTags}
        sort={sort}
      />
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {snacks.length} snack{snacks.length === 1 ? "" : "s"} match this angle
          </h2>
        </div>
        {snacks.length ? (
          <div className="grid gap-6 md:grid-cols-2">
            {snacks.map((snack) => (
              <SnackCard key={snack.id} snack={snack} />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-gray-300 px-4 py-6 text-sm text-muted-foreground">
            No snacks hit that combination yet—try relaxing one of the filters.
          </p>
        )}
      </section>
      <ItemListSchema
        items={snacks.map((snack) => ({
          name: snack.name,
          url: absoluteUrl(`/snack/${snack.id}`),
        }))}
      />
    </main>
  )
}

