export const metadata = {
  title: "Data Accuracy & Methodology | The High Protein Snacks",
  description:
    "Learn how The High Protein Snacks collects, structures, and verifies product data across protein snacks, bars, and chips.",
};

export default function HowWeReviewPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-gray-700">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Data Accuracy & Methodology
      </h1>

      <p className="mb-4">
        The High Protein Snacks directory automatically gathers nutrition,
        ingredient, and pricing data from publicly available sources such as
        brand websites and retailer listings.
      </p>

      <p className="mb-4">
        We do not test or independently verify products. All data is collected
        programmatically and cross-checked by our AI system to ensure reasonable
        consistency. Because formulations and packaging can change, information
        may sometimes be incomplete or outdated.
      </p>

      <p className="mb-4">
        If you notice an error or have updated nutritional information for a
        product, please{" "}
        <a
          href="mailto:support@thehighproteinsnacks.com"
          className="text-[#006F6D] font-semibold hover:underline"
        >
          contact us
        </a>
        . We’ll update the listing as soon as possible.
      </p>

      <p className="mt-6 text-sm text-gray-500">
        <strong>Disclaimer:</strong> This site provides information for general
        educational purposes only. Always check product packaging and consult a
        qualified nutrition professional before making dietary decisions.
      </p>
    </main>
  );
}
