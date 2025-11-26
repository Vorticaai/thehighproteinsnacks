import Breadcrumbs from "@/components/nav/Breadcrumbs";
import ProductCard from "@/components/snacks/ProductCard";
import { categoryFilters } from "@/lib/categoryFilters";
import { getAllProducts, type Product } from "@/lib/products";
import { absoluteUrl } from "@/lib/seo";
import Script from "next/script";

type SortFn = (a: Product, b: Product) => number;

export function CategoryPageTemplate({
  slug,
  title,
  description,
  sortFn,
}: {
  slug: string;
  title: string;
  description: string;
  sortFn: SortFn;
}) {
  const all = getAllProducts();
  const filterFn = categoryFilters[slug];

  if (!filterFn) {
    return <div className="p-10 text-red-500">Invalid category.</div>;
  }
// --- Fix for "Best Value" category count ---
if (slug === "best-value") {
  const snacks = all.filter((p) => p.proteinPerDollar >= 12).sort((a, b) => b.proteinPerDollar - a.proteinPerDollar);
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Snacks", href: "/snacks" }, { name: title }]} />
      <h1 className="mt-4 text-3xl font-bold">{title}</h1>
      <p className="mt-2 mb-8 text-gray-600">{description}</p>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {snacks.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
}

  const snacks = all.filter(filterFn).sort(sortFn);

  const breadcrumbItems = [
    { name: "Home", href: "/" },
    { name: "Snacks", href: "/snacks" },
    { name: title },
  ];

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

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: snacks.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: product.name,
      url: absoluteUrl(`/snacks/${product.id}`),
    })),
  };

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: absoluteUrl(`/snacks/${slug}`),
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Script
        id={`breadcrumbs-${slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Script
        id={`itemlist-${slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <Script
        id={`webpage-${slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />

      <Breadcrumbs items={breadcrumbItems} />

      <h1 className="mt-4 text-3xl font-bold">{title}</h1>
      <p className="mt-2 mb-8 text-gray-600">{description}</p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {snacks.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
}


