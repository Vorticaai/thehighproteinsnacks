/**
 * Simple blog/article page for SEO experiments.
 */
import { ArticleJsonLd } from "@/components/seo/jsonld"
import { buildMetadata } from "@/lib/seo"

type BlogPageProps = {
  params: { slug: string }
}

function titleCaseFromSlug(slug: string) {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

export function generateMetadata({ params }: BlogPageProps) {
  const title = titleCaseFromSlug(params.slug)
  const description = `A quick guide on ${title.toLowerCase()} from The High Protein Snacks team.`
  return buildMetadata({
    title,
    description,
    path: `/blog/${params.slug}`,
  })
}

export default function BlogPage({ params }: BlogPageProps) {
  const title = titleCaseFromSlug(params.slug)
  const description = `Learn the exact checklist we use to evaluate ${title.toLowerCase()}.`

  const sections = [
    {
      heading: "1. Set your protein targets",
      copy: "Start with the protein window you need per snack (usually 15–25g). It frames every other trade-off.",
    },
    {
      heading: "2. Watch calories and sugar",
      copy: "Pair protein goals with a calorie cap and sugar budget so you compare apples to apples.",
    },
    {
      heading: "3. Filter for diet or lifestyle tags",
      copy: "Vegan, halal, gluten-free—whatever matters to you is baked into the directory filters.",
    },
  ]

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-6 py-10">
      <header className="space-y-4">
        <p className="text-sm font-semibold uppercase text-primary">Guide</p>
        <h1 className="text-3xl font-semibold text-gray-900">{title}</h1>
        <p className="text-lg text-muted-foreground">{description}</p>
      </header>
      <article className="space-y-6 text-base leading-relaxed text-gray-700">
        {sections.map((section) => (
          <section key={section.heading} className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-900">
              {section.heading}
            </h2>
            <p>{section.copy}</p>
          </section>
        ))}
        <section className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-sm">
          <h3 className="text-lg font-semibold text-gray-900">
            Want curated snack picks?
          </h3>
          <p className="text-muted-foreground">
            Head back to the categories to filter by protein, calories, and diet tags.
          </p>
        </section>
      </article>
      <ArticleJsonLd slug={params.slug} title={title} description={description} />
    </main>
  )
}



