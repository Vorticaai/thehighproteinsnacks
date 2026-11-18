import type { Metadata } from "next"

export const metadata: Metadata = {
  alternates: { canonical: "/how-we-review" },
  title: "Data Accuracy & Methodology | The High Protein Snacks",
  description:
    "Where our nutrition data comes from, how rankings and categories work, and how the site makes money.",
};

export default function HowWeReviewPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-gray-700">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Data Accuracy & Methodology
      </h1>

      <h2 className="mt-8 mb-3 text-xl font-semibold text-gray-900">Where the data comes from</h2>
      <p className="mb-4">
        Nutrition values (protein, calories, carbs, fat, sugar and fiber per serving) were compiled
        from public product listings and brand information, with help from AI research tools. We are
        now re-checking every product against the manufacturer&apos;s own nutrition label and will
        show the source and the date checked for each value as that work is completed.
      </p>
      <p className="mb-4">
        We do not test or taste products, and we do not publish star ratings or reviews.
      </p>

      <h2 className="mt-8 mb-3 text-xl font-semibold text-gray-900">How rankings work</h2>
      <p className="mb-4">
        Rankings and categories use the numbers alone. For example, &ldquo;Low Sugar&rdquo; means 3g
        of sugar or less per serving, &ldquo;High Protein&rdquo; means 20g or more, and &ldquo;Best
        Value&rdquo; ranks snacks by grams of protein per dollar. No brand pays to be listed or ranked.
      </p>

      <h2 className="mt-8 mb-3 text-xl font-semibold text-gray-900">Prices</h2>
      <p className="mb-4">
        Prices per serving are estimates from when each product was added and can be out of date.
        Always check the retailer for the current price.
      </p>

      <h2 className="mt-8 mb-3 text-xl font-semibold text-gray-900">Diet labels</h2>
      <p className="mb-4">
        Gluten-free, halal, vegan and similar labels reflect how a product is described by its brand
        or listing. We have not verified certifications. If you have coeliac disease, an allergy or a
        religious requirement, check the package and the certifier before buying.
      </p>

      <h2 className="mt-8 mb-3 text-xl font-semibold text-gray-900">How we make money</h2>
      <p className="mb-4">
        Some links are affiliate links: we may earn a commission if you buy through them, at no extra
        cost to you. This does not affect which products appear or how they rank.
      </p>

      <p className="mt-6 text-sm text-gray-500">
        <strong>Disclaimer:</strong> This site provides information for general
        educational purposes only. Always check product packaging and consult a
        qualified nutrition professional before making dietary decisions.
      </p>
    </main>
  );
}
