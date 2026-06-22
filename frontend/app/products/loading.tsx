function ProductCardSkeleton() {
  return (
    <div className="product-card overflow-hidden">
      <div className="skeleton aspect-square w-full rounded-none" />
      <div className="flex flex-col gap-3 p-4">
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-5 w-1/3" />
        <div className="skeleton h-9 w-full rounded-md" />
      </div>
    </div>
  );
}

export default function ProductsLoading() {
  return (
    <main className="flex-1">
      <section className="shop-hero">
        <div className="site-container">
          <div className="skeleton mb-2 h-9 w-32" />
          <div className="skeleton h-5 w-80 max-w-full" />
        </div>
      </section>

      <section className="page-container">
        <div className="shop-controls">
          <div className="skeleton h-5 w-40" />
          <div className="skeleton h-9 w-full rounded-full sm:w-64" />
        </div>

        <div className="product-grid">
          {Array.from({ length: 8 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      </section>
    </main>
  );
}
