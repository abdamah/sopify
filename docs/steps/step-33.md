# Step 33 — Register page & form

**Week 2 — Auth & cart** · Prev: [Step 32](step-32.md) · Next: [Step 34](step-34.md)

## Goal

Registration UI.

## Code

### `frontend/app/register/page.tsx`

```tsx
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
```

### `frontend/components/register-form.tsx`

```tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState, useTransition } from "react";

import { register } from "@/actions/auth";
import { authSchema } from "@/lib/validation";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);
    const values = {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    };

    const {success, data, error} = authSchema.safeParse(values);
    if (!success) {
      setError(error.issues[0]?.message ?? "Check your input");
      return;
    }

    startTransition(async () => {
      const result = await register(data.email, data.password);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      router.push("/products");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="form-stack">
      {error ? <p className="form-error">{error}</p> : null}

      <div>
        <label htmlFor="email" className="form-label">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          className="form-input"
          placeholder="you@example.com"
          // required
        />
      </div>

      <div>
        <label htmlFor="password" className="form-label">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          className="form-input"
          placeholder="At least 8 characters"
          minLength={8}
          // required
        />
      </div>

      <button type="submit" className="primary-button w-full" disabled={isPending}>
        {isPending ? "Creating account..." : "Create account"}
      </button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
```

## Verify

Register → header shows logged-in state.
