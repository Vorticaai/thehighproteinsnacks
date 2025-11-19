/**
 * Small section to highlight top snacks on the homepage.
 */
import { snacks } from "@/data/snacks"
import { SnackCard } from "@/components/snacks/snack-card"

export function FeaturedSnacks() {
  const featured = snacks.filter(s => s.isHero).slice(0, 4)
  return (
    <>
      {featured.map((snack) => (
        <SnackCard key={snack.id} snack={snack} />
      ))}
    </>
  )
}
