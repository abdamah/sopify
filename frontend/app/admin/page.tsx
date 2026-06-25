import { getCategories } from "@/actions/categories";
import { getProducts } from "@/actions/products";
import { AdminProductsPanel } from "@/components/admin-products-panel";

export default async function AdminPage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <AdminProductsPanel
      initialProducts={products}
      categories={categories}
    />
  );
}
