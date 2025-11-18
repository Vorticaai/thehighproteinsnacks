/**
 * Small section to highlight top snacks on the homepage.
 */
import { snacks } from "@/data/snacks"
import { SnackCard } from "@/components/snacks/snack-card"

export function FeaturedSnacks() {
  const featured = snacks.slice(0, 3)
  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold text-gray-900">Featured snacks</h2>
        <p className="text-muted-foreground">
          Real data you can sort later—think of this as the editor&apos;s picks.
        </p>
      </header>
      <div className="grid gap-6 md:grid-cols-3">
        {featured.map((snack) => (
          <SnackCard key={snack.id} snack={snack} />
        ))}
      </div>
    </section>
  )
}



