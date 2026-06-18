import {
  PackageCheck,
  RotateCcw,
  ShieldCheck,
  Truck,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import { getProducts } from "@/actions/products";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/types";

const services: {
  icon: LucideIcon;
  title: string;
  text: string;
}[] = [
  {
    icon: Truck,
    title: "Fast Delivery",
    text: "Quick shipping for your favorite products.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payment",
    text: "Simple and safe checkout experience.",
  },
  {
    icon: PackageCheck,
    title: "Quality Products",
    text: "Curated items built for everyday use.",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    text: "Shop confidently with simple returns.",
  },
];

export default async function Home() {
  let featuredProducts: Product[] = [];

  try {
    const products = await getProducts();
    featuredProducts = products.slice(0, 4);
  } catch {
    featuredProducts = [];
  }

  return (
    <main className="flex-1">
      <section className="hero-section">
        <div className="site-container hero-grid">
          <div>
            <span className="hero-badge">New collection is live</span>
            <h1 className="hero-title">
              Simple shopping for modern everyday products.
            </h1>
            <p className="hero-copy">
              Browse curated products, view details, and build your cart with a
              clean storefront powered by your Go backend.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/products" className="primary-button">
                Shop now
              </Link>
              <Link href="/products" className="secondary-button">
                View products
              </Link>
            </div>
          </div>

          <div className="hero-art">
            <div className="text-center">
              <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-2xl bg-accent text-3xl font-bold text-primary">
                S
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                Sopify storefront
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="site-section services-section">
        <div className="site-container">
          <div className="section-head-row">
            <div>
              <p className="section-label">Services</p>
              <h2 className="section-title">Built for easy shopping</h2>
              <p className="section-subtitle">
                A clean customer experience from product discovery to checkout.
              </p>
            </div>
          </div>

          <div className="services-grid">
            {services.map((service) => (
              <article key={service.title} className="service-card">
                <div className="service-icon">
                  <service.icon className="size-5" aria-hidden="true" />
                </div>
                <h3 className="mb-1.5 text-sm font-semibold">
                  {service.title}
                </h3>
                <p className="text-[13px] leading-6 text-muted-foreground">
                  {service.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="site-section">
        <div className="site-container">
          <div className="browse-banner">
            <div>
              <h2 className="mb-1.5 text-2xl font-bold">Browse all products</h2>
              <p className="text-sm text-white/80">
                Explore everything available in your Sopify catalog.
              </p>
            </div>
            <Link href="/products" className="white-button">
              View all
            </Link>
          </div>
        </div>
      </section>

      <section className="site-section pt-0">
        <div className="site-container">
          <div className="section-head-row">
            <div>
              <p className="section-label">Featured</p>
              <h2 className="section-title">Featured products</h2>
              <p className="section-subtitle">
                A small preview from your product API.
              </p>
            </div>
            <Link href="/products" className="secondary-button">
              View all products
            </Link>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="product-grid">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                No featured products yet
              </h3>
              <p>Start the backend and seed products to show this section.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
