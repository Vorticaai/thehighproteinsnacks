import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/nav/Breadcrumbs";
import ProductCard, { buyLabel } from "@/components/snacks/ProductCard";
import ProductVisual from "@/components/snacks/ProductVisual";
import { NutritionSource } from "@/components/snacks/VerificationNote";
import HalalHub from "@/components/halal/HalalHub";
import { HalalCheckBox } from "@/components/halal/HalalStatus";
import BuyLink from "@/components/snacks/BuyLink";
import { JsonLd } from "@/components/seo/jsonld";
import { getAllProducts, type Product } from "@/lib/products";
import { CATEGORY_THRESHOLDS, categoryFilters, weightLossFilter } from "@/lib/categoryFilters";
import {
  categorySlugs,
  getCategoryDetails,
  getProductsByCategory,
  type CategorySlug,
} from "@/lib/snackFilters";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 60 * 60 * 6;

type SnackPageProps = {
  params: { slug: string };
};

// Breadcrumb category: the first of these the product belongs to.
const CATEGORY_PRIORITIES: Array<{ label: string; slug: string }> = [
  { label: "Weight Loss", slug: "weight-loss" },
  { label: "Low Sugar", slug: "low-sugar" },
  { label: "Keto", slug: "keto" },
  { label: "Vegan", slug: "vegan" },
  { label: "Gluten Free", slug: "gluten-free" },
  { label: "Halal", slug: "halal" },
  { label: "Protein Bars", slug: "protein-bars" },
  { label: "Protein Chips", slug: "chips" },
];

const FALLBACK_CATEGORY = { label: "All Snacks", slug: "snacks" };

function isCategorySlug(slug: string): slug is CategorySlug {
  return categorySlugs.includes(slug as CategorySlug);
}

function getPrimaryCategory(product: Product) {
  return (
    CATEGORY_PRIORITIES.find((c) => categoryFilters[c.slug]?.(product)) ??
    FALLBACK_CATEGORY
  );
}

function formatCurrency(value: number) {
  if (!value || value <= 0) return "—";
  return `$${value.toFixed(2)}`;
}

function buildPros(product: Product) {
  const pros: string[] = [];
  if (product.proteinPerServing >= 20) {
    pros.push(`High protein (${product.proteinPerServing}g per serving)`);
  }
  if (product.sugarPerServing <= 2) {
    pros.push(`Only ${product.sugarPerServing}g sugar`);
  }
  if (product.pricePerServing > 0 && product.proteinPerDollar >= 12) {
    pros.push(
      `Great value (${product.proteinPerDollar.toFixed(1)}g protein per $1)`,
    );
  }
  if (weightLossFilter(product)) {
    pros.push(`Under ${CATEGORY_THRESHOLDS.weightLossMaxCalories} calories per serving`);
  }
  if (product.fiberPerServing >= 5) {
    pros.push(`Fiber-rich (${product.fiberPerServing}g per serving)`);
  }
  if (pros.length < 3) {
    pros.push(`${product.caloriesPerServing} calories per serving`);
  }
  return pros.slice(0, 4);
}

function buildCons(product: Product) {
  const cons: string[] = [];
  if (product.caloriesPerServing > 230) {
    cons.push(`Calories run higher (${product.caloriesPerServing} per serving)`);
  }
  if (product.pricePerServing > 2.75) {
    cons.push(`Higher estimated price (${formatCurrency(product.pricePerServing)} per serving)`);
  }
  if (product.fatsPerServing > 10) {
    cons.push(`Fat-heavy (${product.fatsPerServing}g) compared to other picks`);
  }
  if (product.sugarPerServing > 5) {
    cons.push(`Moderate sugar (${product.sugarPerServing}g)`);
  }
  if (cons.length === 0) {
    cons.push("No drawbacks on the nutrition numbers we track");
  }
  return cons.slice(0, 3);
}

function buildBestFor(product: Product) {
  const badges = new Set<string>();
  if (weightLossFilter(product)) badges.add("Calorie Tracking");
  if (product.sugarPerServing <= CATEGORY_THRESHOLDS.lowSugarMaxSugarG) badges.add("Low Sugar");
  if (product.flags.vegan) badges.add("Plant-Based");
  if (product.flags.glutenFree) badges.add("Gluten-Free");
  if (product.flags.bars) badges.add("Travel / Gym Bag");
  if (product.flags.chips) badges.add("Crunchy Snack Cravings");
  if (product.proteinPerDollar >= 12) badges.add("Budget-Friendly");
  if (product.proteinPerServing >= CATEGORY_THRESHOLDS.highProteinMinProteinG) badges.add("20g+ Protein");
  return Array.from(badges).slice(0, 6);
}

function whyWeLikeIt(product: Product) {
  const value = product.proteinPerDollar.toFixed(1);
  const valueText =
    product.pricePerServing > 0
      ? ` At an estimated ${formatCurrency(product.pricePerServing)} per serving, that is about ${value}g of protein per dollar.`
      : "";
  return `${product.name} lists ${product.proteinPerServing}g protein, ${product.caloriesPerServing} calories, ${product.sugarPerServing}g sugar and ${product.fiberPerServing}g fiber per serving.${valueText}`;
}

function buildFaqs(product: Product) {
  const faqs = [
    {
      question: `How much protein is in one serving of ${product.name}?`,
      answer:
        product.verification.status === "verified"
          ? `${product.proteinPerServing} grams of protein per serving${product.servingSize ? ` (${product.servingSize})` : ""}, matching the manufacturer label data we checked.`
          : `${product.proteinPerServing} grams of protein per serving, according to our original research. Check the package for the current label.`,
    },
    {
      question: `Is ${product.name} good for weight loss?`,
      answer: `It has ${product.caloriesPerServing} calories and ${product.proteinPerServing}g protein per serving. No single food causes weight loss; what matters is your overall diet. Ask a doctor or dietitian for personal advice.`,
    },
    {
      question: `How much sugar does ${product.name} have?`,
      answer: `${product.sugarPerServing} grams of sugar per serving.`,
    },
    {
      question: "What are the full macros per serving?",
      answer: `${product.proteinPerServing}g protein, ${product.carbsPerServing}g carbs, ${product.sugarPerServing}g sugar, ${product.fatsPerServing}g fat, and ${product.fiberPerServing}g fiber per serving.`,
    },
    {
      question: "Where can I buy it?",
      answer: "It is sold by major online retailers, including Amazon, and often in grocery stores. Use the button on this page to check the current price.",
    },
  ];
  return faqs.slice(0, 5);
}

function selectRelatedProducts(product: Product, products: Product[]) {
  const others = products.filter((p) => p.id !== product.id);
  const sameBrand = others
    .filter((p) => p.brand === product.brand)
    .slice(0, 2);

  const matchingFlags = others
    .filter((p) => {
      const shared =
        Object.entries(product.flags).filter(
          ([flag, enabled]) => enabled && p.flags[flag as keyof typeof p.flags],
        ).length || 0;
      return shared >= 2;
    })
    .slice(0, 3);

  const combined: Product[] = [];
  sameBrand.forEach((p) => {
    if (!combined.find((item) => item.id === p.id)) combined.push(p);
  });
  matchingFlags.forEach((p) => {
    if (!combined.find((item) => item.id === p.id)) combined.push(p);
  });

  return combined.slice(0, 4);
}

export async function generateStaticParams() {
  const products = getAllProducts();
  const productParams = products.map((product) => ({ slug: product.id }));
  const categoryParams = categorySlugs.map((slug) => ({ slug }));
  return [...productParams, ...categoryParams];
}

export async function generateMetadata({
  params,
}: SnackPageProps): Promise<Metadata> {
  const slug = params.slug;
  const product = getAllProducts().find((p) => p.id === slug);
  if (!product) {
    if (isCategorySlug(slug)) {
      const details = getCategoryDetails(slug);
      if (!details) {
        return { title: "Category not found", description: "Missing category" };
      }
      const url = absoluteUrl(`/snacks/${slug}`);
      return {
        title: details.seoTitle,
        description: details.seoDescription,
        alternates: {
          canonical: url,
        },
        openGraph: {
          title: details.seoTitle,
          description: details.seoDescription,
          url,
          type: "website",
          images: [{ url: absoluteUrl("/og-default.jpg") }],
        },
        twitter: {
          card: "summary_large_image",
          title: details.seoTitle,
          description: details.seoDescription,
          images: [absoluteUrl("/og-default.jpg")],
        },
      };
      
    }
    return {
      title: "Snack not found",
      description: "This snack does not exist in our directory.",
    };
  }

  const description = `${product.brand} ${product.name} – ${product.proteinPerServing}g protein, ${product.caloriesPerServing} calories, ${product.sugarPerServing}g sugar per serving. Compare macros and protein per dollar.`;
  const url = absoluteUrl(`/snacks/${product.id}`);
  const image = absoluteUrl(product.image?.src || "/og-default.jpg");

  return {
    title: `${product.name}: Protein, Calories & Sugar`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${product.name} | The High-Protein Snacks`,
      description,
      url,
      type: "website",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | The High-Protein Snacks`,
      description,
      images: [image],
    },
  };
}

export default function SnackDetailPage({ params }: SnackPageProps) {
  const slug = params.slug;
  const products = getAllProducts();
  const product = products.find((p) => p.id === slug);
  if (!product) {
    if (isCategorySlug(slug)) {
      return <CategoryListing slug={slug as CategorySlug} />;
    }
    notFound();
  }

  const category = getPrimaryCategory(product);
  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Snacks", href: "/snacks" },
    {
      name: category.label,
      href:
        category.slug === "snacks"
          ? "/snacks"
          : `/snacks/${category.slug}`,
    },
    { name: product.name },
  ];

  const badgeHighlights = [
    `${product.proteinPerServing}g protein`,
    product.sugarPerServing <= CATEGORY_THRESHOLDS.lowSugarMaxSugarG ? "Low sugar" : null,
    weightLossFilter(product) ? `Under ${CATEGORY_THRESHOLDS.weightLossMaxCalories} cal` : null,
    product.proteinPerDollar >= CATEGORY_THRESHOLDS.bestValueMinProteinPerDollar ? "Good value" : null,
  ].filter(Boolean) as string[];

  const pros = buildPros(product);
  const cons = buildCons(product);
  const bestFor = buildBestFor(product);
  const whyWeLoveIt = whyWeLikeIt(product);
  const faqs = buildFaqs(product);
  const related = selectRelatedProducts(product, products);
  const showRelated = related.length >= 2;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: crumb.href ? absoluteUrl(crumb.href) : absoluteUrl(`/snacks/${product.id}`),
    })),
  };

  // No ratings, reviews or offers: we have none of our own, and invented
  // ones break Google's structured-data policies.
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: whyWeLoveIt,
    brand: { "@type": "Brand", name: product.brand },
    ...(product.image ? { image: absoluteUrl(product.image.src) } : {}),
    ...(product.gtin && product.verification.status === "verified" ? { gtin: product.gtin } : {}),
    url: absoluteUrl(`/snacks/${product.id}`),
    nutrition: {
      "@type": "NutritionInformation",
      proteinContent: `${product.proteinPerServing} g`,
      calories: `${product.caloriesPerServing} calories`,
      sugarContent: `${product.sugarPerServing} g`,
      carbohydrateContent: `${product.carbsPerServing} g`,
      fatContent: `${product.fatsPerServing} g`,
      fiberContent: `${product.fiberPerServing} g`,
    },
  };

  return (
    <>
      <JsonLd data={productJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <Breadcrumbs items={breadcrumbs} />

        <section className="mb-10 rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="grid gap-8 p-8 lg:grid-cols-[1fr,1.2fr]">
            <div className="relative overflow-hidden rounded-2xl">
              <ProductVisual product={product} size="lg" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C6FF47]">
                Product profile
              </p>
              <h1 className="mt-2 text-3xl font-black text-gray-900 sm:text-4xl">
                {product.name}
              </h1>
              <p className="mt-1 text-sm uppercase tracking-wide text-gray-500">
                {product.brand}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                {product.pricePerServing > 0 && (
                  <span>
                    Est. {formatCurrency(product.pricePerServing)} / serving •{" "}
                    {product.proteinPerDollar.toFixed(1)}g protein per $
                  </span>
                )}
              </div>

              {badgeHighlights.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {badgeHighlights.map((badge) => (
                    <span
                      key={badge}
                      className="rounded-full border border-[#C6FF47] bg-[#C6FF47]/10 px-3 py-1 text-xs font-semibold text-gray-900"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              )}

              <p className="mt-5 text-base leading-relaxed text-gray-600">
                {whyWeLoveIt}
              </p>

              {product.buyUrl && (
                <BuyLink
                  href={product.buyUrl}
                  productName={product.name}
                  productId={product.id}
                  className="mt-6 inline-flex items-center justify-center rounded-full bg-[#C6FF47] px-8 py-3 text-sm font-bold text-black transition hover:bg-[#b7ff1f]"
                >
                  {buyLabel(product)} →
                </BuyLink>
              )}
              <p className="mt-3 text-xs text-gray-500">
                {product.pricePerServing > 0
                  ? "Prices are estimates from when we added this product and change often. "
                  : "We don't have a price for this product yet. "}
                {/[?&]tag=/.test(product.buyUrl)
                  ? "We may earn a commission if you buy through this link."
                  : "We don't earn anything from this link."}
              </p>
            </div>
          </div>
        </section>

        <section className="mb-10 grid gap-6 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm md:grid-cols-2">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Nutrition snapshot</h2>
            <p className="mt-2 text-sm text-gray-600">
              Per serving{product.servingSize ? ` (${product.servingSize})` : ""}.
            </p>
            <div className="mt-4">
              <NutritionSource product={product} />
              {product.halal && (
                <div className="mt-3">
                  <HalalCheckBox check={product.halal} />
                </div>
              )}
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-2xl border bg-gray-50 p-4 text-center">
                <dt className="text-xs uppercase tracking-wide text-gray-500">
                  Protein
                </dt>
                <dd className="text-2xl font-bold text-gray-900">
                  {product.proteinPerServing}g
                </dd>
              </div>
              <div className="rounded-2xl border bg-gray-50 p-4 text-center">
                <dt className="text-xs uppercase tracking-wide text-gray-500">
                  Calories
                </dt>
                <dd className="text-2xl font-bold text-gray-900">
                  {product.caloriesPerServing}
                </dd>
              </div>
              <div className="rounded-2xl border bg-gray-50 p-4 text-center">
                <dt className="text-xs uppercase tracking-wide text-gray-500">
                  Sugar
                </dt>
                <dd className="text-2xl font-bold text-gray-900">
                  {product.sugarPerServing}g
                </dd>
              </div>
              <div className="rounded-2xl border bg-gray-50 p-4 text-center">
                <dt className="text-xs uppercase tracking-wide text-gray-500">
                  Carbs
                </dt>
                <dd className="text-2xl font-bold text-gray-900">
                  {product.carbsPerServing}g
                </dd>
              </div>
              <div className="rounded-2xl border bg-gray-50 p-4 text-center">
                <dt className="text-xs uppercase tracking-wide text-gray-500">
                  Fat
                </dt>
                <dd className="text-2xl font-bold text-gray-900">
                  {product.fatsPerServing}g
                </dd>
              </div>
              <div className="rounded-2xl border bg-gray-50 p-4 text-center">
                <dt className="text-xs uppercase tracking-wide text-gray-500">
                  Fiber
                </dt>
                <dd className="text-2xl font-bold text-gray-900">
                  {product.fiberPerServing}g
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900">Pros & Cons</h2>
            <div className="mt-4 grid gap-4 text-sm">
              <div className="rounded-2xl border border-[#C6FF47] bg-[#F7FFE5] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#0C6C5A]">
                  Pros
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-gray-700">
                  {pros.map((pro) => (
                    <li key={pro}>{pro}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Cons
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-gray-700">
                  {cons.map((con) => (
                    <li key={con}>{con}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900">Best for</h3>
            <p className="mt-2 text-sm text-gray-600">
              Based on the nutrition numbers above.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {bestFor.map((badge) => (
                <span
                  key={badge}
                  className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-800"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900">Summary</h3>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              {whyWeLoveIt}
            </p>
          </div>
        </section>

        <section className="mb-10 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900">Quick answers</h3>
          <div className="mt-4 space-y-4">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="rounded-2xl border border-gray-100 bg-gray-50 p-4"
              >
                <summary className="cursor-pointer text-sm font-semibold text-gray-900">
                  {faq.question}
                </summary>
                <p className="mt-2 text-sm text-gray-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {showRelated && (
          <section className="mb-10">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Related snacks</h3>
              <Link
                href="/snacks"
                className="text-sm font-semibold text-[#0C6C5A] hover:underline"
              >
                View all →
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {related.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </section>
        )}

        {product.buyUrl && (
          <section className="rounded-3xl border border-gray-200 bg-white p-6 text-center shadow-sm">
            <h3 className="text-xl font-bold text-gray-900">
              Ready to stock up?
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Tap below to check the latest price and availability.
            </p>
            <BuyLink
              href={product.buyUrl}
              productName={product.name}
              productId={product.id}
              className="mt-4 inline-flex items-center justify-center rounded-full bg-[#0C6C5A] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#0a5546]"
            >
              Check price for {product.name}
            </BuyLink>
          </section>
        )}
      </main>
    </>
  );
}

// Deep-content guide for this category, where one exists. These pages
// used to have no link to or from the matching /snacks/<category> filter
// page — two pages on the same topic with nothing connecting them.
const CATEGORY_GUIDE_LINKS: Partial<Record<CategorySlug, { href: string; label: string }>> = {
  "weight-loss": { href: "/best-high-protein-snacks-for-weight-loss", label: "Read our full weight-loss snack guide" },
  "keto": { href: "/best-high-protein-snacks-for-keto", label: "Read our full keto snack guide" },
  "low-sugar": { href: "/guides/best-low-sugar-high-protein-snacks", label: "Read our full low-sugar snack guide" },
  "best-value": { href: "/guides/best-budget-snacks", label: "Read our full best-value snack guide" },
  "vegan": { href: "/guides/best-vegan-high-protein-snacks", label: "Read our full vegan snack guide" },
};

function CategoryListing({ slug }: { slug: CategorySlug }) {
  const details = getCategoryDetails(slug);
  if (!details) notFound();
  if (slug === "halal") {
    return <HalalHub title={details.title} description={details.seoDescription} />;
  }

  const products = getProductsByCategory(slug);
  const guideLink = CATEGORY_GUIDE_LINKS[slug];
  const breadcrumbItems = [
    { name: "Home", href: "/" },
    { name: "Snacks", href: "/snacks" },
    { name: details.title },
  ];

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: details.title,
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: product.name,
      url: absoluteUrl(`/snacks/${product.id}`),
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.href ? absoluteUrl(item.href) : absoluteUrl(`/snacks/${slug}`),
    })),
  };

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: details.title,
    description: details.description,
    url: absoluteUrl(`/snacks/${slug}`),
  };

  return (
    <>
      <JsonLd data={itemListJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={webPageJsonLd} />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <Breadcrumbs items={breadcrumbItems} />
        <header className="mb-10 max-w-3xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#006F6D]">
            Snack Directory
          </p>
          <h1 className="font-display mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
            {details.title}
          </h1>
          <p className="text-lg text-gray-600">{details.description}</p>
          {guideLink && (
            <Link
              href={guideLink.href}
              className="mt-4 inline-flex items-center font-semibold text-[#006F6D] hover:underline"
            >
              {guideLink.label} →
            </Link>
          )}
        </header>

        {products.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-600">
            No snacks are flagged for this category yet. Check back soon!
          </div>
        )}
      </main>
    </>
  );
}

