import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { getTodayData } from "@/lib/today";
import { TodaySummary } from "@/components/TodaySummary";
import { MealCard } from "@/components/MealCard";
import { AddFoodDialog } from "@/components/AddFoodDialog";
import { FoodLogList } from "@/components/FoodLogList";

export default async function TodayPage() {
  const user = await requireUser();
  const d = await getTodayData(user.id);
  if (!d) redirect("/onboarding");
  const foods = await db.food.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, servingSize: true, calories: true } });
  const date = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><h1 className="text-2xl font-bold">Today&apos;s Meal Plan</h1><p className="text-muted">{date}</p></div>
        <AddFoodDialog foods={foods} />
      </div>
      <TodaySummary d={d} />
      <section>
        {d.meals.length === 0
          ? <div className="card text-sm text-muted">{d.planError ?? "No meals planned for today."}</div>
          : <div className="grid gap-4 md:grid-cols-2">{d.meals.map((m) => <MealCard key={m.id} meal={m} />)}</div>}
      </section>
      <section>
        <h2 className="mb-3 text-lg font-semibold">Extra foods you added</h2>
        <FoodLogList logs={d.logs.map((l) => ({ id: l.id, name: l.name, calories: l.calories, price: l.price }))} />
      </section>
    </div>
  );
}
