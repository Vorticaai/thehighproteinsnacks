/**
 * Category definitions for the high-protein snacks directory.
 * Each category targets specific user intents and dietary needs.
 */
import type { Category } from "./types"

export const categories: Category[] = [
  {
    id: "cat-weight-loss",
    slug: "weight-loss",
    title: "Weight Loss High-Protein Snacks",
    description:
      "High-protein snacks with fewer than 200 calories per serving, designed to keep you full longer and support fat loss while preserving lean muscle mass.",
    primaryKeyword: "high protein snacks for weight loss",
    secondaryKeywords: [
      "low calorie protein snacks",
      "protein snacks weight loss",
      "high protein low calorie snacks",
      "best protein snacks for losing weight",
    ],
    heroCopy:
      "Fuel your weight loss journey with snacks that satisfy hunger without sabotaging your calorie goals.",
  },
  {
    id: "cat-keto",
    slug: "keto",
    title: "Keto High-Protein Snacks",
    description:
      "Low-carb, high-fat protein snacks perfect for ketogenic diets. All options feature under 10g net carbs to keep you in ketosis while meeting your protein needs.",
    primaryKeyword: "keto high protein snacks",
    secondaryKeywords: [
      "keto protein bars",
      "low carb protein snacks",
      "ketogenic snacks high protein",
      "keto friendly protein snacks",
    ],
    heroCopy:
      "Stay in ketosis while hitting your protein macros with these delicious low-carb options.",
  },
  {
    id: "cat-vegan",
    slug: "vegan",
    title: "Vegan High-Protein Snacks",
    description:
      "Plant-based protein snacks made without any animal products. Featuring pea, rice, and hemp proteins that deliver complete amino acid profiles for muscle recovery.",
    primaryKeyword: "vegan high protein snacks",
    secondaryKeywords: [
      "plant based protein snacks",
      "vegan protein bars",
      "dairy free protein snacks",
      "vegan high protein foods",
    ],
    heroCopy:
      "Get your protein from plants with these delicious vegan-certified snacks.",
  },
  {
    id: "cat-budget",
    slug: "budget",
    title: "Budget-Friendly High-Protein Snacks",
    description:
      "Affordable protein snacks under $2 per serving that don't compromise on quality or taste. Perfect for students, families, and anyone watching their grocery budget.",
    primaryKeyword: "cheap high protein snacks",
    secondaryKeywords: [
      "affordable protein snacks",
      "budget protein bars",
      "inexpensive high protein snacks",
      "protein snacks on a budget",
    ],
    heroCopy:
      "Maximize your protein intake without breaking the bank with these value picks.",
  },
  {
    id: "cat-low-calorie",
    slug: "low-calorie",
    title: "Low-Calorie High-Protein Snacks",
    description:
      "Ultra-lean protein snacks with fewer than 150 calories per serving. Ideal for aggressive cutting phases or anyone managing strict calorie targets.",
    primaryKeyword: "low calorie high protein snacks",
    secondaryKeywords: [
      "high protein low calorie foods",
      "protein snacks under 100 calories",
      "lean protein snacks",
      "diet friendly protein snacks",
    ],
    heroCopy:
      "Get maximum protein with minimum calories for your cutting phase or weight management goals.",
  },
  {
    id: "cat-gluten-free",
    slug: "gluten-free",
    title: "Gluten-Free High-Protein Snacks",
    description:
      "Certified gluten-free protein snacks safe for celiac disease and gluten sensitivity. Made in dedicated facilities to prevent cross-contamination.",
    primaryKeyword: "gluten free high protein snacks",
    secondaryKeywords: [
      "gluten free protein bars",
      "celiac friendly protein snacks",
      "gluten free high protein foods",
      "protein snacks without gluten",
    ],
    heroCopy:
      "Enjoy worry-free protein snacks that are certified gluten-free and delicious.",
  },
  {
    id: "cat-halal",
    slug: "halal",
    title: "Halal High-Protein Snacks",
    description:
      "Halal-certified protein snacks made without pork, alcohol, or non-halal animal derivatives. Perfect for Muslim consumers seeking compliant nutrition.",
    primaryKeyword: "halal high protein snacks",
    secondaryKeywords: [
      "halal protein bars",
      "muslim protein snacks",
      "halal certified protein foods",
      "halal meat snacks high protein",
    ],
    heroCopy:
      "Meet your protein needs with snacks that align with your halal dietary requirements.",
  },
  {
    id: "cat-low-sugar",
    slug: "low-sugar",
    title: "Low-Sugar High-Protein Snacks",
    description:
      "High-protein snacks with 5g or less sugar per serving. Sweetened with natural alternatives like stevia and allulose to satisfy cravings without blood sugar spikes.",
    primaryKeyword: "low sugar high protein snacks",
    secondaryKeywords: [
      "protein snacks no sugar",
      "sugar free high protein snacks",
      "low glycemic protein snacks",
      "protein bars low sugar",
    ],
    heroCopy:
      "Satisfy your sweet tooth without the sugar crash with these naturally-sweetened options.",
  },
  {
    id: "cat-high-fiber",
    slug: "high-fiber",
    title: "High-Fiber High-Protein Snacks",
    description:
      "Protein snacks with 5g or more fiber per serving to support digestive health, enhance satiety, and regulate blood sugar levels.",
    primaryKeyword: "high fiber high protein snacks",
    secondaryKeywords: [
      "protein snacks with fiber",
      "high protein high fiber bars",
      "fiber rich protein snacks",
      "protein and fiber snacks",
    ],
    heroCopy:
      "Double down on nutrition with snacks that deliver both protein and gut-healthy fiber.",
  },
  {
    id: "cat-paleo",
    slug: "paleo",
    title: "Paleo High-Protein Snacks",
    description:
      "Paleo-friendly protein snacks made with whole foods, grass-fed meats, nuts, and seeds. Free from grains, dairy, legumes, and refined sugars.",
    primaryKeyword: "paleo high protein snacks",
    secondaryKeywords: [
      "paleo protein bars",
      "caveman diet protein snacks",
      "whole food protein snacks",
      "paleo friendly high protein",
    ],
    heroCopy:
      "Fuel your paleo lifestyle with protein snacks made from whole, unprocessed ingredients.",
  },
]
