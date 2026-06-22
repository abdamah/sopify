"use client";

import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { CART_UPDATED_EVENT } from "@/lib/cart-events";

type CartLinkProps = {
  initialCount: number;
};

export function CartLink({ initialCount }: CartLinkProps) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    setCount(initialCount);
  }, [initialCount]);

  useEffect(() => {
    function handleCartUpdated(event: Event) {
      const customEvent = event as CustomEvent<{ count: number }>;
      setCount(customEvent.detail.count);
    }

    window.addEventListener(CART_UPDATED_EVENT, handleCartUpdated);
    return () => window.removeEventListener(CART_UPDATED_EVENT, handleCartUpdated);
  }, []);

  return (
    <Link href="/cart" className="icon-button relative" aria-label="Cart">
      <ShoppingCart className="size-5" aria-hidden="true" />
      {count > 0 ? (
        <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-primary text-[10px] font-bold leading-none text-primary-foreground">
          {count}
        </span>
      ) : null}
    </Link>
  );
}
