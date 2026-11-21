/**
 * Root layout wires up global styles, fonts, and default SEO metadata.
 */
import { defaultMeta } from "@/lib/seo"
import { cn } from "@/lib/utils"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Header } from "@/components/layout/header"
import "./globals.css"
import Script from "next/script"

const inter = Inter({ subsets: ["latin"] })

const SITE_URL = "https://www.thehighproteinsnacks.com"
const GA_ID = process.env.NEXT_PUBLIC_GA_ID

// No canonical here on purpose: a canonical in the root layout is inherited by
// every page that doesn't set its own, which would point them all at one URL.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: defaultMeta.title,
  description: defaultMeta.description,
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "The High Protein Snacks",
    title: defaultMeta.title,
    description: defaultMeta.description,
    images: [
      {
        url: "/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "High protein snacks assortment",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultMeta.title,
    description: defaultMeta.description,
    images: ["/og-default.jpg"],
  },
}

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

        {/* Google Analytics (GA4): only loads when the measurement ID is set */}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', {
                  send_page_view: true,
                  allow_google_signals: true,
                  allow_ad_personalization_signals: true
                });
              `}
            </Script>
          </>
        )}
        {/* --- END GA4 --- */}

        {/* AdSense is approved but switched off until traffic justifies ads.
            To re-enable: restore the adsbygoogle script (publisher
            ca-pub-4595892489334854), add public/ads.txt and set
            NEXT_PUBLIC_ADSENSE_ENABLED=true in Vercel. */}

        <div className="min-h-screen flex flex-col">
          <Header />

          <main className="flex-1">
            {children}
          </main>

          <footer className="border-t bg-[#0B1F1E] text-gray-300">
            <div className="max-w-7xl mx-auto flex flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">The High Protein Snacks</h3>
                <p className="max-w-md text-sm text-gray-400">
                  Independent directory of high-protein snacks — bars, chips & bites — compared by protein, sugar, calories and protein per dollar.
                </p>
                <p className="text-xs text-gray-600 max-w-md">
                  Some links on this site are affiliate links: we may earn a commission if you buy
                  through them, at no extra cost to you. No brand pays to be listed or ranked.
                  Nutrition values and prices can change; always check the package and the retailer.
                </p>
              </div>

              <nav className="flex flex-col gap-3 text-sm md:flex-row md:gap-6">
                <a href="/protein-value-index" className="hover:text-[#C6FF47] transition-colors">Protein Value Index</a>
                <a href="/how-we-review" className="hover:text-[#C6FF47] transition-colors">Data Accuracy</a>
                <a href="/privacy" className="hover:text-[#C6FF47] transition-colors">Privacy</a>
                <a href="/terms" className="hover:text-[#C6FF47] transition-colors">Terms</a>
                <a href="mailto:hello@thehighproteinsnacks.com" className="hover:text-[#C6FF47] transition-colors">
                  hello@thehighproteinsnacks.com
                </a>
              </nav>
            </div>

            <div className="border-t border-white/10 py-4 text-center text-xs text-gray-500">
              © {new Date().getFullYear()} The High Protein Snacks. Built with 💪 by Solo Vibecoder.
            </div>
          </footer>

        </div>
      </body>
    </html>
  )
}
