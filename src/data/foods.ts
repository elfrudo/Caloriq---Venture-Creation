// Prices are rough IDR estimates per serving, not real market data.
type F = [string, string, string, number, number, number, number, number, number, boolean, string];
// name, category, serving, grams, kcal, protein, carbs, fat, price, vegetarian, allergens
const rows: F[] = [
  ["White rice (cooked)","CARB","1 bowl (150g)",150,195,4,43,0.4,3000,true,""],
  ["Brown rice (cooked)","CARB","1 bowl (150g)",150,165,3.5,34,1.4,4500,true,""],
  ["Oatmeal","CARB","50g dry",50,190,6.5,33,3.5,4000,true,"gluten"],
  ["Bread (white)","CARB","2 slices",60,160,5,30,2,3000,true,"gluten"],
  ["Potato (boiled)","CARB","150g",150,130,3,30,0.2,3000,true,""],
  ["Sweet potato (boiled)","CARB","150g",150,135,2.4,31,0.2,3000,true,""],
  ["Noodles (cooked)","CARB","1 bowl (150g)",150,220,7,42,2,3500,true,"gluten"],
  ["Chicken breast (grilled)","PROTEIN","100g",100,165,31,0,3.6,9000,false,""],
  ["Chicken thigh (fried)","PROTEIN","1 piece",100,250,22,5,16,8000,false,""],
  ["Egg (boiled)","PROTEIN","1 egg",50,78,6.3,0.6,5.3,2200,true,"egg"],
  ["Tofu (fried)","PROTEIN","100g",100,115,8,2,8,2500,true,"soy"],
  ["Tempeh (fried)","PROTEIN","100g",100,193,19,8,11,3000,true,"soy"],
  ["Tuna (canned)","PROTEIN","1 can (80g)",80,90,20,0,1,10000,false,"seafood"],
  ["Fish (tilapia, grilled)","PROTEIN","100g",100,128,26,0,2.7,7000,false,"seafood"],
  ["Beef (lean, cooked)","PROTEIN","100g",100,215,27,0,11,16000,false,""],
  ["Milk (UHT)","PROTEIN","1 glass (250ml)",250,150,8,12,8,5000,true,"dairy"],
  ["Plain yogurt","PROTEIN","1 cup (150g)",150,95,5,7,5,6000,true,"dairy"],
  ["Peanut butter","OTHER","1 tbsp (16g)",16,95,4,3,8,1500,true,"peanut"],
  ["Spinach (boiled)","VEGETABLE","100g",100,23,3,3.6,0.3,2000,true,""],
  ["Carrot","VEGETABLE","100g",100,41,0.9,10,0.2,1500,true,""],
  ["Kangkung (stir-fried)","VEGETABLE","100g",100,60,3,5,3.5,2000,true,""],
  ["Broccoli (steamed)","VEGETABLE","100g",100,35,2.4,7,0.4,3500,true,""],
  ["Cabbage","VEGETABLE","100g",100,25,1.3,6,0.1,1500,true,""],
  ["Mixed vegetables","VEGETABLE","1 bowl (120g)",120,60,3,9,1.5,3000,true,""],
  ["Banana","FRUIT","1 medium",100,89,1.1,23,0.3,1500,true,""],
  ["Apple","FRUIT","1 medium",150,78,0.4,21,0.3,3500,true,""],
  ["Papaya","FRUIT","150g",150,65,1,16,0.3,2500,true,""],
  ["Orange","FRUIT","1 medium",130,62,1.2,15,0.2,3000,true,""],
  ["Watermelon","FRUIT","200g",200,60,1.2,15,0.3,2500,true,""],
  ["Gado-gado (no rice)","OTHER","1 plate",250,350,14,28,20,12000,true,"peanut"],
];
export const FOODS = rows.map(([name,category,servingSize,servingGrams,calories,protein,carbs,fat,estimatedPrice,vegetarian,allergens]) =>
  ({ name, category, servingSize, servingGrams, calories, protein, carbs, fat, estimatedPrice, vegetarian, allergens }));
export type FoodRow = (typeof FOODS)[number] & { id?: string };
