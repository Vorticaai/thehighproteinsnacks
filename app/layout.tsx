/**
 * Root layout wires up global styles, fonts, and default SEO metadata.
 */
import { buildMetadata, defaultMeta } from "@/lib/seo"
import { cn } from "@/lib/utils"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Header } from "@/components/layout/header"
import Link from "next/link"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = buildMetadata({
  title: defaultMeta.title,
  description: defaultMeta.description,
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.className}>
      <body
        className={cn(
          "min-h-screen bg-background font-body text-base text-foreground",
        )}
      >
        <div className="min-h-screen flex flex-col">
          <Header />

          <main className="flex-1">
            {children}
          </main>

          <footer className="border-t bg-slate-50 text-xs text-slate-500">
            <div className="max-w-6xl mx-auto flex flex-col gap-3 px-4 py-6 md:flex-row md:items-center md:justify-between">
              <p>© 2025 The High Protein Snacks. All rights reserved.</p>
              <div className="flex flex-col items-start gap-2 md:flex-row md:items-center md:gap-4">
                <p className="max-w-md">
                  Some links on this site are affiliate links. If you click and buy, we may earn a small commission at no extra cost to you.
                </p>
                <nav className="flex gap-4">
                  <Link href="/privacy" className="hover:underline">
                    Privacy
                  </Link>
                  <Link href="/terms" className="hover:underline">
                    Terms
                  </Link>
                </nav>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
