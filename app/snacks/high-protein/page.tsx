import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { CategoryPageTemplate } from "../_components/CategoryPageTemplate";

const title = "Best High-Protein Snacks";
const description = "20g+ protein per serving picks.";

export const metadata: Metadata = buildMetadata({
  title,
  description,
  path: "/snacks/high-protein",
});

export const revalidate = 21600;

export default function Page() {
  return (
    <CategoryPageTemplate
      slug="high-protein"
      title={title}
      description={description}
      sortFn={(a, b) => b.proteinPerServing - a.proteinPerServing}
    />
  );
}


