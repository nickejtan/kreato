import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import PayNowButton from "./PayNowButton";

export const dynamic = "force-dynamic";

function fmt(amount: number) {
  return `RM ${amount.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-MY", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function fmtCycle(cycle: string) {
  const map: Record<string, string> = {
    monthly: "Monthly retainer",
    weekly: "Weekly retainer",
    quarterly: "Quarterly retainer",
  };
  return map[cycle] ?? cycle;
}

export default async function PaymentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: link } = await supabase
    .from("payment_links")
    .select("*")
    .eq("id", id)
    .single();

  if (!link) notFound();

  const { data: creator } = await supabase
    .from("creators")
    .select("full_name")
    .eq("id", link.created_by)
    .single();

  const chargeAmount =
    link.deposit_percentage
      ? link.amount * link.deposit_percentage / 100
      : link.amount;

  const platformFee = Math.round(chargeAmount * 100 * 0.05) / 100 + 1;
  const totalCharge = chargeAmount; // fee is deducted from the platform, client pays chargeAmount

  const isPaid = link.status === "paid";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">

      {/* Logo */}
      <div className="mb-8 flex items-center gap-2">
        <div className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center">
          <span className="text-white font-bold text-base">K</span>
        </div>
        <span className="font-bold text-gray-900 text-xl tracking-tight">Kreato</span>
      </div>

      {/* Payment card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">

        {/* Header band */}
        <div className="bg-violet-600 px-6 py-5">
          <p className="text-violet-200 text-xs font-medium uppercase tracking-widest mb-1">
            Payment request
          </p>
          <p className="text-white font-bold text-xl leading-tight">{link.project_name}</p>
          {creator?.full_name && (
            <p className="text-violet-300 text-sm mt-1">from {creator.full_name}</p>
          )}
        </div>

        {/* Details */}
        <div className="px-6 py-6 space-y-4">

          {/* Amount */}
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-sm text-gray-500">
              {link.deposit_percentage ? "Deposit amount" : "Total amount"}
            </span>
            <span className="text-2xl font-bold text-gray-900">{fmt(chargeAmount)}</span>
          </div>

          {/* If deposit: show full amount context */}
          {link.deposit_percentage && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2">
              <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-xs font-semibold text-amber-800">Deposit required upfront</p>
                <p className="text-xs text-amber-600 mt-0.5">
                  {link.deposit_percentage}% of total ({fmt(link.amount)}) due now.
                  Remaining {fmt(link.amount - chargeAmount)} payable later.
                </p>
              </div>
            </div>
          )}

          {/* If recurring */}
          {link.is_recurring && link.billing_cycle && (
            <div className="flex items-center gap-2 text-sm text-violet-700 bg-violet-50 rounded-xl px-4 py-2.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="font-medium">{fmtCycle(link.billing_cycle)}</span>
            </div>
          )}

          {/* Row details */}
          <div className="space-y-2.5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Due date</span>
              <span className="font-medium text-gray-800">{fmtDate(link.due_date)}</span>
            </div>
            {link.description && (
              <div className="flex justify-between text-sm items-start gap-4">
                <span className="text-gray-500 flex-shrink-0">Description</span>
                <span className="font-medium text-gray-800 text-right">{link.description}</span>
              </div>
            )}
          </div>

          {/* Platform fee note */}
          <p className="text-xs text-gray-400 text-center pt-1">
            A processing fee of {fmt(platformFee)} is included. Payments are secured by Stripe.
          </p>
        </div>

        {/* CTA */}
        <div className="px-6 pb-6">
          {isPaid ? (
            <div className="w-full flex items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-green-50 border border-green-200 text-green-700 font-semibold">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Payment received
            </div>
          ) : (
            <PayNowButton paymentLinkId={id} amount={totalCharge} />
          )}
        </div>
      </div>

      <p className="mt-6 text-xs text-gray-400">
        Powered by <span className="font-semibold text-gray-500">Kreato</span> · Secured by Stripe
      </p>
    </div>
  );
}
