function CartItemSkeleton() {
  return (
    <div className="cart-item-row">
      <div className="skeleton cart-item-image rounded-md" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="skeleton h-4 w-2/3" />
        <div className="skeleton h-8 w-24 rounded-md" />
        <div className="skeleton h-3 w-20" />
      </div>
      <div className="skeleton h-5 w-16" />
      <div className="skeleton size-9 rounded-md" />
    </div>
  );
}

export default function CartLoading() {
  return (
    <main className="page-container">
      <div className="mb-8">
        <div className="skeleton mb-2 h-3 w-12" />
        <div className="skeleton h-9 w-40" />
      </div>

      <div className="cart-grid">
        <section>
          <div className="skeleton cart-section-title mb-5 h-7 w-24 rounded-none" />
          <div>
            {Array.from({ length: 3 }).map((_, index) => (
              <CartItemSkeleton key={index} />
            ))}
          </div>
        </section>

        <aside className="cart-summary space-y-3">
          <div className="skeleton mb-2 h-7 w-36" />
          <div className="skeleton h-5 w-full" />
          <div className="skeleton h-5 w-full" />
          <div className="skeleton mt-4 h-6 w-full" />
          <div className="skeleton mt-6 h-10 w-full rounded-md" />
        </aside>
      </div>
    </main>
  );
}
