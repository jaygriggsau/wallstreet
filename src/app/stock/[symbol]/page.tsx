import { notFound } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";
import { db, s } from "@/db";
import { auth } from "@/auth";
import { dollars, pct } from "@/lib/format";
import { maybeTick } from "@/lib/market";
import { TradeForm } from "./trade-form";

export const dynamic = "force-dynamic";

export default async function StockPage({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  await maybeTick();
  const { symbol } = await params;
  const stock = (await db.select().from(s.stocks).where(eq(s.stocks.symbol, symbol.toUpperCase()))).at(0);
  if (!stock) notFound();

  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const holding = userId
    ? (await db
        .select()
        .from(s.holdings)
        .where(and(eq(s.holdings.userId, userId), eq(s.holdings.stockId, stock.id)))).at(0)
    : null;

  const recent = await db
    .select()
    .from(s.priceHistory)
    .where(eq(s.priceHistory.stockId, stock.id))
    .orderBy(desc(s.priceHistory.at))
    .limit(30);

  const change = (stock.priceCents - stock.prevPriceCents) / stock.prevPriceCents;

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 bg-panel border border-white/10 rounded p-5">
        <div className="flex items-baseline justify-between mb-1">
          <div>
            <div className="text-accent font-mono text-lg">{stock.symbol}</div>
            <div className="text-muted text-sm">{stock.name} · {stock.sector}</div>
          </div>
          <div className="text-right">
            <div className="font-mono text-2xl">{dollars(stock.priceCents)}</div>
            <div className={`font-mono ${change >= 0 ? "text-up" : "text-down"}`}>{pct(change)}</div>
          </div>
        </div>
        <div className="mt-6">
          <div className="text-muted text-xs mb-2">Recent price (newest first)</div>
          <div className="font-mono text-xs grid grid-cols-3 gap-1">
            {recent.map((p) => (
              <div key={p.id} className="text-muted">{dollars(p.priceCents)}</div>
            ))}
            {recent.length === 0 && <div className="text-muted col-span-3">No history yet — wait for market tick.</div>}
          </div>
        </div>
      </div>
      <div className="bg-panel border border-white/10 rounded p-5">
        <h2 className="font-bold mb-3">Trade</h2>
        {userId ? (
          <TradeForm
            stockId={stock.id}
            symbol={stock.symbol}
            priceCents={stock.priceCents}
            ownedShares={holding?.shares ?? 0}
          />
        ) : (
          <p className="text-muted text-sm">Sign in to trade.</p>
        )}
      </div>
    </div>
  );
}
