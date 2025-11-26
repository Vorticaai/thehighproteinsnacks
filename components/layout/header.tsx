import Link from "next/link";
import Image from "next/image";

export function Header() {
  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Calculator", href: "/calculator" },
    { label: "Quiz", href: "/quiz" },
    { label: "Categories", href: "/snacks/weight-loss" },
    { label: "How We Review", href: "/how-we-review" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-20 sm:h-24 items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl">
        <Link href="/" className="flex shrink-0 items-center group">
          <Image
            src="/logo-highproteinsnacks.png"
            alt="The High Protein Snacks"
            width={340}
            height={94}
            priority
            className="h-10 w-auto sm:h-12 md:h-14 lg:h-16 object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        <nav className="hidden md:flex items-center gap-8 lg:gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-gray-700 hover:text-[#006F6D] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="md:hidden rounded-lg p-2 text-gray-700 hover:bg-gray-100"
          aria-label="Open menu"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </header>
  );
}