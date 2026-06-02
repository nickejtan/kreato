"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import DashboardNav from "../DashboardNav";

type PaymentLink = {
  id: string;
  client_name: string;
  project_name: string;
  amount: number;
  status: string;
  due_date: string;
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

function getStatus(pl: PaymentLink): { label: string; style: string } {
  if (pl.status === "paid") {
    return { label: "Paid", style: "bg-green-50 text-green-700 border-green-200" };
  }
  const today = new Date().toISOString().split("T")[0];
  if (pl.due_date < today) {
    return { label: "Overdue", style: "bg-red-50 text-red-700 border-red-200" };
  }
  return { label: "Pending", style: "bg-yellow-50 text-yellow-700 border-yellow-200" };
}

export default function InvoicesPage() {
  const [firstName, setFirstName] = useState("");
  const [invoices, setInvoices] = useState<PaymentLink[]>([]);
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
        .from("payment_links")
        .select("id, client_name, project_name, amount, status, due_date, created_at")
        .eq("created_by", session.user.id)
        .order("created_at", { ascending: false });

      setInvoices((data as PaymentLink[]) ?? []);
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
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Invoices</h1>
          <p className="text-sm text-gray-500 mt-1">All payment links you&apos;ve created</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {invoices.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-500">No invoices yet.</p>
              <p className="text-sm text-gray-400 mt-1">Create your first payment link to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Date created", "Client", "Project", "Amount", "Status", "Action"].map((h) => (
                      <th key={h} className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {invoices.map((inv) => {
                    const { label, style } = getStatus(inv);
                    return (
                      <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                          {fmtDate(inv.created_at)}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                          {inv.client_name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {inv.project_name}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">
                          {fmt(inv.amount)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}>
                            {label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <a
                            href={`https://getkreato.com/pay/${inv.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-violet-600 font-medium hover:text-violet-800 transition-colors"
                          >
                            View link ↗
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
