import Link from "next/link";

export default function Hero() {
  return (
    <section className="w-full px-4 sm:px-6 lg:px-8">
      <div className="rounded-[32px] bg-[#0C6C5A] text-white shadow-xl shadow-black/10 px-6 sm:px-10 py-10 sm:py-12 lg:py-14 max-w-7xl mx-auto">
        <div className="max-w-5xl mx-auto">
        {/* Top label */}
        <p className="text-xs font-semibold tracking-[0.25em] text-[#C6F221] mb-4">
          THE HIGH PROTEIN SNACKS
        </p>

        {/* Headline */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight max-w-3xl">
          Compare trusted snacks by protein, calories, price, and diet tags.
        </h1>

        {/* Subheading */}
        <p className="mt-4 text-sm sm:text-base text-teal-50 max-w-3xl">
          Built for nutrition nerds and shoppers who want simple answers fast.
          Filter by macros, diet requirements, and value to find the perfect
          bite for every goal.
        </p>

         {/* Top filter chips */}
         <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href="/snacks/vegan"
             className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-4 py-1 text-xs font-medium text-teal-50 hover:bg-white/10 transition-colors"
           >
             Vegan friendly
           </Link>
          <Link
            href="/snacks/weight-loss"
             className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-4 py-1 text-xs font-medium text-teal-50 hover:bg-white/10 transition-colors"
           >
             Under 200 calories
           </Link>
          <Link
            href="/snacks/budget"
             className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-4 py-1 text-xs font-medium text-teal-50 hover:bg-white/10 transition-colors"
           >
             Best protein per dollar
           </Link>
         </div>

        {/* Primary CTAs */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
           <Link
             href="/snacks"
             className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#0C6C5A] shadow-sm transition-colors hover:bg-white/90"
           >
             Browse all snacks
             <span className="ml-2 text-lg leading-none">→</span>
           </Link>

          <Link
            href="/snacks/weight-loss"
             className="inline-flex items-center justify-center rounded-full bg-[#C6F221] px-6 py-3 text-sm font-semibold text-black shadow-sm hover:bg-[#B6E111] transition-colors"
           >
             View snacks
             <span className="ml-2 text-lg leading-none">→</span>
           </Link>

          <Link
            href="/calculator"
            className="inline-flex items-center justify-center rounded-full border border-[#C6F221] px-6 py-3 text-sm font-semibold text-white hover:bg-white/5 transition-colors"
          >
            Calculate your protein target
          </Link>

          <Link
            href="#how-it-works"
            className="text-sm text-teal-100 underline-offset-4 hover:underline ml-0 sm:ml-4 mt-2 sm:mt-0"
          >
            How the directory works
          </Link>
        </div>

         {/* Bottom category chips */}
         <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href="/snacks/weight-loss"
             className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-4 py-1 text-xs font-medium text-teal-50 hover:bg-white/10 transition-colors"
           >
             Weight Loss High-Protein Snacks
           </Link>
          <Link
            href="/snacks/keto"
             className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-4 py-1 text-xs font-medium text-teal-50 hover:bg-white/10 transition-colors"
           >
             Keto High-Protein Snacks
           </Link>
          <Link
            href="/snacks/vegan"
             className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-4 py-1 text-xs font-medium text-teal-50 hover:bg-white/10 transition-colors"
           >
             Vegan High-Protein Snacks
           </Link>
          <Link
            href="/snacks/budget"
             className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-4 py-1 text-xs font-medium text-teal-50 hover:bg-white/10 transition-colors"
           >
             Budget-Friendly High-Protein Snacks
           </Link>
         </div>
        </div>
      </div>
    </section>
  );
}
