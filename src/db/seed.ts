import "dotenv/config";
import { randomUUID } from "node:crypto";
import { db } from "./index";
import { stocks } from "./schema";

const seedStocks = [
  { symbol: "ACME", name: "Acme Corp", sector: "Industrials", price: 5000, vol: "0.020", drift: "0.0002" },
  { symbol: "ZNTH", name: "Zenith Energy", sector: "Energy", price: 12000, vol: "0.030", drift: "0.0001" },
  { symbol: "NOVA", name: "Nova Biotech", sector: "Healthcare", price: 8500, vol: "0.045", drift: "0.0003" },
  { symbol: "ORBT", name: "Orbital Systems", sector: "Aerospace", price: 22000, vol: "0.035", drift: "0.0004" },
  { symbol: "PXEL", name: "Pixel Studios", sector: "Media", price: 3200, vol: "0.040", drift: "0.0001" },
  { symbol: "GRNT", name: "Granite Bank", sector: "Finance", price: 9800, vol: "0.015", drift: "0.0001" },
  { symbol: "HVST", name: "Harvest Foods", sector: "Consumer", price: 4500, vol: "0.018", drift: "0.0001" },
  { symbol: "QRTX", name: "Quartex AI", sector: "Tech", price: 31000, vol: "0.055", drift: "0.0006" },
  { symbol: "TRRA", name: "Terra Metals", sector: "Mining", price: 7600, vol: "0.028", drift: "0.0000" },
  { symbol: "VLTA", name: "Volta Motors", sector: "Auto", price: 14500, vol: "0.040", drift: "0.0003" },
];

async function main() {
  for (const s of seedStocks) {
    await db
      .insert(stocks)
      .values({
        id: randomUUID(),
        symbol: s.symbol,
        name: s.name,
        sector: s.sector,
        priceCents: s.price,
        prevPriceCents: s.price,
        volatility: s.vol,
        drift: s.drift,
      })
      .onConflictDoNothing();
  }
  console.log("Seeded", seedStocks.length, "stocks");
}

main().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});
