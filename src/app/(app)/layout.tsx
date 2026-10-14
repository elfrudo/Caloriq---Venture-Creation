import { AppNav } from "@/components/AppNav";
import { requireUser } from "@/lib/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return <AppNav userName={user.name}><main className="mx-auto max-w-5xl px-5 py-8">{children}</main></AppNav>;
}
