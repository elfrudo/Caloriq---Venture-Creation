"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logout } from "@/app/actions/auth";

const LINKS = [["/dashboard", "Dashboard"], ["/today", "Today's Plan"], ["/weekly", "Weekly Plan"], ["/progress", "Progress"], ["/grocery", "Grocery List"], ["/foods", "Foods"], ["/settings", "Settings"]];

export function AppNav({ userName, children }: { userName: string; children: React.ReactNode }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex flex-1 flex-col gap-1">
      {LINKS.map(([href, label]) => (
        <Link key={href} href={href} onClick={() => setOpen(false)}
          className={`rounded-xl px-3 py-2 text-sm font-medium ${path === href ? "bg-primary/10 text-primary" : "text-muted hover:bg-bg hover:text-fg"}`}>{label}</Link>
      ))}
    </nav>
  );
  const footer = (
    <div className="border-t border-border pt-4">
      <p className="mb-2 truncate text-sm text-muted">{userName}</p>
      <form action={logout}><button className="btn-ghost w-full !py-2 text-sm">Log out</button></form>
    </div>
  );

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col gap-6 border-r border-border bg-card p-5 md:flex">
        <Link href="/dashboard" className="text-xl font-bold text-primary">Caloriq</Link>
        {nav}{footer}
      </aside>
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-card px-4 py-3 md:hidden">
        <Link href="/dashboard" className="text-lg font-bold text-primary">Caloriq</Link>
        <button className="btn-ghost !px-3 !py-1.5 text-sm" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? "Close" : "Menu"}</button>
      </header>
      {open && <div className="fixed inset-x-0 top-[57px] z-30 flex flex-col gap-4 border-b border-border bg-card p-4 shadow-md md:hidden">{nav}{footer}</div>}
      <div className="md:pl-60">{children}</div>
    </div>
  );
}
