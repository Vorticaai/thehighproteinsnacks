import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { CategoryPageTemplate } from "../_components/CategoryPageTemplate";

const title = "Best Snacks for Weight Loss";
const description = "Under 200 calories, hunger-controlling protein picks.";

export const metadata: Metadata = buildMetadata({
  title,
  description,
  path: "/snacks/weight-loss",
});

export const revalidate = 21600;

export default function Page() {
  return (
    <CategoryPageTemplate
      slug="weight-loss"
      title={title}
      description={description}
      sortFn={(a, b) =>
        a.caloriesPerServing - b.caloriesPerServing ||
        b.proteinPerServing - a.proteinPerServing
      }
    />
  );
}


