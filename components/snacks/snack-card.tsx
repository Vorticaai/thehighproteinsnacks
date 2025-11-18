/**
 * Shared snack card for featured sections and list displays.
 */
import Image from "next/image"
import Link from "next/link"
import type { Snack } from "@/data/types"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"

type SnackCardProps = {
  snack: Snack
}

export function SnackCard({ snack }: SnackCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden border-gray-100 shadow-sm">
      <div className="relative h-48 w-full">
        <Image
          src={snack.imageUrl}
          alt={snack.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
        />
      </div>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <Badge variant="outline" className="rounded-full px-3">
            {snack.brand}
          </Badge>
          <span className="text-sm font-semibold text-primary">
            ⭐ {snack.rating.toFixed(1)}
          </span>
        </div>
        <h3 className="text-xl font-semibold text-gray-900">{snack.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {snack.description}
        </p>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-2 text-sm">
        <MacroStat label="Protein" value={`${snack.proteinPerServing}g`} />
        <MacroStat label="Calories" value={`${snack.caloriesPerServing}`} />
        <MacroStat label="$/Protein" value={`${snack.proteinPerDollar.toFixed(1)}`} />
      </CardContent>
      <CardFooter className="mt-auto flex items-center justify-between text-sm">
        <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
          {snack.dietTags.slice(0, 2).map((tag) => (
            <span key={tag} className="pill bg-gray-50">
              {tag}
            </span>
          ))}
        </div>
        <Link
          href={`/snack/${snack.id}`}
          className="inline-flex items-center text-primary"
        >
          See details <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </CardFooter>
    </Card>
  )
}

function MacroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-gray-50 px-3 py-2 text-center">
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <p className="text-base font-semibold text-gray-900">{value}</p>
    </div>
  )
}


