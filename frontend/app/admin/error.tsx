"use client";

import { PageError } from "@/components/page-error";

type AdminErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AdminError({ reset }: AdminErrorProps) {
  return (
    <PageError
      title="Could not load admin"
      message="We couldn't load the admin page. Make sure you're signed in as an admin and the backend is running."
      reset={reset}
    />
  );
}
