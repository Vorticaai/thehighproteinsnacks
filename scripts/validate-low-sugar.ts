// scripts/validate-low-sugar.ts
import { getAllProducts } from "../lib/products";

function main() {
  const products = getAllProducts();

  // Warn if something looks low-sugar (<=2g) but isn't flagged low-sugar in CSV
  const bad = products.filter((p) => {
    const numericIsLow =
      typeof p.sugarPerServing === "number" && p.sugarPerServing <= 2;
    return numericIsLow && !p.flags.lowSugar;
  });

  if (bad.length === 0) {
    console.log("✅ Low-sugar validation passed.");
    process.exit(0);
  }

  console.log("❌ Items <=2g sugar but NOT flagged isLowSugar in CSV:");
  for (const b of bad) {
    console.log(
      `- ${b.name} (${b.brand}) — ${b.sugarPerServing}g sugar | ID: ${b.id}`,
    );
  }
  process.exit(1);
}

main();
