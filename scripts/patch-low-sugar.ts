import fs from "fs";
import path from "path";
import Papa from "papaparse";

const IDS_TO_ENABLE = new Set<string>([
  "quest-choc-chip-cookie-dough",
  "quest-cookies-cream",
  "quest-peanut-butter-cup",
  "quest-birthday-cake",
  "quest-cheddar-blast-chips",
  "quest-protein-chips-nacho-cheese",
  "iqbar-peanut-butter-chip",
  "iqbar-chocolate-sea-salt",
  "chomps-original-beef-stick",
  "chomps-turkey-jalapeno-stick",
  "whisps-parmesan-cheese-crisps",
  "magic-spoon-peanut-butter-cereal",
  "quest-ranch-protein-chips",
  "quest-choc-chunk-cookie",
  "quest-peanut-butter-cookie",
  "iqbar-blueberry-lemon",
  "chomps-turkey-jerky-meat-stick",
  "twin-peaks-protein-puffs-bbq",
  "quest-nutrition-protein-puffs-ranch",
  "magic-spoon-protein-cereal-frosted",
  "one-bar-birthday-cake",
  "barebells-cookies-cream",
  "think-high-protein-brownie-crunch",
  "wilde-chicken-chips-buffalo",
  "no-cow-protein-bar-chocolate-fudge",
  "atkins-protein-meal-bar",
  "quest-protein-chips-chili-lime",
  "premier-protein-chocolate",
  "premier-protein-vanilla",
  "pure-protein-shake-frosty-chocolate",
  "muscle-milk-pro-series-40",
  "ensure-max-protein-milk-chocolate",
  "iconic-protein-shake-cacao",
]);

const CSV_PATH = path.join(process.cwd(), "data", "products.csv");
const csv = fs.readFileSync(CSV_PATH, "utf8");

type Row = {
  ID: string;
  Product_Name: string;
  Brand: string;
  proteinPerServing: string;
  caloriesPerServing: string;
  carbsPerServing: string;
  fatsPerServing: string;
  sugarPerServing: string;
  fiberPerServing: string;
  pricePerServing: string;
  buyUrl: string;
  imageFileName: string;
  isWeightLoss: string;
  isHighProtein: string;
  isLowCarb: string;
  isKeto: string;
  isLowSugar: string;
  isGlutenFree: string;
  isVegan: string;
  isBars: string;
  isChips: string;
};

const parsed = Papa.parse<Row>(csv, { header: true, skipEmptyLines: true });

let changed = 0;
const rows = parsed.data.map((row) => {
  if (!row || !row.ID) return row;
  const id = row.ID.trim();
  if (IDS_TO_ENABLE.has(id)) {
    if ((row.isLowSugar || "").toUpperCase() !== "TRUE") {
      row.isLowSugar = "TRUE";
      changed += 1;
    }
  }
  return row;
});

const output = Papa.unparse(rows, { quotes: false });
fs.writeFileSync(CSV_PATH, output, "utf8");

console.log(`✅ Patched isLowSugar=TRUE for ${changed} rows.`);
console.log(`📄 Updated: ${CSV_PATH}`);

