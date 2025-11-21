// components/guides/SnackComparisonTable.tsx
import Link from "next/link"
import type { Snack } from "@/data/types"

type Props = {
  snacks: Snack[]
  title?: string
}

export function SnackComparisonTable({ snacks, title }: Props) {
  if (!snacks || snacks.length === 0) return null

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      {title && (
        <h3 className="mb-4 text-xl font-semibold text-gray-900">{title}</h3>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-300 rounded-xl overflow-hidden">
          <thead>
            <tr className="bg-gray-50 text-left font-semibold text-gray-800">
              <th className="px-3 py-2">Snack</th>
              <th className="px-3 py-2">Protein</th>
              <th className="px-3 py-2">Sugar</th>
              <th className="px-3 py-2">Score</th>
              <th className="px-3 py-2">Calories</th>
              <th className="px-3 py-2">Rating</th>
              <th className="px-3 py-2 whitespace-nowrap">Price</th>
            </tr>
          </thead>
          <tbody>
            {snacks.map((snack) => {
              const score = snack.sugarPerServing
                ? snack.proteinPerServing / snack.sugarPerServing
                : 0

              const link = snack.buyUrl
                ? snack.buyUrl
                : `/snack/${snack.id}`

              return (
                <tr
                  key={snack.id}
                  className="border-t border-gray-200 hover:bg-gray-50 transition"
                >
                  <td className="px-3 py-2 font-medium text-[#006F6D] underline underline-offset-2">
                    <Link href={link} target={snack.buyUrl ? "_blank" : "_self"}>
                      {snack.name}
                    </Link>
                  </td>
                  <td className="px-3 py-2">{snack.proteinPerServing}g</td>
                  <td className="px-3 py-2">{snack.sugarPerServing}g</td>
                  <td className="px-3 py-2 font-semibold">
                    {score.toFixed(1)}
                  </td>
                  <td className="px-3 py-2">{snack.caloriesPerServing}</td>
                  <td className="px-3 py-2">
                    {snack.rating ? `${snack.rating.toFixed(1)} ⭐` : "—"}
                  </td>
                  <td className="px-3 py-2">
                    {snack.pricePerUnit
                      ? `$${snack.pricePerUnit.toFixed(2)}`
                      : "—"}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
