import type { Metadata } from "next"
import { snacks } from "@/data/snacks"
import { SnackCard } from "@/components/snacks/snack-card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Best High-Protein Snacks for Office & Desk Jobs (No Sugar Crash)",
  description:
    "The best high-protein snacks to keep in your desk drawer: portable, satisfying, and low on sugar crashes. Ranked using real macros and fiber content.",
  openGraph: {
    title: "Best High-Protein Snacks for Office & Desk Jobs",
    description:
      "Discover the best high-protein snacks for office workers and desk jobs – snacks that keep you full and focused without a 3pm crash.",
    url: "https://thehighproteinsnacks.com/best-high-protein-snacks-for-office-and-desk",
  },
}

interface OfficeCandidate {
  snack: (typeof snacks)[0]
  score: number
}

function getOfficeFriendlySnacks(): OfficeCandidate[] {
  const officeKeywords = ["desk-snack", "office-drawer", "study-fuel", "on-the-go"]

  const candidates = snacks.filter((snack) => {
    // Must have at least one office-related tag in bestFor
    const hasOfficeTag = snack.bestFor?.some((tag) =>
      officeKeywords.includes(tag)
    )
    // Must be in reasonable calorie range for a snack
    const caloriesOk =
      snack.caloriesPerServing >= 120 && snack.caloriesPerServing <= 260

    return hasOfficeTag && caloriesOk
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

export default function BestOfficeSnacksPage() {
  const officeCandidates = getOfficeFriendlySnacks()

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Best high-protein snacks for office and desk jobs",
    description:
      "A ranked list of high-protein snacks that are ideal for office workers and desk jobs, optimised for satiety and low sugar crashes.",
    itemListElement: officeCandidates.map((entry, index) => ({
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

  // Helper to get snack descriptions for office context
  const getOfficeNote = (snack: (typeof snacks)[0]): string => {
    const notes: Record<string, string> = {
      "quest-choc-chip-cookie-dough":
        "The ultimate desk drawer staple. Individually wrapped, doesn't need refrigeration, and packs 21g protein to power through afternoon meetings. The soft texture means no loud crunching during video calls, and it stays fresh for weeks in your drawer.",
      "quest-protein-bar-cookies-cream":
        "High protein (21g) with only 1g sugar means no 3pm energy crash. Keep a box in your desk—they won't go bad and you'll always have a satisfying option when the vending machine tempts you with candy bars.",
      "rxbar-chocolate-sea-salt":
        "Clean ingredients make this perfect for health-conscious professionals. The 12g protein from egg whites digests easily, and the date-based sweetness provides steady energy. Plus, the flat package fits perfectly in any desk drawer or laptop bag.",
      "iqbar-peanut-butter-chip":
        "Brain-boosting nutrients (MCTs, omega-3s) plus 12g protein make this ideal for focus-heavy work. Perfect for that mid-afternoon slump when you need both mental clarity and sustained energy. Low sugar means no jitters or crashes.",
      "built-bar-mint-brownie":
        "Satisfies chocolate cravings with only 130 calories and 17g protein. The unique marshmallow texture feels like a treat, which helps you avoid the office candy bowl. Great for afternoon sweet-tooth moments without derailing your nutrition goals.",
      "rxbar-peanut-butter-chocolate":
        "Whole food ingredients (egg whites, dates, peanuts) provide sustained energy without processed junk. Perfect for busy professionals who want clean nutrition. The combination of protein and healthy fats keeps you satisfied for 2-3 hours.",
      "chomps-original-beef-stick":
        "No refrigeration needed, zero mess, and pure protein. Perfect for back-to-back meetings when you need quick fuel. The 10g protein in a tiny package makes it easy to eat at your desk without disrupting your workflow.",
      "quest-protein-chips-nacho-cheese":
        "Replaces afternoon chip cravings with 19g protein. The resealable bag means you can snack slowly throughout the day. Much more satisfying than vending machine chips and won't leave your keyboard greasy.",
      "wilde-chicken-chips-sea-salt":
        "Crunchy, savory, and packed with 10g protein. Perfect for when you're craving something salty but don't want empty carbs. Grain-free means no afternoon bloat or sluggishness.",
      "shrewd-food-protein-puffs-sour-cream-onion":
        "Light and airy—satisfies the urge to munch without weighing you down. Great for extended work sessions when you want something flavorful to nibble on. The protein content keeps hunger at bay without making you feel stuffed.",
      "iqbar-chocolate-sea-salt":
        "Cognitive-supporting ingredients plus low-carb macros help you stay sharp during deadline crunches. The 12g protein and healthy fats provide steady fuel without the sugar crash that regular office snacks cause.",
      "built-bar-salted-caramel":
        "Tastes indulgent but delivers 18g protein with minimal sugar. Perfect for office birthdays and celebrations when you want something sweet but don't want to sabotage your health goals. Fits easily in any desk drawer.",
    }
    return (
      notes[snack.id] ||
      `This ${snack.brand} option provides ${snack.proteinPerServing}g protein with only ${snack.sugarPerServing}g sugar and ${snack.caloriesPerServing} calories. Perfect for keeping in your desk drawer for whenever hunger strikes during the workday.`
    )
  }

  // Get specific recommendations
  const backToBackMeetingPicks = officeCandidates
    .filter(
      (c) => c.snack.proteinPerServing >= 17 && c.snack.fiberPerServing >= 5
    )
    .slice(0, 3)

  const sweetAfternoonPicks = officeCandidates
    .filter(
      (c) =>
        c.snack.sugarPerServing > 3 &&
        c.snack.sugarPerServing <= 14 &&
        (c.snack.name.toLowerCase().includes("chocolate") ||
          c.snack.name.toLowerCase().includes("cookie") ||
          c.snack.name.toLowerCase().includes("caramel") ||
          c.snack.name.toLowerCase().includes("brownie"))
    )
    .slice(0, 3)

  const savouryPicks = officeCandidates
    .filter(
      (c) =>
        c.snack.brand === "Chomps" ||
        c.snack.brand === "Wilde" ||
        c.snack.name.toLowerCase().includes("chips") ||
        c.snack.name.toLowerCase().includes("puffs")
    )
    .slice(0, 3)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="mb-12 max-w-3xl">
          <Badge className="mb-4" variant="secondary">
            Office Guide
          </Badge>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            Best High-Protein Snacks for Office & Desk Jobs
          </h1>
          <p className="mb-6 text-lg text-gray-600">
            We've all been there—the dreaded 3pm energy crash, staring at your
            screen with zero focus, and the vending machine calling your name
            with sugary snacks that'll only make things worse. The solution?
            High-protein, fiber-rich snacks that keep you satisfied, focused, and
            productive throughout the workday. This guide features desk-friendly
            options that won't make a mess, don't need refrigeration, and
            actually deliver sustained energy without the crash.
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
                  <strong>At least 10g protein per serving</strong> (ideally
                  15g+) – to keep you satisfied and prevent that mid-afternoon
                  hunger that leads to poor food choices
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-primary">✓</span>
                <span>
                  <strong>120–260 calories</strong> – substantial enough to curb
                  hunger, but not so much that it replaces lunch or dinner
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-primary">✓</span>
                <span>
                  <strong>Shelf-stable, no refrigeration needed</strong> – can
                  live in your desk drawer for weeks without going bad
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-primary">✓</span>
                <span>
                  <strong>Not super messy or sticky</strong> – you shouldn't need
                  to wash your hands after eating, and your keyboard should stay
                  clean
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-primary">✓</span>
                <span>
                  <strong>Lower sugar, decent fiber</strong> – to avoid blood
                  sugar spikes and crashes that kill your focus and productivity
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* Ranked List */}
        <section className="mb-16">
          <h2 className="mb-8 text-3xl font-bold text-gray-900">
            Our Top High-Protein Office Snacks
          </h2>
          <div className="space-y-8">
            {officeCandidates.map((entry, index) => (
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
                <p className="text-gray-700">{getOfficeNote(entry.snack)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Picks Section */}
        <section className="mb-16">
          <h2 className="mb-8 text-3xl font-bold text-gray-900">
            Quick Picks for Different Workdays
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {/* Back to Back Meetings */}
            <div className="rounded-lg border-2 border-primary bg-primary/5 p-6">
              <h3 className="mb-4 text-xl font-semibold text-gray-900">
                Best for Back-to-Back Meetings
              </h3>
              <p className="mb-4 text-sm text-gray-600">
                Maximum protein and fiber to keep you full through marathon
                meeting days
              </p>
              <ul className="space-y-2">
                {backToBackMeetingPicks.map((pick) => (
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

            {/* Sweet Afternoon Fix */}
            <div className="rounded-lg border-2 border-primary bg-primary/5 p-6">
              <h3 className="mb-4 text-xl font-semibold text-gray-900">
                Best Sweet-But-Healthy Afternoon Fix
              </h3>
              <p className="mb-4 text-sm text-gray-600">
                Satisfy your 3pm chocolate craving without the sugar crash
              </p>
              <ul className="space-y-2">
                {sweetAfternoonPicks.map((pick) => (
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

            {/* Savoury Options */}
            <div className="rounded-lg border-2 border-primary bg-primary/5 p-6">
              <h3 className="mb-4 text-xl font-semibold text-gray-900">
                Best Savoury Desk Snacks
              </h3>
              <p className="mb-4 text-sm text-gray-600">
                For when you want salty, crunchy satisfaction with real protein
              </p>
              <ul className="space-y-2">
                {savouryPicks.map((pick) => (
                  <li key={pick.snack.id}>
                    <Link
                      href={`/snack/${pick.snack.id}`}
                      className="text-sm text-primary hover:underline"
                    >
                      → {pick.snack.name}
                    </Link>
                    <p className="text-xs text-gray-600">
                      {pick.snack.proteinPerServing}g protein,{" "}
                      {pick.snack.caloriesPerServing} cal
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Office Snack Drawer Tips */}
        <section className="rounded-lg bg-gray-50 p-8">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">
            How to Build a Smarter Office Snack Drawer
          </h2>
          <ul className="space-y-4 text-gray-700">
            <li className="flex items-start">
              <span className="mr-3 mt-1 text-primary">🎯</span>
              <div>
                <strong>Keep a mix of bars, nuts, and crunchy options</strong> –
                Eating the same snack every day leads to snack fatigue. Stock
                your drawer with 3-4 different types so you can choose based on
                what you're craving: sweet, salty, crunchy, or chewy.
              </div>
            </li>
            <li className="flex items-start">
              <span className="mr-3 mt-1 text-primary">💧</span>
              <div>
                <strong>Pair snacks with water or tea to feel fuller</strong> –
                Protein is more satisfying when you're hydrated. Keep a water
                bottle at your desk and drink a full glass with your snack to
                maximize satiety and avoid mindless grazing.
              </div>
            </li>
            <li className="flex items-start">
              <span className="mr-3 mt-1 text-primary">⚖️</span>
              <div>
                <strong>Balance sweet and savoury options</strong> – Don't keep
                only chocolate bars or only chips. Having both sweet and savoury
                options prevents flavour fatigue and helps you choose the snack
                that genuinely satisfies your current craving.
              </div>
            </li>
            <li className="flex items-start">
              <span className="mr-3 mt-1 text-primary">🔄</span>
              <div>
                <strong>Rotate your stock every few weeks</strong> – Even
                shelf-stable snacks can go stale or lose appeal. Do a monthly
                audit of your drawer, eat or donate anything that's been sitting
                too long, and try new options to keep things interesting.
              </div>
            </li>
            <li className="flex items-start">
              <span className="mr-3 mt-1 text-primary">🚫</span>
              <div>
                <strong>Avoid the "infinite snack bowl" trap</strong> – Don't
                keep an open bag or box at your desk where you can mindlessly
                graze all day. Instead, take out one snack at a time, close the
                drawer, and eat mindfully. This prevents overconsumption.
              </div>
            </li>
            <li className="flex items-start">
              <span className="mr-3 mt-1 text-primary">💰</span>
              <div>
                <strong>Buy in bulk to save money</strong> – Office snacks add up
                fast if you buy them individually. Order your favourites in bulk
                boxes online and save 30-40% compared to buying single bars at
                the store or vending machine.
              </div>
            </li>
          </ul>
        </section>
      </div>
    </>
  )
}

