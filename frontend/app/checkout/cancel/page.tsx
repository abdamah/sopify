import { XCircle } from "lucide-react";
import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <main className="page-container flex min-h-[60vh] flex-col items-center justify-center text-center">
      <XCircle className="mb-4 size-14 text-muted-foreground" aria-hidden="true" />
      <p className="section-label">Checkout</p>
      <h1 className="mb-2 text-2xl font-bold text-foreground">
        Payment cancelled
      </h1>
      <p className="mb-8 max-w-md text-sm leading-6 text-muted-foreground">
        Your payment was not completed. Your cart items are still saved.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/cart" className="primary-button">
          Back to cart
        </Link>
        <Link href="/products" className="secondary-button">
          Continue shopping
        </Link>
      </div>
    </main>
  );
}
