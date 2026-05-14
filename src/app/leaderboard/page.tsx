import { sql } from "drizzle-orm";
import { db } from "@/db";
import { dollars } from "@/lib/format";

export const dynamic = "force-dynamic";

type Row = { id: string; name: string | null; email: string | null; net_worth: string | number };

export default async function Leaderboard() {
  const result = await db.execute(sql`
    select u.id,
           u.name,
           u.email,
           u.cash_cents + coalesce(sum(h.shares * st.price_cents), 0) as net_worth
    from users u
    left join holdings h on h.user_id = u.id
    left join stocks st on st.id = h.stock_id
    group by u.id
    order by net_worth desc
    limit 50
  `);
  const list = ((result as unknown as { rows?: Row[] }).rows ?? (result as unknown as Row[])) as Row[];

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Leaderboard</h1>
      <div className="bg-panel border border-white/10 rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-muted text-left">
            <tr>
              <th className="px-4 py-2 w-12">#</th>
              <th className="px-4 py-2">Player</th>
              <th className="px-4 py-2 text-right">Net worth</th>
            </tr>
          </thead>
          <tbody>
            {list.map((r, i) => (
              <tr key={r.id} className="border-t border-white/5">
                <td className="px-4 py-2 text-muted">{i + 1}</td>
                <td className="px-4 py-2">{r.name ?? r.email ?? "anon"}</td>
                <td className="px-4 py-2 text-right font-mono">{dollars(Number(r.net_worth))}</td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr><td colSpan={3} className="px-4 py-6 text-center text-muted">No players yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
