import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { CategoryPageTemplate } from "../_components/CategoryPageTemplate";

const title = "Best Value Snacks";
const description = "Highest protein per dollar right now.";

export const metadata: Metadata = buildMetadata({
  title,
  description,
  path: "/snacks/best-value",
});

export const revalidate = 21600;

export default function Page() {
  return (
    <CategoryPageTemplate
      slug="best-value"
      title={title}
      description={description}
      sortFn={(a, b) => b.proteinPerDollar - a.proteinPerDollar}
    />
  );
}


