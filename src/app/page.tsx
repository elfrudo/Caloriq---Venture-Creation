import Link from "next/link";
export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
      <p className="font-semibold text-primary">Caloriq</p>
      <h1 className="mt-3 text-5xl font-bold tracking-tight">Eat Smarter. Reach Your Goal.</h1>
      <p className="mt-4 max-w-xl text-lg text-muted">Personalized meal plans designed for your body, your goals, and your budget. Affordable meal planning for students, built on local Indonesian food.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/register" className="btn">Start Your Meal Plan</Link>
        <Link href="/login" className="btn-ghost">Log in</Link>
      </div>
    </main>
  );
}
