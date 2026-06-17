import Link from "next/link";

export default function Home() {
  return (
    <div className="page-center">
      <h1 className="page-title">Welcome to Sopify</h1>
      <Link href="/products" className="primary-button">
        Browse products
      </Link>
    </div>
  );
}
