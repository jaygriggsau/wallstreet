"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { auth } from "@/auth";
import { db, s } from "@/db";

type Result = { ok: true; message: string } | { ok: false; error: string };

export async function placeOrder(formData: FormData): Promise<Result> {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return { ok: false, error: "Not signed in" };

  const stockId = String(formData.get("stockId") ?? "");
  const side = String(formData.get("side") ?? "");
  const shares = Math.floor(Number(formData.get("shares") ?? 0));

  if (!stockId || (side !== "buy" && side !== "sell")) {
    return { ok: false, error: "Invalid order" };
  }
  if (!Number.isFinite(shares) || shares <= 0) {
    return { ok: false, error: "Shares must be a positive integer" };
  }

  const stock = (await db.select().from(s.stocks).where(eq(s.stocks.id, stockId))).at(0);
  if (!stock) return { ok: false, error: "Stock not found" };

  const user = (await db.select().from(s.users).where(eq(s.users.id, userId))).at(0);
  if (!user) return { ok: false, error: "User not found" };

  const price = stock.priceCents;
  const cost = price * shares;

  const existing = (
    await db
      .select()
      .from(s.holdings)
      .where(and(eq(s.holdings.userId, userId), eq(s.holdings.stockId, stockId)))
  ).at(0);

  if (side === "buy") {
    if (user.cashCents < cost) return { ok: false, error: "Not enough cash" };
    await db.update(s.users).set({ cashCents: user.cashCents - cost }).where(eq(s.users.id, userId));
    if (existing) {
      const newShares = existing.shares + shares;
      const newAvg = Math.round((existing.avgCostCents * existing.shares + cost) / newShares);
      await db
        .update(s.holdings)
        .set({ shares: newShares, avgCostCents: newAvg })
        .where(and(eq(s.holdings.userId, userId), eq(s.holdings.stockId, stockId)));
    } else {
      await db.insert(s.holdings).values({
        userId,
        stockId,
        shares,
        avgCostCents: price,
      });
    }
  } else {
    if (!existing || existing.shares < shares) return { ok: false, error: "Not enough shares" };
    await db.update(s.users).set({ cashCents: user.cashCents + cost }).where(eq(s.users.id, userId));
    const remaining = existing.shares - shares;
    if (remaining === 0) {
      await db
        .delete(s.holdings)
        .where(and(eq(s.holdings.userId, userId), eq(s.holdings.stockId, stockId)));
    } else {
      await db
        .update(s.holdings)
        .set({ shares: remaining })
        .where(and(eq(s.holdings.userId, userId), eq(s.holdings.stockId, stockId)));
    }
  }

  await db.insert(s.trades).values({
    id: randomUUID(),
    userId,
    stockId,
    side,
    shares,
    priceCents: price,
  });

  revalidatePath("/");
  revalidatePath("/portfolio");
  revalidatePath(`/stock/${stock.symbol}`);
  return { ok: true, message: `${side === "buy" ? "Bought" : "Sold"} ${shares} ${stock.symbol}` };
}
