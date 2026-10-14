"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { replaceMeal, type GeneratedMeal, type MealType } from "@/lib/mealGenerator";
import { splitList } from "@/lib/format";

type Result = { error?: string };
const refresh = () => { revalidatePath("/dashboard"); revalidatePath("/today"); };

/** Loads a meal only if it belongs to the signed-in user (ownership check). */
const ownedMeal = (mealId: string, userId: string) =>
  db.meal.findFirst({ where: { id: mealId, day: { plan: { userId } } }, include: { items: { include: { food: true } } } });

export async function setMealStatus(mealId: string, status: string): Promise<Result> {
  const user = await requireUser();
  const parsed = z.object({ mealId: z.string().min(1), status: z.enum(["PLANNED", "EATEN", "SKIPPED"]) }).safeParse({ mealId, status });
  if (!parsed.success) return { error: "Invalid request." };
  const res = await db.meal.updateMany({ where: { id: parsed.data.mealId, day: { plan: { userId: user.id } } }, data: { status: parsed.data.status } });
  if (res.count === 0) return { error: "Meal not found." };
  refresh();
  return {};
}

export async function replaceMealAction(mealId: string): Promise<Result> {
  const user = await requireUser();
  if (!mealId) return { error: "Invalid request." };
  const meal = await ownedMeal(mealId, user.id);
  if (!meal) return { error: "Meal not found." };
  if (meal.status === "EATEN") return { error: "You already ate this meal. Undo it first to replace it." };
  const profile = await db.userProfile.findUnique({ where: { userId: user.id } });
  if (!profile) return { error: "Finish onboarding first." };

  const sum = (k: "calories" | "protein" | "carbs" | "fat" | "estimatedPrice") => meal.items.reduce((s, i) => s + i.food[k] * i.servings, 0);
  const current: GeneratedMeal = {
    type: meal.type as MealType, name: meal.name, items: meal.items.map((i) => ({ food: i.food, servings: i.servings })),
    calories: Math.round(sum("calories")), protein: Math.round(sum("protein")), carbs: Math.round(sum("carbs")),
    fat: Math.round(sum("fat")), price: Math.round(sum("estimatedPrice")),
  };
  const foods = await db.food.findMany();
  const prefs = { allergies: splitList(profile.allergies), dislikes: splitList(profile.dislikes), vegetarian: profile.vegetarian };

  let next = current;
  for (let i = 0; i < 6 && next.name === current.name; i++) next = replaceMeal(current, foods, prefs);
  if (next.name === current.name) return { error: "No other option fits your preferences right now. Try again." };

  await db.$transaction([
    db.mealItem.deleteMany({ where: { mealId: meal.id } }),
    db.meal.update({
      where: { id: meal.id },
      data: { name: next.name, status: "PLANNED", items: { create: next.items.map((i) => ({ foodId: i.food.id!, servings: i.servings })) } },
    }),
  ]);
  refresh();
  return {};
}

export async function addFoodLog(foodId: string, servings: number): Promise<Result> {
  const user = await requireUser();
  const parsed = z.object({ foodId: z.string().min(1, "Choose a food."), servings: z.number().min(0.25, "Minimum is 0.25 servings.").max(10, "Maximum is 10 servings.") }).safeParse({ foodId, servings });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const food = await db.food.findUnique({ where: { id: parsed.data.foodId } });
  if (!food) return { error: "Food not found." };
  const n = parsed.data.servings;
  await db.foodLog.create({
    data: {
      userId: user.id, date: new Date(), name: `${n} × ${food.name}`,
      calories: food.calories * n, protein: food.protein * n, carbs: food.carbs * n, fat: food.fat * n, price: Math.round(food.estimatedPrice * n),
    },
  });
  refresh();
  return {};
}

export async function deleteFoodLog(id: string): Promise<Result> {
  const user = await requireUser();
  const res = await db.foodLog.deleteMany({ where: { id, userId: user.id } });
  if (res.count === 0) return { error: "Entry not found." };
  refresh();
  return {};
}
