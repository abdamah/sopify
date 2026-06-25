import Image from "next/image";
import Link from "next/link";

import type { Product } from "@/lib/types";
import { formatPrice, getProductImageUrl } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const isInStock = product.stock > 0;

  return (
    <Link href={`/products/${product.id}`} className="group block h-full">
      <article className="product-card">
        <div className="relative overflow-hidden">
          <Image
            src={getProductImageUrl(product.image_url)}
            alt={product.name}
            width={400}
            height={400}
            className="product-card-image"
            unoptimized
          />
        </div>

        <div className="product-card-body">
          <div className="mb-1 flex items-start justify-between gap-2">
            <p className="text-[10px] font-mono font-medium uppercase tracking-[0.2em] text-primary">
              {product.category.name}
            </p>
            <span
              className={isInStock ? "stock-badge" : "stock-badge-empty"}
            >
              {isInStock ? "In stock" : "Out"}
            </span>
          </div>
          <h2 className="product-card-title">{product.name}</h2>
          <p className="mb-3 text-base font-bold text-primary">
            {formatPrice(product.price)}
          </p>

          <p className="primary-button w-full py-2 text-[13px]">View product</p>
        </div>
      </article>
    </Link>
  );
}
