// components/sections/ComparisonsRow.tsx
export default function ComparisonsRow() {
    const items = [
      { title: "Quest Bars vs ONE", href: "/comparisons/quest-vs-one" },
      { title: "Pure Protein vs Premier", href: "/comparisons/pure-protein-vs-premier" },
      { title: "Whey vs Pea Protein", href: "/comparisons/whey-vs-pea" },
    ];
  
    return (
      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Popular Comparisons</h2>
          <a
            href="/comparisons"
            className="text-sm font-semibold text-[#006F6D] hover:underline"
          >
            View all →
          </a>
        </div>
  
        <div className="grid gap-4 sm:grid-cols-3">
          {items.map((i) => (
            <a
              key={i.href}
              href={i.href}
              className="rounded-xl border-2 border-[#C6FF47] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg hover:ring-2 hover:ring-[#C6FF47]"

            >
              <p className="text-base font-semibold text-gray-900">{i.title}</p>
              <p className="mt-1 text-sm text-gray-600">
                Head-to-head taste, macros & value.
              </p>
              <span className="mt-3 inline-block text-sm font-semibold text-[#006F6D]">
                Read →
              </span>
            </a>
          ))}
        </div>
      </section>
    );
  }
  