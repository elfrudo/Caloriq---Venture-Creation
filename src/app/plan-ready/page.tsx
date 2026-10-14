import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { DISCLAIMER } from "@/lib/nutrition";
import { rupiah } from "@/lib/format";

const GOAL: Record<string, string> = { LOSE: "Lose Weight", MAINTAIN: "Maintain Weight", GAIN: "Gain Weight" };
const LABEL: Record<string, string> = { BREAKFAST: "Breakfast", LUNCH: "Lunch", SNACK: "Snack", DINNER: "Dinner" };

export default async function PlanReadyPage() {
  const user = await requireUser();
  const profile = await db.userProfile.findUnique({ where: { userId: user.id } });
  if (!profile) redirect("/onboarding");
  const plan = await db.mealPlan.findFirst({
    where: { userId: user.id }, orderBy: { createdAt: "desc" },
    include: { days: { include: { meals: { include: { items: { include: { food: true } } } } } } },
  });
  const order = ["BREAKFAST", "LUNCH", "SNACK", "DINNER"];
  const meals = (plan?.days[0]?.meals ?? []).slice().sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type)).map((m) => {
    const sum = (k: "calories" | "protein" | "carbs" | "fat" | "estimatedPrice") => m.items.reduce((s, i) => s + i.food[k] * i.servings, 0);
    return { ...m, kcal: sum("calories"), protein: sum("protein"), carbs: sum("carbs"), fat: sum("fat"), price: sum("estimatedPrice") };
  });
  const total = (k: "kcal" | "price") => meals.reduce((s, m) => s + m[k], 0);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <p className="font-semibold text-primary">Caloriq</p>
      <h1 className="mt-2 text-3xl font-bold">Your Caloriq Plan Is Ready</h1>
      <p className="mt-1 text-muted">Goal: {GOAL[profile.goal]}</p>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="card"><p className="text-sm text-muted">Estimated maintenance</p><p className="text-2xl font-bold">{profile.tdee.toLocaleString("id-ID")} kcal</p><p className="text-xs text-muted">BMR {profile.bmr.toLocaleString("id-ID")} kcal</p></div>
        <div className="card border-primary"><p className="text-sm text-muted">Recommended target</p><p className="text-2xl font-bold text-primary">{profile.calorieTarget.toLocaleString("id-ID")} kcal</p><p className="text-xs text-muted">per day</p></div>
        <div className="card"><p className="text-sm text-muted">Daily budget</p><p className="text-2xl font-bold">{rupiah(profile.dailyBudget)}</p></div>
      </section>
      <section className="card mt-4 grid grid-cols-3 text-center">
        <div><p className="text-sm text-muted">Protein</p><p className="text-xl font-semibold">{profile.proteinG} g</p></div>
        <div><p className="text-sm text-muted">Carbs</p><p className="text-xl font-semibold">{profile.carbsG} g</p></div>
        <div><p className="text-sm text-muted">Fat</p><p className="text-xl font-semibold">{profile.fatG} g</p></div>
      </section>

      <h2 className="mt-8 text-xl font-semibold">Today&apos;s meals</h2>
      <p className="text-sm text-muted">Planned {Math.round(total("kcal"))} kcal · est. cost {rupiah(total("price"))} (prices are estimates)</p>
      <div className="mt-3 space-y-3">
        {meals.map((m) => (
          <div key={m.id} className="card">
            <div className="flex items-baseline justify-between"><h3 className="font-semibold">{LABEL[m.type]}</h3><span className="text-sm text-muted">{rupiah(m.price)}</span></div>
            <ul className="mt-1 text-sm">{m.items.map((i) => <li key={i.id}>{i.servings} × {i.food.name} <span className="text-muted">({i.food.servingSize})</span></li>)}</ul>
            <p className="mt-2 text-sm text-muted">{Math.round(m.kcal)} kcal · P {Math.round(m.protein)} g · C {Math.round(m.carbs)} g · F {Math.round(m.fat)} g</p>
          </div>
        ))}
      </div>

      <Link href="/dashboard" className="btn mt-8">Go to dashboard</Link>
      <p className="mt-6 text-xs text-muted">{DISCLAIMER}</p>
    </main>
  );
}
