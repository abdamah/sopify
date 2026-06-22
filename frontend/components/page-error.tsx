"use client";

import Link from "next/link";

type PageErrorProps = {
  title: string;
  message?: string;
  reset: () => void;
};

export function PageError({
  title,
  message = "Something went wrong. Please try again.",
  reset,
}: PageErrorProps) {
  return (
    <main className="page-container">
      <div className="empty-state">
        <h1 className="mb-2 text-lg font-semibold text-foreground">{title}</h1>
        <p className="mb-6">{message}</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button type="button" onClick={reset} className="primary-button">
            Try again
          </button>
          <Link href="/" className="secondary-button">
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
