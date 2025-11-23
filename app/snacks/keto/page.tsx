import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { CategoryPageTemplate } from "../_components/CategoryPageTemplate";

const title = "Best Keto High-Protein Snacks";
const description =
  "Low net carbs with serious flavor, all under 10g net carbs.";

export const metadata: Metadata = buildMetadata({
  title,
  description,
  path: "/snacks/keto",
});

export const revalidate = 21600;

export default function Page() {
  return (
    <CategoryPageTemplate
      slug="keto"
      title={title}
      description={description}
      sortFn={(a, b) => {
        const netA = a.netCarbs ?? Number.POSITIVE_INFINITY;
        const netB = b.netCarbs ?? Number.POSITIVE_INFINITY;
        return (
          netA - netB || b.proteinPerServing - a.proteinPerServing
        );
      }}
    />
  );
}


