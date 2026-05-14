import Link from "next/link";
import { db, s } from "@/db";
import { dollars, pct } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function MarketPage() {
  const rows = await db.select().from(s.stocks).orderBy(s.stocks.symbol);
  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Market</h1>
      <div className="bg-panel rounded border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-muted text-left">
            <tr>
              <th className="px-4 py-2">Symbol</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Sector</th>
              <th className="px-4 py-2 text-right">Price</th>
              <th className="px-4 py-2 text-right">Change</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const change = (r.priceCents - r.prevPriceCents) / r.prevPriceCents;
              const cls = change >= 0 ? "text-up" : "text-down";
              return (
                <tr key={r.id} className="border-t border-white/5 hover:bg-white/5">
                  <td className="px-4 py-2 font-mono">
                    <Link href={`/stock/${r.symbol}`} className="text-accent">{r.symbol}</Link>
                  </td>
                  <td className="px-4 py-2">{r.name}</td>
                  <td className="px-4 py-2 text-muted">{r.sector}</td>
                  <td className="px-4 py-2 text-right font-mono">{dollars(r.priceCents)}</td>
                  <td className={`px-4 py-2 text-right font-mono ${cls}`}>{pct(change)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
