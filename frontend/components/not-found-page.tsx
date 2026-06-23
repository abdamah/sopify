import Link from "next/link";

type NotFoundPageProps = {
  title?: string;
  message?: string;
};

export function NotFoundPage({
  title = "Page not found",
  message = "This page doesn't exist or you don't have permission to view it.",
}: NotFoundPageProps) {
  return (
    <main className="page-container flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="mb-3 text-7xl font-extrabold tracking-tight text-primary">
        404
      </p>
      <h1 className="mb-2 text-2xl font-bold text-foreground">{title}</h1>
      <p className="mb-8 max-w-md text-sm leading-6 text-muted-foreground">
        {message}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/products" className="primary-button">
          Browse products
        </Link>
        <Link href="/" className="secondary-button">
          Go home
        </Link>
      </div>
    </main>
  );
}
