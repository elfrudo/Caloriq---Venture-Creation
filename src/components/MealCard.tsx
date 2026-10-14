"use client";
import { useState, useTransition } from "react";
import { replaceMealAction, setMealStatus } from "@/app/actions/meals";
import { MEAL_LABEL, type MealView } from "@/lib/today";
import { rupiah } from "@/lib/format";

export function MealCard({ meal }: { meal: MealView }) {
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");

  function run(label: string, fn: () => Promise<{ error?: string }>) {
    setError(""); setBusy(label); setConfirming(false);
    start(async () => {
      try { const r = await fn(); if (r.error) setError(r.error); }
      catch { setError("Something went wrong. Please try again."); }
      setBusy("");
    });
  }
  const status = (s: string) => run("status", () => setMealStatus(meal.id, s));
  const badge = meal.status === "EATEN" ? "bg-primary/15 text-primary" : meal.status === "SKIPPED" ? "bg-border text-muted" : "bg-secondary/15 text-secondary";

  return (
    <div className={`card space-y-3 ${meal.status === "SKIPPED" ? "opacity-70" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">{MEAL_LABEL[meal.type] ?? meal.type}</h3>
          <p className="text-sm text-muted">{meal.name}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${badge}`}>{meal.status === "EATEN" ? "Eaten" : meal.status === "SKIPPED" ? "Skipped" : "Planned"}</span>
      </div>
      <ul className="text-sm">
        {meal.items.map((i) => <li key={i.id}>{i.servings} × {i.name} <span className="text-muted">({i.servingSize})</span></li>)}
      </ul>
      <p className="text-sm text-muted">{meal.kcal} kcal · P {meal.protein} g · C {meal.carbs} g · F {meal.fat} g · <span className="font-medium text-fg">{rupiah(meal.price)}</span></p>

      {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="flex flex-wrap gap-2">
        {meal.status === "PLANNED" && (<>
          <button className="btn !py-2 text-sm" disabled={pending} onClick={() => status("EATEN")}>{busy === "status" ? "Saving…" : "Mark as Eaten"}</button>
          <button className="btn-ghost !py-2 text-sm" disabled={pending} onClick={() => status("SKIPPED")}>Skip Meal</button>
        </>)}
        {meal.status !== "PLANNED" && <button className="btn-ghost !py-2 text-sm" disabled={pending} onClick={() => status("PLANNED")}>{busy === "status" ? "Saving…" : "Undo"}</button>}
        {meal.status !== "EATEN" && !confirming && busy !== "replace" && (
          <button className="btn-ghost !py-2 text-sm" disabled={pending} onClick={() => setConfirming(true)}>Replace Meal</button>
        )}
        {confirming && (
          <span className="flex items-center gap-2 text-sm">
            Swap for a similar meal?
            <button className="btn !py-1.5 text-sm" onClick={() => run("replace", () => replaceMealAction(meal.id))}>Yes, replace</button>
            <button className="btn-ghost !py-1.5 text-sm" onClick={() => setConfirming(false)}>Cancel</button>
          </span>
        )}
        {busy === "replace" && <span className="self-center text-sm text-muted">Finding a replacement…</span>}
      </div>
    </div>
  );
}
