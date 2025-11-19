import type { Metadata } from "next"
import Link from "next/link"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"

export const metadata: Metadata = {
  title: "How We Review Snacks | The High Protein Snacks",
  description:
    "Learn how we source, verify, and present nutrition info for high-protein snacks, including limitations and disclaimers.",
  openGraph: {
    title: "How We Review Snacks | The High Protein Snacks",
    description:
      "Learn how we source, verify, and present nutrition info for high-protein snacks, including limitations and disclaimers.",
    type: "website",
  },
}

export default function HowWeReviewPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <Breadcrumbs 
        items={[
          { label: "Home", href: "/" },
          { label: "How We Review" }
        ]} 
      />
      
      {/* Header */}
      <div className="mb-12">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
          How We Review Snacks
        </h1>
        <p className="text-lg text-gray-600">
          Our methodology for sourcing, verifying, and presenting high-protein snack information.
        </p>
      </div>

      {/* Content Sections */}
      <div className="space-y-12">
        {/* Our Goal */}
        <section>
          <h2 className="mb-4 text-2xl font-bold text-gray-900">Our Goal</h2>
          <div className="space-y-4 text-gray-700">
            <p>
              We built The High Protein Snacks to help people quickly compare high-protein snacks
              based on macros, price, diet preferences, and real-world usability. Whether you're
              cutting, bulking, traveling, or just looking for a convenient protein source, we want
              to make it easy to find the right snack for your goals.
            </p>
            <p>
              This is a side project maintained by nutrition enthusiasts, not a medical or
              professional nutrition service. We're here to aggregate information and make
              comparisons easier—not to provide personalized dietary advice.
            </p>
          </div>
        </section>

        {/* Where We Get Data */}
        <section>
          <h2 className="mb-4 text-2xl font-bold text-gray-900">Where We Get Data</h2>
          <div className="space-y-4 text-gray-700">
            <p>
              Nutrition information, pricing, and product details come from multiple sources,
              including:
            </p>
            <ul className="ml-6 list-disc space-y-2">
              <li>Official brand websites and nutrition labels</li>
              <li>Major online retailers like Amazon, with product listings and customer reviews</li>
              <li>Product packaging photography and manufacturer spec sheets</li>
              <li>User submissions and community feedback (where applicable)</li>
            </ul>
            <p>
              We do our best to source accurate, up-to-date information, but formulations and
              prices change frequently. Always verify nutrition facts on the physical product
              packaging before relying on them for medical, dietary, or allergy purposes.
            </p>
          </div>
        </section>

        {/* What "Verified Macros" Means */}
        <section>
          <h2 className="mb-4 text-2xl font-bold text-gray-900">
            What "Verified Macros" Means
          </h2>
          <div className="space-y-4 text-gray-700">
            <p>
              When you see the{" "}
              <span className="inline-flex items-center gap-1 rounded-full border border-[#006F6D]/20 bg-[#006F6D]/5 px-2 py-0.5 text-[11px] font-medium text-[#006F6D]">
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Verified macros
              </span>{" "}
              badge on a snack, it means we have manually checked and recorded complete macro data
              (protein, calories, carbs, fats, sugar, fiber) from a primary source at least once.
            </p>
            <p>
              <strong>However:</strong>
            </p>
            <ul className="ml-6 list-disc space-y-2">
              <li>This data may become outdated as brands reformulate products.</li>
              <li>Regional variations (US vs UK vs Canada, etc.) may differ.</li>
              <li>Serving sizes and flavors within the same product line may vary.</li>
              <li>
                We are <strong>not</strong> a nutrition lab—we're aggregating publicly available
                information.
              </li>
            </ul>
            <p className="text-sm italic">
              Bottom line: Use our data as a starting point for comparisons, but always check the
              package label for the most accurate and current information.
            </p>
          </div>
        </section>

        {/* Limitations & Disclaimers */}
        <section>
          <h2 className="mb-4 text-2xl font-bold text-gray-900">
            Limitations & Disclaimers
          </h2>
          <div className="space-y-4 text-gray-700">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <h3 className="mb-2 font-semibold text-amber-900">
                ⚠️ Not Medical or Nutrition Advice
              </h3>
              <p className="text-sm text-amber-800">
                We are not doctors, registered dietitians, or certified nutritionists. The
                information on this site is for general comparison and educational purposes only.
                If you have specific health concerns, allergies, or dietary needs, please consult
                a qualified healthcare professional.
              </p>
            </div>
            <p>
              <strong>Other important notes:</strong>
            </p>
            <ul className="ml-6 list-disc space-y-2">
              <li>
                <strong>Pricing:</strong> Prices shown are approximate and may vary by retailer,
                location, and time. We use typical online pricing (often Amazon US) as a reference
                point.
              </li>
              <li>
                <strong>Affiliate Links:</strong> Some product links may include affiliate codes,
                meaning we earn a small commission if you make a purchase. This does not affect
                the price you pay or our product recommendations.
              </li>
              <li>
                <strong>Brand Independence:</strong> We are not sponsored by any of the brands
                featured. Product rankings and selections are based on our own criteria (macro
                efficiency, user ratings, availability, etc.).
              </li>
              <li>
                <strong>Allergens & Ingredients:</strong> While we note common diet tags (vegan,
                gluten-free, etc.), we cannot guarantee the absence of cross-contamination or
                hidden allergens. Always read ingredient lists carefully.
              </li>
            </ul>
          </div>
        </section>

        {/* How Often We Update */}
        <section>
          <h2 className="mb-4 text-2xl font-bold text-gray-900">How Often We Update</h2>
          <div className="space-y-4 text-gray-700">
            <p>
              This is a side project, so updates happen periodically rather than in real-time. We
              aim to:
            </p>
            <ul className="ml-6 list-disc space-y-2">
              <li>
                Review and refresh product data every few months, prioritizing popular items.
              </li>
              <li>Add new products as they gain traction in the high-protein snack market.</li>
              <li>
                Respond to user feedback and correction requests (feel free to reach out if you
                spot an error).
              </li>
            </ul>
            <p>
              If you notice outdated information or have suggestions, you can contact us via the
              links in our footer or social channels.
            </p>
          </div>
        </section>

        {/* Final Note */}
        <section className="rounded-xl border border-gray-200 bg-gray-50 p-6">
          <h2 className="mb-3 text-xl font-bold text-gray-900">Final Note</h2>
          <p className="text-gray-700">
            We're passionate about making high-protein snacking easier and more transparent. While
            we strive for accuracy, this site is a tool for comparison—not a replacement for
            reading labels, consulting professionals, or doing your own research. Thank you for
            using The High Protein Snacks, and happy snacking! 🥜
          </p>
        </section>
      </div>
    </main>
  )
}

