import type { Metadata } from "next"
import { Suspense } from "react"
import ManageNotifyClient from "@/components/quiz/ManageNotifyClient"

// Personal link (carries an email + token), not search content.
export const metadata: Metadata = {
  title: "Manage Snack Match Notify | The High Protein Snacks",
  robots: { index: false, follow: false },
}

export default function ManageNotifyPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display mb-6 text-2xl font-bold text-gray-900 md:text-3xl">
        Manage Your Snack Match Notify Preferences
      </h1>
      <Suspense fallback={<p className="text-gray-600">Loading…</p>}>
        <ManageNotifyClient />
      </Suspense>
    </main>
  )
}
