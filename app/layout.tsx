/**
 * Root layout wires up global styles, fonts, and default SEO metadata.
 */
import { buildMetadata, defaultMeta } from "@/lib/seo"
import { cn } from "@/lib/utils"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
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
        {children}
      </body>
    </html>
  )
}
