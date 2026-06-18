import { RegisterForm } from "@/components/register-form";

export default function RegisterPage() {
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
