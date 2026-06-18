"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState, useTransition } from "react";

import { login } from "@/actions/auth";
import { authSchema } from "@/lib/validation";

export function LoginForm() {
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
      const result = await login(data.email, data.password);

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
          required
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
          autoComplete="current-password"
          className="form-input"
          placeholder="Your password"
          required
        />
      </div>

      <button type="submit" className="primary-button w-full" disabled={isPending}>
        {isPending ? "Signing in..." : "Sign in"}
      </button>

      <p className="text-center text-sm text-muted-foreground">
        New to Sopify?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}
