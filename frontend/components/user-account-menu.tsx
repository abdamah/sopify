"use client";

import {
  ChevronDown,
  ClipboardList,
  LogOut,
  Package,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { logout } from "@/actions/auth";

type UserAccountMenuProps = {
  email: string;
  isAdmin?: boolean;
};

const menuItemClassName =
  "flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted";

export function UserAccountMenu({ email, isAdmin = false }: UserAccountMenuProps) {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function handleLogout() {
    setOpen(false);

    startTransition(async () => {
      await logout();
      router.push("/");
      router.refresh();
    });
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="secondary-button max-w-44 px-3 py-1.5 text-[13px]"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="truncate">{email}</span>
        <ChevronDown
          className={`size-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-44 overflow-hidden rounded-xl border border-border bg-background py-1 shadow-lg"
          role="menu"
        >
          {isAdmin ? (
            <>
              <Link
                href="/admin"
                role="menuitem"
                className={menuItemClassName}
                onClick={() => setOpen(false)}
              >
                <ShoppingBag
                  className="size-4 text-muted-foreground"
                  aria-hidden="true"
                />
                Products
              </Link>
              <Link
                href="/admin/orders"
                role="menuitem"
                className={menuItemClassName}
                onClick={() => setOpen(false)}
              >
                <ClipboardList
                  className="size-4 text-muted-foreground"
                  aria-hidden="true"
                />
                Orders
              </Link>
              <div className="my-1 border-t border-border" role="separator" />
            </>
          ) : null}
          <Link
            href="/orders"
            role="menuitem"
            className={menuItemClassName}
            onClick={() => setOpen(false)}
          >
            <Package className="size-4 text-muted-foreground" aria-hidden="true" />
            My orders
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            disabled={isPending}
            className={`${menuItemClassName} text-left disabled:opacity-60`}
          >
            <LogOut className="size-4 text-muted-foreground" aria-hidden="true" />
            {isPending ? "Signing out…" : "Log out"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
