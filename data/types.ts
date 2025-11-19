/**
 * Type definitions for snacks, categories, and supporting content.
 * Keeping everything in one place makes it easy to swap the data layer later.
 */
export type DietTag =
  | "vegan"
  | "vegetarian"
  | "gluten-free"
  | "halal"
  | "kosher"
  | "low-sugar"
  | "keto"
  | "paleo"
  | "dairy-free"
  | "soy-free"
  | "nut-free"

export type CategoryTag =
  | "weight-loss"
  | "budget"
  | "low-calorie"
  | "vegan"
  | "halal"
  | "keto"
  | "gluten-free"
  | "low-sugar"
  | "high-fiber"
  | "paleo"
  | "kids"
  | "travel"
  | "meal-replacement"

export type SnackFaqItem = {
  question: string
  answer: string
}

export type Snack = {
  id: string
  name: string
  slug: string
  brand: string
  categoryTags: CategoryTag[]
  dietTags: DietTag[]
  bestFor: string[]
  proteinPerServing: number
  caloriesPerServing: number
  proteinPerDollar: number
  carbsPerServing: number
  fatsPerServing: number
  sugarPerServing: number
  fiberPerServing: number
  servingSize: string
  pricePerUnit: number
  currency: "USD" | "GBP" | "EUR"
  rating: number
  reviewCount: number
  imageUrl: string
  buyUrl: string
  description: string
  whyGreat: string
  nutritionBreakdown: string
  ingredientsHighlight: string
  shortBenefits: string[]
  faq: SnackFaqItem[]
  isHero?: boolean
}

export type Category = {
  id: string
  slug: CategoryTag
  title: string
  description: string
  primaryKeyword: string
  secondaryKeywords: string[]
  heroCopy: string
}

