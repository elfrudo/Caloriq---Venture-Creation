"use client";
import Link from "next/link";
import { useFormState } from "react-dom";
import { login, register } from "@/app/actions/auth";
import { SubmitButton } from "./SubmitButton";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const [state, action] = useFormState(mode === "login" ? login : register, undefined);
  const isReg = mode === "register";
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <Link href="/" className="mb-6 font-semibold text-primary">Caloriq</Link>
      <h1 className="text-3xl font-bold">{isReg ? "Create your account" : "Welcome back"}</h1>
      <p className="mt-1 text-muted">{isReg ? "Get a meal plan built around your body, goal, and budget." : "Log in to see today's meal plan."}</p>
      <form action={action} className="card mt-6 space-y-4">
        {isReg && <label className="block text-sm font-medium">Full name<input name="name" className="input mt-1" required /></label>}
        <label className="block text-sm font-medium">Email<input name="email" type="email" className="input mt-1" required /></label>
        <label className="block text-sm font-medium">Password<input name="password" type="password" className="input mt-1" required minLength={isReg ? 8 : 1} /></label>
        {isReg && <label className="block text-sm font-medium">Confirm password<input name="confirmPassword" type="password" className="input mt-1" required /></label>}
        {state?.error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
        <SubmitButton>{isReg ? "Create account" : "Log in"}</SubmitButton>
      </form>
      <p className="mt-4 text-center text-sm text-muted">
        {isReg ? "Already have an account? " : "New to Caloriq? "}
        <Link href={isReg ? "/login" : "/register"} className="font-medium text-primary">{isReg ? "Log in" : "Create an account"}</Link>
      </p>
    </main>
  );
}
