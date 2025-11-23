import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { CategoryPageTemplate } from "../_components/CategoryPageTemplate";

const title = "Best Low-Sugar Snacks";
const description = "High-protein snacks with ≤2g sugar per serving.";

export const metadata: Metadata = buildMetadata({
  title,
  description,
  path: "/snacks/low-sugar",
});

export const revalidate = 21600;

export default function Page() {
  return (
    <CategoryPageTemplate
      slug="low-sugar"
      title={title}
      description={description}
      sortFn={(a, b) =>
        a.sugarPerServing - b.sugarPerServing ||
        b.proteinPerServing - a.proteinPerServing
      }
    />
  );
}


