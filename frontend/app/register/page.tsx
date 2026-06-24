import { redirect } from "next/navigation";

import { getMe } from "@/lib/session";
import { RegisterForm } from "@/components/register-form";

export default async function RegisterPage() {
  const user = await getMe();
  if (user) {
    redirect("/");
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <p className="section-label">Create account</p>
        <h1 className="auth-title">Join Sopify</h1>
        <p className="auth-subtitle">
          Create an account to save your session and use the cart.
        </p>
        <RegisterForm />
      </section>
    </main>
  );
}
