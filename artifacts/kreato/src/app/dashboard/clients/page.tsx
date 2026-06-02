"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import DashboardNav from "../DashboardNav";

type RawTransaction = {
  client_name: string;
  client_email: string;
  amount: number;
  created_at: string;
};

type ClientRow = {
  client_name: string;
  client_email: string;
  totalPaid: number;
  numPayments: number;
  lastPaymentDate: string;
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

export default function ClientsPage() {
  const [firstName, setFirstName] = useState("");
  const [clients, setClients] = useState<ClientRow[]>([]);
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
        .select("client_name, client_email, amount, created_at")
        .eq("created_by", session.user.id)
        .order("created_at", { ascending: false });

      const txs = (data as RawTransaction[]) ?? [];

      // Group by client_email
      const map = new Map<string, ClientRow>();
      for (const tx of txs) {
        const existing = map.get(tx.client_email);
        if (existing) {
          existing.totalPaid += tx.amount;
          existing.numPayments += 1;
          if (tx.created_at > existing.lastPaymentDate) {
            existing.lastPaymentDate = tx.created_at;
          }
        } else {
          map.set(tx.client_email, {
            client_name: tx.client_name,
            client_email: tx.client_email,
            totalPaid: tx.amount,
            numPayments: 1,
            lastPaymentDate: tx.created_at,
          });
        }
      }

      // Sort by total paid descending
      const rows = Array.from(map.values()).sort((a, b) => b.totalPaid - a.totalPaid);
      setClients(rows);
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <DashboardNav firstName={firstName} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Clients</h1>
          <p className="text-sm text-gray-500 mt-1">{clients.length} unique client{clients.length !== 1 ? "s" : ""}</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {clients.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-500">No clients yet.</p>
              <p className="text-sm text-gray-400 mt-1">Share a payment link to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Client", "Email", "Total paid", "Payments", "Last payment"].map((h) => (
                      <th key={h} className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {clients.map((c) => (
                    <tr key={c.client_email} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {c.client_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {c.client_email}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">
                        {fmt(c.totalPaid)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {c.numPayments}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {fmtDate(c.lastPaymentDate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
