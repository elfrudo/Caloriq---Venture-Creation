"use client";
import { useState, useTransition } from "react";
import { completeOnboarding } from "@/app/actions/onboarding";
import { DISCLAIMER } from "@/lib/nutrition";

const STEPS = ["Personal Information", "Your Goal", "Food Preferences", "Your Budget"];
const ACTIVITY = [["SEDENTARY", "Sedentary", "Desk work, little exercise"], ["LIGHT", "Lightly Active", "Exercise 1–3 days/week"], ["MODERATE", "Moderately Active", "Exercise 3–5 days/week"], ["VERY", "Very Active", "Hard exercise 6–7 days/week"], ["EXTREME", "Extremely Active", "Physical job or twice-daily training"]];
const GOALS = [["LOSE", "Lose Weight"], ["MAINTAIN", "Maintain Weight"], ["GAIN", "Gain Weight"]];
const ALLERGENS = ["egg", "dairy", "peanut", "seafood", "gluten", "soy"];
const BUDGETS = [[20000, "Under Rp25,000"], [37500, "Rp25,000–50,000"], [60000, "Rp50,000–75,000"], [85000, "Rp75,000–100,000"], [120000, "Above Rp100,000"]] as const;

function Choice({ active, onClick, title, hint }: { active: boolean; onClick: () => void; title: string; hint?: string }) {
  return (
    <button type="button" onClick={onClick} className={`w-full rounded-xl border px-4 py-3 text-left transition ${active ? "border-primary bg-primary/10" : "border-border bg-card hover:bg-bg"}`}>
      <span className="font-medium">{title}</span>{hint && <span className="block text-sm text-muted">{hint}</span>}
    </button>
  );
}

export function OnboardingForm({ name }: { name: string }) {
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const [d, setD] = useState({ age: "", sex: "MALE", heightCm: "", weightKg: "", activity: "MODERATE", goal: "LOSE", targetWeightKg: "", mealsPerDay: 4, dislikes: "", allergies: [] as string[], vegetarian: false, budget: "50000" });
  const set = <K extends keyof typeof d>(k: K, v: (typeof d)[K]) => setD((p) => ({ ...p, [k]: v }));

  function validate(): string {
    if (step === 0) {
      if (!d.age || !d.heightCm || !d.weightKg) return "Fill in your age, height, and weight.";
    }
    if (step === 3 && (!d.budget || Number(d.budget) < 10000)) return "Enter a daily budget of at least Rp10,000.";
    return "";
  }
  function next() { const e = validate(); setError(e); if (!e) setStep(step + 1); }
  function submit() {
    const e = validate(); setError(e); if (e) return;
    start(async () => {
      const res = await completeOnboarding({
        age: Number(d.age), sex: d.sex, heightCm: Number(d.heightCm), weightKg: Number(d.weightKg), activity: d.activity, goal: d.goal,
        targetWeightKg: d.targetWeightKg ? Number(d.targetWeightKg) : undefined, mealsPerDay: d.mealsPerDay,
        dislikes: d.dislikes, allergies: d.allergies, vegetarian: d.vegetarian, budget: Number(d.budget),
      });
      if (res?.error) setError(res.error); // on success the server action redirects
    });
  }

  return (
    <main className="mx-auto min-h-screen max-w-xl px-6 py-10">
      <p className="font-semibold text-primary">Caloriq</p>
      <h1 className="mt-2 text-2xl font-bold">Hi {name}, let&apos;s build your plan</h1>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-border"><div className="h-full bg-primary transition-all" style={{ width: `${((step + 1) / 4) * 100}%` }} /></div>
      <p className="mt-2 text-sm text-muted">Step {step + 1} of 4 · {STEPS[step]}</p>

      <div className="card mt-6 space-y-4">
        {step === 0 && (<>
          <div className="grid grid-cols-2 gap-3">
            {[["MALE", "Male"], ["FEMALE", "Female"]].map(([v, l]) => <Choice key={v} active={d.sex === v} onClick={() => set("sex", v)} title={l} />)}
          </div>
          <label className="block text-sm font-medium">Age<input type="number" className="input mt-1" value={d.age} onChange={(e) => set("age", e.target.value)} /></label>
          <label className="block text-sm font-medium">Height (cm)<input type="number" className="input mt-1" value={d.heightCm} onChange={(e) => set("heightCm", e.target.value)} /></label>
          <label className="block text-sm font-medium">Weight (kg)<input type="number" step="0.1" className="input mt-1" value={d.weightKg} onChange={(e) => set("weightKg", e.target.value)} /></label>
          <p className="text-sm font-medium">Activity level</p>
          <div className="space-y-2">{ACTIVITY.map(([v, l, h]) => <Choice key={v} active={d.activity === v} onClick={() => set("activity", v)} title={l} hint={h} />)}</div>
        </>)}

        {step === 1 && (<>
          <div className="space-y-2">{GOALS.map(([v, l]) => <Choice key={v} active={d.goal === v} onClick={() => set("goal", v)} title={l} />)}</div>
          <label className="block text-sm font-medium">Target weight in kg (optional)<input type="number" step="0.1" className="input mt-1" value={d.targetWeightKg} onChange={(e) => set("targetWeightKg", e.target.value)} /></label>
        </>)}

        {step === 2 && (<>
          <p className="text-sm font-medium">Meals per day</p>
          <div className="grid grid-cols-3 gap-3">{[2, 3, 4].map((n) => <Choice key={n} active={d.mealsPerDay === n} onClick={() => set("mealsPerDay", n)} title={`${n} meals`} />)}</div>
          <p className="text-sm font-medium">Allergies</p>
          <div className="flex flex-wrap gap-2">
            {ALLERGENS.map((a) => {
              const on = d.allergies.includes(a);
              return <button key={a} type="button" onClick={() => set("allergies", on ? d.allergies.filter((x) => x !== a) : [...d.allergies, a])} className={`rounded-full border px-3 py-1.5 text-sm ${on ? "border-primary bg-primary/10" : "border-border"}`}>{a}</button>;
            })}
          </div>
          <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={d.vegetarian} onChange={(e) => set("vegetarian", e.target.checked)} /> Vegetarian (no meat or fish)</label>
          <label className="block text-sm font-medium">Foods you dislike (comma-separated)<input className="input mt-1" placeholder="e.g. broccoli, tuna" value={d.dislikes} onChange={(e) => set("dislikes", e.target.value)} /></label>
        </>)}

        {step === 3 && (<>
          <p className="text-sm font-medium">Daily food budget</p>
          <div className="space-y-2">{BUDGETS.map(([v, l]) => <Choice key={v} active={d.budget === String(v)} onClick={() => set("budget", String(v))} title={l} />)}</div>
          <label className="block text-sm font-medium">Or enter a custom budget (Rp/day)<input type="number" step="1000" className="input mt-1" value={d.budget} onChange={(e) => set("budget", e.target.value)} /></label>
          <p className="text-xs text-muted">{DISCLAIMER}</p>
        </>)}

        {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <div className="flex gap-3 pt-2">
          {step > 0 && <button type="button" className="btn-ghost" onClick={() => { setError(""); setStep(step - 1); }}>Back</button>}
          {step < 3
            ? <button type="button" className="btn flex-1" onClick={next}>Continue</button>
            : <button type="button" className="btn flex-1" disabled={pending} onClick={submit}>{pending ? "Building your plan…" : "Create my plan"}</button>}
        </div>
      </div>
    </main>
  );
}
