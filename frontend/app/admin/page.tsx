import { getProducts } from "@/actions/products";
import { AdminProductsPanel } from "@/components/admin-products-panel";

export default async function AdminPage() {
  const products = await getProducts();

  return (
    <main className="site-container admin-wrap">
      <AdminProductsPanel initialProducts={products} />
    </main>
  );
}
