/**
 * Data helper functions so pages can stay focused on presentation.
 * Swapping to Supabase later means re-implementing only these helpers.
 */
import { categories } from "@/data/categories"
import { snacks } from "@/data/snacks"
import type { Category, CategoryTag, DietTag, Snack } from "@/data/types"

export type SortOption =
  | "protein-desc"
  | "protein-per-dollar"
  | "calories-asc"

export type SnackFilters = {
  minProtein?: number
  maxCalories?: number
  dietTags?: DietTag[]
  sort?: SortOption
}

export function getAllSnacks() {
  return snacks
}

export function getSnackBySlug(slug: string): Snack | undefined {
  return snacks.find((snack) => snack.slug === slug)
}

export function getSnacksByCategory(categorySlug: string) {
  return snacks.filter((snack) =>
    snack.categoryTags.includes(categorySlug as CategoryTag),
  )
}

export function getCategories() {
  return categories
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((category) => category.slug === slug)
}

export function filterSnacks(
  categorySlug: string,
  filters: SnackFilters = {},
): Snack[] {
  const { minProtein, maxCalories, dietTags, sort = "protein-desc" } = filters
  let filtered = getSnacksByCategory(categorySlug)

  if (typeof minProtein === "number") {
    filtered = filtered.filter(
      (snack) => snack.proteinPerServing >= (minProtein ?? 0),
    )
  }

  if (typeof maxCalories === "number") {
    filtered = filtered.filter(
      (snack) => snack.caloriesPerServing <= (maxCalories ?? Infinity),
    )
  }

  if (dietTags && dietTags.length) {
    filtered = filtered.filter((snack) =>
      dietTags.every((tag) => snack.dietTags.includes(tag)),
    )
  }

  const sorted = [...filtered]
  sorted.sort((a, b) => {
    switch (sort) {
      case "protein-per-dollar":
        return b.proteinPerDollar - a.proteinPerDollar
      case "calories-asc":
        return a.caloriesPerServing - b.caloriesPerServing
      case "protein-desc":
      default:
        return b.proteinPerServing - a.proteinPerServing
    }
  })

  return sorted
}

