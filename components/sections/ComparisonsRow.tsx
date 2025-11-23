import Link from "next/link";

const items = [
  {
    title: "Weight Loss vs Keto Snacks",
    description: "When to pick fat-burning keto macros vs tighter calorie control.",
    slug: "best-keto-snacks",
  },
  {
    title: "Budget vs Premium Bars",
    description: "Compare protein-per-dollar vs gourmet textures and flavors.",
    slug: "best-budget-snacks",
  },
  {
    title: "Low Sugar vs High Protein",
    description: "Balance blood sugar control with 20g+ protein servings.",
    slug: "best-low-sugar-high-protein-snacks",
  },
];

export default function ComparisonsRow() {
  return (
    <section className="mb-10">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Popular Comparisons</h2>
        <Link
          href="/guides"
          className="text-sm font-semibold text-[#006F6D] hover:underline"
        >
          View all →
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.slug}
            href={`/guides/${item.slug}`}
            className="rounded-xl border-2 border-[#C6FF47] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg hover:ring-2 hover:ring-[#C6FF47]"
          >
            <p className="text-base font-semibold text-gray-900">{item.title}</p>
            <p className="mt-1 text-sm text-gray-600">{item.description}</p>
            <span className="mt-3 inline-block text-sm font-semibold text-[#006F6D]">
              Read →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}