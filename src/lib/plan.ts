import type { PrismaClient } from "@prisma/client";
import { generateDay } from "./mealGenerator";
import { splitList } from "./format";

export const startOfDay = (d = new Date()) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };

/** Generates and saves a one-day meal plan for the user's current profile. */
export async function createDayPlan(db: PrismaClient, userId: string, date = startOfDay()) {
  const p = await db.userProfile.findUniqueOrThrow({ where: { userId } });
  const foods = await db.food.findMany();
  const meals = generateDay(
    foods,
    { allergies: splitList(p.allergies), dislikes: splitList(p.dislikes), vegetarian: p.vegetarian },
    { calories: p.calorieTarget, proteinG: p.proteinG, budget: p.dailyBudget, meals: p.mealsPerDay },
  );
  if (!meals.length) throw new Error("No foods match your preferences. Try removing some restrictions.");
  return db.mealPlan.create({
    data: { userId, days: { create: { date, meals: { create: meals.map((m) => ({
      type: m.type, name: m.name,
      items: { create: m.items.map((i) => ({ foodId: i.food.id!, servings: i.servings })) },
    })) } } } },
  });
}
