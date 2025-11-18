/**
 * Snack detail layout used on /snack/[slug].
 */
import Link from "next/link"
import type { Snack } from "@/data/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type SnackDetailProps = {
  snack: Snack
}

export function SnackDetail({ snack }: SnackDetailProps) {
  return (
    <section className="space-y-10">
      <header className="space-y-4">
        <Badge variant="secondary" className="rounded-full px-3 py-1">
          {snack.brand}
        </Badge>
        <h1 className="text-3xl font-semibold text-gray-900">{snack.name}</h1>
        <p className="text-lg text-muted-foreground">{snack.description}</p>
        <div className="flex flex-wrap gap-2">
          {snack.dietTags.map((tag) => (
            <span key={tag} className="pill bg-gray-50 capitalize">
              {tag.replace("-", " ")}
            </span>
          ))}
        </div>
        <Button asChild size="lg">
          <Link href={snack.buyUrl} target="_blank" rel="noreferrer">
            Buy for ${snack.pricePerUnit.toFixed(2)} →
          </Link>
        </Button>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Macro breakdown</h2>
          </CardHeader>
          <CardContent>
            <MacroTable snack={snack} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Quick facts</h2>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <QuickFact label="Serving size" value={snack.servingSize} />
            <QuickFact label="Protein per dollar" value={`${snack.proteinPerDollar.toFixed(1)}g`} />
            <QuickFact label="Rating" value={`${snack.rating.toFixed(1)} / 5`} />
            <QuickFact label="Best for" value={snack.bestFor.join(", ")} />
            <div className="space-y-2">
              <p className="text-xs uppercase text-muted-foreground">Benefits</p>
              <ul className="list-disc space-y-1 pl-4 text-muted-foreground">
                {snack.shortBenefits.map((benefit) => (
                  <li key={benefit}>{benefit}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">FAQs</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          {snack.faq.map((item) => (
            <div key={item.question}>
              <p className="font-medium text-gray-900">{item.question}</p>
              <p className="text-sm text-muted-foreground">{item.answer}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  )
}

function MacroTable({ snack }: { snack: Snack }) {
  const rows = [
    { label: "Protein", value: `${snack.proteinPerServing} g` },
    { label: "Calories", value: `${snack.caloriesPerServing}` },
    { label: "Carbs", value: `${snack.carbsPerServing} g` },
    { label: "Fats", value: `${snack.fatsPerServing} g` },
  ]
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Macro</TableHead>
          <TableHead>Per serving</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.label}>
            <TableCell className="font-medium">{row.label}</TableCell>
            <TableCell>{row.value}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function QuickFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-gray-900">{value}</p>
    </div>
  )
}



