import type { FoodRow } from "../data/foods";

export type MealType = "BREAKFAST" | "LUNCH" | "SNACK" | "DINNER";
export interface Prefs { allergies: string[]; dislikes: string[]; vegetarian: boolean }
export interface Target { calories: number; proteinG: number; budget: number; meals: number }
export interface GeneratedMeal {
  type: MealType; name: string;
  items: { food: FoodRow; servings: number }[];
  calories: number; protein: number; carbs: number; fat: number; price: number;
}
type K = "calories" | "protein" | "carbs" | "fat" | "estimatedPrice";

const SPLITS: Record<number, [MealType, number][]> = {
  2: [["LUNCH", 0.5], ["DINNER", 0.5]],
  3: [["BREAKFAST", 0.3], ["LUNCH", 0.4], ["DINNER", 0.3]],
  4: [["BREAKFAST", 0.25], ["LUNCH", 0.35], ["SNACK", 0.1], ["DINNER", 0.3]],
};

export function filterFoods(foods: FoodRow[], p: Prefs) {
  return foods.filter((f) =>
    (!p.vegetarian || f.vegetarian) &&
    !p.allergies.some((a) => a && f.allergens.split(",").includes(a.toLowerCase())) &&
    !p.dislikes.some((d) => d && f.name.toLowerCase().includes(d.toLowerCase())));
}

const sum = (items: GeneratedMeal["items"], k: K) => items.reduce((s, i) => s + i.food[k] * i.servings, 0);
const pick = <T,>(arr: T[], rnd: () => number) => arr[Math.floor(rnd() * arr.length)];

/** One meal: protein + carb (+ veg/fruit), carbs scaled to hit the calorie target; best of 25 tries. */
export function buildMeal(type: MealType, kcal: number, pool: FoodRow[], rnd = Math.random, exclude: string[] = [], maxPrice = Infinity): GeneratedMeal | null {
  const by = (c: string) => pool.filter((f) => f.category === c && !exclude.includes(f.name));
  const proteins = by("PROTEIN"), carbs = by("CARB"), veg = by("VEGETABLE"), fruit = by("FRUIT");
  if (!carbs.length && !proteins.length) return null;

  let best: GeneratedMeal | null = null;
  const score = (m: GeneratedMeal) => Math.abs(m.calories - kcal) / kcal + (m.price > maxPrice ? 1 : 0) - m.protein / 400;
  for (let n = 0; n < 25; n++) {
    const items: GeneratedMeal["items"] = [];
    if (type === "SNACK") {
      if (fruit.length) items.push({ food: pick(fruit, rnd), servings: 1 });
      const light = proteins.filter((f) => f.calories < 160);
      if (light.length) items.push({ food: pick(light, rnd), servings: 1 });
    } else {
      if (proteins.length) items.push({ food: pick(proteins, rnd), servings: 1 });
      if (carbs.length) items.push({ food: pick(carbs, rnd), servings: 1 });
      if (veg.length && type !== "BREAKFAST") items.push({ food: pick(veg, rnd), servings: 1 });
      if (fruit.length && type === "BREAKFAST") items.push({ food: pick(fruit, rnd), servings: 1 });
    }
    if (!items.length) continue;
    const main = items.find((i) => i.food.category === "CARB") ?? items[0];
    const rest = sum(items.filter((i) => i !== main), "calories");
    main.servings = Math.min(3, Math.max(0.5, Math.round(((kcal - rest) / main.food.calories) * 2) / 2));
    const meal: GeneratedMeal = {
      type, name: items.map((i) => i.food.name.replace(/ \(.*\)/, "")).join(" + "), items,
      calories: Math.round(sum(items, "calories")), protein: Math.round(sum(items, "protein")),
      carbs: Math.round(sum(items, "carbs")), fat: Math.round(sum(items, "fat")), price: Math.round(sum(items, "estimatedPrice")),
    };
    if (!best || score(meal) < score(best)) best = meal;
  }
  return best;
}

/** One day: split calories across meals, then swap in cheaper meals until within budget. */
export function generateDay(foods: FoodRow[], prefs: Prefs, t: Target, rnd = Math.random): GeneratedMeal[] {
  const pool = filterFoods(foods, prefs);
  const split = SPLITS[Math.min(4, Math.max(2, t.meals))];
  const meals = split.map(([type, share]) => buildMeal(type, t.calories * share, pool, rnd, [], t.budget * share * 1.1))
    .filter((m): m is GeneratedMeal => !!m);
  for (let i = 0; i < 15 && meals.reduce((s, m) => s + m.price, 0) > t.budget; i++) {
    const idx = meals.reduce((hi, m, k) => (m.price > meals[hi].price ? k : hi), 0);
    const cheaper = buildMeal(meals[idx].type, meals[idx].calories, pool, rnd, [], meals[idx].price - 1);
    if (cheaper && cheaper.price < meals[idx].price) meals[idx] = cheaper;
  }
  return meals;
}

/** Replace a meal with a similar-calorie, similar-or-lower-price alternative using different proteins. */
export function replaceMeal(current: GeneratedMeal, foods: FoodRow[], prefs: Prefs, rnd = Math.random) {
  const used = current.items.filter((i) => i.food.category === "PROTEIN").map((i) => i.food.name);
  return buildMeal(current.type, current.calories, filterFoods(foods, prefs), rnd, used, current.price * 1.1) ?? current;
}
