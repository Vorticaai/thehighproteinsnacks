import { snacks } from "@/data/snacks"
import type { Snack } from "@/data/types"

export function getLowSugarSnacks(): Snack[] {
  return snacks
    .filter(
      (s) =>
        s.sugarPerServing !== undefined &&
        s.sugarPerServing !== null &&
        s.sugarPerServing <= 5
    )
    .map((s) => ({
      ...s,
      score:
        s.sugarPerServing > 0
          ? s.proteinPerServing / s.sugarPerServing
          : 0,
    }))
    .sort((a, b) => b.score - a.score)
}
