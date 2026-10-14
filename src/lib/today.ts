import { db } from "./db";
import { createDayPlan, startOfDay } from "./plan";

export type MealStatus = "PLANNED" | "EATEN" | "SKIPPED";
export const MEAL_LABEL: Record<string, string> = { BREAKFAST: "Breakfast", LUNCH: "Lunch", SNACK: "Snack", DINNER: "Dinner" };
const ORDER = ["BREAKFAST", "LUNCH", "SNACK", "DINNER"];

export interface MealView {
  id: string; type: string; name: string; status: MealStatus;
  items: { id: string; name: string; servingSize: string; servings: number }[];
  kcal: number; protein: number; carbs: number; fat: number; price: number;
}

/** Loads everything the dashboard and /today need. Creates today's plan if the day has none yet. */
export async function getTodayData(userId: string) {
  const profile = await db.userProfile.findUnique({ where: { userId } });
  if (!profile) return null;

  const start = startOfDay();
  const end = new Date(start); end.setDate(end.getDate() + 1);
  const findDay = () => db.mealPlanDay.findFirst({
    where: { date: { gte: start, lt: end }, plan: { userId } },
    orderBy: { plan: { createdAt: "desc" } },
    include: { meals: { include: { items: { include: { food: true } } } } },
  });

  let day = await findDay();
  let planError: string | null = null;
  if (!day) {
    try { await createDayPlan(db, userId); day = await findDay(); }
    catch (e) { planError = e instanceof Error ? e.message : "Could not generate today's plan."; }
  }

  const meals: MealView[] = (day?.meals ?? [])
    .slice().sort((a, b) => ORDER.indexOf(a.type) - ORDER.indexOf(b.type))
    .map((m) => {
      const s = (k: "calories" | "protein" | "carbs" | "fat" | "estimatedPrice") => m.items.reduce((sum, i) => sum + i.food[k] * i.servings, 0);
      return {
        id: m.id, type: m.type, name: m.name, status: m.status as MealStatus,
        items: m.items.map((i) => ({ id: i.id, name: i.food.name, servingSize: i.food.servingSize, servings: i.servings })),
        kcal: Math.round(s("calories")), protein: Math.round(s("protein")), carbs: Math.round(s("carbs")),
        fat: Math.round(s("fat")), price: Math.round(s("estimatedPrice")),
      };
    });

  const logs = await db.foodLog.findMany({ where: { userId, date: { gte: start, lt: end } }, orderBy: { date: "asc" } });
  const latestWeight = await db.weightLog.findFirst({ where: { userId }, orderBy: { date: "desc" } });

  // Consumed = EATEN meals + manual food logs (planned and skipped meals do not count)
  const eaten = meals.filter((m) => m.status === "EATEN");
  const sumBoth = (k: "kcal" | "protein" | "carbs" | "fat" | "price", lk: "calories" | "protein" | "carbs" | "fat" | "price") =>
    eaten.reduce((a, m) => a + m[k], 0) + logs.reduce((a, l) => a + l[lk], 0);
  const consumed = {
    kcal: Math.round(sumBoth("kcal", "calories")), protein: Math.round(sumBoth("protein", "protein")),
    carbs: Math.round(sumBoth("carbs", "carbs")), fat: Math.round(sumBoth("fat", "fat")), spent: Math.round(sumBoth("price", "price")),
  };
  const plannedCost = meals.filter((m) => m.status !== "SKIPPED").reduce((a, m) => a + m.price, 0) + logs.reduce((a, l) => a + l.price, 0);

  return {
    profile, meals, logs, consumed, plannedCost, planError,
    currentWeight: latestWeight?.weightKg ?? profile.weightKg,
    remainingKcal: profile.calorieTarget - consumed.kcal, // can be negative: the UI shows "over by"
  };
}
export type TodayData = NonNullable<Awaited<ReturnType<typeof getTodayData>>>;
