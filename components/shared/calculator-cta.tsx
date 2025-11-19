"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function CalculatorCTA() {
  return (
    <div className="mt-12 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h3 className="text-2xl font-semibold tracking-tight text-gray-900">
        Not sure how much protein you actually need?
      </h3>
      <p className="mt-2 text-sm text-gray-600">
        Use the High-Protein Intake Calculator to get a daily target based on your weight and
        activity.
      </p>

      <Link
        href="/calculator"
        className="mt-4 inline-flex items-center font-medium text-[#006F6D] hover:underline"
      >
        Calculate my protein target <ArrowRight className="ml-1 h-4 w-4" />
      </Link>
    </div>
  )
}

