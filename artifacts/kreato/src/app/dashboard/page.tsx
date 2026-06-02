"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import CreatePaymentLinkModal from "./CreatePaymentLinkModal";

type Transaction = {
  id: string;
  client_name: string;
  project_name: string;
  client_email: string;
  amount: number;
  created_at: string;
};

type PaymentLink = {
  id: string;
  amount: number;
  status: string;
  due_date: string;
  is_recurring: boolean;
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
  const [userId, setUserId] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

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
      setUserId(session.user.id);

      // Load transactions and payment_links in parallel
      const [{ data: txData }, { data: plData }] = await Promise.all([
        supabase
          .from("transactions")
          .select("id, client_name, client_email, project_name, amount, created_at")
          .eq("created_by", session.user.id)
          .order("created_at", { ascending: false })
          .limit(200),
        supabase
          .from("payment_links")
          .select("id, amount, status, due_date, is_recurring")
          .eq("created_by", session.user.id),
      ]);

      setTransactions((txData as Transaction[]) ?? []);
      setPaymentLinks((plData as PaymentLink[]) ?? []);
      setLoading(false);
    }

    load();
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  // ── Computed stats ──
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const totalCollected = transactions.reduce((s, t) => s + t.amount, 0);

  const paidThisMonth = transactions
    .filter((t) => {
      const d = new Date(t.created_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((s, t) => s + t.amount, 0);

  const mrr = paymentLinks
    .filter((pl) => pl.is_recurring && pl.status === "paid")
    .reduce((s, pl) => s + pl.amount, 0);

  const outstandingLinks = paymentLinks.filter(
    (pl) => pl.status === "pending" && pl.due_date >= todayStr
  );
  const outstandingCount = outstandingLinks.length;
  const outstandingValue = outstandingLinks.reduce((s, pl) => s + pl.amount, 0);

  const overdueLinks = paymentLinks.filter(
    (pl) => pl.status === "pending" && pl.due_date < todayStr
  );
  const overdueCount = overdueLinks.length;
  const overdueValue = overdueLinks.reduce((s, pl) => s + pl.amount, 0);

  const activeClients = new Set(
    transactions
      .filter((t) => new Date(t.created_at) >= thirtyDaysAgo)
      .map((t) => t.client_email)
  ).size;

  // Recent activity — latest 20 transactions
  const recentActivity = transactions.slice(0, 20);

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
          <Link href="/dashboard" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <span className="font-bold text-gray-900 text-lg tracking-tight">Kreato</span>
          </Link>

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

        {/* Stats grid — 3 × 2 */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Total collected</p>
            <p className="text-2xl font-bold text-gray-900 tracking-tight">{fmt(totalCollected)}</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Paid this month</p>
            <p className="text-2xl font-bold text-gray-900 tracking-tight">{fmt(paidThisMonth)}</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">MRR</p>
            <p className="text-2xl font-bold text-gray-900 tracking-tight">{fmt(mrr)}</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Outstanding invoices</p>
            <p className="text-2xl font-bold text-gray-900 tracking-tight">{outstandingCount}</p>
            {outstandingCount > 0 && (
              <p className="text-sm text-gray-400 mt-1">{fmt(outstandingValue)}</p>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6">
            <p className="text-xs font-medium text-red-400 uppercase tracking-wide mb-2">Overdue invoices</p>
            <p className="text-2xl font-bold text-red-600 tracking-tight">{overdueCount}</p>
            {overdueCount > 0 && (
              <p className="text-sm text-red-400 mt-1">{fmt(overdueValue)}</p>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Active clients</p>
            <p className="text-2xl font-bold text-gray-900 tracking-tight">{activeClients}</p>
            <p className="text-sm text-gray-400 mt-1">last 30 days</p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => setShowPaymentModal(true)}
            className="flex items-center justify-center gap-2.5 px-6 py-5 rounded-2xl bg-violet-600 text-white font-semibold text-base hover:bg-violet-700 transition-colors shadow-lg shadow-violet-100"
          >
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
            {recentActivity.length === 0 ? (
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
                      {["Date", "Client", "Project", "Amount", "Status"].map((h) => (
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
                    {recentActivity.map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                          {fmtDate(tx.created_at)}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                          {tx.client_name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {tx.project_name}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">
                          {fmt(tx.amount)}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-green-50 text-green-700 border-green-200">
                            Paid
                          </span>
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

      <CreatePaymentLinkModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        userId={userId}
      />
    </div>
  );
}
