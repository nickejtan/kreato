"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Order = {
  id: string;
  buyer_name: string;
  amount: number;
  status: "pending" | "paid" | "failed" | "cancelled";
  created_at: string;
};

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-green-50 text-green-700 border-green-200",
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  failed: "bg-red-50 text-red-700 border-red-200",
  cancelled: "bg-gray-50 text-gray-500 border-gray-200",
};

const STATUS_LABEL: Record<string, string> = {
  paid: "Paid",
  pending: "Pending",
  failed: "Failed",
  cancelled: "Cancelled",
};

function fmt(amount: number) {
  return `RM ${amount.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function DashboardPage() {
  const [firstName, setFirstName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();

      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        window.location.href = "/login";
        return;
      }

      // Check Stripe onboarding
      const { data: creator } = await supabase
        .from("creators")
        .select("stripe_account_id, full_name")
        .eq("id", session.user.id)
        .single();

      if (!creator?.stripe_account_id) {
        window.location.href = "/stripe/onboarding";
        return;
      }

      // Resolve name and business name
      const meta = session.user.user_metadata ?? {};
      const fullName: string = meta.full_name ?? creator.full_name ?? "";
      setFirstName(fullName.split(" ")[0] || fullName);
      setBusinessName(meta.business_name ?? "");

      // Load recent orders
      const { data: orderData } = await supabase
        .from("orders")
        .select("id, buyer_name, amount, status, created_at")
        .eq("creator_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      setOrders((orderData as Order[]) ?? []);
      setLoading(false);
    }

    load();
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  // Computed stats
  const totalCollected = orders
    .filter((o) => o.status === "paid")
    .reduce((s, o) => s + o.amount, 0);

  const outstanding = orders.filter((o) => o.status === "pending").length;

  const now = new Date();
  const paidThisMonth = orders
    .filter((o) => {
      const d = new Date(o.created_at);
      return (
        o.status === "paid" &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    })
    .reduce((s, o) => s + o.amount, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ── Top Nav ── */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <span className="font-bold text-gray-900 text-lg tracking-tight">Kreato</span>
          </Link>

          {/* Center nav */}
          <div className="hidden sm:flex items-center gap-1">
            {[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Invoices", href: "/dashboard/invoices" },
              { label: "Clients", href: "/dashboard/clients" },
              { label: "Payouts", href: "/dashboard/payouts" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="px-3.5 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-sm font-medium text-gray-700 hidden sm:block">{firstName}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors"
            >
              Log out
            </button>
          </div>
        </div>
      </nav>

      {/* ── Main content ── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10 space-y-10">

        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Welcome back, {firstName} 👋
          </h1>
          {businessName && (
            <p className="text-sm text-gray-500 mt-1">{businessName}</p>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total collected", value: fmt(totalCollected) },
            { label: "Outstanding invoices", value: String(outstanding) },
            { label: "Paid this month", value: fmt(paidThisMonth) },
            { label: "Pending payouts", value: fmt(0) },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
            >
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                {stat.label}
              </p>
              <p className="text-2xl font-bold text-gray-900 tracking-tight">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button className="flex items-center justify-center gap-2.5 px-6 py-5 rounded-2xl bg-violet-600 text-white font-semibold text-base hover:bg-violet-700 transition-colors shadow-lg shadow-violet-100">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create payment link
          </button>
          <button className="flex items-center justify-center gap-2.5 px-6 py-5 rounded-2xl bg-white text-violet-600 font-semibold text-base border-2 border-violet-200 hover:border-violet-400 hover:bg-violet-50 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Create invoice
          </button>
        </div>

        {/* Recent activity */}
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-4">Recent activity</h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {orders.length === 0 ? (
              <div className="py-20 text-center">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-500">No transactions yet.</p>
                <p className="text-sm text-gray-400 mt-1">
                  Create your first payment link to get started.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {["Date", "Client", "Amount", "Status", "Action"].map((h) => (
                        <th
                          key={h}
                          className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                          {fmtDate(order.created_at)}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {order.buyer_name}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">
                          {fmt(order.amount)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLES[order.status] ?? STATUS_STYLES.pending}`}
                          >
                            {STATUS_LABEL[order.status] ?? order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-xs text-violet-600 font-medium hover:text-violet-800 transition-colors">
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
