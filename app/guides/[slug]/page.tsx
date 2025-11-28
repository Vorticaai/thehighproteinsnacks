import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import Link from "next/link";
import Breadcrumbs from "@/components/nav/Breadcrumbs";
import { getGuideBySlug, getAllGuideSlugs, guides } from "@/data/guides";
import { getAllProducts, type Product } from "@/lib/products";
import { absoluteUrl } from "@/lib/seo";
import { SnackComparisonTable } from "@/components/snacks/SnackComparisonTable";
import ProductCard from "@/components/snacks/ProductCard";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const revalidate = 60 * 60 * 6;

interface GuidePageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const slugs = getAllGuideSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: GuidePageProps): Promise<Metadata> {
  const guide = getGuideBySlug(params.slug);
  if (!guide) {
    return { title: "Guide Not Found", description: "Guide missing" };
  }

  const url = absoluteUrl(`/guides/${params.slug}`);

  return {
    title: `${guide.title} | The High-Protein Snacks`,
    description: guide.metaDescription,
    alternates: { canonical: url },

    openGraph: {
      title: `${guide.title} | The High-Protein Snacks`,
      description: guide.metaDescription,
      url,
      type: "article",
      images: [
        {
          url: `${process.env.NEXT_PUBLIC_SITE_URL}/og-default.jpg`,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: `${guide.title} | The High-Protein Snacks`,
      description: guide.metaDescription,
      images: [`${process.env.NEXT_PUBLIC_SITE_URL}/og-default.jpg`],
    },
  };

  
  
}

const markdownAllowedElements = [
  "p",
  "a",
  "strong",
  "em",
  "ul",
  "ol",
  "li",
  "blockquote",
  "h2",
  "h3",
  "h4",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
] as const;

function sanitizeMarkdown(markdown: string): string {
  return markdown.replace(/```[\s\S]*?```/g, "");
}

type SnackTableRow = {
  name: string;
  netCarbs: number;
  protein: number;
  fat: number;
};

function extractSnackTableData(text: string): SnackTableRow[] {
  const regex = /(.+?)\s*\(~?(\d+)g net carbs.*?(\d+)g protein.*?(\d+)g fat/gi;
  const rows: SnackTableRow[] = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    rows.push({
      name: match[1].trim(),
      netCarbs: Number(match[2]),
      protein: Number(match[3]),
      fat: Number(match[4]),
    });
  }

  return rows;
}

function AutoNutritionTable({ rows }: { rows: SnackTableRow[] }) {
  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b bg-gray-50 font-semibold">
          <th className="p-2 text-left">Snack</th>
          <th className="p-2 text-left">Net Carbs</th>
          <th className="p-2 text-left">Protein</th>
          <th className="p-2 text-left">Fat</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.name} className="border-b">
            <td className="p-2">{row.name}</td>
            <td className="p-2">{row.netCarbs}g</td>
            <td className="p-2">{row.protein}g</td>
            <td className="p-2">{row.fat}g</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function toGuideProducts(ids: string[], products: Product[]) {
  const map = new Map(products.map((p) => [p.id, p]));
  return ids
    .map((id) => map.get(id))
    .filter((p): p is Product => Boolean(p));
}

function getRelatedGuides(currentSlug: string, relatedIds: string[]) {
  const pool = guides.filter((g) => g.slug !== currentSlug);
  const direct = relatedIds
    .map((slug) => pool.find((g) => g.slug === slug))
    .filter((g): g is (typeof guides)[number] => Boolean(g));

  if (direct.length >= 2) return direct.slice(0, 3);

  const remainder = pool.filter(
    (guide) => !direct.some((d) => d.slug === guide.slug),
  );
  return [...direct, ...remainder].slice(0, 3);
}

export default function GuidePage({ params }: GuidePageProps) {
  const guide = getGuideBySlug(params.slug);
  if (!guide) notFound();

  const allProducts = getAllProducts();
  const recommendedProducts = toGuideProducts(
    guide.recommendedSnackIds,
    allProducts,
  );

  const breadcrumbItems = [
    { name: "Home", href: "/" },
    { name: "Guides", href: "/guides" },
    { name: guide.title },
  ];

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.href ? absoluteUrl(item.href) : absoluteUrl(`/guides/${guide.slug}`),
    })),
  };

  const faqJsonLd =
    guide.faqs && guide.faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: guide.faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
          })),
        }
      : null;

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: guide.title,
    description: guide.metaDescription,
    url: absoluteUrl(`/guides/${guide.slug}`),
  };

  const sections = guide.content.sections;
  const relatedGuides = getRelatedGuides(
    guide.slug,
    guide.relatedGuideIds ?? [],
  );

  return (
    <>
      <Script
        id={`guide-${guide.slug}-breadcrumbs`}
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {faqJsonLd ? (
        <Script
          id={`guide-${guide.slug}-faq`}
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      ) : null}
      <Script
        id={`guide-${guide.slug}-webpage`}
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <Breadcrumbs items={breadcrumbItems} />

        <header className="mb-8 mt-2">
          <span className="inline-block rounded-full bg-[#C6F221] px-3 py-1 text-xs font-bold text-black">
            Guide
          </span>
          <h1 className="mb-4 mt-4 text-3xl font-bold">{guide.title}</h1>
          <p className="mb-6 text-gray-600">{guide.description}</p>
          <div className="flex flex-wrap gap-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <span>Updated {guide.updatedDate}</span>
            <span>{guide.readingTimeMinutes} min read</span>
            <span>{guide.recommendedSnackIds.length} featured snacks</span>
          </div>
        </header>

        <div className="mb-8 rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-base leading-relaxed text-gray-700">
            {guide.content.introduction}
          </p>
        </div>

        <div className="mb-12 space-y-8">
          {sections.map((section) => {
            const isComparisonSection = section.type === "comparison";
            const raw = section.content;
            const rows = isComparisonSection ? [] : extractSnackTableData(raw);

            return (
              <section key={section.heading}>
                <h2 className="mb-4 border-b-2 border-[#C6FF47] pb-2 text-2xl font-bold">
                  {section.heading}
                </h2>

                {isComparisonSection ? (
                  <SnackComparisonTable
                    title={section.heading}
                    snacks={recommendedProducts}
                  />
                ) : rows.length > 0 ? (
                  <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <AutoNutritionTable rows={rows} />
                  </div>
                ) : (
                  <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <div className="prose prose-zinc max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        allowedElements={
                          markdownAllowedElements as unknown as string[]
                        }
                      >
                        {sanitizeMarkdown(raw)}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
                {isComparisonSection && recommendedProducts.length > 0 ? (
                  <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {recommendedProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : null}
              </section>
            );
          })}
        </div>

        {recommendedProducts.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-6 border-b-2 border-[#C6FF47] pb-2 text-2xl font-bold">
              Recommended Snacks
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recommendedProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/snacks/${product.id}`}
                  className="rounded-2xl border border-[#C6FF47] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg hover:ring-2 hover:ring-[#C6FF47]"
                >
                  <p className="text-sm font-semibold uppercase text-gray-500">
                    {product.brand}
                  </p>
                  <h3 className="mt-1 text-lg font-bold text-gray-900">
                    {product.name}
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-gray-600">
                    <span className="rounded-full bg-gray-100 px-2 py-1">
                      {product.proteinPerServing}g protein
                    </span>
                    <span className="rounded-full bg-gray-100 px-2 py-1">
                      {product.caloriesPerServing} calories
                    </span>
                    <span className="rounded-full bg-gray-100 px-2 py-1">
                      {product.sugarPerServing}g sugar
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {guide.faqs && guide.faqs.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-6 border-b-2 border-[#C6FF47] pb-2 text-2xl font-bold">
              FAQs
            </h2>
            <div className="space-y-4">
              {guide.faqs.map((faq) => (
                <div
                  key={faq.question}
                  className="rounded-2xl border bg-white p-5 shadow-sm"
                >
                  <p className="text-base font-semibold text-gray-900">
                    {faq.question}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {relatedGuides.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-6 border-b-2 border-[#C6FF47] pb-2 text-2xl font-bold">
              Related Guides
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {relatedGuides.map((related) => (
                <Link
                  key={related.slug}
                  href={`/guides/${related.slug}`}
                  className="rounded-2xl border border-[#C6FF47] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg hover:ring-2 hover:ring-[#C6FF47]"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Guide
                  </p>
                  <h3 className="mt-2 text-base font-bold text-gray-900">
                    {related.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 line-clamp-3">
                    {related.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="h-px bg-gray-200 my-10" />

        <Link href="/guides" className="text-sm font-semibold hover:underline">
          ← Back to all guides
        </Link>
      </main>
    </>
  );
}
