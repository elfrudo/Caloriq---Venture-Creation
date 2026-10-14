"use server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { onboardingSchema } from "@/lib/validation";
import { calcTargets } from "@/lib/nutrition";
import { createDayPlan, startOfDay } from "@/lib/plan";

export async function completeOnboarding(input: unknown): Promise<{ error: string }> {
  const user = await requireUser();
  const parsed = onboardingSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;

  const t = calcTargets({ age: d.age, sex: d.sex, heightCm: d.heightCm, weightKg: d.weightKg, activity: d.activity, goal: d.goal });
  const fields = {
    age: d.age, sex: d.sex, heightCm: d.heightCm, weightKg: d.weightKg, activityLevel: d.activity, goal: d.goal,
    targetWeightKg: d.targetWeightKg ?? null, dailyBudget: d.budget, mealsPerDay: d.mealsPerDay,
    dislikes: d.dislikes, allergies: d.allergies.join(","), vegetarian: d.vegetarian,
    bmr: t.bmr, tdee: t.tdee, calorieTarget: t.calories, proteinG: t.proteinG, carbsG: t.carbsG, fatG: t.fatG,
  };
  await db.userProfile.upsert({ where: { userId: user.id }, create: { userId: user.id, startWeightKg: d.weightKg, ...fields }, update: fields });
  const today = startOfDay();
  await db.weightLog.upsert({
    where: { userId_date: { userId: user.id, date: today } },
    create: { userId: user.id, date: today, weightKg: d.weightKg }, update: { weightKg: d.weightKg },
  });
  try {
    await db.mealPlan.deleteMany({ where: { userId: user.id } });
    await createDayPlan(db, user.id);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not generate your meal plan." };
  }
  redirect("/plan-ready");
}
