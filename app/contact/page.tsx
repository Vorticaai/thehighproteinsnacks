export const metadata = {
  alternates: { canonical: "/contact" },
  title: "Contact Us – The High Protein Snacks",
  description:
    "Get in touch with The High Protein Snacks for questions, feedback, product suggestions or partnership enquiries.",
}

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-4 text-4xl font-bold text-gray-900">Contact Us</h1>

      <div className="space-y-6 text-gray-700">
        <p>
          Questions, feedback, product suggestions or partnership enquiries? We&apos;d love to hear
          from you.
        </p>

        <p>
          <a
            href="mailto:hello@thehighproteinsnacks.com"
            className="font-medium text-[#006F6D] underline"
          >
            hello@thehighproteinsnacks.com
          </a>
        </p>

        <p>
          Journalists and publishers: see our{" "}
          <a href="/how-we-review" className="underline">
            data accuracy &amp; methodology
          </a>{" "}
          page for details on how we source and verify our product data, including the{" "}
          <a href="/protein-value-index" className="underline">
            Protein Value Index
          </a>
          .
        </p>

        <p>
          Brands: if you believe a product&apos;s data is out of date or incorrect, or you&apos;d
          like to flag halal certification we may have missed, the same address above is the best
          way to reach us.
        </p>
      </div>
    </main>
  )
}
