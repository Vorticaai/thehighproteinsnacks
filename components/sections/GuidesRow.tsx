// components/sections/GuidesRow.tsx
export default function GuidesRow() {
    const items = [
      {
        title: "How Much Protein Do You Need?",
        desc: "Your daily target based on weight, goal & activity.",
        href: "/guides/how-much-protein-do-you-need",
      },
      {
        title: "Best Snacks for Weight Loss",
        desc: "Low-calorie, low-sugar picks that still taste good.",
        href: "/guides/best-snacks-for-weight-loss",
      },
      {
        title: "Low-Sugar Snack Guide",
        desc: "Avoid insulin spikes with these <2g sugar options.",
        href: "/guides/low-sugar-snacks",
      },
    ];
  
    return (
      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Nutrition Guides</h2>
          <a
            href="/guides"
            className="text-sm font-semibold text-[#006F6D] hover:underline"
          >
            View all guides →
          </a>
        </div>
  
        <div className="grid gap-4 sm:grid-cols-3">
          {items.map((i) => (
            <a
              key={i.href}
              href={i.href}
              className="rounded-2xl bg-white p-6 shadow-sm border-2 border-[#C6FF47] hover:-translate-y-0.5 hover:shadow-lg hover:ring-2 hover:ring-[#C6FF47] transition"

            >
              <p className="text-base font-semibold text-gray-900">{i.title}</p>
              <p className="mt-1 text-sm text-gray-600">{i.desc}</p>
              <span className="mt-3 inline-block text-sm font-semibold text-[#006F6D]">
                Read →
              </span>
            </a>
          ))}
        </div>
      </section>
    );
  }
  