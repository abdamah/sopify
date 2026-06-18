import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="auth-shell">
      <section className="auth-card">
        <p className="section-label">Welcome back</p>
        <h1 className="auth-title">Sign in to Sopify</h1>
        <p className="auth-subtitle">
          Use your email and password to access your account.
        </p>
        <LoginForm />
      </section>
    </main>
  );
}
