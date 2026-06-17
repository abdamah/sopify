import Image from "next/image";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import type { Product } from "@/lib/types";
import { getProductImageUrl } from "@/lib/utils";

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

export function ProductCard({ product }: { product: Product }) {
  const isInStock = product.stock > 0;

  return (
    <Link href={`/products/${product.id}`} className="group block h-full">
      <Card className="product-card">
        <div className="overflow-hidden">
          <Image
            src={getProductImageUrl(product.image_url)}
            alt={product.name}
            width={400}
            height={400}
            className="product-card-image"
          />
        </div>

        <CardContent className="product-card-body">
          <div className="flex items-start justify-between gap-3">
            <h2 className="product-card-title">{product.name}</h2>
            <p className="price-lg shrink-0">{formatPrice(product.price)}</p>
          </div>

          <div className="mt-auto">
            <span className={isInStock ? "stock-badge" : "stock-badge-empty"}>
              {isInStock ? `${product.stock} in stock` : "Out of stock"}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
