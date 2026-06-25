# Step 46 — Admin layout guard

**Week 3 — Admin** · Prev: [Step 45](step-45.md) · Next: [Step 47](step-47.md)

## Goal

Only admins access /admin.

## Code

### `frontend/app/admin/layout.tsx`

```tsx
import { notFound, redirect } from "next/navigation";

import { AdminNav } from "@/components/admin-nav";
import { getMe } from "@/lib/session";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getMe();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin") {
    notFound();
  }

  return (
    <main className="site-container admin-wrap">
      <AdminNav />
      {children}
    </main>
  );
}
```

## Verify

Non-admin gets 404 on /admin.
