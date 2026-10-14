import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { getUser } from "@/lib/session";
export default async function RegisterPage() {
  if (await getUser()) redirect("/dashboard");
  return <AuthForm mode="register" />;
}
