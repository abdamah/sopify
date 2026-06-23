import { getCategories } from "@/actions/categories";
import { getProducts } from "@/actions/products";
import { AdminProductsPanel } from "@/components/admin-products-panel";

export default async function AdminPage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <main className="site-container admin-wrap">
      <AdminProductsPanel
        initialProducts={products}
        categories={categories}
      />
    </main>
  );
}
