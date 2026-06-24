import { notFound, redirect } from "next/navigation";

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

  return <div className="flex-1">{children}</div>;
}
