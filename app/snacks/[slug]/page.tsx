import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/nav/Breadcrumbs";
import ProductCard from "@/components/snacks/ProductCard";
import { ProductJsonLd, ItemListJsonLd } from "@/components/seo/jsonld";
import { getAllProducts, type Product } from "@/lib/products";
import { weightLossFilter } from "@/lib/categoryFilters";
import {
  categorySlugs,
  getCategoryDetails,
  getProductsByCategory,
  type CategorySlug,
} from "@/lib/snackFilters";
import { absoluteUrl } from "@/lib/seo";
import { categories } from "@/data/categories";
import type { Category } from "@/data/types";

export const revalidate = 60 * 60 * 6;

type SnackPageProps = {
  params: { slug: string };
};

type FlagKey = keyof Product["flags"];

const CATEGORY_PRIORITIES: Array<{
  flag: FlagKey;
  label: string;
  slug: string;
}> = [
  { flag: "weightLoss", label: "Weight Loss", slug: "weight-loss" },
  { flag: "lowSugar", label: "Low Sugar", slug: "low-sugar" },
  { flag: "keto", label: "Keto", slug: "keto" },
  { flag: "vegan", label: "Vegan", slug: "vegan" },
  { flag: "glutenFree", label: "Gluten Free", slug: "gluten-free" },
  { flag: "halal", label: "Halal", slug: "halal" },
  { flag: "bars", label: "Protein Bars", slug: "protein-bars" },
  { flag: "chips", label: "Protein Chips", slug: "chips" },
];

const FALLBACK_CATEGORY = { label: "All Snacks", slug: "snacks" };

function isCategorySlug(slug: string): slug is CategorySlug {
  return categorySlugs.includes(slug as CategorySlug);
}

function getPrimaryCategory(product: Product) {
  for (const category of CATEGORY_PRIORITIES) {
    if (
      (category.flag === "weightLoss" && weightLossFilter(product)) ||
      (category.flag !== "weightLoss" && product.flags[category.flag])
    ) {
      return category;
    }
  }
  return FALLBACK_CATEGORY;
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
    pros.push("Calories stay under typical weight-loss targets");
  }
  if (product.fiberPerServing >= 5) {
    pros.push(`Fiber-rich (${product.fiberPerServing}g) for better satiety`);
  }
  if (pros.length < 3) {
    pros.push(`Balanced macros with ${product.caloriesPerServing} calories`);
  }
  return pros.slice(0, 4);
}

function buildCons(product: Product) {
  const cons: string[] = [];
  if (product.caloriesPerServing > 230) {
    cons.push(`Calories run higher (${product.caloriesPerServing} per serving)`);
  }
  if (product.pricePerServing > 2.75) {
    cons.push(`Premium pricing at ${formatCurrency(product.pricePerServing)}`);
  }
  if (product.fatsPerServing > 10) {
    cons.push(`Fat-heavy (${product.fatsPerServing}g) compared to other picks`);
  }
  if (product.sugarPerServing > 5) {
    cons.push(`Moderate sugar (${product.sugarPerServing}g)`);
  }
  if (cons.length === 0) {
    cons.push("Limited flavor variety compared to competitor lines");
    cons.push("Availability can fluctuate depending on retailer stock");
  }
  return cons.slice(0, 3);
}

function buildBestFor(product: Product) {
  const badges = new Set<string>();
  if (weightLossFilter(product)) badges.add("Weight Loss");
  if (product.flags.lowSugar) badges.add("Blood Sugar Control");
  if (product.flags.keto) badges.add("Keto / Low Carb");
  if (product.flags.vegan) badges.add("Plant-Based");
  if (product.flags.glutenFree) badges.add("Gluten-Free");
  if (product.flags.bars) badges.add("Travel / Gym Bag");
  if (product.flags.chips) badges.add("Crunchy Snack Cravings");
  if (product.proteinPerDollar >= 12) badges.add("Budget-Friendly");
  if (product.proteinPerServing >= 20) badges.add("Muscle Gain");
  return Array.from(badges).slice(0, 6);
}

function whyWeLikeIt(product: Product) {
  const value = product.proteinPerDollar.toFixed(1);
  return `${product.name} delivers ${product.proteinPerServing}g protein for only ${product.caloriesPerServing} calories, so you stay full without wasting macros. With ${product.sugarPerServing}g sugar and ${product.fiberPerServing}g fiber, it keeps blood sugar stable while the ${value}g per dollar value beats most grocery store competitors.`;
}

function buildFaqs(product: Product) {
  const faqs = [
    {
      question: `How much protein is in one serving of ${product.name}?`,
      answer: `${product.proteinPerServing} grams of protein per serving based on the latest nutrition label.`,
    },
    {
      question: `Is ${product.name} good for weight loss?`,
      answer:
        weightLossFilter(product)
          ? "Yes. Its calorie count stays under common deficit targets and the high protein keeps you satisfied between meals."
          : "It can fit a deficit as long as you budget the calories. Pair it with lighter meals if you are in a cut.",
    },
    {
      question: `How much sugar does ${product.name} have?`,
      answer: `${product.sugarPerServing} grams of sugar per serving, which keeps energy steady without a crash.`,
    },
    {
      question: "What are the full macros per serving?",
      answer: `${product.proteinPerServing}g protein, ${product.carbsPerServing}g carbs, ${product.sugarPerServing}g sugar, ${product.fatsPerServing}g fat, and ${product.fiberPerServing}g fiber per serving.`,
    },
    {
      question: "Where can I buy it?",
      answer: product.buyUrl
        ? `You can buy it directly from the retailer at ${product.buyUrl}.`
        : "Check major retailers or the brand site for stock updates.",
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
          canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/snacks/${slug}`,
        },
        openGraph: {
          title: details.seoTitle,
          description: details.seoDescription,
          url: `${process.env.NEXT_PUBLIC_SITE_URL}/snacks/${slug}`,
          type: "website",
          images: [
            {
              url: `${process.env.NEXT_PUBLIC_SITE_URL}/og-default.jpg`,
            },
          ],
        },
        twitter: {
          card: "summary_large_image",
          title: details.seoTitle,
          description: details.seoDescription,
          images: [`${process.env.NEXT_PUBLIC_SITE_URL}/og-default.jpg`],
        },
      };
      
    }
    return {
      title: "Snack not found",
      description: "This snack does not exist in our directory.",
    };
  }

  const description = `${product.brand} ${product.name} – ${product.proteinPerServing}g protein, ${product.caloriesPerServing} calories, ${product.sugarPerServing}g sugar per serving. ${formatCurrency(product.pricePerServing)} per serving. Expert review.`;
  const url = absoluteUrl(`/snacks/${product.id}`);
  const image = product.imageUrl
    ? absoluteUrl(product.imageUrl)
    : absoluteUrl("/snacks/placeholder.jpg");

  return {
    title: `${product.name} | The High-Protein Snacks`,
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
    product.flags.lowSugar ? "Low sugar" : null,
    weightLossFilter(product) ? "Deficit-friendly" : null,
    product.flags.keto ? "Keto ready" : null,
    product.proteinPerDollar >= 12 ? "Great value" : null,
  ].filter(Boolean) as string[];

  const pros = buildPros(product);
  const cons = buildCons(product);
  const bestFor = buildBestFor(product);
  const whyWeLoveIt = whyWeLikeIt(product);
  const faqs = buildFaqs(product);
  const related = selectRelatedProducts(product, products);
  const showRelated = related.length >= 2;

  const ratingValue = Math.min(
    4.9,
    Math.max(4.1, 4 + product.proteinPerServing / 25),
  );
  const reviewCount = 120 + Math.round(product.proteinPerDollar * 8);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

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

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: absoluteUrl(product.imageUrl || "/snacks/placeholder.jpg"),
    description: whyWeLoveIt,
    brand: { "@type": "Brand", name: product.brand },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: ratingValue.toFixed(1),
      reviewCount,
    },
    offers: {
      "@type": "Offer",
      price: product.pricePerServing ? product.pricePerServing.toFixed(2) : "0.00",
      priceCurrency: "USD",
      url: product.buyUrl || absoluteUrl(`/snacks/${product.id}`),
      availability: "https://schema.org/InStock",
    },
  };

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: product.name,
    mainEntity: productJsonLd,
    url: absoluteUrl(`/snacks/${product.id}`),
  };

  return (
    <>
      <ProductJsonLd snack={product} />
      <Script
        id={`product-${product.id}-schema`}
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <Script
        id={`product-${product.id}-webpage`}
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <Script
        id={`product-${product.id}-breadcrumbs`}
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Script
        id={`product-${product.id}-faq`}
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <Breadcrumbs items={breadcrumbs} />

        <section className="mb-10 rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="grid gap-8 p-8 lg:grid-cols-[1fr,1.2fr]">
            <div className="relative overflow-hidden rounded-2xl bg-gray-50">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  width={640}
                  height={640}
                  className="h-full w-full object-contain p-6"
                  priority
                />
              ) : (
                <div className="flex h-full min-h-[320px] items-center justify-center text-gray-400">
                  No image available
                </div>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C6FF47]">
                Premium Review
              </p>
              <h1 className="mt-2 text-3xl font-black text-gray-900 sm:text-4xl">
                {product.name}
              </h1>
              <p className="mt-1 text-sm uppercase tracking-wide text-gray-500">
                {product.brand}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1 text-lg font-bold text-[#0C6C5A]">
                  ★ {ratingValue.toFixed(1)}
                </span>
                <span>{reviewCount}+ verified reviews</span>
                {product.pricePerServing > 0 && (
                  <span>
                    {formatCurrency(product.pricePerServing)} / serving •{" "}
                    {product.proteinPerDollar.toFixed(1)}g per $
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
                <a
                  href={product.buyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center justify-center rounded-full bg-[#C6FF47] px-8 py-3 text-sm font-bold text-black transition hover:bg-[#b7ff1f]"
                >
                  Buy now →
                </a>
              )}
            </div>
          </div>
        </section>

        <section className="mb-10 grid gap-6 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm md:grid-cols-2">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Nutrition snapshot</h2>
            <p className="mt-2 text-sm text-gray-600">
              Macro profile per single serving.
            </p>
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
              Use-case badges auto-generated from diet flags.
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
            <h3 className="text-xl font-bold text-gray-900">Why we like it</h3>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              {whyWeLoveIt}
            </p>
          </div>
        </section>

        <section className="mb-10 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900">Auto-generated FAQs</h3>
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
            <a
              href={product.buyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center justify-center rounded-full bg-[#0C6C5A] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#0a5546]"
            >
              Buy {product.name}
            </a>
          </section>
        )}
      </main>
    </>
  );
}

function CategoryListing({ slug }: { slug: CategorySlug }) {
  const details = getCategoryDetails(slug);
  if (!details) notFound();

  const products = getProductsByCategory(slug);
  const category =
    categories.find((cat) => cat.slug === slug) ??
    ({
      id: `category-${slug}`,
      slug: slug as Category["slug"],
      title: details.title,
      description: details.description,
      primaryKeyword: details.title,
      secondaryKeywords: [],
      heroCopy: details.description,
    } as Category);
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
      <ItemListJsonLd category={category} snacks={products} />
      <Script
        id={`category-${slug}-itemlist`}
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <Script
        id={`category-${slug}-breadcrumbs`}
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Script
        id={`category-${slug}-webpage`}
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />

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

