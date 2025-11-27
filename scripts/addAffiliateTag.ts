import fs from "fs";
import path from "path";
import csv from "csv-parser";
import chokidar from "chokidar";
import { createObjectCsvWriter } from "csv-writer";

const FILE_PATH = path.join(process.cwd(), "data/products.csv");
const AFFILIATE_TAG = "thehighprotei-20";

function processCsv() {
  if (!fs.existsSync(FILE_PATH)) {
    console.log("❌ products.csv not found.");
    return;
  }

  const rows: any[] = [];
  fs.createReadStream(FILE_PATH)
    .pipe(csv())
    .on("data", (row) => {
      let buyUrl = row.buyUrl?.trim();
      if (buyUrl?.includes("amazon.com")) {
        if (!buyUrl.includes("tag=")) {
          const separator = buyUrl.includes("?") ? "&" : "?";
          buyUrl += `${separator}tag=${AFFILIATE_TAG}`;
        }
      }
      rows.push({ ...row, buyUrl });
    })
    .on("end", async () => {
      const headers = Object.keys(rows[0]).map((h) => ({ id: h, title: h }));
      const csvWriter = createObjectCsvWriter({ path: FILE_PATH, header: headers });
      await csvWriter.writeRecords(rows);
      console.log("✅ Affiliate tag added to all Amazon links in products.csv");
    });
}

processCsv();

const watcher = chokidar.watch(FILE_PATH, { persistent: true });
watcher.on("change", () => {
  console.log("📦 Detected change in products.csv — updating affiliate tags...");
  processCsv();
});

