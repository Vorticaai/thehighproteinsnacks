import Link from "next/link";

const items = [
  {
    title: "Best Snacks for Weight Loss",
    desc: "Low-calorie, low-sugar picks that still taste good.",
    // Standalone page, not /guides/<slug> — the old /guides/ duplicate of
    // this now permanently redirects here (see next.config.mjs); link
    // straight to the real URL instead of through the redirect.
    href: "/best-high-protein-snacks-for-weight-loss",
  },
  {
    title: "Best Value Snack Playbook",
    desc: "Protein-per-dollar rankings for budget-minded shoppers.",
    href: "/guides/best-budget-snacks",
  },
  {
    title: "Low-Sugar Snack Guide",
    desc: "Snacks with 3g of sugar or less per serving.",
    href: "/guides/best-low-sugar-high-protein-snacks",
  },
];

export default function GuidesRow() {
  return (
    <section className="mb-10">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Nutrition Guides</h2>
        <Link
          href="/guides"
          className="text-sm font-semibold text-[#006F6D] hover:underline"
        >
          View all guides →
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-2xl bg-white p-6 shadow-sm border-2 border-[#C6FF47] hover:-translate-y-0.5 hover:shadow-lg hover:ring-2 hover:ring-[#C6FF47] transition"
          >
            <p className="text-base font-semibold text-gray-900">{item.title}</p>
            <p className="mt-1 text-sm text-gray-600">{item.desc}</p>
            <span className="mt-3 inline-block text-sm font-semibold text-[#006F6D]">
              Read →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}