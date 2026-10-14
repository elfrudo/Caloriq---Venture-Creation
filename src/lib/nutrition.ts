export type Sex = "MALE" | "FEMALE";
export type Goal = "LOSE" | "MAINTAIN" | "GAIN";
export type Activity = "SEDENTARY" | "LIGHT" | "MODERATE" | "VERY" | "EXTREME";

export const ACTIVITY_FACTOR: Record<Activity, number> = {
  SEDENTARY: 1.2, LIGHT: 1.375, MODERATE: 1.55, VERY: 1.725, EXTREME: 1.9,
};

export interface BodyInput { age: number; sex: Sex; heightCm: number; weightKg: number; activity: Activity; goal: Goal }
export interface NutritionTargets { bmr: number; tdee: number; calories: number; proteinG: number; carbsG: number; fatG: number }

/** Mifflin-St Jeor */
export function calcBmr({ age, sex, heightCm, weightKg }: Pick<BodyInput, "age" | "sex" | "heightCm" | "weightKg">) {
  return 10 * weightKg + 6.25 * heightCm - 5 * age + (sex === "MALE" ? 5 : -161);
}

export function calcTargets(i: BodyInput): NutritionTargets {
  const bmr = calcBmr(i);
  const tdee = bmr * ACTIVITY_FACTOR[i.activity];
  // Moderate adjustments only, with a safe calorie floor.
  const adj = i.goal === "LOSE" ? -Math.min(500, Math.max(300, tdee * 0.18)) : i.goal === "GAIN" ? 350 : 0;
  const floor = i.sex === "MALE" ? 1500 : 1200;
  const calories = Math.round(Math.max(floor, tdee + adj) / 10) * 10;
  const proteinG = Math.round(i.weightKg * (i.goal === "MAINTAIN" ? 1.6 : 1.8));
  const fatG = Math.round((calories * 0.25) / 9);
  const carbsG = Math.max(0, Math.round((calories - proteinG * 4 - fatG * 9) / 4));
  return { bmr: Math.round(bmr), tdee: Math.round(tdee), calories, proteinG, carbsG, fatG };
}

export const DISCLAIMER =
  "Caloriq provides estimated nutrition and calorie recommendations for general informational purposes only. It is not a substitute for professional medical or dietary advice. If you have a medical condition, consult a qualified healthcare professional or dietitian.";
