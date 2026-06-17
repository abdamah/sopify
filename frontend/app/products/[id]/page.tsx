import Image from "next/image";
import { notFound } from "next/navigation";

import { getProductById } from "@/actions/products";
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
      <div className="grid gap-8 md:grid-cols-2">
        <Image
          src={getProductImageUrl(product.image_url)}
          alt={product.name}
          width={600}
          height={600}
          className="product-image-lg"
          priority
        />

        <div className="flex flex-col gap-4">
          <h1 className="page-title">{product.name}</h1>
          <p className="price-xl">{formatPrice(product.price)}</p>
          <p className="muted-text">{product.description}</p>
          <p className="text-sm muted-text">
            {product.stock > 0
              ? `${product.stock} in stock`
              : "Out of stock"}
          </p>
        </div>
      </div>
    </main>
  );
}
