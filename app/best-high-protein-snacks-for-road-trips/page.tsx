import type { Metadata } from "next"
import { getAllProducts, type Product } from "@/lib/products"
import { SnackCard } from "@/components/snacks/snack-card"
import { Badge } from "@/components/ui/badge"
import CalculatorCTA from "@/components/shared/calculator-cta"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Best High-Protein Snacks for Road Trips & Travel (No Cooler Needed)",
  description:
    "Hand-picked high-protein snacks that travel well, don't melt easily, and keep you full on long drives and flights. Ranked using real macros and fiber content.",
  openGraph: {
    title: "Best High-Protein Snacks for Road Trips & Travel",
    description:
      "Discover the best high-protein snacks for road trips, flights, and long travel days – with macros, fiber, and satiety in mind.",
    url: "https://thehighproteinsnacks.com/best-high-protein-snacks-for-road-trips",
  },
}

interface TravelCandidate {
  snack: Product
  score: number
}

function getTravelFriendlySnacks(): TravelCandidate[] {
  const travelKeywords = ["road-trip", "travel", "on-the-go", "desk-snack"]

  const candidates = getAllProducts().filter((snack) => {
    // Must have at least one travel-related tag in bestFor
    const hasTravelTag = (snack.bestFor ?? []).some((tag) =>
      travelKeywords.includes(tag),
    )
    // Must be in reasonable calorie range for a snack
    const caloriesOk =
      snack.caloriesPerServing >= 120 && snack.caloriesPerServing <= 260

    return hasTravelTag && caloriesOk
  })

  const scored = candidates.map((snack) => ({
    snack,
    score:
      snack.proteinPerServing * 2 -
      snack.sugarPerServing +
      snack.fiberPerServing * 0.5,
  }))

  return scored.sort((a, b) => b.score - a.score).slice(0, 12)
}

export default function BestRoadTripSnacksPage() {
  const travelCandidates = getTravelFriendlySnacks()

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Best high-protein snacks for road trips and travel",
    description:
      "A ranked list of high-protein snacks that travel well for road trips, flights, and long commutes.",
    itemListElement: travelCandidates.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: entry.snack.name,
        url: `https://thehighproteinsnacks.com/snack/${entry.snack.id}`,
        brand: {
          "@type": "Brand",
          name: entry.snack.brand,
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: entry.snack.rating,
          reviewCount: entry.snack.reviewCount,
        },
      },
    })),
  }

  // Helper to get snack descriptions for road trip context
const getTravelNote = (snack: Product): string => {
    const notes: Record<string, string> = {
      "quest-choc-chip-cookie-dough":
        "Individually wrapped, doesn't melt, and packs 21g protein. Perfect for keeping in the glove box or backpack. The soft-baked texture means no crumbs everywhere.",
      "quest-protein-bar-cookies-cream":
        "High protein (21g) with minimal sugar. Stays fresh for weeks without refrigeration. Great for multi-day road trips where you need reliable nutrition.",
      "rxbar-chocolate-sea-salt":
        "Simple ingredient list makes this TSA-friendly and easy to digest during travel. The 12g protein and natural dates provide sustained energy without a sugar crash.",
      "chomps-original-beef-stick":
        "Ultra-portable meat stick that needs zero refrigeration. Perfect for hiking pit stops or when you need quick protein between gas station stops.",
      "epic-bison-cranberry-bar":
        "Real bison meat with cranberries for a savory-sweet combo. Doesn't require refrigeration and provides filling protein for long stretches between meals.",
      "quest-protein-chips-nacho-cheese":
        "Crunchy chip replacement with 19g protein. Resealable bag means you can snack slowly without worrying about stale chips. Much less greasy than regular chips.",
      "wilde-chicken-chips-sea-salt":
        "Chicken-based chips that satisfy salty cravings with 10g protein. Grain-free and paleo-friendly. Great for sharing in the car without the guilt.",
      "shrewd-food-protein-puffs-sour-cream-onion":
        "Light, airy puffs that deliver protein without feeling too heavy. Perfect for munching during long drives when you want flavor without fullness.",
      "iqbar-peanut-butter-chip":
        "Brain-boosting bar with MCTs and low sugar. Ideal for staying alert during long drives. Compact and doesn't crumble in your bag.",
      "built-bar-mint-brownie":
        "Soft texture with real chocolate coating. Satisfies sweet cravings with only 130 calories and 17g protein. Great for late-night drives when you need a treat.",
      "chomps-turkey-jalapeno-stick":
        "Spicy turkey stick that keeps you alert. Zero prep, zero mess, just tear and eat. Perfect for drivers who need hands-free snacking.",
      "rxbar-peanut-butter-chocolate":
        "Nut butter lovers rejoice—this bar combines protein with healthy fats for serious satiety. Won't melt in hot cars like some chocolate bars.",
    }
    return (
      notes[snack.id] ||
      `This ${snack.brand} option delivers ${snack.proteinPerServing}g protein with only ${snack.sugarPerServing}g sugar. Portable, shelf-stable, and perfect for travel.`
    )
  }

  // Get specific recommendations
  const longDrivePicks = travelCandidates
    .filter(
      (c) => c.snack.proteinPerServing >= 15 && c.snack.fiberPerServing >= 5
    )
    .slice(0, 3)

  const kidFriendlyPicks = travelCandidates
    .filter((c) => c.snack.sugarPerServing <= 10 && c.snack.sugarPerServing > 2)
    .slice(0, 3)

  const airportPicks = travelCandidates
    .filter((c) => c.snack.brand === "RXBAR" || c.snack.brand === "Chomps")
    .slice(0, 3)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <Breadcrumbs 
          items={[
            { label: "Home", href: "/" },
            { label: "Guides", href: "/" },
            { label: "Best for Road Trips" }
          ]} 
        />
        
        {/* Hero Section */}
        <div className="mb-12 max-w-3xl">
          <Badge className="mb-4" variant="secondary">
            Travel Guide
          </Badge>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            Best High-Protein Snacks for Road Trips & Travel
          </h1>
          <p className="mb-6 text-lg text-gray-600">
            Finding the right snacks for road trips and travel is tricky—you
            need options that won't melt in a hot car, don't make a mess, and
            actually keep you full between stops. Most gas station snacks are
            loaded with sugar and low in protein, leaving you hungry an hour
            later. This guide features hand-picked high-protein snacks that
            prioritize portability, shelf-stability, and real nutrition to power
            your adventures.
          </p>
        </div>

        {/* How We Picked Section */}
        <section className="mb-16">
          <h2 className="mb-6 text-3xl font-bold text-gray-900">
            How We Picked These Snacks
          </h2>
          <div className="rounded-lg bg-gray-50 p-8">
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="mr-3 text-primary">✓</span>
                <span>
                  <strong>At least 10g protein per serving</strong> – to keep
                  you satisfied and support muscle maintenance during long travel
                  days
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-primary">✓</span>
                <span>
                  <strong>Reasonable calories (120–260 kcal)</strong> – enough
                  to curb hunger without replacing a full meal
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-primary">✓</span>
                <span>
                  <strong>Travel-friendly packaging</strong> – no refrigeration
                  required, minimal mess, won't melt in hot cars or luggage
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-primary">✓</span>
                <span>
                  <strong>Lower sugar, decent fiber</strong> – to avoid energy
                  crashes and keep you feeling full longer between stops
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-primary">✓</span>
                <span>
                  <strong>Real product availability</strong> – all snacks are
                  available in the US and easy to find online or in stores before
                  your trip
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* Ranked List */}
        <section className="mb-16">
          <h2 className="mb-8 text-3xl font-bold text-gray-900">
            Our Top Travel-Friendly High-Protein Snacks
          </h2>
          <div className="space-y-8">
            {travelCandidates.map((entry, index) => (
              <div
                key={entry.snack.id}
                className="rounded-lg border border-gray-200 bg-white p-6"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-white">
                    #{index + 1}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {entry.snack.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {entry.snack.proteinPerServing}g protein •{" "}
                      {entry.snack.caloriesPerServing} cal •{" "}
                      {entry.snack.sugarPerServing}g sugar
                    </p>
                  </div>
                </div>
                <div className="mb-4">
                  <SnackCard snack={entry.snack} />
                </div>
                <p className="text-gray-700">{getTravelNote(entry.snack)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Picks Section */}
        <section className="mb-16">
          <h2 className="mb-8 text-3xl font-bold text-gray-900">Quick Picks</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {/* Long Drives */}
            <div className="rounded-lg border-2 border-primary bg-primary/5 p-6">
              <h3 className="mb-4 text-xl font-semibold text-gray-900">
                Best for Long Drives
              </h3>
              <p className="mb-4 text-sm text-gray-600">
                High protein + fiber = maximum satiety for those 4+ hour
                stretches
              </p>
              <ul className="space-y-2">
                {longDrivePicks.map((pick) => (
                  <li key={pick.snack.id}>
                    <Link
                      href={`/snack/${pick.snack.id}`}
                      className="text-sm text-primary hover:underline"
                    >
                      → {pick.snack.name}
                    </Link>
                    <p className="text-xs text-gray-600">
                      {pick.snack.proteinPerServing}g protein,{" "}
                      {pick.snack.fiberPerServing}g fiber
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Kids */}
            <div className="rounded-lg border-2 border-primary bg-primary/5 p-6">
              <h3 className="mb-4 text-xl font-semibold text-gray-900">
                Best for Kids in the Back Seat
              </h3>
              <p className="mb-4 text-sm text-gray-600">
                Less messy options with moderate sweetness that kids will
                actually eat
              </p>
              <ul className="space-y-2">
                {kidFriendlyPicks.map((pick) => (
                  <li key={pick.snack.id}>
                    <Link
                      href={`/snack/${pick.snack.id}`}
                      className="text-sm text-primary hover:underline"
                    >
                      → {pick.snack.name}
                    </Link>
                    <p className="text-xs text-gray-600">
                      {pick.snack.proteinPerServing}g protein,{" "}
                      {pick.snack.sugarPerServing}g sugar
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Flights */}
            <div className="rounded-lg border-2 border-primary bg-primary/5 p-6">
              <h3 className="mb-4 text-xl font-semibold text-gray-900">
                Best for Flights & Airports
              </h3>
              <p className="mb-4 text-sm text-gray-600">
                Individually wrapped, TSA-friendly, and won't annoy your
                seatmate
              </p>
              <ul className="space-y-2">
                {airportPicks.map((pick) => (
                  <li key={pick.snack.id}>
                    <Link
                      href={`/snack/${pick.snack.id}`}
                      className="text-sm text-primary hover:underline"
                    >
                      → {pick.snack.name}
                    </Link>
                    <p className="text-xs text-gray-600">
                      {pick.snack.caloriesPerServing} cal,{" "}
                      {pick.snack.proteinPerServing}g protein
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Travel Tips Section */}
        <section className="rounded-lg bg-gray-50 p-8">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">
            Travel Snack Tips
          </h2>
          <ul className="space-y-4 text-gray-700">
            <li className="flex items-start">
              <span className="mr-3 mt-1 text-primary">💧</span>
              <div>
                <strong>Pair protein snacks with water</strong> – Protein is
                more filling when you're well-hydrated. Keep a refillable water
                bottle handy to maximize satiety and avoid that dry-mouth
                feeling from bars.
              </div>
            </li>
            <li className="flex items-start">
              <span className="mr-3 mt-1 text-primary">🔄</span>
              <div>
                <strong>Rotate sweet and savory to avoid taste fatigue</strong> –
                Eating the same flavor profile for hours gets boring fast. Pack
                both sweet bars and savory options like meat sticks or protein
                chips.
              </div>
            </li>
            <li className="flex items-start">
              <span className="mr-3 mt-1 text-primary">🌡️</span>
              <div>
                <strong>Avoid super sticky or melty options if driving</strong> –
                Nothing ruins a road trip like chocolate coating melting all over
                your hands at the wheel. Choose bars with minimal coating or
                shelf-stable options.
              </div>
            </li>
            <li className="flex items-start">
              <span className="mr-3 mt-1 text-primary">📦</span>
              <div>
                <strong>Buy in bulk before your trip</strong> – Airport and gas
                station markups are brutal. Order your favorite snacks in bulk
                online before you leave and save 30-50%.
              </div>
            </li>
            <li className="flex items-start">
              <span className="mr-3 mt-1 text-primary">⏰</span>
              <div>
                <strong>Snack proactively, not reactively</strong> – Don't wait
                until you're starving to eat. Snacking every 2-3 hours prevents
                that "pull over at the next fast food place" desperation and
                keeps energy levels stable.
              </div>
            </li>
          </ul>
        </section>

        {/* Calculator CTA */}
        <section className="mt-12">
          <CalculatorCTA />
        </section>
      </div>
    </>
  )
}

