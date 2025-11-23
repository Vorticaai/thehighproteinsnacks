"use client";

import Image from "next/image";
import Link from "next/link";
import { snacks } from "@/data/snacks";
import type { Snack } from "@/data/types";

function pickBestValue(snacks: Snack[]) {
  return [...snacks].sort((a, b) => b.proteinPerDollar - a.proteinPerDollar)[0];
}

function pickLowestSugar(snacks: Snack[]) {
  return [...snacks]
    .filter((s) => typeof s.sugarPerServing === "number")
    .sort((a, b) => a.sugarPerServing - b.sugarPerServing)[0];
}

function pickHighestProtein(snacks: Snack[]) {
  return [...snacks].sort(
    (a, b) => b.proteinPerServing - a.proteinPerServing
  )[0];
}

const rankingData = [
  {
    title: "🥇 BEST VALUE",
    pickFn: pickBestValue,
    highlightStat: (s: Snack) => `${s.proteinPerDollar.toFixed(2)}g protein per $1`,
    href: (s: Snack) => `/snack/${s.id}`,
  },
  {
    title: "🥈 BEST LOW SUGAR",
    pickFn: pickLowestSugar,
    highlightStat: (s: Snack) => `${s.sugarPerServing}g sugar`,
    href: (s: Snack) => `/snack/${s.id}`,
  },
  {
    title: "🥉 BEST HIGH PROTEIN",
    pickFn: pickHighestProtein,
    highlightStat: (s: Snack) => `${s.proteinPerServing}g protein`,
    href: (s: Snack) => `/snack/${s.id}`,
  },
];

export default function TopRankingsToday() {
  const winners = rankingData.map((item) => {
    const snack = item.pickFn(snacks);
    return { ...item, snack };
  });

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <h2 className="mb-10 text-center text-3xl font-black text-gray-900">
        Top Rankings Today
      </h2>

      <div className="grid gap-6 md:grid-cols-3">
        {winners.map(({ title, snack, highlightStat, href }) => (
          <Link
            key={title}
            href={href(snack)}
            className="block rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <p className="mb-3 text-sm font-bold uppercase text-gray-700">
              {title}
            </p>

            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                <Image
                  src={snack.imageUrl}
                  alt={snack.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>

              <div className="flex-1">
                <p className="line-clamp-2 font-semibold text-gray-900">
                  {snack.name}
                </p>
                <ul className="mt-2 space-y-1 text-sm text-gray-600">
                  <li className="font-semibold text-[#006F6D]">
                    {highlightStat(snack)}
                  </li>
                  <li>{snack.proteinPerServing}g protein</li>
                  <li>{snack.caloriesPerServing} calories</li>
                  <li>{snack.sugarPerServing}g sugar</li>
                </ul>
              </div>
            </div>

            <div className="mt-4 text-sm font-semibold text-[#006F6D]">
              View Product Details →
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
