"use client"

/**
 * Interactive filter bar for category pages.
 */
import { useRouter, useSearchParams } from "next/navigation"
import * as React from "react"
import type { DietTag } from "@/data/types"
import type { SortOption } from "@/lib/directory"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Toggle } from "@/components/ui/toggle"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const dietOptions: DietTag[] = [
  "vegan",
  "vegetarian",
  "gluten-free",
  "halal",
  "low-sugar",
  "keto",
  "paleo",
]

const sortOptions: Array<{ value: SortOption; label: string }> = [
  { value: "protein-desc", label: "Protein: high → low" },
  { value: "protein-per-dollar", label: "Protein per dollar" },
  { value: "calories-asc", label: "Calories: low → high" },
]

type FilterBarProps = {
  slug: string
  initialMinProtein?: number
  initialMaxCalories?: number
  initialDiets: DietTag[]
  sort: SortOption
}

export function FilterBar({
  slug,
  initialMinProtein,
  initialMaxCalories,
  initialDiets,
  sort,
}: FilterBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [minProtein, setMinProtein] = React.useState(
    initialMinProtein?.toString() ?? "",
  )
  const [maxCalories, setMaxCalories] = React.useState(
    initialMaxCalories?.toString() ?? "",
  )
  const [selectedDiets, setSelectedDiets] = React.useState<DietTag[]>(
    initialDiets,
  )
  const [currentSort, setCurrentSort] = React.useState<SortOption>(sort)
  const [isPending, startTransition] = React.useTransition()

  const dietSet = new Set(selectedDiets)

  const updateUrl = React.useCallback(
    (next: {
      minProtein?: string
      maxCalories?: string
      diets?: DietTag[]
      sort?: SortOption
    }) => {
      const params = new URLSearchParams(searchParams.toString())
      if (next.minProtein !== undefined) {
        next.minProtein ? params.set("minProtein", next.minProtein) : params.delete("minProtein")
      }
      if (next.maxCalories !== undefined) {
        next.maxCalories ? params.set("maxCalories", next.maxCalories) : params.delete("maxCalories")
      }
      if (next.diets) {
        next.diets.length
          ? params.set("diet", next.diets.join(","))
          : params.delete("diet")
      }
      if (next.sort) {
        params.set("sort", next.sort)
      }
      const query = params.toString()
      startTransition(() => {
        router.push(`/category/${slug}${query ? `?${query}` : ""}`)
      })
    },
    [router, searchParams, slug],
  )

  const handleToggleDiet = (diet: DietTag) => {
    const next = dietSet.has(diet)
      ? selectedDiets.filter((tag) => tag !== diet)
      : [...selectedDiets, diet]
    setSelectedDiets(next)
    updateUrl({ diets: next })
  }

  const handleSortChange = (value: SortOption) => {
    setCurrentSort(value)
    updateUrl({ sort: value })
  }

  const handleBlurNumber = () => {
    updateUrl({ minProtein, maxCalories })
  }

  const handleReset = () => {
    setMinProtein("")
    setMaxCalories("")
    setSelectedDiets([])
    setCurrentSort("protein-desc")
    startTransition(() => router.push(`/category/${slug}`))
  }

  return (
    <div className="rounded-3xl border bg-white px-6 py-5 shadow-sm">
      <div className="grid gap-4 md:grid-cols-4">
        <div>
          <p className="text-xs uppercase text-muted-foreground">Min protein</p>
          <Input
            type="number"
            inputMode="decimal"
            placeholder="15"
            value={minProtein}
            onChange={(event) => setMinProtein(event.target.value)}
            onBlur={handleBlurNumber}
          />
        </div>
        <div>
          <p className="text-xs uppercase text-muted-foreground">Max calories</p>
          <Input
            type="number"
            inputMode="decimal"
            placeholder="200"
            value={maxCalories}
            onChange={(event) => setMaxCalories(event.target.value)}
            onBlur={handleBlurNumber}
          />
        </div>
        <div className="md:col-span-2">
          <p className="text-xs uppercase text-muted-foreground">Diet tags</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {dietOptions.map((diet) => (
              <Toggle
                key={diet}
                pressed={dietSet.has(diet)}
                onPressedChange={() => handleToggleDiet(diet)}
              >
                {diet.replace("-", " ")}
              </Toggle>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Select
          value={currentSort}
          onValueChange={(value) => handleSortChange(value as SortOption)}
        >
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Sort snacks" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="ghost" onClick={handleReset} disabled={isPending}>
          Reset
        </Button>
        {isPending && <p className="text-sm text-muted-foreground">Updating…</p>}
      </div>
    </div>
  )
}

