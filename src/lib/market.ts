import { randomUUID } from "node:crypto";
import { eq, sql } from "drizzle-orm";
import { db, s } from "@/db";

const TICK_INTERVAL_MS = 30_000;

function gaussian() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export async function tickMarket() {
  const rows = await db.select().from(s.stocks);
  for (const row of rows) {
    const vol = Number(row.volatility);
    const drift = Number(row.drift);
    const shock = gaussian() * vol + drift;
    const next = Math.max(1, Math.round(row.priceCents * (1 + shock)));
    await db
      .update(s.stocks)
      .set({ prevPriceCents: row.priceCents, priceCents: next, updatedAt: new Date() })
      .where(eq(s.stocks.id, row.id));
    await db.insert(s.priceHistory).values({
      id: randomUUID(),
      stockId: row.id,
      priceCents: next,
    });
  }
  return rows.length;
}

let lastTickAttempt = 0;

export async function maybeTick() {
  const now = Date.now();
  if (now - lastTickAttempt < TICK_INTERVAL_MS) return false;
  lastTickAttempt = now;

  const newest = (
    await db
      .select({ updatedAt: s.stocks.updatedAt })
      .from(s.stocks)
      .orderBy(sql`updated_at desc`)
      .limit(1)
  ).at(0);

  if (newest && now - new Date(newest.updatedAt).getTime() < TICK_INTERVAL_MS) {
    return false;
  }

  await tickMarket();
  return true;
}
