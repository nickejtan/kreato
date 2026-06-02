"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import DashboardNav from "../DashboardNav";

type Transaction = {
  id: string;
  project_name: string;
  amount: number;
  fee: number;
  net: number;
  created_at: string;
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

export default function PayoutsPage() {
  const [firstName, setFirstName] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { window.location.href = "/login"; return; }

      const { data: creator } = await supabase
        .from("creators")
        .select("stripe_account_id, full_name")
        .eq("id", session.user.id)
        .single();

      if (!creator?.stripe_account_id) { window.location.href = "/stripe/onboarding"; return; }

      const meta = session.user.user_metadata ?? {};
      const fullName: string = meta.full_name ?? creator.full_name ?? "";
      setFirstName(fullName.split(" ")[0] || fullName);

      const { data } = await supabase
        .from("transactions")
        .select("id, project_name, amount, fee, net, created_at")
        .eq("created_by", session.user.id)
        .order("created_at", { ascending: false });

      setTransactions((data as Transaction[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalEarned = transactions.reduce((s, t) => s + t.amount, 0);
  const totalFees = transactions.reduce((s, t) => s + t.fee, 0);
  const netReceived = transactions.reduce((s, t) => s + t.net, 0);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <DashboardNav firstName={firstName} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Payouts</h1>
          <p className="text-sm text-gray-500 mt-1">Your earnings summary</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Total earned</p>
            <p className="text-2xl font-bold text-gray-900 tracking-tight">{fmt(totalEarned)}</p>
            <p className="text-xs text-gray-400 mt-1">Gross, all time</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Kreato fees</p>
            <p className="text-2xl font-bold text-gray-900 tracking-tight">{fmt(totalFees)}</p>
            <p className="text-xs text-gray-400 mt-1">5% + RM 1.00 per payment</p>
          </div>
          <div className="bg-white rounded-2xl border border-violet-100 shadow-sm p-6">
            <p className="text-xs font-medium text-violet-400 uppercase tracking-wide mb-2">Net received</p>
            <p className="text-2xl font-bold text-violet-700 tracking-tight">{fmt(netReceived)}</p>
            <p className="text-xs text-gray-400 mt-1">After fees, all time</p>
          </div>
        </div>

        {/* Transactions table */}
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-4">All transactions</h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {transactions.length === 0 ? (
              <div className="py-20 text-center">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-500">No payouts yet.</p>
                <p className="text-sm text-gray-400 mt-1">Payments will appear here once clients pay.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {["Date", "Project", "Gross", "Kreato fee", "Net", "Status"].map((h) => (
                        <th key={h} className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                          {fmtDate(tx.created_at)}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {tx.project_name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                          {fmt(tx.amount)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                          −{fmt(tx.fee)}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-violet-700 whitespace-nowrap">
                          {fmt(tx.net)}
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
    </div>
  );
}
