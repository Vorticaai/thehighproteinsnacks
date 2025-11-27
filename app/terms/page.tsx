export const metadata = {
  title: "Terms of Use – The High Protein Snacks",
  description:
    "Read the terms of use and affiliate disclosure for The High Protein Snacks.",
}

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-4 text-4xl font-bold text-gray-900">Terms of Use</h1>
      <p className="mb-8 text-sm text-gray-500">Last updated: 20 November 2025</p>

      <div className="space-y-6 text-gray-700">
        <p>
          Welcome to The High Protein Snacks (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;). By
          accessing or using this website, you agree to be bound by these Terms of Use. If you do
          not agree, please do not use the site.
        </p>

        <section>
          <h2 className="mb-3 text-2xl font-bold text-gray-900">
            1. Informational purposes only – no medical advice
          </h2>
          <p className="mb-3">
            The content on this site is for general informational and educational purposes only. We
            are not doctors, dietitians, or medical professionals.
          </p>
          <ul className="ml-6 list-disc space-y-2">
            <li>
              Always consult a qualified health professional before making changes to your diet,
              exercise, or supplementation.
            </li>
            <li>
              Product macros, prices, and availability may change; always check the current
              packaging and retailer listing before purchasing or consuming any product.
            </li>
          </ul>
        </section>

        <section>
          <h2 id="affiliate-disclosure" className="mb-3 text-2xl font-bold text-gray-900">
            2. Affiliate disclosure
          </h2>
          <p className="mb-3">Some links on this website are affiliate links. This means:</p>
          <ul className="ml-6 list-disc space-y-2">
            <li>
              If you click a link to a retailer (such as Amazon) and make a purchase, we may earn a
              small commission.
            </li>
            <li>
              This comes at no extra cost to you and helps support the running of this site.
            </li>
            <li>
              We only feature products we believe are relevant to high-protein snacking, but you
              should always do your own research before buying.
            </li>
          </ul>
          <p className="mt-3">
            We aim to be transparent about affiliate relationships and only recommend products we
            genuinely consider relevant to the site&apos;s focus.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-bold text-gray-900">3. Third-party sites</h2>
          <p className="mb-3">
            Our site contains links to third-party websites that we do not own or control.
          </p>
          <ul className="ml-6 list-disc space-y-2">
            <li>
              We are not responsible for the content, policies, or practices of any third-party
              website.
            </li>
            <li>
              Any purchase or interaction you have with a third-party site is solely between you and
              that provider.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-bold text-gray-900">4. Accuracy of information</h2>
          <p className="mb-3">
            We try to keep product information (such as macros, ingredients, and prices) accurate
            and up to date, but we cannot guarantee that all information is complete, current, or
            error-free.
          </p>
          <ul className="ml-6 list-disc space-y-2">
            <li>
              Manufacturers may change recipes, packaging, and nutritional information without
              notice.
            </li>
            <li>Prices and availability can change frequently on retailer sites.</li>
          </ul>
          <p className="mt-3">
            You agree that it is your responsibility to verify information directly on the product
            packaging or retailer website before relying on it.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-bold text-gray-900">5. No warranties</h2>
          <p className="mb-3">
            The site is provided &quot;as is&quot; and &quot;as available&quot; without any
            warranties of any kind, express or implied. We do not warrant that:
          </p>
          <ul className="ml-6 list-disc space-y-2">
            <li>The site will be uninterrupted or error-free</li>
            <li>Any defects will be corrected</li>
            <li>The content is complete, accurate, or suitable for your specific situation</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-bold text-gray-900">6. Limitation of liability</h2>
          <p className="mb-3">
            To the maximum extent permitted by law, we shall not be liable for any direct, indirect,
            incidental, consequential, or special damages arising out of or in connection with your
            use of the site, including but not limited to:
          </p>
          <ul className="ml-6 list-disc space-y-2">
            <li>Reliance on any content on this site</li>
            <li>Purchases you make through third-party links</li>
            <li>Any loss of data or profits</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-bold text-gray-900">
            7. Changes to the site and to these terms
          </h2>
          <p>
            We may update, change, or remove content on the site at any time without notice. We may
            also update these Terms from time to time. When we do, we will update the &quot;Last
            updated&quot; date at the top of this page.
          </p>
          <p className="mt-3">
            Your continued use of the site after changes are posted means you accept the revised
            Terms.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-bold text-gray-900">8. Governing law</h2>
          <p>
            These Terms are governed by the laws of New South Wales, Australia, without regard to
            its conflict of law principles. Any disputes arising out of or related to these Terms
            shall be subject to the exclusive jurisdiction of the courts of New South Wales.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-bold text-gray-900">9. Contact</h2>
          // AFTER (shorter)
<p>
  If you have questions about these Terms, please review it carefully before using the site.
</p>

      
        </section>
      </div>
    </main>
  )
}

