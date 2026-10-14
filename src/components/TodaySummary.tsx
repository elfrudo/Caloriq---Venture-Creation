import type { TodayData } from "@/lib/today";
import { rupiah } from "@/lib/format";
import { ProgressBar } from "./ProgressBar";

const n = (x: number) => Math.round(x).toLocaleString("id-ID");

function Stat({ label, value, target, unit, note }: { label: string; value: string; target: number; unit: string; note?: string }) {
  const num = Number(value.replace(/\D/g, ""));
  return (
    <div className="card space-y-2">
      <p className="text-sm text-muted">{label}</p>
      <p className="text-xl font-bold">{value} <span className="text-sm font-normal text-muted">/ {n(target)} {unit}</span></p>
      <ProgressBar value={num} max={target} />
      {note && <p className="text-xs text-muted">{note}</p>}
    </div>
  );
}

export function TodaySummary({ d }: { d: TodayData }) {
  const p = d.profile, c = d.consumed;
  const over = d.remainingKcal < 0;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div className="card space-y-2 sm:col-span-2 lg:col-span-1">
        <p className="text-sm text-muted">Calories</p>
        <p className="text-2xl font-bold">{n(c.kcal)} <span className="text-sm font-normal text-muted">/ {n(p.calorieTarget)} kcal</span></p>
        <ProgressBar value={c.kcal} max={p.calorieTarget} />
        <p className={`text-sm font-medium ${over ? "text-secondary" : "text-primary"}`}>{over ? `Over by ${n(-d.remainingKcal)} kcal` : `${n(d.remainingKcal)} kcal remaining`}</p>
      </div>
      <Stat label="Protein" value={n(c.protein)} target={p.proteinG} unit="g" />
      <Stat label="Carbohydrates" value={n(c.carbs)} target={p.carbsG} unit="g" />
      <Stat label="Fat" value={n(c.fat)} target={p.fatG} unit="g" />
      <div className="card space-y-2 sm:col-span-2">
        <p className="text-sm text-muted">Budget (estimates)</p>
        <p className="text-xl font-bold">{rupiah(c.spent)} <span className="text-sm font-normal text-muted">/ {rupiah(p.dailyBudget)}</span></p>
        <ProgressBar value={c.spent} max={p.dailyBudget} />
        <p className="text-xs text-muted">Planned for the full day: {rupiah(d.plannedCost)}{d.plannedCost > p.dailyBudget ? " (over budget)" : ""}</p>
      </div>
    </div>
  );
}
