import { redirect } from "next/navigation";

import { getMe } from "@/actions/auth";

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
    redirect("/products");
  }

  return <div className="flex-1">{children}</div>;
}
