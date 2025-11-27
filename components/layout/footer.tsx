import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">The High Protein Snacks</h3>
            <p className="mt-2 text-sm text-gray-600">
              Independent directory of high-protein snacks, sorted by macros and value. 
              Powered by AI-curated data.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">Quick Links</h3>
            <ul className="mt-2 space-y-2 text-sm">
              <li><Link href="/snacks" className="text-gray-600 hover:text-[#006F6D]">All Snacks</Link></li>
              <li><Link href="/calculator" className="text-gray-600 hover:text-[#006F6D]">Protein Calculator</Link></li>
              <li><Link href="/quiz" className="text-gray-600 hover:text-[#006F6D]">Snack Finder Quiz</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">Legal & Transparency</h3>
            <ul className="mt-2 space-y-2 text-sm">
              <li><Link href="/how-we-review" className="text-gray-600 hover:text-[#006F6D]">Data Accuracy & Methodology</Link></li>
              <li><Link href="/privacy" className="text-gray-600 hover:text-[#006F6D]">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} The High Protein Snacks. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
