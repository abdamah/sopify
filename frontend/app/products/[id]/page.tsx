import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getProductById } from "@/actions/products";
import { AddToCartForm } from "@/components/add-to-cart-form";
import { getProductImageUrl } from "@/lib/utils";

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <main className="page-container-sm">
      <div className="detail-grid">
        <Image
          src={getProductImageUrl(product.image_url)}
          alt={product.name}
          width={600}
          height={600}
          className="product-image-lg"
          priority
          unoptimized
        />

        <div className="pt-2">
          <div className="breadcrumb">
            <Link href="/products" className="text-muted-foreground hover:text-primary">
              Shop
            </Link>
            <span>/</span>
            <span>{product.name}</span>
          </div>

          <h1 className="detail-title">{product.name}</h1>
          <p className="detail-price">{formatPrice(product.price)}</p>
          <p className="detail-desc">{product.description}</p>

          <p className="detail-stock">
            {product.stock > 0
              ? `Available: ${product.stock} in stock`
              : "Currently out of stock"}
          </p>

          <div className="flex flex-wrap gap-3">
            <AddToCartForm productId={product.id} stock={product.stock} />
            <Link href="/products" className="secondary-button">
              Back to shop
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
