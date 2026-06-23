import { getProducts } from "@/actions/products";
import { ProductsList } from "@/components/products-list";

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
        <ProductsList products={products} />
      </section>
    </main>
  );
}
