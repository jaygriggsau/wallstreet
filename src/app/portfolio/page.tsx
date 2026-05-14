import Link from "next/link";
import { redirect } from "next/navigation";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/auth";
import { db, s } from "@/db";
import { dollars, pct } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function Portfolio() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) redirect("/login");

  const user = (await db.select().from(s.users).where(eq(s.users.id, userId))).at(0)!;

  const holdings = await db
    .select({
      stockId: s.holdings.stockId,
      shares: s.holdings.shares,
      avgCostCents: s.holdings.avgCostCents,
      symbol: s.stocks.symbol,
      name: s.stocks.name,
      priceCents: s.stocks.priceCents,
    })
    .from(s.holdings)
    .innerJoin(s.stocks, eq(s.stocks.id, s.holdings.stockId))
    .where(eq(s.holdings.userId, userId));

  const equity = holdings.reduce((sum, h) => sum + h.shares * h.priceCents, 0);
  const netWorth = user.cashCents + equity;

  const recent = await db
    .select({
      id: s.trades.id,
      side: s.trades.side,
      shares: s.trades.shares,
      priceCents: s.trades.priceCents,
      createdAt: s.trades.createdAt,
      symbol: s.stocks.symbol,
    })
    .from(s.trades)
    .innerJoin(s.stocks, eq(s.stocks.id, s.trades.stockId))
    .where(eq(s.trades.userId, userId))
    .orderBy(desc(s.trades.createdAt))
    .limit(20);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Stat label="Net worth" value={dollars(netWorth)} />
        <Stat label="Cash" value={dollars(user.cashCents)} />
        <Stat label="Equity" value={dollars(equity)} />
      </div>

      <section>
        <h2 className="text-lg font-bold mb-2">Holdings</h2>
        <div className="bg-panel border border-white/10 rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-muted text-left">
              <tr>
                <th className="px-4 py-2">Symbol</th>
                <th className="px-4 py-2 text-right">Shares</th>
                <th className="px-4 py-2 text-right">Avg cost</th>
                <th className="px-4 py-2 text-right">Price</th>
                <th className="px-4 py-2 text-right">Value</th>
                <th className="px-4 py-2 text-right">P/L</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((h) => {
                const value = h.shares * h.priceCents;
                const cost = h.shares * h.avgCostCents;
                const pl = value - cost;
                const plPct = cost === 0 ? 0 : pl / cost;
                return (
                  <tr key={h.stockId} className="border-t border-white/5">
                    <td className="px-4 py-2 font-mono">
                      <Link href={`/stock/${h.symbol}`} className="text-accent">{h.symbol}</Link>
                    </td>
                    <td className="px-4 py-2 text-right font-mono">{h.shares}</td>
                    <td className="px-4 py-2 text-right font-mono">{dollars(h.avgCostCents)}</td>
                    <td className="px-4 py-2 text-right font-mono">{dollars(h.priceCents)}</td>
                    <td className="px-4 py-2 text-right font-mono">{dollars(value)}</td>
                    <td className={`px-4 py-2 text-right font-mono ${pl >= 0 ? "text-up" : "text-down"}`}>
                      {dollars(pl)} ({pct(plPct)})
                    </td>
                  </tr>
                );
              })}
              {holdings.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-muted">No positions yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold mb-2">Recent trades</h2>
        <div className="bg-panel border border-white/10 rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-muted text-left">
              <tr>
                <th className="px-4 py-2">Time</th>
                <th className="px-4 py-2">Symbol</th>
                <th className="px-4 py-2">Side</th>
                <th className="px-4 py-2 text-right">Shares</th>
                <th className="px-4 py-2 text-right">Price</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((t) => (
                <tr key={t.id} className="border-t border-white/5">
                  <td className="px-4 py-2 text-muted">{new Date(t.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-2 font-mono">{t.symbol}</td>
                  <td className={`px-4 py-2 ${t.side === "buy" ? "text-up" : "text-down"}`}>{t.side}</td>
                  <td className="px-4 py-2 text-right font-mono">{t.shares}</td>
                  <td className="px-4 py-2 text-right font-mono">{dollars(t.priceCents)}</td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-muted">No trades yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-panel border border-white/10 rounded p-4">
      <div className="text-muted text-xs uppercase tracking-wide">{label}</div>
      <div className="font-mono text-xl mt-1">{value}</div>
    </div>
  );
}
