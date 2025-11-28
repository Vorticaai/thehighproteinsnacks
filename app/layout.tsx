/**
 * Root layout wires up global styles, fonts, and default SEO metadata.
 */
import { buildMetadata, defaultMeta } from "@/lib/seo"
import { cn } from "@/lib/utils"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Header } from "@/components/layout/header"
import "./globals.css"
import Script from "next/script"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL("https://www.thehighproteinsnacks.com"),

  ...buildMetadata({
    title: defaultMeta.title,
    description: defaultMeta.description,
  }),

  openGraph: {
    type: "website",
    url: "https://www.thehighproteinsnacks.com",
    siteName: "The High Protein Snacks",
    title: defaultMeta.title,
    description: defaultMeta.description,
    images: [
      {
        url: "/images/og-default.jpg",
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
    images: ["/images/og-default.jpg"],
  },

  alternates: {
    canonical: "https://www.thehighproteinsnacks.com",
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

        {/* --- ✅ GOOGLE ANALYTICS (GA4) --- */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
          strategy="afterInteractive"
        />
        <Script
  src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
  strategy="afterInteractive"
/>

<Script id="ga-init" strategy="afterInteractive">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}

    gtag('js', new Date());

  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
  send_page_view: true,
  debug_mode: true,
  allow_google_signals: true,
  allow_ad_personalization_signals: true
});

  `}
</Script>

        {/* --- END GA4 --- */}

        {/* --- AdSense global script --- */}
        <Script
          id="adsense-script"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4595892489334854"
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
        {/* --- END ADSENSE --- */}

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
                  Independent directory of high-protein snacks — bars, chips & bites — ranked by macros, taste, and value. Updated regularly.
                </p>
                <p className="text-xs text-gray-600 max-w-md">
                  Some links on this site are affiliate links.{" "}
                  <strong>As an Amazon Associate, we earn from qualifying purchases</strong> — 
                  at no extra cost to you. This helps keep our snack rankings independent and ad-free.
                </p>
              </div>

              <nav className="flex flex-col gap-3 text-sm md:flex-row md:gap-6">
                <a href="/how-we-review" className="hover:text-[#C6FF47] transition-colors">Data Accuracy</a>
                <a href="/privacy" className="hover:text-[#C6FF47] transition-colors">Privacy</a>
                <a href="/terms" className="hover:text-[#C6FF47] transition-colors">Terms</a>
              </nav>
            </div>

            <div className="border-t border-white/10 py-4 text-center text-xs text-gray-500">
              © 2025 The High Protein Snacks. Built with 💪 by Solo Vibecoder. 
              This site contains ads and affiliate links — we may earn a small commission if you buy through them, at no extra cost to you.
            </div>
          </footer>

        </div>
      </body>
    </html>
  )
}
