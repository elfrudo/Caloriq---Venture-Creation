import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Caloriq", description: "Personalized meal planning based on your body, your goal, and your budget." };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body>{children}</body></html>);
}
