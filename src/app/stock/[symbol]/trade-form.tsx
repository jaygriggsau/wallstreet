"use client";

import { useState, useTransition } from "react";
import { placeOrder } from "@/lib/trade";
import { dollars } from "@/lib/format";

export function TradeForm({
  stockId,
  symbol,
  priceCents,
  ownedShares,
}: {
  stockId: string;
  symbol: string;
  priceCents: number;
  ownedShares: number;
}) {
  const [shares, setShares] = useState(1);
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const submit = (fd: FormData) => {
    fd.set("stockId", stockId);
    fd.set("side", side);
    fd.set("shares", String(shares));
    start(async () => {
      const r = await placeOrder(fd);
      setMsg(r.ok ? r.message : r.error);
    });
  };

  return (
    <form action={submit} className="space-y-3 text-sm">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setSide("buy")}
          className={`flex-1 py-1.5 rounded border ${side === "buy" ? "bg-up/20 border-up text-up" : "border-white/10 text-muted"}`}
        >
          Buy
        </button>
        <button
          type="button"
          onClick={() => setSide("sell")}
          className={`flex-1 py-1.5 rounded border ${side === "sell" ? "bg-down/20 border-down text-down" : "border-white/10 text-muted"}`}
        >
          Sell
        </button>
      </div>
      <label className="block">
        <span className="text-muted">Shares</span>
        <input
          type="number"
          min={1}
          step={1}
          value={shares}
          onChange={(e) => setShares(Math.max(1, Math.floor(Number(e.target.value) || 1)))}
          className="w-full bg-bg border border-white/10 rounded px-2 py-1 font-mono"
        />
      </label>
      <div className="text-muted text-xs">
        Owned: <span className="font-mono text-ink">{ownedShares}</span>
        <span className="mx-2">·</span>
        Total: <span className="font-mono text-ink">{dollars(priceCents * shares)}</span>
      </div>
      <button
        disabled={pending}
        className={`w-full py-2 rounded font-semibold ${side === "buy" ? "bg-up text-black" : "bg-down text-black"} disabled:opacity-50`}
      >
        {pending ? "..." : `${side === "buy" ? "Buy" : "Sell"} ${shares} ${symbol}`}
      </button>
      {msg && <div className="text-xs text-muted">{msg}</div>}
    </form>
  );
}
