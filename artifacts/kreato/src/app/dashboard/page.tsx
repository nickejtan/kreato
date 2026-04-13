"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import DashboardNav from "@/components/DashboardNav";

type Creator = {
  full_name: string;
  handle: string;
  country: string;
  product_type: string;
};

type Product = {
  id: string;
  name: string;
  product_type: string;
  price: number;
  billing_type: "one_time" | "monthly";
  active: boolean;
  created_at: string;
};

const BILLING_LABEL: Record<string, string> = {
  one_time: "One-time",
  monthly: "Monthly",
};

const TYPE_ICON: Record<string, string> = {
  "Paid Community": "💬",
  "Online Course": "🎓",
  "Digital Downloads": "📦",
  Coaching: "🎯",
};

export default function DashboardPage() {
  const [creator, setCreator] = useState<Creator | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orderCount, setOrderCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        window.location.href = "/login";
        return;
      }

      const [
        { data: creatorData },
        { data: productData },
        { count: orders },
      ] = await Promise.all([
        supabase
          .from("creators")
          .select("full_name, handle, country, product_type")
          .eq("id", session.user.id)
          .single(),
        supabase
          .from("products")
          .select("id, name, product_type, price, billing_type, active, created_at")
          .eq("creator_id", session.user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("orders")
          .select("id", { count: "exact", head: true })
          .eq("creator_id", session.user.id),
      ]);

      if (!creatorData) {
        window.location.href = "/onboarding";
        return;
      }

      setCreator(creatorData);
      setProducts(productData ?? []);
      setOrderCount(orders ?? 0);
      setLoading(false);
    }

    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  if (!creator) return null;

  const statCards = [
    { label: "Total Revenue", value: "$0.00", sub: "No payouts yet" },
    {
      label: "Active Members",
      value: String(orderCount),
      sub: orderCount === 0 ? "No orders yet" : orderCount === 1 ? "1 order" : `${orderCount} orders`,
    },
    {
      label: "Products",
      value: String(products.length),
      sub:
        products.length === 0
          ? "Create your first"
          : products.length === 1
          ? "1 active product"
          : `${products.length} products`,
    },
    { label: "Payouts", value: "0", sub: "Pending: $0.00" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav handle={creator.handle} creatorName={creator.full_name} />

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Header row */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {creator.full_name}
            </h1>
            <p className="text-gray-400 mt-1 text-sm">
              {creator.product_type} · {creator.country}
            </p>
          </div>
          <Link
            href="/dashboard/products/new"
            className="btn-primary text-sm px-4 py-2"
          >
            + New product
          </Link>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <div key={stat.label} className="card p-6">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                {stat.label}
              </p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-400 mt-1.5">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Products section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">
              Your products
            </h2>
            {products.length > 0 && (
              <Link
                href="/dashboard/products/new"
                className="text-sm text-violet-600 hover:text-violet-700 font-medium"
              >
                + Add product
              </Link>
            )}
          </div>

          {products.length === 0 ? (
            /* Empty state */
            <div className="card p-12 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center mb-5">
                <svg
                  className="w-7 h-7 text-violet-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <h2 className="text-base font-semibold text-gray-900 mb-2">
                Ready to earn
              </h2>
              <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
                Your creator page is set up. Start building your first product
                to see revenue here.
              </p>
              <Link
                href="/dashboard/products/new"
                className="btn-primary mt-6 text-sm"
              >
                Create your first product
              </Link>
            </div>
          ) : (
            /* Products list */
            <div className="space-y-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="card p-5 flex items-center gap-4"
                >
                  {/* Icon */}
                  <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                    {TYPE_ICON[product.product_type] ?? "📦"}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {product.product_type} ·{" "}
                      {BILLING_LABEL[product.billing_type]}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-gray-900 text-sm">
                      ${Number(product.price).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {product.billing_type === "monthly" ? "/mo" : "once"}
                    </p>
                  </div>

                  {/* Status badge */}
                  <span
                    className={`flex-shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${
                      product.active
                        ? "bg-green-50 text-green-600"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {product.active ? "Active" : "Inactive"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
