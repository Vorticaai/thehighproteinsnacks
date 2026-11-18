import { HALAL_STATUS_LABEL } from "@/lib/halal"
import type { HalalCheck, HalalStatus } from "@/lib/productRecord"

const TONE_CLASS: Record<"strong" | "medium" | "weak" | "none", string> = {
  strong: "border-[#006F6D]/40 bg-[#006F6D]/10 text-[#00504F]",
  medium: "border-sky-300 bg-sky-50 text-sky-900",
  weak: "border-amber-300 bg-amber-50 text-amber-900",
  none: "border-gray-300 bg-gray-100 text-gray-700",
}

export function HalalStatusPill({ status }: { status: HalalStatus }) {
  const s = HALAL_STATUS_LABEL[status]
  return (
    <span
      title={s.long}
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-semibold ${TONE_CLASS[s.tone]}`}
    >
      {s.short}
    </span>
  )
}

const KIND_LABEL = { certifier: "Certifier", brand: "Brand", directory: "Halal directory", retailer: "Retailer", press: "Press" } as const

/** Numbered source links, e.g. "Brand [1] · Retailer [2]". */
export function HalalEvidenceLinks({ check }: { check: HalalCheck }) {
  return (
    <span className="text-xs text-gray-600">
      {check.evidence.map((e, i) => (
        <span key={e.url + i}>
          {i > 0 && " · "}
          <a href={e.url} target="_blank" rel="noopener noreferrer" className="underline" title={e.label}>
            {KIND_LABEL[e.kind]}
          </a>
        </span>
      ))}
    </span>
  )
}

/** Legend explaining every status, in strength order. */
export function HalalStatusLegend() {
  const order: HalalStatus[] = ["certified", "certifier-named", "brand-claim", "not-certified"]
  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {order.map((status) => (
        <div key={status} className="rounded-xl border border-gray-200 bg-white p-3">
          <dt>
            <HalalStatusPill status={status} />
          </dt>
          <dd className="mt-1.5 text-sm text-gray-600">{HALAL_STATUS_LABEL[status].long}</dd>
        </div>
      ))}
    </dl>
  )
}

/** Block for a product page. */
export function HalalCheckBox({ check }: { check: HalalCheck }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-700">
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-semibold text-gray-900">Halal certification</p>
        <HalalStatusPill status={check.status} />
      </div>
      <p className="mt-1">{check.summary}</p>
      {check.certifier && <p className="mt-1">Certifier: {check.certifier}</p>}
      <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-gray-600">
        {check.evidence.map((e, i) => (
          <li key={e.url + i}>
            {e.label}{" "}
            <a href={e.url} target="_blank" rel="noopener noreferrer" className="underline">
              Source
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-gray-500">
        Checked {check.checkedAt}. Certificates expire and recipes change, so look for the certifier&apos;s mark on
        the package. <a href="/snacks/halal" className="underline">How we check halal snacks</a>.
      </p>
    </div>
  )
}

/** Steps for readers to check a snack themselves. */
export function HowToCheckHalal() {
  return (
    <ol className="list-decimal space-y-2 pl-5 text-gray-700">
      <li>
        <strong>Look for a certifier&apos;s mark on the package</strong>, not just the word &ldquo;halal&rdquo;. Common US
        certifiers include IFANCA, ISA, HFSAA, HMS and ISWA.
      </li>
      <li>
        <strong>Check the certifier&apos;s own list</strong> where it publishes one. Certificates cover specific products and
        plants, and they expire.
      </li>
      <li>
        <strong>Don&apos;t treat other marks as halal.</strong> A USDA inspection mark or a kosher mark is not halal
        certification, and &ldquo;halal friendly&rdquo; is a marketing phrase with no certifier behind it.
      </li>
      <li>
        <strong>Read the ingredients</strong> for gelatin, collagen, animal enzymes and alcohol-based flavourings when
        there is no certificate.
      </li>
      <li>
        <strong>Ask the brand</strong> for its current certificate if you are unsure. Certified brands can send one.
      </li>
    </ol>
  )
}
