import Link from "next/link"
import type { Snack } from "@/data/types"

type Props = {
  snacks: Snack[]
  title?: string
}

export function BudgetComparisonTable({ snacks, title }: Props) {
  if (!snacks || snacks.length === 0) return null

  const sorted = [...snacks].sort((a, b) => {
    const aVal = a.pricePerUnit
      ? a.proteinPerServing / a.pricePerUnit
      : 0
    const bVal = b.pricePerUnit
      ? b.proteinPerServing / b.pricePerUnit
      : 0
    return bVal - aVal
  })

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      {title && (
        <h3 className="mb-4 text-xl font-semibold text-gray-900">{title}</h3>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-300">
          <thead>
            <tr className="bg-gray-50 text-left font-semibold text-gray-800">
              <th className="px-3 py-2">Rank</th>
              <th className="px-3 py-2">Snack</th>
              <th className="px-3 py-2">Protein</th>
              <th className="px-3 py-2 whitespace-nowrap">Price</th>
              <th className="px-3 py-2 whitespace-nowrap">Value</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((snack, idx) => {
              const value = snack.pricePerUnit
                ? snack.proteinPerServing / snack.pricePerUnit
                : 0

              const link = snack.buyUrl ?? `/snack/${snack.id}`

              return (
                <tr key={snack.id} className="border-t border-gray-200">
                  <td className="px-3 py-2 font-semibold">#{idx + 1}</td>
                  <td className="px-3 py-2 text-[#006F6D] underline underline-offset-2">
                    <Link href={link} target={snack.buyUrl ? "_blank" : "_self"}>
                      {snack.name}
                    </Link>
                  </td>
                  <td className="px-3 py-2">{snack.proteinPerServing}g</td>
                  <td className="px-3 py-2">
                    {snack.pricePerUnit
                      ? `$${snack.pricePerUnit.toFixed(2)}`
                      : "—"}
                  </td>
                  <td className="px-3 py-2 font-semibold">
                    {value.toFixed(1)}g/$
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
