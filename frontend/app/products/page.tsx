import { getProducts } from "@/actions/products";
import { ProductCard } from "@/components/product-card";

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <main className="flex-1">
      <section className="shop-hero">
        <div className="site-container">
          <h1 className="mb-1.5 text-3xl font-bold tracking-tight">Shop</h1>
          <p className="text-[15px] text-muted-foreground">
            Browse all products available in your Sopify store.
          </p>
        </div>
      </section>

      <section className="page-container">
        <div className="shop-controls">
          <p className="text-sm text-muted-foreground">
            Showing <strong className="text-foreground">{products?.length ?? 0}</strong>{" "}
            products
          </p>
          <input
            className="w-full rounded-full border border-border bg-muted px-4 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:bg-background sm:w-64"
            placeholder="Search products"
          />
        </div>

        {products.length === 0 ? (
          <div className="empty-state">
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              No products yet
            </h3>
            <p>Seed products from the backend to show them here.</p>
          </div>
        ) : (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
