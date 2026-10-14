"use client";
import { useState, useTransition } from "react";
import { deleteFoodLog } from "@/app/actions/meals";
import { rupiah } from "@/lib/format";

export function FoodLogList({ logs }: { logs: { id: string; name: string; calories: number; price: number }[] }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  if (logs.length === 0) return <p className="card text-sm text-muted">No extra foods yet. Use Add Food to log anything you ate outside your plan.</p>;
  return (
    <div className="card divide-y divide-border">
      {error && <p role="alert" className="pb-2 text-sm text-red-700">{error}</p>}
      {logs.map((l) => (
        <div key={l.id} className="flex items-center justify-between gap-3 py-2 text-sm first:pt-0 last:pb-0">
          <span>{l.name} <span className="text-muted">· {Math.round(l.calories)} kcal · {rupiah(l.price)}</span></span>
          <button className="text-muted hover:text-fg" disabled={pending} onClick={() => start(async () => { const r = await deleteFoodLog(l.id); setError(r.error ?? ""); })}>Remove</button>
        </div>
      ))}
    </div>
  );
}
