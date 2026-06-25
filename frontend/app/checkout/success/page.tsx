import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

type CheckoutSuccessPageProps = {
  searchParams: Promise<{ session_id?: string }>;
};

export default async function CheckoutSuccessPage({
  searchParams,
}: CheckoutSuccessPageProps) {
  const { session_id: sessionId } = await searchParams;

  return (
    <main className="page-container flex min-h-[60vh] flex-col items-center justify-center text-center">
      <CheckCircle2
        className="mb-4 size-14 text-primary"
        aria-hidden="true"
      />
      <p className="section-label">Checkout</p>
      <h1 className="mb-2 text-2xl font-bold text-foreground">
        Payment successful
      </h1>
      <p className="mb-8 max-w-md text-sm leading-6 text-muted-foreground">
        Thank you for your order. You will receive a confirmation once payment is
        processed.
      </p>
      {sessionId ? (
        <p className="mb-8 max-w-md break-all text-xs text-muted-foreground">
          Reference: {sessionId}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/products" className="primary-button">
          Continue shopping
        </Link>
        <Link href="/cart" className="secondary-button">
          View cart
        </Link>
      </div>
    </main>
  );
}
