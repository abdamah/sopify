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
