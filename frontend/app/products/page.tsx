import { getProducts } from "@/actions/products";
import { ProductCard } from "@/components/product-card";

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <main className="page-container">
      <h1 className="page-title mb-8">Products</h1>

      {products.length === 0 ? (
        <p className="muted-text">No products yet.</p>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}
