import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { getTodayData } from "@/lib/today";
import { TodaySummary } from "@/components/TodaySummary";
import { MealCard } from "@/components/MealCard";
import { AddFoodDialog } from "@/components/AddFoodDialog";
import { DISCLAIMER } from "@/lib/nutrition";

const GOAL: Record<string, string> = { LOSE: "Lose weight", MAINTAIN: "Maintain weight", GAIN: "Gain weight" };

export default async function DashboardPage() {
  const user = await requireUser();
  const d = await getTodayData(user.id);
  if (!d) redirect("/onboarding");
  const foods = await db.food.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, servingSize: true, calories: true } });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Hello, {user.name.split(" ")[0]}</h1>
          <p className="text-muted">Goal: {GOAL[d.profile.goal]}</p>
        </div>
        <AddFoodDialog foods={foods} />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="card"><p className="text-sm text-muted">Current weight</p><p className="text-xl font-bold">{d.currentWeight} kg</p></div>
        <div className="card"><p className="text-sm text-muted">Target weight</p><p className="text-xl font-bold">{d.profile.targetWeightKg ? `${d.profile.targetWeightKg} kg` : "Not set"}</p></div>
        <div className="card col-span-2 sm:col-span-1"><p className="text-sm text-muted">Daily target</p><p className="text-xl font-bold">{d.profile.calorieTarget.toLocaleString("id-ID")} kcal</p></div>
      </div>

      <TodaySummary d={d} />

      <section>
        <h2 className="mb-3 text-lg font-semibold">Today&apos;s meals</h2>
        {d.meals.length === 0
          ? <div className="card text-sm text-muted">{d.planError ?? "No meals planned for today."}</div>
          : <div className="grid gap-4 md:grid-cols-2">{d.meals.map((m) => <MealCard key={m.id} meal={m} />)}</div>}
      </section>
      <p className="text-xs text-muted">{DISCLAIMER}</p>
    </div>
  );
}
