import Link from "next/link";
import type { Product } from "@/lib/products";

type Props = {
  snacks: Product[];
  title?: string;
};

export function BudgetComparisonTable({ snacks, title }: Props) {
  if (!snacks || snacks.length === 0) return null;

  const sorted = [...snacks].sort(
    (a, b) => b.proteinPerDollar - a.proteinPerDollar,
  );

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
            {sorted.map((snack, idx) => (
              <tr key={snack.id} className="border-t border-gray-200">
                <td className="px-3 py-2 font-semibold">#{idx + 1}</td>
                <td className="px-3 py-2 text-[#006F6D] underline underline-offset-2">
                  <Link href={`/snacks/${snack.id}`}>{snack.name}</Link>
                </td>
                <td className="px-3 py-2">{snack.proteinPerServing}g</td>
                <td className="px-3 py-2">
                  {snack.pricePerServing
                    ? `$${snack.pricePerServing.toFixed(2)}`
                    : "—"}
                </td>
                <td className="px-3 py-2 font-semibold">
                  {snack.proteinPerDollar.toFixed(1)}g/$
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
