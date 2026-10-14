"use client";
import { useState, useTransition } from "react";
import { addFoodLog } from "@/app/actions/meals";

export interface FoodOption { id: string; name: string; servingSize: string; calories: number }

export function AddFoodDialog({ foods }: { foods: FoodOption[] }) {
  const [open, setOpen] = useState(false);
  const [foodId, setFoodId] = useState("");
  const [servings, setServings] = useState("1");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const food = foods.find((f) => f.id === foodId);

  function submit(e: React.FormEvent) {
    e.preventDefault(); setError("");
    start(async () => {
      try {
        const r = await addFoodLog(foodId, Number(servings));
        if (r.error) setError(r.error); else { setOpen(false); setFoodId(""); setServings("1"); }
      } catch { setError("Something went wrong. Please try again."); }
    });
  }

  return (
    <>
      <button className="btn" onClick={() => setOpen(true)}>Add Food</button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => !pending && setOpen(false)}>
          <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="card w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold">Add food to today</h2>
            <label className="block text-sm font-medium">Food
              <select className="input mt-1" value={foodId} onChange={(e) => setFoodId(e.target.value)} required>
                <option value="">Choose a food…</option>
                {foods.map((f) => <option key={f.id} value={f.id}>{f.name} ({f.servingSize})</option>)}
              </select>
            </label>
            <label className="block text-sm font-medium">Servings
              <input type="number" step="0.25" min="0.25" max="10" className="input mt-1" value={servings} onChange={(e) => setServings(e.target.value)} required />
            </label>
            {food && Number(servings) > 0 && <p className="text-sm text-muted">About {Math.round(food.calories * Number(servings))} kcal</p>}
            {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <div className="flex gap-3">
              <button type="button" className="btn-ghost" disabled={pending} onClick={() => setOpen(false)}>Cancel</button>
              <button type="submit" className="btn flex-1" disabled={pending}>{pending ? "Adding…" : "Add to today"}</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
