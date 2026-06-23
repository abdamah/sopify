import { getCategories } from "@/actions/categories";
import { getProducts } from "@/actions/products";
import { ProductsList } from "@/components/products-list";

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <main className="flex-1">
      <section className="shop-hero">
        <div className="site-container">
          <h1 className="mb-1.5 text-3xl font-bold tracking-tight">
            Shop All Products
          </h1>
        </div>
      </section>

      <section className="page-container">
        <ProductsList products={products} categories={categories} />
      </section>
    </main>
  );
}
